import { useMemo } from 'react';
import { ForensicSource, ForensicPayload } from '@/lib/contracts/forensic-source';

interface ForensicParserResult {
  sources: ForensicSource[];
  cleanCode: string;
}

export const useForensicParser = (rawStreamText: string): ForensicParserResult => {
  return useMemo(() => {
    // On cherche la balise complète
    const regex = /<nexus-forensics>([\s\S]*?)<\/nexus-forensics>/;
    const match = rawStreamText.match(regex);
    
    let sources: ForensicSource[] = [];
    let cleanStream = rawStreamText;

    if (match && match[1]) {
      try {
        // NETTOYAGE BRUTAL : On retire les backticks Markdown que Gemini aurait pu rajouter
        let dirtyJson = match[1];
        let cleanJson = dirtyJson
          .replace(/```json/gi, '') // retire ```json
          .replace(/```/g, '')      // retire les ``` restants
          .trim();                  // enlève les espaces vides

        const payload = JSON.parse(cleanJson) as ForensicPayload;
        sources = payload.sources || [];
      } catch (e) {
        console.warn("[NEXUS FORENSIC] Erreur de parsing du JSON des sources. Le JSON est peut-être malformé.", e);
      }
      
      // On purge le flux final
      cleanStream = rawStreamText.replace(regex, '');
      
    } else if (rawStreamText.includes('<nexus-forensics>')) {
      // Pendant la génération, on coupe l'affichage pour masquer le JSON à l'utilisateur
      cleanStream = rawStreamText.split('<nexus-forensics>')[0];
    }

    // Sécurité supplémentaire : si Gemini a mis les backticks AUTOUR de la balise xml
    cleanStream = cleanStream.replace(/```xml/gi, '').replace(/```html/gi, '```html');

    return { 
      sources, 
      cleanCode: cleanStream 
    };
  }, [rawStreamText]);
};