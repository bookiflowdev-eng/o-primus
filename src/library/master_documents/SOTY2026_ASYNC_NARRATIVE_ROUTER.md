`<?xml version="1.0" encoding="UTF-8"?>`  
`<SOTY_MASTER_LIBRARY module="ASYNC_NARRATIVE_ROUTER" version="2026.2">`  
  `<LLM_PARSER_DIRECTIVE>`  
    `<INSTRUCTION>Un site à 100k€ ne "recharge" jamais. Ce document impose un Preloader mathématique (pas un faux timer) et un système de transition de page SPA (Single Page Application) simulant une narration continue.</INSTRUCTION>`  
  `</LLM_PARSER_DIRECTIVE>`

  `<ASSET_PRELOADER_MATHEMATICS>`  
    `<ARCHITECTURE>Écran noir absolu (#000000). Un compteur typographique géant au centre.</ARCHITECTURE>`  
    `<LOGIC>`  
      `<TRACKING>Intercepter toutes les requêtes réseau (Images, Vidéos, Fonts, Shaders WebGL) via Promise.all().</TRACKING>`  
      `<COUNTER_INTERPOLATION>`  
        `<RULE>Le compteur (0 à 100%) ne doit JAMAIS être linéaire.</RULE>`  
        `<MATH>Utiliser un LERP (Linear Interpolation) pour rattraper le pourcentage réel de chargement. Si le chargement bloque à 80%, le compteur ralentit asymptotiquement vers 80 sans jamais s'arrêter brutalement.</MATH>`  
        `<GSAP_CODE>gsap.to(counter, { val: targetPercent, roundProps: "val", onUpdate: updateText, ease: "power2.out" });</GSAP_CODE>`  
      `</COUNTER_INTERPOLATION>`  
    `</LOGIC>`  
    `<EXIT_CHOREOGRAPHY>`  
      `<TRIGGER>Quand Load == 100%</TRIGGER>`  
      `<ACTION_1>Le texte "100%" s'étire (font-stretch ou scaleX: 3) et se dissipe (opacity: 0, filter: blur(20px)).</ACTION_1>`  
      ``<ACTION_2>L'écran de preloader se lève comme un rideau lourd : `yPercent: -100, duration: 1.5, ease: "expo.inOut", delay: 0.2`</ACTION_2>``  
      `<ACTION_3>Déclencher la timeline globale d'entrée de la page d'accueil (Hero Reveal).</ACTION_3>`  
    `</EXIT_CHOREOGRAPHY>`  
  `</ASSET_PRELOADER_MATHEMATICS>`

  `<PAGE_TRANSITION_MATRIX>`  
    `<CONCEPT>La navigation entre /home et /about doit ressembler à un changement de plan de caméra au cinéma (Cut ou Pan), pas à un rechargement DOM.</CONCEPT>`  
      
    `<OUTGOING_PAGE_LOGIC (Leave)>`  
      `<INSTRUCTION>Geler (kill) toutes les instances ScrollTrigger actives pour libérer le CPU.</INSTRUCTION>`  
      `<ANIMATION>`  
        `L'ensemble du conteneur de la page sort vers le haut, mais avec un effet de parallaxe inverse.`  
        `` `yPercent: -20, scale: 0.9, opacity: 0, filter: "blur(10px)", duration: 0.8, ease: "power3.inOut"` ``  
      `</ANIMATION>`  
    `</OUTGOING_PAGE_LOGIC>`

    `<INCOMING_PAGE_LOGIC (Enter)>`  
      `<INSTRUCTION>Initialiser Lenis au sommet (scrollTo(0, {immediate: true})). Recalculer les matrices WebGL.</INSTRUCTION>`  
      `<ANIMATION>`  
        `La nouvelle page arrive par le bas en recouvrant l'ancienne.`  
        `` `yPercent: 100 -> 0, clip-path: inset(100% 0 0 0) -> inset(0% 0 0 0), duration: 1.2, ease: "expo.out"` ``  
      `</ANIMATION>`  
    `</INCOMING_PAGE_LOGIC>`  
      
    `<WEBGL_PERSISTENCE>`  
      `<RULE>Si un canvas WebGL est utilisé en arrière-plan, il NE DOIT PAS être détruit entre les pages. Il doit subir une transition de Shader (ex: distorsion liquide, effet de bruit fractal) pour masquer le changement de DOM HTML derrière lui.</RULE>`  
    `</WEBGL_PERSISTENCE>`  
  `</PAGE_TRANSITION_MATRIX>`  
`</SOTY_MASTER_LIBRARY>`  
