`<?xml version="1.0" encoding="UTF-8"?>`  
`<SOTY_MASTER_LIBRARY module="SPATIAL_TYPOGRAPHY_ENGINE" version="2026.1">`  
  `<LLM_PARSER_DIRECTIVE>`  
    ``<INSTRUCTION>Désactiver l'approche DOM 2D standard. Chaque caractère typographique (H1, H2, H3) doit être traité comme un élément dans un espace Z (Profondeur) utilisant `matrix3d` et des fontes variables (VF).</INSTRUCTION>``  
  `</LLM_PARSER_DIRECTIVE>`

  `<VARIABLE_FONT_ENGINE>`  
    `<AXES_MAPPING>`  
      `<!-- La graisse du texte augmente avec la progression du scroll de la section -->`  
      `<MAP axis="wght" source="ScrollTrigger.progress" rangeStart="200" rangeEnd="800" />`  
      `<!-- L'inclinaison (slant/italique) réagit à la vélocité du scroll -->`  
      `<MAP axis="slnt" source="ScrollTrigger.velocity" rangeStart="-10" rangeEnd="10" interpolation="linear" />`  
    `</AXES_MAPPING>`  
    `<PERFORMANCE_RULE>`  
      ``Ne jamais animer `font-weight` directement en CSS. Utiliser EXCLUSIVEMENT `font-variation-settings: 'wght' ${value}, 'slnt' ${value};` via GSAP pour optimiser le Paint du navigateur.``  
    `</PERFORMANCE_RULE>`  
  `</VARIABLE_FONT_ENGINE>`

  `<MATRIX_3D_CHOREOGRAPHY>`  
    `<TARGET>SplitText (Words & Chars)</TARGET>`  
    `<REVEAL_MATHEMATICS>`  
      `<TRANSFORM_ORIGIN>0% 100% -50px</TRANSFORM_ORIGIN>`  
      `<START_STATE>`  
        `transform: perspective(1000px) rotateX(90deg) rotateY(10deg) translateZ(-100px);`  
        `opacity: 0.01; /* Jamais 0 pour préserver le GPU layer */`  
      `</START_STATE>`  
      `<END_STATE>`  
        `transform: perspective(1000px) rotateX(0deg) rotateY(0deg) translateZ(0px);`  
        `opacity: 1;`  
      `</END_STATE>`  
      `<STAGGER>`  
        `amount: 0.8,`  
        `from: "random",`  
        `ease: "power1.inOut" <!-- Le seul ease standard autorisé pour lisser le random -->`  
      `</STAGGER>`  
    `</REVEAL_MATHEMATICS>`  
  `</MATRIX_3D_CHOREOGRAPHY>`

  `<ACCESSIBILITY_OVERRIDE>`  
    `<RULE>Le fractionnement typographique détruit les lecteurs d'écran (Screen Readers). L'IA DOIT générer la structure suivante :</RULE>`  
    `<DOM_STRUCTURE>`  
      `<![CDATA[`  
      `<h1 aria-label="Texte Complet Original">`  
        `<span aria-hidden="true" class="split-word">Texte</span>`  
        `<span aria-hidden="true" class="split-word">Complet</span>`  
      `</h1>`  
      `]]>`  
    `</DOM_STRUCTURE>`  
  `</ACCESSIBILITY_OVERRIDE>`  
`</SOTY_MASTER_LIBRARY>`  
