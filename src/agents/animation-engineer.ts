import { GoogleGenerativeAI } from '@google/generative-ai'
import type { GenerationRequest } from '@/types/generation'
import type { DesignSpec, AnimationConfig } from '@/types/agent'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY ?? '')
const model = genAI.getGenerativeModel({ model: 'gemini-3.1-pro-preview' })

export async function runAnimationEngineer(
  request: GenerationRequest,
  designSpec: DesignSpec,
  ragContext?: string
): Promise<AnimationConfig> {
  const ragSection = ragContext
    ? `\n\nEXTRAITS DE CODE PREMIUM (inspire-toi, n'utilise pas mot pour mot):\n${ragContext}`
    : ''

  const prompt = `
Tu es un ingénieur d'animation senior spécialisé GSAP + Lenis au niveau Awwwards.
Génère une config d'animation production-ready pour ce projet.

STYLE: ${designSpec.style ?? 'dark-premium'}
MOOD: ${designSpec.mood ?? 'sophisticated'}
INTENSITÉ: ${request.animationIntensity ?? 'moderate'}
ANIMATIONS: ${designSpec.primaryAnimations?.join(', ') ?? 'scroll-reveal, stagger'}
SECTIONS: ${designSpec.sections?.join(', ') ?? 'hero, features, cta, footer'}
${ragSection}

Retourne UNIQUEMENT ce JSON:
{
  "gsapTimeline": "code TypeScript complet pour la timeline GSAP principale",
  "scrollTriggers": ["code ScrollTrigger section 1", "code ScrollTrigger section 2"],
  "lenisConfig": "code d'initialisation Lenis",
  "microInteractions": ["hover effect 1", "hover effect 2", "cursor effect"],
  "pageTransition": "code de transition entre pages"
}
`

  const result = await model.generateContent(prompt)
  const text = result.response.text().trim()

  try {
    const clean = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    return JSON.parse(clean) as AnimationConfig
  } catch {
    return {
      gsapTimeline: `gsap.fromTo('.hero', { opacity: 0, y: 60 }, { opacity: 1, y: 0, duration: 1.2, ease: 'power4.out' })`,
      scrollTriggers: [
        `ScrollTrigger.create({ trigger: '.features', start: 'top 80%', onEnter: () => gsap.from('.feature-card', { opacity: 0, y: 40, stagger: 0.15 }) })`,
      ],
      lenisConfig: `new Lenis({ duration: 1.2, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), smoothWheel: true })`,
      microInteractions: [`gsap.to('.cta-btn', { scale: 1.05, duration: 0.3, ease: 'power2.out' })`],
      pageTransition: `gsap.to('.page', { opacity: 0, duration: 0.4, ease: 'power2.inOut' })`,
    }
  }
}
