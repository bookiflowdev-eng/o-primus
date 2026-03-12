'use client';

import { useState, useEffect, useCallback } from 'react';
import { useNexus } from '@/components/providers/NexusProvider';

export interface SelectedNode {
  id: string;
  tagName: string;
  html: string;
}

export function useNeuralBridge() {
  const [selectedNode, setSelectedNode] = useState<SelectedNode | null>(null);
  const { setIsSelectionMode } = useNexus(); // 🔴 Récupération du state global

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'NEXUS_NODE_SELECTED') {
        console.log('[PONT NEURAL] ⚡ Nœud intercepté :', event.data.payload);
        setSelectedNode(event.data.payload);
        
        // 🔴 UX FLUIDE : Désactive automatiquement le mode pointeur une fois cliqué
        setIsSelectionMode(false); 
      }
    };

    window.addEventListener('message', handleMessage);
    
    return () => window.removeEventListener('message', handleMessage);
  }, [setIsSelectionMode]);

  const clearSelection = useCallback(() => {
    setSelectedNode(null);
  }, []);

  return { selectedNode, clearSelection };
}