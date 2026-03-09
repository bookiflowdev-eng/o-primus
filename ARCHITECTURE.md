# Architecture du projet O-Primus

Ce document résume l'architecture globale du projet O-Primus, les principales technologies utilisées et la structure des dossiers.

## Technologies Utilisées

### Frontend
- **Framework React** : Next.js 15 (App Router)
- **UI & Composants** : React 19, Tailwind CSS 4, Lucide React, Zod
- **Animations & 3D** : GSAP, Framer Motion, Lenis (Smooth Scroll), Three.js, React Three Fiber, React Three Drei
- **Éditeur de code** : Monaco Editor

### Backend & AI
- **Backend-as-a-Service** : Supabase, Firebase
- **Intelligence Artificielle** : Vercel AI SDK, Google Generative AI (Gemini)
- **Authentification** : NextAuth
- **Paiements** : Stripe

### Outils & Infrastructure
- **Langage** : TypeScript
- **Scripts & Gestion** : Simple Git, Tsx

## Structure des Dossiers

Le projet est organisé selon l'arborescence suivante :

```text
o-primus/
├── docs/                 # Documentation du projet (architecture, prompt-engineering)
├── infra/                # Fichiers de configuration de l'infrastructure (Cloud Run, Firestore)
├── library/              # Système RAG : embeddings, documents maîtres et dépôts clonés
│   ├── embeddings/       # Fichiers de vecteurs / embeddings pour la recherche sémantique
│   ├── master_documents/ # Documents de référence (ex: Colorimetry, SOTY2026, WebGL Pipeline)
│   └── repos/            # Dépôts tiers de référence (Ariakit, Framer Motion, StyleX, etc.)
├── scripts/              # Scripts utilitaires (clonage et indexation de dépôts)
├── src/                  # Code source principal de l'application Next.js
│   ├── agents/           # Définition des agents IA (animation, orchestration, analyse, etc.)
│   ├── app/              # Routage de Next.js (App Router)
│   │   ├── api/          # Endpoints API backend (agent, auth, génération, stripe, etc.)
│   │   └── ...           # Pages de l'application (dashboard, laboratoire, nexus, pricing, etc.)
│   ├── components/       # Composants React réutilisables
│   │   ├── generator/    # Composants liés à la génération d'UI/Code
│   │   ├── layout/       # Composants de mise en page (AppShell, Navbar, Footer)
│   │   ├── preview/      # Composants de prévisualisation (CodePreview, LivePreview)
│   │   ├── providers/    # Fournisseurs de contexte (Auth, SmoothScroll)
│   │   └── ui/           # Composants UI de base (Badge, Button, Card, etc.)
│   ├── config/           # Configuration globale (graphe d'agents, plans, styles)
│   ├── hooks/            # Hooks React personnalisés
│   ├── lib/              # Utilitaires, intégration Gemini, RAG, pipelines et requêtes
│   │   └── prompts/      # Fichiers de prompts pour les différents agents IA
│   ├── styles/           # Feuilles de style globales
│   └── types/            # Définitions des types TypeScript
├── supabase/             # Schémas et configuration de la base de données Supabase
├── package.json          # Dépendances et scripts NPM
└── tsconfig.json         # Configuration TypeScript
```

## Points Clés de l'Architecture

1. **Architecture Agentique (AI)** : O-Primus utilise une approche multi-agents coordonnée par un `code-orchestrator` et orientée par un système de RAG (Retrieval-Augmented Generation) qui se nourrit de la base de connaissances située dans `library/`.
2. **Prévisualisation en direct** : L'interface intègre un module de rendu en direct (`LivePreview` / `CodePreview`) permettant de compiler et d'exécuter des composants complexes (React, Three.js).
3. **Séparation des préoccupations** : Les prompts des agents (`src/lib/prompts/`), leurs définitions (`src/agents/`) et la configuration du graphe d'agents (`src/config/agent-graph.config.ts`) sont clairement séparés pour faciliter la maintenance et l'évolution de l'intelligence artificielle du projet.
