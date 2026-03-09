// CHEMIN: src/app/dashboard/page.tsx
'use client'

import { useAuth } from '@/hooks/useAuth'
import { AppShell } from '@/components/layout/AppShell'
import { GeneratorForm } from '@/components/generator/GeneratorForm'

export default function DashboardPage() {
  const { isAuthenticated } = useAuth()

  if (!isAuthenticated) {
    return (
      <div className="h-screen w-full bg-[#000000] flex items-center justify-center font-mono text-[12px] text-[#666666]">
        Accès restreint. Séquence d'authentification requise.
      </div>
    )
  }

  return (
    <AppShell>
      {/* Grille structurelle SOTD */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" aria-hidden="true" />
      
      {/* HALO TITANE PUR : Centrage absolu */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60vw] h-[60vh] bg-white/[0.02] blur-[120px] rounded-full pointer-events-none" aria-hidden="true" />

      {/* CONTENEUR MAÎTRE : Centrage flex parfait sans marge négative parasite */}
      <div className="w-full h-full flex flex-col items-center justify-center relative p-6">
        <div className="w-full max-w-3xl flex flex-col items-center relative z-10">
          
          <div className="mb-12 flex flex-col items-center text-center animate-slide-up">
            <h1 className="text-4xl md:text-5xl font-heading font-semibold text-metal tracking-tight mb-4">
              Paramètres d'Orchestration.
            </h1>
            <p className="text-[14px] text-[#888888] max-w-lg leading-relaxed">
              O-Primus compile votre directive sémantique en une architecture React, une cinématique GSAP et des shaders WebGL de classe mondiale.
            </p>
          </div>

          <GeneratorForm 
            onSubmitOverride={async (req) => {
              const res = await fetch('/api/generate', { method: 'POST', body: JSON.stringify(req) })
              const data = await res.json()
              if (data.jobId) {
                window.location.href = `/result/${data.jobId}`
              }
            }} 
          />

        </div>
      </div>
    </AppShell>
  )
}