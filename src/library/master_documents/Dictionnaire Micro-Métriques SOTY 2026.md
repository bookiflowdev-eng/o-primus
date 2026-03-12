\<?xml version="1.0" encoding="UTF-8"?\>  
\<SOTY\_MASTER\_LIBRARY module="MICRO\_METRICS\_AND\_SPATIAL\_COORDINATES" version="2026.5"\>  
  \<LLM\_PARSER\_DIRECTIVE\>  
    \<INSTRUCTION\>Ceci est le dictionnaire absolu des coordonnées. L'IA a l'INTERDICTION STRICTE d'inventer des valeurs numériques (durées, pixels, pourcentages, degrés, courbes de bézier) pour les animations. Vous DEVEZ extraire et appliquer exclusivement les matrices de ce document pour garantir un rendu fluide, lourd et organique de niveau Awwwards SOTY.\</INSTRUCTION\>  
  \</LLM\_PARSER\_DIRECTIVE\>

  \<EASING\_TOPOLOGY\_MATRIX\>  
    \<DESCRIPTION\>Courbes de Bézier mathématiques calculées pour 120 FPS. Interdiction d'utiliser les mots-clés GSAP basiques (power1, power2, etc.).\</DESCRIPTION\>  
    \<EASE id="fluid\_reveal" type="cubic-bezier" value="(0.19, 1.0, 0.22, 1.0)" duration\_base="1.4" purpose="Apparition de typographie massive et images Hero." /\>  
    \<EASE id="heavy\_friction" type="cubic-bezier" value="(0.16, 1.0, 0.3, 1.0)" duration\_base="1.8" purpose="Distorsion de grille au scroll et décélération." /\>  
    \<EASE id="magnetic\_snap" type="CustomEase" value="M0,0 C0.1,1 0.2,1 1,1" duration\_base="0.6" purpose="Retour à la position 0,0 après un hover magnétique." /\>  
    \<EASE id="mechanical\_UI" type="cubic-bezier" value="(0.87, 0, 0.13, 1)" duration\_base="0.85" purpose="Ouverture de menu plein écran (Exponential InOut agressif)." /\>  
    \<EASE id="micro\_bounce" type="CustomEase" value="M0,0 C0.12,0.82 0.38,1.15 1,1" duration\_base="0.45" purpose="Feedback visuel sur clic de bouton (Scale 0.95 \-\> 1)." /\>  
  \</EASING\_TOPOLOGY\_MATRIX\>

  \<SPATIAL\_COORDINATES\_3D\>  
    \<DESCRIPTION\>Coordonnées de transformation strictes pour éviter le Layout Thrashing. Toujours utiliser les axes X, Y, Z pour forcer l'accélération GPU.\</DESCRIPTION\>  
      
    \<TRANSLATION\_VECTORS target="Text\_Split\_Lines"\>  
      \<START\>yPercent: 115.5, rotationZ: 3.002, translateZ: \-20, opacity: 0.01\</START\> \<\!-- Le 0.01 empêche le navigateur de détruire le layer GPU \--\>  
      \<END\>yPercent: 0, rotationZ: 0, translateZ: 0, opacity: 1\</END\>  
      \<TOLERANCE\>stagger: 0.084\</TOLERANCE\> \<\!-- Jamais de nombres ronds pour le stagger, 0.084 simule un rythme humain \--\>  
    \</TRANSLATION\_VECTORS\>

    \<TRANSLATION\_VECTORS target="Parallax\_Images"\>  
      \<SPEED\_RATIOS\>  
        \<LAYER depth="foreground" data-speed="1.15" yPercent\_range="-15 to 15" /\>  
        \<LAYER depth="midground" data-speed="0.95" yPercent\_range="-5 to 5" /\>  
        \<LAYER depth="background" data-speed="0.75" yPercent\_range="10 to \-10" scale\_range="1.05 to 1" /\>  
      \</SPEED\_RATIOS\>  
      \<BLUR\_DEPTH\>  
        \<START\>filter: blur(12px) brightness(0.8)\</START\>  
        \<END\>filter: blur(0px) brightness(1)\</END\>  
      \</BLUR\_DEPTH\>  
    \</TRANSLATION\_VECTORS\>

    \<TRANSLATION\_VECTORS target="Micro\_Hover\_Cards"\>  
      \<\!-- Hover ultra fin, pas de sauts extravagants \--\>  
      \<HOVER\_ON\>scale3d(1.015, 1.015, 1.0), translate3d(0, \-2.5px, 0), rotationX: 1.5, rotationY: \-1.5\</HOVER\_ON\>  
      \<HOVER\_OFF\>scale3d(1.0, 1.0, 1.0), translate3d(0, 0, 0), rotationX: 0, rotationY: 0\</HOVER\_OFF\>  
    \</TRANSLATION\_VECTORS\>  
  \</SPATIAL\_COORDINATES\_3D\>

  \<CLIP\_PATH\_MATRICES\>  
    \<DESCRIPTION\>Coordonnées exactes pour les masques de révélation géométriques.\</DESCRIPTION\>  
    \<MATRIX id="cinematic\_wipe\_up"\>  
      \<START\>inset(100% 0.001% 0.001% 0.001%)\</START\> \<\!-- 0.001% empêche les artefacts de bordure sur Safari \--\>  
      \<END\>inset(0.001% 0.001% 0.001% 0.001%)\</END\>  
    \</MATRIX\>  
    \<MATRIX id="asymmetric\_curtain"\>  
      \<START\>polygon(0% 100%, 100% 120%, 100% 100%, 0% 100%)\</START\>  
      \<END\>polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)\</END\>  
    \</MATRIX\>  
    \<MATRIX id="iris\_focus"\>  
      \<START\>circle(0.1% at 50% 50%)\</START\>  
      \<END\>circle(150% at 50% 50%)\</END\> \<\!-- 150% garantit la couverture totale des coins sur écrans ultra-wide \--\>  
    \</MATRIX\>  
  \</CLIP\_PATH\_MATRICES\>

  \<MAGNETIC\_ZONES\_AND\_RADII\>  
    \<DESCRIPTION\>Paramètres millimétrés pour les zones d'interaction de la souris (QuickTo).\</DESCRIPTION\>  
    \<ZONE id="cta\_magnetic\_button"\>  
      \<TRIGGER\_RADIUS\>120px\</TRIGGER\_RADIUS\> \<\!-- Rayon invisible autour du bouton où l'attraction commence \--\>  
      \<CORE\_SNAP\_RADIUS\>45px\</CORE\_SNAP\_RADIUS\> \<\!-- Zone où le curseur se verrouille totalement au centre \--\>  
      \<ATTRACTION\_FACTOR\_X\>0.35\</ATTRACTION\_FACTOR\_X\> \<\!-- Force de déplacement du bouton vers la souris \--\>  
      \<ATTRACTION\_FACTOR\_Y\>0.35\</ATTRACTION\_FACTOR\_Y\>  
      \<TEXT\_PARALLAX\_FACTOR\>0.15\</TEXT\_PARALLAX\_FACTOR\> \<\!-- Le texte bouge moins vite que le bouton pour l'effet 3D \--\>  
    \</ZONE\>  
    \<ZONE id="image\_distortion\_hover"\>  
      \<INFLUENCE\_RADIUS\>400px\</INFLUENCE\_RADIUS\>  
      \<MAX\_DISPLACEMENT\>x: 15px, y: 15px\</MAX\_DISPLACEMENT\> \<\!-- Distorsion maximale de l'image au passage du curseur \--\>  
    \</ZONE\>  
  \</MAGNETIC\_ZONES\_AND\_RADII\>

  \<STAGGER\_TOPOLOGIES\>  
    \<DESCRIPTION\>Coordonnées de distribution temporelle pour les grilles complexes.\</DESCRIPTION\>  
    \<DISTRIBUTION id="epicenter\_wave"\>  
      \<GRID\>auto\</GRID\>  
      \<FROM\>center\</FROM\>  
      \<AMOUNT\>1.2\</AMOUNT\>  
      \<MATH\>ease: "sine.inOut"\</MATH\> \<\!-- Crée un effet de goutte d'eau tombant au centre de la grille \--\>  
    \</DISTRIBUTION\>  
    \<DISTRIBUTION id="diagonal\_reading"\>  
      \<GRID\>auto\</GRID\>  
      \<FROM\>start\</FROM\>  
      \<AXIS\>x\</AXIS\> \<\!-- Force le stagger à lire de gauche à droite avant de descendre \--\>  
      \<AMOUNT\>0.85\</AMOUNT\>  
    \</DISTRIBUTION\>  
  \</STAGGER\_TOPOLOGIES\>

  \<SCROLL\_VELOCITY\_THRESHOLDS\>  
    \<DESCRIPTION\>Limites mathématiques strictes (Clamp) pour éviter que l'UI ne se brise si l'utilisateur scrolle frénétiquement.\</DESCRIPTION\>  
    \<THRESHOLD id="skew\_distortion"\>  
      \<MIN\_SKEW\>-6.5deg\</MIN\_SKEW\>  
      \<MAX\_SKEW\>6.5deg\</MAX\_SKEW\>  
      \<CALCULATION\>\`gsap.utils.clamp(-6.5, 6.5, velocity / 450)\`\</CALCULATION\>  
    \</THRESHOLD\>  
    \<THRESHOLD id="scale\_compression"\>  
      \<MIN\_SCALE\>0.94\</MIN\_SCALE\> \<\!-- Ne jamais écraser une image en dessous de 94% \--\>  
      \<MAX\_SCALE\>1.0\</MAX\_SCALE\>  
      \<CALCULATION\>\`gsap.utils.clamp(0.94, 1.0, 1 \- Math.abs(velocity / 8000))\`\</CALCULATION\>  
    \</THRESHOLD\>  
  \</SCROLL\_VELOCITY\_THRESHOLDS\>

  \<DEVICE\_TOLERANCES\>  
    \<METRIC target="mobile\_touch"\>  
      \<SWIPE\_THRESHOLD\>45px\</SWIPE\_THRESHOLD\> \<\!-- Distance minimum pour valider un swipe dans un slider \--\>  
      \<TOUCH\_TARGET\_MIN\>48px\</TOUCH\_TARGET\_MIN\> \<\!-- Accessibilité stricte iOS/Android \--\>  
    \</METRIC\>  
    \<METRIC target="fps\_drop\_failsafe"\>  
      \<RULE\>Si gsap.ticker.fps \&lt; 30 pendant plus de 1.5 secondes, désactiver instantanément les filtres de flou (backdrop-filter) et le Skew de vélocité.\</RULE\>  
    \</METRIC\>  
  \</DEVICE\_TOLERANCES\>

\</SOTY\_MASTER\_LIBRARY\>  
