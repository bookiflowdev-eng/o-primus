// ============================================================================
// src/lib/agent-validator.ts — Validation stricte des entrées/sorties agents
// ============================================================================
// Purpose: Garantir ZÉRO données mal structurées passent d'un agent à l'autre
// Usage: Appelez AVANT chaque appel d'agent et APRÈS chaque réponse

import { z } from 'zod'
import type { AgentInput, AgentOutput } from '@/types/agent'
import type {
  DomainProfile,
  ContentBlueprint,
  ValidationScoreExtended,
  GenerationJob,
} from '@/types/domain'

// ============================================================================
// Schémas Zod pour validation stricte
// ============================================================================

const DomainProfileSchema = z.object({
  industry: z.string(),
  businessModel: z.enum(['b2b', 'b2c', 'b2b2c', 'c2c', 'nonprofit', 'government', 'hybrid']),
  companyStage: z.enum(['startup', 'growth', 'scale', 'enterprise', 'established', 'nonprofit']),
  verticalKeywords: z.array(z.string()).min(1),
  brandTone: z.string(),
  brandPersonality: z.string(),
  forbiddenJargon: z.array(z.string()),
  requiredKeywords: z.array(z.string()),
  prohibitedPatterns: z.array(z.string()),
  primaryPersonas: z.array(
    z.object({
      name: z.string(),
      painPoints: z.array(z.string()),
      motivations: z.array(z.string()),
      decisionCriteria: z.array(z.string()),
    })
  ),
  secondaryPersonas: z
    .array(
      z.object({
        name: z.string(),
        influence: z.enum(['high', 'medium', 'low']),
      })
    )
    .optional(),
  proofPointsRequired: z.array(
    z.object({
      type: z.enum(['testimonial', 'case-study', 'certification', 'award', 'data', 'guarantee', 'team', 'years-in-business']),
      count: z.number().int().min(0),
      specificity: z.enum(['generic', 'domain-specific', 'ultra-specific']),
    })
  ),
  regulations: z.array(z.string()).optional(),
  complianceKeywords: z.array(z.string()).optional(),
  seasonality: z.enum(['none', 'high', 'medium', 'low']).optional(),
  geographicFocus: z.enum(['local', 'regional', 'national', 'international']).optional(),
  ticketSize: z.enum(['micro', 'small', 'medium', 'large', 'enterprise']).optional(),
  successMetrics: z.object({
    primary: z.enum(['leads', 'sales', 'signups', 'downloads', 'brand-awareness', 'credibility']),
    secondary: z.array(z.string()),
  }),
  marketContext: z.object({
    competitorTone: z.array(z.string()),
    differentiation: z.array(z.string()),
    urgencyLevel: z.enum(['low', 'medium', 'high']),
  }),
  metadata: z.object({
    detectedAt: z.string(),
    confidence: z.number().min(0).max(1),
    warnings: z.array(z.string()).optional(),
  }),
})

const ContentBlueprintSchema = z.object({
  sections: z.array(
    z.object({
      id: z.string(),
      type: z.string(),
      headline: z.string().optional(),
      subheadline: z.string().optional(),
      body: z.string().optional(),
      items: z
        .array(
          z.object({
            title: z.string(),
            description: z.string(),
            icon: z.string().optional(),
            image: z.string().optional(),
          })
        )
        .optional(),
      layout: z.enum(['stacked', 'grid-2', 'grid-3', 'flex-row', 'alternating']).optional(),
      emphasis: z.enum(['low', 'medium', 'high']).optional(),
      tone: z.string().optional(),
      callToAction: z
        .object({
          text: z.string(),
          url: z.string().optional(),
          style: z.enum(['primary', 'secondary', 'ghost']).optional(),
        })
        .optional(),
    })
  ),
  globalCopy: z.object({
    brandStatement: z.string(),
    tagline: z.string(),
    ctaPrimary: z.string(),
    ctaSecondary: z.string(),
    footerText: z.string(),
  }),
  metadata: z.object({
    generatedAt: z.string(),
    wordCount: z.number().int().positive(),
    readabilityScore: z.number().min(0).max(100).optional(),
    domainAlignmentScore: z.number().min(0).max(100).optional(),
  }),
})

const AgentInputSchema = z.object({
  jobId: z.string().uuid(),
  agentId: z.string(),
  stepNumber: z.number().int().min(0).max(6),
  userPrompt: z.string().min(10),
  industry: z.string().optional(),
  businessModel: z.string().optional(),
  companyStage: z.string().optional(),
  domainProfile: DomainProfileSchema.optional(),
  designSpec: z.any().optional(),
  contentBlueprint: ContentBlueprintSchema.optional(),
  animationConfig: z.any().optional(),
  threeScene: z.any().optional(),
  ragContext: z
    .object({
      uiChunks: z.array(z.string()),
      domainChunks: z.array(z.string()),
    })
    .optional(),
  userId: z.string(),
  startedAt: z.string().datetime(),
})

const AgentOutputSchema = z.object({
  jobId: z.string().uuid(),
  agentId: z.string(),
  stepNumber: z.number().int().min(0).max(6),
  payload: z.object({
    domainProfile: DomainProfileSchema.optional(),
    designSpec: z.any().optional(),
    contentBlueprint: ContentBlueprintSchema.optional(),
    animationConfig: z.any().optional(),
    threeScene: z.any().optional(),
    generatedFiles: z.record(z.string(), z.string()).optional(),
    validationScore: z.any().optional(),
  }),
  success: z.boolean(),
  error: z
    .object({
      message: z.string(),
      code: z.string(),
      recoverable: z.boolean(),
    })
    .optional(),
  tokensIn: z.number().int().positive(),
  tokensOut: z.number().int().positive(),
  thinkingTokens: z.number().int().optional(),
  durationMs: z.number().int().positive(),
  trace: z.any(),
})

