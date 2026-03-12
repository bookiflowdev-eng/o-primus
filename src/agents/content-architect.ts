// ============================================================================
// src/agents/content-architect.ts — Agent 2 (NEW)
// ============================================================================
// Rôle : Générer copy métier-spécifique (headlines, body, CTA, FAQ, etc.)
// Respects forbiddenJargon, injecte requiredKeywords
// Output : ContentBlueprint structuré par sections

import { GoogleGenerativeAI } from '@google/generative-ai'
import { OPRIMUSMODEL } from '@/config/agents.config'
import { getAgentConfig } from '@/config/agents.config'
import { getSystemPrompt } from '@/types/agent'
import type { AgentInput, AgentOutput } from '@/types/agent'
import type { ContentBlueprint } from '@/types/domain'
import { validateContentBlueprint } from '@/lib/agent-validator'

export async function runContentArchitect(input: AgentInput): Promise<AgentOutput> {
  const config = getAgentConfig('content-architect')
  const startTime = Date.now()
  const client = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

  if (!input.domainProfile) {
    throw new Error('ContentArchitect requires DomainProfile from previous step')
  }

  try {
    const model = client.getGenerativeModel({ model: OPRIMUSMODEL })

    const userPrompt = buildContentArchitectPrompt(input)

    const response = await model.generateContent({
      contents: [
        {
          role: 'user',
          parts: [{ text: userPrompt }],
        },
      ],
      systemInstruction: getSystemPrompt('content-architect'),
      generationConfig: {
        temperature: config.temperature,
        maxOutputTokens: config.maxOutputTokens,
        responseMimeType: 'application/json',
      },
      // @ts-ignore
      thinking: config.thinkingBudget !== 0 ? {
        budget_tokens: config.thinkingBudget === -1 ? 15000 : config.thinkingBudget,
      } : undefined,
    })

    const responseText = response.content.parts[0]?.text || ''
    const parsed = JSON.parse(responseText)
    const blueprint = validateContentBlueprint(parsed)

    const durationMs = Date.now() - startTime

    return {
      jobId: input.jobId,
      agentId: 'content-architect',
      stepNumber: input.stepNumber,
      payload: { contentBlueprint: blueprint },
      success: true,
      tokensIn: response.usageMetadata?.promptTokens || 0,
      tokensOut: response.usageMetadata?.candidatesTokens || 0,
      thinkingTokens: 0,
      durationMs,
      trace: {
        jobId: input.jobId,
        stepNumber: input.stepNumber,
        agentName: 'content-architect',
        startedAt: new Date().toISOString(),
        completedAt: new Date().toISOString(),
        durationMs,
        inputHash: hashInput(input),
        inputSummary: `Domain: ${input.domainProfile.industry}, Tone: ${input.domainProfile.brandTone}`,
        outputSizeBytes: JSON.stringify(blueprint).length,
        outputHash: hashOutput(blueprint),
        modelUsed: OPRIMUSMODEL,
        tokensIn: response.usageMetadata?.promptTokens || 0,
        tokensOut: response.usageMetadata?.candidatesTokens || 0,
        logs: [
          { level: 'info', message: `Generated ${blueprint.sections.length} sections`, timestamp: new Date().toISOString() },
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
      agentId: 'content-architect',
      stepNumber: input.stepNumber,
      payload: { contentBlueprint: getGenericContentBlueprint() },
      success: false,
      error: {
        message: errorMessage,
        code: 'CONTENT_ARCHITECT_ERROR',
        recoverable: true,
      },
      tokensIn: 0,
      tokensOut: 0,
      durationMs,
      trace: {
        jobId: input.jobId,
        stepNumber: input.stepNumber,
        agentName: 'content-architect',
        startedAt: new Date().toISOString(),
        completedAt: new Date().toISOString(),
        durationMs,
        inputHash: hashInput(input),
        inputSummary: `Domain: ${input.domainProfile?.industry || 'unknown'}`,
        outputSizeBytes: 0,
        outputHash: '',
        modelUsed: OPRIMUSMODEL,
        tokensIn: 0,
        tokensOut: 0,
        logs: [{ level: 'error', message: errorMessage, timestamp: new Date().toISOString() }],
        success: false,
        errorMessage,
        retryCount: 0,
        fallbackApplied: 'template',
      },
    }
  }
}

function buildContentArchitectPrompt(input: AgentInput): string {
  const { domainProfile, designSpec } = input

  return `Generate comprehensive content blueprint for landing page.

DOMAIN CONTEXT:
- Industry: ${domainProfile!.industry}
- Business Model: ${domainProfile!.businessModel}
- Brand Tone: ${domainProfile!.brandTone}
- Primary Personas: ${domainProfile!.primaryPersonas.map((p) => p.name).join(', ')}

CONSTRAINTS:
- FORBIDDEN jargon: ${domainProfile!.forbiddenJargon.join(', ')}
- REQUIRED keywords: ${domainProfile!.requiredKeywords.join(', ')}
- Proof points needed: ${domainProfile!.proofPointsRequired.map((p) => \`\${p.type} (x\${p.count})\`).join(', ')}

USER PROMPT: "${input.userPrompt}"

Generate full ContentBlueprint with sections:
1. Hero (headline, subheadline, CTA)
2. USP (3-5 unique selling points)
3. Proof (testimonials, certifications, data)
4. Process (steps or workflow)
5. Services/Features (main offerings)
6. FAQ (common questions)
7. CTA (final call-to-action)
8. Contact

Return ONLY JSON. No markdown.`
}

function getGenericContentBlueprint(): ContentBlueprint {
  return {
    sections: [
      {
        id: 'hero',
        type: 'hero',
        headline: 'Welcome to Our Solution',
        subheadline: 'Discover what we offer',
        layout: 'stacked',
        emphasis: 'high',
        callToAction: { text: 'Get Started', style: 'primary' },
      },
      {
        id: 'usp',
        type: 'usp',
        headline: 'Why Choose Us',
        items: [
          { title: 'Feature 1', description: 'Description' },
          { title: 'Feature 2', description: 'Description' },
          { title: 'Feature 3', description: 'Description' },
        ],
        layout: 'grid-3',
        emphasis: 'medium',
      },
    ],
    globalCopy: {
      brandStatement: 'Welcome',
      tagline: 'Your solution',
      ctaPrimary: 'Get Started',
      ctaSecondary: 'Learn More',
      footerText: 'All rights reserved',
    },
    metadata: {
      generatedAt: new Date().toISOString(),
      wordCount: 250,
    },
  }
}

function hashInput(input: AgentInput): string {
  return Buffer.from(JSON.stringify(input)).toString('base64').slice(0, 16)
}

function hashOutput(output: unknown): string {
  return Buffer.from(JSON.stringify(output)).toString('base64').slice(0, 16)
}