'use client';

import React, { useEffect, useRef } from 'react';
import { Activity, Monitor } from 'lucide-react';
import { useNexus } from '@/components/providers/NexusProvider';

interface CanvasPreviewProps {
  code: { html?: string; css?: string; js?: string; } | null;
  isLoading: boolean;
}

export default function CanvasPreview({ code, isLoading }: CanvasPreviewProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const { isSelectionMode } = useNexus();

  const injectNexusIds = (htmlString: string) => {
    if (!htmlString) return '';
    try {
      const container = document.createElement('div');
      container.innerHTML = htmlString;
      let idCounter = 1;

      const traverseAndTag = (node: Element) => {
        if (node.tagName !== 'SCRIPT' && node.tagName !== 'STYLE' && node.tagName !== 'NOSCRIPT') {
           node.setAttribute('data-nexus-id', `nexus-${idCounter++}`);
        }
        Array.from(node.children).forEach(child => traverseAndTag(child));
      };

      Array.from(container.children).forEach(child => traverseAndTag(child));
      return container.innerHTML;
    } catch (e) {
      return htmlString; 
    }
  };

  // 1. GÉNÉRATION DU DOCUMENT (Ne s'exécute QUE si le code change)
  useEffect(() => {
    if (!iframeRef.current || !code) return;

    const taggedHtml = injectNexusIds(code.html || '');
    const initialModeClass = isSelectionMode ? 'nexus-selection-mode' : '';

    const htmlContent = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <script src="https://cdn.tailwindcss.com"></script>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.14.2/gsap.min.js"></script>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.14.2/ScrollTrigger.min.js"></script>
        <script src="https://unpkg.com/split-type"></script>

        <style>
          html { scroll-behavior: smooth; }
          body { 
            margin: 0; padding: 0; background: transparent; color: #ffffff; 
            font-family: system-ui, -apple-system, sans-serif; overflow-x: hidden; 
          }
          ::-webkit-scrollbar { width: 8px; }
          ::-webkit-scrollbar-track { background: #000; }
          ::-webkit-scrollbar-thumb { background: #333; border-radius: 4px; }
          
          /* 🔴 ARCHITECTURE DE SÉLECTION BLINDÉE */
          
          /* Force le pointeur et rend cliquable TOUS les éléments taggés (ignore les calques de fond invisibles) */
          body.nexus-selection-mode [data-nexus-id] {
            cursor: crosshair !important;
            pointer-events: auto !important; 
          }
          
          /* Empêche de sélectionner du texte en cliquant accidentellement */
          body.nexus-selection-mode * {
            user-select: none !important;
          }
          
          /* Surlignage CSS ultra-fiable avec bordure intérieure */
          .nexus-hover-target {
            outline: 2px dashed #3b82f6 !important;
            outline-offset: -2px !important;
            background-color: rgba(59, 130, 246, 0.15) !important;
            box-shadow: inset 0 0 0 1px rgba(59, 130, 246, 0.3) !important;
            transition: none !important; /* Réactivité instantanée */
          }

          ${code.css || ''}
        </style>
      </head>
      <body class="${initialModeClass}">
        <div id="nexus-root">${taggedHtml}</div>
        
        <script>
          let currentHovered = null;

          // UNIQUE SOURCE DE VÉRITÉ : On lit la classe DOM en temps réel. Pas de variables JS désynchronisées.
          const isModeActive = () => document.body.classList.contains('nexus-selection-mode');

          // Écouteur pour la synchronisation forcée
          window.addEventListener('message', (event) => {
            if (event.data?.type === 'TOGGLE_SELECTION_MODE') {
              if (event.data.payload) {
                document.body.classList.add('nexus-selection-mode');
              } else {
                document.body.classList.remove('nexus-selection-mode');
                if (currentHovered) currentHovered.classList.remove('nexus-hover-target');
                currentHovered = null;
              }
            }
          });

          // Survol
          const handleHover = (e) => {
            if (!isModeActive()) return;
            e.stopPropagation();

            // closest() gère nativement la remontée dans l'arbre DOM (Règle le bug des SVG)
            const target = e.target.closest('[data-nexus-id]');
            
            if (!target || target.id === 'nexus-root') {
                if (currentHovered) {
                    currentHovered.classList.remove('nexus-hover-target');
                    currentHovered = null;
                }
                return;
            }

            if (target === currentHovered) return;
            
            if (currentHovered) currentHovered.classList.remove('nexus-hover-target');
            
            currentHovered = target;
            currentHovered.classList.add('nexus-hover-target');
          };

          // Capture agressive (true) pour ne pas être bloqué par les enfants
          document.addEventListener('mouseover', handleHover, true);
          document.addEventListener('mousemove', handleHover, true);

          // Clic
          document.addEventListener('click', (e) => {
            if (!isModeActive()) return;
            
            // Court-circuite formellement le navigateur
            e.preventDefault(); 
            e.stopPropagation();

            const target = e.target.closest('[data-nexus-id]');
            if (!target || target.id === 'nexus-root') return;

            // Flash visuel
            target.style.backgroundColor = 'rgba(59, 130, 246, 0.6)';
            setTimeout(() => {
                target.style.backgroundColor = '';
            }, 200);

            // Envoi des données vers Next.js
            window.parent.postMessage({
              type: 'NEXUS_NODE_SELECTED',
              payload: { 
                id: target.getAttribute('data-nexus-id'), 
                tagName: target.tagName, 
                html: target.outerHTML 
              }
            }, '*');

            // Auto-désactivation locale immédiate
            document.body.classList.remove('nexus-selection-mode');
            if (currentHovered) currentHovered.classList.remove('nexus-hover-target');
            currentHovered = null;
            
          }, true); // Le mode Capture (true) attrape le clic AVANT que la page Awwwards ne réagisse

          try { ${code.js || ''} } catch (e) { console.error('JS Error:', e) }
        </script>
      </body>
      </html>
    `;

    const doc = iframeRef.current?.contentDocument || iframeRef.current?.contentWindow?.document;
    if (doc) {
      doc.open(); 
      doc.write(htmlContent); 
      doc.close();
    }
  // 🔴 NOTE : isSelectionMode est VOLONTAIREMENT exclu du tableau de dépendances ici 
  // pour éviter de recharger l'iframe entière quand on clique sur le bouton bleu.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code]); 

  // 2. SYNCHRONISATION EN TEMPS RÉEL (Sans recharger l'Iframe)
  useEffect(() => {
    const doc = iframeRef.current?.contentDocument || iframeRef.current?.contentWindow?.document;
    
    // Frappe chirurgicale directe sur le DOM
    if (doc && doc.body) {
      if (isSelectionMode) {
        doc.body.classList.add('nexus-selection-mode');
      } else {
        doc.body.classList.remove('nexus-selection-mode');
        doc.querySelectorAll('.nexus-hover-target').forEach(el => el.classList.remove('nexus-hover-target'));
      }
    }
    
    // Filet de sécurité via PostMessage (si le DOM était en plein rendu)
    if (iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage({
        type: 'TOGGLE_SELECTION_MODE',
        payload: isSelectionMode
      }, '*');
    }
  }, [isSelectionMode]);

  return (
    <div className="relative w-full h-full p-2">
      <div 
        className={`relative flex items-center justify-center w-full h-full bg-[#050505] border rounded-xl overflow-hidden transition-all duration-300 ${
          isSelectionMode 
            ? 'border-blue-500/50 shadow-[0_0_30px_rgba(59,130,246,0.15)]' 
            : 'border-white/10 shadow-2xl'
        }`}
      >
        <iframe 
          ref={iframeRef} 
          className={`w-full h-full border-none relative z-10 transition-opacity duration-700 ease-out ${code ? 'opacity-100' : 'opacity-0'}`} 
          sandbox="allow-scripts allow-same-origin" 
        />

        {isLoading && (
          <div className="absolute inset-0 bg-black/40 backdrop-blur-md z-20 flex flex-col items-center justify-center gap-4 rounded-xl">
            <div className="relative flex items-center justify-center w-12 h-12">
              <svg className="absolute inset-0 w-full h-full animate-[spin_4s_linear_infinite]" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="48" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
                <circle cx="50" cy="50" r="48" fill="none" stroke="#ffffff" strokeWidth="1.5" strokeDasharray="300" strokeDashoffset="250" className="transition-all duration-700" />
              </svg>
              <Activity className="text-[#a0a0a0] w-4 h-4 animate-pulse" />
            </div>
            <div className="flex flex-col items-center gap-1.5">
              <span className="text-[10px] font-mono tracking-[0.2em] text-[#a0a0a0] uppercase">Compilation AST</span>
            </div>
          </div>
        )}
        
        {!code && !isLoading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-10">
            <div className="flex flex-col items-center gap-4 opacity-40 mix-blend-screen">
              <Monitor size={32} strokeWidth={1} className="text-white" />
              <p className="text-[10px] font-mono tracking-[0.2em] text-white uppercase">Canvas Standby</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}