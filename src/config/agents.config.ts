export const OPRIMUSMODEL = 'gemini-3.1-pro-preview' as const

export type AgentId = 'domain-profiler' | 'design-strategist' | 'content-architect' | 'animation-engineer' | 'three-specialist' | 'code-orchestrator' | 'quality-validator'

export interface AgentConfig {
  thinkingBudget: number 
  temperature: number 
  topP: number
  topK: number
  maxOutputTokens: number
  timeoutMs: number
  retryPolicy: { maxRetries: number; backoffMs: number }
}

export const AGENTSCONFIG: Record<AgentId, AgentConfig> = {
  'domain-profiler': {
    thinkingBudget: 5000, temperature: 0.3, topP: 0.8, topK: 20, // Extraction Psychographique Analytique
    maxOutputTokens: 8192, timeoutMs: 30000, retryPolicy: { maxRetries: 2, backoffMs: 1000 }
  },
  'design-strategist': {
    thinkingBudget: 6000, temperature: 0.6, topP: 0.9, topK: 40, // Architecture Équilibrée
    maxOutputTokens: 8192, timeoutMs: 40000, retryPolicy: { maxRetries: 2, backoffMs: 2000 }
  },
  'content-architect': {
    thinkingBudget: -1, temperature: 0.8, topP: 0.95, topK: 60, // Plume Créative et Persuasive
    maxOutputTokens: 16384, timeoutMs: 45000, retryPolicy: { maxRetries: 2, backoffMs: 2000 }
  },
  'animation-engineer': {
    thinkingBudget: 4000, temperature: 0.1, topP: 0.7, topK: 10, // Ingénierie Physique
    maxOutputTokens: 16384, timeoutMs: 50000, retryPolicy: { maxRetries: 2, backoffMs: 2000 }
  },
  'three-specialist': {
    thinkingBudget: -1, temperature: 0.1, topP: 0.7, topK: 10, // Mathématiques WebGPU (Déterministe)
    maxOutputTokens: 32768, timeoutMs: 60000, retryPolicy: { maxRetries: 1, backoffMs: 3000 }
  },
  'code-orchestrator': {
    thinkingBudget: -1, temperature: 0.05, topP: 0.5, topK: 5, // Compilation AST : Zéro Hallucination
    maxOutputTokens: 65536, timeoutMs: 150000, retryPolicy: { maxRetries: 2, backoffMs: 5000 }
  },
  'quality-validator': {
    thinkingBudget: 2048, temperature: 0.0, topP: 0.1, topK: 1, // Juge Impartial
    maxOutputTokens: 8192, timeoutMs: 30000, retryPolicy: { maxRetries: 1, backoffMs: 1000 }
  },
}

export function getAgentConfig(agentId: AgentId): AgentConfig {
  const config = AGENTSCONFIG[agentId]
  if (!config) throw new Error(`Agent '${agentId}' not found`)
  return config
}