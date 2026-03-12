/**
 * CONTRAT DE DONNÉES : NEXUS FORENSICS
 * Définit la structure stricte que l'IA doit renvoyer à l'intérieur de 
 * la balise <nexus-forensics> pour sourcer ses décisions architecturales.
 */

export type ForensicCategory = 'math' | 'docs' | 'aesthetic' | 'architecture';

export interface ForensicSource {
  id: string;                 // Identifiant unique (ex: 'gsap-bezier-1')
  category: ForensicCategory; // Le type de preuve
  title: string;              // Titre court (ex: 'GSAP CustomEase')
  url: string;                // Lien de vérification cliquable (URL absolue)
  matchPercentage: number;    // Confiance de l'IA sur cette source (ex: 98)
  description: string;        // Pourquoi cette source est utilisée en 1 ligne
}

export interface ForensicPayload {
  sources: ForensicSource[];
}