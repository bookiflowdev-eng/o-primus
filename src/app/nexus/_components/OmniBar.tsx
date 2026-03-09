'use client';

import React, { useState, useRef, useEffect } from 'react';
import { 
  Paperclip, 
  Image as ImageIcon, 
  Zap, 
  BrainCircuit, 
  Loader2, 
  ArrowUp,
  Cpu,
  GripHorizontal,
  Minimize2,
  Maximize2,
  X,
  FileCode,
  Trash2,
  Globe
} from 'lucide-react';

interface Attachment {
  id: string;
  file: File;
  preview: string;
  type: 'image' | 'text';
}

// AUCUNE PROP REQUISE : Le composant reste 100% autonome.
export default function OmniBar() {
  const [input, setInput] = useState('');
  const [isAgentic, setIsAgentic] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  
  // Fonctionnalités de productivité ajoutées
  const [activeTags, setActiveTags] = useState<string[]>(['gsap', 'webgl']);
  const [promptHistory, setPromptHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const widgetRef = useRef<HTMLDivElement>(null);
  const pos = useRef({ x: 0, y: 0 });
  const isDragging = useRef(false);
  const dragOffset = useRef({ x: 0, y: 0 });
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // État pour s'assurer que le rendu initial (SSR) ne pose pas de problème
  const [isMounted, setIsMounted] = useState(false);

  // Initialisation au centre bas
  useEffect(() => {
    pos.current = { 
      x: window.innerWidth / 2 - 300, 
      y: window.innerHeight - 200 
    };
    if (widgetRef.current) {
      widgetRef.current.style.transform = `translate3d(${pos.current.x}px, ${pos.current.y}px, 0)`;
    }
    setIsMounted(true);
  }, []);

  // Raccourci clavier "Echap" pour minimiser
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isMinimized) setIsMinimized(true);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isMinimized]);

  // Nettoyage mémoire
  useEffect(() => {
    return () => attachments.forEach(att => URL.revokeObjectURL(att.preview));
  }, [attachments]);

  // Auto-resize texte
  useEffect(() => {
    if (textareaRef.current && !isMinimized) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 300)}px`;
    }
  }, [input, isMinimized, attachments]);

  // --- DRAG & DROP GPU (TON CODE EXACT) ---
  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    isDragging.current = true;
    e.currentTarget.setPointerCapture(e.pointerId);
    dragOffset.current = { x: e.clientX - pos.current.x, y: e.clientY - pos.current.y };
    document.body.style.cursor = 'grabbing';
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging.current || !widgetRef.current) return;
    const newX = e.clientX - dragOffset.current.x;
    const newY = e.clientY - dragOffset.current.y;
    pos.current = { x: newX, y: newY };
    widgetRef.current.style.transform = `translate3d(${newX}px, ${newY}px, 0)`;
  };

  const onPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    isDragging.current = false;
    e.currentTarget.releasePointerCapture(e.pointerId);
    document.body.style.cursor = '';
  };

  // --- GESTION FICHIERS ---
  const processFile = (file: File) => {
    const isImage = file.type.startsWith('image/');
    const newAttachment: Attachment = {
      id: Math.random().toString(36).substring(7),
      file,
      preview: isImage ? URL.createObjectURL(file) : '',
      type: isImage ? 'image' : 'text'
    };
    setAttachments(prev => [...prev, newAttachment]);
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const items = e.clipboardData.items;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1 || items[i].type.indexOf('text/plain') === -1) {
        const file = items[i].getAsFile();
        if (file) { e.preventDefault(); processFile(file); }
      }
    }
  };

  // --- SOUMISSION & HISTORIQUE ---
  const handleSubmit = () => {
    if ((!input.trim() && attachments.length === 0) || isGenerating) return;
    setIsGenerating(true);
    
    if (input.trim()) {
      setPromptHistory(prev => [input, ...prev.slice(0, 19)]);
      setHistoryIndex(-1);
    }
    
    // NOUVEAUTÉ : On diffuse un événement global au lieu d'utiliser des props.
    // C'est la méthode "System Bus" des OS modernes.
    const event = new CustomEvent('NEXUS_OMNIBAR_SUBMIT', {
      detail: { prompt: input, attachments, isAgentic }
    });
    window.dispatchEvent(event);

    // Simulation avant de câbler le vrai stream
    setTimeout(() => { 
      setIsGenerating(false); 
      setInput(''); 
      setAttachments([]);
    }, 2000);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    } else if (e.key === 'ArrowUp') {
      if (historyIndex < promptHistory.length - 1) {
        const newIndex = historyIndex + 1;
        setHistoryIndex(newIndex);
        setInput(promptHistory[newIndex]);
      }
    } else if (e.key === 'ArrowDown') {
      if (historyIndex > 0) {
        const newIndex = historyIndex - 1;
        setHistoryIndex(newIndex);
        setInput(promptHistory[newIndex]);
      } else if (historyIndex === 0) {
        setHistoryIndex(-1);
        setInput('');
      }
    }
  };

  const clearAll = () => {
    setInput('');
    setAttachments([]);
  };

  const toggleTag = (tag: string) => {
    setActiveTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);
  };

  // FIX ULTIME Z-INDEX ET POSITION : Injecté en dure dans le DOM React.
  const dynamicStyle: React.CSSProperties = {
    zIndex: 99999, // Impossible à écraser par le Canvas
    visibility: isMounted ? 'visible' : 'hidden', // Empêche un flash en 0,0 au chargement
    transform: isMounted ? `translate3d(${pos.current.x}px, ${pos.current.y}px, 0)` : undefined
  };

  if (isMinimized) {
    return (
      <div 
        ref={widgetRef}
        style={dynamicStyle}
        className="fixed top-0 left-0 flex items-center gap-3 bg-[#111111] border border-white/10 rounded-full p-2 shadow-[0_0_30px_rgba(0,0,0,0.8)] cursor-grab active:cursor-grabbing will-change-transform transition-[width,border-radius] duration-300"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
      >
        <button 
          onClick={(e) => { e.stopPropagation(); setIsMinimized(false); }} 
          className="w-8 h-8 shrink-0 rounded-full bg-blue-600 flex items-center justify-center hover:bg-blue-500 transition-colors shadow-[0_0_15px_rgba(37,99,235,0.5)]"
        >
          <Maximize2 size={14} className="text-white" />
        </button>
        <span className="text-[10px] font-mono text-neutral-400 pr-4 select-none uppercase tracking-widest">NEXUS_READY</span>
      </div>
    );
  }

  return (
    <div 
      ref={widgetRef}
      style={dynamicStyle}
      className="fixed top-0 left-0 w-[600px] flex flex-col bg-[#0D0D0D]/95 backdrop-blur-3xl border border-white/10 rounded-2xl shadow-[0_30px_80px_rgba(0,0,0,0.9)] will-change-transform focus-within:border-blue-500/50 transition-[border-color,shadow] duration-500"
    >
      <input type="file" multiple ref={fileInputRef} onChange={(e) => e.target.files && Array.from(e.target.files).forEach(processFile)} className="hidden" accept="image/*, .json, .js, .css, .html, .txt" />

      {/* HEADER / DRAG HANDLE */}
      <div className="h-8 flex items-center justify-between px-3 cursor-grab active:cursor-grabbing border-b border-white/5 bg-white/[0.02] rounded-t-2xl group/handle" onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={onPointerUp}>
        <div className="flex items-center gap-2">
          <GripHorizontal size={14} className="text-neutral-600 group-hover/handle:text-neutral-400 transition-colors pointer-events-none" />
          <span className="text-[9px] font-mono text-neutral-600 uppercase tracking-widest select-none pointer-events-none">Synthesizer Alpha V5</span>
        </div>
        <button onClick={(e) => { e.stopPropagation(); setIsMinimized(true); }} className="text-neutral-500 hover:text-white transition-colors p-1" title="Minimiser (Échap)">
          <Minimize2 size={12} />
        </button>
      </div>

      <div className="p-4">
        {/* TAGS DE CONTEXTE INTERACTIFS */}
        <div className="flex items-center gap-2 mb-3 select-none">
          <button onClick={() => toggleTag('gsap')} className={`flex items-center gap-1.5 text-[10px] font-mono tracking-wider px-2.5 py-1 rounded-md border transition-all ${activeTags.includes('gsap') ? 'bg-green-500/10 text-green-400 border-green-500/30' : 'bg-transparent text-neutral-600 border-transparent hover:bg-white/5'}`}>
            <Cpu size={12} /> GSAP
          </button>
          <button onClick={() => toggleTag('webgl')} className={`flex items-center gap-1.5 text-[10px] font-mono tracking-wider px-2.5 py-1 rounded-md border transition-all ${activeTags.includes('webgl') ? 'bg-purple-500/10 text-purple-400 border-purple-500/30' : 'bg-transparent text-neutral-600 border-transparent hover:bg-white/5'}`}>
            <Globe size={12} /> WEBGL
          </button>
        </div>

        {/* PRÉVISUALISATION DES PIÈCES JOINTES */}
        {attachments.length > 0 && (
          <div className="flex flex-wrap gap-3 mb-4">
            {attachments.map((att) => (
              <div key={att.id} className="relative group w-16 h-16 rounded-lg overflow-visible">
                <div className="w-full h-full rounded-lg overflow-hidden border border-white/10 bg-neutral-900 shadow-md">
                  {att.type === 'image' ? (
                    <img src={att.preview} alt="preview" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-blue-400">
                      <FileCode size={20} />
                      <span className="text-[8px] mt-1 truncate w-12 text-center">{att.file.name.split('.').pop()?.toUpperCase()}</span>
                    </div>
                  )}
                </div>
                <button onClick={() => setAttachments(prev => prev.filter(a => a.id !== att.id))} className="absolute -top-2 -right-2 bg-neutral-800 hover:bg-red-500 border border-white/10 text-neutral-300 hover:text-white rounded-full p-1 shadow-xl transition-all z-10">
                  <X size={12} strokeWidth={3} />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* ZONE DE TEXTE */}
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onPaste={handlePaste}
          placeholder="Synthetiser une commande d'interface... (↑ pour historique, Ctrl+V image)"
          className="w-full bg-transparent text-[15px] leading-relaxed text-neutral-200 placeholder-neutral-700 resize-none outline-none min-h-[44px] max-h-[300px] scrollbar-thin scrollbar-thumb-white/10 font-sans"
          onKeyDown={handleKeyDown}
        />

        {/* FOOTER : OUTILS & ACTIONS */}
        <div className="flex items-center justify-between mt-2 pt-3 border-t border-white/5 font-sans">
          <div className="flex items-center gap-1">
            <button type="button" onClick={() => fileInputRef.current?.click()} className="p-2 text-neutral-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors" title="Joindre un fichier">
              <Paperclip size={18} />
            </button>
            <button type="button" onClick={() => fileInputRef.current?.click()} className="p-2 text-neutral-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors" title="Joindre une image">
              <ImageIcon size={18} />
            </button>
            {(input.trim() || attachments.length > 0) && (
              <button type="button" onClick={clearAll} className="p-2 text-neutral-600 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors ml-2" title="Tout effacer">
                <Trash2 size={16} />
              </button>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsAgentic(!isAgentic)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold tracking-wide transition-all duration-300 ${
                isAgentic ? 'bg-indigo-500/15 text-indigo-400 border border-indigo-500/30 shadow-[0_0_15px_rgba(99,102,241,0.2)]' : 'bg-neutral-800 text-neutral-400 border border-white/5 hover:bg-neutral-700'
              }`}
            >
              {isAgentic ? <BrainCircuit size={14} className="animate-pulse" /> : <Zap size={14} />}
              {isAgentic ? 'DEEP_THINK' : 'DRAFT_MODE'}
            </button>

            <button
              type="button"
              onClick={handleSubmit}
              disabled={(!input.trim() && attachments.length === 0) || isGenerating}
              className={`flex items-center justify-center h-10 w-10 rounded-xl transition-all duration-300 ${
                (input.trim() || attachments.length > 0) && !isGenerating
                  ? 'bg-blue-600 text-white hover:bg-blue-500 shadow-[0_0_25px_rgba(37,99,235,0.5)] hover:scale-105 active:scale-95'
                  : 'bg-neutral-800 text-neutral-600 cursor-not-allowed border border-white/5'
              }`}
            >
              {isGenerating ? <Loader2 size={18} className="animate-spin" /> : <ArrowUp size={20} strokeWidth={3} />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}