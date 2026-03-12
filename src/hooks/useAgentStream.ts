'use client';

import { useState, useCallback } from 'react';
import { useNexus } from '@/components/providers/NexusProvider';

export function useAgentStream() {
  const { setAgentState, addAgentLog, setCanvasHtml, sotyProbeData } = useNexus();
  const [isStreaming, setIsStreaming] = useState(false);

  const triggerAgent = useCallback(async (prompt: string, isAgentic: boolean = true, context?: string) => {
    setIsStreaming(true);
    setAgentState('thinking');
    addAgentLog(`[SYSTEM] Transmission de la directive à NEXUS...`);

    try {
      const response = await fetch('/api/nexus/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, isAgentic, context, sotyProbeData })
      });

      if (!response.ok) throw new Error(`Erreur HTTP: ${response.status}`);

      setAgentState('acting');
      addAgentLog(`[SYSTEM] Réflexion agentique en cours...`);

      const accumulatedText = await response.text();
      addAgentLog(`[SYSTEM] Code reçu. Parsing en cours...`);

      const extractBlock = (text: string, lang: string) => {
        const regex = new RegExp(`\`\`\`${lang}\\s*([\\s\\S]*?)\\s*\`\`\``, 'i');
        const match = text.match(regex);
        return match ? match[1].trim() : '';
      };

      let html = extractBlock(accumulatedText, 'html');
      const css = extractBlock(accumulatedText, 'css');
      let js = extractBlock(accumulatedText, 'javascript') || extractBlock(accumulatedText, 'js');

      if (js) {
        js = js.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
        js = js.replace(/<\/?script>/gi, '');
      }

      if (!html && accumulatedText.includes('<')) {
        const start = accumulatedText.indexOf('<');
        const end = accumulatedText.lastIndexOf('>');
        if (start !== -1 && end > start) {
          html = accumulatedText.substring(start, end + 1);
        }
      }

      if (html) {
        // 🔴 Assemblage propre : On stocke tout, le Canvas fera le reste
        const finalHtml = `
          <style>
            nexus-forensics { display: none !important; visibility: hidden !important; }
            ${css}
          </style>
          ${html}
          <script>
            setTimeout(() => {
              try { ${js} } catch(e) { console.error("[NEXUS RUNTIME ERROR]:", e); }
            }, 150);
          </script>
        `;
        setCanvasHtml(finalHtml);
        addAgentLog(`[SUCCESS] Interface générée avec succès. 🚀`);
      } else {
        addAgentLog(`[INFO] L'IA a répondu en texte brut.`);
        setCanvasHtml(`<div style="padding: 2rem; color: #fff;">Erreur de génération : aucun HTML détecté.</div>`);
      }

      setAgentState('idle');

    } catch (error: any) {
      setAgentState('error');
      addAgentLog(`[ERROR CRITIQUE] ${error.message}`);
    } finally {
      setIsStreaming(false);
    }
  }, [setAgentState, addAgentLog, setCanvasHtml, sotyProbeData]);

  return { triggerAgent, isStreaming };
}