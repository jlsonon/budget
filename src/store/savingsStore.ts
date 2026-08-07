import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { SavingsGoal } from '../types'
import { atomicSavingsContribution } from '../services/atomicOps'
import { saveDocToCloud } from '../services/cloudSync'
import { FIRESTORE_COLLECTIONS } from '../services/firestoreCollections'
import { useToastStore } from './toastStore'

export interface SavingsState {
  savingsGoals: SavingsGoal[]
  setSavingsGoals: (goals: SavingsGoal[]) => void
  addSavingsGoal: (goal: SavingsGoal) => Promise<void>
  contributeToGoal: (goalId: string, amount: number) => Promise<void>
}

export const useSavingsStore = create<SavingsState>()(
  persist(
    (set) => ({
      savingsGoals: [],
      setSavingsGoals: (goals: SavingsGoal[]) => set({ savingsGoals: goals }),
      addSavingsGoal: async (goal: SavingsGoal) => {
        set((s: SavingsState) => ({ savingsGoals: [...s.savingsGoals, goal] }))
        try {
          await saveDocToCloud(FIRESTORE_COLLECTIONS.SAVINGS, goal)
          useToastStore.getState().success('Savings goal created!', 'Saved')
        } catch (err: any) {
          useToastStore.getState().error('Failed to create goal', 'Error')
        }
      },
      contributeToGoal: async (goalId: string, amount: number) => {
        const contrib = { id: crypto.randomUUID(), amount, date: new Date().toISOString() }
        set((s: SavingsState) => ({
          savingsGoals: s.savingsGoals.map((g: SavingsGoal) => {
            if (g.id !== goalId) return g
            return {
              ...g,
              currentAmount: g.currentAmount + amount,
              contributions: [...g.contributions, contrib],
              updatedAt: new Date().toISOString(),
            }
          }),
        }))
        try {
          await atomicSavingsContribution(goalId, amount, contrib)
          useToastStore.getState().success(`Contributed ₱${amount.toLocaleString()}!`, 'Progress')
        } catch (err: any) {
          useToastStore.getState().error('Failed to save contribution', 'Error')
        }
      },
    }),
    {
      name: 'mochi-savings-storage',
    }
  )
)
