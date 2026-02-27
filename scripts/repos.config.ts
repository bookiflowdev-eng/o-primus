export interface RepoConfig {
  name: string
  url: string
  category: 'animations' | 'threejs' | 'nextjs' | 'design-system' | 'portfolio'
  includeGlobs: string[]
  excludeGlobs: string[]
  weight: number // 1-10, impact sur la qualité des résultats
}

export const REPOS_TO_INDEX: RepoConfig[] = [
  // ─── TIER 1 — SCROLL & ANIMATIONS ───────────────────────────────────────
  {
    name: 'lenis',
    url: 'https://github.com/studio-freight/lenis.git',
    category: 'animations',
    includeGlobs: ['**/*.ts', '**/*.tsx', '**/*.js'],
    excludeGlobs: ['**/node_modules/**', '**/dist/**', '**/*.test.*', '**/*.spec.*'],
    weight: 10,
  },
  {
    name: 'locomotive-scroll',
    url: 'https://github.com/locomotivemtl/locomotive-scroll.git',
    category: 'animations',
    includeGlobs: ['**/*.ts', '**/*.js', '**/*.scss'],
    excludeGlobs: ['**/node_modules/**', '**/dist/**'],
    weight: 9,
  },
  {
    name: 'gsap-react-demos',
    url: 'https://github.com/nicktomlin/nicktomlin.github.com.git',
    category: 'animations',
    includeGlobs: ['**/*.tsx', '**/*.ts'],
    excludeGlobs: ['**/node_modules/**'],
    weight: 8,
  },

  // ─── TIER 2 — REACT THREE FIBER ─────────────────────────────────────────
  {
    name: 'drei',
    url: 'https://github.com/pmndrs/drei.git',
    category: 'threejs',
    includeGlobs: ['src/**/*.tsx', 'src/**/*.ts'],
    excludeGlobs: ['**/node_modules/**', '**/*.test.*', '**/stories/**'],
    weight: 10,
  },
  {
    name: 'r3f-journey',
    url: 'https://github.com/brunosimon/my-room-in-3d.git',
    category: 'threejs',
    includeGlobs: ['**/*.jsx', '**/*.js', '**/*.glsl'],
    excludeGlobs: ['**/node_modules/**', '**/dist/**'],
    weight: 9,
  },

  // ─── TIER 3 — NEXT.JS APP ROUTER PREMIUM ────────────────────────────────
  {
    name: 'shadcn-ui',
    url: 'https://github.com/shadcn-ui/ui.git',
    category: 'design-system',
    includeGlobs: ['apps/www/registry/**/*.tsx', 'packages/**/*.tsx'],
    excludeGlobs: ['**/node_modules/**', '**/*.test.*', '**/*.stories.*'],
    weight: 9,
  },
  {
    name: 'vercel-commerce',
    url: 'https://github.com/vercel/commerce.git',
    category: 'nextjs',
    includeGlobs: ['components/**/*.tsx', 'app/**/*.tsx', 'lib/**/*.ts'],
    excludeGlobs: ['**/node_modules/**'],
    weight: 8,
  },

  // ─── TIER 4 — PORTFOLIOS SENIORS AWWWARDS ───────────────────────────────
  {
    name: 'animations-codrops',
    url: 'https://github.com/codrops/ScrollAnimationsShowcase.git',
    category: 'portfolio',
    includeGlobs: ['**/*.js', '**/*.css'],
    excludeGlobs: ['**/node_modules/**'],
    weight: 9,
  },
  {
    name: 'motion-primitives',
    url: 'https://github.com/ibelick/motion-primitives.git',
    category: 'animations',
    includeGlobs: ['**/*.tsx', '**/*.ts'],
    excludeGlobs: ['**/node_modules/**', '**/*.test.*'],
    weight: 10,
  },
  {
    name: 'aceternity-ui',
    url: 'https://github.com/aceternity/ui.git',
    category: 'design-system',
    includeGlobs: ['**/*.tsx', '**/*.ts'],
    excludeGlobs: ['**/node_modules/**'],
    weight: 9,
  },
]
