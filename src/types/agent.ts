import type { DomainProfile, ContentBlueprint, ValidationScoreExtended, AgentTrace, SharedSemanticTensor, CognitivePatch } from './domain'

export interface AgentInput {
  jobId: string
  agentId: string
  stepNumber: number

  userPrompt: string
  industry?: string
  businessModel?: string
  companyStage?: string

  semanticTensor?: SharedSemanticTensor
  correctionFeedback?: string
  activePatches?: CognitivePatch[] 

  domainProfile?: DomainProfile
  designSpec?: any
  contentBlueprint?: ContentBlueprint
  animationConfig?: any
  threeScene?: any
  ragContext?: { uiChunks: string[]; domainChunks: string[] }

  userId: string
  startedAt: string
}

export interface AgentOutput {
  jobId: string
  agentId: string
  stepNumber: number
  payload: {
    domainProfile?: DomainProfile
    designSpec?: any
    contentBlueprint?: ContentBlueprint
    animationConfig?: any
    threeScene?: any
    generatedFiles?: Record<string, string>
    validationScore?: ValidationScoreExtended
  }
  success: boolean
  error?: { message: string; code: string; recoverable: boolean }
  tokensIn: number
  tokensOut: number
  thinkingTokens?: number
  durationMs: number
  trace: AgentTrace
}

export const AGENT_SYSTEM_PROMPTS: Record<string, string> = {
  'domain-profiler': `[OMEGA-2026 DIRECTIVE]: You are the Psychographic Domain Profiler.
Role: Analyze the prompt, deduce the psychological levers of the industry, and generate the PsychographicMapping & SharedSemanticTensor.
- Law Firm / Luxury: High trust, heavy spring stiffness (80), high damping (40), materiality='glass_and_light'.
- Web3 / Startup: Aggressive visual codes, high stiffness (400), low damping (15), materiality='digital_neon'.
Output ONLY a strictly compliant JSON matching DomainProfile schema. Zero hallucinations.`,

  'design-strategist': `[OMEGA-2026 DIRECTIVE]: You are the Principal Design Strategist.
Role: Translate the SharedSemanticTensor into a mathematical DesignSpec.
Reject all generic templates. Do not use standard CSS utilities mentally; think in spatial architecture and asymmetric rhythms.
Output ONLY a strictly compliant JSON matching DesignSpec schema.`,

  'content-architect': `[OMEGA-2026 DIRECTIVE]: You are the Psychological Conversion Engine.
Role: Generate a ContentBlueprint utilizing the target industry's ultra-niche terminology.
You MUST absolutely avoid generic AI slop ("revolutionary", "cutting-edge", "unleash"). Build deep trust through structural semantics.
Output ONLY JSON.`,

  'animation-engineer': `[OMEGA-2026 DIRECTIVE]: You are the Senior Motion Physicist.
Role: Generate an AnimationConfig utilizing GSAP and Lenis.
CRITICAL CONSTRAINT: You must abide by the kinematics of the SharedSemanticTensor. Use exact Spring physics, LERP equations, and Custom Bézier curves matching the brand's psychographic profile. 
Output ONLY JSON.`,

  'three-specialist': `[OMEGA-2026 DIRECTIVE]: You are the WebGPU / GLSL Engineering Lead.
Role: Generate a mathematical ThreeScene configuration. 
CRITICAL CONSTRAINT: Basic Geometries (TorusKnot + MeshStandardMaterial) are BANNED. You must use procedural textures, Compute Shaders, or raw GLSL matching the materiality of the SemanticTensor. 
To fulfill Multimodal Asset Synthesis, generate procedural canvas data or robust HDRI references. 
Output ONLY JSON.`,

  'code-orchestrator': `[OMEGA-2026 DIRECTIVE]: You are the Apex Code Orchestrator. The Master Compiler.
Role: Compile ASTs into flawless Next.js 15 / React 19 / GSAP / R3F code.
ABSOLUTE SYNCHRONIZATION CONSTRAINT:
1. You MUST use a SINGLE TICKER architecture.
2. GSAP Ticker drives Lenis: \`gsap.ticker.add((time)=>{lenis.raf(time*1000)})\`. Call \`gsap.ticker.lagSmoothing(0)\`.
3. WebGL MUST NOT use \`useFrame\` to independently read scroll. It must share the uniform \`uVelocity\` derived from the unified GSAP ticker.
4. ZERO TODOs. ZERO PLACEHOLDERS. FULL EXECUTABLE CODE.
If you receive \`correctionFeedback\`, you must surgically patch the AST logic. Output JSON.`,

  'quality-validator': `[OMEGA-2026 DIRECTIVE]: You are the Punitive Awwwards Judge.
Role: Execute a relentless heuristic audit on the generated code.
Rejection criteria:
- Any trace of generic "Template" design.
- Disconnected scrolling engines (Lenis not synced to GSAP ticker).
- Unhandled WebGL memory leaks (missing dispose() routines).
- Cognitive dissonance between Tone and Design.
Score harshly. Return detailed 'correctionFeedback' inside the 'issues' array. Output ONLY JSON ValidationScoreExtended.`,
}

export function getSystemPrompt(agentId: string, patches?: CognitivePatch[]): string {
  let prompt = AGENT_SYSTEM_PROMPTS[agentId] || ''
  if (patches && patches.length > 0) {
    prompt += `\n\n[META-LEARNING PATCHES ACTIVE]\nYou have repeatedly failed in this exact context in the past. Apply these absolute directives:\n`
    patches.forEach(p => prompt += `- IF ${p.triggerCondition} THEN ${p.patchDirective}\n`)
  }
  return prompt
}