import { GoogleGenerativeAI } from "@google/generative-ai";
import type { AgentInput, AgentOutput, AnimationConfig } from "@/types/agent";
import type { AgentTrace } from "@/types/domain";

const ANIMATION_ENGINEER_SYSTEM = `Tu es l'Animation Engineer d'O-Primus.
Ton rôle : Générer des animations GSAP précises et domain-aware.

Constraints strictes :
1. ScrollTrigger pour les reveals (start: "top 75%", end: "bottom bottom")
2. Stagger pour les listes (0.05-0.1s entre éléments)
3. Spring pour les hover (tension: 300, friction: 20)
4. Pas d'animations chaotiques pour comptable/cabinet-avocat
5. Animations dynamiques OK pour tech/saas/agency
6. Durées : page load 1.2s, scroll reveal 0.8s, hover 0.3s

SORTIE : JSON valide AnimationConfig uniquement. Pas de texte.`;

const ANIMATION_ENGINEER_PROMPT = `Génère une AnimationConfig complète pour cette landing page.

DomainProfile :
\`\`\`json
{domainProfile}
\`\`\`

DesignSpec :
\`\`\`json
{designSpec}
\`\`\`

ContentBlueprint sections :
\`\`\`json
{sections}
\`\`\`

RÈGLES :
- Si tone = "formal" (comptable) : animations subtiles, ease: "power1.inOut"
- Si tone = "friendly" (artisan) : animations amicales, ease: "back.out"
- Si tone = "luxury" : animations lentes, ease: "sine.inOut"
- Générer ScrollTrigger + stagger pour chaque section
- Domaine comptable : maxAnimationIntensity = "subtle"
- Domaine tech/saas : maxAnimationIntensity = "intense"
- Inclure du GSAP code brut à injecter dans animations.ts

Retourne UNIQUEMENT du JSON valide :
{
  "animationConfig": {
    "timings": {
      "pageLoadDuration": 1.2,
      "scrollRevealDuration": 0.8,
      "hoverDuration": 0.3,
      "staggerAmount": 0.05
    },
    "hero": {
      "badge": { "type": "fade-in", "delay": 0.1, "duration": 0.8 },
      "heading": { "type": "stagger-lines", "delay": 0.3, "lineDuration": 0.6 },
      "subheading": { "type": "fade-in", "delay": 0.8, "duration": 0.6 },
      "cta": { "type": "scale-spring", "delay": 1.2, "springTension": 300 }
    },
    "sections": [
      {
        "sectionId": "features",
        "entrance": {
          "type": "scroll-trigger-reveal",
          "scrollTrigger": {
            "trigger": ".features-section",
            "start": "top 75%",
            "end": "bottom bottom",
            "scrub": false
          },
          "animation": {
            "duration": 0.8,
            "ease": "power2.out"
          }
        },
        "children": [
          {
            "selector": ".feature-card",
            "animation": {
              "type": "fade-in",
              "delay": 0,
              "duration": 0.6
            }
          }
        ]
      }
    ],
    "interactions": {
      "buttons": {
        "hoverEffect": "scale-spring",
        "springConfig": { "tension": 300, "friction": 20 }
      },
      "cards": {
        "hoverEffect": "lift-shadow",
        "parallaxOnScroll": true
      }
    },
    "domainConstraints": {
      "maxAnimationIntensity": "subtle" | "moderate" | "intense",
      "reasoning": "string"
    },
    "gsapCode": "// GSAP code brut à injecter..."
  }
}`;

export async function animationEngineerAgent(
  input: AgentInput,
  apiKey: string
): Promise {
  const startTime = Date.now();
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: "gemini-2.0-flash-thinking-exp-01-21",
    systemInstruction: ANIMATION_ENGINEER_SYSTEM,
    generationConfig: {
      temperature: 1,
      maxOutputTokens: 16000,
      thinkingTokens: 8000,
    },
  });

  const sections = input.contentBlueprint?.sections?.map(s => ({
    id: s.id,
    type: s.type,
    nodeCount: s.nodes?.length || 0,
  })) || [];

  const systemPrompt = ANIMATION_ENGINEER_PROMPT
    .replace("{domainProfile}", JSON.stringify(input.domainProfile, null, 2))
    .replace("{designSpec}", JSON.stringify(input.designSpec, null, 2))
    .replace("{sections}", JSON.stringify(sections, null, 2));

  try {
    const response = await model.generateContent(systemPrompt);
    const content = response.content.parts[0];

    if (!content || content.type !== "text") {
      throw new Error("Invalid response format from Animation Engineer");
    }

    const parsed = JSON.parse(content.text);
    const animationConfig = parsed.animationConfig as AnimationConfig;

    const durationMs = Date.now() - startTime;

    const trace: AgentTrace = {
      agentName: "animation-engineer",
      stepNumber: input.stepNumber,
      startedAt: new Date(Date.now() - durationMs).toISOString(),
      completedAt: new Date().toISOString(),
      status: "completed",
      durationMs,
      tokensIn: response.usageMetadata?.promptTokens || 0,
      tokensOut: response.usageMetadata?.candidatesTokens || 0,
    };

    return {
      jobId: input.jobId,
      agentId: "animation-engineer",
      stepNumber: input.stepNumber,
      payload: { animationConfig },
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
      agentId: "animation-engineer",
      stepNumber: input.stepNumber,
      payload: undefined,
      success: false,
      error: {
        message: error instanceof Error ? error.message : "Unknown error",
        code: "ANIMATION_ENGINEER_ERROR",
        recoverable: true,
      },
      tokensUsed: {
        tokensIn: 0,
        tokensOut: 0,
        durationMs,
      },
      trace: {
        agentName: "animation-engineer",
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