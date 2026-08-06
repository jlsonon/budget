import { create } from 'zustand'
import { Transaction } from '../types'
import { atomicAddTransaction, atomicDeleteTransaction } from '../services/atomicOps'
import { saveDocToCloud } from '../services/cloudSync'
import { FIRESTORE_COLLECTIONS } from '../services/firestoreCollections'
import { useToastStore } from './toastStore'

export interface TransactionState {
  transactions: Transaction[]
  isLoadingTransactions: boolean
  setTransactions: (txns: Transaction[]) => void
  addTransaction: (txn: Transaction) => Promise<void>
  updateTransaction: (id: string, updates: Partial<Transaction>) => Promise<void>
  deleteTransaction: (id: string) => Promise<void>
}

export const useTransactionStore = create<TransactionState>()((set, get) => ({
  transactions: [],
  isLoadingTransactions: false,
  setTransactions: (txns: Transaction[]) => set({ transactions: txns }),
  addTransaction: async (txn: Transaction) => {
    set((s: TransactionState) => ({ transactions: [txn, ...s.transactions] }))
    try {
      await atomicAddTransaction(txn)
      useToastStore.getState().success('Transaction recorded! 🍡', 'Success')
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
}))
