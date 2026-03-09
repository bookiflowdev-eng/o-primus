// Source unique de vérité pour les plans Stripe.
// Pour changer un prix ou une limite → modifier ICI uniquement.
// Composant Pricing, quota.ts, stripe.ts lisent tous depuis ici.

export const PLANS_CONFIG = {
  starter: {
    name: 'Starter',
    price: 19,
    currency: 'EUR',
    generationsPerMonth: 5,
    features: [
      '5 générations / mois',
      'Styles Dark Premium & Glassmorphism',
      'Export code complet',
      'Support email',
    ],
    stripePriceEnvKey: 'STRIPE_PRICE_STARTER',
    highlighted: false,
    badge: null,
  },
  pro: {
    name: 'Pro',
    price: 49,
    currency: 'EUR',
    generationsPerMonth: 30,
    features: [
      '30 générations / mois',
      'Tous les styles incluant WebGL 3D',
      'Bibliothèque GitHub enrichie',
      'Qualité Awwwards garantie',
      'Support prioritaire',
    ],
    stripePriceEnvKey: 'STRIPE_PRICE_PRO',
    highlighted: true,
    badge: 'Recommandé',
  },
  agency: {
    name: 'Agency',
    price: 149,
    currency: 'EUR',
    generationsPerMonth: 999,
    features: [
      'Générations illimitées',
      'Accès API direct',
      'White-label disponible',
      'Account manager dédié',
      'SLA 99.9%',
    ],
    stripePriceEnvKey: 'STRIPE_PRICE_AGENCY',
    highlighted: false,
    badge: null,
  },
} as const

export type PlanKey = keyof typeof PLANS_CONFIG
