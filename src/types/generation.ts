import type { ValidationScore } from './agent'

export interface GenerationRequest {
  userId?: string
  prompt: string
  style?: string
  includeThreeD?: boolean
  targetAudience?: string
  industry?: string
  colorPreference?: string
  animationIntensity?: 'subtle' | 'moderate' | 'intense'
}

export interface GenerationOutput {
  id?: string
  userId?: string
  request: GenerationRequest
  files: {
    'page.tsx': string
    'layout.tsx'?: string
    'animations.ts': string
    'globals.css': string
    'three-scene.tsx'?: string
    'package.json': string
  }
  validationScore: ValidationScore
  createdAt: string
  status: 'pending' | 'generating' | 'completed' | 'failed'
}

