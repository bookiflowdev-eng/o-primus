import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { randomUUID } from 'crypto'
import { supabaseAdmin } from '@/lib/supabase'
import { runAgentPipeline } from '@/agents/router'
import { normalizeGenerateBody } from '@/lib/contracts/normalize-generation-request'

// Schéma "union" : ancien + nouveau
const NewSchema = z.object({
  userIntent: z.string().min(10).max(2000),
  style: z.enum(['scroll-reveal', 'parallax', '3d-immersive', 'glassmorphism', 'minimal-clean', 'dark-premium']),
  intensity: z.enum(['subtle', 'medium', 'aggressive']),
  includeThreeD: z.boolean(),
  colorPalette: z.string().optional(),
  targetAudience: z.string().optional(),
})

const LegacySchema = z.object({
  prompt: z.string().min(10),
  style: z.enum(['scroll-reveal', 'parallax', '3d-immersive', 'glassmorphism', 'minimal-clean', 'dark-premium']).optional(),
  intensity: z.enum(['subtle', 'moderate', 'intense']).optional(),
  includeThreeD: z.boolean().optional().default(false),
  colorPalette: z.string().optional(),
  targetAudience: z.string().optional(),
  industry: z.string().optional(),
})

const BodySchema = z.union([NewSchema, LegacySchema])

export async function POST(req: NextRequest) {
  const startTime = Date.now()

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Body JSON invalide' }, { status: 400 })
  }

  const parsed = BodySchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Paramètres invalides', details: parsed.error.flatten() }, { status: 422 })
  }

  const request = normalizeGenerateBody(parsed.data as any)
  const outputId = randomUUID()

  // userId: header x-user-id (new) OR Bearer token (legacy)
  const xUser = req.headers.get('x-user-id')
  const auth = req.headers.get('authorization')
  const userId = xUser ?? (auth ? auth.replace('Bearer ', '') : 'anonymous')

  // DB: always store canonical request
  const { error: insertError } = await supabaseAdmin.from('generations').insert({
    id: outputId,
    user_id: userId,
    request,
    status: 'generating',
    created_at: new Date().toISOString(),
  })

  if (insertError) {
    return NextResponse.json({ error: 'Erreur base de données' }, { status: 500 })
  }

  try {
    const output = await runAgentPipeline(request, outputId, userId)

    await supabaseAdmin.from('generations').update({
      files: output.files,
      validation_score: output.validationScore,
      status: 'completed',
      duration_ms: Date.now() - startTime,
      completed_at: new Date().toISOString(),
    }).eq('id', outputId)

    return NextResponse.json({
      success: true,
      id: outputId,
      files: output.files,
      validationScore: output.validationScore,
      durationMs: Date.now() - startTime,
    }, { status: 200 })

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Erreur inconnue'
    await supabaseAdmin.from('generations').update({
      status: 'failed',
      error_message: message,
      duration_ms: Date.now() - startTime,
    }).eq('id', outputId)

    return NextResponse.json({ error: 'Pipeline échoué', details: message }, { status: 500 })
  }
}

// GET ?id=...
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'Paramètre id manquant' }, { status: 400 })

  const { data, error } = await supabaseAdmin.from('generations').select('*').eq('id', id).single()
  if (error || !data) return NextResponse.json({ error: 'Génération introuvable' }, { status: 404 })

  return NextResponse.json(data, { status: 200 })
}