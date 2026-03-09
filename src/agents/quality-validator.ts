// ============================================================================
// src/agents/quality-validator.ts — Agent 6 (Refonte profonde)
// ============================================================================
// Rôle : Audit technique + UX + domaine + compliance
// Retourne ValidationScoreExtended + issues + suggestions
// Peut ordonner auto-correction si showstoppers détectés

import { GoogleGenerativeAI } from '@google/generative-ai'
import { OPRIMUSMODEL } from '@/config/agents.config'
import { getAgentConfig } from '@/config/agents.config'
import { getSystemPrompt } from '@/types/agent'
import type { AgentInput, AgentOutput } from '@/types/agent'
import type { ValidationScoreExtended } from '@/types/domain'

export async function runQualityValidator(input: AgentInput): Promise<AgentOutput> {
  const config = getAgentConfig('quality-validator')
  const startTime = Date.now()
  const client = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

  if (!input.contentBlueprint || !input.designSpec || !input.domainProfile) {
    throw new Error('QualityValidator requires all previous agent outputs')
  }

  try {
    const model = client.getGenerativeModel({ model: OPRIMUSMODEL })

    const userPrompt = buildValidatorPrompt(input)

    const response = await model.generateContent({
      contents: [
        {
          role: 'user',
          parts: [{ text: userPrompt }],
        },
      ],
      systemInstruction: getSystemPrompt('quality-validator'),
      generationConfig: {
        temperature: config.temperature, // 0 = déterministe
        maxOutputTokens: config.maxOutputTokens,
        responseMimeType: 'application/json',
      },
      // Thinking minimal pour validator (pure logique)
      // @ts-ignore
      thinking: config.thinkingBudget > 0 ? {
        budget_tokens: config.thinkingBudget,
      } : undefined,
    })

    const responseText = response.content.parts[0]?.text || ''
    const parsed = JSON.parse(responseText)

    // Extraire et normaliser
    const score: ValidationScoreExtended = {
      accessibility: parsed.accessibility || 0,
      performance: parsed.performance || 'C',
      lintErrors: parsed.lintErrors || 0,
      designScore: parsed.designScore || 0,
      animationScore: parsed.animationScore || 0,
      responsiveness: parsed.responsiveness || 0,
      domainAlignment: parsed.domainAlignment || 0,
      proofPointCoverage: parsed.proofPointCoverage || 0,
      complianceCheck: parsed.complianceCheck || false,
      awwwardsReadiness:
        parsed.awwwardsReadiness || calculateAwwwardsReadiness(parsed),
      estimatedValue: calculateEstimatedValue(parsed),
      issues: parsed.issues || [],
      suggestions: parsed.suggestions || [],
      metadata: {
        generatedAt: new Date().toISOString(),
        iterationCount: 0,
        passedAutoCorrection: false,
      },
    }

    const durationMs = Date.now() - startTime

    return {
      jobId: input.jobId,
      agentId: 'quality-validator',
      stepNumber: input.stepNumber,
      payload: { validationScore: score },
      success: true,
      tokensIn: response.usageMetadata?.promptTokens || 0,
      tokensOut: response.usageMetadata?.candidatesTokens || 0,
      durationMs,
      trace: {
        jobId: input.jobId,
        stepNumber: input.stepNumber,
        agentName: 'quality-validator',
        startedAt: new Date().toISOString(),
        completedAt: new Date().toISOString(),
        durationMs,
        inputHash: hashInput(input),
        inputSummary: `Design: ${score.designScore}, Domain Align: ${score.domainAlignment}, Awwwards: ${score.awwwardsReadiness}`,
        outputSizeBytes: JSON.stringify(score).length,
        outputHash: hashOutput(score),
        modelUsed: OPRIMUSMODEL,
        tokensIn: response.usageMetadata?.promptTokens || 0,
        tokensOut: response.usageMetadata?.candidatesTokens || 0,
        logs: [
          {
            level: 'info',
            message: `Validation: ${score.issues.filter((i) => i.severity === 'error').length} errors, ${score.issues.filter((i) => i.severity === 'warning').length} warnings`,
            timestamp: new Date().toISOString(),
          },
        ],
        success: true,
        retryCount: 0,
      },
    }
  } catch (error) {
    const durationMs = Date.now() - startTime
    const errorMessage = error instanceof Error ? error.message : String(error)

    return {
      jobId: input.jobId,
      agentId: 'quality-validator',
      stepNumber: input.stepNumber,
      payload: {
        validationScore: {
          accessibility: 50,
          performance: 'C',
          lintErrors: 0,
          awwwardsReadiness: 'not-ready',
          issues: [{ severity: 'error', category: 'technical', message: errorMessage }],
        },
      },
      success: false,
      error: {
        message: errorMessage,
        code: 'VALIDATOR_ERROR',
        recoverable: true,
      },
      tokensIn: 0,
      tokensOut: 0,
      durationMs,
      trace: {
        jobId: input.jobId,
        stepNumber: input.stepNumber,
        agentName: 'quality-validator',
        startedAt: new Date().toISOString(),
        completedAt: new Date().toISOString(),
        durationMs,
        inputHash: hashInput(input),
        inputSummary: 'Validation failed',
        outputSizeBytes: 0,
        outputHash: '',
        modelUsed: OPRIMUSMODEL,
        tokensIn: 0,
        tokensOut: 0,
        logs: [{ level: 'error', message: errorMessage, timestamp: new Date().toISOString() }],
        success: false,
        errorMessage,
        retryCount: 0,
      },
    }
  }
}

