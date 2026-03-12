import { SchemaType, getGeminiClient } from '@/lib/gemini-client'
import { getAgentConfig, OPRIMUSMODEL } from '@/config/agents.config'
import { getSystemPrompt } from '@/types/agent'
import type { AgentInput, AgentOutput } from '@/types/agent'
import type { AgentTrace } from '@/types/domain'

const OrchestratorSchema = {
  type: SchemaType.OBJECT,
  properties: {
    generatedFiles: {
      type: SchemaType.OBJECT,
      properties: {
        "page.tsx": { type: SchemaType.STRING },
        "animations.ts": { type: SchemaType.STRING },
        "globals.css": { type: SchemaType.STRING },
        "package.json": { type: SchemaType.STRING },
        "three-scene.tsx": { type: SchemaType.STRING },
      },
      required: ["page.tsx", "animations.ts", "globals.css", "package.json"]
    }
  },
  required: ["generatedFiles"]
}

export async function runCodeOrchestrator(input: AgentInput): Promise<AgentOutput> {
  const config = getAgentConfig('code-orchestrator')
  const startTime = Date.now()
  const client = getGeminiClient()

  if (!input.semanticTensor || !input.designSpec || !input.contentBlueprint || !input.animationConfig) {
    throw new Error('CodeOrchestrator requires preceding states including SemanticTensor.')
  }

  try {
    const userPrompt = buildOrchestratorPrompt(input)

    const { data: parsed, tokens } = await client.generateJSON<{ generatedFiles: Record<string, string> }>({
      systemPrompt: getSystemPrompt('code-orchestrator', input.activePatches),
      userPrompt,
      temperature: config.temperature,
      topP: config.topP,
      topK: config.topK,
      maxOutputTokens: config.maxOutputTokens,
      thinkingBudget: config.thinkingBudget,
      responseSchema: OrchestratorSchema as any
    })

    const generatedFiles = parsed.generatedFiles
    if (!generatedFiles?.['page.tsx'] || !generatedFiles?.['animations.ts']) {
      throw new Error('CodeOrchestrator failed to generate critical AST files.')
    }

    const durationMs = Date.now() - startTime

    const trace: AgentTrace = {
      jobId: input.jobId, stepNumber: input.stepNumber, agentName: 'code-orchestrator',
      startedAt: new Date(Date.now() - durationMs).toISOString(), completedAt: new Date().toISOString(),
      durationMs, inputHash: 'hash',
      inputSummary: `Files: ${Object.keys(generatedFiles).length}. Corrected: ${!!input.correctionFeedback}`,
      outputSizeBytes: JSON.stringify(generatedFiles).length, outputHash: '',
      modelUsed: OPRIMUSMODEL, tokensIn: tokens.in, tokensOut: tokens.out,
      logs: [{ level: 'info', message: `Compilation complete. Absolute Sync enforced.`, timestamp: new Date().toISOString() }],
      success: true, retryCount: input.correctionFeedback ? 1 : 0,
    }

    return {
      jobId: input.jobId, agentId: 'code-orchestrator', stepNumber: input.stepNumber,
      payload: { generatedFiles }, success: true,
      tokensIn: tokens.in, tokensOut: tokens.out, thinkingTokens: 0, durationMs, trace,
    }
  } catch (error) {
    const durationMs = Date.now() - startTime
    return {
      jobId: input.jobId, agentId: 'code-orchestrator', stepNumber: input.stepNumber, payload: undefined as any,
      success: false, error: { message: String(error), code: 'AST_ERROR', recoverable: true },
      tokensIn: 0, tokensOut: 0, durationMs,
      trace: {
        jobId: input.jobId, stepNumber: input.stepNumber, agentName: 'code-orchestrator',
        startedAt: new Date(Date.now() - durationMs).toISOString(), completedAt: new Date().toISOString(),
        durationMs, inputHash: '', outputSizeBytes: 0, outputHash: '', modelUsed: OPRIMUSMODEL, tokensIn: 0, tokensOut: 0,
        logs: [{ level: 'error', message: String(error), timestamp: new Date().toISOString() }], success: false, retryCount: 0,
      },
    }
  }
}

function buildOrchestratorPrompt(input: AgentInput): string {
  const has3D = input.threeScene?.enabled === true

  const correctionDirective = input.correctionFeedback 
    ? `\n[CRITICAL CORRECTION ROUND: SELF-HEALING LOOP]\nYour previous AST failed validation. FIX THESE SPECIFIC BUGS SURGICALLY without degrading other components:\n${input.correctionFeedback}\n`
    : ''

  return `Assemble a complete, production-ready Next.js 15 landing page.
${correctionDirective}

SHARED SEMANTIC TENSOR:
${JSON.stringify(input.semanticTensor, null, 2)}

CONTENT BLUEPRINT:
${JSON.stringify(input.contentBlueprint, null, 2)}

DESIGN SPEC & ANIMATION:
${JSON.stringify(input.designSpec)}
${JSON.stringify(input.animationConfig)}

${has3D ? `WEBGL SCENE:\n${JSON.stringify(input.threeScene)}` : '// 3D disabled'}

RAG UI CONTEXT (Architecture Patterns):
${input.ragContext?.uiChunks?.join('\n') ?? 'None'}

ASSEMBLY LAWS (ABSOLUTE SYNCHRONIZATION):
1. In \`animations.ts\`, you MUST bind Lenis to GSAP. Do exactly: 
   \`gsap.ticker.add((time)=>{lenis.raf(time*1000)});\n   gsap.ticker.lagSmoothing(0);\`
2. Provide a global state (e.g., Zustand) if 'uVelocity' needs to be shared to WebGL.
${has3D ? '3. `three-scene.tsx` MUST read scroll velocity directly from the shared state/ticker inside `useFrame`, avoiding React re-renders.' : ''}

CONSTRAINTS:
- ZERO TODO comments. ZERO placeholders.
- Semantic HTML and valid Tailwind classes only.`
}