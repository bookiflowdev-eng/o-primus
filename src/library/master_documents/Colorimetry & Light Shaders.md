\<?xml version="1.0" encoding="UTF-8"?\>  
\<SOTY\_MASTER\_LIBRARY module="COLORIMETRY\_AND\_DYNAMIC\_LIGHT\_SHADERS" version="2026.6"\>  
  \<LLM\_PARSER\_DIRECTIVE\>  
    \<INSTRUCTION\>Ce document régit le comportement de la lumière, de la couleur et de la texture spatiale de l'UI. INTERDICTION ABSOLUE d'utiliser des couleurs plates sans texture, des ombres portées (box-shadow) à une seule couche, ou d'interpoler des couleurs en RGB/HEX lors du scroll. L'UI doit simuler des matériaux physiques (Verre, Métal brossé, Vides profonds) réagissant à un éclairage dynamique piloté par l'utilisateur.\</INSTRUCTION\>  
  \</LLM\_PARSER\_DIRECTIVE\>

  \<COLOR\_SPACE\_ENGINE\>  
    \<DESCRIPTION\>L'espace RGB/HEX produit des couleurs grises et boueuses lors des transitions. Imposer l'espace OKLCH (Oklab) pour toute interpolation de couleur gérée par GSAP au défilement.\</DESCRIPTION\>  
    \<INTERPOLATION\_RULE\>  
      \<CSS\_VARIABLE\>--bg-color-current\</CSS\_VARIABLE\>  
      \<MATH\_TRANSITION\>  
        Au lieu de animer \`backgroundColor: "\#FF0000"\`, utiliser \`gsap.to(document.documentElement, { "--bg-color-current": "oklch(0.2 0.1 250)", ease: "none", scrollTrigger: { scrub: true } })\`  
      \</MATH\_TRANSITION\>  
    \</INTERPOLATION\_RULE\>  
    \<DARK\_MODE\_ABSOLUTE\>  
      \<BACKGROUND\>oklch(0.12 0.01 260)\</BACKGROUND\> \<\!-- Noir abyssal teinté de bleu nuit profond \--\>  
      \<TEXT\_PRIMARY\>oklch(0.95 0.01 260)\</TEXT\_PRIMARY\> \<\!-- Blanc cassé, jamais \#FFFFFF pur pour éviter la fatigue rétinienne \--\>  
    \</DARK\_MODE\_ABSOLUTE\>  
  \</COLOR\_SPACE\_ENGINE\>

  \<DYNAMIC\_LIGHTING\_MODEL\>  
    \<DESCRIPTION\>Système de "Spotlight" (Lampe torche) ou de Specular Highlight qui suit le curseur pour révéler les bordures et les fonds des cartes SaaS/Web3.\</DESCRIPTION\>  
    \<TRACKING\_MATHEMATICS\>  
      \<INSTRUCTION\>Capter la position de la souris par rapport au conteneur cible (et non la fenêtre) pour un éclairage localisé.\</INSTRUCTION\>  
      \<CODE\_LOGIC\>  
        x \= mouse.clientX \- rect.left;  
        y \= mouse.clientY \- rect.top;  
        Mettre à jour \`--mouse-x: ${x}px\` et \`--mouse-y: ${y}px\` via \`gsap.quickSetter\` (pas quickTo, pour du CSS var direct sans ease).  
      \</CODE\_LOGIC\>  
    \</TRACKING\_MATHEMATICS\>  
    \<SHADER\_IMPLEMENTATION target="Borders"\>  
      \<CSS\_PSEUDO\>::before (Sert de bordure lumineuse)\</CSS\_PSEUDO\>  
      \<CSS\_LOGIC\>  
        background: radial-gradient(  
          400px circle at var(--mouse-x) var(--mouse-y),   
          oklch(0.9 0.1 200 / 0.4), /\* Éclat central cyan/froid \*/  
          transparent 40%  
        );  
        padding: 1px; /\* Épaisseur de la bordure \*/  
        \-webkit-mask: linear-gradient(\#fff 0 0\) content-box, linear-gradient(\#fff 0 0);  
        \-webkit-mask-composite: xor;  
        mask-composite: exclude;  
      \</CSS\_LOGIC\>  
    \</SHADER\_IMPLEMENTATION\>  
    \<SHADER\_IMPLEMENTATION target="Surface"\>  
      \<CSS\_PSEUDO\>::after (Sert d'éclat interne)\</CSS\_PSEUDO\>  
      \<CSS\_LOGIC\>  
        background: radial-gradient(  
          800px circle at var(--mouse-x) var(--mouse-y),   
          oklch(0.9 0.1 200 / 0.03), /\* Lueur interne quasi imperceptible \*/  
          transparent 40%  
        );  
        pointer-events: none;  
      \</CSS\_LOGIC\>  
    \</SHADER\_IMPLEMENTATION\>  
  \</DYNAMIC\_LIGHTING\_MODEL\>

  \<MATERIAL\_PHYSICS\>  
    \<DESCRIPTION\>Simulation de la profondeur, de la réfraction et de la masse via des filtres et ombres multi-couches.\</DESCRIPTION\>  
    \<MATERIAL id="volumetric\_glass"\>  
      \<BASE\>background: linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.005) 100%);\</BASE\>  
      \<BLUR\>backdrop-filter: blur(24px) saturate(150%) contrast(110%);\</BLUR\>  
      \<INNER\_SHADOW\>box-shadow: inset 0 1px 0 rgba(255,255,255,0.1), inset 0 \-1px 0 rgba(0,0,0,0.2);\</INNER\_SHADOW\>  
    \</MATERIAL\>  
    \<SMOOTH\_SHADOW\_ELEVATION\>  
      \<DESCRIPTION\>Interdiction stricte d'utiliser un seul \`box-shadow\`. Utiliser une élévation de 6 couches (Tobias Ahlin method) pour simuler la lumière physique.\</DESCRIPTION\>  
      \<SHADOW\_HEAVY\>  
        box-shadow:   
          0 2.8px 2.2px rgba(0, 0, 0, 0.034),  
          0 6.7px 5.3px rgba(0, 0, 0, 0.048),  
          0 12.5px 10px rgba(0, 0, 0, 0.06),  
          0 22.3px 17.9px rgba(0, 0, 0, 0.072),  
          0 41.8px 33.4px rgba(0, 0, 0, 0.086),  
          0 100px 80px rgba(0, 0, 0, 0.12);  
      \</SHADOW\_HEAVY\>  
    \</SMOOTH\_SHADOW\_ELEVATION\>  
  \</MATERIAL\_PHYSICS\>

  \<CINEMATIC\_NOISE\_COMPOSITOR\>  
    \<DESCRIPTION\>Élimination du "Color Banding" (stries dans les dégradés) et ajout d'une texture premium type pellicule 35mm.\</DESCRIPTION\>  
    \<ARCHITECTURE\>Un div plein écran (\`z-index: 9999\`, \`pointer-events: none\`) superposé à TOUTE l'interface.\</ARCHITECTURE\>  
    \<NOISE\_GENERATOR\>  
      \<SVG\_DATA\_URI\>  
        background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");  
      \</SVG\_DATA\_URI\>  
      \<BLEND\_MODE\>  
        mix-blend-mode: overlay; /\* Obligatoire pour s'intégrer à la lumière \*/  
        opacity: 0.04; /\* Jamais au-dessus de 0.06 sinon l'UI a l'air "sale" \*/  
      \</BLEND\_MODE\>  
    \</NOISE\_GENERATOR\>  
    \<ANIMATION\>  
      \<INSTRUCTION\>Pour donner vie au grain, animer la position du background très subtilement en JS ou via un keyframe CSS steps().\</INSTRUCTION\>  
      \<CSS\_KEYFRAME\>  
        @keyframes grain {  
          0%, 100% { transform: translate(0, 0); }  
          10% { transform: translate(-1%, \-1%); }  
          30% { transform: translate(1%, \-2%); }  
          50% { transform: translate(-2%, 1%); }  
          70% { transform: translate(2%, 2%); }  
          90% { transform: translate(-1%, 2%); }  
        }  
        animation: grain 2s steps(4) infinite;  
      \</CSS\_KEYFRAME\>  
    \</ANIMATION\>  
  \</CINEMATIC\_NOISE\_COMPOSITOR\>  
\</SOTY\_MASTER\_LIBRARY\>  
