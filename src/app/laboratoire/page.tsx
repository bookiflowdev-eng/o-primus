'use client'

import React, { useState, useRef, useEffect, useCallback } from 'react'
import { Editor } from '@monaco-editor/react'
import { 
  Terminal, Monitor, LayoutTemplate, Cpu, Send, Bot, User, 
  Code2, Sparkles, Activity, Smartphone, Tablet, Monitor as MonitorIcon, ChevronDown, ChevronRight, Trash2, Maximize2
} from 'lucide-react'

type Message = {
  id: string
  role: 'user' | 'agent' | 'system'
  content: string
  logs?: string[]
}

// TES VRAIS AGENTS CONNECTÉS AU BACKEND SOTY 2026
const AGENTS = [
  { id: 'agent-1-architect', name: 'Agent 1: Architecte Universel', icon: LayoutTemplate },
  { id: 'agent-2-dom-physics', name: 'Agent 2: Ingénieur DOM & Physique', icon: Cpu },
  { id: 'agent-3-typography', name: 'Agent 3: Chorégraphe Typographique', icon: Terminal },
]

const INITIAL_HTML = `
  <!DOCTYPE html>
  <html>
  <head>
    <style>
      body { background: #0a0a0f; color: #fff; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; font-size: 14px; }
      .pulse { animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
      @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: .5; } }
    </style>
  </head>
  <body><div style="color: #6366f1; display: flex; align-items: center; gap: 8px;"><span class="pulse">●</span> O-PRIMUS LIVE CANVAS EN ATTENTE</div></body>
  </html>
`

