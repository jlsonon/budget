import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Budget } from '../types'
import { saveDocToCloud, deleteDocFromCloud } from '../services/cloudSync'
import { FIRESTORE_COLLECTIONS } from '../services/firestoreCollections'
import { useToastStore } from './toastStore'

export interface BudgetState {
  budgets: Budget[]
  setBudgets: (budgets: Budget[]) => void
  addBudget: (budget: Budget) => Promise<void>
  updateBudget: (id: string, updates: Partial<Budget>) => Promise<void>
  deleteBudget: (id: string) => Promise<void>
}

export const useBudgetStore = create<BudgetState>()(
  persist(
    (set, get) => ({
      budgets: [],
      setBudgets: (budgets: Budget[]) => set({ budgets }),
      addBudget: async (budget: Budget) => {
        set((s: BudgetState) => ({ budgets: [...s.budgets, budget] }))
        try {
          await saveDocToCloud(FIRESTORE_COLLECTIONS.BUDGETS, budget)
          useToastStore.getState().success('Budget created!', 'Saved')
        } catch (err: any) {
          useToastStore.getState().error('Failed to create budget', 'Error')
        }
      },
      updateBudget: async (id: string, updates: Partial<Budget>) => {
        set((s: BudgetState) => ({
          budgets: s.budgets.map((b: Budget) => (b.id === id ? { ...b, ...updates, updatedAt: new Date().toISOString() } : b)),
        }))
        const updated = get().budgets.find((b: Budget) => b.id === id)
        if (updated) {
          await saveDocToCloud(FIRESTORE_COLLECTIONS.BUDGETS, updated)
          useToastStore.getState().success('Budget updated!', 'Saved')
        }
      },
      deleteBudget: async (id: string) => {
        set((s: BudgetState) => ({
          budgets: s.budgets.filter((b: Budget) => b.id !== id),
        }))
        try {
          await deleteDocFromCloud(FIRESTORE_COLLECTIONS.BUDGETS, id)
          useToastStore.getState().success('Budget plan deleted.', 'Deleted')
        } catch (err: any) {
          console.warn('Delete budget notice:', err)
        }
      },
    }),
    {
      name: 'mochi-budgets-storage',
    }
  )
)
