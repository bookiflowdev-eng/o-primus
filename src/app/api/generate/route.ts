import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { v4 as uuidv4 } from 'uuid'
import { supabaseAdmin } from '@/lib/supabase'
import { runGenerationPipeline } from '@/lib/pipeline/pipeline-runner'
import type { GenerationJob } from '@/types/domain'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { checkAndDecrementQuota } from '@/lib/quota'
import { unstable_after as after } from 'next/server'

const GenerateRequestSchema = z.object({
  prompt: z.string().min(10),
  industry: z.string().optional(),
  businessModel: z.string().optional(),
  companyStage: z.string().optional(),
  style: z.string().optional(),
  animationIntensity: z.enum(['subtle', 'moderate', 'intense']).optional(),
  includeThreeD: z.boolean().optional(),
  colorPreference: z.string().optional(),
  targetAudience: z.string().optional(),
})

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const userId = session?.user && (session.user as any).id

    if (!userId) {
      return NextResponse.json({ error: 'Accès refusé. Authentification requise.' }, { status: 401 })
    }

    const body = await req.json()
    const validated = GenerateRequestSchema.parse(body)

    const canGenerate = await checkAndDecrementQuota(userId)
    if (!canGenerate) {
      return NextResponse.json({ error: 'Quota épuisé. Veuillez upgrader votre plan.' }, { status: 402 })
    }

    const jobId = uuidv4()
    const job: GenerationJob = {
      id: jobId,
      userId,
      request: validated,
      status: 'queued',
      currentStep: 0,
      completedSteps: [],
      failedSteps: [],
      correctionRound: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    const { error: dbError } = await supabaseAdmin.from('jobs').insert({
      id: jobId,
      user_id: userId,
      status: 'queued',
      request: validated,
      created_at: job.createdAt,
      updated_at: job.updatedAt,
    })

    if (dbError) {
      console.error('[Generate API] DB Error:', dbError)
      return NextResponse.json({ error: 'Erreur d\'initialisation' }, { status: 500 })
    }

    // Exécution isolée garantissant l'intégrité de la promesse hors du scope HTTP Vercel
    after(async () => {
      try {
        await executeJobAsync(job)
      } catch (err) {
        console.error(`[Background] Crash fatal pour le job ${jobId}:`, err)
      }
    })

    return NextResponse.json({ jobId, status: 'queued', pollUrl: `/api/jobs/${jobId}` }, { status: 202 })
  } catch (error) {
    const err = error instanceof z.ZodError
      ? { error: 'Validation échouée', details: error.errors }
      : { error: error instanceof Error ? error.message : 'Erreur inattendue' }
    return NextResponse.json(err, { status: 400 })
  }
}

async function executeJobAsync(job: GenerationJob): Promise<void> {
  try {
    const context = await runGenerationPipeline(job)
    const output = context.agentStates['code-orchestrator']?.payload || {}
    const validation = context.agentStates['quality-validator']?.payload?.validationScore

    await supabaseAdmin.from('jobs').update({
      status: 'completed',
      current_step: 6,
      generated_files: output.generatedFiles || {},
      validation_score: validation || null,
      updated_at: new Date().toISOString(),
      completed_at: new Date().toISOString(),
    }).eq('id', job.id)
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error)
    await supabaseAdmin.from('jobs').update({
      status: 'failed',
      error: errorMsg,
      updated_at: new Date().toISOString(),
    }).eq('id', job.id)
  }
}