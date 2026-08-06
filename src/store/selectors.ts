import { useMemo } from 'react'
import { useWalletStore } from './walletStore'
import { useTransactionStore } from './transactionStore'
import { useBudgetStore } from './budgetStore'
import { Wallet, Transaction, Budget } from '../types'

/**
 * Total balance across all non-excluded wallets
 */
export function useTotalBalance(): number {
  const wallets = useWalletStore((s) => s.wallets)
  return useMemo(
    () => wallets.filter((w: Wallet) => w.includeInTotal).reduce((sum: number, w: Wallet) => sum + w.balance, 0),
    [wallets]
  )
}

/**
 * Budget remaining for a specific category
 */
export function useBudgetRemaining(categoryId: string): { limit: number; spent: number; remaining: number; percentage: number } {
  const budgets = useBudgetStore((s) => s.budgets)
  const transactions = useTransactionStore((s) => s.transactions)

  return useMemo(() => {
    const budget = budgets.find((b: Budget) => b.categoryId === categoryId)
    if (!budget) return { limit: 0, spent: 0, remaining: 0, percentage: 0 }

    const now = new Date()
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
    const spent = transactions
      .filter((t: Transaction) => t.categoryId === categoryId && t.type === 'expense' && t.date >= monthStart)
      .reduce((sum: number, t: Transaction) => sum + t.amount, 0)

    const remaining = Math.max(0, budget.limit - spent)
    const percentage = budget.limit > 0 ? Math.min(100, Math.round((spent / budget.limit) * 100)) : 0

    return { limit: budget.limit, spent, remaining, percentage }
  }, [budgets, transactions, categoryId])
}

/**
 * Total monthly income vs expense
 */
export function useMonthlyTotals(): { income: number; expense: number; net: number } {
  const transactions = useTransactionStore((s) => s.transactions)

  return useMemo(() => {
    const now = new Date()
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()

    const monthTxns = transactions.filter((t: Transaction) => t.date >= monthStart)
    const income = monthTxns.filter((t: Transaction) => t.type === 'income').reduce((sum: number, t: Transaction) => sum + t.amount, 0)
    const expense = monthTxns.filter((t: Transaction) => t.type === 'expense').reduce((sum: number, t: Transaction) => sum + t.amount, 0)

    return { income, expense, net: income - expense }
  }, [transactions])
}
