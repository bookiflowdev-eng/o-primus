import { supabaseAdmin } from './supabase'
import type { GenerationRequest } from '@/types/generation'
import type { DesignSpec } from '@/types/agent'
import { STYLE_QUERY_MAP, CATEGORY_SEARCH_MAP, WEBGL_SEARCH } from '@/lib/prompts/rag-retriever.prompt'

// ──────────────────────────────────────────────────────────────
// Config embedding — aligné avec index-repos.ts et Supabase vector(1536)
// ──────────────────────────────────────────────────────────────
const EMBED_DIM      = 1536
const EMBED_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-001:embedContent`

// ──────────────────────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────────────────────
export interface RawChunk {
  id:           number
  repo_name:    string
  category:     string
  file_path:    string
  code_snippet: string
  description:  string
  similarity:   number
}

export interface RichContext {
  animationContext:    string
  scrollContext:       string
  threeContext:        string
  architectureContext: string
  typographyContext:   string
  totalChunksFound:   number
}

// ──────────────────────────────────────────────────────────────
// embed — fetch direct v1beta, dimension 1536 (remplace embeddingModel SDK)
// ──────────────────────────────────────────────────────────────
async function embed(text: string): Promise<number[]> {
  const apiKey = process.env.GEMINI_API_KEY ?? process.env.NEXT_PUBLIC_GEMINI_API_KEY ?? ''
  if (!apiKey) { console.error('[RAG] GEMINI_API_KEY manquante'); return [] }

  try {
    const res = await fetch(EMBED_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type':   'application/json',
        'x-goog-api-key': apiKey,
      },
      body: JSON.stringify({
        content:               { parts: [{ text: text.slice(0, 2048) }] },
        output_dimensionality: EMBED_DIM,
      }),
    })
    if (!res.ok) {
      console.error(`[RAG] Embedding API ${res.status}:`, (await res.text()).slice(0, 120))
      return []
    }
    const data = await res.json() as { embedding?: { values?: number[] } }
    return data.embedding?.values ?? []
  } catch (e: unknown) {
    console.error('[RAG] embed error:', e instanceof Error ? e.message : String(e))
    return []
  }
}

// ──────────────────────────────────────────────────────────────
// searchSimilarCode — conservée pour backward compat
// ──────────────────────────────────────────────────────────────
export async function searchSimilarCode(
  queryEmbedding: number[],
  limit = 10,
  threshold = 0.70,
  category?: string,
): Promise<RawChunk[]> {
  const { data, error } = await supabaseAdmin.rpc('match_repo_chunks', {
    query_embedding:  queryEmbedding,
    match_count:      limit,
    match_threshold:  threshold,
    filter_category:  category ?? null,
  })
  if (error) { console.error('[RAG] searchSimilarCode error:', error.message); return [] }
  return (data ?? []) as RawChunk[]
}

// ──────────────────────────────────────────────────────────────
// formatChunks — formate les chunks pour injection dans le prompt
// ──────────────────────────────────────────────────────────────
function formatChunks(chunks: RawChunk[], maxChunks = 4): string {
  if (chunks.length === 0) return ''
  return chunks
    .slice(0, maxChunks)
    .map((c, i) => `// REF ${i + 1} — ${c.repo_name}/${c.file_path}\n${c.code_snippet}`)
    .join('\n// ───────────────────────\n')
}

// ──────────────────────────────────────────────────────────────
// buildStyleQuery
// ──────────────────────────────────────────────────────────────
function buildStyleQuery(designSpec: DesignSpec): string {
  const styleBase = STYLE_QUERY_MAP[designSpec.style ?? 'dark-premium'] ?? ''
  const extras = [
    designSpec.mood,
    designSpec.primaryAnimations?.join(' '),
    designSpec.complexity === 'ultra' ? 'Awwwards SOTD award-winning premium' : '',
  ].filter(Boolean).join(' ')
  return `${styleBase} ${extras}`.trim()
}

// ──────────────────────────────────────────────────────────────
// retrieveRichContext — recherche parallèle multi-catégories
// ──────────────────────────────────────────────────────────────
export async function retrieveRichContext(
  request: GenerationRequest,
  designSpec: DesignSpec,
): Promise<RichContext> {
  const styleQuery = buildStyleQuery(designSpec)

  const [animationChunks, scrollChunks, componentChunks, typographyChunks, webglChunks] =
    await Promise.all([
      embed(`${CATEGORY_SEARCH_MAP.query} ${styleQuery}`)
        .then(emb => emb.length ? searchSimilarCode(emb, CATEGORY_SEARCH_MAP.limit, 0.68, 'animation') : []),
      embed(`${CATEGORY_SEARCH_MAP.query} ${styleQuery}`)
        .then(emb => emb.length ? searchSimilarCode(emb, CATEGORY_SEARCH_MAP.limit, 0.68, 'scroll') : []),
      embed(`${CATEGORY_SEARCH_MAP.query} ${styleQuery}`)
        .then(emb => emb.length ? searchSimilarCode(emb, CATEGORY_SEARCH_MAP.limit, 0.65, 'components') : []),
      embed(`${CATEGORY_SEARCH_MAP.query} ${styleQuery}`)
        .then(emb => emb.length ? searchSimilarCode(emb, CATEGORY_SEARCH_MAP.limit, 0.65, 'typography') : []),
      request.includeThreeD
        ? embed(`${WEBGL_SEARCH.query} ${styleQuery}`)
            .then(emb => emb.length ? searchSimilarCode(emb, WEBGL_SEARCH.limit, 0.68, 'webgl') : [])
        : Promise.resolve([]),
    ])

  return {
    animationContext:    formatChunks([...animationChunks, ...scrollChunks], 6),
    scrollContext:       formatChunks(scrollChunks, 3),
    threeContext:        formatChunks(webglChunks, 4),
    architectureContext: formatChunks(componentChunks, 4),
    typographyContext:   formatChunks(typographyChunks, 3),
    totalChunksFound:   animationChunks.length + scrollChunks.length +
                        componentChunks.length + typographyChunks.length + webglChunks.length,
  }
}
