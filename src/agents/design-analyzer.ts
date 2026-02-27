import { GoogleGenerativeAI } from '@google/generative-ai'
import type { GenerationRequest } from '@/types/generation'
import type { DesignSpec } from '@/types/agent'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY ?? '')
const model = genAI.getGenerativeModel({ model: 'gemini-3.1-pro-preview' })

export async function runDesignAnalyzer(request: GenerationRequest): Promise<DesignSpec> {
  const prompt = `
Tu es un directeur artistique senior de niveau Awwwards SOTD.
Analyse cette demande et retourne un JSON DesignSpec strict.

DEMANDE: "${request.prompt}"
STYLE DEMANDÉ: ${request.style ?? 'auto'}
AUDIENCE: ${request.targetAudience ?? 'general'}
INDUSTRIE: ${request.industry ?? 'tech'}
3D: ${request.includeThreeD ?? false}

Retourne UNIQUEMENT ce JSON (pas de markdown, pas d'explication):
{
  "style": "scroll-reveal|parallax|3d-immersive|glassmorphism|minimal-clean|dark-premium",
  "mood": "string décrivant l'ambiance visuelle",
  "targetAudience": "string",
  "primaryAnimations": ["array", "de", "techniques"],
  "colorPalette": ["#hex1", "#hex2", "#hex3", "#hex4"],
  "typography": "string décrivant la typo",
  "layout": "string décrivant la structure",
  "sections": ["hero", "features", "testimonials", "cta", "footer"],
  "includeThreeD": boolean,
  "complexity": "minimal|standard|premium|ultra"
}
`

  const result = await model.generateContent(prompt)
  const text = result.response.text().trim()

  try {
    const clean = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    const parsed = JSON.parse(clean) as DesignSpec
    return {
      ...parsed,
      includeThreeD: request.includeThreeD ?? parsed.includeThreeD ?? false,
      colorPalette: parsed.colorPalette ?? ['#6366f1', '#8b5cf6', '#a78bfa', '#c4b5fd'],
    }
  } catch {
    // Fallback safe si Gemini renvoie du JSON invalide
    return {
      style: request.style ?? 'dark-premium',
      mood: 'sophisticated, high-end, minimal',
      targetAudience: request.targetAudience ?? 'entreprises tech',
      primaryAnimations: ['scroll-reveal', 'stagger', 'parallax'],
      colorPalette: ['#6366f1', '#8b5cf6', '#a78bfa', '#c4b5fd'],
      typography: 'Inter + Clash Display',
      layout: 'full-screen hero, sections alternées',
      sections: ['hero', 'features', 'social-proof', 'cta', 'footer'],
      includeThreeD: request.includeThreeD ?? false,
      complexity: 'premium',
    }
  }
}
