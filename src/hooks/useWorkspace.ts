'use client'

import { useState, useEffect, useRef } from 'react'

export interface WorkspaceLog {
  message: string
  type: 'info' | 'success' | 'warn' | 'error'
  time: string
}

export function useWorkspace(jobId: string | null) {
  const [job, setJob] = useState<any>(null)
  const [status, setStatus] = useState<string>('idle')
  const [logs, setLogs] = useState<WorkspaceLog[]>([])
  const isPolling = useRef(false)

  const addLog = (message: string, type: WorkspaceLog['type'] = 'info') => {
    setLogs(prev => {
      if (prev.length > 0 && prev[prev.length - 1].message === message) return prev
      return [...prev, { message, type, time: new Date().toLocaleTimeString() }]
    })
  }

  useEffect(() => {
    if (!jobId) return
    isPolling.current = true
    addLog('Initialisation du tunnel sécurisé avec les agents...', 'info')

    const poll = async () => {
      if (!isPolling.current) return
      try {
        const res = await fetch(`/api/jobs/${jobId}`)
        if (res.status === 401 || res.status === 403) return
        if (!res.ok) throw new Error('Connexion perdue avec le cluster.')
        
        const data = await res.json()
        setJob(data)
        setStatus(data.status)
        
        if (data.status === 'failed') {
          addLog(`Erreur système: ${data.error}`, 'error')
          isPolling.current = false
        } else if (data.status === 'completed') {
          addLog('Architecture SOTD compilée avec succès.', 'success')
          isPolling.current = false
        } else {
          addLog(`[Thread Actif] Étape ${data.currentStep || 0}/6 en cours de résolution vectorielle...`, 'info')
          setTimeout(poll, 2500)
        }
      } catch (err) {
        console.error(err)
        setTimeout(poll, 2500)
      }
    }

    poll()
    return () => { isPolling.current = false }
  }, [jobId])

  return { job, status, logs }
}