function buildValidatorPrompt(input: AgentInput): string {
  return `Validate generation against technical + UX + domain criteria.

GENERATED CONTENT:
- Design Score needed: 1–100 (visual coherence)
- Animation Score: 1–100 (smoothness, purposefulness)
- Accessibility: 1–100 (WCAG AA compliance)
- Performance: A/B/C/D (Lighthouse rating)
- Domain Alignment: 1–100 (respects domain soul)
- Proof Point Coverage: 1–100 (has required social proof)

DOMAIN REQUIREMENTS:
- Industry: ${input.domainProfile?.industry}
- Tone: ${input.domainProfile?.brandTone}
- Forbidden jargon: ${input.domainProfile?.forbiddenJargon.join(', ')}
- Required keywords: ${input.domainProfile?.requiredKeywords.join(', ')}

CHECK FOR:
1. NO TODO comments, NO console.log, NO placeholders
2. All required sections present
3. Copy matches tone (no tech jargon in ${input.domainProfile?.industry})
4. Headings proper hierarchy (H1 → H2 → H3)
5. Contrast ratios sufficient (4.5:1 minimum)
6. Responsive (mobile, tablet, desktop)
7. Proof points present (testimonials, certs, etc.)
8. CTAs are clear and compelling

Return JSON ValidationScoreExtended with all fields.
ONLY JSON.`
}

function calculateAwwwardsReadiness(
  score: any
): 'not-ready' | 'close' | 'ready' | 'excellent' {
  const avg =
    (score.designScore || 0) +
    (score.accessibility || 0) +
    (score.animationScore || 0) +
    (score.domainAlignment || 0)
  const avgScore = avg / 4
  if (avgScore >= 90) return 'excellent'
  if (avgScore >= 75) return 'ready'
  if (avgScore >= 60) return 'close'
  return 'not-ready'
}

function calculateEstimatedValue(score: any): string {
  const overall =
    (score.designScore || 0) * 0.3 +
    (score.domainAlignment || 0) * 0.3 +
    (score.animationScore || 0) * 0.2 +
    (score.accessibility || 0) * 0.2

  if (overall >= 85) return '100k+'
  if (overall >= 70) return '50k-100k'
  if (overall >= 55) return '20k-50k'
  return '10k-20k'
}

function hashInput(input: AgentInput): string {
  return Buffer.from(JSON.stringify(input)).toString('base64').slice(0, 16)
}

function hashOutput(output: unknown): string {
  return Buffer.from(JSON.stringify(output)).toString('base64').slice(0, 16)
}