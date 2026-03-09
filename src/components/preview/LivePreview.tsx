'use client'

import { MonitorPlay, Layers } from 'lucide-react'

export function LivePreview({ files }: { files: Record<string, string> }) {
  const hasWebGL = !!files['three-scene.tsx']

  return (
    <div className="w-full h-full flex flex-col items-center justify-center relative overflow-hidden bg-[#0a0a0f]">
      {/* Ambiance SOTD Minimaliste */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#050505] to-[#12121a] z-0" />
      <div className="absolute inset-0 bg-[url('/noise.webp')] opacity-[0.03] mix-blend-screen z-0 pointer-events-none" />
      
      {hasWebGL && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60%] h-[60%] bg-indigo-500/20 blur-[150px] rounded-full z-0 pointer-events-none animate-pulse-slow" />
      )}

      <div className="relative z-10 flex flex-col items-center text-center p-8">
        <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-6 shadow-2xl">
          {hasWebGL ? <Layers className="w-8 h-8 text-indigo-400" /> : <MonitorPlay className="w-8 h-8 text-indigo-400" />}
        </div>
        
        <h3 className="text-2xl font-heading font-bold text-white mb-3">
          {hasWebGL ? 'Scène WebGL Assemblée' : 'Architecture DOM Prête'}
        </h3>
        
        <p className="text-sm text-slate-400 max-w-sm leading-relaxed mb-8">
          Afin de garantir la synchronisation stricte du ticker GSAP et prévenir les fuites de VRAM, l'exécution complète du moteur requiert un déploiement local.
        </p>

        <div className="inline-flex flex-col items-center gap-2">
          <div className="inline-flex items-center gap-3 px-4 py-2 rounded-lg bg-black/50 border border-white/10 text-xs font-mono text-slate-300 shadow-inner">
            <span className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.6)] animate-pulse" />
            Compilation Next.js 15 App Router
          </div>
        </div>
      </div>
    </div>
  )
}