// Ce fichier n'a pas de prompt LLM — le RAG Retriever est déterministe.
// Il exporte les constantes de mapping sémantique utilisées par rag-retriever.ts.

export const STYLE_QUERY_MAP: Record<string, string> = {
  'dark-premium':   'dark glassmorphism premium GSAP scroll reveal animation indigo purple stagger',
  'glassmorphism':  'glassmorphism backdrop-blur transparency frosted glass animation depth',
  '3d-immersive':   'React Three Fiber WebGL 3D scene shader lights camera immersive canvas',
  'minimal-clean':  'minimal clean typography split text reveal animation whitespace breathing',
  'scroll-reveal':  'GSAP ScrollTrigger stagger scroll reveal parallax cinematic motion',
}

export const CATEGORY_SEARCH_MAP = [
  { category: 'animation',    query: 'GSAP timeline animation ScrollTrigger stagger ease',  limit: 6 },
  { category: 'scroll',       query: 'Lenis smooth scroll physics lerp duration easing',     limit: 4 },
  { category: 'components',   query: 'React component Tailwind UI card layout glassmorphism', limit: 5 },
  { category: 'typography',   query: 'SplitType text reveal animation chars words lines',     limit: 3 },
] as const

export const WEBGL_SEARCH = {
  category: 'webgl',
  query: 'React Three Fiber Canvas scene Drei shader lights useFrame',
  limit: 5,
} as const
