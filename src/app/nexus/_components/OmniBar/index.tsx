'use client';

import React, { useState, useRef, useEffect } from 'react';
import { GripHorizontal, Paperclip, Zap, BrainCircuit, Loader2, ArrowUp, FileCode, X, FolderArchive, LayoutTemplate, Settings2, Minimize2, Maximize2, Globe } from 'lucide-react';
import BrowserInput from './BrowserInput';
import { useNexus } from '@/components/providers/NexusProvider';
import { useAgentStream } from '@/hooks/useAgentStream';
import { SotyProbePopover } from './SotyProbePopover';
import { useNeuralBridge } from '@/hooks/useNeuralBridge';
import { useMutator } from '@/hooks/useMutator';

interface Attachment { id: string; file: File; preview: string; type: 'image' | 'text'; }

export default function OmniBar() {
  const [input, setInput] = useState('');
  const [isAgentic, setIsAgentic] = useState(true);
  const [isMinimized, setIsMinimized] = useState(false);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [showSotyProbe, setShowSotyProbe] = useState(false);
  
  const { agentState, sotyProbeData, addAgentLog, setCanvasHtml } = useNexus();
  const { triggerAgent } = useAgentStream(); 
  
  const { selectedNode, clearSelection } = useNeuralBridge();
  const { mutateTarget, isMutating } = useMutator();

  const isGenerating = agentState !== 'idle' || isMutating;

  const fileInputRef = useRef<HTMLInputElement>(null);
  const widgetRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const pos = useRef({ x: 0, y: 0 });
  const dragOffset = useRef({ x: 0, y: 0 });
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    pos.current = { x: window.innerWidth / 2 - 380, y: window.innerHeight - 220 };
    if (widgetRef.current) widgetRef.current.style.transform = `translate3d(${pos.current.x}px, ${pos.current.y}px, 0)`;
    setIsMounted(true);
  }, []);

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    dragOffset.current = { x: e.clientX - pos.current.x, y: e.clientY - pos.current.y };
    e.currentTarget.setPointerCapture(e.pointerId);
    document.body.style.cursor = 'grabbing';
  };
  
  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!e.currentTarget.hasPointerCapture(e.pointerId) || !widgetRef.current) return;
    pos.current = { x: e.clientX - dragOffset.current.x, y: e.clientY - dragOffset.current.y };
    widgetRef.current.style.transform = `translate3d(${pos.current.x}px, ${pos.current.y}px, 0)`;
  };

  const onPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    e.currentTarget.releasePointerCapture(e.pointerId);
    document.body.style.cursor = '';
  };

  const processFile = (file: File) => {
    const isImage = file.type.startsWith('image/');
    setAttachments(prev => [...prev, { id: Math.random().toString(), file, preview: isImage ? URL.createObjectURL(file) : '', type: isImage ? 'image' : 'text' }]);
  };

  const handleSubmit = async () => {
    if ((!input.trim() && attachments.length === 0) || isGenerating) return;
    const currentPrompt = input;
    setInput('');
    setAttachments([]);

    if (currentPrompt.toLowerCase().startsWith('/rag ')) {
      const searchQuery = currentPrompt.replace('/rag ', '').trim();
      addAgentLog(`[RAG X-RAY] Scan approfondi de la BDD : "${searchQuery}"...`);
      
      try {
        const res = await fetch('/api/nexus/rag-test', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: searchQuery })
        });
        const data = await res.json();
        
        if (data.success) {
          addAgentLog(`[RAG SUCCESS] ${data.results.length} fragments remontés.`);
          let resultsHtml = data.results.map((r: any, i: number) => {
            const content = r.content || r.code_snippet || JSON.stringify(r);
            const source = r.source || r.file_path || r.repo_name || 'Inconnue';
            const similarity = r.similarity ? (r.similarity * 100).toFixed(1) + '%' : 'N/A';
            const isToxic = content.includes('<path') || content.length > 5000;

            return `
            <div style="background: #111; border: 1px solid ${isToxic ? '#ef4444' : '#333'}; border-radius: 8px; margin-bottom: 1.5rem; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.3);">
              <div style="background: ${isToxic ? '#ef444420' : '#1a1a1a'}; padding: 0.75rem 1rem; border-bottom: 1px solid ${isToxic ? '#ef4444' : '#333'}; display: flex; justify-content: space-between; align-items: center;">
                <span style="color: ${isToxic ? '#ef4444' : '#3b82f6'}; font-weight: bold; font-family: sans-serif;">
                  Résultat #${i + 1} ${isToxic ? '⚠️ TOXIQUE' : ''}
                </span>
                <span style="color: #10b981; font-size: 13px; font-weight: bold;">Similarité: ${similarity}</span>
              </div>
              <div style="padding: 0.5rem 1rem; font-size: 13px; color: #a3a3a3; border-bottom: 1px solid #222; font-family: monospace;">
                <strong>Source :</strong> <span style="color: #fff;">${source}</span><br/>
                <strong>Poids :</strong> ${content.length} caractères
              </div>
              <pre style="padding: 1rem; margin: 0; overflow-x: auto; white-space: pre-wrap; font-size: 12px; color: #e5e5e5; max-height: 400px; overflow-y: auto;">${content.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</pre>
            </div>
          `}).join('');

          const previewHtml = `
            <div style="padding: 2rem; color: #fff; font-family: system-ui, -apple-system, sans-serif; background: #050505; height: 100%; overflow-y: auto;">
              <div style="max-width: 1000px; margin: 0 auto;">
                <h2 style="margin-top: 0; color: #fff; font-size: 24px;">Rayons X : Base de données</h2>
                <p style="color: #a3a3a3; margin-bottom: 2rem; font-size: 14px;">Recherche : <strong style="color: #fff;">"${searchQuery}"</strong></p>
                ${resultsHtml || '<p style="color: #ef4444; font-weight: bold;">Aucun résultat trouvé.</p>'}
              </div>
            </div>
          `;
          setCanvasHtml(previewHtml);
        } else {
            addAgentLog(`[RAG ERROR] API renvoie : ${data.error}`);
        }
      } catch (e: any) {
        addAgentLog(`[RAG ERROR] ${e.message}`);
      }
      return;
    }

    if (selectedNode) {
      // 🔴 NOUVEAU : On passe isAgentic (Draft/Pro) à la fonction de mutation
      await mutateTarget(currentPrompt, selectedNode, isAgentic);
      clearSelection(); 
    } else {
      await triggerAgent(currentPrompt, isAgentic);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  useEffect(() => {
    if (textareaRef.current && !isMinimized) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 250)}px`;
    }
  }, [input, isMinimized]);

  const dynamicStyle: React.CSSProperties = {
    zIndex: 99999,
    visibility: isMounted ? 'visible' : 'hidden',
    transform: isMounted ? `translate3d(${pos.current.x}px, ${pos.current.y}px, 0)` : undefined
  };

  if (isMinimized) {
    return (
      <div 
        ref={widgetRef} 
        style={dynamicStyle} 
        className="fixed top-0 left-0 flex items-center gap-3 bg-gradient-to-b from-[#18181B] to-black border border-white/20 rounded-xl p-2 shadow-2xl cursor-grab pointer-events-auto" 
        onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={onPointerUp}
      >
        <button onClick={(e) => { e.stopPropagation(); setIsMinimized(false); }} className="w-8 h-8 rounded-md bg-white/5 border border-white/10 text-neutral-400 flex items-center justify-center hover:text-white transition-colors">
          <Maximize2 size={14} />
        </button>
        <span className="text-[10px] font-mono text-neutral-400 pr-4 uppercase tracking-widest">Nexus Command</span>
      </div>
    );
  }

  return (
    <div 
      ref={widgetRef}
      style={dynamicStyle}
      className="fixed top-0 left-0 w-[760px] flex flex-col pointer-events-auto bg-gradient-to-br from-[#18181B] via-[#0A0A0A] to-black border border-white/20 rounded-xl shadow-[0_30px_80px_rgba(0,0,0,1)] will-change-transform overflow-hidden"
    >
      <input type="file" multiple ref={fileInputRef} onChange={(e) => e.target.files && Array.from(e.target.files).forEach(processFile)} className="hidden" />

      <div 
        className="h-10 flex items-center justify-between px-4 cursor-grab active:cursor-grabbing bg-white/[0.03] border-b border-white/15"
        onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={onPointerUp}
      >
        <div className="flex items-center gap-2">
          <GripHorizontal size={14} className="text-white/60 pointer-events-none" />
          <span className="text-[10px] font-mono text-white/50 uppercase tracking-widest pointer-events-none">Nexus Command Center</span>
        </div>
        <button onClick={(e) => { e.stopPropagation(); setIsMinimized(true); }} className="text-white/50 hover:text-white transition-colors p-1">
          <Minimize2 size={14} />
        </button>
      </div>

      <BrowserInput />

      <div className="flex flex-col px-4 pt-4 pb-3 bg-black">
        {attachments.length > 0 && (
          <div className="flex gap-3 mb-3">
            {attachments.map(att => (
              <div key={att.id} className="relative group w-14 h-14 rounded-lg overflow-hidden border border-white/20 shadow-sm">
                {att.type === 'image' ? <img src={att.preview} className="w-full h-full object-cover" alt="" /> : <div className="w-full h-full flex items-center justify-center bg-[#111] text-neutral-300"><FileCode size={18} /></div>}
                <button onClick={() => setAttachments(prev => prev.filter(a => a.id !== att.id))} className="absolute top-1 right-1 bg-neutral-900 text-white border border-white/20 rounded-md p-1 opacity-0 group-hover:opacity-100 transition-all"><X size={10} /></button>
              </div>
            ))}
          </div>
        )}

        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={selectedNode ? `Cible <${selectedNode.tagName.toLowerCase()}> verrouillée. Ex: change le texte, anime au survol...` : "Spécifiez une directive d'architecture..."}
          className="w-full bg-black text-[15px] leading-relaxed text-white placeholder-white/40 resize-none outline-none min-h-[60px] font-sans selection:bg-blue-500/30"
          rows={1}
          disabled={isGenerating}
        />
      </div>

      <div className="flex items-center justify-between px-3 pb-3 pt-2 border-t border-white/15 bg-black">
        <div className="flex items-center gap-1">
          <button onClick={() => fileInputRef.current?.click()} className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-md transition-colors flex items-center gap-2 text-xs font-medium">
            <Paperclip size={16} /> <span className="hidden sm:inline">Joindre</span>
          </button>
          <div className="w-px h-4 bg-white/20 mx-1" />
          <div className="relative">
            {showSotyProbe && <SotyProbePopover onClose={() => setShowSotyProbe(false)} />}
            <button 
              onClick={() => setShowSotyProbe(!showSotyProbe)}
              className={`p-2 rounded-md transition-all relative ${sotyProbeData ? 'text-blue-400 bg-blue-500/10 border border-blue-500/30 shadow-[0_0_10px_rgba(59,130,246,0.3)]' : 'text-white/60 hover:text-white hover:bg-white/10 border border-transparent'}`} 
            >
              <Globe size={16} />
              {sotyProbeData && <span className="absolute -top-1 -right-1 w-2 h-2 bg-blue-500 rounded-full shadow-[0_0_5px_rgba(59,130,246,1)]" />}
            </button>
          </div>
          <button className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-md transition-colors"><FolderArchive size={16} /></button>
          <button className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-md transition-colors"><LayoutTemplate size={16} /></button>
          <button className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-md transition-colors"><Settings2 size={16} /></button>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={() => setIsAgentic(!isAgentic)} 
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium tracking-wide transition-all ${isAgentic ? 'text-white bg-blue-600/20 border border-blue-500/50 shadow-[0_0_10px_rgba(59,130,246,0.2)]' : 'text-white/60 hover:bg-white/10 border border-transparent'}`}
          >
            {isAgentic ? <BrainCircuit size={14} className="text-blue-400" /> : <Zap size={14} className="text-yellow-400" />} 
            {isAgentic ? 'RÉFLEXION LENTE' : 'DRAFT'}
          </button>
          <button 
            onClick={handleSubmit}
            disabled={isGenerating || (!input.trim() && attachments.length === 0)} 
            className="flex items-center justify-center h-8 w-10 rounded-md bg-white text-black hover:bg-neutral-200 disabled:opacity-20 disabled:bg-white/10 transition-all shadow-md"
          >
            {isGenerating ? <Loader2 size={16} className="animate-spin text-neutral-500" /> : <ArrowUp size={18} strokeWidth={3} />}
          </button>
        </div>
      </div>
    </div>
  );
}