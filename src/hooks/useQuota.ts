'use client'
import { useState, useEffect } from 'react'
import { useAuth } from './useAuth'
import type { UserQuotaDisplay } from '@/types/user'

export function useQuota() {
  const { userId, isAuthenticated } = useAuth()
  const [quota, setQuota] = useState<UserQuotaDisplay | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!isAuthenticated || userId === 'anonymous') {
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    fetch(`/api/generations?userId=${userId}&quotaOnly=true`)
      .then(res => res.ok ? res.json() : Promise.reject(res.statusText))
      .then(data => {
        setQuota(data.quota ?? null)
        setError(null)
      })
      .catch(err => setError(String(err)))
      .finally(() => setIsLoading(false))
  }, [userId, isAuthenticated])

  const canGenerate = quota ? quota.generationsUsed < quota.generationsLimit : true

  return { quota, isLoading, error, canGenerate }
}
