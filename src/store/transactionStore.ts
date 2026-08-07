import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Transaction } from '../types'
import { atomicAddTransaction, atomicDeleteTransaction } from '../services/atomicOps'
import { saveDocToCloud } from '../services/cloudSync'
import { FIRESTORE_COLLECTIONS } from '../services/firestoreCollections'
import { useToastStore } from './toastStore'
import { useNotificationStore } from './notificationStore'
import { useWalletStore } from './walletStore'
import { useAuthStore } from './authStore'

export interface TransactionState {
  transactions: Transaction[]
  isLoadingTransactions: boolean
  setTransactions: (txns: Transaction[]) => void
  addTransaction: (txn: Transaction) => Promise<void>
  updateTransaction: (id: string, updates: Partial<Transaction>) => Promise<void>
  deleteTransaction: (id: string) => Promise<void>
}

export const useTransactionStore = create<TransactionState>()(
  persist(
    (set, get) => ({
      transactions: [],
      isLoadingTransactions: false,
      setTransactions: (txns: Transaction[]) => {
        const map = new Map<string, Transaction>()
        txns.forEach((t) => {
          if (t.id) map.set(t.id, t)
        })
        const sorted = Array.from(map.values()).sort((a, b) => {
          const tA = new Date(a.date || (a as any).createdAt || 0).getTime()
          const tB = new Date(b.date || (b as any).createdAt || 0).getTime()
          if (tB !== tA) return tB - tA
          return (b.id || '').localeCompare(a.id || '')
        })
        set({ transactions: sorted })
      },
      addTransaction: async (txn: Transaction) => {
        const userId = useAuthStore.getState().user?.id || txn.userId || 'anon'
        const txnWithUser = { ...txn, userId }

        set((s: TransactionState) => {
          const map = new Map<string, Transaction>()
          ;[txnWithUser, ...s.transactions].forEach((t) => {
            if (t.id) map.set(t.id, t)
          })
          const sorted = Array.from(map.values()).sort((a, b) => {
            const tA = new Date(a.date || (a as any).createdAt || 0).getTime()
            const tB = new Date(b.date || (b as any).createdAt || 0).getTime()
            if (tB !== tA) return tB - tA
            return (b.id || '').localeCompare(a.id || '')
          })
          return { transactions: sorted }
        })
        try {
          await atomicAddTransaction(txnWithUser)

          // Build detailed transaction details message
          const typeLabel = txn.type === 'income' ? 'Income' : txn.type === 'transfer' ? 'Transfer' : 'Expense'
          const amountStr = `₱${Number(txn.amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
          const merchantStr = txn.merchant ? ` for "${txn.merchant}"` : ''
          const walletObj = useWalletStore.getState().wallets.find((w) => w.id === txn.walletId)
          const walletStr = walletObj ? ` (${walletObj.name})` : ''

          const detailsMsg = `Logged ${typeLabel} of ${amountStr}${merchantStr}${walletStr}`

          // 1. Trigger prominent Toast message
          useToastStore.getState().success(detailsMsg, 'Transaction Success!')

          // 2. Log in App Notifications
          useNotificationStore.getState().addNotification({
            id: `notif_txn_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
            userId,
            type: 'bill_reminder',
            title: `Transaction Logged Successfully!`,
            message: detailsMsg,
            read: false,
            date: new Date().toISOString(),
            deepLink: '/transactions',
          })
        } catch (err: any) {
          useToastStore.getState().error(err.message || 'Failed to save transaction', 'Error')
        }
      },
  updateTransaction: async (id: string, updates: Partial<Transaction>) => {
    const prevTxns = get().transactions
    set((s: TransactionState) => ({
      transactions: s.transactions.map((t: Transaction) => (t.id === id ? { ...t, ...updates, updatedAt: new Date().toISOString() } : t)),
    }))
    const updated = get().transactions.find((t: Transaction) => t.id === id)
    if (updated) {
      try {
        await saveDocToCloud(FIRESTORE_COLLECTIONS.TRANSACTIONS, updated)
        useToastStore.getState().success('Transaction updated', 'Saved')
      } catch (err: any) {
        set({ transactions: prevTxns })
        useToastStore.getState().error('Failed to update transaction', 'Error')
      }
    }
  },
  deleteTransaction: async (id: string) => {
    const target = get().transactions.find((t: Transaction) => t.id === id)
    const prevTxns = get().transactions
    set((s: TransactionState) => ({ transactions: s.transactions.filter((t: Transaction) => t.id !== id) }))
    if (target) {
      try {
        await atomicDeleteTransaction(target)
        useToastStore.getState().info('Transaction deleted', 'Removed')
      } catch (err: any) {
        set({ transactions: prevTxns })
        useToastStore.getState().error('Failed to delete transaction', 'Error')
      }
    }
  },
    }),
    {
      name: 'mochi-transactions-storage',
    }
  )
)
