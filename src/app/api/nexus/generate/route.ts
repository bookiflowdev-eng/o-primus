import { generateText } from 'ai';
import { google } from '@ai-sdk/google';

export const dynamic = 'force-dynamic';
export const maxDuration = 120; // Autorise une longue réflexion

// ============================================================================
// CERVEAU 1 : RÉFLEXION LENTE (PRO)
// Objectif : Clonage intégral de page, Sourcing Forensic, Zéro hallucination.
// ============================================================================
const PRO_SYSTEM_PROMPT = `
Tu es NEXUS, un architecte Front-End de niveau Awwwards SOTD.
Ta mission est de cloner ou générer une interface web COMPLÈTE de très haut niveau, en te basant sur le contexte fourni.

<critical_rules>
1. TOLÉRANCE ZÉRO SUR LES FUITES DE DONNÉES : N'affiche JAMAIS de métadonnées brutes, de JSON de configuration, ou de balises markdown dans le rendu visuel HTML.
2. EXHAUSTIVITÉ OBLIGATOIRE : Tu ne dois pas t'arrêter à la première section. Tu dois générer la page entière, du Header au Footer.
3. STRUCTURE DE RÉPONSE STRICTE : Tu dois respecter l'ordre exact : d'abord le bloc <nexus-forensics>, puis les blocs de code.
</critical_rules>

<output_format>
<nexus-forensics>
{
  "sources": [
    {
      "id": "source-1",
      "category": "docs", 
      "title": "Documentation Officielle (Ex: Tailwind / GSAP)",
      "url": "https://tailwindcss.com",
      "matchPercentage": 98,
      "description": "Utilisation de ce framework ou paradigme pour garantir la performance."
    }
  ]
}
</nexus-forensics>

\`\`\`html
\`\`\`
\`\`\`css
/* Ton CSS ici */
\`\`\`
\`\`\`javascript
/* Ton JS/GSAP ici */
\`\`\`
</output_format>
`;

// ============================================================================
// CERVEAU 2 : DRAFT (FLASH-LITE)
// Objectif : Vitesse pure, UI basique, Zéro Forensic.
// ============================================================================
const FLASH_SYSTEM_PROMPT = `
Tu es NEXUS DRAFT. Ta mission est de générer un prototype ultra-rapide et fonctionnel.

<critical_rules>
1. NE GÉNÈRE AUCUN JSON FORENSIC.
2. Renvoie UNIQUEMENT les blocs markdown \`\`\`html, \`\`\`css, et \`\`\`javascript.
3. Aucune phrase d'introduction ou de conclusion.
</critical_rules>
`;

export async function POST(req: Request) {
  try {
    const { prompt, context, isAgentic = true, sotyProbeData } = await req.json();

    const currentModel = isAgentic ? 'gemini-3.1-pro-preview' : 'gemini-3.1-flash-lite-preview';
    const currentSystemPrompt = isAgentic ? PRO_SYSTEM_PROMPT : FLASH_SYSTEM_PROMPT;
    const currentTemperature = isAgentic ? 0.1 : 0.4;

    // Construction modulaire du prompt en XML
    let finalPrompt = `<user_request>\n${prompt}\n</user_request>\n\n`;

    // 🔴 INJECTION DU PONT NEURAL (SOTY PROBE) - Structuré
    if (sotyProbeData) {
      console.log(`[NEXUS ENGINE] Injection ADN SOTY : ${sotyProbeData.targetUrl}`);
      finalPrompt += `
<architectural_directives>
  <description>Tu as l'OBLIGATION ABSOLUE d'utiliser ces variables exactes dans ton code Tailwind/CSS. N'invente pas d'autres styles globaux.</description>
  <design_system>
    <background>${sotyProbeData.designSystem.colors.background}</background>
    <text_color>${sotyProbeData.designSystem.colors.text}</text_color>
    <border_radius>${sotyProbeData.designSystem.geometry.borderRadius}</border_radius>
    <border_width>${sotyProbeData.designSystem.geometry.borderWidth}</border_width>
  </design_system>
  <typography>
    <headings font="${sotyProbeData.designSystem.typography.headings.fontFamily}" weight="${sotyProbeData.designSystem.typography.headings.fontWeight}" tracking="${sotyProbeData.designSystem.typography.headings.letterSpacing}" />
    <body font="${sotyProbeData.designSystem.typography.body.fontFamily}" line_height="${sotyProbeData.designSystem.typography.body.lineHeight}" />
  </typography>
  <physics>
    <easing>${sotyProbeData.physics.animations.easing}</easing>
  </physics>
</architectural_directives>\n\n`;
    }

    // 🔴 PIPELINE DE SCRAPING (Jina AI) - Structuré et cloisonné
    const urlMatch = prompt.match(/https?:\/\/[^\s]+/);
    if (urlMatch) {
      const targetUrl = urlMatch[0];
      console.log(`[PIPELINE PRODUCTION] 🌐 Extraction via Jina AI pour : ${targetUrl}`);

      try {
        const response = await fetch(`https://r.jina.ai/${targetUrl}`, {
          headers: { 'Accept': 'application/json', 'X-Return-Format': 'markdown' }
        });

        if (response.ok) {
          const jsonResponse = await response.json();
          const realData = jsonResponse.data?.content || jsonResponse.content || "";
          
          // On garde jusqu'à 40k caractères si on est en PRO, moins en Flash
          const maxExtractLength = isAgentic ? 40000 : 15000;
          const cleanData = realData.slice(0, maxExtractLength);
          
          console.log(`[PIPELINE PRODUCTION] ✅ Données extraites (${cleanData.length} chars).`);
          
          finalPrompt += `
<scraped_context source="${targetUrl}">
  <instruction>Voici le contenu textuel et structurel du site cible. Reproduis fidèlement TOUTES LES SECTIONS présentes ici, du haut vers le bas. N'oublie aucune partie majeure.</instruction>
  <raw_data>
${cleanData}
  </raw_data>
</scraped_context>\n\n`;
        }
      } catch (extractionError) {
        console.error("[PIPELINE PRODUCTION ERROR] Échec du scraping :", extractionError);
      }
    }

    const messages = [];
    if (context) messages.push({ role: 'system', content: `Contexte Additionnel: ${context}` });
    messages.push({ role: 'user', content: finalPrompt });

    console.log(`[NEXUS ENGINE] Lancement Séquence Génération Complète | Modèle: ${currentModel}`);

    // 🔴 GÉNÉRATION LLM DÉVERROUILLÉE
    const result = await generateText({
      model: google(currentModel), 
      system: currentSystemPrompt,
      messages: messages,
      temperature: currentTemperature,
      // 🚀 LE VERROU SAUTE ICI : On autorise le modèle à générer jusqu'à 65k tokens pour ne jamais couper les longs sites
      maxTokens: isAgentic ? 65536 : 8192, 
    });

    if (!result.text || result.text.trim() === '') {
      throw new Error("L'IA a renvoyé un texte vide.");
    }

    return new Response(result.text, { status: 200 });

  } catch (error: any) {
    console.error("[NEXUS API ERROR]:", error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}