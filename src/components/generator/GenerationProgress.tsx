// CHEMIN: src/components/generator/GenerationProgress.tsx
'use client'

import { useEffect, useState } from 'react'
import { Check, Loader2, Circle, AlertCircle } from 'lucide-react'

interface GenerationProgressProps {
  status: string
  currentStep: number
  completedSteps: string[]
  failedSteps?: any[]
  startTime?: number
}

const PIPELINE_STEPS = [
  { id: 'domain-profiler', label: 'Analyse métier', desc: 'Extraction contextuelle et personas' },
  { id: 'design-strategist', label: 'Architecture visuelle', desc: 'Génération du Design System' },
  { id: 'content-architect', label: 'Copywriting domaine', desc: 'Rédaction sémantique anti-cliché' },
  { id: 'animation-engineer', label: 'Animations GSAP', desc: 'Orchestration des timelines' },
  { id: 'three-specialist', label: 'Scène WebGL', desc: 'Création de la dimension spatiale' },
  { id: 'code-orchestrator', label: 'Assemblage Next.js', desc: 'Compilation TypeScript & Tailwind' },
  { id: 'quality-validator', label: 'Audit qualité', desc: 'Vérification Awwwards & a11y' },
]

export function GenerationProgress({ status, currentStep, completedSteps, failedSteps, startTime }: GenerationProgressProps) {
  const [elapsed, setElapsed] = useState(0)

  useEffect(() => {
    if (status !== 'completed' && status !== 'failed') {
      const interval = setInterval(() => {
        setElapsed(Math.floor((Date.now() - (startTime || Date.now())) / 1000))
      }, 1000)
      return () => clearInterval(interval)
    }
  }, [status, startTime])

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60).toString().padStart(2, '0')
    const s = (sec % 60).toString().padStart(2, '0')
    return `${m}:${s}`
  }

  const progressPercent = Math.min(100, Math.max(0, (completedSteps.length / PIPELINE_STEPS.length) * 100))
  const circleCircumference = 2 * Math.PI * 46
  const strokeDashoffset = circleCircumference - (circleCircumference * progressPercent) / 100

  return (
    <div className="w-full flex flex-col gap-12 items-center justify-center p-8 md:p-12 animate-fade-in">
      
      {/* 1. Timer & Jauge (Design Carbone/Blanc) */}
      <div className="flex flex-col items-center gap-6 text-center">
        <div className="relative w-32 h-32 flex items-center justify-center">
          <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100" aria-hidden="true">
            <circle cx="50" cy="50" r="46" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="2" />
            <circle 
              cx="50" cy="50" r="46" 
              fill="none" 
              stroke="#FFFFFF" 
              strokeWidth="2" 
              strokeLinecap="square"
              strokeDasharray={circleCircumference} 
              strokeDashoffset={strokeDashoffset} 
              className="transition-all duration-1000 ease-out"
            />
          </svg>
          
          <div className="flex flex-col items-center justify-center">
            <span className="text-3xl font-mono font-light text-white tracking-tight">
              {Math.floor(progressPercent)}<span className="text-sm text-[#666666]">%</span>
            </span>
          </div>
        </div>
        
        <div className="flex flex-col items-center gap-2">
          <h2 className="text-lg font-mono font-semibold text-[#E0E0E0] tracking-widest uppercase">Orchestration en cours</h2>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-[4px] bg-[#121212] border border-white/[0.08]">
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" aria-hidden="true" />
            <span className="text-[11px] font-mono text-[#A0A0A0]">Sys.Time : {formatTime(elapsed)}</span>
          </div>
        </div>
      </div>

      {/* 2. Liste des agents (Mécanique stricte) */}
      <div className="w-full max-w-md bg-[#050505] p-2 rounded-[8px] border border-white/[0.08] shadow-2xl flex flex-col gap-1">
        {PIPELINE_STEPS.map((step, index) => {
          const isCompleted = completedSteps.includes(step.id)
          const isFailed = failedSteps?.some(f => f.agentId === step.id)
          const isActive = !isCompleted && !isFailed && index === currentStep

          return (
            <div 
              key={step.id} 
              className={`flex items-center justify-between px-4 py-3 rounded-[4px] transition-all duration-300 ${
                isActive ? 'bg-[#111111] border border-white/[0.06]' : 'border border-transparent'
              }`}
            >
              <div className="flex items-center gap-4">
                <div className="shrink-0 w-6 flex justify-center">
                  {isCompleted ? (
                    <Check className="w-4 h-4 text-[#A0A0A0]" />
                  ) : isFailed ? (
                    <AlertCircle className="w-4 h-4 text-red-500" />
                  ) : isActive ? (
                    <Loader2 className="w-4 h-4 text-white animate-spin" />
                  ) : (
                    <Circle className="w-2 h-2 text-[#333333]" />
                  )}
                </div>
                
                <div className="flex flex-col">
                  <span className={`text-[12px] font-medium tracking-wide ${isCompleted ? 'text-[#666666]' : isActive ? 'text-white' : isFailed ? 'text-red-500' : 'text-[#555555]'}`}>
                    {step.label}
                  </span>
                  {isActive && <span className="text-[10px] font-mono text-[#A0A0A0] mt-0.5">{step.desc}</span>}
                </div>
              </div>
              
              {isActive && (
                <span className="text-[9px] font-mono uppercase tracking-widest text-white border border-white/20 bg-white/5 px-2 py-0.5 rounded-[3px] animate-pulse">
                  Processing
                </span>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}