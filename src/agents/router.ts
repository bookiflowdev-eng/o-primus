import { runDesignAnalyzer } from './design-analyzer'
import { runAnimationEngineer } from './animation-engineer'
import { runThreeSpecialist } from './three-specialist'
import { runCodeOrchestrator } from './code-orchestrator'
import { runQualityValidator } from './quality-validator'
import { runRagRetriever } from './rag-retriever'
import type { GenerationRequest, GenerationOutput } from '@/types/generation'
import type { ThreeScene } from '@/types/agent'

async function resolveThreeScene(
  enabled: boolean,
  request: GenerationRequest,
  designSpec: import('@/types/agent').DesignSpec,
  ragContext: string
): Promise<ThreeScene | null> {
  if (!enabled) return null
  return runThreeSpecialist(request, designSpec, ragContext)
}

export async function runGenerationPipeline(
  request: GenerationRequest
): Promise<GenerationOutput> {
  const startTime = Date.now()

  console.log('[Pipeline] 1/6 — Design Analyzer')
  const designSpec = await runDesignAnalyzer(request)

  console.log('[Pipeline] 2/6 — RAG Retriever')
  const ragResult = await runRagRetriever(request, designSpec)

  console.log('[Pipeline] 3+4/6 — Animation + Three (parallèle)')
  const [animationConfig, threeScene] = await Promise.all([
    runAnimationEngineer(request, designSpec, ragResult.animationContext),
    resolveThreeScene(
      designSpec.includeThreeD ?? false,
      request,
      designSpec,
      ragResult.threeContext
    ),
  ])

  console.log('[Pipeline] 5/6 — Code Orchestrator')
  const generatedFiles = await runCodeOrchestrator(
    request,
    designSpec,
    animationConfig,
    threeScene,
    ragResult.architectureContext
  )

  console.log('[Pipeline] 6/6 — Quality Validator')
  const validationScore = await runQualityValidator(generatedFiles, request)

  const duration = ((Date.now() - startTime) / 1000).toFixed(1)
  console.log(`[Pipeline] ✅ Terminé en ${duration}s`)

  return {
    userId: request.userId,
    request,
    files: generatedFiles,
    validationScore,
    createdAt: new Date().toISOString(),
    status: 'completed',
  }
}