export default function LaboratoirePage() {
  const [input, setInput] = useState('')
  const [selectedAgent, setSelectedAgent] = useState(AGENTS[0].id)
  const [isGenerating, setIsGenerating] = useState(false)
  const [activeTab, setActiveTab] = useState<'preview' | 'blueprint' | 'console'>('preview')
  const [blueprintData, setBlueprintData] = useState<any>(null)
  const [liveCode, setLiveCode] = useState(INITIAL_HTML)
  const [previewWidth, setPreviewWidth] = useState<'100%' | '768px' | '375px'>('100%')
  const [expandedLogs, setExpandedLogs] = useState<Set<string>>(new Set())
  
  // Resizing Logic
  const [leftWidth, setLeftWidth] = useState(45) 
  const [isDragging, setIsDragging] = useState(false)
  
  const [messages, setMessages] = useState<Message[]>([{
    id: 'sys-1', 
    role: 'system', 
    content: 'Environnement Agentique Initialisé. Moteur Gemini 3.1 Pro connecté en mode streaming SSE.'
  }])
  const [sseLogs, setSseLogs] = useState<{time: string, text: string}[]>([])

  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Auto-scroll messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Split-pane resizing handlers
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging) return
    const newWidth = (e.clientX / window.innerWidth) * 100
    if (newWidth > 20 && newWidth < 80) setLeftWidth(newWidth)
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

  const toggleLogs = (msgId: string) => {
    setExpandedLogs(prev => {
      const next = new Set(prev)
      if (next.has(msgId)) next.delete(msgId)
      else next.add(msgId)
      return next
    })
  }

  // Moteur d'inférence SSE
  const handleSendMessage = async () => {
    if (!input.trim() || isGenerating) return
    
    const userMsgId = Date.now().toString()
    const agentMsgId = (Date.now() + 1).toString()
    
    setMessages(prev => [
      ...prev, 
      { id: userMsgId, role: 'user', content: input },
      { id: agentMsgId, role: 'agent', content: '', logs: [] }
    ])
    setInput('')
    setIsGenerating(true)
    setExpandedLogs(prev => new Set(prev).add(agentMsgId))

    try {
      const response = await fetch('/api/agent/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: input, agentId: selectedAgent, blueprint: blueprintData }),
      })

      if (!response.body) throw new Error("Flux réseau indisponible. Vérifiez la connexion.")

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ""

      while (true) {
        const { value, done } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        let boundary = buffer.indexOf('\n\n')

        while (boundary !== -1) {
          const message = buffer.slice(0, boundary)
          buffer = buffer.slice(boundary + 2)

          if (message.startsWith('data: ')) {
            const eventData = message.substring(6)
            if (eventData.trim() === '[DONE]') continue
            
            try {
              const event = JSON.parse(eventData)
              const time = new Date().toLocaleTimeString()

              setSseLogs(prev => [...prev, { time, text: `[${event.type}] reçu.` }])

              if (event.type === 'text') {
                setMessages(prev => prev.map(msg => msg.id === agentMsgId ? { ...msg, content: msg.content + event.content } : msg))
              } 
              else if (event.type === 'log') {
                setMessages(prev => prev.map(msg => msg.id === agentMsgId ? { ...msg, logs: [...(msg.logs || []), event.message] } : msg))
              } 
              else if (event.type === 'error') {
                setMessages(prev => prev.map(msg => msg.id === agentMsgId ? { ...msg, content: msg.content + `\n\n⚠️ Erreur: ${event.message}` } : msg))
              }
              else if (event.type === 'blueprint') {
                setBlueprintData(event.data)
                setActiveTab('blueprint')
                setSseLogs(prev => [...prev, { time, text: `Mise à jour de la matrice JSON.` }])
              } 
              else if (event.type === 'code_injection' || event.type === 'codeinjection') {
                setActiveTab('preview')
                setLiveCode(`
                  <!DOCTYPE html>
                  <html>
                  <head>
                    <meta name="viewport" content="width=device-width, initial-scale=1">
                    <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.14.2/gsap.min.js"></script>
                    <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.14.2/ScrollTrigger.min.js"></script>
                    <script src="https://unpkg.com/lenis@1.3.17/dist/lenis.min.js"></script>
                    <style>
                      body, html { margin: 0; padding: 0; overflow-x: hidden; background: #0a0a0f; color: white; font-family: system-ui, sans-serif; } 
                      ${event.data.css || ''}
                    </style>
                  </head>
                  <body>
                    ${event.data.html || ''}
                    <script>${event.data.js_physics || event.data.js || ''}</script>
                  </body>
                  </html>
                `)
                setSseLogs(prev => [...prev, { time, text: `Injection DOM réussie.` }])
              }
            } catch (e) {
              setSseLogs(prev => [...prev, { time: new Date().toLocaleTimeString(), text: `⚠️ Erreur de parsing du flux JSON.` }])
            }
          }
          boundary = buffer.indexOf('\n\n')
        }
      }
    } catch (error: unknown) {
      const errMsg = error instanceof Error ? error.message : "Erreur inconnue"
      setMessages(prev => [...prev, { id: Date.now().toString(), role: 'system', content: `Arrêt critique : ${errMsg}` }])
    } finally {
      setIsGenerating(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <div className="h-screen w-full bg-[#0a0a0f] text-slate-300 font-sans flex flex-col overflow-hidden selection:bg-indigo-500/30">
      
      {/* ── HEADER ── */}
      <header className="h-14 border-b border-white/5 flex items-center justify-between px-6 bg-[#0a0a0f]/90 backdrop-blur-md shrink-0 relative z-20">
        <div className="flex items-center gap-4">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center shadow-[0_0_15px_rgba(99,102,241,0.3)]">
            <span className="text-white font-bold text-sm">O</span>
          </div>
          <div className="flex flex-col">
            <h1 className="text-sm font-heading font-semibold text-white tracking-wide">O-Primus Lab</h1>
            <span className="text-[10px] text-indigo-400 font-mono tracking-widest uppercase flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" aria-hidden="true" />
              Gemini 3.1 Pro actif
            </span>
          </div>
        </div>
        
        <select 
          value={selectedAgent}
          onChange={(e) => setSelectedAgent(e.target.value)}
          className="hidden sm:block bg-[#12121a] border border-white/10 text-xs font-medium text-white py-1.5 px-3 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-colors cursor-pointer shadow-inner hover:border-white/20"
          aria-label="Sélectionner l'agent actif"
        >
          {AGENTS.map(agent => <option key={agent.id} value={agent.id}>{agent.name}</option>)}
        </select>
      </header>

      {/* ── WORKSPACE SPLIT ── */}
      <div className="flex flex-1 overflow-hidden relative">
        
        {/* COLONNE GAUCHE (Chat Interface) */}
        <div 
          style={{ width: `${leftWidth}%` }} 
          className="flex flex-col border-r border-white/5 bg-[#0a0a0f] shrink-0 relative"
        >
          {/* Historique Messages */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-8 custom-scrollbar scroll-smooth">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex gap-4 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                
                {msg.role !== 'user' && (
                  <div className="w-8 h-8 shrink-0 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mt-1 shadow-sm">
                    {msg.role === 'system' ? <Activity size={14} className="text-indigo-400" aria-hidden="true" /> : <Bot size={14} className="text-indigo-400" aria-hidden="true" />}
                  </div>
                )}

                <div className={`flex flex-col gap-2 max-w-[90%] md:max-w-[85%] ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                  
                  {/* Bulle de texte */}
                  <div className={`px-5 py-3.5 text-sm leading-relaxed shadow-md ${
                    msg.role === 'user' ? 'bg-indigo-600 text-white rounded-2xl rounded-tr-sm' : 
                    msg.role === 'system' ? 'bg-white/5 border border-white/10 text-slate-400 font-mono text-xs rounded-2xl rounded-tl-sm mx-auto' : 
                    'bg-[#12121a] border border-white/5 text-slate-200 rounded-2xl rounded-tl-sm'
                  }`}>
                    {msg.content}
                    
                    {/* Loader de réflexion */}
                    {!msg.content && msg.role === 'agent' && (
                      <span className="italic text-slate-500 flex items-center gap-2">
                        Réflexion structurale 
                        <span className="flex gap-1 items-center h-4" aria-hidden="true">
                          <span className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce" style={{animationDelay:'0ms'}} />
                          <span className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce" style={{animationDelay:'150ms'}} />
                          <span className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce" style={{animationDelay:'300ms'}} />
                        </span>
                      </span>
                    )}
                  </div>

                  {/* Console Logs Collapsables (Agent uniquement) */}
                  {msg.logs && msg.logs.length > 0 && (
                    <div className="w-full mt-1">
                      <button 
                        onClick={() => toggleLogs(msg.id)}
                        className="flex items-center gap-1.5 text-[11px] font-mono text-slate-500 hover:text-indigo-400 transition-colors focus:outline-none rounded px-1 py-0.5"
                        aria-expanded={expandedLogs.has(msg.id)}
                      >
                        {expandedLogs.has(msg.id) ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                        {msg.logs.length} processus exécuté{msg.logs.length > 1 ? 's' : ''}
                      </button>
                      
                      {expandedLogs.has(msg.id) && (
                        <div className="mt-2 bg-black/50 border border-white/5 rounded-xl p-3 font-mono text-[11px] text-slate-400 space-y-2 shadow-inner">
                          {msg.logs.map((log, i) => (
                            <div key={i} className="flex items-start gap-2">
                              <span className="text-indigo-500/50 mt-px select-none">❯</span>
                              <span className={`break-words ${log.includes('✓') ? 'text-green-400' : log.includes('⚠️') ? 'text-yellow-400' : 'text-slate-300'}`}>
                                {log}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                </div>

                {msg.role === 'user' && (
                  <div className="w-8 h-8 shrink-0 rounded-full bg-[#12121a] border border-white/10 flex items-center justify-center mt-1 shadow-lg">
                    <User size={14} className="text-slate-300" aria-hidden="true" />
                  </div>
                )}
              </div>
            ))}
            
            {/* Typing indicator temporaire lors de l'appel */}
            {isGenerating && messages[messages.length - 1].role === 'user' && (
              <div className="flex gap-4 justify-start animate-fade-in">
                <div className="w-8 h-8 shrink-0 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mt-1 shadow-[0_0_15px_rgba(99,102,241,0.2)]">
                  <Sparkles size={14} className="text-indigo-400 animate-pulse" aria-hidden="true" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 border-t border-white/5 bg-[#0a0a0f] shrink-0">
            <div className="relative bg-[#12121a] border border-white/10 rounded-2xl focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500/50 transition-all shadow-inner overflow-hidden">
              <select 
                value={selectedAgent}
                onChange={(e) => setSelectedAgent(e.target.value)}
                className="sm:hidden w-full bg-[#12121a] border-b border-white/5 text-xs text-white py-2 px-3 focus:outline-none"
                aria-label="Sélectionner l'agent actif"
              >
                {AGENTS.map(agent => <option key={agent.id} value={agent.id}>{agent.name}</option>)}
              </select>
              
              <textarea 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ex: Demande à l'architecte de générer une structure JSON de pricing..."
                className="w-full bg-transparent text-sm text-white placeholder:text-slate-600 resize-none focus:outline-none p-4 pb-12"
                rows={Math.min(5, Math.max(2, input.split('\n').length))}
                disabled={isGenerating}
                aria-label="Message pour l'agent"
              />
              
              <div className="absolute bottom-2 left-3 right-2 flex justify-between items-center bg-[#12121a]">
                <div className="text-[10px] text-slate-500 font-mono tracking-widest uppercase flex items-center gap-1.5">
                  <Terminal size={10} /> Ctrl + Enter pour envoyer
                </div>
                <button 
                  onClick={handleSendMessage}
                  disabled={!input.trim() || isGenerating}
                  className="bg-indigo-600 text-white p-2 rounded-xl hover:bg-indigo-500 disabled:opacity-50 disabled:hover:bg-indigo-600 transition-all shadow-lg active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
                  aria-label="Envoyer la requête"
                >
                  <Send size={16} aria-hidden="true" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* DRAG HANDLE (RESIZER) */}
        <div 
          onMouseDown={() => setIsDragging(true)}
          className={`w-[6px] hover:bg-white/10 transition-colors cursor-col-resize z-30 shrink-0 flex items-center justify-center relative group ${isDragging ? 'bg-white/10' : 'bg-transparent'}`}
          aria-label="Redimensionner les panneaux"
          role="separator"
          tabIndex={0}
        >
          <div className="h-12 w-1 bg-white/20 rounded-full group-hover:bg-indigo-400 transition-colors" />
        </div>

        {/* COLONNE DROITE (Output / Visualisation) */}
        <div className="flex-1 bg-[#050505] flex flex-col relative overflow-hidden">
          {/* Empêcher l'iframe d'intercepter la souris pendant le drag */}
          {isDragging && <div className="absolute inset-0 z-50 cursor-col-resize" />}

          {/* Onglets Right Panel */}
          <div className="h-14 border-b border-white/5 bg-[#12121a] flex items-center justify-between px-4 shrink-0 gap-2">
            <div className="flex items-center gap-1.5 bg-black/40 p-1 rounded-xl border border-white/5" role="tablist">
              <button 
                role="tab" aria-selected={activeTab === 'preview'}
                onClick={() => setActiveTab('preview')} 
                className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-semibold transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${activeTab === 'preview' ? 'bg-white/10 text-white shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}
              >
                <Monitor size={14} /> <span className="hidden lg:inline">Live Canvas</span>
              </button>
              <button 
                role="tab" aria-selected={activeTab === 'blueprint'}
                onClick={() => setActiveTab('blueprint')} 
                className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-semibold transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${activeTab === 'blueprint' ? 'bg-white/10 text-white shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}
              >
                <Code2 size={14} /> <span className="hidden lg:inline">Blueprint JSON</span>
                {blueprintData && activeTab !== 'blueprint' && <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse ml-1 shadow-[0_0_5px_rgba(99,102,241,0.8)]" />}
              </button>
              <button 
                role="tab" aria-selected={activeTab === 'console'}
                onClick={() => setActiveTab('console')} 
                className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-semibold transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${activeTab === 'console' ? 'bg-white/10 text-white shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}
              >
                <Terminal size={14} /> <span className="hidden lg:inline">Console</span>
              </button>
            </div>

            {/* Contrôles Viewport (Uniquement si Preview actif) */}
            {activeTab === 'preview' && (
              <div className="flex items-center gap-2">
                <div className="flex items-center bg-white/5 border border-white/10 rounded-lg p-1">
                  <button onClick={() => setPreviewWidth('375px')} className={`p-1.5 rounded-md transition-colors ${previewWidth === '375px' ? 'bg-white/10 text-white' : 'text-slate-500 hover:text-white'}`} aria-label="Vue Mobile"><Smartphone size={14} /></button>
                  <button onClick={() => setPreviewWidth('768px')} className={`p-1.5 rounded-md transition-colors ${previewWidth === '768px' ? 'bg-white/10 text-white' : 'text-slate-500 hover:text-white'}`} aria-label="Vue Tablette"><Tablet size={14} /></button>
                  <button onClick={() => setPreviewWidth('100%')} className={`p-1.5 rounded-md transition-colors ${previewWidth === '100%' ? 'bg-white/10 text-white' : 'text-slate-500 hover:text-white'}`} aria-label="Vue Desktop"><MonitorIcon size={14} /></button>
                </div>
                <button className="p-1.5 text-slate-500 hover:text-white transition-colors rounded-lg hover:bg-white/5" aria-label="Plein écran">
                  <Maximize2 size={16} />
                </button>
              </div>
            )}
            
            {/* Clear Console (Uniquement si Console active) */}
            {activeTab === 'console' && (
              <button 
                onClick={() => setSseLogs([])} 
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-500 hover:text-red-400 hover:bg-white/5 transition-colors focus:outline-none"
              >
                <Trash2 size={14} /> Clear
              </button>
            )}
          </div>

          {/* VIEWS */}
          
          {/* Vue 1: Live Canvas (Iframe) */}
          <div className={`flex-1 relative flex items-center justify-center bg-[#050505] overflow-auto custom-scrollbar ${activeTab === 'preview' ? 'block' : 'hidden'}`}>
            <div 
              className="h-full bg-white transition-all duration-300 ease-in-out shadow-[0_0_50px_rgba(0,0,0,0.5)] border-x border-white/5"
              style={{ width: previewWidth }}
            >
              <iframe 
                srcDoc={liveCode} 
                sandbox="allow-scripts allow-same-origin" 
                className="w-full h-full border-none" 
                title="Aperçu en direct du code généré" 
              />
            </div>
          </div>

          {/* Vue 2: Blueprint JSON (Monaco) */}
          <div className={`flex-1 relative w-full h-full ${activeTab === 'blueprint' ? 'block' : 'hidden'}`}>
            {blueprintData ? (
              <Editor
                height="100%"
                language="json"
                theme="vs-dark"
                value={JSON.stringify(blueprintData, null, 2)}
                options={{ 
                  readOnly: true, 
                  minimap: { enabled: false }, 
                  fontFamily: 'var(--font-geist-mono)', 
                  fontSize: 13, 
                  padding: { top: 24, bottom: 24 },
                  wordWrap: 'on',
                  scrollBeyondLastLine: false
                }}
              />
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-500 font-mono text-sm gap-4 bg-[#0a0a0f]">
                <Code2 size={32} className="opacity-20" />
                Aucune matrice sémantique générée.
              </div>
            )}
          </div>

          {/* Vue 3: Raw SSE Console */}
          <div className={`flex-1 relative bg-[#050505] p-6 overflow-y-auto custom-scrollbar ${activeTab === 'console' ? 'block' : 'hidden'}`}>
            <div className="font-mono text-[12px] space-y-2 leading-relaxed">
              {sseLogs.length === 0 ? (
                <div className="text-slate-600 italic">// Écoute du stream SSE sur /api/agent/stream...</div>
              ) : (
                sseLogs.map((log, i) => (
                  <div key={i} className="flex items-start gap-4 hover:bg-white/[0.02] px-2 py-1 -mx-2 rounded transition-colors text-slate-400">
                    <span className="text-slate-600 shrink-0 select-none">[{log.time}]</span>
                    <span className={log.text.includes('⚠️') ? 'text-yellow-400' : log.text.includes('réussie') ? 'text-green-400' : 'text-slate-300'}>
                      {log.text}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}