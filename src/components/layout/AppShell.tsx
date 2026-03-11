// CHEMIN: src/components/layout/AppShell.tsx
'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'
import { useQuota } from '@/hooks/useQuota'
import { Plus, History, LogOut, Terminal, Layers } from 'lucide-react'

const MOCK_HISTORY = [
  { id: '1029', title: 'AstroCore Landing', time: 'En cours...', status: 'active' },
  { id: '1028', title: 'Fintech Dashboard', time: 'Hier', status: 'completed' },
]

export function AppShell({ children }: { children: React.ReactNode }) {
  const { user, signOut } = useAuth()
  const { quota } = useQuota()
  
  const sidebarRef = useRef<HTMLElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [sidebarWidth, setSidebarWidth] = useState(280)

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging) return
    requestAnimationFrame(() => {
      const newWidth = Math.min(Math.max(e.clientX, 220), 480)
      setSidebarWidth(newWidth)
    })
  }, [isDragging])

  const handleMouseUp = useCallback(() => setIsDragging(false), [])

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove)
      window.addEventListener('mouseup', handleMouseUp)
      document.body.style.cursor = 'col-resize'
      document.body.style.userSelect = 'none'
    } else {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isDragging, handleMouseMove, handleMouseUp])

  const quotaUsed = quota ? quota.generationsUsed : 0
  const quotaLimit = quota ? quota.generationsLimit : 5
  const quotaPercent = Math.min(100, (quotaUsed / quotaLimit) * 100)

  return (
    <div className="flex h-screen w-full bg-[#000000] text-white font-sans overflow-hidden">
      
      {/* SIDEBAR */}
      <aside 
        ref={sidebarRef}
        style={{ width: sidebarWidth }}
        className="shrink-0 flex flex-col bg-[#050505] border-r border-white/[0.06] relative z-20"
      >
        <div className="h-16 px-6 flex items-center justify-between shrink-0 border-b border-white/[0.03]">
          <Link href="/dashboard" className="flex items-center gap-3 focus:outline-none group outline-none">
            <div className="w-7 h-7 rounded-[6px] bg-white text-black flex items-center justify-center shadow-[0_0_15px_rgba(255,255,255,0.1)] group-hover:scale-105 transition-transform">
              <span className="font-bold text-[12px]">O</span>
            </div>
            <span className="font-heading text-[14px] font-semibold tracking-wide text-metal">O-Primus</span>
          </Link>
          <div className="text-[9px] font-mono text-[#A0A0A0] bg-white/[0.03] px-2 py-1 rounded-full border border-white/[0.08] uppercase tracking-widest">
            Pro
          </div>
        </div>

        <div className="px-4 py-4 shrink-0">
          <Link href="/dashboard" className="flex items-center justify-center gap-2 w-full h-10 rounded-[8px] border border-dashed border-white/[0.15] bg-transparent hover:bg-white/[0.04] hover:border-white/[0.4] hover:text-white transition-all text-[12px] font-medium text-[#A0A0A0] focus:outline-none group outline-none">
            <Plus className="w-3.5 h-3.5 transition-transform group-hover:rotate-90" />
            Nouvelle Matrice
          </Link>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar px-2 flex flex-col gap-1 pb-4">
          <div className="px-3 py-3 flex items-center gap-2 text-[#555555]">
            <History className="w-3.5 h-3.5" />
            <span className="text-[10px] font-mono uppercase tracking-widest font-semibold">Répertoire</span>
          </div>
          
          {MOCK_HISTORY.map((item) => (
            <div 
              key={item.id}
              className="group flex flex-col items-start w-full px-3 py-3 rounded-[8px] text-left hover:bg-white/[0.04] transition-all cursor-pointer relative"
            >
              <div className="flex items-center justify-between w-full">
                <span className={`text-[13px] truncate transition-colors ${item.status === 'active' ? 'text-white font-medium' : 'text-[#A0A0A0] group-hover:text-white'}`}>
                  {item.title}
                </span>
                <span className="text-[10px] font-mono text-[#444444] group-hover:text-[#A0A0A0] transition-colors">
                  #{item.id}
                </span>
              </div>
              <div className="flex items-center gap-2 mt-1.5">
                {item.status === 'active' ? (
                  <span className="flex items-center gap-1.5 text-[11px] text-white font-mono">
                    <Layers className="w-3 h-3 animate-pulse text-white" /> {item.time}
                  </span>
                ) : (
                  <span className="text-[11px] text-[#666666]">{item.time}</span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* FOOTER SIDEBAR : Refonte Complète "Bento" (La zone encerclée en rouge) */}
        <div className="shrink-0 flex flex-col p-4 gap-3 border-t border-white/[0.06] bg-[#030303]">
          
          {/* Bento Box : API Limit */}
          <div className="bg-[#0A0A0A] border border-white/[0.06] p-3.5 rounded-[10px] flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-widest font-medium text-[#666666]">
                <Terminal className="w-3 h-3" /> API Limit
              </span>
              <span className="text-[10px] font-mono text-[#A0A0A0]">
                <span className="text-white font-medium">{quotaUsed}</span> / {quotaLimit}
              </span>
            </div>
            <div className="h-[3px] w-full bg-[#111111] rounded-full overflow-hidden">
              <div 
                className="h-full bg-white transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(255,255,255,0.5)]"
                style={{ width: `${quotaPercent}%` }}
              />
            </div>
          </div>
          
          {/* User Profile */}
          <div className="flex items-center justify-between group px-1 pt-1">
            <div className="flex items-center gap-3 overflow-hidden min-w-0">
              <div className="w-8 h-8 rounded-[6px] bg-[#121212] border border-white/[0.12] flex items-center justify-center shrink-0 group-hover:border-white/[0.3] transition-colors">
                <div className="text-[12px] font-mono font-medium text-[#A0A0A0] group-hover:text-white transition-colors">
                  {user?.email?.charAt(0).toUpperCase() || 'U'}
                </div>
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-[12px] font-medium text-white truncate cursor-default">Architecte</span>
                <span className="text-[10px] font-mono text-[#666666] truncate cursor-default">{user?.email || 'sys@oprimus.tech'}</span>
              </div>
            </div>
            <button
              onClick={() => signOut()}
              aria-label="Se déconnecter"
              title="Se déconnecter"
              className="p-2 text-[#666666] hover:text-white hover:bg-white/[0.06] rounded-[6px] transition-all focus:outline-none"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>
      </aside>

      {/* DRAG HANDLE */}
      <div 
        onMouseDown={() => setIsDragging(true)}
        className="relative w-2 -ml-1 cursor-col-resize z-30 group flex items-center justify-center"
      >
        <div className={`w-[2px] h-full transition-colors duration-300 ease-out ${
          isDragging ? 'bg-white shadow-[0_0_15px_rgba(255,255,255,0.6)]' : 'bg-transparent group-hover:bg-white/[0.15]'
        }`} /> 
      </div>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col relative overflow-hidden bg-background">
        <div className="absolute inset-0 bg-[url('/noise.webp')] opacity-[0.02] mix-blend-screen pointer-events-none" aria-hidden="true" />
        {isDragging && <div className="absolute inset-0 z-50 cursor-col-resize" />}
        <div className="relative z-10 w-full h-full flex flex-col">
          {children}
        </div>
      </main>

    </div>
  )
}