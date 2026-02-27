import { GoogleGenerativeAI } from '@google/generative-ai'
import type { GenerationRequest, GenerationOutput } from '@/types/generation'
import type { DesignSpec, AnimationConfig, ThreeScene } from '@/types/agent'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY ?? '')
const model = genAI.getGenerativeModel({ model: 'gemini-3.1-pro-preview' })

export async function runCodeOrchestrator(
  request: GenerationRequest,
  designSpec: DesignSpec,
  animationConfig: AnimationConfig,
  threeScene: ThreeScene | null,
  ragContext?: string
): Promise<GenerationOutput['files']> {
  const ragSection = ragContext
    ? `\n\nPATTERNS ARCHITECTURE PREMIUM:\n${ragContext}`
    : ''

  const typography = designSpec.typography ?? 'Inter'
  const palette = designSpec.colorPalette ?? ['#6366f1', '#8b5cf6', '#a78bfa', '#c4b5fd']
  const hasThreeD = designSpec.includeThreeD ?? false

  const prompt = `
Tu es un ingénieur frontend senior spécialisé Next.js 15 App Router, TypeScript strict, Tailwind.
Génère le code complet d'une landing page premium niveau Awwwards SOTD.

PROMPT UTILISATEUR: "${request.prompt}"
STYLE: ${designSpec.style}
MOOD: ${designSpec.mood}
TYPOGRAPHIE: ${typography}
COULEURS: ${palette.join(', ')}
SECTIONS: ${designSpec.sections?.join(', ')}
3D ACTIVÉ: ${hasThreeD}
ANIMATION CONFIG: ${JSON.stringify(animationConfig).slice(0, 500)}
${ragSection}

Génère les fichiers suivants en JSON strict:
{
  "page.tsx": "code complet Next.js App Router page",
  "layout.tsx": "code layout avec fonts + metadata",
  "animations.ts": "tous les hooks et helpers GSAP/Lenis",
  "globals.css": "CSS global avec variables, animations keyframes premium",
  "package.json": "dépendances exactes nécessaires"
  ${hasThreeD ? ', "three-scene.tsx": "composant R3F complet"' : ''}
}
`

  const result = await model.generateContent(prompt)
  const text = result.response.text().trim()

  try {
    const clean = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    return JSON.parse(clean) as GenerationOutput['files']
  } catch {
    return {
      'page.tsx': `'use client'\nexport default function Page() { return <main className="min-h-screen bg-black text-white"><h1 className="text-6xl font-bold">${request.prompt}</h1></main> }`,
      'layout.tsx': `import type { Metadata } from 'next'\nexport const metadata: Metadata = { title: 'O-Primus Generation' }\nexport default function Layout({ children }: { children: React.ReactNode }) { return <html lang="fr"><body>{children}</body></html> }`,
      'animations.ts': `import gsap from 'gsap'\nimport { ScrollTrigger } from 'gsap/ScrollTrigger'\ngsap.registerPlugin(ScrollTrigger)\nexport { gsap, ScrollTrigger }`,
      'globals.css': `:root { --primary: ${palette[0]}; --secondary: ${palette[1]}; } * { margin: 0; padding: 0; box-sizing: border-box; }`,
      'package.json': JSON.stringify({ dependencies: { next: '^15.0.0', react: '^19.0.0', gsap: '^3.12.0', '@react-three/fiber': '^8.0.0', '@react-three/drei': '^9.0.0', lenis: '^1.0.0' } }, null, 2),
      ...(hasThreeD && threeScene ? { 'three-scene.tsx': threeScene.sceneCode ?? '' } : {}),
    }
  }
}
