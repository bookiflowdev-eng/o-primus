import { generateText } from 'ai';
import { google } from '@ai-sdk/google';
import { retrieveRAGContext } from '@/lib/rag-unified';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    // 🔴 NOUVEAU : On récupère isAgentic pour le routage de modèle
    const { prompt, targetHtml, isAgentic } = await req.json();
    
    // Routage Google 2026 : Pro pour la réflexion, Flash-Lite pour l'exécution rapide
    const modelName = isAgentic ? 'gemini-3.1-pro-preview' : 'gemini-3.1-flash-lite-preview';
    const temperature = isAgentic ? 0.2 : 0.0; // Flash est à 0.0 pour être purement déterministe
    
    let ragSnippets = '';
    let ragUsed = false;

    // Le RAG n'est déclenché qu'en mode PRO (Réflexion Lente) pour économiser les tokens
    if (isAgentic) {
        console.log(`[MUTATION PRO] Interrogation BDD Vectorielle pour : "${prompt}"`);
        const ragContext = await retrieveRAGContext(prompt);
        if (ragContext?.uiChunks?.length > 0) {
            ragUsed = true;
            const topChunks = ragContext.uiChunks.slice(0, 3);
            ragSnippets = `<reference_patterns>\n${topChunks.map((c, i) => `<pattern index="${i}">${c}</pattern>`).join('\n')}\n</reference_patterns>`;
        }
    }

    // 🔴 STRUCTURE XML 2026 : Empêche la "Dérive Sémantique" (destruction de design)
    const SYSTEM_PROMPT = `
Tu es un compilateur de code et un expert Tailwind/GSAP. Ta seule fonction est de retourner du code HTML valide.

<rules>
1. PRESERVATION STRICTE DU DOM : Tu ne DOIS PAS modifier les classes Tailwind existantes (couleurs, tailles, layout) de <target_html> SAUF si <user_instruction> le demande explicitement.
2. Si l'instruction concerne uniquement une animation, ajoute UNIQUEMENT des identifiants (id/classes) et des balises <script> GSAP. NE TOUCHE PAS à l'esthétique.
3. Ne renvoie AUCUN texte explicatif. Uniquement le bloc de code \`\`\`html.
</rules>
`;

    const finalPrompt = `
<user_instruction>${prompt}</user_instruction>

${ragSnippets}

<target_html>
${targetHtml}
</target_html>
    `.trim();

    console.log(`[MUTATION EXECUTION] Modèle ciblé : ${modelName}`);

    const result = await generateText({
      model: google(modelName),
      system: SYSTEM_PROMPT,
      prompt: finalPrompt,
      temperature: temperature,
    });

    return new Response(JSON.stringify({ 
        html: result.text,
        ragUsed: ragUsed,
        model: modelName
    }), { status: 200, headers: { 'Content-Type': 'application/json' } });

  } catch (error: any) {
    console.error("[MUTATION API ERROR]:", error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}