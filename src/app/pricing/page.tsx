'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const PLANS = [
  {
    key: 'starter',
    name: 'Starter',
    price: 19,
    generations: 5,
    description: 'Parfait pour les indépendants et les petits projets.',
    features: ['5 Générations par mois', 'Export Next.js & Tailwind', 'Support communautaire'],
    popular: false,
  },
  {
    key: 'pro',
    name: 'Pro',
    price: 49,
    generations: 30,
    description: 'Pour les designers et les agences en pleine croissance.',
    features: ['30 Générations par mois', 'Animations GSAP Avancées', 'Intégration WebGL (Three.js)', 'Support prioritaire'],
    popular: true,
  },
  {
    key: 'agency',
    name: 'Agency',
    price: 149,
    generations: 999,
    description: 'Volume illimité pour les grandes équipes.',
    features: ['Générations illimitées (999)', 'Modèles privés (Fine-tuning)', 'Accès API complet', 'Account Manager dédié'],
    popular: false,
  },
]

export default function PricingPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleSubscribe = async (planKey: string) => {
    // Si non connecté, on force la redirection vers notre page /auth
    if (!session?.user) {
      router.push('/auth?callbackUrl=/pricing')
      return
    }

    setLoadingPlan(planKey)
    setError(null)

    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planKey, userId: (session.user as any).id }),
      })

      const data = await res.json()
      
      if (!res.ok) throw new Error(data.error || 'Erreur lors de la création de la session Stripe')
      
      // Redirection vers l'URL Stripe Checkout
      if (data.url) window.location.href = data.url
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue.')
      setLoadingPlan(null)
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex flex-col pt-32 pb-24 px-6 relative">
      {/* Navbar simplifiée pour ne pas perdre l'utilisateur */}
      <header className="absolute top-0 left-0 w-full p-6 flex justify-center md:justify-start">
        <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
            <span className="text-white font-bold text-xl">O</span>
          </div>
          <span className="text-xl font-heading font-semibold text-white tracking-wide">Primus</span>
        </Link>
      </header>

      <div className="max-w-7xl mx-auto w-full relative z-10">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-heading font-bold text-white mb-6">
            Des tarifs simples,<br className="hidden md:block" /> conçus pour l'excellence.
          </h1>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto">
            Libérez la puissance de l'agent Gemini 3.1 Pro. Générez des landing pages niveau Awwwards en quelques secondes et exportez un code de production.
          </p>
        </div>

        {error && (
          <div className="mb-8 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-center max-w-md mx-auto">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch max-w-5xl mx-auto">
          {PLANS.map((plan) => (
            <div 
              key={plan.key}
              className={`relative flex flex-col glass-panel rounded-3xl p-8 transition-transform hover:scale-[1.02] ${
                plan.popular ? 'border-primary/50 shadow-[0_0_40px_rgba(99,102,241,0.15)]' : 'border-white/10'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-primary to-secondary text-white text-xs font-bold uppercase tracking-wider">
                  Le plus populaire
                </div>
              )}

              <div className="mb-8">
                <h3 className="text-2xl font-heading font-semibold text-white mb-2">{plan.name}</h3>
                <p className="text-slate-400 text-sm h-10">{plan.description}</p>
              </div>

              <div className="mb-8 flex items-baseline gap-2">
                <span className="text-5xl font-heading font-bold text-white">${plan.price}</span>
                <span className="text-slate-500">/mois</span>
              </div>

              <ul className="flex flex-col gap-4 mb-8 flex-1">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-primary shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-sm text-slate-300">{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleSubscribe(plan.key)}
                disabled={loadingPlan === plan.key}
                className={`w-full py-4 rounded-xl font-medium flex items-center justify-center gap-2 transition-all ${
                  plan.popular 
                    ? 'bg-primary text-white hover:bg-indigo-500 hover:shadow-[0_0_20px_rgba(99,102,241,0.4)]' 
                    : 'glass text-white hover:bg-white/10'
                }`}
              >
                {loadingPlan === plan.key ? (
                  <svg className="animate-spin h-5 w-5 text-current" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                ) : (
                  <span>{session?.user ? 'S\'abonner' : 'Se connecter pour continuer'}</span>
                )}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}