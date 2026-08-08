import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number, currency = 'PHP'): string {
  const symbols: Record<string, string> = {
    PHP: '₱',
    USD: '$',
    EUR: '€',
    GBP: '£',
    JPY: '¥',
    AUD: 'A$',
    CAD: 'C$',
    SGD: 'S$',
    HKD: 'HK$',
    KRW: '₩',
    THB: '฿',
    MYR: 'RM',
    IDR: 'Rp',
    INR: '₹',
    NZD: 'NZ$',
    AED: 'AED ',
    CNY: '¥',
  }
  const symbol = symbols[currency] || `${currency} `
  const isZeroDecimals = currency === 'JPY' || currency === 'KRW' || currency === 'IDR'
  return `${symbol}${amount.toLocaleString('en-US', {
    minimumFractionDigits: isZeroDecimals ? 0 : 2,
    maximumFractionDigits: isZeroDecimals ? 0 : 2,
  })}`
}

export function formatDate(date: string | Date, format: 'short' | 'long' | 'relative' = 'short'): string {
  const d = typeof date === 'string' ? new Date(date) : date
  if (isNaN(d.getTime())) return 'Jan 01, 2026'
  
  if (format === 'relative') {
    const now = new Date()
    const diff = now.getTime() - d.getTime()
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    if (days === 0) return 'Today'
    if (days === 1) return 'Yesterday'
    if (days < 7) return `${days} days ago`
    if (days < 30) return `${Math.floor(days / 7)} weeks ago`
    return `${Math.floor(days / 30)} months ago`
  }

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const monthName = months[d.getMonth()]
  const dd = String(d.getDate()).padStart(2, '0')
  const yyyy = d.getFullYear()
  return `${monthName} ${dd}, ${yyyy}`
}

export function formatTime(timeInput?: string | Date): string {
  if (!timeInput) {
    const now = new Date()
    return now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }).toLowerCase()
  }
  if (typeof timeInput === 'string' && (timeInput.includes('am') || timeInput.includes('pm'))) {
    return timeInput.toLowerCase()
  }
  const d = typeof timeInput === 'string' ? new Date(timeInput) : timeInput
  if (isNaN(d.getTime())) {
    const now = new Date()
    return now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }).toLowerCase()
  }
  return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }).toLowerCase()
}

export function getGreeting(): string {
  const hour = new Date().getHours()
  if (hour >= 5 && hour < 12) return 'Good Morning'
  if (hour >= 12 && hour < 17) return 'Good Afternoon'
  if (hour >= 17 && hour < 22) return 'Good Evening'
  return 'Good Night'
}

export function getGreetingInfo(): { greeting: string; subtitle: string; iconType: 'sun' | 'sunset' | 'moon'; colorClass: string } {
  const hour = new Date().getHours()
  if (hour >= 5 && hour < 12) {
    return {
      greeting: 'Good Morning',
      subtitle: 'Start your day with smart money habits!',
      iconType: 'sun',
      colorClass: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
    }
  }
  if (hour >= 12 && hour < 17) {
    return {
      greeting: 'Good Afternoon',
      subtitle: 'Hope your day is productive & bright!',
      iconType: 'sun',
      colorClass: 'text-orange-500 bg-orange-500/10 border-orange-500/20',
    }
  }
  if (hour >= 17 && hour < 22) {
    return {
      greeting: 'Good Evening',
      subtitle: 'Review your daily spending & savings!',
      iconType: 'sunset',
      colorClass: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
    }
  }
  return {
    greeting: 'Good Night',
    subtitle: 'Rest well! Mochi is keeping your budget safe.',
    iconType: 'moon',
    colorClass: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
  }
}


export function calculateProgress(current: number, target: number): number {
  if (target === 0) return 0
  return Math.min(100, Math.max(0, (current / target) * 100))
}

