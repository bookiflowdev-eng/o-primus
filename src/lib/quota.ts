import { supabaseAdmin } from './supabase'
import { STRIPE_PLANS } from './stripe'
import type { PlanKey } from './stripe'

export type { PlanKey } from './stripe'

export interface UserQuota {
  userId: string
  planKey: PlanKey
  generationsUsed: number
  generationsLimit: number
  resetAt: string
}

export async function getUserQuota(userId: string): Promise<UserQuota | null> {
  const { data, error } = await supabaseAdmin
    .from('user_quotas')
    .select('*')
    .eq('user_id', userId)
    .single()

  if (error || !data) return null

  const planKey = (data.plan_key ?? 'starter') as PlanKey

  return {
    userId,
    planKey,
    generationsUsed: data.generations_used as number ?? 0,
    generationsLimit: STRIPE_PLANS[planKey].generations,
    resetAt: data.reset_at as string ?? '',
  }
}

export async function checkAndDecrementQuota(userId: string): Promise<boolean> {
  const quota = await getUserQuota(userId)
  if (!quota) return false
  if (quota.generationsUsed >= quota.generationsLimit) return false

  const { error } = await supabaseAdmin
    .from('user_quotas')
    .update({ generations_used: quota.generationsUsed + 1 })
    .eq('user_id', userId)

  return !error
}

export async function resetQuota(userId: string, planKey: PlanKey): Promise<void> {
  const resetAt = new Date()
  resetAt.setMonth(resetAt.getMonth() + 1)

  await supabaseAdmin.from('user_quotas').upsert({
    user_id: userId,
    plan_key: planKey,
    generations_used: 0,
    reset_at: resetAt.toISOString(),
  }, { onConflict: 'user_id' })
}
