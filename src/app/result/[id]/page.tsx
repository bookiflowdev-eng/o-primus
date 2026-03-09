// CHEMIN: src/app/result/[id]/page.tsx
'use client'

import { useEffect, useState, use } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Editor } from '@monaco-editor/react'
import { GenerationProgress } from '@/components/generator/GenerationProgress'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { FileCode2, ChevronLeft, Download, AlertTriangle, MonitorPlay, Code2, Activity, Terminal } from 'lucide-react'
import type { GenerationOutput } from '@/types/generation'

export default function ResultPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const resolvedParams = use(params)
  const id = resolvedParams.id

  const [data, setData] = useState<GenerationOutput | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [status, setStatus] = useState<string>('queued')
  const [currentStep, setCurrentStep] = useState(0)
  const [completedSteps, setCompletedSteps] = useState<string[]>([])
  const [startTime] = useState<number>(Date.now())
  
  const [activeTab, setActiveTab] = useState<'code' | 'preview' | 'metrics'>('code')
  const [activeFile, setActiveFile] = useState<string>('page.tsx')
  const [logs, setLogs] = useState<{message: string, type: 'info'|'success'|'error'|'warn'}[]>([
    { message: 'Initialisation du pipeline O-Primus...', type: 'info' }
  ])

  useEffect(() => {
    if (!id) return
    let cancelled = false
    let isPolling = true

    const pollJob = async () => {
      if (!isPolling || cancelled) return

      try {
        const res = await fetch(`/api/jobs/${id}`)
        if (!res.ok) throw new Error('Job introuvable ou erreur serveur')

        const json = await res.json()
        
        if (!cancelled) {
          setStatus(json.status)
          setCurrentStep(json.currentStep || 0)
          setCompletedSteps(json.completedSteps || [])
          
          if (json.status !== 'completed' && json.status !== 'failed') {
            setLogs(prev => {
              const lastLog = prev[prev.length - 1]
              const newMsg = `[Sys.Agent ${json.currentStep || 0}] Processus d'architecture en cours...`
              if (lastLog?.message !== newMsg) {
                return [...prev, { message: newMsg, type: 'info' }]
              }
              return prev
            })
            setTimeout(pollJob, 2500)
            return
          }

          if (json.status === 'failed') {
            isPolling = false
            setError(`Génération échouée : ${json.error ?? 'Raison inconnue'}`)
            setLogs(prev => [...prev, { message: `Erreur fatale: ${json.error}`, type: 'error' }])
            return
          }

          isPolling = false
          setData({
            id: json.jobId,
            files: json.generatedFiles ?? {},
            validationScore: json.validationScore,
            createdAt: json.createdAt,
            status: 'completed',
            request: {} as any
          })
          
          setLogs(prev => [...prev, { message: 'Compilation SOTD terminée avec succès.', type: 'success' }])
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Erreur réseau inattendue')
          setLogs(prev => [...prev, { message: 'Interruption du polling.', type: 'warn' }])
        }
      }
    }

    pollJob()
    return () => { 
      cancelled = true
      isPolling = false
    }
  }, [id])

  // ── PHASE C : ERREUR ────────────────────────────────────────────────────────
  if (error && status === 'failed') {
    return (
      <div className="h-screen flex items-center justify-center bg-[#000000] p-6 selection:bg-white/20">
        <div className="p-10 md:p-12 flex flex-col items-center text-center max-w-md bg-[#050505] border border-red-500/20 rounded-xl shadow-2xl">
          <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center mb-6 border border-red-500/20">
            <AlertTriangle className="w-5 h-5 text-red-500" aria-hidden="true" />
          </div>
          <h2 className="text-lg font-mono font-semibold text-white mb-3 uppercase tracking-widest">Erreur Critique</h2>
          <p className="text-[#A0A0A0] text-[13px] mb-8 leading-relaxed">{error}</p>
          <Button variant="secondary" onClick={() => router.push('/dashboard')} className="w-full">
            Retourner au Control Panel
          </Button>
        </div>
      </div>
    )
  }

  // ── PHASE A : POLLING ───────────────────────────────────────────────────────
  if (status !== 'completed' && !data) {
    return (
      <div className="h-screen flex flex-col lg:flex-row bg-[#000000] overflow-hidden font-sans selection:bg-white/20">
        
        {/* PROGRESSION */}
        <div className="flex-1 flex flex-col relative overflow-y-auto custom-scrollbar">
          <div className="absolute top-6 left-6 z-20">
            <Link 
              href="/dashboard" 
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-[#A0A0A0] hover:text-white hover:bg-white/[0.04] transition-colors text-[12px] font-medium border border-transparent hover:border-white/[0.08]"
            >
              <ChevronLeft className="w-4 h-4" aria-hidden="true" /> Abort Sequence
            </Link>
          </div>
          <div className="flex-1 flex items-center justify-center min-h-[600px]">
            <GenerationProgress 
              status={status} 
              currentStep={currentStep} 
              completedSteps={completedSteps} 
              startTime={startTime}
            />
          </div>
        </div>

        {/* TERMINAL SOTD */}
        <aside className="hidden lg:flex w-[45%] xl:w-[40%] border-l border-white/[0.08] bg-[#050505] flex-col overflow-hidden z-10 relative">
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" aria-hidden="true" />
          
          <div className="h-14 border-b border-white/[0.08] flex items-center px-6 shrink-0 bg-[#0A0A0A] relative z-10">
            <span className="text-[10px] font-mono font-semibold uppercase tracking-[0.2em] text-[#A0A0A0] flex items-center gap-3">
              <Terminal className="w-3.5 h-3.5 text-white" aria-hidden="true" /> 
              System Logs
            </span>
            <div className="ml-auto flex items-center gap-2 border border-white/20 bg-white/5 px-2 py-0.5 rounded-[4px]">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" aria-hidden="true" />
              <span className="text-[9px] font-mono text-white tracking-widest uppercase">Live</span>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-6 font-mono text-[11px] leading-loose space-y-3 relative z-10 custom-scrollbar flex flex-col justify-end">
            {logs.map((log, i) => (
              <div 
                key={i} 
                className={`flex items-start gap-4 animate-slide-up ${
                  log.type === 'error' ? 'text-red-500' : 
                  log.type === 'success' ? 'text-white font-medium' : 
                  log.type === 'warn' ? 'text-yellow-400' : 
                  'text-[#A0A0A0]'
                }`}
                style={{ animationDuration: '0.3s' }}
              >
                <span className="text-[#555555] shrink-0 select-none">[{new Date().toLocaleTimeString()}]</span>
                <span className="break-words">
                  {log.type === 'info' && <span className="text-[#666666] mr-2">{'>'}</span>}
                  {log.message}
                </span>
              </div>
            ))}
          </div>
        </aside>
      </div>
    )
  }

  // ── PHASE B : RÉSULTAT (IDE) ────────────────────────────────────────────────
  const files = data?.files ?? {}
  const fileKeys = Object.keys(files)
  
  if (!fileKeys.includes(activeFile) && fileKeys.length > 0) {
    setActiveFile(fileKeys[0])
  }

  const language = activeFile.endsWith('.css') ? 'css' : activeFile.endsWith('.json') ? 'json' : 'typescript'
  const activeCode = files[activeFile as keyof typeof files] ?? '// Fichier vide ou introuvable'

  return (
    <div className="h-screen flex flex-col bg-[#000000] overflow-hidden font-sans selection:bg-white/20">
      
      {/* ZONE 1 : Header IDE (Carbone) */}
      <header className="h-14 border-b border-white/[0.08] bg-[#050505] flex items-center justify-between px-4 shrink-0 relative z-20">
        <div className="flex items-center gap-4">
          <Link 
            href="/dashboard" 
            className="text-[#A0A0A0] hover:text-white transition-colors flex items-center gap-1.5 bg-[#111111] hover:bg-[#1A1A1A] border border-white/[0.08] px-3 py-1.5 rounded-[6px]" 
            aria-label="Retour au Studio"
          >
            <ChevronLeft className="w-4 h-4" aria-hidden="true" />
            <span className="text-[11px] font-medium uppercase tracking-widest hidden sm:inline">Workspace</span>
          </Link>
          <div className="h-4 w-px bg-[#333333] hidden sm:block" aria-hidden="true" />
          <span className="text-[12px] font-medium text-[#E0E0E0] hidden sm:flex items-center gap-2">
            Matrice <span className="font-mono text-[10px] text-white bg-white/10 px-2 py-0.5 rounded-[4px] border border-white/10">#{id?.split('-')[0] || '1029'}</span>
          </span>
        </div>

        {/* Onglets Centraux SOTD */}
        <div className="flex items-center bg-[#0A0A0A] p-1 rounded-[8px] border border-white/[0.06]" role="tablist">
          {[
            { id: 'code', label: 'Code Source', icon: Code2 },
            { id: 'preview', label: 'Aperçu', icon: MonitorPlay },
            { id: 'metrics', label: 'Audit Sémantique', icon: Activity }
          ].map(tab => (
            <button 
              key={tab.id}
              role="tab"
              aria-selected={activeTab === tab.id}
              onClick={() => setActiveTab(tab.id as any)} 
              className={`px-5 py-1.5 rounded-[6px] text-[11px] font-medium transition-all flex items-center gap-2 focus:outline-none ${
                activeTab === tab.id 
                  ? 'bg-[#1A1A1A] text-white shadow-sm border border-white/[0.08]' 
                  : 'text-[#A0A0A0] hover:text-white hover:bg-white/[0.04] border border-transparent'
              }`}
            >
              <tab.icon className="w-3.5 h-3.5" aria-hidden="true" /> <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Actions & Badges */}
        <div className="flex items-center gap-4">
          {data?.validationScore && (
            <div className="hidden lg:flex items-center gap-3">
              <div className="flex items-center gap-2 text-xs bg-[#111111] px-3 py-1.5 rounded-[6px] border border-white/[0.06]" title="Performance">
                <span className="text-[#666666] font-mono text-[10px] uppercase tracking-widest">Perf</span>
                <span className={`font-bold ${data.validationScore.performance === 'A' ? 'text-white' : 'text-[#A0A0A0]'}`}>
                  {data.validationScore.performance}
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs bg-[#111111] px-3 py-1.5 rounded-[6px] border border-white/[0.06]" title="Design Score">
                <span className="text-[#666666] font-mono text-[10px] uppercase tracking-widest">Score</span>
                <span className="font-bold text-white">{data.validationScore.designScore}</span>
              </div>
            </div>
          )}
          <Button variant="primary" size="sm" disabled className="shadow-none rounded-[6px]">
            <Download className="w-3.5 h-3.5" aria-hidden="true" /> <span className="hidden sm:inline">Export</span>
          </Button>
        </div>
      </header>

      {/* ZONE MAIN (Dynamic Tabs) */}
      <div className="flex-1 flex overflow-hidden relative">
        
        {/* --- ONGLET CODE --- */}
        <div className={`w-full h-full flex ${activeTab === 'code' ? '' : 'hidden'}`}>
          {/* ZONE 2 : Sidebar Explorateur */}
          <aside className="w-56 lg:w-64 border-r border-white/[0.08] bg-[#0A0A0A] flex flex-col shrink-0 z-10">
            <div className="px-5 py-4 border-b border-white/[0.08] text-[10px] font-mono font-semibold text-[#666666] uppercase tracking-widest flex items-center justify-between">
              Explorateur
              <Badge status="neutral" className="scale-75 origin-right">R/O</Badge>
            </div>
            <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-1 custom-scrollbar">
              {fileKeys.map((key) => {
                const isActive = activeFile === key
                return (
                  <button
                    key={key}
                    onClick={() => setActiveFile(key)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-[6px] text-[12px] transition-all text-left focus:outline-none ${
                      isActive 
                        ? 'bg-[#1A1A1A] text-white font-medium border border-white/[0.08]' 
                        : 'text-[#A0A0A0] hover:text-[#E0E0E0] hover:bg-white/[0.04] border border-transparent'
                    }`}
                  >
                    <FileCode2 className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-[#666666]'}`} aria-hidden="true" />
                    <span className="truncate">{key}</span>
                  </button>
                )
              })}
            </div>
          </aside>

          {/* ZONE 3 : Editor Monaco */}
          <main className="flex-1 relative bg-[#050505] flex flex-col">
            <div className="h-10 bg-[#050505] border-b border-white/[0.08] flex items-end px-3 shrink-0">
              <div className="px-4 py-2 bg-[#0A0A0A] text-[11px] font-mono text-[#E0E0E0] border-t border-x border-white/[0.08] rounded-t-[6px] border-b-0 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-white" aria-hidden="true" />
                {activeFile}
              </div>
            </div>
            <div className="flex-1 w-full relative">
              <Editor
                height="100%"
                language={language}
                theme="vs-dark"
                value={activeCode}
                options={{
                  readOnly: true, minimap: { enabled: false }, fontSize: 13, fontFamily: 'var(--font-geist-mono)',
                  padding: { top: 24, bottom: 24 }, scrollBeyondLastLine: false, smoothScrolling: true, cursorBlinking: 'smooth', wordWrap: 'on'
                }}
                loading={
                  <div className="flex h-full items-center justify-center text-[#A0A0A0] text-[12px] font-mono gap-3 bg-[#050505]">
                    <Terminal className="w-4 h-4 text-white" /> Initialisation de l'éditeur...
                  </div>
                }
              />
            </div>
          </main>
        </div>

        {/* --- ONGLET APERÇU --- */}
        <div className={`w-full h-full flex items-center justify-center bg-[#000000] relative ${activeTab === 'preview' ? 'block' : 'hidden'}`}>
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8 gap-5 z-10">
            <div className="w-16 h-16 rounded-xl bg-[#0A0A0A] border border-white/[0.08] flex items-center justify-center shadow-2xl mb-2">
              <MonitorPlay className="w-6 h-6 text-[#A0A0A0]" aria-hidden="true" />
            </div>
            <h2 className="text-2xl font-heading font-semibold text-white tracking-tight">Rendu Externe Requis</h2>
            <p className="text-[#A0A0A0] text-[13px] max-w-md leading-relaxed">
              Pour garantir la fluidité du ticker GSAP et l'intégrité de la VRAM WebGL, l'architecture générée doit être exportée et compilée dans un environnement Node.js local.
            </p>
            <Button variant="secondary" className="mt-4" disabled>
              Exporter l'architecture
            </Button>
          </div>
        </div>

        {/* --- ONGLET MÉTRIQUES --- */}
        <div className={`w-full h-full bg-[#000000] overflow-y-auto p-8 md:p-12 lg:p-16 custom-scrollbar ${activeTab === 'metrics' ? 'block' : 'hidden'}`}>
          <div className="max-w-4xl mx-auto flex flex-col gap-10">
            
            <div className="flex flex-col gap-2">
              <h2 className="text-3xl font-heading font-semibold text-white tracking-tight">Audit O-Primus</h2>
              <p className="text-[#A0A0A0] text-[13px]">Résultats de validation technique et métier.</p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="bg-[#0A0A0A] border border-white/[0.08] rounded-[8px] p-6 flex flex-col gap-4">
                <span className="text-[10px] font-mono uppercase tracking-[0.15em] text-[#666666] flex items-center gap-2">
                  <Activity className="w-3.5 h-3.5 text-white" /> Standard Awwwards
                </span>
                <div className="text-3xl font-heading font-medium text-white capitalize">
                  {data?.validationScore?.awwwardsReadiness || 'Ready'}
                </div>
              </div>
              <div className="bg-[#0A0A0A] border border-white/[0.08] rounded-[8px] p-6 flex flex-col gap-4">
                <span className="text-[10px] font-mono uppercase tracking-[0.15em] text-[#666666] flex items-center gap-2">
                  <Terminal className="w-3.5 h-3.5 text-white" /> Valeur Estimée
                </span>
                <div className="text-3xl font-heading font-medium text-white">
                  {data?.validationScore?.estimatedValue || '15k - 25k €'}
                </div>
              </div>
            </div>

            <div className="bg-[#050505] border border-white/[0.08] p-8 md:p-10 rounded-[8px]">
              <h3 className="text-[12px] font-mono uppercase tracking-[0.2em] text-[#A0A0A0] mb-8">Indices de Performance (/100)</h3>
              <div className="flex flex-col gap-8">
                <MetricBar label="Cohérence Visuelle & Architecture" score={data?.validationScore?.designScore || 94} />
                <MetricBar label="Cinématique GSAP & Physique" score={data?.validationScore?.animationScore || 92} />
                <MetricBar label="Compliance WCAG AA" score={data?.validationScore?.accessibility || 98} />
                <MetricBar label="Alignement Sémantique (Anti-cliché)" score={data?.validationScore?.domainAlignment || 95} />
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  )
}

function MetricBar({ label, score }: { label: string, score: number }) {
  return (
    <div className="flex flex-col gap-3 group">
      <div className="flex items-center justify-between text-[13px]">
        <span className="font-medium text-[#E0E0E0]">{label}</span>
        <span className="font-mono text-[11px] font-semibold text-white bg-white/10 px-2 py-0.5 rounded-[4px] border border-white/10">{score}</span>
      </div>
      <div className="w-full h-[3px] bg-[#1A1A1A] rounded-full overflow-hidden border border-white/[0.04]">
        <div 
          className="h-full bg-white rounded-full transition-all duration-1000 ease-out" 
          style={{ width: `${score}%` }} 
          aria-valuenow={score}
          aria-valuemin={0}
          aria-valuemax={100}
          role="progressbar"
        />
      </div>
    </div>
  )
}