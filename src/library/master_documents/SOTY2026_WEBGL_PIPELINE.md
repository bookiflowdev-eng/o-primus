`<?xml version="1.0" encoding="UTF-8"?>`  
`<SOTY_MASTER_LIBRARY module="WEBGL_DOM_COMPOSITOR" version="2026.1">`  
  `<LLM_PARSER_DIRECTIVE>`  
    ``<INSTRUCTION>Ne générez PAS de simples balises `<img>`. Implémentez une architecture hybride : Un Canvas WebGL (OGL ou Three.js léger) en position: fixed, et des images HTML transparentes (opacity: 0) qui servent uniquement de Hitbox pour calculer la matrice de projection WebGL.</INSTRUCTION>``  
  `</LLM_PARSER_DIRECTIVE>`

  `<ARCHITECTURE_HYBRIDE>`  
    `<LAYER name="DOM_VIRTUAL">`  
      ``<PURPOSE>SEO, Accessibilité, Scroll Native, et calcul des dimensions via `getBoundingClientRect()`.</PURPOSE>``  
      `<CSS>opacity: 0; pointer-events: none; width: 100%; height: auto;</CSS>`  
    `</LAYER>`  
    `<LAYER name="WEBGL_CANVAS">`  
      `<PURPOSE>Rendu visuel exclusif. Les textures sont projetées sur des plans (Planes) dont les sommets (Vertices) correspondent aux Hitbox du DOM_VIRTUAL.</PURPOSE>`  
      `<CSS>position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; z-index: -1; pointer-events: none;</CSS>`  
    `</LAYER>`  
  `</ARCHITECTURE_HYBRIDE>`

  `<SHADER_ENGINE>`  
    `<UNIFORMS_OBLIGATOIRES>`  
      `<UNIFORM name="u_time" type="float" source="requestAnimationFrame" />`  
      `<UNIFORM name="u_resolution" type="vec2" source="window.innerWidth, window.innerHeight" />`  
      `<UNIFORM name="u_scrollOffset" type="float" source="Lenis.scroll" />`  
      `<UNIFORM name="u_hoverState" type="float" source="mouseEnter (0 to 1 interpolé via Spring)" />`  
      `<UNIFORM name="u_texture" type="sampler2D" source="Image DOM source" />`  
    `</UNIFORMS_OBLIGATOIRES>`

    `<VERTEX_SHADER_REQUIREMENT>`  
      `<GLSL_INSTRUCTION>`  
        `Intégrer une courbure parabolique basée sur l'axe Y pour simuler un cylindre lors du défilement.`  
        `` `gl_Position.z += sin(gl_Position.y * 3.14 + u_scrollOffset * 0.01) * 0.1;` ``  
      `</GLSL_INSTRUCTION>`  
    `</VERTEX_SHADER_REQUIREMENT>`

    `<FRAGMENT_SHADER_REQUIREMENT>`  
      `<GLSL_INSTRUCTION>`  
        `Créer une transition d'état au survol (u_hoverState) utilisant un bruit de Perlin (Simplex Noise) pour disperser les pixels (Effet de dissolution ou de verre dépoli). Interdit d'utiliser un simple mix(tex1, tex2).`  
      `</GLSL_INSTRUCTION>`  
    `</FRAGMENT_SHADER_REQUIREMENT>`  
  `</SHADER_ENGINE>`

  `<RESIZE_OBSERVER_SYNC>`  
    `<RULE>Lors du redimensionnement de la fenêtre, recalculer les matrices de projection WebGL SEULEMENT après un debounce de 250ms pour éviter de surcharger le CPU.</RULE>`  
  `</RESIZE_OBSERVER_SYNC>`  
`</SOTY_MASTER_LIBRARY>`  
