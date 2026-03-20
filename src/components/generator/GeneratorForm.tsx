// CHEMIN: src/components/generator/GeneratorForm.tsx
'use client'

import { useState, useRef, useEffect } from 'react'
import type { GenerationRequest } from '@/types/generation'
import { useAuth } from '@/hooks/useAuth'
import { useQuota } from '@/hooks/useQuota'
import { Button } from '@/components/ui/Button'
import { Cpu, Layers, Zap, ChevronUp, AlignLeft, Command, Activity, Landmark, Palette, Diamond } from 'lucide-react'
import { STYLES_CONFIG } from '@/config/styles.config'

interface GeneratorFormProps {
  onSubmitOverride?: (req: GenerationRequest) => void
}

const PRESETS = [
  {
    id: 'fintech',
    label: 'SaaS FinTech',
    icon: Landmark,
    desc: 'Data-viz, sécurité, institutionnel.',
    config: {
      prompt: "Architecture d'une plateforme SaaS FinTech. Ton institutionnel, data-viz en temps réel, dashboard analytique, focus sur la sécurité et la conformité.",
      style: 'dark-premium' as const,
      includeThreeD: true,
      animationIntensity: 'subtle' as const
    }
  },
  {
    id: 'studio',
    label: 'Studio Créatif',
    icon: Palette,
    desc: 'Asymétrie, scroll, typo.',
    config: {
      prompt: "Portfolio créatif pour une agence de design SOTD. Typographie asymétrique, défilement horizontal fluide, mise en avant visuelle très forte.",
      style: 'scroll-reveal' as const,
      includeThreeD: false,
      animationIntensity: 'intense' as const
    }
  },
  {
    id: 'luxury',
    label: 'E-Commerce Luxe',
    icon: Diamond,
    desc: 'Produit 3D, premium, feutré.',
    config: {
      prompt: "Boutique e-commerce ultra-premium pour de l'horlogerie de luxe. Présentation de produit en 3D interactive, tons sombres, ambiance feutrée.",
      style: '3d-immersive' as const,
      includeThreeD: true,
      animationIntensity: 'moderate' as const
    }
  }
]

