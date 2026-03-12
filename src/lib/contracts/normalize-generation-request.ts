import type { GenerationRequest } from '@/types/generation'

export type LegacyGenerateBody = {
  prompt: string
  style?: string
  intensity?: 'subtle' | 'moderate' | 'intense'
  includeThreeD?: boolean
  colorPalette?: string
  targetAudience?: string
  industry?: string
}

export type CanonicalGenerateBody = LegacyGenerateBody

export function normalizeGenerateBody(
  body: LegacyGenerateBody | CanonicalGenerateBody
): GenerationRequest {
  return {
    prompt: body.prompt,
    style: body.style,
    animationIntensity: body.intensity,
    includeThreeD: Boolean(body.includeThreeD),
    colorPreference: body.colorPalette,
    targetAudience: body.targetAudience ?? body.industry,
    industry: body.industry,
  }
}
