'use client';

import { useState, useCallback } from 'react';
import { useNexus } from '@/components/providers/NexusProvider';

export interface VaultItem {
  id: string;
  title: string;
  source_url: string;
  html_content: string;
  created_at: string;
}

export function useVault() {
  const { canvasHtml, currentUrl, setCanvasHtml, addAgentLog } = useNexus();
  const [isSaving, setIsSaving] = useState(false);
  const [items, setItems] = useState<VaultItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const saveToVault = useCallback(async () => {
    if (!canvasHtml) return;
    setIsSaving(true);
    addAgentLog(`[VAULT] Sauvegarde de l'architecture en cours...`);

    try {
      // 🔴 NOUVEAU : Auto-Nommage Intelligent et propre (ex: "Projet Apple" au lieu de "Clone - Apple (12:00)")
      let title = 'Architecture Sur-Mesure';
      if (currentUrl) {
        try {
            const hostname = new URL(currentUrl).hostname.replace('www.', '');
            const cleanName = hostname.split('.')[0]; // Récupère juste "apple" de "apple.com"
            title = `Projet ${cleanName.charAt(0).toUpperCase() + cleanName.slice(1)}`;
        } catch {
            title = 'Clone SOTY';
        }
      }

      const res = await fetch('/api/nexus/vault', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, source_url: currentUrl, html_content: canvasHtml })
      });

      if (!res.ok) throw new Error('Échec sauvegarde');
      addAgentLog(`[VAULT SUCCESS] 💾 Architecture '${title}' verrouillée.`);
      fetchVaultItems(); 
    } catch (e: any) {
      addAgentLog(`[VAULT CRITICAL] Erreur: ${e.message}`);
    } finally {
      setIsSaving(false);
    }
  }, [canvasHtml, currentUrl, addAgentLog]);

  const fetchVaultItems = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/nexus/vault');
      const json = await res.json();
      if (json.success) setItems(json.data);
    } catch (e) {
      console.error("Erreur chargement Vault", e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadItemToCanvas = useCallback((item: VaultItem) => {
    setCanvasHtml(item.html_content);
    addAgentLog(`[SYSTEM] 📦 Archive '${item.title}' extraite et injectée dans le Canvas.`);
  }, [setCanvasHtml, addAgentLog]);

  const deleteItem = useCallback(async (id: string) => {
    try {
      await fetch('/api/nexus/vault', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      setItems(prev => prev.filter(i => i.id !== id));
      addAgentLog(`[VAULT] Archive purgée avec succès.`);
    } catch (e) {
      console.error("Erreur suppression", e);
    }
  }, [addAgentLog]);

  // 🔴 NOUVEAU : Fonction de renommage
  const updateItemTitle = useCallback(async (id: string, newTitle: string) => {
    try {
      const res = await fetch('/api/nexus/vault', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, title: newTitle })
      });
      if (!res.ok) throw new Error('Erreur de renommage');
      
      setItems(prev => prev.map(item => item.id === id ? { ...item, title: newTitle } : item));
      addAgentLog(`[VAULT] L'archive a été renommée.`);
    } catch (e) {
      console.error("Erreur update", e);
    }
  }, [addAgentLog]);

  return { saveToVault, fetchVaultItems, loadItemToCanvas, deleteItem, updateItemTitle, items, isSaving, isLoading };
}