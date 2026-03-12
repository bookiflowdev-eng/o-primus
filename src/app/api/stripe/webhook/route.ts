import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { resetQuota, type PlanKey } from '@/lib/quota'
import type Stripe from 'stripe'

export const runtime = 'nodejs'

export async function POST(req: NextRequest): Promise<NextResponse> {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

  if (!sig || !webhookSecret) {
    return NextResponse.json({ error: 'Signature manquante' }, { status: 400 })
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret)
  } catch {
    return NextResponse.json({ error: 'Signature invalide' }, { status: 400 })
  }

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session
      const userId = session.metadata?.userId
      const planKey = session.metadata?.planKey as PlanKey

      if (userId && planKey) {
        await resetQuota(userId, planKey)
      }
      break
    }

    case 'customer.subscription.deleted': {
      const subscription = event.data.object as Stripe.Subscription
      const userId = subscription.metadata?.userId
      if (userId) {
        await resetQuota(userId, 'starter')
      }
      break
    }

    case 'invoice.payment_failed': {
      // Log uniquement — pas de blocage immédiat
      console.error('[Stripe Webhook] Paiement échoué:', event.data.object)
      break
    }
  }

  return NextResponse.json({ received: true })
}
