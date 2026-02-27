import type { GenerationRequest, AnimationStyle, AnimationIntensity } from '@/types/generation'

type LegacyIntensity = 'subtle' | 'moderate' | 'intense'
type LegacyStyle = AnimationStyle | undefined

export type LegacyGenerateBody = {
  prompt: string
  style?: LegacyStyle
  intensity?: LegacyIntensity
  includeThreeD?: boolean
  colorPalette?: string
  targetAudience?: string
  industry?: string
}

export type CanonicalGenerateBody = {
  userIntent: string
  style: AnimationStyle
  intensity: AnimationIntensity
  includeThreeD: boolean
  colorPalette?: string
  targetAudience?: string
}

function mapIntensity(x?: LegacyIntensity | AnimationIntensity): AnimationIntensity {
  if (!x) return 'medium'
  if (x === 'moderate') return 'medium'
  if (x === 'intense') return 'aggressive'
  if (x === 'subtle' || x === 'medium' || x === 'aggressive') return x
  return 'medium'
}

function mapStyle(x?: AnimationStyle): AnimationStyle {
  return x ?? 'dark-premium'
}

export function normalizeGenerateBody(body: LegacyGenerateBody | CanonicalGenerateBody): GenerationRequest {
  // Nouveau contrat
  if ('userIntent' in body) {
    return {
      userIntent: body.userIntent,
      style: body.style,
      intensity: body.intensity,
      includeThreeD: body.includeThreeD,
      colorPalette: body.colorPalette,
      targetAudience: body.targetAudience,
    }
  }

  // Ancien contrat
  return {
    userIntent: body.prompt,
    style: mapStyle(body.style),
    intensity: mapIntensity(body.intensity),
    includeThreeD: Boolean(body.includeThreeD),
    colorPalette: body.colorPalette,
    targetAudience: body.targetAudience ?? body.industry,
  }
}