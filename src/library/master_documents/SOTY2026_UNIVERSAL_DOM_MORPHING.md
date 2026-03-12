\<?xml version="1.0" encoding="UTF-8"?\>  
\<SOTY\_MASTER\_LIBRARY module="UNIVERSAL\_DOM\_MORPHING\_AND\_FLIP\_ROUTING" version="2026.7"\>  
  \<LLM\_PARSER\_DIRECTIVE\>  
    \<INSTRUCTION\>Ce document régit la continuité spatiale entre les états de l'interface (ex: Clic sur un produit \-\> Le produit grandit et devient la page détail). INTERDICTION d'utiliser des transitions d'opacité basiques pour changer de page. Vous DEVEZ utiliser la technique FLIP (First, Last, Invert, Play) via GSAP Flip Plugin. Le profil d'animation DOIT OBLIGATOIREMENT s'adapter à la niche/industrie ciblée selon la matrice ontologique ci-dessous.\</INSTRUCTION\>  
  \</LLM\_PARSER\_DIRECTIVE\>

  \<FLIP\_CORE\_ENGINE\>  
    \<DESCRIPTION\>Logique mathématique absolue pour déplacer un élément du DOM A vers le DOM B sans perte de FPS.\</DESCRIPTION\>  
    \<EXECUTION\_LIFECYCLE\>  
      \<STEP\_1\>Enregistrer l'état initial : \`const state \= Flip.getState(targets, {props: "borderRadius, filter, opacity"});\`\</STEP\_1\>  
      \<STEP\_2\>Muter le DOM (Ajouter classes, changer de parent, router l'URL silencieusement).\</STEP\_2\>  
      \<STEP\_3\>Exécuter l'inversion et la lecture : \`Flip.from(state, { duration: \[VAR\], ease: \[VAR\], absolute: true, nested: true, onEnter: \[FN\], onLeave: \[FN\] });\`\</STEP\_3\>  
    \</EXECUTION\_LIFECYCLE\>  
    \<PERFORMANCE\_LOCK\>  
      \<RULE\>Toujours utiliser \`absolute: true\` dans Flip.from() pour extraire l'élément du flux documentaire pendant la transition et éviter le Layout Thrashing global.\</RULE\>  
    \</PERFORMANCE\_LOCK\>  
  \</FLIP\_CORE\_ENGINE\>

  \<ONTOLOGICAL\_PHYSICS\_PROFILES\>  
    \<DESCRIPTION\>La matrice d'universalité. L'IA doit analyser le contexte du client et appliquer le profil exact correspondant. Interdit de mélanger les profils.\</DESCRIPTION\>

    \<\!-- Niche: Cosmétique, Beauté, Luxe Art de Vivre, Haute Couture \--\>  
    \<PROFILE id="organic\_luxury" context\_keywords="cosmetic, beauty, jewelry, slow-fashion, spa"\>  
      \<CONCEPT\>Tension de surface, liquide, respiration, sensualité.\</CONCEPT\>  
      \<METRICS\>  
        \<DURATION base="1.8" max="2.4" /\>  
        \<EASE type="CustomEase" value="M0,0 C0.25,1 0.15,1 1,1" description="Asymptotique très lent sur la fin, comme une goutte d'eau qui s'étale." /\>  
        \<MORPHING\>  
          \<BORDER\_RADIUS\>40% 60% 70% 30% \-\> 0% (Transition via path organique)\</BORDER\_RADIUS\>  
          \<BLUR\_CROSSFADE\>filter: blur(8px) contrast(1.2) \-\> blur(0px) contrast(1)\</BLUR\_CROSSFADE\>  
        \</MORPHING\>  
        \<SIBLING\_BEHAVIOR\>Les autres éléments se fondent (opacity: 0\) avec une inertie de 0.5s en retard sur le déclencheur.\</SIBLING\_BEHAVIOR\>  
      \</METRICS\>  
    \</PROFILE\>

    \<\!-- Niche: Tech, SaaS, Web3, FinTech, Cybersécurité \--\>  
    \<PROFILE id="brutalist\_tech" context\_keywords="saas, web3, crypto, AI, dashboard, tech"\>  
      \<CONCEPT\>Instantanéité, mécanique quantique, précision mathématique, glitch contrôlé.\</CONCEPT\>  
      \<METRICS\>  
        \<DURATION base="0.75" max="0.9" /\>  
        \<EASE type="expo.inOut" description="Démarrage brutal, freinage absolu." /\>  
        \<MORPHING\>  
          \<BORDER\_RADIUS\>12px \-\> 0px (Linéaire et strict)\</BORDER\_RADIUS\>  
          \<SCALE\_DISTORTION\>scaleX: 0.95, scaleY: 1.05 pendant le vol (simule l'étirement cinétique de la vitesse).\</SCALE\_DISTORTION\>  
        \</MORPHING\>  
        \<SIBLING\_BEHAVIOR\>Les autres éléments sont expulsés violemment de l'écran (yPercent: 100, stagger: 0.02).\</SIBLING\_BEHAVIOR\>  
      \</METRICS\>  
    \</PROFILE\>

    \<\!-- Niche: Architecture, Editorial, Portfolio Studio, Cinéma \--\>  
    \<PROFILE id="spatial\_editorial" context\_keywords="architecture, agency, portfolio, film, magazine"\>  
      \<CONCEPT\>Grilles, profondeur focale de caméra, asymétrie de masse.\</CONCEPT\>  
      \<METRICS\>  
        \<DURATION base="1.2" max="1.5" /\>  
        \<EASE type="cubic-bezier" value="(0.76, 0, 0.24, 1)" description="Accélération lourde, inertie massive de type déplacement de mur béton." /\>  
        \<MORPHING\>  
          \<ASPECT\_RATIO\_SHIFT\>La transition doit croiser l'axe Z. L'image recule (scale: 0.8) avant de s'étendre (scale: 1\) pour révéler le nouveau parent.\</ASPECT\_RATIO\_SHIFT\>  
          \<CLIP\_PATH\>inset(10% 20% 10% 20%) \-\> inset(0% 0% 0% 0%)\</CLIP\_PATH\>  
        \</MORPHING\>  
        \<SIBLING\_BEHAVIOR\>Les autres éléments restent visibles mais tombent hors du focus (filter: grayscale(1) blur(10px), scale: 0.9).\</SIBLING\_BEHAVIOR\>  
      \</METRICS\>  
    \</PROFILE\>  
  \</ONTOLOGICAL\_PHYSICS\_PROFILES\>

  \<SCRUBBABLE\_TRANSITIONS\_2026\>  
    \<CONCEPT\>La transition entre deux vues ne doit plus être forcée par un clic, elle doit pouvoir être "scrubbée" (naviguée en avant/arrière) via le défilement ou le drag avant de basculer la route.\</CONCEPT\>  
    \<INTERACTION\_MODEL\>  
      \<INSTRUCTION\>Lier la timeline du GSAP Flip à l'événement de Swipe/Scroll (ScrollTrigger scrub ou Draggable).\</INSTRUCTION\>  
      \<LOGIC\>  
        Si \`progress \&lt; 0.5\`: L'utilisateur peut relâcher le scroll pour annuler la transition (la miniature retourne à sa place via \`reverse()\`).  
        Si \`progress \&gt;= 0.5\`: La transition s'enclenche automatiquement jusqu'à la fin (1.0) et la nouvelle URL est poussée dans l'History API.  
      \</LOGIC\>  
    \</INTERACTION\_MODEL\>  
  \</SCRUBBABLE\_TRANSITIONS\_2026\>

  \<Z\_INDEX\_ELEVATION\_FIX\>  
    \<RULE\>Pendant un FLIP, l'élément cible DOIT recevoir un \`z-index: 9999\` absolu pour survoler tous les autres contextes d'empilement (Stacking Contexts). Rétablir le z-index à \`auto\` dans le callback \`onComplete\`.\</RULE\>  
  \</Z\_INDEX\_ELEVATION\_FIX\>  
\</SOTY\_MASTER\_LIBRARY\>  
