import { NextRequest, NextResponse } from 'next/server'
import { createCheckoutSession, type PlanKey } from '@/lib/stripe'
import { z } from 'zod'

const schema = z.object({
  planKey: z.enum(['starter', 'pro', 'agency']),
  userId: z.string().min(1),
})

export async function POST(req: NextRequest): Promise<NextResponse> {
  const body = await req.json() as unknown
  const parsed = schema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json({ error: 'Paramètres invalides' }, { status: 400 })
  }

  const { planKey, userId } = parsed.data
  const origin = req.headers.get('origin') ?? 'http://localhost:3000'

  try {
    const url = await createCheckoutSession(
      planKey as PlanKey,
      userId,
      `${origin}/dashboard?success=true`,
      `${origin}/pricing?canceled=true`
    )
    return NextResponse.json({ url })
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Erreur Stripe'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
