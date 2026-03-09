import { GoogleGenerativeAI } from '@google/generative-ai'
import { supabaseAdmin } from './supabase'

export interface RAGContext {
  uiChunks: string[]
  domainChunks: string[]
}

export async function retrieveRAGContext(userPrompt: string, industry?: string): Promise<RAGContext> {
  const [uiChunks, domainChunks] = await Promise.all([
    retrieveUIChunks(userPrompt),
    retrieveDomainChunks(userPrompt, industry),
  ])
  return { uiChunks, domainChunks }
}

async function retrieveUIChunks(query: string, limit: number = 5): Promise<string[]> {
  try {
    const embedding = await embedText(query)
    const { data, error } = await supabaseAdmin.rpc('match_ui_chunks', {
      query_embedding: embedding,
      match_threshold: 0.5,
      match_count: limit,
    })
    if (error) { console.error('RAG UI retrieval error:', error); return [] }
    return (data || []).map((r: any) => r.content)
  } catch (error) { console.error('UI chunk retrieval failed:', error); return [] }
}

async function retrieveDomainChunks(query: string, industry?: string, limit: number = 5): Promise<string[]> {
  try {
    const embedding = await embedText(query)
    let request: any = { query_embedding: embedding, match_threshold: 0.5, match_count: limit }
    if (industry) request.filter_industry = industry

    const { data, error } = await supabaseAdmin.rpc('match_domain_chunks', request)
    if (error) { console.error('RAG domain retrieval error:', error); return [] }
    return (data || []).map((r: any) => r.content)
  } catch (error) { console.error('Domain chunk retrieval failed:', error); return [] }
}

async function embedText(text: string): Promise<number[]> {
  const apiKey = process.env.GEMINI_API_KEY ?? process.env.NEXT_PUBLIC_GEMINI_API_KEY ?? ''
  if (!apiKey) throw new Error('GEMINI_API_KEY missing')
  
  const client = new GoogleGenerativeAI(apiKey)
  // FIX 2026 : Utilisation du modèle actif
  const model = client.getGenerativeModel({ model: 'gemini-embedding-001' })
  
  try {
    const result = await model.embedContent({
      content: { role: 'user', parts: [{ text }] },
      // Demande formelle de compression à 1536 (Backward compatibility avec notre PostgreSQL)
      outputDimensionality: 1536 
    } as any)
    
    let vector = result.embedding.values
    
    // SÉCURITÉ ABSOLUE : Coupure manuelle de sécurité si l'API ignore la directive
    if (vector.length > 1536) {
      vector = vector.slice(0, 1536)
    } else if (vector.length < 1536) {
      const padded = new Array(1536).fill(0)
      for (let i = 0; i < vector.length; i++) padded[i] = vector[i]
      vector = padded
    }
    
    return vector
  } catch (error) {
    console.error('Embedding error:', error)
    return new Array(1536).fill(0)
  }
}

export async function indexUIChunks(chunks: { content: string, category: 'animation' | 'scroll' | 'components' | 'typography' | 'webgl', source?: string }[]): Promise<void> {
  for (const chunk of chunks) {
    const embedding = await embedText(chunk.content)
    const { error } = await supabaseAdmin.from('ui_chunks').insert({
      content: chunk.content,
      category: chunk.category,
      source: chunk.source,
      embedding: embedding,
      created_at: new Date().toISOString(),
    })
    if (error) console.error('Failed to index UI chunk:', error)
  }
}

export async function indexDomainChunks(chunks: { content: string, industry: string, category: 'tone' | 'structure' | 'copy' | 'proof-points' | 'regulations', source?: string }[]): Promise<void> {
  for (const chunk of chunks) {
    const embedding = await embedText(chunk.content)
    const { error } = await supabaseAdmin.from('domain_chunks').insert({
      content: chunk.content,
      industry: chunk.industry,
      category: chunk.category,
      source: chunk.source,
      embedding: embedding,
      created_at: new Date().toISOString(),
    })
    if (error) console.error('Failed to index domain chunk:', error)
  }
}
