'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function AuthPage() {
  const [isLoading, setIsLoading] = useState<'google' | 'github' | null>(null)

  const handleLogin = async (provider: 'google' | 'github') => {
    setIsLoading(provider)
    await signIn(provider, { callbackUrl: '/dashboard' })
    // We don't necessarily reset loading here because we expect a redirect 
    // from next-auth which will unmount the component.
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-[#0a0a0f] selection:bg-indigo-500/30">
      
      {/* Background Ambience */}
      <div className="absolute inset-0 bg-[url('/noise.webp')] opacity-[0.015] mix-blend-screen pointer-events-none" aria-hidden="true" />
      <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-indigo-600/10 blur-[120px] rounded-full pointer-events-none" aria-hidden="true" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-purple-600/10 blur-[120px] rounded-full pointer-events-none" aria-hidden="true" />

      {/* Navigation de retour */}
      <Link 
        href="/" 
        className="absolute top-8 left-8 flex items-center gap-2 text-slate-400 hover:text-white transition-colors z-20 group focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded-lg px-3 py-2"
        aria-label="Retour au site public"
      >
        <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" aria-hidden="true" />
        <span className="text-sm font-medium">Retour au site</span>
      </Link>

      <main className="w-full max-w-md px-6 relative z-10 flex flex-col items-center">
        <div className="glass-panel p-10 md:p-12 rounded-[2.5rem] flex flex-col items-center text-center shadow-2xl border-white/10 w-full">
          
          {/* Logo */}
          <div 
            className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center shadow-[0_0_40px_rgba(99,102,241,0.3)] mb-8"
            aria-hidden="true"
          >
            <span className="text-white font-bold text-3xl leading-none">O</span>
          </div>
          
          {/* Titre et sous-titre */}
          <h1 className="text-3xl font-heading font-semibold text-white mb-3 tracking-tight">
            Bienvenue.
          </h1>
          <p className="text-slate-400 text-sm mb-10 leading-relaxed">
            Connectez-vous pour accéder au studio O-Primus et configurer vos agents d'architecture web.
          </p>

          {/* Boutons d'authentification */}
          <div className="w-full flex flex-col gap-4">
            <button
              onClick={() => handleLogin('github')}
              disabled={isLoading !== null}
              className="relative flex items-center justify-center gap-3 w-full px-6 py-4 rounded-xl bg-[#24292e] hover:bg-[#2f363d] text-white font-medium transition-all duration-300 disabled:opacity-50 hover:scale-[1.02] active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
              aria-label="Se connecter avec GitHub"
            >
              {isLoading === 'github' ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" aria-hidden="true" />
              ) : (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
              )}
              <span>Continuer avec GitHub</span>
            </button>

            <button
              onClick={() => handleLogin('google')}
              disabled={isLoading !== null}
              className="relative flex items-center justify-center gap-3 w-full px-6 py-4 rounded-xl bg-white hover:bg-slate-100 text-black font-medium transition-all duration-300 disabled:opacity-50 hover:scale-[1.02] active:scale-[0.98] shadow-[0_0_20px_rgba(255,255,255,0.05)] focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
              aria-label="Se connecter avec Google"
            >
              {isLoading === 'google' ? (
                <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" aria-hidden="true" />
              ) : (
                <svg className="w-5 h-5" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
              )}
              <span>Continuer avec Google</span>
            </button>
          </div>
          
          {/* Légal */}
          <p className="mt-10 text-[11px] text-slate-500 max-w-[280px] leading-relaxed">
            En continuant, vous acceptez nos <Link href="/terms" className="underline hover:text-white transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-indigo-500">Conditions d'utilisation</Link> et notre <Link href="/privacy" className="underline hover:text-white transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-indigo-500">Politique de confidentialité</Link>.
          </p>
        </div>
      </main>
    </div>
  )
}