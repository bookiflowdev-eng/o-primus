'use client';

import React, { useEffect, useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X, Clock, Trash2, Code2, ExternalLink, Loader2, Edit2, Check } from 'lucide-react';
import { useVault, VaultItem } from '@/hooks/useVault';

interface VaultModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function VaultModal({ isOpen, onClose }: VaultModalProps) {
  const { items, fetchVaultItems, loadItemToCanvas, deleteItem, updateItemTitle, isLoading } = useVault();
  const [mounted, setMounted] = useState(false);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) fetchVaultItems();
  }, [isOpen, fetchVaultItems]);

  useEffect(() => {
    if (editingId && inputRef.current) {
      inputRef.current.focus();
    }
  }, [editingId]);

  if (!isOpen || !mounted) return null;

  const handleSaveEdit = async (id: string) => {
    if (editValue.trim() && updateItemTitle) {
      await updateItemTitle(id, editValue.trim());
    }
    setEditingId(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent, id: string) => {
    if (e.key === 'Enter') handleSaveEdit(id);
    if (e.key === 'Escape') setEditingId(null);
  };

  return createPortal(
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 sm:p-8 pointer-events-auto">
      
      {/* Overlay flouté */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity animate-in fade-in duration-300"
        onClick={onClose}
      />
      
      {/* 🔴 FIX DIMENSIONS : On force une hauteur maximale calculée pour toujours laisser de l'espace en haut et en bas */}
      <div 
        className="relative w-full max-w-4xl bg-[#0a0a0c] border border-white/10 rounded-2xl shadow-[0_0_80px_rgba(0,0,0,0.8)] flex flex-col animate-in slide-in-from-bottom-4 fade-in zoom-in-95 duration-300"
        style={{ maxHeight: 'calc(100vh - 6rem)' }} 
      >
        
        {/* Header Fixe */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/10 bg-[#0a0a0c] rounded-t-2xl shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-500/10 rounded-xl border border-blue-500/20 text-blue-400">
              <Code2 size={20} strokeWidth={2.5} />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white tracking-wide">Nexus Vault</h2>
              <p className="text-xs text-white/40 font-mono mt-0.5">HISTORIQUE DES ARCHITECTURES</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2.5 text-white/40 hover:text-white hover:bg-white/10 rounded-xl transition-all">
            <X size={20} />
          </button>
        </div>

        {/* 🔴 FIX SCROLL : onWheelCapture bloque brutalement la remontée de l'événement vers Lenis. Ajout de custom-scrollbar pour voir la barre */}
        <div 
          className="flex-1 overflow-y-auto p-4 sm:p-6 custom-scrollbar overscroll-contain" 
          data-lenis-prevent="true"
          onWheelCapture={(e) => e.stopPropagation()}
          onTouchMoveCapture={(e) => e.stopPropagation()}
        >
          {isLoading ? (
            <div className="flex flex-col justify-center items-center h-64 gap-4 text-blue-500/50">
              <Loader2 className="animate-spin" size={40} />
              <span className="text-sm font-mono tracking-widest uppercase">Déchiffrement du Vault...</span>
            </div>
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-white/40">
              <div className="inline-flex justify-center items-center w-20 h-20 rounded-2xl bg-white/5 border border-white/10 mb-6 shadow-inner">
                <Code2 size={32} className="opacity-50" />
              </div>
              <p className="text-lg font-medium text-white/60">Le Vault est vide.</p>
              <p className="text-sm mt-2 max-w-sm text-center">Générez une interface Awwwards et sauvegardez-la. Elle sera cryptée et stockée ici.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {items.map((item: VaultItem) => (
                <div key={item.id} className="group relative flex items-center justify-between p-4 rounded-xl border border-white/5 bg-[#111] hover:bg-[#161618] hover:border-white/20 transition-all duration-200 shadow-sm hover:shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
                  
                  {/* Contenu Gauche */}
                  <div className="flex-1 min-w-0 pr-6">
                    {editingId === item.id ? (
                      <div className="flex items-center gap-2 mb-1">
                        <input
                          ref={inputRef}
                          type="text"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          onKeyDown={(e) => handleKeyDown(e, item.id)}
                          className="bg-black border border-blue-500/50 text-white text-base font-medium px-3 py-1 rounded-md outline-none focus:ring-2 focus:ring-blue-500/30 w-full max-w-md transition-all"
                        />
                        <button onClick={() => handleSaveEdit(item.id)} className="p-1.5 bg-blue-500/20 text-blue-400 hover:bg-blue-500/40 rounded-md transition-colors">
                          <Check size={16} />
                        </button>
                        <button onClick={() => setEditingId(null)} className="p-1.5 bg-white/10 text-white/60 hover:text-white hover:bg-white/20 rounded-md transition-colors">
                          <X size={16} />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="text-white font-medium text-base truncate">{item.title || 'Architecture sans nom'}</h3>
                        <button 
                          onClick={() => { setEditingId(item.id); setEditValue(item.title || ''); }}
                          className="opacity-0 group-hover:opacity-100 p-1.5 text-white/40 hover:text-white hover:bg-white/10 rounded-md transition-all"
                          title="Renommer"
                        >
                          <Edit2 size={14} />
                        </button>
                      </div>
                    )}

                    {/* Métadonnées */}
                    <div className="flex items-center gap-4 text-xs font-mono text-white/40">
                      <span className="flex items-center gap-1.5">
                        <Clock size={12} />
                        {new Date(item.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                      </span>
                      {item.source_url && item.source_url !== 'Manuelle' && (
                        <>
                          <span className="w-1 h-1 rounded-full bg-white/20" />
                          <span className="flex items-center gap-1.5 truncate max-w-[250px] text-blue-400/60">
                            <ExternalLink size={12} />
                            {item.source_url.replace(/^https?:\/\//, '')}
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <button 
                      onClick={() => { loadItemToCanvas(item); onClose(); }}
                      className="px-5 py-2.5 bg-white text-black hover:bg-neutral-200 text-sm font-semibold rounded-lg transition-colors shadow-md"
                    >
                      Restaurer
                    </button>
                    <button 
                      onClick={() => deleteItem(item.id)}
                      className="p-2.5 text-white/30 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                      title="Détruire"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>,
    document.body
  );
}