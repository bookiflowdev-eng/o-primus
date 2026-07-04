'use client';

import React, { useState } from 'react';
// 🔴 Ajout de l'icône MousePointerClick
import { Globe, Loader2, ArrowRight, Save, FolderOpen, Target, X, MousePointerClick } from 'lucide-react'; 
import { useNexus } from '@/components/providers/NexusProvider';
import { useBrowserAgent } from '@/hooks/useBrowserAgent';
import { useVault } from '@/hooks/useVault'; 
import { VaultModal } from '../VaultModal';
import { useNeuralBridge } from '@/hooks/useNeuralBridge';
import { useMutator } from '@/hooks/useMutator';

export default function BrowserInput() {
  const [url, setUrl] = useState('');
  const [isVaultOpen, setIsVaultOpen] = useState(false);
  
  // 🔴 On récupère l'état isSelectionMode
  const { agentState, isSelectionMode, setIsSelectionMode } = useNexus();
  const { navigateAndClone } = useBrowserAgent();
  const { saveToVault, isSaving } = useVault();
  const { selectedNode, clearSelection } = useNeuralBridge();
  const { mutateTarget, isMutating } = useMutator();

  const isWorking = agentState !== 'idle' || isMutating;

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!url.trim() || isWorking) return;
    
    if (selectedNode) {
      await mutateTarget(url.trim(), selectedNode);
      clearSelection(); 
      setUrl('');       
    } else {
      navigateAndClone(url.trim());
    }
  };

  return (
    <div className="relative border-b border-white/15 bg-black/20 flex flex-col transition-all duration-300">
      
      {selectedNode && (
        <div className="flex items-center justify-between px-4 py-2 bg-blue-500/10 border-b border-blue-500/20 animate-in slide-in-from-top-2">
          <div className="flex items-center gap-2">
            <Target size={14} className="text-blue-400 animate-pulse" />
            <span className="text-[11px] font-mono text-blue-300 tracking-wider uppercase">
              Cible verrouillée : &lt;{selectedNode.tagName.toLowerCase()}&gt;
            </span>
          </div>
          <button 
            type="button"
            onClick={clearSelection}
            className="text-blue-400/50 hover:text-blue-400 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#111827] rounded"
            title="Relâcher la cible"
            aria-label="Relâcher la cible"
          >
            <X size={14} aria-hidden="true" />
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex items-center gap-3 px-4 py-2.5">
        <div className="text-white/50 flex-shrink-0">
          {isWorking ? <Loader2 size={14} className="animate-spin text-blue-400" /> : <Globe size={14} />}
        </div>
        
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          disabled={isWorking}
          placeholder={selectedNode ? "Ex: Passe ce bouton en rouge vif..." : "Cible URL (ex: awwwards.com)..."}
          className="flex-1 bg-transparent text-[13px] font-mono text-white placeholder-white/40 outline-none disabled:opacity-50 selection:bg-blue-500/30"
        />
        
        {/* 🔴 NOUVEAU BOUTON : ACTIVATION DU MODE CIBLAGE */}
        <button 
          type="button"
          onClick={() => {
            setIsSelectionMode(prev => !prev);
            if (isSelectionMode) clearSelection(); // Relâche la cible si on désactive le mode
          }}
          title={isSelectionMode ? "Désactiver le mode ciblage" : "Activer le mode ciblage chirurgical"}
          aria-label={isSelectionMode ? "Désactiver le mode ciblage" : "Activer le mode ciblage chirurgical"}
          className={`p-1.5 rounded-md transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 focus-visible:ring-offset-black ${
            isSelectionMode 
              ? 'text-blue-400 bg-blue-500/20 border border-blue-500/30 shadow-[0_0_10px_rgba(59,130,246,0.3)]' 
              : 'text-white/50 hover:text-white hover:bg-white/10 border border-transparent'
          }`}
        >
          <MousePointerClick size={16} aria-hidden="true" />
        </button>

        <div className="w-px h-4 bg-white/10 mx-1" /> {/* Séparateur visuel */}

        <button type="button" onClick={() => setIsVaultOpen(true)} title="Ouvrir le Vault" aria-label="Ouvrir le Vault" className="text-white/50 hover:text-blue-400 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 focus-visible:ring-offset-black rounded">
          <FolderOpen size={16} aria-hidden="true" />
        </button>

        <button type="button" onClick={saveToVault} disabled={isWorking || isSaving} title="Sauvegarder ce design" aria-label="Sauvegarder ce design" className="text-white/50 hover:text-green-400 disabled:opacity-30 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-green-400 focus-visible:ring-offset-2 focus-visible:ring-offset-black rounded">
          {isSaving ? <Loader2 size={16} className="animate-spin text-green-400" aria-hidden="true" /> : <Save size={16} aria-hidden="true" />}
        </button>

        {url.trim() && (
          <button type="submit" disabled={isWorking} title="Envoyer" aria-label="Envoyer" className={`transition-colors disabled:opacity-30 ml-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black rounded ${selectedNode ? 'text-blue-400 hover:text-blue-300' : 'text-white/50 hover:text-white'}`}>
            <ArrowRight size={16} aria-hidden="true" />
          </button>
        )}
      </form>

      {isWorking && (
        <div className="absolute bottom-0 left-0 h-[1px] bg-white/10 w-full overflow-hidden">
          <div className="h-full bg-blue-500 animate-[translateX_1.5s_infinite_ease-in-out] w-1/3" />
        </div>
      )}

      <VaultModal isOpen={isVaultOpen} onClose={() => setIsVaultOpen(false)} />
    </div>
  );
}