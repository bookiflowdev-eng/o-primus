'use client';

import { useCallback } from 'react';
import { useNexus } from '@/components/providers/NexusProvider';
import { useAgentStream } from './useAgentStream';

export function useBrowserAgent() {
  const { setCurrentUrl, addAgentLog } = useNexus();
  const { triggerAgent, isStreaming } = useAgentStream();

  const navigateAndClone = useCallback(async (url: string) => {
    if (!url) return;

    const targetUrl = url.startsWith('http') ? url : `https://${url}`;
    setCurrentUrl(targetUrl);
    
    addAgentLog(`[MARINER INIT] Verrouillage de la cible : ${targetUrl}`);

    const prompt = `Voici l'URL cible : ${targetUrl}
    
APPELLE IMMÉDIATEMENT l'outil 'mariner_navigate' en lui passant le paramètre 'cible_url' = "${targetUrl}".
Une fois les données reçues, génère le code.`;

    await triggerAgent(prompt, true);

  }, [setCurrentUrl, addAgentLog, triggerAgent]);

  return { navigateAndClone, isWorking: isStreaming };
}