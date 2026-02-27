import { GoogleGenerativeAI } from '@google/generative-ai'
import { searchSimilarCode } from '@/lib/rag'
import type { GenerationRequest } from '@/types/generation'
import type { DesignSpec } from '@/types/agent'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY ?? '')
const embeddingModel = genAI.getGenerativeModel({ model: 'models/text-embedding-004' })

export interface RAGResult {
  chunks: Array<{
    id: string
    repoName: string
    filePath: string
    codeSnippet: string
    description: string
  }>
  animationContext: string   // Injecté dans AnimationEngineer
  threeContext: string       // Injecté dans ThreeSpecialist
  architectureContext: string // Injecté dans CodeOrchestrator
}

async function buildSearchQuery(
  request: GenerationRequest,
  designSpec: DesignSpec
): Promise<string> {
  const parts = [
    `Landing page ${request.style ?? 'premium'} style`,
    `mood: ${designSpec.mood ?? 'sophisticated'}`,
    `animations: ${designSpec.primaryAnimations?.join(', ') ?? 'scroll reveal'}`,
    `audience: ${designSpec.targetAudience ?? 'enterprise'}`,
    request.includeThreeD ? 'React Three Fiber 3D WebGL scene' : '',
    'GSAP ScrollTrigger Lenis smooth scroll',
    'premium award-winning Awwwards SOTD',
  ].filter(Boolean).join(' — ')

  return parts
}

function partitionChunksByCategory(chunks: RAGResult['chunks']): {
  animationChunks: RAGResult['chunks']
  threeChunks: RAGResult['chunks']
  archChunks: RAGResult['chunks']
} {
  return {
    animationChunks: chunks.filter(c =>
      c.description.includes('GSAP') ||
      c.description.includes('Lenis') ||
      c.description.includes('animation') ||
      c.description.includes('scroll') ||
      c.repoName === 'lenis' ||
      c.repoName === 'locomotive-scroll' ||
      c.repoName === 'motion-primitives'
    ),
    threeChunks: chunks.filter(c =>
      c.description.includes('Three Fiber') ||
      c.description.includes('GLSL') ||
      c.description.includes('3D') ||
      c.repoName === 'drei' ||
      c.repoName === 'r3f-journey'
    ),
    archChunks: chunks.filter(c =>
      c.repoName === 'shadcn-ui' ||
      c.repoName === 'vercel-commerce' ||
      c.description.includes('React hook') ||
      c.description.includes('TypeScript module')
    ),
  }
}

function buildContext(chunks: RAGResult['chunks'], maxChunks = 3): string {
  if (chunks.length === 0) return ''

  return chunks
    .slice(0, maxChunks)
    .map((c, i) => `// [REF ${i + 1}] from ${c.repoName} — ${c.filePath}\n${c.codeSnippet}`)
    .join('\n\n---\n\n')
}

export async function runRagRetriever(
  request: GenerationRequest,
  designSpec: DesignSpec
): Promise<RAGResult> {
  try {
    // 1. Construire la requête sémantique
    const query = await buildSearchQuery(request, designSpec)

    // 2. Générer l'embedding de la requête
    const result = await embeddingModel.embedContent(query)
    const queryEmbedding = result.embedding.values

    // 3. Recherche vectorielle dans Supabase
    const rawChunks = await searchSimilarCode(queryEmbedding, 15, 0.72)

    const chunks = rawChunks.map(c => ({
      id: c.id,
      repoName: c.repoName,
      filePath: c.filePath,
      codeSnippet: c.codeSnippet,
      description: c.description,
    }))

    // 4. Partitionner par catégorie
    const { animationChunks, threeChunks, archChunks } = partitionChunksByCategory(chunks)

    return {
      chunks,
      animationContext: buildContext(animationChunks, 3),
      threeContext: buildContext(threeChunks, 2),
      architectureContext: buildContext(archChunks, 2),
    }
  } catch (err) {
    // Si le RAG échoue, on continue sans contexte — le pipeline ne doit pas bloquer
    console.error('[RAG] Retrieval échoué, génération sans contexte:', err)
    return {
      chunks: [],
      animationContext: '',
      threeContext: '',
      architectureContext: '',
    }
  }
}
