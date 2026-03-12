'use client';

import { useState } from 'react';
import { useNexus } from '@/components/providers/NexusProvider';
import { SelectedNode } from '@/hooks/useNeuralBridge';

export function useMutator() {
  const { canvasHtml, setCanvasHtml, setAgentState, addAgentLog } = useNexus();
  const [isMutating, setIsMutating] = useState(false);

  const mutateTarget = async (prompt: string, selectedNode: SelectedNode, isAgentic: boolean) => {
    setIsMutating(true);
    setAgentState('acting');
    addAgentLog(`[MUTATION] Chirurgie en cours sur <${selectedNode.tagName.toLowerCase()}>...`);

    try {
      const response = await fetch('/api/nexus/mutate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, targetHtml: selectedNode.html, isAgentic })
      });

      if (!response.ok) throw new Error("Échec de l'API de mutation");
      
      const responseData = await response.json();
      
      // Télémétrie dynamique
      if (responseData.ragUsed) {
        addAgentLog(`[RAG SYNC] 🧬 Motifs Awwwards injectés (${responseData.model}).`);
      } else {
        addAgentLog(`[DRAFT MODE] ⚡ Exécution rapide via ${responseData.model}.`);
      }

      const rawHtml = responseData.html;
      const match = rawHtml.match(/```html\s*([\s\S]*?)\s*```/i);
      const newHtmlSnippet = match ? match[1].trim() : rawHtml.trim();

      // Reconstruction et injection chirurgicale
      const container = document.createElement('div');
      container.innerHTML = canvasHtml || '';

      let idCounter = 1;
      const traverseAndTag = (node: Element) => {
        if (node.tagName !== 'SCRIPT' && node.tagName !== 'STYLE' && node.tagName !== 'NOSCRIPT') {
          node.setAttribute('data-nexus-id', `nexus-${idCounter++}`);
        }
        Array.from(node.children).forEach(child => traverseAndTag(child));
      };
      
      // 🔴 LE CORRECTIF EST LÀ : On commence le comptage sur les enfants (comme dans le Canvas)
      Array.from(container.children).forEach(child => traverseAndTag(child));

      const targetElement = container.querySelector(`[data-nexus-id="${selectedNode.id}"]`);
      
      if (targetElement) {
        const template = document.createElement('template');
        template.innerHTML = newHtmlSnippet;
        targetElement.replaceWith(template.content);

        container.querySelectorAll('[data-nexus-id]').forEach(el => el.removeAttribute('data-nexus-id'));

        setCanvasHtml(container.innerHTML);
        addAgentLog(`[MUTATION SUCCESS] ✅ Code remplacé sans détruire l'existant.`);
      } else {
        throw new Error(`Désynchronisation DOM : L'élément ${selectedNode.id} a été perdu.`);
      }

    } catch (error: any) {
      console.error("[MUTATION ERROR]:", error);
      addAgentLog(`[MUTATION CRITICAL] ${error.message}`);
    } finally {
      setIsMutating(false);
      setAgentState('idle');
    }
  };

  return { mutateTarget, isMutating };
}