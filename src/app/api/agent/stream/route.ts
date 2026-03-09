import { NextRequest } from "next/server";
import { generateAgentStream, FunctionDeclaration, SchemaType } from "@/lib/gemini";
import fs from 'fs';
import path from 'path';

// ============================================================================
// DÉFINITION DES OUTILS (CUSTOM TOOLS) O-PRIMUS
// ============================================================================

// NOUVEAU SCHÉMA ULTRA-DEEP POUR L'AGENT 1
const architectTools: FunctionDeclaration[] = [
  {
    name: "emit_blueprint",
    description: "Génère l'AST structurel et EXTRAIT TOUTES LES MATHÉMATIQUES (coordonnées, Bézier, vélocité, matrices) des XML.",
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        global_ontology: {
          type: SchemaType.OBJECT,
          properties: {
            theme: { type: SchemaType.STRING },
            color_space: { type: SchemaType.STRING },
            noise_compositor: { type: SchemaType.BOOLEAN },
            physics_constants: {
              type: SchemaType.OBJECT,
              description: "Extrait du document Kinematics",
              properties: {
                gravity: { type: SchemaType.NUMBER },
                fps_target: { type: SchemaType.NUMBER }
              }
            }
          }
        },
        narrative_router: {
          type: SchemaType.OBJECT,
          properties: {
            preloader_type: { type: SchemaType.STRING },
            transition_enter: { type: SchemaType.STRING, description: "Ex: yPercent: 100 -> 0, clip-path..." },
            transition_leave: { type: SchemaType.STRING, description: "Ex: yPercent: -20, scale: 0.9..." }
          }
        },
        sections: {
          type: SchemaType.ARRAY,
          items: {
            type: SchemaType.OBJECT,
            properties: {
              id: { type: SchemaType.STRING },
              type: { type: SchemaType.STRING },
              layout_architecture: {
                type: SchemaType.OBJECT,
                properties: {
                  grid_type: { type: SchemaType.STRING },
                  webgl_context: { type: SchemaType.STRING },
                  stagger_topology: { 
                    type: SchemaType.OBJECT,
                    description: "Si c'est une grille, définir la topologie (Epicenter Wave, Diagonal, etc.)",
                    properties: { axis: { type: SchemaType.STRING }, amount: { type: SchemaType.NUMBER }, math: { type: SchemaType.STRING } }
                  }
                }
              },
              kinematics: {
                type: SchemaType.OBJECT,
                description: "Les valeurs mathématiques exactes de l'animation de la section",
                properties: {
                  intent_id: { type: SchemaType.STRING },
                  ease: { type: SchemaType.STRING, description: "La courbe de bézier EXACTE (ex: cubic-bezier(0.19, 1.0, 0.22, 1.0))" },
                  duration_base: { type: SchemaType.NUMBER },
                  velocity_clamp: { type: SchemaType.STRING, description: "Formule gsap.utils.clamp issue des XML" }
                }
              },
              nodes: {
                type: SchemaType.ARRAY,
                items: {
                  type: SchemaType.OBJECT,
                  properties: {
                    element: { type: SchemaType.STRING },
                    content: { type: SchemaType.STRING },
                    spatial_coordinates: {
                      type: SchemaType.OBJECT,
                      description: "Coordonnées de transformation 3D exactes",
                      properties: {
                        start_state: { type: SchemaType.STRING, description: "Ex: yPercent: 115.5, translateZ: -20..." },
                        end_state: { type: SchemaType.STRING },
                        stagger_tolerance: { type: SchemaType.NUMBER }
                      }
                    },
                    interactive_states: {
                      type: SchemaType.OBJECT,
                      properties: {
                        cursor_state: { type: SchemaType.STRING },
                        magnetic_zone: {
                          type: SchemaType.OBJECT,
                          properties: {
                            trigger_radius: { type: SchemaType.STRING },
                            core_snap_radius: { type: SchemaType.STRING },
                            attraction_factor: { type: SchemaType.NUMBER }
                          }
                        },
                        audio_profile: { type: SchemaType.STRING },
                        haptic_pattern: { type: SchemaType.STRING, description: "Ex: [2] ou [5, 50, 5]" }
                      }
                    }
                  },
                  required: ["element", "content"]
                }
              }
            },
            required: ["id", "type", "layout_architecture", "kinematics", "nodes"]
          }
        }
      },
      required: ["global_ontology", "narrative_router", "sections"]
    }
  }
];

