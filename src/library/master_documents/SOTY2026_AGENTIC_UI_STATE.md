`<?xml version="1.0" encoding="UTF-8"?>`  
`<SOTY_MASTER_LIBRARY module="AGENTIC_UI_STATE_MACHINE" version="2026.2">`  
  `<LLM_PARSER_DIRECTIVE>`  
    `<INSTRUCTION>Ce document régit le comportement du Curseur Personnalisé (Custom Cursor) et de la Navigation (Fullscreen Menu). Interdit d'utiliser cursor: pointer; ou des animations CSS top/left. Le curseur est un élément DOM piloté par GSAP quickTo() avec une machine à états stricte.</INSTRUCTION>`  
  `</LLM_PARSER_DIRECTIVE>`

  `<CURSOR_STATE_MACHINE>`  
    `<ARCHITECTURE>`  
      ``<DOM>Un div conteneur (#cursor-wrapper) avec `pointer-events: none`, contenant un point central (dot) et un anneau de suivi (follower) avec un label texte injecté dynamiquement.</DOM>``  
      `<CSS_BASE>mix-blend-mode: difference; z-index: 9999; position: fixed; transform: translate3d(0,0,0);</CSS_BASE>`  
    `</ARCHITECTURE>`

    `<STATES>`  
      `<STATE id="default">`  
        `<PROPERTIES>scale: 1, opacity: 1, text: "", backgroundColor: "#FFFFFF"</PROPERTIES>`  
        `<SPRING_DYNAMICS>follower_duration: 0.15, ease: "power2.out"</SPRING_DYNAMICS>`  
      `</STATE>`  
        
      `<STATE id="hover_magnetic" trigger="[data-cursor='magnetic']">`  
        `<PROPERTIES>scale: 0 (le dot disparaît), l'anneau s'agrandit (scale: 3) et s'ancre (snap) au centre géométrique de l'élément survolé.</PROPERTIES>`  
        `<MATHEMATICS>`  
          `` Calculer le centre: `let cx = rect.left + rect.width / 2;` ``  
          `` Inertie du snap: `ease: "elastic.out(1, 0.4)"` ``  
        `</MATHEMATICS>`  
      `</STATE>`

      `<STATE id="hover_media" trigger="[data-cursor='video'], [data-cursor='image']">`  
        `<PROPERTIES>scale: 5, backgroundColor: "transparent", border: "1px solid rgba(255,255,255,0.5)", backdropFilter: "blur(4px)"</PROPERTIES>`  
        `<INJECTION>Injecter le texte (ex: "PLAY" ou "VIEW") avec une animation SplitText (stagger: 0.02) au centre du curseur.</INJECTION>`  
      `</STATE>`

      `<STATE id="drag" trigger="[data-cursor='drag']">`  
        `<PROPERTIES>scale: 4, text: "← DRAG →", mixBlendMode: "normal"</PROPERTIES>`  
        `<ON_MOUSEDOWN>scale: 3, backgroundColor: "rgba(255,255,255,0.1)"</ON_MOUSEDOWN>`  
      `</STATE>`  
    `</STATES>`

    `<PERFORMANCE_EXECUTION>`  
      `<CODE_LOGIC>`  
        `<![CDATA[`  
        `// Seule méthode autorisée pour bouger le curseur`  
        `let xTo = gsap.quickTo(cursor, "x", {duration: 0.1, ease: "power3"});`  
        `let yTo = gsap.quickTo(cursor, "y", {duration: 0.1, ease: "power3"});`  
        `window.addEventListener("mousemove", e => { xTo(e.clientX); yTo(e.clientY); });`  
        `]]>`  
      `</CODE_LOGIC>`  
      ``<RESTRICTION>Désactiver intégralement cette machine à états si `window.matchMedia("(pointer: coarse)").matches` (Mobile/Tablette).</RESTRICTION>``  
    `</PERFORMANCE_EXECUTION>`  
  `</CURSOR_STATE_MACHINE>`

  `<MENU_CINEMATIC_CHOREOGRAPHY>`  
    `<TRIGGER>Clic sur le composant Hamburger / Menu Toggle.</TRIGGER>`  
    `<REVEAL_SEQUENCE>`  
      `<STEP order="1" target="Background">`  
        `<ACTION>clip-path: polygon(0% 100%, 100% 100%, 100% 100%, 0% 100%) -> polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)</ACTION>`  
        `<TIMING>duration: 1.2, ease: "expo.inOut"</TIMING>`  
      `</STEP>`  
      `<STEP order="2" target="Current_Page_Content">`  
        `<ACTION>Simuler l'enfoncement 3D de la page en arrière-plan pendant que le menu s'ouvre.</ACTION>`  
        `<MATHEMATICS>scale: 0.95, filter: "blur(10px)", yPercent: 5</MATHEMATICS>`  
        `<TIMING>Synchronisé avec STEP 1 (duration: 1.2)</TIMING>`  
      `</STEP>`  
      `<STEP order="3" target="Menu_Links">`  
        `<ACTION>Apparition asynchrone des liens de navigation (Kinetic Typography).</ACTION>`  
        `<MATHEMATICS>yPercent: 100, rotationZ: 5 -> yPercent: 0, rotationZ: 0</MATHEMATICS>`  
        `<TIMING>stagger: 0.05, delay: 0.4, ease: "power4.out"</TIMING>`  
      `</STEP>`  
    `</REVEAL_SEQUENCE>`  
  `</MENU_CINEMATIC_CHOREOGRAPHY>`  
`</SOTY_MASTER_LIBRARY>`  