// ============================================================================
// Fonctions de validation publiques
// ============================================================================

export function validateAgentInput(input: unknown): AgentInput {
  try {
    return AgentInputSchema.parse(input)
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error(`Invalid AgentInput: ${error.errors.map((e) => e.message).join(', ')}`)
    }
    throw error
  }
}

export function validateAgentOutput(output: unknown): AgentOutput {
  try {
    return AgentOutputSchema.parse(output)
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error(`Invalid AgentOutput: ${error.errors.map((e) => e.message).join(', ')}`)
    }
    throw error
  }
}

export function validateDomainProfile(profile: unknown): DomainProfile {
  try {
    return DomainProfileSchema.parse(profile)
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error(`Invalid DomainProfile: ${error.errors.map((e) => e.message).join(', ')}`)
    }
    throw error
  }
}

export function validateContentBlueprint(blueprint: unknown): ContentBlueprint {
  try {
    return ContentBlueprintSchema.parse(blueprint)
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error(
        `Invalid ContentBlueprint: ${error.errors.map((e) => e.message).join(', ')}`
      )
    }
    throw error
  }
}

// ============================================================================
// Validators spécifiques au domaine (anti-médiocrité)
// ============================================================================

export interface DomainValidationResult {
  passed: boolean
  issues: {
    severity: 'error' | 'warning'
    message: string
  }[]
}

/**
 * Valide un ContentBlueprint par rapport au DomainProfile
 * Détecte : clichés, jargon interdit, keywords manquants, incohérences tone
 */
export function validateContentAgainstDomain(
  blueprint: ContentBlueprint,
  profile: DomainProfile
): DomainValidationResult {
  const issues: DomainValidationResult['issues'] = []

  // Vérifier forbiddenJargon
  const fullText = JSON.stringify(blueprint).toLowerCase()
  for (const forbidden of profile.forbiddenJargon) {
    if (fullText.includes(forbidden.toLowerCase())) {
      issues.push({
        severity: 'error',
        message: `Forbidden jargon detected: "${forbidden}" (not appropriate for ${profile.industry})`,
      })
    }
  }

  // Vérifier requiredKeywords
  for (const required of profile.requiredKeywords) {
    if (!fullText.includes(required.toLowerCase())) {
      issues.push({
        severity: 'warning',
        message: `Required keyword missing: "${required}"`,
      })
    }
  }

  // Vérifier proof points
  const proofSections = blueprint.sections.filter((s) => s.type === 'proof')
  for (const required of profile.proofPointsRequired) {
    const count = proofSections.flatMap((s) => s.items || []).length
    if (count < required.count) {
      issues.push({
        severity: 'warning',
        message: `Insufficient ${required.type} (required: ${required.count}, found: ${count})`,
      })
    }
  }

  // Vérifier tone cohérent (simple heuristic : certains mots indiquent le tone)
  const toneIndicators: Record<string, string[]> = {
    formal: ['professional', 'certified', 'regulation', 'compliance', 'enterprise'],
    playful: ['fun', 'exciting', 'amazing', 'awesome', 'let\'s'],
    reassuring: ['trust', 'reliable', 'secure', 'guaranteed', 'peace of mind'],
    luxury: ['premium', 'exclusive', 'bespoke', 'refined', 'sophisticate'],
  }

  return {
    passed: issues.filter((i) => i.severity === 'error').length === 0,
    issues,
  }
}

/**
 * Vérifie qu'aucun TODO/placeholder n'existe dans les fichiers générés
 */
export function validateNoTODOs(files: Record<string, string>): DomainValidationResult {
  const issues: DomainValidationResult['issues'] = []
  const dangerousPatterns = [
    /TODO|todo|FIXME|fixme/g,
    /\[INSERT|insert here\]/gi,
    /your content here/gi,
    /PLACEHOLDER|placeholder/gi,
    /console\.log/g,
    /debugger/g,
  ]

  for (const [fileName, content] of Object.entries(files)) {
    for (const pattern of dangerousPatterns) {
      const matches = content.match(pattern)
      if (matches) {
        issues.push({
          severity: 'error',
          message: `${fileName}: Found forbidden pattern "${matches[0]}" (count: ${matches.length})`,
        })
      }
    }
  }

  return {
    passed: issues.length === 0,
    issues,
  }
}

/**
 * Vérifie que tous les imports dans le code existent
 * (heuristique simple : check import names contre fichiers generatedFiles)
 */
export function validateImportsExist(
  files: Record<string, string>,
  pageContent: string
): DomainValidationResult {
  const issues: DomainValidationResult['issues'] = []
  const importRegex = /import\s+(?:\{[^}]+\}|\*\s+as\s+\w+|\w+)\s+from\s+['"]([^'"]+)['"]/g
  let match

  while ((match = importRegex.exec(pageContent)) !== null) {
    const importPath = match[1]
    // Simple check: if import from relative path, ensure it exists in files
    if (importPath.startsWith('./') || importPath.startsWith('../')) {
      const resolvedPath = importPath + (importPath.endsWith('.ts') ? '' : '.ts')
      if (!files[resolvedPath] && !files[importPath]) {
        issues.push({
          severity: 'error',
          message: `Import not found: "${importPath}"`,
        })
      }
    }
  }

  return {
    passed: issues.length === 0,
    issues,
  }
}