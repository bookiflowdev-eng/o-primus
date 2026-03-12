import { tool } from 'ai';
import { z } from 'zod';

export const marinerTool = tool({
  description: "Outil d'extraction web de production. Récupère le VRAI code source et l'architecture d'une URL cible en temps réel.",
  parameters: z.object({
    cible_url: z.string().url().describe("L'URL exacte à analyser"),
  }),
  execute: async ({ cible_url }) => {
    console.log(`[MARINER] 🌐 Extraction réelle en cours pour : ${cible_url}`);
    
    try {
      // API Jina Reader : Convertit n'importe quelle URL en structure DOM/Markdown ultra-propre pour les LLMs
      const response = await fetch(`https://r.jina.ai/${cible_url}`, {
        headers: {
          'Accept': 'application/json',
          'X-Return-Format': 'markdown'
        }
      });

      if (!response.ok) throw new Error(`Erreur réseau: ${response.status}`);
      
      const jsonResponse = await response.json();
      const realData = jsonResponse.data?.content || jsonResponse.content || "";

      // Sécurité Production : On limite à 25 000 caractères pour ne pas exploser la fenêtre de contexte
      const cleanData = realData.slice(0, 25000);

      console.log(`[MARINER] ✅ Données extraites avec succès (${cleanData.length} caractères).`);

      return {
        status: "success",
        target: cible_url,
        extracted_data: cleanData,
        system_instruction: "Voici le VRAI contenu et l'architecture de la page cible. Analyse ces données réelles et génère le code Tailwind/JS pour reproduire cette interface avec une précision absolue."
      };

    } catch (error: any) {
      console.error(`[MARINER ERROR] Échec de l'extraction sur ${cible_url}:`, error);
      return { 
        status: "error", 
        target: cible_url,
        message: "L'extraction a échoué (protection anti-bot ou timeout). Génère un layout SOTY sombre de remplacement basé sur l'URL demandée." 
      };
    }
  },
});