'use client';

import React, { useEffect, useRef } from 'react';
import { Monitor, Activity } from 'lucide-react';

interface CanvasPreviewProps {
  code: {
    html?: string;
    css?: string;
    js?: string;
    assets?: string[];
  } | null;
  isLoading: boolean;
}

export default function CanvasPreview({ code, isLoading }: CanvasPreviewProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (!iframeRef.current || !code) return;

    // CONSTRUCTION DE L'AST DOM (Avec injection du Pont Neural Nexus)
    const htmlContent = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Nexus Active Canvas</title>
        
        <script src="https://cdn.tailwindcss.com"></script>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.14.2/gsap.min.js"></script>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.14.2/ScrollTrigger.min.js"></script>
        <script src="https://unpkg.com/lenis@1.3.17/dist/lenis.min.js"></script>

        <style>
          /* Base Awwwards */
          body { 
            margin: 0; 
            padding: 0; 
            background: #000000; 
            color: #ffffff; 
            font-family: system-ui, -apple-system, sans-serif; 
            overflow-x: hidden; 
            -webkit-font-smoothing: antialiased;
          }
          
          ::-webkit-scrollbar { width: 0px; display: none; }

          /* * NEXUS VISUAL INSPECTOR (Magic Click)
           * Le style n'affecte pas le layout (box-shadow inset)
           */
          [data-nexus-id] {
            transition: box-shadow 0.2s ease, background-color 0.2s ease;
            cursor: crosshair !important;
          }
          [data-nexus-id]:hover {
            box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.3) !important;
            background-color: rgba(255, 255, 255, 0.02) !important;
          }

          /* CSS Utilisateur */
          ${code.css || ''}
        </style>
      </head>
      <body>
        
        <div id="nexus-root">
          ${code.html || ''}
        </div>

        <script>
          // 1. Moteur Physique (Synchronisation stricte GSAP x Lenis)
          const lenis = new Lenis({ duration: 1.2, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)) });
          gsap.ticker.add((time) => { lenis.raf(time * 1000) });
          gsap.ticker.lagSmoothing(0);

          // 2. Pont Neural Nexus (Communication Iframe -> OS Parent)
          document.addEventListener('click', (e) => {
            const target = e.target.closest('[data-nexus-id]');
            if (!target) return;
            
            // Bloque le comportement natif (ex: clic sur un lien <a>)
            e.preventDefault();
            e.stopPropagation();

            const nexusId = target.getAttribute('data-nexus-id');
            const htmlContent = target.outerHTML;

            // Envoi de l'AST localisé au parent (page.tsx)
            window.parent.postMessage({
              type: 'NEXUS_NODE_SELECTED',
              payload: { id: nexusId, html: htmlContent }
            }, '*');
          }, true);

          // 3. Exécution du Code Généré
          try {
            ${code.js || ''}
          } catch (e) {
            console.error("[NEXUS RUNTIME ERROR]:", e);
          }
        </script>
      </body>
      </html>
    `;

    const doc = iframeRef.current.contentDocument || iframeRef.current.contentWindow?.document;
    if (doc) {
      doc.open();
      doc.write(htmlContent);
      doc.close();
    }
  }, [code]);

  return (
    <div className="relative w-full h-full p-2">
      <div className="relative flex items-center justify-center w-full h-full bg-[#030303] border border-white/[0.08] rounded-xl overflow-hidden shadow-2xl">
        
        {/* Grille Millimétrique de fond (Sober Premium) */}
        <div 
          className="absolute inset-0 z-0 pointer-events-none opacity-20"
          style={{ 
            backgroundImage: `linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)`,
            backgroundSize: '24px 24px',
            maskImage: 'radial-gradient(ellipse at center, black 20%, transparent 80%)',
            WebkitMaskImage: 'radial-gradient(ellipse at center, black 20%, transparent 80%)'
          }}
        />

        {/* L'Iframe Rendu */}
        <iframe 
          ref={iframeRef} 
          className={`w-full h-full border-none relative z-10 transition-opacity duration-700 ease-out ${code ? 'opacity-100' : 'opacity-0'}`}
          title="Nexus Live Canvas"
          sandbox="allow-scripts allow-same-origin"
        />

        {/* LOADING STATE : Typographie Mathématique et Furtive */}
        {isLoading && (
          <div className="absolute inset-0 bg-[#030303]/90 backdrop-blur-sm z-20 flex flex-col items-center justify-center gap-4">
            <div className="relative flex items-center justify-center w-12 h-12">
              <svg className="absolute inset-0 w-full h-full animate-[spin_4s_linear_infinite]" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="48" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
                <circle cx="50" cy="50" r="48" fill="none" stroke="#ffffff" strokeWidth="1.5" strokeDasharray="300" strokeDashoffset="250" className="transition-all duration-700" />
              </svg>
              <Activity className="text-[#a0a0a0] w-4 h-4 animate-pulse" />
            </div>
            <div className="flex flex-col items-center gap-1.5">
              <span className="text-[10px] font-mono tracking-[0.2em] text-[#a0a0a0] uppercase">
                Compilation AST
              </span>
              <div className="w-24 h-[1px] bg-white/[0.05] overflow-hidden">
                <div className="h-full bg-white animate-[translateX_1.5s_infinite_ease-in-out] w-1/3" />
              </div>
            </div>
          </div>
        )}

        {/* EMPTY STATE : Brutalisme & Espace */}
        {!code && !isLoading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-10">
            <div className="flex flex-col items-center gap-4 opacity-40 mix-blend-screen">
              <Monitor size={32} strokeWidth={1} className="text-white" />
              <p className="text-[10px] font-mono tracking-[0.2em] text-white uppercase">
                Canvas Standby
              </p>
            </div>
          </div>
        )}

      </div>

      <style jsx>{`
        @keyframes translateX {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(300%); }
        }
      `}</style>
    </div>
  );
}