import { AGENT_GRAPH, PIPELINE_STAGES } from '@/config/agent-graph.config'
import { getAgentConfig } from '@/config/agents.config'
import type { AgentId } from '@/config/agents.config'
import type { AgentInput, AgentOutput } from '@/types/agent'
import type { GenerationJob, AgentTrace, CognitivePatch } from '@/types/domain'
import { supabaseAdmin } from '@/lib/supabase'
import { retrieveRAGContext } from '@/lib/rag-unified'
import { getActivePatchesForAgent, generateAndStoreCognitivePatch } from '@/lib/meta-learning'

import { runDomainProfiler } from '@/agents/domain-profiler'
import { runCodeOrchestrator } from '@/agents/code-orchestrator'
import { runQualityValidator } from '@/agents/quality-validator'
import { threeSpecialistAgent } from '@/agents/three-specialist'
// Stubs pour agents existants
import { designStrategistAgent } from '@/agents/design-strategist'
import { runContentArchitect } from '@/agents/content-architect'
import { animationEngineerAgent } from '@/agents/animation-engineer'

export interface PipelineContext {
  job: GenerationJob
  jobId: string
  userId: string
  agentStates: Partial<Record<AgentId, AgentOutput>>
  traces: AgentTrace[]
  startedAt: number
  currentStep: number
  completedSteps: AgentId[]
  failedSteps: { agentId: AgentId; reason: string }[]
  ragContext?: { uiChunks: string[]; domainChunks: string[] }
  correctionRound: number
  correctionFeedback?: string
  failedOrchestratorOutputs: string[]
  validationErrorHistory: string[]
}

export async function runGenerationPipeline(job: GenerationJob): Promise<PipelineContext> {
  const context: PipelineContext = {
    job, jobId: job.id, userId: job.userId, agentStates: {}, traces: [],
    startedAt: Date.now(), currentStep: 0, completedSteps: [], failedSteps: [], 
    correctionRound: 0, failedOrchestratorOutputs: [], validationErrorHistory: []
  }

  try {
    context.ragContext = await retrieveRAGContext(job.request.prompt, job.request.industry)

    for (let stageIdx = 0; stageIdx < PIPELINE_STAGES.length; stageIdx++) {
      const stage = PIPELINE_STAGES[stageIdx]
      context.currentStep = stageIdx

      if (stage.parallelAgents) {
        // Isolation des états concurrents avec Promise.all pour éviter les Race Conditions
        await Promise.all(
          stage.parallelAgents.map(async (agentId) => {
            if (checkSkipCondition(agentId, job)) {
              if (!context.completedSteps.includes(agentId)) context.completedSteps.push(agentId)
              return
            }
            await updateJobStatus(job.id, agentId, stageIdx)
            await executeAgentAndStore(agentId, stageIdx, context)
          })
        )
      } else if (stage.sequentialAgents) {
        for (const agentId of stage.sequentialAgents) {
          if (agentId === 'code-orchestrator') {
             await runAssemblyAndValidationLoop(stageIdx, context) // SELF-HEALING LOOP
             break // Le validateur est géré par la boucle
          }
          if (agentId === 'quality-validator') continue

          if (checkSkipCondition(agentId, job)) {
            if (!context.completedSteps.includes(agentId)) context.completedSteps.push(agentId)
            continue
          }
          await updateJobStatus(job.id, agentId, stageIdx)
          await executeAgentAndStore(agentId, stageIdx, context)
        }
      }
    }

    return context
  } catch (error) {
    throw error
  }
}

async function runAssemblyAndValidationLoop(stageIndex: number, context: PipelineContext) {
  let qualityPassed = false
  const MAX_CORRECTIONS = 2 // Au delà, déclenchement du Meta-Learning

  while (!qualityPassed && context.correctionRound <= MAX_CORRECTIONS) {
    await updateJobStatus(context.jobId, 'code-orchestrator', stageIndex)
    const orchestratorOutput = await runAgentWithRetry('code-orchestrator', stageIndex, context)
    context.agentStates['code-orchestrator'] = orchestratorOutput

    await updateJobStatus(context.jobId, 'quality-validator', stageIndex + 1)
    const validatorOutput = await runAgentWithRetry('quality-validator', stageIndex + 1, context)
    context.agentStates['quality-validator'] = validatorOutput

    const score = validatorOutput.payload?.validationScore
    const hasIssues = score?.issues && score.issues.length > 0

    if (!score || score.awwwardsReadiness === 'not-ready' || hasIssues) {
      context.correctionRound++
      const errorDump = score?.issues?.map((i: any) => `[${i.severity}] ${i.message}`).join('\n') || 'Structural AST failure.'
      context.correctionFeedback = errorDump
      
      context.failedOrchestratorOutputs.push(JSON.stringify(orchestratorOutput.payload?.generatedFiles).substring(0, 1500))
      context.validationErrorHistory.push(errorDump)

      if (context.correctionRound > MAX_CORRECTIONS) {
        // [META-LEARNING TRIGGER] The system failed to self-heal. Evolve.
        const patch = await generateAndStoreCognitivePatch('code-orchestrator', context.failedOrchestratorOutputs, context.validationErrorHistory, context.job.request.industry || 'general')
        if (patch && orchestratorOutput.trace) orchestratorOutput.trace.cognitivePatchGenerated = true
        qualityPassed = true // Fallback sur le best-effort
      }
    } else {
      qualityPassed = true
    }
  }

  if (!context.completedSteps.includes('code-orchestrator')) context.completedSteps.push('code-orchestrator')
  if (!context.completedSteps.includes('quality-validator')) context.completedSteps.push('quality-validator')
}

