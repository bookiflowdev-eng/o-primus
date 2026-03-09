import { supabaseAdmin } from './supabase'
import { getGeminiClient, SchemaType } from './gemini-client'
import type { CognitivePatch } from '@/types/domain'

export async function generateAndStoreCognitivePatch(
  agentId: string,
  failedOutputs: string[],
  validationErrors: string[],
  industry: string
): Promise<CognitivePatch | null> {
  const client = getGeminiClient()

  const systemPrompt = `[OMEGA DIRECTIVE] You are O-Primus Meta-Cognition Engine.
Your agent '${agentId}' has repeatedly failed validation.
Analyze its outputs and the validation errors. Generate a strict, imperative engineering rule (a Cognitive Patch) that will permanently fix this blind spot in future generations.`

  const userPrompt = `FAILED AST OUTPUTS (Extracts):\n${failedOutputs.join('\n\n')}\n\nVALIDATION ERRORS:\n${validationErrors.join('\n')}`

  try {
    const result = await client.generateJSON<{ triggerCondition: string; patchDirective: string }>({
      systemPrompt,
      userPrompt,
      temperature: 0.1, 
      maxOutputTokens: 500,
      thinkingBudget: 0,
      responseSchema: {
        type: SchemaType.OBJECT,
        properties: {
          triggerCondition: { type: SchemaType.STRING, description: "When to apply this rule (e.g. 'When generating WebGL code')" },
          patchDirective: { type: SchemaType.STRING, description: "The strict, single-sentence imperative rule" }
        },
        required: ["triggerCondition", "patchDirective"]
      }
    })

    const patch: CognitivePatch = {
      agentId,
      triggerCondition: result.data.triggerCondition,
      patchDirective: result.data.patchDirective,
      createdAt: new Date().toISOString()
    }

    await supabaseAdmin.from('cognitive_patches').insert({
        agent_id: patch.agentId,
        trigger_condition: patch.triggerCondition,
        patch_directive: patch.patchDirective,
        industry: industry,
        created_at: patch.createdAt
    })
    console.log(`[MetaLearning] New Neural Pathway generated for ${agentId}.`)
    return patch
  } catch (err) {
    console.error('[MetaLearning] Failed to encode memory:', err)
    return null
  }
}

export async function getActivePatchesForAgent(agentId: string): Promise<CognitivePatch[]> {
  const { data, error } = await supabaseAdmin
    .from('cognitive_patches')
    .select('*')
    .eq('agent_id', agentId)
    .order('created_at', { ascending: false })
    .limit(4)

  if (error || !data) return []
  return data.map(d => ({
    id: d.id,
    agentId: d.agent_id,
    triggerCondition: d.trigger_condition,
    patchDirective: d.patch_directive,
    createdAt: d.created_at
  }))
}