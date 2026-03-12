import { getGeminiClient, SchemaType } from '@/lib/gemini-client'
import { getAgentConfig, OPRIMUSMODEL } from '@/config/agents.config'
import { getSystemPrompt } from '@/types/agent'
import type { AgentInput, AgentOutput } from '@/types/agent'
import type { DomainProfile } from '@/types/domain'
import crypto from 'crypto'

export async function runDomainProfiler(input: AgentInput): Promise<AgentOutput> {
  const config = getAgentConfig('domain-profiler')
  const startTime = Date.now()
  const client = getGeminiClient()

  const DomainProfileSchema = {
    type: SchemaType.OBJECT,
    properties: {
      industry: { type: SchemaType.STRING },
      businessModel: { type: SchemaType.STRING },
      companyStage: { type: SchemaType.STRING },
      verticalKeywords: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
      brandTone: { type: SchemaType.STRING },
      brandPersonality: { type: SchemaType.STRING },
      forbiddenJargon: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
      requiredKeywords: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
      prohibitedPatterns: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
      psychographics: {
        type: SchemaType.OBJECT,
        properties: {
          conversionTrigger: { type: SchemaType.STRING },
          trustSignals: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
          visualArchetypes: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
          bannedArchetypes: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } }
        },
        required: ["conversionTrigger", "trustSignals", "visualArchetypes", "bannedArchetypes"]
      },
      semanticTensor: {
        type: SchemaType.OBJECT,
        properties: {
          kinematics: { 
            type: SchemaType.OBJECT, 
            properties: { stiffness: { type: SchemaType.NUMBER }, damping: { type: SchemaType.NUMBER }, globalEasing: { type: SchemaType.STRING } },
            required: ["stiffness", "damping", "globalEasing"]
          },
          spatialLogic: { type: SchemaType.STRING },
          materiality: { type: SchemaType.STRING }
        },
        required: ["kinematics", "spatialLogic", "materiality"]
      },
      primaryPersonas: { type: SchemaType.ARRAY, items: { type: SchemaType.OBJECT, properties: { name: { type: SchemaType.STRING }, painPoints: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } }, motivations: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } }, decisionCriteria: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } } } } },
      proofPointsRequired: { type: SchemaType.ARRAY, items: { type: SchemaType.OBJECT, properties: { type: { type: SchemaType.STRING }, count: { type: SchemaType.NUMBER }, specificity: { type: SchemaType.STRING } } } },
      successMetrics: { type: SchemaType.OBJECT, properties: { primary: { type: SchemaType.STRING }, secondary: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } } } },
      marketContext: { type: SchemaType.OBJECT, properties: { competitorTone: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } }, differentiation: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } }, urgencyLevel: { type: SchemaType.STRING } } },
      metadata: { type: SchemaType.OBJECT, properties: { detectedAt: { type: SchemaType.STRING }, confidence: { type: SchemaType.NUMBER } } }
    },
    required: ["industry", "businessModel", "brandTone", "forbiddenJargon", "psychographics", "semanticTensor"]
  }

  try {
    const userPrompt = `Deduce the complete Domain Profile and compute the SharedSemanticTensor for this project:\nUSER PROMPT: "${input.userPrompt}"`

    const { data: profile, tokens } = await client.generateJSON<DomainProfile>({
      systemPrompt: getSystemPrompt('domain-profiler', input.activePatches),
      userPrompt,
      temperature: config.temperature,
      topP: config.topP,
      topK: config.topK,
      maxOutputTokens: config.maxOutputTokens,
      thinkingBudget: config.thinkingBudget,
      responseSchema: DomainProfileSchema as any
    })

    const durationMs = Date.now() - startTime

    return {
      jobId: input.jobId, agentId: 'domain-profiler', stepNumber: input.stepNumber,
      payload: { domainProfile: profile }, success: true,
      tokensIn: tokens.in, tokensOut: tokens.out, durationMs,
      trace: {
        jobId: input.jobId, stepNumber: input.stepNumber, agentName: 'domain-profiler',
        startedAt: new Date(Date.now() - durationMs).toISOString(), completedAt: new Date().toISOString(),
        durationMs, inputHash: crypto.createHash('sha256').update(input.userPrompt).digest('hex').substring(0,16),
        outputSizeBytes: JSON.stringify(profile).length, outputHash: '',
        modelUsed: OPRIMUSMODEL, tokensIn: tokens.in, tokensOut: tokens.out,
        logs: [{ level: 'info', message: 'Semantic Tensor Matrix Generated.', timestamp: new Date().toISOString() }],
        success: true, retryCount: 0
      },
    }
  } catch (error) {
    throw error
  }
}