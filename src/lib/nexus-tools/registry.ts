import { marinerTool } from './mariner.tool';

/**
 * ============================================================================
 * NEXUS AGENTIC OS - TOOL REGISTRY (MODULAIRE)
 * ============================================================================
 * Exporte l'ensemble des bras articulés disponibles pour Gemini 3.1 Pro.
 */

export const nexusTools = {
  // Phase 1 : Agent Navigateur
  mariner_navigate: marinerTool,

  // TODO Phase 2 & 3: tool_generate_svg, tool_save_to_vault...
  // TODO Phase 4: tool_surgeon_update_dom...
};