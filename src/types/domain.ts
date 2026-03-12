export type Industry =
  | 'saas' | 'fintech' | 'healthtech' | 'ecommerce' | 'retail' | 'marketplace'
  | 'agro' | 'agrotech' | 'food' | 'restaurant' | 'craftmanship' | 'artisan' | 'construction'
  | 'services' | 'consulting' | 'coaching' | 'professional' | 'accounting' | 'law' | 'real-estate'
  | 'manufacturing' | 'logistics' | 'supply-chain' | 'energy' | 'utilities' | 'environment'
  | 'nonprofit' | 'education' | 'government' | 'media' | 'publishing' | 'entertainment'
  | 'hospitality' | 'travel' | 'tourism' | 'luxury' | 'beauty' | 'fashion'
  | 'health' | 'wellness' | 'fitness' | 'other'

export type BusinessModel = 'b2b' | 'b2c' | 'b2b2c' | 'c2c' | 'nonprofit' | 'government' | 'hybrid'
export type CompanyStage = 'startup' | 'growth' | 'scale' | 'enterprise' | 'established' | 'nonprofit'
export type BrandTone = 'formal' | 'professional' | 'friendly' | 'casual' | 'luxury' | 'playful' | 'educational' | 'inspirational' | 'urgent' | 'reassuring'

export interface PsychographicMapping {
  conversionTrigger: 'logic_and_data' | 'emotional_desire' | 'status_and_exclusivity' | 'fear_and_urgency' | 'trust_and_safety'
  trustSignals: string[]
  visualArchetypes: string[]
  bannedArchetypes: string[]
}

export interface SharedSemanticTensor {
  kinematics: {
    stiffness: number
    damping: number
    globalEasing: string
  }
  spatialLogic: 'dense_bento' | 'ethereal_minimalism' | 'architectural_grid' | 'fluid_organic'
  materiality: 'glass_and_light' | 'brutalist_matte' | 'organic_textures' | 'digital_neon' | 'ink_and_paper'
}

export interface DomainProfile {
  industry: Industry
  businessModel: BusinessModel
  companyStage: CompanyStage
  verticalKeywords: string[]
  brandTone: BrandTone
  brandPersonality: string
  forbiddenJargon: string[]
  requiredKeywords: string[]
  prohibitedPatterns: string[]

  psychographics: PsychographicMapping
  semanticTensor: SharedSemanticTensor

  primaryPersonas: { name: string; painPoints: string[]; motivations: string[]; decisionCriteria: string[] }[]
  secondaryPersonas?: { name: string; influence: 'high' | 'medium' | 'low' }[]

  proofPointsRequired: { type: string; count: number; specificity: string }[]
  regulations?: string[]
  successMetrics: { primary: string; secondary: string[] }
  marketContext: { competitorTone: string[]; differentiation: string[]; urgencyLevel: string }
  metadata: { detectedAt: string; confidence: number; warnings?: string[] }
}

export interface ContentBlueprint {
  sections: any[]
  globalCopy: any
  metadata: any
}

export interface ValidationScoreExtended {
  accessibility: number
  performance: 'A' | 'B' | 'C' | 'D'
  lintErrors: number
  designScore?: number
  animationScore?: number
  responsiveness?: number
  domainAlignment?: number
  proofPointCoverage?: number
  complianceCheck?: boolean
  clicheDetection?: number
  awwwardsReadiness?: 'not-ready' | 'close' | 'ready' | 'excellent'
  estimatedValue?: '10k-20k' | '20k-50k' | '50k-100k' | '100k+'
  issues?: { severity: string; category: string; message: string; suggestion?: string }[]
  suggestions?: string[]
}

export interface CognitivePatch {
  id?: string
  agentId: string
  triggerCondition: string
  patchDirective: string
  createdAt: string
}

export interface AgentTrace {
  jobId: string
  stepNumber: number
  agentName: string
  startedAt: string
  completedAt?: string
  durationMs?: number
  inputHash: string
  inputSummary?: string
  outputSizeBytes: number
  outputHash: string
  modelUsed: string
  tokensIn: number
  tokensOut: number
  thinkingTokens?: number
  logs: { level: 'debug' | 'info' | 'warn' | 'error'; message: string; timestamp: string }[]
  success: boolean
  errorMessage?: string
  retryCount: number
  cognitivePatchGenerated?: boolean
}

export interface GenerationJob {
  id: string
  userId: string
  request: any
  domainProfile?: DomainProfile
  designSpec?: any
  contentBlueprint?: ContentBlueprint
  animationConfig?: any
  threeScene?: any
  generatedFiles?: Record<string, string>
  validationScore?: ValidationScoreExtended
  status: 'queued' | 'domain-profiling' | 'designing' | 'content' | 'animating' | 'coding' | 'validating' | 'completed' | 'failed'
  currentStep?: number
  completedSteps?: string[]
  failedSteps?: { stepNumber: number; reason: string }[]
  correctionRound: number
  createdAt: string
  updatedAt: string
  completedAt?: string
}