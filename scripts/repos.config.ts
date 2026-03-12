export type RepoCategory = 'animation' | 'scroll' | 'webgl' | 'components' | 'typography' | 'architecture'

export interface RepoConfig {
  repo: string
  category: RepoCategory
  priority: 1 | 2
  extensions: string[]
  maxFileSizeKb: number
  shallowDepth: number
  sparseCheckoutDirs: string[]
}

export const REPOS_CONFIG: RepoConfig[] = [

  // ── ANIMATION ────────────────────────────────────────────────
  {
    repo: 'theatre-js/theatre',
    category: 'animation', priority: 1,
    extensions: ['.ts', '.tsx'], maxFileSizeKb: 100, shallowDepth: 1,
    sparseCheckoutDirs: ['src/', 'packages/'],
  },
  {
    repo: 'framer/motion',
    category: 'animation', priority: 1,
    extensions: ['.ts', '.tsx'], maxFileSizeKb: 80, shallowDepth: 1,
    sparseCheckoutDirs: ['packages/framer-motion/src/', 'packages/motion-dom/src/'],
  },
  {
    repo: 'pmndrs/react-spring',
    category: 'animation', priority: 2,
    extensions: ['.ts', '.tsx'], maxFileSizeKb: 80, shallowDepth: 1,
    sparseCheckoutDirs: ['packages/'],
  },
  {
    repo: 'ibelick/motion-primitives',
    category: 'animation', priority: 1,
    extensions: ['.tsx', '.ts'], maxFileSizeKb: 60, shallowDepth: 1,
    sparseCheckoutDirs: ['components/'],
  },
  // ← NOUVEAU : anime.js — référence mondiale animation pure JS
  {
    repo: 'juliangarnier/anime',
    category: 'animation', priority: 1,
    extensions: ['.js', '.ts'], maxFileSizeKb: 100, shallowDepth: 1,
    sparseCheckoutDirs: ['src/'],
  },
  // ← NOUVEAU : motion-canvas — animations procédurales TypeScript-first
  {
    repo: 'motion-canvas/motion-canvas',
    category: 'animation', priority: 1,
    extensions: ['.ts', '.tsx'], maxFileSizeKb: 100, shallowDepth: 1,
    sparseCheckoutDirs: ['packages/core/src/', 'packages/2d/src/'],
  },

  // ── SCROLL ────────────────────────────────────────────────────
  {
    repo: 'darkroomco/lenis',
    category: 'scroll', priority: 1,
    extensions: ['.ts', '.js'], maxFileSizeKb: 80, shallowDepth: 1,
    sparseCheckoutDirs: ['src/'],
  },
  {
    repo: 'locomotivemtl/locomotive-scroll',
    category: 'scroll', priority: 1,
    extensions: ['.js', '.ts'], maxFileSizeKb: 80, shallowDepth: 1,
    sparseCheckoutDirs: ['src/'],
  },

  // ── WEBGL / 3D ────────────────────────────────────────────────
  {
    repo: 'pmndrs/react-three-fiber',
    category: 'webgl', priority: 1,
    extensions: ['.ts', '.tsx'], maxFileSizeKb: 80, shallowDepth: 1,
    sparseCheckoutDirs: ['packages/fiber/src/'],
  },
  {
    repo: 'pmndrs/drei',
    category: 'webgl', priority: 1,
    extensions: ['.ts', '.tsx'], maxFileSizeKb: 100, shallowDepth: 1,
    sparseCheckoutDirs: ['src/'],
  },
  {
    repo: 'pmndrs/postprocessing',
    category: 'webgl', priority: 2,
    extensions: ['.js', '.ts'], maxFileSizeKb: 80, shallowDepth: 1,
    sparseCheckoutDirs: ['src/'],
  },
  {
    repo: 'pmndrs/react-three-offscreen',
    category: 'webgl', priority: 2,
    extensions: ['.ts', '.tsx'], maxFileSizeKb: 60, shallowDepth: 1,
    sparseCheckoutDirs: ['src/'],
  },
  // ← NOUVEAU : three.js — LA référence mondiale WebGL (sparse sur src/ uniquement)
  {
    repo: 'mrdoob/three.js',
    category: 'webgl', priority: 1,
    extensions: ['.js'], maxFileSizeKb: 150, shallowDepth: 1,
    sparseCheckoutDirs: ['src/'],
  },
  // ← NOUVEAU : PixiJS — meilleur moteur WebGL 2D au monde
  {
    repo: 'pixijs/pixijs',
    category: 'webgl', priority: 1,
    extensions: ['.ts'], maxFileSizeKb: 150, shallowDepth: 1,
    sparseCheckoutDirs: ['src/'],
  },
  // ← NOUVEAU : shader-composer — composition GLSL pour R3F premium
  {
    repo: 'pmndrs/shader-composer',
    category: 'webgl', priority: 1,
    extensions: ['.ts', '.tsx'], maxFileSizeKb: 100, shallowDepth: 1,
    sparseCheckoutDirs: ['packages/shader-composer/src/'],
  },

  // ── COMPONENTS ────────────────────────────────────────────────
  {
    repo: 'shadcn-ui/ui',
    category: 'components', priority: 1,
    extensions: ['.tsx', '.ts'], maxFileSizeKb: 60, shallowDepth: 1,
    sparseCheckoutDirs: ['apps/www/registry/'],
  },
  {
    repo: 'radix-ui/primitives',
    category: 'components', priority: 2,
    extensions: ['.tsx', '.ts'], maxFileSizeKb: 80, shallowDepth: 1,
    sparseCheckoutDirs: ['packages/'],
  },
  {
    repo: 'emilkowalski_/vaul',
    category: 'components', priority: 2,
    extensions: ['.tsx', '.ts'], maxFileSizeKb: 60, shallowDepth: 1,
    sparseCheckoutDirs: ['src/'],
  },
  {
    repo: 'emilkowalski_/sonner',
    category: 'components', priority: 2,
    extensions: ['.tsx', '.ts'], maxFileSizeKb: 60, shallowDepth: 1,
    sparseCheckoutDirs: ['src/'],
  },
  // ← NOUVEAU : ariakit — composants accessibles architecture de référence
  {
    repo: 'ariakit/ariakit',
    category: 'components', priority: 1,
    extensions: ['.ts', '.tsx'], maxFileSizeKb: 80, shallowDepth: 1,
    sparseCheckoutDirs: ['packages/ariakit-react/src/'],
  },
  // ← NOUVEAU : StyleX — système de styling Meta/Facebook 2026
  {
    repo: 'facebook/stylex',
    category: 'components', priority: 1,
    extensions: ['.js', '.ts'], maxFileSizeKb: 100, shallowDepth: 1,
    sparseCheckoutDirs: ['packages/stylex/src/'],
  },

  // ── TYPOGRAPHY ───────────────────────────────────────────────
  {
    repo: 'split-type/split-type',
    category: 'typography', priority: 1,
    extensions: ['.js', '.ts'], maxFileSizeKb: 80, shallowDepth: 1,
    sparseCheckoutDirs: ['src/'],
  },
  {
    repo: 'mattboldt/typed.js',
    category: 'typography', priority: 2,
    extensions: ['.js', '.ts'], maxFileSizeKb: 60, shallowDepth: 1,
    sparseCheckoutDirs: ['src/'],
  },
  // ← NOUVEAU : fitty — typographie fluide responsive parfaite
  {
    repo: 'rikschennink/fitty',
    category: 'typography', priority: 2,
    extensions: ['.js'], maxFileSizeKb: 60, shallowDepth: 1,
    sparseCheckoutDirs: ['src/'],
  },

  // ── ARCHITECTURE ─────────────────────────────────────────────
  {
    repo: 'vercel/commerce',
    category: 'architecture', priority: 1,
    extensions: ['.tsx', '.ts'], maxFileSizeKb: 80, shallowDepth: 1,
    sparseCheckoutDirs: ['components/', 'lib/'],
  },
  {
    repo: 'leerob/leerob.io',
    category: 'architecture', priority: 2,
    extensions: ['.tsx', '.ts'], maxFileSizeKb: 60, shallowDepth: 1,
    sparseCheckoutDirs: ['app/', 'components/'],
  },
  // ← NOUVEAU : Vercel AI SDK — architecture streaming IA référence 2026
  {
    repo: 'vercel/ai',
    category: 'architecture', priority: 1,
    extensions: ['.ts', '.tsx'], maxFileSizeKb: 100, shallowDepth: 1,
    sparseCheckoutDirs: ['packages/ai/src/', 'packages/react/src/'],
  },
  // ← NOUVEAU : Precedent — meilleur starter Next.js 15 de référence mondiale
  {
    repo: 'steven-tey/precedent',
    category: 'architecture', priority: 1,
    extensions: ['.tsx', '.ts'], maxFileSizeKb: 80, shallowDepth: 1,
    sparseCheckoutDirs: ['components/', 'app/'],
  },

] as const

export const REPOS_BY_CATEGORY = REPOS_CONFIG.reduce<Record<RepoCategory, RepoConfig[]>>(
  (acc, repo) => {
    acc[repo.category] = [...(acc[repo.category] ?? []), repo]
    return acc
  },
  {} as Record<RepoCategory, RepoConfig[]>,
)
