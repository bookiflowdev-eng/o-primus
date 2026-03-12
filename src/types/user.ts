export interface User {
  id: string
  email: string
  name?: string
  avatarUrl?: string
  planKey: 'starter' | 'pro' | 'agency'
  createdAt: string
  updatedAt: string
}

export interface UserQuotaDisplay {
  planKey: 'starter' | 'pro' | 'agency'
  generationsUsed: number
  generationsLimit: number
  resetAt: string
  percentUsed: number
}
