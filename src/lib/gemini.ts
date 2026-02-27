import {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
  SchemaType,
} from '@google/generative-ai'

if (!process.env.GEMINI_API_KEY) {
  throw new Error('GEMINI_API_KEY manquante dans .env.local')
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)

// ============================================================
// MODÈLE AGENTS — gemini-3.1-pro-preview-customtools
// Variant officiel Google pour les agents avec function calling
// Ne jamais substituer par un autre modèle
// ============================================================
export const geminiAgentModel = genAI.getGenerativeModel({
  model: 'gemini-3.1-pro-preview-customtools',
  safetySettings: [
    { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
    { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
    { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
    { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
  ],
  generationConfig: {
    temperature: 1.0,
    maxOutputTokens: 65536,
  },
})

// ============================================================
// MODÈLE SEARCH — gemini-3.1-pro-preview + Google Search
// Séparé car built-in tools + function calling ne se mixent pas
// SDK v0.24 utilise snake_case pour les built-in tools
// ============================================================
export const geminiSearchModel = genAI.getGenerativeModel({
  model: 'gemini-3.1-pro-preview',
  // @ts-expect-error — google_search est valide en runtime Gemini 3.1, pas encore typé dans SDK v0.24
  tools: [{ google_search: {} }],
  safetySettings: [
    { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
    { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
    { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
    { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
  ],
  generationConfig: {
    temperature: 1.0,
    maxOutputTokens: 8192,
  },
})

// ============================================================
// MODÈLE CODE EXECUTION — gemini-3.1-pro-preview + code_execution
// Séparé pour valider la logique générée avant livraison
// ============================================================
export const geminiCodeModel = genAI.getGenerativeModel({
  model: 'gemini-3.1-pro-preview',
  // @ts-expect-error — code_execution est valide en runtime Gemini 3.1, pas encore typé dans SDK v0.24
  tools: [{ code_execution: {} }],
  safetySettings: [
    { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
    { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
    { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
    { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
  ],
  generationConfig: {
    temperature: 1.0,
    maxOutputTokens: 32768,
  },
})

// ============================================================
// GÉNÉRATION AGENTS — function calling avec custom tools
// ============================================================
export async function generateWithAgent(
  prompt: string,
  tools: object[]
): Promise<{ text: string; functionCalls: Array<{ name: string; args: Record<string, unknown> }> }> {
  const modelWithTools = genAI.getGenerativeModel({
    model: 'gemini-3.1-pro-preview-customtools',
    tools: tools as never,
    generationConfig: { temperature: 1.0, maxOutputTokens: 65536 },
  })
  const result = await modelWithTools.generateContent(prompt)
  const response = result.response
  const functionCalls = response.functionCalls() ?? []
  return {
    text: response.text(),
    functionCalls: functionCalls.map(fc => ({
      name: fc.name,
      args: fc.args as Record<string, unknown>,
    })),
  }
}

// ============================================================
// GÉNÉRATION SEARCH — veille tendances design Awwwards live
// ============================================================
export async function generateWithSearch(prompt: string): Promise<string> {
  const result = await geminiSearchModel.generateContent(prompt)
  return result.response.text()
}

// ============================================================
// GÉNÉRATION CODE VALIDATION — auto-vérification avant livraison
// ============================================================
export async function generateWithCodeExecution(prompt: string): Promise<string> {
  const result = await geminiCodeModel.generateContent(prompt)
  return result.response.text()
}

// ============================================================
// RETRY UNIVERSEL — backoff exponentiel, zéro substitution modèle
// ============================================================
export async function generateWithRetry(
  prompt: string,
  mode: 'agent' | 'search' | 'code' = 'agent',
  tools: object[] = [],
  maxRetries = 3
): Promise<string> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      if (mode === 'search') return await generateWithSearch(prompt)
      if (mode === 'code') return await generateWithCodeExecution(prompt)
      const res = await generateWithAgent(prompt, tools)
      return res.text
    } catch (error: unknown) {
      const isLastAttempt = attempt === maxRetries
      const msg = error instanceof Error ? error.message : String(error)
      if (isLastAttempt) throw new Error(`Gemini 3.1 Pro échec après ${maxRetries} tentatives: ${msg}`)
      await new Promise(resolve => setTimeout(resolve, attempt * 1500))
    }
  }
  throw new Error('Gemini 3.1 Pro: toutes les tentatives ont échoué')
}

// Export SchemaType pour les agents — évite les imports redondants
export { SchemaType }
