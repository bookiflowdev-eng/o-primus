import type { GenerationOutput, GenerationRequest } from '@/types/generation'
import type { ValidationScore } from '@/types/agent'

export async function runQualityValidator(
  files: GenerationOutput['files'],
  request: GenerationRequest
): Promise<ValidationScore> {
  const pageTsx = files['page.tsx'] ?? ''
  const animationTs = files['animations.ts'] ?? ''

  let score = 100
  const issues: string[] = []

  // Checks accessibilité
  if (!pageTsx.includes('aria-') && !pageTsx.includes('role=')) {
    score -= 10
    issues.push('Attributs ARIA manquants')
  }
  if (!pageTsx.includes('alt=')) {
    score -= 5
    issues.push('Alt text images manquant')
  }

  // Checks performance
  if (!pageTsx.includes("'use client'") && pageTsx.includes('useState')) {
    score -= 5
    issues.push("'use client' manquant sur composant avec état")
  }

  // Checks animation quality
  const hasGSAP = animationTs.includes('gsap') || pageTsx.includes('gsap')
  const hasLenis = animationTs.includes('Lenis') || pageTsx.includes('Lenis')
  const hasScrollTrigger = animationTs.includes('ScrollTrigger')

  if (!hasGSAP) { score -= 15; issues.push('GSAP absent') }
  if (!hasLenis) { score -= 10; issues.push('Lenis smooth scroll absent') }
  if (!hasScrollTrigger) { score -= 10; issues.push('ScrollTrigger absent') }

  const lintErrors = issues.length

  return {
    accessibility: Math.max(0, score),
    performance: lintErrors === 0 ? 'A' : lintErrors <= 2 ? 'B' : 'C',
    lintErrors,
    designScore: hasGSAP && hasLenis && hasScrollTrigger ? 95 : 70,
    animationScore: hasGSAP ? (hasScrollTrigger ? 90 : 70) : 40,
  }
}
