import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(req: Request) {
  try {
    const { query } = await req.json();
    if (!query) return NextResponse.json({ error: 'Recherche vide.' }, { status: 400 });

    console.log(`[RAG X-RAY] Vectorisation de : "${query}"`);

    const apiKey = process.env.GEMINI_API_KEY ?? process.env.NEXT_PUBLIC_GEMINI_API_KEY ?? '';
    const client = new GoogleGenerativeAI(apiKey);

    // 🔴 LE VRAI NOM DU MODÈLE (Celui utilisé dans ton indexation initiale)
    const model = client.getGenerativeModel({ model: 'gemini-embedding-001' });

    const result = await model.embedContent(query);
    let vector = result.embedding.values;

    // Compression stricte à 1536 dimensions pour correspondre au pgvector de Supabase
    if (vector.length > 1536) {
      vector = vector.slice(0, 1536);
    } else if (vector.length < 1536) {
      const padded = new Array(1536).fill(0);
      for (let i = 0; i < vector.length; i++) padded[i] = vector[i];
      vector = padded;
    }

    // 2. On fouille la table ui_chunks via ta fonction RPC
    const { data, error } = await supabaseAdmin.rpc('match_ui_chunks', {
      query_embedding: vector,
      match_threshold: 0.1, // Seuil très bas pour être sûr que ça remonte les datas
      match_count: 5,
    });

    if (error) throw error;

    return NextResponse.json({
      success: true,
      results: data || []
    }, { status: 200 });

  } catch (error: any) {
    console.error("[RAG TEST ERROR]:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}