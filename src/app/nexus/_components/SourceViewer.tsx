'use client';

import React, { useState } from 'react';
import { Check, Copy, Code2 } from 'lucide-react';

interface SourceViewerProps {
  code: string | null;
}

export function SourceViewer({ code }: SourceViewerProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!code) return;
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000); // Remet l'icône normale après 2s
  };

  return (
    <div className="relative w-full h-full p-2 flex flex-col animate-in fade-in zoom-in-95 duration-200">
      
      {/* HEADER DE L'ÉDITEUR */}
      <div className="flex items-center justify-between px-4 py-3 bg-[#09090b] border border-white/10 rounded-t-xl border-b-0">
        <div className="flex items-center gap-2 text-white/50">
          <Code2 size={16} />
          <span className="text-xs font-mono uppercase tracking-wider">
            Code Source Complet (HTML / Tailwind / JS)
          </span>
        </div>
        <button
          onClick={handleCopy}
          disabled={!code}
          className="flex items-center gap-2 px-3 py-1.5 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 rounded-md text-xs font-medium transition-all disabled:opacity-30 disabled:hover:bg-blue-500/10"
        >
          {copied ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
          {copied ? 'Copié dans le presse-papiers !' : 'Copier le code'}
        </button>
      </div>

      {/* ZONE DE CODE BRUT */}
      <div className="flex-1 bg-[#030303] border border-white/10 rounded-b-xl overflow-hidden relative shadow-2xl">
        <textarea
          readOnly
          value={code || ''}
          className="w-full h-full p-6 bg-transparent text-white/80 font-mono text-[13px] leading-relaxed resize-none outline-none custom-scrollbar selection:bg-blue-500/30"
          spellCheck="false"
        />
      </div>
      
    </div>
  );
}