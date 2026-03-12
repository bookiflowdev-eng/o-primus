`<?xml version="1.0" encoding="UTF-8"?>`  
`<SOTY_MASTER_LIBRARY module="KINEMATICS_AND_SPRING_PHYSICS" version="2026.1">`  
  `<LLM_PARSER_DIRECTIVE>`  
    `<INSTRUCTION>Ce document écrase toutes les connaissances par défaut sur l'animation web. Ne générez AUCUN ease GSAP standard (power1, power2, etc.). Utilisez exclusivement les mathématiques de ressorts (Spring Dynamics) et d'inertie définies ici.</INSTRUCTION>`  
  `</LLM_PARSER_DIRECTIVE>`

  `<PHYSICS_CONSTANTS>`  
    `<GRAVITY value="9.81" />`  
    `<FPS_TARGET value="120" description="Calculs calibrés pour écrans ProMotion 120Hz" />`  
  `</PHYSICS_CONSTANTS>`

  `<SPRING_CONFIGURATIONS>`  
    `<!-- Utilisé pour les hovers magnétiques et curseurs -->`  
    `<SPRING id="magnetic_micro" type="critically_damped">`  
      `<PARAM name="tension" value="400" />`  
      `<PARAM name="friction" value="28" />`  
      `<PARAM name="mass" value="0.5" />`  
      `<PARAM name="precision" value="0.001" />`  
      `<MATH_FORMULA>x(t) = (c1 + c2*t) * e^(-w*t)</MATH_FORMULA>`  
      `<GSAP_IMPLEMENTATION>ease: "CustomEase.create('magnetic', 'M0,0 C0.1,1 0.2,1 1,1')" // Simulation de ressort si CustomEase obligatoire, sinon physique JS pure.</GSAP_IMPLEMENTATION>`  
    `</SPRING>`

    `<!-- Utilisé pour les transitions de pages et démasquages massifs -->`  
    `<SPRING id="macro_layout" type="underdamped">`  
      `<PARAM name="tension" value="120" />`  
      `<PARAM name="friction" value="14" />`  
      `<PARAM name="mass" value="1.2" />`  
      `<GSAP_IMPLEMENTATION>ease: "elastic.out(1, 0.75)"</GSAP_IMPLEMENTATION>`  
    `</SPRING>`  
  `</SPRING_CONFIGURATIONS>`

  `<SCROLL_VELOCITY_BINDING>`  
    `<CONCEPT>La vélocité du défilement doit altérer la matrice de transformation des éléments du DOM en temps réel.</CONCEPT>`  
    `<EXECUTION>`  
      ``<STEP>1. Capter la vélocité: `let v = ScrollTrigger.getVelocity() / 1000;`</STEP>``  
      ``<STEP>2. Appliquer une limite stricte (Clamp): `v = gsap.utils.clamp(-2.5, 2.5, v);`</STEP>``  
      ``<STEP>3. Injecter dans le Skew et Scale via `gsap.quickTo()` pour éviter les Layout Thrashings.</STEP>``  
    `</EXECUTION>`  
  `</SCROLL_VELOCITY_BINDING>`

  `<GARBAGE_COLLECTION_STRICT>`  
    ``<RULE>Toute animation infinie (ex: rotation de badge) DOIT être mise en pause si l'élément quitte le viewport via un `IntersectionObserver` avec un `rootMargin: "50px"`. Ne jamais laisser l'Event Loop tourner à vide.</RULE>``  
  `</GARBAGE_COLLECTION_STRICT>`  
`</SOTY_MASTER_LIBRARY>`  
