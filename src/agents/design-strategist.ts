import { GoogleGenerativeAI } from "@google/generative-ai";
import type { AgentInput, AgentOutput, DomainProfile, DesignSpec } from "@/types/agent";
import type { AgentTrace } from "@/types/domain";

const DESIGN_STRATEGIST_SYSTEM = `Tu es le Design Strategist d'O-Primus.
Ton rôle : Prendre une DomainProfile et générer une DesignSpec complète domain-aware.

Tu DOIS respecter STRICTEMENT :
1. Le domaine (industry) détermine le layout, les couleurs, les animations
2. forbiddenJargon du domaine (jamais utiliser ces termes)
3. Brand tone du domaine (formal, friendly, luxury, authentic, etc.)
4. Les contraintes de spacing et de typographie

SORTIE : JSON valide DesignSpec uniquement. Pas de texte, pas de markdown.`;

const DESIGN_STRATEGIST_PROMPT = `Génère une DesignSpec complète pour ce domaine.

DomainProfile fournie :
\`\`\`json
{domainProfile}
\`\`\`

Prompt utilisateur :
\`\`\`
{userPrompt}
\`\`\`

RÈGLES STRICTES :
- Layout DOIT être choisi selon industry (bento pour tech, minimal pour comptable, etc.)
- Couleurs DOIVENT matcher le domaine (bleus/gris neutres pour comptable, verts/terre pour agro, etc.)
- Jamais utiliser les termes de forbiddenJargon
- Score de domain alignment ≥ 80
- Retourne UNIQUEMENT du JSON valide, zéro texte supplémentaire

Retourne exactement cette structure JSON :
{
  "designSpec": {
    "layout": {
      "type": "bento" | "hero-centric" | "minimal" | "card-grid" | "asymmetric",
      "gridCols": number,
      "horizontalRhythm": "tight" | "comfortable" | "spacious",
      "verticalPacing": number
    },
    "colorPalette": {
      "primary": "#hex",
      "secondary": "#hex",
      "accent": "#hex",
      "background": "#hex",
      "text": "#hex",
      "textSecondary": "#hex",
      "border": "#hex",
      "rationale": "string explaining the choice"
    },
    "typography": {
      "headingFont": "serif" | "sans-serif" | "display",
      "bodyFont": "serif" | "sans-serif",
      "scale": number,
      "lineHeightBody": number
    },
    "animationStrategy": {
      "heroEntrance": "fade-in" | "slide-up" | "scale-reveal" | "stagger-lines",
      "scrollBehavior": "parallax-subtle" | "scroll-trigger-reveal" | "float",
      "interactionFeedback": "scale-spring" | "glow-pulse" | "color-shift",
      "domainAlignment": "string"
    },
    "spacing": {
      "xs": 4,
      "sm": 8,
      "md": 16,
      "lg": 24,
      "xl": 32,
      "xxl": 48
    },
    "domainAlignmentCheck": {
      "isAppropriate": boolean,
      "score": number,
      "warnings": string[],
      "suggestions": string[]
    }
  }
}`;

export async function designStrategistAgent(
  input: AgentInput,
  apiKey: string
): Promise {
  const startTime = Date.now();
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: "gemini-2.0-flash-thinking-exp-01-21",
    systemInstruction: DESIGN_STRATEGIST_SYSTEM,
    generationConfig: {
      temperature: 1,
      maxOutputTokens: 16000,
      thinkingTokens: 8000,
    },
  });

  const systemPrompt = DESIGN_STRATEGIST_PROMPT
    .replace("{domainProfile}", JSON.stringify(input.domainProfile, null, 2))
    .replace("{userPrompt}", input.userPrompt);

  try {
    const response = await model.generateContent(systemPrompt);
    const content = response.content.parts[0];
    
    if (!content || content.type !== "text") {
      throw new Error("Invalid response format from Design Strategist");
    }

    const parsed = JSON.parse(content.text);
    const designSpec = parsed.designSpec as DesignSpec;

    const durationMs = Date.now() - startTime;

    const trace: AgentTrace = {
      agentName: "design-strategist",
      stepNumber: input.stepNumber,
      startedAt: new Date(Date.now() - durationMs).toISOString(),
      completedAt: new Date().toISOString(),
      status: "completed",
      durationMs,
      tokensIn: 0,
      tokensOut: 0,
      prompt: systemPrompt.substring(0, 500),
      output: content.text.substring(0, 500),
    };

    return {
      jobId: input.jobId,
      agentId: "design-strategist",
      stepNumber: input.stepNumber,
      payload: { designSpec },
      success: true,
      tokensUsed: {
        tokensIn: response.usageMetadata?.promptTokens || 0,
        tokensOut: response.usageMetadata?.candidatesTokens || 0,
        thinkingTokens: response.usageMetadata?.promptTokens || 0,
        durationMs,
      },
      trace,
    };
  } catch (error) {
    const durationMs = Date.now() - startTime;
    return {
      jobId: input.jobId,
      agentId: "design-strategist",
      stepNumber: input.stepNumber,
      payload: undefined,
      success: false,
      error: {
        message: error instanceof Error ? error.message : "Unknown error",
        code: "DESIGN_STRATEGIST_ERROR",
        recoverable: true,
      },
      tokensUsed: {
        tokensIn: 0,
        tokensOut: 0,
        durationMs,
      },
      trace: {
        agentName: "design-strategist",
        stepNumber: input.stepNumber,
        startedAt: new Date(Date.now() - durationMs).toISOString(),
        completedAt: new Date().toISOString(),
        status: "failed",
        durationMs,
        tokensIn: 0,
        tokensOut: 0,
      },
    };
  }
}