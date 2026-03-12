// ============================================================================
// src/config/agent-graph.config.ts — DAG d'orchestration explicite
// ============================================================================
// Source unique de vérité pour l'ordre et les dépendances entre agents
// Lecture-seule : ne pas modifier sans réfléchir à l'impact sur tous les agents

import type { AgentId, AgentConfig } from './agents.config'

export interface AgentNode {
  id: AgentId
  displayName: string
  order: number
  dependencies: AgentId[] // Agents qui doivent terminer avant celui-ci
  fallback?: {
    strategy: 'rag-only' | 'template' | 'skip'
    skipAllowedIf?: string // Condition Zod pour skip optionnel
  }
}

export interface PipelineStage {
  parallelAgents?: AgentId[] // Ces agents tournent en parallèle
  sequentialAgents?: AgentId[] // Ces agents tournent en séquence
}

/**
 * GRAPH PRINCIPAL — Pipeline formel, DAG validé
 * Ordre immuable : changer l'ordre = tester complètement
 */
export const AGENT_GRAPH: Record<AgentId, AgentNode> = {
  // STAGE 0: Domain Understanding
  'domain-profiler': {
    id: 'domain-profiler',
    displayName: 'Domain Profiler',
    order: 0,
    dependencies: [], // Première étape, pas de dépendances
    fallback: {
      strategy: 'template',
      skipAllowedIf: 'request.industry === undefined', // Si pas d'industrie fournie, utiliser profil générique
    },
  },

  // STAGE 1: Design Strategy (dépend du profil métier)
  'design-strategist': {
    id: 'design-strategist',
    displayName: 'Design Strategist',
    order: 1,
    dependencies: ['domain-profiler'],
    fallback: {
      strategy: 'template',
    },
  },

  // STAGE 2: Content Architecture (dépend du profil + design)
  'content-architect': {
    id: 'content-architect',
    displayName: 'Content Architect',
    order: 2,
    dependencies: ['domain-profiler', 'design-strategist'],
    fallback: {
      strategy: 'template',
    },
  },

  // STAGE 3a: Animation & Motion (parallèle avec 3D)
  'animation-engineer': {
    id: 'animation-engineer',
    displayName: 'Animation & Motion Director',
    order: 3,
    dependencies: ['design-strategist', 'content-architect'],
    fallback: {
      strategy: 'rag-only',
    },
  },

  // STAGE 3b: 3D & Visual Systems (parallèle avec Animation)
  'three-specialist': {
    id: 'three-specialist',
    displayName: '3D & Visual Systems',
    order: 3, // Même ordre = parallèle
    dependencies: ['design-strategist', 'domain-profiler'],
    fallback: {
      strategy: 'skip',
      skipAllowedIf: 'request.includeThreeD === false',
    },
  },

  // STAGE 4: Code Assembly (dépend de tout)
  'code-orchestrator': {
    id: 'code-orchestrator',
    displayName: 'Code Orchestrator',
    order: 4,
    dependencies: ['design-strategist', 'content-architect', 'animation-engineer', 'three-specialist'],
    fallback: {
      strategy: 'rag-only', // Génère quand même avec RAG UI
    },
  },

  // STAGE 5: Quality & Domain Validation
  'quality-validator': {
    id: 'quality-validator',
    displayName: 'Quality & Domain Validator',
    order: 5,
    dependencies: ['code-orchestrator'],
    fallback: {
      strategy: 'skip',
    },
  },
}

/**
 * PIPELINE STAGES — Groupement par parallelisable/séquentiel
 */
export const PIPELINE_STAGES: PipelineStage[] = [
  // Stage 0: Domain Understanding (obligatoire d'abord)
  { sequentialAgents: ['domain-profiler'] },

  // Stage 1: Strategic Planning
  { sequentialAgents: ['design-strategist'] },

  // Stage 2: Content
  { sequentialAgents: ['content-architect'] },

  // Stage 3: Creation (PARALLÈLE)
  { parallelAgents: ['animation-engineer', 'three-specialist'] },

  // Stage 4: Assembly
  { sequentialAgents: ['code-orchestrator'] },

  // Stage 5: Validation
  { sequentialAgents: ['quality-validator'] },
]

/**
 * Ordre d'exécution topologiquement ordonnée pour DAG traversal
 */
export const AGENT_EXECUTION_ORDER: AgentId[] = [
  'domain-profiler',
  'design-strategist',
  'content-architect',
  'animation-engineer', // Parallèle
  'three-specialist', // Parallèle
  'code-orchestrator',
  'quality-validator',
]

/**
 * Helper : vérifier les dépendances
 */
export function getAgentDependencies(agentId: AgentId): AgentId[] {
  return AGENT_GRAPH[agentId]?.dependencies ?? []
}

export function getAgentsThatDependOnMe(agentId: AgentId): AgentId[] {
  return Object.values(AGENT_GRAPH)
    .filter((node) => node.dependencies.includes(agentId))
    .map((node) => node.id)
}

export function isParallelize(agentId1: AgentId, agentId2: AgentId): boolean {
  const node1 = AGENT_GRAPH[agentId1]
  const node2 = AGENT_GRAPH[agentId2]
  return node1.order === node2.order && node1.order !== 0
}