const domEngineerTools: FunctionDeclaration[] = [
  {
    name: "inject_dom_and_physics",
    description: "Génère le HTML sémantique et configure le moteur physique Lenis + GSAP.",
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        html: { type: SchemaType.STRING },
        css: { type: SchemaType.STRING },
        js_physics: { type: SchemaType.STRING }
      },
      required: ["html", "css", "js_physics"]
    }
  }
];

// ============================================================================
// LOGIQUE DE ROUTAGE ET STREAMING SSE
// ============================================================================
export async function POST(req: NextRequest) {
  try {
    const { prompt, agentId, blueprint } = await req.json();
    const encoder = new TextEncoder();

    const stream = new ReadableStream({
      async start(controller) {
        const sendEvent = (type: string, data: any) => {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type, ...data })}\n\n`));
        };

        try {
          let systemInstruction = "";
          let activeTools: FunctionDeclaration[] = [];

          // =====================================================================
          // AGENT 1 : ARCHITECTE UNIVERSEL
          // =====================================================================
          if (agentId === 'agent-1-architect') {
            sendEvent("log", { message: "O-Primus Engine: Chargement de la Bibliothèque XML Maîtresse..." });
            
            activeTools = architectTools;

            let domMorphingXML = "", metricsXML = "", routerXML = "", kinematicsXML = "";
            try {
              const baseDir = path.join(process.cwd(), 'src/library/master_documents');
              domMorphingXML = fs.readFileSync(path.join(baseDir, 'SOTY2026_UNIVERSAL_DOM_MORPHING.md'), 'utf-8');
              metricsXML = fs.readFileSync(path.join(baseDir, 'Dictionnaire Micro-Métriques SOTY 2026.md'), 'utf-8');
              routerXML = fs.readFileSync(path.join(baseDir, 'SOTY2026_ASYNC_NARRATIVE_ROUTER.md'), 'utf-8');
              kinematicsXML = fs.readFileSync(path.join(baseDir, 'SOTY2026_KINEMATICS_ENGINE.md'), 'utf-8');
              sendEvent("log", { message: "✓ Savoir SOTY 2026 assimilé (Morphing, Métriques, Routage, Cinématique)." });
            } catch (err: any) {
              throw new Error(`Erreur de lecture Agent 1: ${err.message}`);
            }

            systemInstruction = `
              Tu es l'Agent 1 (Architecte Universel) d'O-Primus.
              Ton rôle est d'extraire la substantifique moelle mathématique de nos documents pour créer le Blueprint de la page.
              
              --- DOM MORPHING ---
              ${domMorphingXML}
              
              --- MICRO MÉTRIQUES ---
              ${metricsXML}
              
              --- NARRATIVE ROUTER ---
              ${routerXML}

              --- KINEMATICS ENGINE ---
              ${kinematicsXML}
              
              DIRECTIVE ABSOLUE : N'invente AUCUNE valeur. Va chercher les courbes cubic-bezier exactes, les durations, les formules de clamp, les radius magnétiques et les matrices de translation (yPercent, translateZ) directement dans le texte XML fourni, et injecte-les dans les champs correspondants du JSON via l'outil emit_blueprint.
            `;
          } 
          
          // =====================================================================
          // AGENT 2 : INGÉNIEUR DOM & PHYSIQUE (INJECTION XML BRUTE + CONTRAINTES)
          // =====================================================================
          else if (agentId === 'agent-2-dom-physics') {
            sendEvent("log", { message: "O-Primus Engine: Chargement de la Bibliothèque DOM & Physique..." });
            activeTools = domEngineerTools;
            
            let gridXML = "", colorimetryXML = "", kinematicsXML = "";
            try {
              const baseDir = path.join(process.cwd(), 'src/library/master_documents');
              gridXML = fs.readFileSync(path.join(baseDir, 'SOTY2026_BENTHAL_GRID.md'), 'utf-8');
              colorimetryXML = fs.readFileSync(path.join(baseDir, 'Colorimetry & Light Shaders.md'), 'utf-8');
              kinematicsXML = fs.readFileSync(path.join(baseDir, 'SOTY2026_KINEMATICS_ENGINE.md'), 'utf-8');
              sendEvent("log", { message: "✓ Savoir SOTY 2026 assimilé (Grille Benthal, Shaders OKLCH, Physique Lenis)." });
            } catch (err: any) {
              throw new Error(`Erreur de lecture Agent 2: ${err.message}`);
            }

            systemInstruction = `
              Tu es l'Agent 2 (Ingénieur DOM & Physique) d'O-Primus.
              CONSIGNE ABSOLUE : Transforme le Blueprint JSON entrant en code de production. Tu dois te comporter comme un compilateur strict.
              
              BLUEPRINT ENTRANT : ${JSON.stringify(blueprint)}
              
              DOCUMENTS MAÎTRES À APPLIQUER :
              --- BENTHAL GRID ---
              ${gridXML}
              --- COLORIMETRY & SHADERS ---
              ${colorimetryXML}
              --- KINEMATICS ENGINE ---
              ${kinematicsXML}
              
              CONTRAINTES DE GÉNÉRATION STRICTES (Si tu les ignores, le rendu sera refusé) :
              
              1. CSS (Le Design System) :
                 - Tu DOIS créer une pseudo-classe ::before sur le body ou un div .noise-overlay contenant EXACTEMENT l'URL data SVG du filtre 'fractalNoise' défini dans le document Colorimetry.
                 - Tu DOIS définir le background-color du body en oklch(0.12 0.01 260) et le texte en oklch(0.95 0.01 260).
                 - Tu DOIS appliquer grid-template-columns: repeat(12, 1fr); au conteneur principal pour respecter la Benthal Grid.
                 
              2. HTML (Le Squelette) :
                 - Ajoute un div <div class="noise-overlay"></div> en position fixed avec un mix-blend-mode overlay pour le grain.
                 - Structure tes balises selon les "nodes" du Blueprint.
                 
              3. JS_PHYSICS (Le Moteur) :
                 - Écris le code JavaScript pour initialiser Lenis : const lenis = new Lenis({ duration: 1.2, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)) });
                 - Lie GSAP au Ticker : gsap.ticker.add((time) => { lenis.raf(time * 1000) }); gsap.ticker.lagSmoothing(0);
                 - Extrais le start_state, end_state, ease, et duration_base depuis le Blueprint entrant et génère un gsap.fromTo() ciblant tes éléments pour que l'animation d'apparition se déclenche au chargement en respectant la physique demandée.
            `;
          }

          const result = await generateAgentStream(prompt, activeTools, systemInstruction);

          for await (const chunk of result.stream) {
            const chunkText = chunk.text();
            if (chunkText) sendEvent("text", { content: chunkText });

            const calls = chunk.functionCalls();
            if (calls) {
              for (const call of calls) {
                if (call.name === "emit_blueprint") {
                  sendEvent("log", { message: "✓ Matrice Blueprint Mathématique SOTY générée." });
                  sendEvent("blueprint", { data: call.args });
                } 
                else if (call.name === "inject_dom_and_physics") {
                  sendEvent("log", { message: "✓ Physique et DOM injectés sous contrainte stricte." });
                  sendEvent("code_injection", { data: call.args });
                }
              }
            }
          }

          sendEvent("log", { message: `Séquence de l'${agentId.split('-')[1]} terminée avec succès.` });
          controller.close();
        } catch (error: any) {
          sendEvent("error", { message: error.message });
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: { "Content-Type": "text/event-stream", "Cache-Control": "no-cache", "Connection": "keep-alive" },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: "Invalid Request Structure" }), { status: 400 });
  }
}