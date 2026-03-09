import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  const { id } = await params

  if (!id) {
    return NextResponse.json({ error: 'jobId missing' }, { status: 400 })
  }

  const session = await getServerSession(authOptions)
  const userId = session?.user ? (session.user as any).id : null

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { data: job, error } = await supabaseAdmin
      .from('jobs')
      .select('*')
      .eq('id', id)
      .single()

    if (error || !job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 })
    }

    if (job.user_id !== userId) {
      return NextResponse.json({ error: 'Access denied (IDOR protection)' }, { status: 403 })
    }

    return NextResponse.json({
      jobId:          job.id,
      userId:         job.user_id,
      status:         job.status,
      currentStep:    job.current_step ?? 0,
      completedSteps: job.completed_steps ?? [],
      generatedFiles: job.generated_files ?? null,
      validationScore:job.validation_score ?? null,
      error:          job.error ?? null,
      createdAt:      job.created_at,
      updatedAt:      job.updated_at,
      completedAt:    job.completed_at ?? null,
      estimatedValue: job.validation_score?.estimatedValue ?? null,
    })

  } catch (err) {
    const message = err instanceof Error ? err.message : 'Server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  const { id } = await params
  const session = await getServerSession(authOptions)
  const userId = session?.user ? (session.user as any).id : null
  
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { data: job } = await supabaseAdmin.from('jobs').select('user_id').eq('id', id).single()
    if (!job || job.user_id !== userId) {
       return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    const { error } = await supabaseAdmin.from('jobs').delete().eq('id', id)
    if (error) throw error

    return NextResponse.json({ deleted: true })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Deletion failed'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}