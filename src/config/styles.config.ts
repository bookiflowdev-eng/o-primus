// Source unique de vérité pour les styles visuels O-Primus.
// StyleSelector, GeneratorForm, DesignAnalyzer lisent depuis ici.

export const STYLES_CONFIG = [
  {
    id: 'dark-premium',
    label: 'Dark Premium',
    description: 'Sombre, élégant, contrasté. Niveau Linear/Stripe.',
    shortDesc: 'Sombre, élégant, contrasté.',
    defaultAnimationIntensity: 'moderate' as const,
    requiresThreeD: false,
    primaryColors: ['#6366f1', '#8b5cf6', '#0a0a0f'],
    estimatedValue: '30k-60k€',
    emoji: '⬛',
  },
  {
    id: 'glassmorphism',
    label: 'Glassmorphism',
    description: 'Transparences, flous, profondeur. Niveau Apple.',
    shortDesc: 'Jeux de transparence et flous.',
    defaultAnimationIntensity: 'subtle' as const,
    requiresThreeD: false,
    primaryColors: ['rgba(255,255,255,0.1)', '#818cf8', '#1e1b4b'],
    estimatedValue: '30k-50k€',
    emoji: '🔮',
  },
  {
    id: '3d-immersive',
    label: '3D Immersive',
    description: 'WebGL total. Niveau Awwwards SOTD.',
    shortDesc: 'Focus absolu sur le WebGL.',
    defaultAnimationIntensity: 'intense' as const,
    requiresThreeD: true,
    primaryColors: ['#6366f1', '#000000', '#ffffff'],
    estimatedValue: '60k-100k€',
    emoji: '🌐',
  },
  {
    id: 'minimal-clean',
    label: 'Minimal Clean',
    description: 'Typographie imposante, espace, pureté. Niveau Figma.',
    shortDesc: 'Pur, typo imposante, espace.',
    defaultAnimationIntensity: 'subtle' as const,
    requiresThreeD: false,
    primaryColors: ['#18181b', '#fafafa', '#6366f1'],
    estimatedValue: '20k-40k€',
    emoji: '⬜',
  },
  {
    id: 'scroll-reveal',
    label: 'Scroll Reveal',
    description: 'GSAP ScrollTrigger massif. Niveau agence premium.',
    shortDesc: 'GSAP ScrollTrigger, cinématique.',
    defaultAnimationIntensity: 'intense' as const,
    requiresThreeD: false,
    primaryColors: ['#0f172a', '#e2e8f0', '#6366f1'],
    estimatedValue: '30k-70k€',
    emoji: '🎬',
  },
] as const

export type StyleId = typeof STYLES_CONFIG[number]['id']
