import React from 'react';
import { ForensicSource } from '@/lib/contracts/forensic-source';
import { CitationNode } from './CitationNode';
import { Fingerprint } from 'lucide-react';

interface ForensicPanelProps {
  sources: ForensicSource[];
}

export const ForensicPanel: React.FC<ForensicPanelProps> = ({ sources }) => {
  if (!sources || sources.length === 0) return null;

  return (
    <div className="absolute top-4 right-4 w-72 max-h-[calc(100%-2rem)] flex flex-col gap-3 z-40 animate-in slide-in-from-right-8 fade-in duration-500 pointer-events-auto">
      
      <header className="flex items-center justify-between px-2">
        <div className="flex items-center gap-2">
          <Fingerprint size={14} className="text-blue-400" />
          <span className="text-[10px] font-mono font-bold text-white uppercase tracking-[0.2em]">
            System Forensics
          </span>
        </div>
        <div className="px-1.5 py-0.5 rounded-full bg-blue-500/20 border border-blue-500/30 text-[9px] font-mono text-blue-300">
          {sources.length} NODES
        </div>
      </header>

      <div className="flex flex-col gap-2 overflow-y-auto scrollbar-none pb-2">
        {sources.map((source, idx) => (
          <div key={source.id} className="animate-in fade-in slide-in-from-bottom-4 fill-mode-backwards">
            <CitationNode source={source} index={idx} />
          </div>
        ))}
      </div>
      
    </div>
  );
};