export function GeneratorForm({ onSubmitOverride }: GeneratorFormProps) {
  const { isAuthenticated, signIn } = useAuth()
  const { canGenerate } = useQuota()
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  
  const [formData, setFormData] = useState<GenerationRequest>({
    prompt: '', 
    style: 'dark-premium', 
    animationIntensity: 'moderate', 
    includeThreeD: false
  })
  const [isLoading, setIsLoading] = useState(false)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [isFocused, setIsFocused] = useState(false)

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 350)}px`
    }
  }, [formData.prompt])

  const isValid = formData.prompt.length >= 10 && canGenerate

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isAuthenticated) { signIn('google'); return }
    if (!isValid) return
    
    if (onSubmitOverride) {
      setIsLoading(true)
      onSubmitOverride(formData)
    }
  }

  const currentStyleConfig = STYLES_CONFIG.find(s => s.id === formData.style)
  const currentStyleLabel = currentStyleConfig?.label || 'Topologie'

  return (
    <div className="w-full mx-auto flex flex-col relative group animate-slide-up">
      
      {/* Lueur de Focus Atmosphérique */}
      <div 
        className={`absolute -inset-[1px] bg-white/[0.04] rounded-[18px] blur-xl transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] pointer-events-none will-change-transform ${
          isFocused ? 'opacity-100 scale-105' : 'opacity-0 scale-100'
        }`} 
        aria-hidden="true" 
      />

      {/* 1. LE MONOLITHE (Saisie & Configuration) */}
      <form 
        onSubmit={handleSubmit}
        className={`premium-glass relative flex flex-col w-full rounded-[16px] transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ring-1 ${
          isFocused ? 'ring-white/[0.15] shadow-[0_0_40px_rgba(255,255,255,0.03)]' : 'ring-white/0'
        } ${isLoading ? 'opacity-50 pointer-events-none' : ''}`}
      >
        
        {/* Zone de Saisie Sémantique */}
        <div className="p-1 relative z-10">
          <textarea
            ref={textareaRef}
            required
            rows={2}
            placeholder="Ex: Architecture d'une plateforme SaaS FinTech. Ton institutionnel, data-viz en temps réel, focus sur la sécurité..."
            className="w-full bg-transparent text-[14px] text-white placeholder-[#555555] p-5 resize-none outline-none min-h-[120px] leading-relaxed font-medium transition-colors"
            value={formData.prompt}
            onChange={(e) => setFormData({ ...formData, prompt: e.target.value })}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            onKeyDown={(e) => { 
              if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) { 
                e.preventDefault()
                handleSubmit(e) 
              } 
            }}
            disabled={isLoading}
            spellCheck="false"
          />
        </div>

        {/* DOCK D'ORCHESTRATION */}
        <div className="flex flex-wrap items-center justify-between p-2.5 border-t border-white/[0.06] bg-black/40 rounded-b-[16px] relative z-20 gap-4 backdrop-blur-md">
          
          <div className="flex flex-wrap items-center gap-2">
            
            {/* DROPDOWN TOPOLOGIE */}
            <div className="relative shrink-0">
              <button
                type="button"
                disabled={isLoading}
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className={`flex items-center gap-2.5 bg-[#050505] hover:bg-[#111111] border ${isDropdownOpen ? 'border-white/[0.25]' : 'border-white/[0.08]'} hover:border-white/[0.15] text-[#E0E0E0] text-[12px] font-medium rounded-[8px] px-3 py-2 outline-none transition-all duration-300 shadow-sm focus-visible:ring-1 focus-visible:ring-white/30`}
              >
                <AlignLeft className="w-3.5 h-3.5 text-[#666666]" />
                <span>{currentStyleLabel}</span>
                <ChevronUp className={`w-3.5 h-3.5 text-[#666666] transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Menu SOTD Flottant (Bottom-Up) */}
              {isDropdownOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setIsDropdownOpen(false)} />
                  <div className="absolute bottom-full mb-3 left-0 w-[260px] bg-[#050505] rounded-[12px] overflow-hidden z-50 animate-slide-up origin-bottom-left p-1.5 shadow-[0_10px_40px_rgba(0,0,0,0.9)] border border-white/[0.12] flex flex-col gap-0.5">
                    {STYLES_CONFIG.map(s => {
                      const isActive = formData.style === s.id;
                      return (
                        <button
                          key={s.id}
                          type="button"
                          onClick={() => { setFormData({...formData, style: s.id}); setIsDropdownOpen(false); }}
                          className={`w-full text-left px-3 py-2.5 rounded-[8px] transition-all duration-200 flex items-center justify-between group outline-none ${
                            isActive 
                              ? 'bg-white/[0.08] text-white' 
                              : 'text-[#A0A0A0] hover:bg-white/[0.04] hover:text-white'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <span className={`text-base transition-all duration-300 ${isActive ? 'grayscale-0 opacity-100' : 'grayscale opacity-50 group-hover:grayscale-0 group-hover:opacity-100'}`}>
                              {s.emoji}
                            </span>
                            <div className="flex flex-col items-start gap-0.5">
                              <span className="text-[12px] font-medium leading-none">{s.label}</span>
                              <span className="text-[10px] font-mono text-[#666666] group-hover:text-[#A0A0A0] transition-colors">{s.estimatedValue}</span>
                            </div>
                          </div>
                          {isActive && <div className="w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)] shrink-0" />}
                        </button>
                      )
                    })}
                  </div>
                </>
              )}
            </div>

            <div className="w-px h-4 bg-white/[0.08] shrink-0 mx-1" />

            {/* TOGGLE WEBGL */}
            <button
              type="button"
              role="switch"
              aria-checked={formData.includeThreeD}
              disabled={isLoading}
              onClick={() => setFormData({...formData, includeThreeD: !formData.includeThreeD})}
              className={`shrink-0 flex items-center gap-2 px-3 py-2 rounded-[8px] text-[12px] font-medium transition-all duration-300 border outline-none focus-visible:ring-1 focus-visible:ring-white/30 ${
                formData.includeThreeD 
                  ? 'bg-white/[0.08] text-white border-white/[0.2] shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]' 
                  : 'bg-transparent border-transparent text-[#888888] hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              <Layers className="w-3.5 h-3.5" /> Moteur WebGL
              {formData.includeThreeD && <span className="w-1.5 h-1.5 rounded-full bg-white ml-1 shadow-[0_0_8px_rgba(255,255,255,0.5)]" />}
            </button>

            {/* TOGGLE GSAP */}
            <button
              type="button"
              role="switch"
              aria-checked={formData.animationIntensity === 'intense'}
              disabled={isLoading}
              onClick={() => setFormData({...formData, animationIntensity: formData.animationIntensity === 'intense' ? 'subtle' : 'intense'})}
              className={`shrink-0 flex items-center gap-2 px-3 py-2 rounded-[8px] text-[12px] font-medium transition-all duration-300 border outline-none focus-visible:ring-1 focus-visible:ring-white/30 ${
                formData.animationIntensity === 'intense' 
                  ? 'bg-white/[0.08] text-white border-white/[0.2] shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]' 
                  : 'bg-transparent border-transparent text-[#888888] hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              <Zap className="w-3.5 h-3.5" /> Cinématique GSAP
              {formData.animationIntensity === 'intense' && <span className="w-1.5 h-1.5 rounded-full bg-white ml-1 shadow-[0_0_8px_rgba(255,255,255,0.5)]" />}
            </button>
          </div>

          {/* ACTION PRINCIPALE : Rigueur Mécanique */}
          <Button 
            type="submit" 
            variant="primary" 
            size="md" 
            className="shrink-0 font-bold px-6 rounded-[8px] ml-auto" 
            isLoading={isLoading}
            disabled={!isValid || isLoading}
          >
            {!isLoading && <Cpu className="w-4 h-4" />}
            {isLoading ? 'Compilation...' : 'Initialiser'}
          </Button>
          
        </div>
      </form>

      {/* 2. LES MATRICES PRÉ-CALIBRÉES : Flex Horizontal Forcé */}
      <div className={`mt-6 flex flex-col gap-3 transition-all duration-500 ease-out delay-150 ${isLoading ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
        
        <div className="flex items-center gap-3 px-1">
          <div className="h-px w-6 bg-white/[0.08]" />
          <span className="text-[10px] font-mono text-[#666666] uppercase tracking-[0.15em] font-medium">Matrices Pré-calibrées</span>
          <div className="h-px flex-1 bg-gradient-to-r from-white/[0.08] to-transparent" />
        </div>
        
        {/* Force le layout horizontal pour empêcher l'explosion verticale */}
        <div className="flex flex-col sm:flex-row w-full gap-3">
          {PRESETS.map(preset => (
            <button
              key={preset.id}
              type="button"
              onClick={() => setFormData(preset.config)}
              className="flex-1 flex flex-col items-start p-3.5 rounded-[12px] bg-white/[0.01] border border-white/[0.04] hover:bg-white/[0.04] hover:border-white/[0.12] transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group text-left outline-none focus-visible:ring-1 focus-visible:ring-white/30 active:scale-[0.98] will-change-transform"
            >
              <div className="flex items-center gap-2 mb-2">
                <preset.icon className="w-3.5 h-3.5 text-[#555555] group-hover:text-white transition-colors duration-300" />
                <span className="text-[12px] font-medium text-[#A0A0A0] group-hover:text-white transition-colors duration-300">
                  {preset.label}
                </span>
              </div>
              <span className="text-[11px] text-[#555555] group-hover:text-[#888888] leading-snug line-clamp-2 transition-colors duration-300">
                {preset.desc}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* 3. STATUT SYSTÈME & RACCOURCIS */}
      <div className="mt-6 w-full flex flex-col sm:flex-row items-center justify-between px-1 gap-4 sm:gap-0">
        <div className="flex items-center gap-2 text-[10px] text-[#444444] font-mono uppercase tracking-widest">
          <Activity className="w-3 h-3 text-[#666666] animate-pulse" />
          Sys.Status : Prêt pour l'orchestration
        </div>
        
        <div className="text-[10px] font-mono text-[#555555] uppercase tracking-widest flex items-center gap-2">
          Exécuter via <kbd className="bg-[#050505] border border-white/[0.08] px-2 py-1 rounded-[4px] text-[#A0A0A0] flex items-center gap-1 shadow-sm"><Command className="w-3 h-3" /> Entrée</kbd>
        </div>
      </div>
      
    </div>
  )
}