export interface DesignSpec {
  style?: string
  mood?: string
  targetAudience?: string
  primaryAnimations?: string[]
  colorPalette?: string[]
  typography?: string
  layout?: string
  sections?: string[]
  includeThreeD?: boolean
  complexity?: 'minimal' | 'standard' | 'premium' | 'ultra'
}

export interface AnimationConfig {
  gsapTimeline?: string
  scrollTriggers?: string[]
  lenisConfig?: string
  microInteractions?: string[]
  pageTransition?: string
}

export interface ThreeScene {
  sceneCode?: string
  shaders?: string[]
  lights?: string[]
  cameraConfig?: string
  performanceTier?: 'low' | 'medium' | 'high'
}

export interface ValidationScore {
  accessibility: number
  performance: string
  lintErrors: number
  designScore?: number
  animationScore?: number
}
