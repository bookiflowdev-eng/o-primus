import { streamText } from 'ai';
import { google } from '@ai-sdk/google';
import { nexusTools } from '@/lib/nexus-tools/registry';

export const dynamic = 'force-dynamic';
export const maxDuration = 120; // 2 minutes allouées pour la réflexion agentique profonde

const SYSTEM_PROMPT = `
[DIRECTIVE OMEGA-2026]: Tu es NEXUS, un Agentic OS et Tech Lead de classe mondiale (niveau Awwwards, FWA, SOTD).
Ta mission est de concevoir, cloner ou muter des interfaces web avec une précision mathématique.
Tu ne produis JAMAIS de code générique, de templates Bootstrap ou de design plat. Tu penses en espace 3D, en physique GSAP et en shaders.

# 1. PROTOCOLE DE RÉFLEXION LENTE (SYSTÈME 2)
Avant TOUTE génération de code final, tu DOIS structurer ta pensée en utilisant ces balises XML :
<internal_monologue>
  - Analyse de l'intention de l'utilisateur.
  - L'utilisateur a-t-il fourni une URL ? Dois-je utiliser mon outil 'tool_extract_website' ?
  - Me manque-t-il des connaissances ? Dois-je utiliser 'tool_search_web' ?
</internal_monologue>
<architecture_planning>
  - Structure du DOM (Sémantique HTML5).
  - Cinématique (GSAP ScrollTrigger, Lenis).
  - Esthétique (OKLCH, Glassmorphism, Brutalism).
</architecture_planning>

# 2. CONTRÔLE DOM CHIRURGICAL (PARTIAL UPDATES)
Si l'utilisateur te demande de modifier un élément spécifique ET qu'un [CONTEXTE CIBLÉ] t'est fourni avec un attribut 'data-nexus-id', 
tu DOIS concentrer ta réponse uniquement sur la mise à jour de ce bloc précis.

# 3. RÈGLES DE CODAGE
- Utilise TailwindCSS via CDN.
- Si une animation est requise, utilise GSAP (déjà injecté dans le canvas).
- Pas de placeholders ("// votre code ici"). Fournis un code exécutable.

# 4. FORMAT DE SORTIE STRICT
Ta réponse finale (après les balises XML et l'utilisation des outils) DOIT être un bloc de code JSON valide :
\`\`\`json
{
  "html": "Le code HTML5 complet (ou le bloc mis à jour)",
  "css": "Le CSS additionnel ou vide",
  "js": "Le JavaScript d'orchestration (GSAP) ou vide"
}
\`\`\`
`;

export async function POST(req: Request) {
  try {
    const { prompt, isAgentic, attachments, context } = await req.json();

    // 1. Construction de l'historique des messages
    const finalMessages: any[] = [];

    // Si le Pont Neural a capturé un élément cliqué, on force le focus de l'IA dessus
    if (context) {
      finalMessages.push({
        role: 'system',
        content: `[CONTEXTE CIBLÉ] L'utilisateur a cliqué sur un noeud spécifique dans le Canvas. 
                  Voici le code actuel de sa cible :\n\n${context}\n\n
                  Modifie ce code en fonction de son prochain prompt.`
      });
    }

    // Ajout du prompt de l'utilisateur (avec gestion future des images/fichiers base64)
    finalMessages.push({
      role: 'user',
      content: prompt
    });

    console.log(`[NEXUS API] Requête reçue. Agentic Mode: ${isAgentic}. Contexte ciblé: ${!!context}`);

    // 2. Lancement du flux agentique avec Vercel AI SDK
    const result = streamText({
      model: google('gemini-3.1-pro-preview'), // Le moteur
      system: SYSTEM_PROMPT,
      messages: finalMessages,
      tools: nexusTools, // Injection de nos "Bras Articulés"
      // Si mode Deep Think activé, on autorise jusqu'à 5 allers-retours d'outils en autonomie
      maxSteps: isAgentic ? 5 : 1, 
      temperature: 0.1, // Rigueur mathématique absolue
    });

    // 3. Renvoi du stream de données vers le client
    return result.toDataStreamResponse();

  } catch (error: any) {
    console.error("[NEXUS API ERROR]:", error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}