export function getHealthScoreColor(score: number): string {
  if (score >= 80) return 'text-mochi-success'
  if (score >= 60) return 'text-mochi-warning'
  if (score >= 40) return 'text-orange-500'
  return 'text-mochi-error'
}

export function getHealthScoreBg(score: number): string {
  if (score >= 80) return 'bg-mochi-success'
  if (score >= 60) return 'bg-mochi-warning'
  if (score >= 40) return 'bg-orange-500'
  return 'bg-mochi-error'
}

/**
 * Single source of truth calculation for Financial Health Score across Dashboard and Reports
 */
export function calculateFinancialHealthScore({
  income,
  expenses,
  totalDebt,
}: {
  income: number
  expenses: number
  totalDebt: number
}): number {
  if (income === 0 && expenses === 0 && totalDebt === 0) return 100

  const netSurplus = income - expenses
  const savingsRate = income > 0 ? Math.max(0, (netSurplus / income) * 100) : 0
  const savingsPillar = Math.min(45, Math.max(0, savingsRate * 0.9))
  const surplusPillar = income > 0 ? Math.min(35, Math.max(0, (netSurplus / income) * 35)) : (expenses > 0 ? 5 : 20)
  const debtPillar = totalDebt === 0 ? 20 : Math.max(0, 20 - (totalDebt / Math.max(1, income || 1)) * 5)
  
  return Math.min(100, Math.max(15, Math.round(savingsPillar + surplusPillar + debtPillar)))
}

export function debounce<T extends (...args: unknown[]) => void>(fn: T, ms: number): T {
  let timer: ReturnType<typeof setTimeout>
  return ((...args: Parameters<T>) => {
    clearTimeout(timer)
    timer = setTimeout(() => fn(...args), ms)
  }) as T
}

export function generateId(): string {
  return crypto.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

// Default categories
export const DEFAULT_EXPENSE_CATEGORIES = [
  { id: 'food', name: 'Food & Dining', icon: 'Utensils', color: '#F97316' },
  { id: 'transport', name: 'Transportation', icon: 'Car', color: '#3B82F6' },
  { id: 'shopping', name: 'Shopping', icon: 'ShoppingBag', color: '#A855F7' },
  { id: 'bills', name: 'Bills & Utilities', icon: 'Receipt', color: '#EF4444' },
  { id: 'health', name: 'Health & Wellness', icon: 'Heart', color: '#10B981' },
  { id: 'entertainment', name: 'Entertainment', icon: 'Gamepad2', color: '#F59E0B' },
  { id: 'education', name: 'Education', icon: 'GraduationCap', color: '#6366F1' },
  { id: 'housing', name: 'Housing', icon: 'Home', color: '#8B5CF6' },
  { id: 'personal', name: 'Personal Care', icon: 'Smile', color: '#EC4899' },
  { id: 'gifts', name: 'Gifts & Donations', icon: 'Gift', color: '#F43F5E' },
  { id: 'subscriptions', name: 'Subscriptions', icon: 'Repeat', color: '#14B8A6' },
  { id: 'debt_payment', name: 'Debt Payment', icon: 'CreditCard', color: '#DC2626' },
  { id: 'savings', name: 'Savings', icon: 'PiggyBank', color: '#22C55E' },
  { id: 'other_expense', name: 'Other', icon: 'Ellipsis', color: '#6B7280' },
]

export const DEFAULT_INCOME_CATEGORIES = [
  { id: 'salary', name: 'Salary', icon: 'Briefcase', color: '#10B981' },
  { id: 'freelance', name: 'Freelance', icon: 'Laptop', color: '#3B82F6' },
  { id: 'investment', name: 'Investment', icon: 'TrendingUp', color: '#8B5CF6' },
  { id: 'gift_received', name: 'Gifts Received', icon: 'Gift', color: '#EC4899' },
  { id: 'refund', name: 'Refunds', icon: 'RotateCcw', color: '#F59E0B' },
  { id: 'other_income', name: 'Other', icon: 'Ellipsis', color: '#6B7280' },
]
