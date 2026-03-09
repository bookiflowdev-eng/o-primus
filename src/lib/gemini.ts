import {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
  SchemaType,
  FunctionDeclaration,
} from '@google/generative-ai';

if (!process.env.GEMINI_API_KEY) {
  throw new Error('GEMINI_API_KEY manquante dans .env.local');
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// ============================================================
// CONFIGURATION DES MODÈLES O-PRIMUS (STRICT)
// ============================================


export const geminiAgentModel = genAI.getGenerativeModel({
  model: 'gemini-3.1-pro-preview-customtools',
  safetySettings: [
    { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
    { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
    { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
    { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
  ],
  generationConfig: {
    temperature: 0.0, // Strictement 0 pour l'Agent 1 (Architecte)
    maxOutputTokens: 65536,
  },
});

// 2. MODÈLE SEARCH — Veille Awwwards & Tendances
export const geminiSearchModel = genAI.getGenerativeModel({
  model: 'gemini-3.1-pro-preview',
  // @ts-expect-error — google_search est valide en runtime Gemini 3.1
  tools: [{ google_search: {} }],
  generationConfig: {
    temperature: 0.7, // Un peu plus créatif pour le search
    maxOutputTokens: 8192,
  },
});

// 3. MODÈLE CODE EXECUTION — Validation des shaders et physiques
export const geminiCodeModel = genAI.getGenerativeModel({
  model: 'gemini-3.1-pro-preview',
  // @ts-expect-error — code_execution est valide en runtime Gemini 3.1
  tools: [{ code_execution: {} }],
  generationConfig: {
    temperature: 0.2, // Faible température pour la rigueur du code
    maxOutputTokens: 32768,
  },
});

// ============================================================
// GÉNÉRATION AGENTS (VERSION STREAMING SSE COMPATIBLE)
// ============================================================
export async function generateAgentStream(
  prompt: string,
  tools: FunctionDeclaration[] = [],
  systemInstruction?: string
) {
  // On crée une instance de chat pour maintenir l'état et supporter les tools
  const chat = geminiAgentModel.startChat({
    history: systemInstruction ? [
      { role: 'user', parts: [{ text: systemInstruction }] },
      { role: 'model', parts: [{ text: "Instructions O-Primus reçues. Je suis prêt." }] }
    ] : [],
    tools: tools.length > 0 ? [{ functionDeclarations: tools }] : [],
  });

  // Retourne le stream pour que la route API puisse le consommer en SSE
  return await chat.sendMessageStream(prompt);
}

// ============================================================
// UTILS DE VALIDATION & SEARCH (BLOQUANTS)
// ============================================================
export async function generateWithSearch(prompt: string): Promise<string> {
  const result = await geminiSearchModel.generateContent(prompt);
  return result.response.text();
}

export async function validateCodeLogic(prompt: string): Promise<string> {
  const result = await geminiCodeModel.generateContent(prompt);
  return result.response.text();
}

export { SchemaType };
export type { FunctionDeclaration };