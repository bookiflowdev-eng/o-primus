import React from 'react';
import { ForensicSource } from '@/lib/contracts/forensic-source';
import { ExternalLink, Calculator, BookOpen, Palette, Cuboid } from 'lucide-react';

interface CitationNodeProps {
  source: ForensicSource;
  index: number;
}

export const CitationNode: React.FC<CitationNodeProps> = ({ source, index }) => {
  // Sélection de l'icône et de la couleur selon la catégorie
  const getCategoryTheme = () => {
    switch (source.category) {
      case 'math': return { Icon: Calculator, color: 'text-purple-400', bg: 'bg-purple-500/10' };
      case 'docs': return { Icon: BookOpen, color: 'text-blue-400', bg: 'bg-blue-500/10' };
      case 'aesthetic': return { Icon: Palette, color: 'text-pink-400', bg: 'bg-pink-500/10' };
      case 'architecture': return { Icon: Cuboid, color: 'text-green-400', bg: 'bg-green-500/10' };
      default: return { Icon: ExternalLink, color: 'text-neutral-400', bg: 'bg-neutral-500/10' };
    }
  };

  const { Icon, color, bg } = getCategoryTheme();

  return (
    <a 
      href={source.url} 
      target="_blank" 
      rel="noopener noreferrer"
      className="group flex flex-col gap-2 p-3 rounded-lg border border-white/5 bg-neutral-900/40 backdrop-blur-md hover:bg-neutral-800/60 hover:border-white/20 transition-all cursor-pointer relative overflow-hidden"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      {/* Barre de Match % */}
      <div 
        className="absolute bottom-0 left-0 h-[2px] bg-white/20" 
        style={{ width: `${source.matchPercentage}%` }}
      >
        <div className="absolute inset-0 bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,0.8)]" />
      </div>

      <div className="flex justify-between items-start">
        <div className="flex items-center gap-2">
          <div className={`p-1.5 rounded-md ${bg}`}>
            <Icon size={12} className={color} />
          </div>
          <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest">
            {source.category}
          </span>
        </div>
        <div className="flex items-center gap-1 text-[9px] font-mono text-blue-400">
          MATCH {source.matchPercentage}%
          <ExternalLink size={10} className="opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      </div>

      <div>
        <h4 className="text-[12px] font-bold text-white mb-0.5">{source.title}</h4>
        <p className="text-[10px] text-neutral-500 line-clamp-2 leading-relaxed">
          {source.description}
        </p>
      </div>
    </a>
  );
};