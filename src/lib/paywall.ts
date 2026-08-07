import type { UserProfile } from '@/types'

export const FREE_LIMITS = {
  maxWallets: 1,
  maxBudgets: 3,
  maxSavingsGoals: 2,
  maxSubscriptions: 2,
  canUseCircles: false,
  canScanReceipts: false,
  canExportCSV: false,
  allowedThemes: ['sakura', 'moonlight'],
}

export function isProUser(user: UserProfile | null): boolean {
  if (!user) return false
  if (user.role === 'superadmin' || user.email === 'jlsonon12@gmail.com') return true
  return user.subscriptionTier === 'pro' || user.paidAmount === 199 || user.subscriptionStatus === 'active'
}

export function checkCanAddWallet(user: UserProfile | null, currentCount: number): boolean {
  if (isProUser(user)) return true
  return currentCount < FREE_LIMITS.maxWallets
}

export function checkCanAddBudget(user: UserProfile | null, currentCount: number): boolean {
  if (isProUser(user)) return true
  return currentCount < FREE_LIMITS.maxBudgets
}

export function checkCanAddSavingsGoal(user: UserProfile | null, currentCount: number): boolean {
  if (isProUser(user)) return true
  return currentCount < FREE_LIMITS.maxSavingsGoals
}

export function checkCanAddSubscription(user: UserProfile | null, currentCount: number): boolean {
  if (isProUser(user)) return true
  return currentCount < FREE_LIMITS.maxSubscriptions
}

export function checkCanUseTheme(user: UserProfile | null, themeId: string): boolean {
  if (isProUser(user)) return true
  return FREE_LIMITS.allowedThemes.includes(themeId)
}
