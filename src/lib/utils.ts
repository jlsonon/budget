import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number, currency = 'PHP'): string {
  const symbols: Record<string, string> = { PHP: '₱', USD: '$', EUR: '€', GBP: '£', JPY: '¥' }
  const symbol = symbols[currency] || currency
  return `${symbol}${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

export function formatDate(date: string | Date, format: 'short' | 'long' | 'relative' = 'short'): string {
  const d = typeof date === 'string' ? new Date(date) : date
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
  if (format === 'long') {
    return d.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
  }
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export function getGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good Morning'
  if (hour < 17) return 'Good Afternoon'
  return 'Good Evening'
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
