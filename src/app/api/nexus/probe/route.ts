import { NextResponse } from 'next/server';
import puppeteer from 'puppeteer';
import { generateObject } from 'ai';
import { google } from '@ai-sdk/google';
import { z } from 'zod';

export const dynamic = 'force-dynamic';
export const maxDuration = 120; // Autorise 2 minutes pour le process Multimodal

export async function POST(req: Request) {
  let browser;
  try {
    const { url } = await req.json();

    if (!url) {
      return NextResponse.json({ error: 'URL manquante' }, { status: 400 });
    }

    console.log(`[NEXUS PROBE] 🚀 Initialisation de l'extraction spatio-visuelle sur : ${url}`);

    // ============================================================================
    // ÉTAPE 1 : MOTEUR V8 & CAPTURE GÉOMÉTRIQUE
    // ============================================================================
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-web-security', '--window-size=1920,1080']
    });

    const page = await browser.newPage();
    // Résolution standard (non-retina) pour alléger le payload envoyé à l'IA
    await page.setViewport({ width: 1920, height: 1080 }); 

    console.log(`[NEXUS PROBE] 🌐 Navigation en cours...`);
    await page.goto(url, { waitUntil: 'networkidle0', timeout: 60000 });

    // Simulation d'un scroll complet pour forcer le rendu des animations/lazy-loading
    await page.evaluate(async () => {
      await new Promise<void>((resolve) => {
        let totalHeight = 0;
        const distance = 200;
        const timer = setInterval(() => {
          window.scrollBy(0, distance);
          totalHeight += distance;
          if (totalHeight >= document.body.scrollHeight || totalHeight > 5000) {
            clearInterval(timer);
            window.scrollTo(0, 0); // Retour en haut
            resolve();
          }
        }, 50);
      });
    });

    // 1.A : Capture Visuelle (Les yeux de l'Agent)
    console.log(`[NEXUS PROBE] 📸 Capture de l'empreinte rétinienne (Screenshot Full Page)...`);
    // Format JPEG / Qualité 60 pour garantir le passage dans le payload Robotics
    const screenshotBuffer = await page.screenshot({ fullPage: true, type: 'jpeg', quality: 60 });

    // 1.B : Capture Mathématique (L'ossature de la page)
    console.log(`[NEXUS PROBE] 📐 Extraction de la matrice géométrique...`);
    const spatialMap = await page.evaluate(() => {
      const getRect = (el: Element) => {
        const rect = el.getBoundingClientRect();
        return { x: Math.round(rect.x), y: Math.round(rect.y), w: Math.round(rect.width), h: Math.round(rect.height) };
      };
      
      const map = {
        viewport: { w: window.innerWidth, h: window.innerHeight },
        sections: Array.from(document.querySelectorAll('section, header, footer, main, article')).map(el => ({ tag: el.tagName, ...getRect(el) })),
        buttons: Array.from(document.querySelectorAll('button, a')).slice(0, 20).map(el => getRect(el)),
        headings: Array.from(document.querySelectorAll('h1, h2, h3')).map(el => ({ text: (el as HTMLElement).innerText.slice(0, 20), ...getRect(el) }))
      };
      return JSON.stringify(map);
    });

    await browser.close();

    // ============================================================================
    // ÉTAPE 2 : FUSION MULTIMODALE (GEMINI VISION + SPATIAL MAP)
    // ============================================================================
    console.log(`[NEXUS PROBE] 🧠 Transmission au cortex Gemini pour rétro-ingénierie absolue...`);

    const result = await generateObject({
      model: google('gemini-robotics-er-1.5-preview'), // Modèle spécialisé Vision Spatiale
      schema: z.object({
        designSystem: z.object({
          colors: z.object({
            primary: z.string().describe("Couleur HEX exacte de l'élément le plus mis en avant (bouton principal, accent)."),
            secondary: z.string().describe("Couleur HEX secondaire (texte adouci, bordures)."),
            background: z.string().describe("Couleur HEX dominante du fond global."),
            text: z.string().describe("Couleur HEX dominante du texte principal."),
            accents: z.array(z.string()).describe("Liste de 2 à 3 couleurs HEX d'accentuation trouvées dans le design.")
          }),
          typography: z.object({
            headings: z.object({
              fontFamily: z.string().describe("Nom de la police supposée pour les titres (ex: 'Inter', 'Space Grotesk')."),
              fontWeight: z.string().describe("Poids mathématique des gros titres (ex: '700', '800')."),
              letterSpacing: z.string().describe("Espacement des lettres exact (ex: '-0.05em').")
            }),
            body: z.object({
              fontFamily: z.string().describe("Nom de la police du corps de texte."),
              lineHeight: z.string().describe("Hauteur de ligne mathématique (ex: '1.6').")
            })
          }),
          geometry: z.object({
            borderRadius: z.string().describe("Le border-radius global dominant (ex: '0px' pour brutalism, '9999px' pour pill, '12px' pour moderne)."),
            borderWidth: z.string().describe("L'épaisseur des bordures utilisées dans le design (ex: '1px', '0px').")
          }),
          layout: z.object({
            whitespace: z.string().describe("Analyse de l'espacement (ex: 'Très aéré (paddings > 120px)', 'Dense et compact')."),
            gridSystem: z.string().describe("Type de grille détectée (ex: 'Bento Grid asymétrique', '12 colonnes standard', 'Pleine largeur avec container 1440px').")
          })
        }),
        physics: z.object({
          animations: z.object({
            easing: z.string().describe("La courbe de Bézier ou l'easing supposé à partir du feeling visuel de la page (ex: 'cubic-bezier(0.16, 1, 0.3, 1)')."),
            duration: z.string().describe("Durée moyenne des transitions (ex: '0.4s').")
          }),
          uxFeel: z.string().describe("Une description brutale d'une phrase de la 'Vibe' UX de ce site pour guider l'agent développeur.")
        })
      }),
      messages: [
        {
          role: 'user',
          content: [
            { 
              type: 'text', 
              text: `Tu es un Ingénieur Rétro-Architecte de classe mondiale.
Ta mission est d'analyser cette capture d'écran HD d'un site web récompensé et sa matrice géométrique, puis d'en extraire l'ADN esthétique et physique absolu.
Sois chirurgical. Ne donne que des valeurs mathématiques et des HEX précis.
Voici la matrice spatiale brute (X, Y, Width, Height) des éléments clés pour t'aider à comprendre les proportions :
${spatialMap}`
            },
            {
              type: 'image',
              image: screenshotBuffer // 🔴 CORRECTION: Envoi du Buffer binaire direct supporté par le Vercel SDK
            }
          ]
        }
      ]
    });

    // 3. Formatage final selon notre contrat
    const sotyData = {
      targetUrl: url,
      extractionDate: new Date().toISOString(),
      designSystem: result.object.designSystem,
      physics: result.object.physics
    };

    console.log(`[NEXUS PROBE SUCCESS] 🧬 ADN Mathématique et Visuel verrouillé.`);
    return NextResponse.json({ success: true, sotyData });

  } catch (error: any) {
    console.error("[NEXUS PROBE ERROR]:", error);
    if (browser) await browser.close();
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}