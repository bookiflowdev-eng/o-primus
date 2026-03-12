'use client'
import { useState, useCallback } from 'react'
import type { GenerationRequest, GenerationOutput } from '@/types/generation'

type GenerationStatus = 'idle' | 'generating' | 'completed' | 'failed'

export function useGeneration() {
  const [status, setStatus] = useState<GenerationStatus>('idle')
  const [result, setResult] = useState<GenerationOutput | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [generationId, setGenerationId] = useState<string | null>(null)

  const generate = useCallback(async (request: GenerationRequest): Promise<GenerationOutput | null> => {
    setStatus('generating')
    setError(null)
    setResult(null)

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error ?? 'Erreur pipeline O-Primus')
      }

      setResult(data)
      setGenerationId(data.id ?? null)
      setStatus('completed')
      return data
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur inconnue'
      setError(message)
      setStatus('failed')
      return null
    }
  }, [])

  const reset = useCallback(() => {
    setStatus('idle')
    setResult(null)
    setError(null)
    setGenerationId(null)
  }, [])

  return { status, result, error, generationId, generate, reset }
}