async function executeAgentAndStore(agentId: AgentId, stepNumber: number, context: PipelineContext) {
  const output = await runAgentWithRetry(agentId, stepNumber, context)
  context.agentStates[agentId] = output
  context.traces.push(output.trace)
  if (!context.completedSteps.includes(agentId)) context.completedSteps.push(agentId)
  await persistTrace(output.trace)
}

async function runAgentWithRetry(agentId: AgentId, stepNumber: number, context: PipelineContext): Promise<AgentOutput> {
  const config = getAgentConfig(agentId)
  const maxRetries = config.retryPolicy?.maxRetries ?? 1
  const backoffMs = config.retryPolicy?.backoffMs ?? 1000
  let lastError: Error | null = null

  const activePatches = await getActivePatchesForAgent(agentId)

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      if (attempt > 0) await new Promise(r => setTimeout(r, backoffMs * attempt))
      const input = buildAgentInput(agentId, stepNumber, context, activePatches)
      const output = await callAgent(agentId, input)
      if (!output.success) throw new Error(output.error?.message ?? 'Fail')
      return output
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error))
    }
  }
  
  throw new PipelineError(agentId, stepNumber, lastError?.message ?? 'Critical failure')
}

async function callAgent(agentId: AgentId, input: AgentInput): Promise<AgentOutput> {
  const apiKey = process.env.GEMINI_API_KEY!
  switch (agentId) {
    case 'domain-profiler':    return runDomainProfiler(input)
    case 'design-strategist':  return designStrategistAgent(input, apiKey)
    case 'content-architect':  return runContentArchitect(input)
    case 'animation-engineer': return animationEngineerAgent(input, apiKey)
    case 'three-specialist':   return threeSpecialistAgent(input, apiKey)
    case 'code-orchestrator':  return runCodeOrchestrator(input)
    case 'quality-validator':  return runQualityValidator(input)
    default: throw new Error(`Unknown agentId: ${agentId}`)
  }
}

function buildAgentInput(agentId: AgentId, stepNumber: number, context: PipelineContext, patches: CognitivePatch[]): AgentInput {
  const { job, agentStates, ragContext } = context
  return {
    jobId: context.jobId,
    agentId,
    stepNumber,
    userPrompt:      job.request.prompt,
    industry:        job.request.industry,
    businessModel:   job.request.businessModel,
    companyStage:    job.request.companyStage,
    userId:          context.userId,
    startedAt:       new Date().toISOString(),
    correctionFeedback: agentId === 'code-orchestrator' && context.correctionRound > 0 ? context.correctionFeedback : undefined,
    activePatches:   patches,
    domainProfile:   agentStates['domain-profiler']?.payload?.domainProfile,
    semanticTensor:  agentStates['domain-profiler']?.payload?.domainProfile?.semanticTensor,
    designSpec:      agentStates['design-strategist']?.payload?.designSpec,
    contentBlueprint:agentStates['content-architect']?.payload?.contentBlueprint,
    animationConfig: agentStates['animation-engineer']?.payload?.animationConfig,
    threeScene:      agentStates['three-specialist']?.payload?.threeScene,
    ragContext,
  }
}

function checkSkipCondition(agentId: AgentId, job: GenerationJob): boolean {
  return agentId === 'three-specialist' && !job.request.includeThreeD
}

async function updateJobStatus(jobId: string, agentId: AgentId, step: number): Promise<void> {
  const map: Record<string, string> = {
    'domain-profiler': 'domain-profiling', 'design-strategist': 'designing', 'content-architect': 'content',
    'animation-engineer': 'animating', 'three-specialist': 'animating', 'code-orchestrator': 'coding', 'quality-validator': 'validating'
  }
  await supabaseAdmin.from('jobs').update({ status: map[agentId] ?? 'processing', current_step: step, updated_at: new Date().toISOString() }).eq('id', jobId)
}

async function persistTrace(trace: AgentTrace): Promise<void> {
  try {
    await supabaseAdmin.from('agent_traces').insert({
      job_id: trace.jobId, step_number: trace.stepNumber, agent_name: trace.agentName,
      started_at: trace.startedAt, completed_at: trace.completedAt || new Date().toISOString(),
      duration_ms: trace.durationMs || 0, tokens_in: trace.tokensIn, tokens_out: trace.tokensOut,
      success: trace.success, error_message: trace.errorMessage,
    })
  } catch (e) { console.error(e) }
}