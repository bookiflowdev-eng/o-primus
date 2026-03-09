import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold, Schema } from '@google/generative-ai'

export interface GeminiClientOptions {
  apiKey: string
  timeout?: number
  maxRetries?: number
}

export interface GeminiCallOptions {
  systemPrompt: string
  userPrompt: string
  temperature: number
  topP?: number
  topK?: number
  maxOutputTokens: number
  thinkingBudget?: number 
  responseMimeType?: 'text/plain' | 'application/json'
  responseSchema?: Schema // Utilisation stricte des Structured Outputs Google
}

export class GeminiClient {
  private client: GoogleGenerativeAI
  private timeout: number
  private maxRetries: number

  constructor(options: GeminiClientOptions) {
    this.client = new GoogleGenerativeAI(options.apiKey)
    this.timeout = options.timeout || 150000 
    this.maxRetries = options.maxRetries || 2
  }

  async generateContent(options: GeminiCallOptions): Promise<{ text: string; tokensIn: number; tokensOut: number }> {
    const {
      systemPrompt, userPrompt, temperature, topP = 0.95, topK = 40,
      maxOutputTokens, thinkingBudget, responseMimeType = 'text/plain', responseSchema
    } = options

    for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
      try {
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), this.timeout)

        try {
          const model = this.client.getGenerativeModel({ model: 'gemini-3.1-pro-preview' })

          const request: any = {
            contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
            systemInstruction: systemPrompt,
            generationConfig: {
              temperature, topP, topK, maxOutputTokens, responseMimeType,
              ...(responseSchema && { responseSchema }),
              safetySettings: [{ category: HarmCategory.HARM_CATEGORY_UNSPECIFIED, threshold: HarmBlockThreshold.BLOCK_NONE }],
            },
          }

          if (thinkingBudget && thinkingBudget !== 0) {
            request.thinking = { budget_tokens: thinkingBudget === -1 ? Math.min(100000, maxOutputTokens * 2) : thinkingBudget }
          }

          const response = await model.generateContent(request)
          clearTimeout(timeoutId)

          return {
            text: response.content.parts[0]?.text || '',
            tokensIn: response.usageMetadata?.promptTokens || 0,
            tokensOut: response.usageMetadata?.candidatesTokens || 0,
          }
        } finally {
          clearTimeout(timeoutId)
        }
      } catch (error) {
        const isLastAttempt = attempt === this.maxRetries
        console.error(`[GeminiClient] Attempt ${attempt + 1} failed:`, error)
        if (isLastAttempt) throw error
        await new Promise((resolve) => setTimeout(resolve, Math.pow(2, attempt) * 1500))
      }
    }
    throw new Error('Max retries exceeded')
  }

  async generateJSON<T>(options: GeminiCallOptions): Promise<{ data: T; tokens: { in: number; out: number } }> {
    const result = await this.generateContent({ ...options, responseMimeType: 'application/json' })

    let parsed: T
    try {
      parsed = JSON.parse(result.text)
    } catch {
      // AST Repair fallback if LLM leaked markdown codeblocks despite responseMimeType
      let clean = result.text.replace(/```json/g, '').replace(/```/g, '').trim()
      const start = clean.indexOf('{')
      const end = clean.lastIndexOf('}')
      if (start !== -1 && end !== -1) clean = clean.substring(start, end + 1)
      try {
        parsed = JSON.parse(clean)
      } catch (e) {
        throw new Error(`Failed to parse JSON response natively: ${result.text.substring(0, 200)}`)
      }
    }
    return { data: parsed, tokens: { in: result.tokensIn, out: result.tokensOut } }
  }
}

let clientInstance: GeminiClient | null = null
export function getGeminiClient(): GeminiClient {
  if (!clientInstance) {
    clientInstance = new GeminiClient({ apiKey: process.env.GEMINI_API_KEY || '', timeout: 150000, maxRetries: 2 })
  }
  return clientInstance
}

export { SchemaType } from '@google/generative-ai'