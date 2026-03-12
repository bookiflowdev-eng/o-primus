\<?xml version="1.0" encoding="UTF-8"?\>  
\<SOTY\_MASTER\_LIBRARY module="BENTHAL\_GRID\_AND\_DATA\_DISTORTION" version="2026.3"\>  
  \<LLM\_PARSER\_DIRECTIVE\>  
    \<INSTRUCTION\>Ce document régit l'affichage des collections de données (Portfolios, E-commerce, Dashboards). Interdiction absolue d'utiliser des bibliothèques de grille tierces. La grille doit être asymétrique, fluide, et ses éléments (cartes/images) doivent subir des distorsions mathématiques basées sur la vélocité du scroll de l'utilisateur.\</INSTRUCTION\>  
  \</LLM\_PARSER\_DIRECTIVE\>

  \<SPATIAL\_GRID\_ARCHITECTURE\>  
    \<CONCEPT\>Benthal Asymmetry. Les colonnes ne défilent pas à la même vitesse. L'espace négatif est aussi important que le contenu.\</CONCEPT\>  
    \<CSS\_FOUNDATION\>  
      display: grid;  
      grid-template-columns: repeat(12, 1fr);  
      gap: 2vw; /\* Unité relativeViewport stricte \*/  
      align-items: start;  
    \</CSS\_FOUNDATION\>  
    \<PLACEMENT\_LOGIC\>  
      \<RULE\>Forcer une asymétrie via \`nth-child\` ou des classes utilitaires.\</RULE\>  
      \<ITEM\_ODD\>grid-column: 2 / 7; margin-top: 15vh;\</ITEM\_ODD\>  
      \<ITEM\_EVEN\>grid-column: 7 / 12; margin-top: \-5vh;\</ITEM\_EVEN\>  
    \</PLACEMENT\_LOGIC\>  
  \</SPATIAL\_GRID\_ARCHITECTURE\>

  \<VELOCITY\_DISTORTION\_ENGINE\>  
    \<CONCEPT\>Le DOM doit réagir physiquement à l'action de l'utilisateur. Plus le scroll est violent, plus la grille se déforme (Effet Doppler / Inertie visuelle).\</CONCEPT\>  
    \<EXECUTION\>  
      \<STEP\_1\>Capter la vélocité globale : \`let velocity \= ScrollTrigger.getVelocity();\`\</STEP\_1\>  
      \<STEP\_2\>Créer un Proxy de distorsion via \`gsap.quickTo\` pour chaque élément de la grille afin d'éviter le blocage du Main Thread.\</STEP\_2\>  
      \<MATHEMATICS\>  
        \<SKEW\_Y\>  
          clamp: \`let clampedSkew \= gsap.utils.clamp(-8, 8, velocity / 300);\`  
          apply: \`skewYTo(clampedSkew)\`  
        \</SKEW\_Y\>  
        \<SCALE\_Z\>  
          \<DESCRIPTION\>Simuler l'écrasement aérodynamique.\</DESCRIPTION\>  
          clamp: \`let clampedScale \= gsap.utils.clamp(0.9, 1, 1 \- Math.abs(velocity / 5000));\`  
          apply: \`scaleTo(clampedScale)\`  
        \</SCALE\_Z\>  
      \</MATHEMATICS\>  
      \<RESET\_SPRING\>  
        \<INSTRUCTION\>Lorsque la vélocité retombe à 0, les éléments doivent revenir à leur état initial avec une physique de ressort.\</INSTRUCTION\>  
        \<CODE\>ease: "elastic.out(1, 0.4)", duration: 0.8\</CODE\>  
      \</RESET\_SPRING\>  
    \</EXECUTION\>  
  \</VELOCITY\_DISTORTION\_ENGINE\>

  \<ASYNC\_PARALLAX\_SCROLLING\>  
    \<CONCEPT\>Découpler le mouvement de la boîte (Conteneur) du mouvement de son contenu (Image/Média) pour créer une profondeur focale infinie.\</CONCEPT\>  
    \<WRAPPER\>  
      \<CSS\>overflow: hidden; will-change: transform;\</CSS\>  
      \<ACTION\>Défilement standard ou altéré via \`data-speed\` (ex: 0.8 pour un léger retard).\</ACTION\>  
    \</WRAPPER\>  
    \<MEDIA\_CHILD\>  
      \<CSS\>height: 120%; width: 100%; transform-origin: center center; object-fit: cover;\</CSS\>  
      \<ACTION\>Défilement inversé au scrub (\`yPercent: \-20\` vers \`yPercent: 0\`) synchronisé avec l'entrée et la sortie du viewport.\</ACTION\>  
      \<PERFORMANCE\>Utiliser \`requestAnimationFrame\` ou un ScrollTrigger configuré avec \`scrub: true\` et \`invalidateOnRefresh: true\`.\</PERFORMANCE\>  
    \</MEDIA\_CHILD\>  
  \</ASYNC\_PARALLAX\_SCROLLING\>

  \<MAGNETIC\_REPULSION\_HOVER\>  
    \<CONCEPT\>Au survol d'un élément de la grille, l'élément s'élève (Z-index), tandis que ses voisins immédiats sont repoussés physiquement et perdent le focus (Blur).\</CONCEPT\>  
    \<TARGET\_ITEM\>  
      \<HOVER\>scale: 1.05, zIndex: 10, duration: 0.4, ease: "power3.out"\</HOVER\>  
    \</TARGET\_ITEM\>  
    \<SIBLING\_ITEMS\>  
      \<HOVER\>  
        Calculer le vecteur directionnel depuis l'élément survolé.  
        Si le frère est à gauche: \`x: \-2%\`  
        Si le frère est à droite: \`x: 2%\`  
        Global: \`scale: 0.95, filter: "blur(5px)", opacity: 0.5\`  
      \</HOVER\>  
    \</SIBLING\_ITEMS\>  
  \</MAGNETIC\_REPULSION\_HOVER\>

  \<PERFORMANCE\_GUARDRAILS\>  
    \<RULE\_1\>Désactiver INTÉGRALEMENT \`VELOCITY\_DISTORTION\_ENGINE\` sur mobile (\`window.innerWidth \&lt; 1024\`). Le GPU mobile ne supporte pas le calcul de Skew massif à 60fps.\</RULE\_1\>  
    \<RULE\_2\>Utiliser le CSS \`content-visibility: auto;\` sur les lignes de la grille qui sont hors de l'écran (IntersectionObserver) pour shunter le rendu Paint du navigateur.\</RULE\_2\>  
    \<RULE\_3\>Les images de la grille DOIVENT être chargées en \`loading="lazy"\` avec un placeholder basique (ex: hash de couleur dominante) généré côté serveur ou via un tiny-canvas avant le montage WebGL.\</RULE\_3\>  
  \</PERFORMANCE\_GUARDRAILS\>  
\</SOTY\_MASTER\_LIBRARY\>  
