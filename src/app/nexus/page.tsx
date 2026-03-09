'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import OmniBar from './_components/OmniBar';
import CanvasPreview from './_components/CanvasPreview';
import CodeEditor from './_components/CodeEditor';
import { Activity, MonitorPlay, Code2 } from 'lucide-react';

export default function NexusWorkspace() {
  const [viewMode, setViewMode] = useState<'preview' | 'code'>('preview');
  const [sidebarWidth, setSidebarWidth] = useState(400);
  const [isLoading, setIsLoading] = useState(false);
  
  // ÉTAT DU PONT NEURAL (Le bloc cliqué dans l'Iframe)
  const [selectedNode, setSelectedNode] = useState<{ id: string, html: string } | null>(null);

  // --- SPLITTER RESIZE ---
  const isResizing = useRef(false);
  const resizeRafRef = useRef<number | null>(null);

  const startResizing = useCallback(() => { isResizing.current = true; }, []);
  const stopResizing = useCallback(() => {
    isResizing.current = false;
    if (resizeRafRef.current) cancelAnimationFrame(resizeRafRef.current);
  }, []);

  const resize = useCallback((mouseMoveEvent: MouseEvent) => {
    if (!isResizing.current) return;
    if (resizeRafRef.current) cancelAnimationFrame(resizeRafRef.current);
    
    resizeRafRef.current = requestAnimationFrame(() => {
      const newWidth = Math.max(250, Math.min(mouseMoveEvent.clientX, 800));
      setSidebarWidth(newWidth);
    });
  }, []);

  useEffect(() => {
    window.addEventListener('mousemove', resize);
    window.addEventListener('mouseup', stopResizing);
    return () => {
      window.removeEventListener('mousemove', resize);
      window.removeEventListener('mouseup', stopResizing);
    };
  }, [resize, stopResizing]);

  // --- ÉCOUTE DE L'IFRAME (Pont Neural) ---
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (!event.data || typeof event.data !== 'object') return;
      if (event.data.type === 'NEXUS_NODE_SELECTED') {
        console.log('[NEXUS OS] Node sélectionné intercepté:', event.data.payload);
        setSelectedNode(event.data.payload);
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  // --- ÉCOUTE DE L'OMNIBAR (Event Bus) ---
  useEffect(() => {
    const handleOmnibarSubmit = (e: Event) => {
      const customEvent = e as CustomEvent;
      const { prompt, attachments, isAgentic } = customEvent.detail;
      
      setIsLoading(true);
      console.log("[NEXUS] Envoi au backend :", { prompt, isAgentic, attachments, target: selectedNode?.id });
      
      // Simulation d'attente réseau
      setTimeout(() => {
        setIsLoading(false);
      }, 1500);
    };

    window.addEventListener('NEXUS_OMNIBAR_SUBMIT', handleOmnibarSubmit);
    return () => window.removeEventListener('NEXUS_OMNIBAR_SUBMIT', handleOmnibarSubmit);
  }, [selectedNode]); // On met selectedNode en dépendance pour avoir sa dernière valeur lors de la soumission

  return (
    <main className="flex w-full h-full relative overflow-hidden bg-black">
      
      <aside 
        style={{ width: `${sidebarWidth}px` }}
        className="h-full bg-[#0A0A0A] flex flex-col relative z-10 shrink-0"
      >
        <header className="h-14 border-b border-white/10 flex items-center justify-between px-6 shrink-0">
          <div className="flex items-center gap-3">
            <div className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
            </div>
            <span className="font-black tracking-[0.2em] text-[11px] text-white">NEXUS // BRAIN</span>
          </div>
          <div className="text-[10px] font-mono text-neutral-500 flex items-center gap-2">
            <Activity size={12} className="text-green-500" />
            LOGS
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 scrollbar-thin scrollbar-thumb-white/10 font-mono text-xs text-neutral-400">
           <p className="italic text-neutral-600 mb-4">// Zone d'affichage des logs agentiques XML et de l'historique.</p>
           
           {/* Visualisation de la cible du Pont Neural */}
           {selectedNode && (
             <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/30 rounded-md">
               <p className="text-blue-400 font-bold mb-2">🎯 Cible Verrouillée : {selectedNode.id}</p>
               <pre className="text-[10px] opacity-70 overflow-hidden whitespace-pre-wrap">
                 {selectedNode.html.substring(0, 150)}...
               </pre>
             </div>
           )}
        </div>
      </aside>

      {/* LE SPLITTER */}
      <div 
        className="w-1.5 h-full bg-transparent hover:bg-blue-500/50 cursor-col-resize z-20 transition-colors border-r border-white/10"
        onMouseDown={startResizing}
      />

      <section className="flex-1 h-full bg-[#050505] flex flex-col relative min-w-0">
        <header className="h-14 border-b border-white/5 bg-[#080808] flex items-center justify-between px-6 shrink-0">
          <div className="flex bg-neutral-900/50 rounded-lg p-1 border border-white/5">
            <button 
              onClick={() => setViewMode('preview')}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-[11px] font-bold tracking-wider transition-all ${viewMode === 'preview' ? 'bg-blue-600 text-white' : 'text-neutral-500 hover:text-white'}`}
            >
              <MonitorPlay size={14} />
              RENDER
            </button>
            <button 
              onClick={() => setViewMode('code')}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-[11px] font-bold tracking-wider transition-all ${viewMode === 'code' ? 'bg-white/10 text-white' : 'text-neutral-500 hover:text-white'}`}
            >
              <Code2 size={14} />
              SOURCE
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-hidden relative">
          {viewMode === 'preview' ? (
             <CanvasPreview 
               code={{
                 html: `<div data-nexus-id="hero-section" style="padding: 40px; border: 1px solid #333; margin: 20px; border-radius: 8px; cursor: crosshair;">
                          <h1 style="margin: 0; font-size: 24px;">Test du Pont Neural</h1>
                          <p style="margin-top: 8px; opacity: 0.7;">Clique sur cette zone. Tu verras l'ID apparaître dans le panneau de gauche.</p>
                        </div>`,
                 css: '',
                 js: ''
               }} 
               isLoading={isLoading} 
             />
          ) : <CodeEditor />}
        </div>
      </section>

      {/* L'OmniBar est totalement autonome */}
      <OmniBar />

    </main>
  );
}