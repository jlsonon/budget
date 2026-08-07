import type { Transaction } from '@/types'

/**
 * Dynamically computes real consecutive active transaction streaks
 * from the user's recorded transaction dates.
 */
export function calculateRealStreak(transactions: Transaction[]): { current: number; longest: number } {
  if (!transactions || transactions.length === 0) {
    return { current: 0, longest: 0 }
  }

  // Extract unique sorted dates (YYYY-MM-DD), descending
  const uniqueDates = Array.from(
    new Set(
      transactions
        .map((t) => t.date?.split('T')[0])
        .filter(Boolean) as string[]
    )
  ).sort((a, b) => (a < b ? 1 : -1))

  if (uniqueDates.length === 0) return { current: 0, longest: 0 }

  const today = new Date().toISOString().split('T')[0]
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]

  const newestDate = uniqueDates[0]

  // Active streak requires a transaction today or yesterday
  const isStreakActive = newestDate === today || newestDate === yesterday
  
  let current = 0
  let longest = 0
  let tempStreak = 0

  // Calculate current active consecutive days
  if (isStreakActive) {
    let checkDate = new Date(newestDate)
    for (const dStr of uniqueDates) {
      const expectedStr = checkDate.toISOString().split('T')[0]
      if (dStr === expectedStr) {
        current++
        checkDate.setDate(checkDate.getDate() - 1)
      } else {
        break
      }
    }
  }

  // Calculate all-time longest streak
  for (let i = 0; i < uniqueDates.length; i++) {
    if (i === 0) {
      tempStreak = 1
    } else {
      const prevDate = new Date(uniqueDates[i - 1])
      const currDate = new Date(uniqueDates[i])
      const diffDays = Math.round((prevDate.getTime() - currDate.getTime()) / (1000 * 3600 * 24))
      
      if (diffDays === 1) {
        tempStreak++
      } else {
        tempStreak = 1
      }
    }
    if (tempStreak > longest) longest = tempStreak
  }

  return { current, longest: Math.max(longest, current) }
}
