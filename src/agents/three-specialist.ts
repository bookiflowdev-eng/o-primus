import { SchemaType, getGeminiClient } from '@/lib/gemini-client'
import { getAgentConfig, OPRIMUSMODEL } from '@/config/agents.config'
import { getSystemPrompt } from '@/types/agent'
import type { AgentInput, AgentOutput } from '@/types/agent'

const ThreeSceneSchema = {
  type: SchemaType.OBJECT,
  properties: {
    enabled: { type: SchemaType.BOOLEAN },
    sceneCode: { type: SchemaType.STRING, description: "Full React Three Fiber component code" },
    shaders: { type: SchemaType.STRING, description: "GLSL vertex and fragment shaders" },
    multimodalAssets: { type: SchemaType.STRING, description: "Procedural CanvasTexture synthesis logic or HDRI base64 logic to prevent empty scenes." },
    animationLoop: { type: SchemaType.STRING, description: "useFrame logic reading global velocity" }
  },
  required: ["enabled"]
};

export async function threeSpecialistAgent(input: AgentInput, apiKey: string): Promise<AgentOutput> {
  const startTime = Date.now();
  const client = getGeminiClient();
  const config = getAgentConfig('three-specialist')

  const includeThreeD = input.contentBlueprint?.includeThreeD ?? input.threeScene?.enabled ?? true;

  const userPrompt = `Generate a WebGPU spatial experience.
Content needs 3D? ${includeThreeD}

SHARED SEMANTIC TENSOR (CRITICAL):
${JSON.stringify(input.semanticTensor, null, 2)}

RULES:
1. Synthesize textures procedurally (e.g. FBM noise injected into a shaderMaterial) or utilize robust base64 HDRI snippets in 'multimodalAssets'. Do not leave placeholders.
2. Observe the 'materiality' from the Tensor.
3. The animation loop MUST assume \`uVelocity\` is passed to the shader via the unified GSAP ticker (not calculated internally).
Return strictly the JSON object.`;

  try {
    const { data: response, tokens } = await client.generateJSON<any>({
      systemPrompt: getSystemPrompt('three-specialist', input.activePatches),
      userPrompt,
      temperature: config.temperature, 
      topP: config.topP,
      topK: config.topK,
      maxOutputTokens: config.maxOutputTokens,
      thinkingBudget: config.thinkingBudget,
      responseSchema: ThreeSceneSchema as any
    });

    const durationMs = Date.now() - startTime;

    return {
      jobId: input.jobId, agentId: "three-specialist", stepNumber: input.stepNumber,
      payload: { threeScene: response.enabled ? response : { enabled: false } },
      success: true, tokensIn: tokens.in, tokensOut: tokens.out, durationMs,
      trace: {
        agentName: "three-specialist", stepNumber: input.stepNumber, jobId: input.jobId,
        startedAt: new Date(Date.now() - durationMs).toISOString(), completedAt: new Date().toISOString(),
        durationMs, tokensIn: tokens.in, tokensOut: tokens.out,
        inputHash: "three", outputHash: "three", outputSizeBytes: 0, modelUsed: OPRIMUSMODEL,
        logs: [], success: true, retryCount: 0
      }
    };
  } catch (error) {
    throw error;
  }
}