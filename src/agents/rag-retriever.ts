import { retrieveRichContext } from '@/lib/rag'
import type { GenerationRequest } from '@/types/generation'
import type { DesignSpec } from '@/types/agent'

// Interface du résultat retourné vers le router
export interface RAGResult {
  animationContext:    string  // → Animation Engineer
  scrollContext:       string  // → Animation Engineer
  threeContext:        string  // → Three Specialist
  architectureContext: string  // → Code Orchestrator
  typographyContext:   string  // → Code Orchestrator
  totalChunksFound:   number
  ragAvailable:       boolean  // false si la BDD est vide ou le RAG a échoué
}

// Résultat vide — utilisé si le RAG échoue (pipeline ne bloque jamais)
const EMPTY_RESULT: RAGResult = {
  animationContext:    '',
  scrollContext:       '',
  threeContext:        '',
  architectureContext: '',
  typographyContext:   '',
  totalChunksFound:   0,
  ragAvailable:       false,
}

export async function runRagRetriever(
  request: GenerationRequest,
  designSpec: DesignSpec,
): Promise<RAGResult> {
  try {
    const richContext = await retrieveRichContext(request, designSpec)

    if (richContext.totalChunksFound === 0) {
      console.warn('[RAG] BDD vide — génération sans contexte de bibliothèque. Exécute npm run build-library.')
      return EMPTY_RESULT
    }

    console.log(`[RAG] ${richContext.totalChunksFound} chunks trouvés — contexte enrichi injecté`)

    return {
      ...richContext,
      ragAvailable: true,
    }
  } catch (err) {
    // Ne bloque JAMAIS le pipeline — fallback silencieux
    console.error('[RAG] Erreur retrieval:', err instanceof Error ? err.message : String(err))
    return EMPTY_RESULT
  }
}
