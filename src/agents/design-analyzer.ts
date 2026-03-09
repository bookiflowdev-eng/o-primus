import { GoogleGenerativeAI } from '@google/generative-ai'
import type { GenerationRequest } from '@/types/generation'
import type { DesignSpec } from '@/types/agent'
import { OPRIMUS_MODEL } from '@/config/agents.config'
import { DESIGN_ANALYZER_SYSTEM, designAnalyzerUserPrompt } from '@/lib/prompts/design-analyzer.prompt'

if (!process.env.GEMINI_API_KEY) throw new Error('GEMINI_API_KEY manquante dans .env.local')

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)

const model = genAI.getGenerativeModel({
  model: OPRIMUS_MODEL,
  systemInstruction: DESIGN_ANALYZER_SYSTEM,
  generationConfig: {
    temperature: 1.0,
    maxOutputTokens: 8_192,
    // @ts-expect-error — thinkingConfig est valide en runtime Gemini 3.1 Pro
    thinkingConfig: { thinkingBudget: -1 },
  },
})

const FALLBACK_SPEC: DesignSpec = {
  style: 'dark-premium',
  mood: 'sophisticated, high-end, minimal',
  targetAudience: 'entreprises tech',
  primaryAnimations: ['scroll-reveal', 'stagger', 'parallax'],
  colorPalette: '#6366f1, #8b5cf6, #a78bfa, #c4b5fd',
  typography: 'Inter / Clash Display',
  layout: 'full-screen hero, sections alternées',
  sections: ['hero', 'features', 'social-proof', 'cta', 'footer'],
  includeThreeD: false,
  complexity: 'premium',
}

export async function runDesignAnalyzer(request: GenerationRequest): Promise<DesignSpec> {
  const userPrompt = designAnalyzerUserPrompt({
    prompt: request.prompt,
    industry: request.industry,
    targetAudience: request.targetAudience,
    style: request.style,
    animationIntensity: request.animationIntensity,
    includeThreeD: request.includeThreeD,
  })

  try {
    const result = await model.generateContent(userPrompt)
    const text = result.response.text().trim()
    const clean = text.replace(/```json?/g, '').replace(/```/g, '').trim()
    const parsed = JSON.parse(clean) as DesignSpec

    return {
      ...FALLBACK_SPEC,
      ...parsed,
      includeThreeD: request.includeThreeD ?? parsed.includeThreeD ?? false,
      colorPalette: parsed.colorPalette ?? FALLBACK_SPEC.colorPalette,
    }
  } catch {
    return { ...FALLBACK_SPEC, includeThreeD: request.includeThreeD ?? false }
  }
}
