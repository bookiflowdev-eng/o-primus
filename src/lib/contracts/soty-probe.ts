/**
 * CONTRAT DE DONNÉES : SOTY PROBE
 * Définit la structure mathématique et esthétique extraite d'un site cible via le CDP.
 */

export interface SotyProbeData {
  targetUrl: string;
  extractionDate: string;
  designSystem: {
    colors: {
      primary: string; // Ex: rgb(15, 15, 15)
      secondary: string;
      accents: string[];
      background: string;
      text: string;
    };
    typography: {
      headings: { fontFamily: string; fontWeight: string; letterSpacing: string };
      body: { fontFamily: string; lineHeight: string };
    };
    geometry: {
      borderRadius: string; // Ex: '12px' ou '0px' (Brutalisme)
      borderWidth: string;
    };
  };
  physics: {
    animations: {
      easing: string; // Ex: cubic-bezier(0.87, 0, 0.13, 1)
      duration: string;
    };
    scroll: {
      hasSmoothScroll: boolean;
      parallaxIntensity: 'low' | 'medium' | 'high';
    };
  };
}