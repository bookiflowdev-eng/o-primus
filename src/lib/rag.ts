import { supabaseAdmin } from './supabase'

export interface RepoChunk {
  id: string
  repoName: string
  filePath: string
  codeSnippet: string
  description: string
  embedding?: number[]
}

// Recherche vectorielle dans Supabase pgvector
export async function searchSimilarCode(
  queryEmbedding: number[],
  limit = 5,
  threshold = 0.75
): Promise<RepoChunk[]> {
  const { data, error } = await supabaseAdmin.rpc('match_repo_chunks', {
    query_embedding: queryEmbedding,
    match_threshold: threshold,
    match_count: limit,
  })
  if (error) throw new Error(`RAG search échoué: ${error.message}`)
  return (data ?? []) as RepoChunk[]
}

// Insertion d'un chunk avec embedding
export async function upsertChunk(chunk: RepoChunk): Promise<void> {
  const { error } = await supabaseAdmin
    .from('repo_chunks')
    .upsert({ ...chunk }, { onConflict: 'id' })
  if (error) throw new Error(`RAG upsert échoué: ${error.message}`)
}
