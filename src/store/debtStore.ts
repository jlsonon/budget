import { create } from 'zustand'
import { Debt } from '../types'
import { atomicDebtPayment } from '../services/atomicOps'
import { saveDocToCloud } from '../services/cloudSync'
import { FIRESTORE_COLLECTIONS } from '../services/firestoreCollections'
import { useToastStore } from './toastStore'

export interface DebtState {
  debts: Debt[]
  setDebts: (debts: Debt[]) => void
  addDebt: (debt: Debt) => Promise<void>
  makeDebtPayment: (debtId: string, amount: number) => Promise<void>
}

export const useDebtStore = create<DebtState>()((set) => ({
  debts: [],
  setDebts: (debts: Debt[]) => set({ debts }),
  addDebt: async (debt: Debt) => {
    set((s: DebtState) => ({ debts: [...s.debts, debt] }))
    try {
      await saveDocToCloud(FIRESTORE_COLLECTIONS.DEBTS, debt)
      useToastStore.getState().success('Debt item added', 'Saved')
    } catch (err: any) {
      useToastStore.getState().error('Failed to save debt', 'Error')
    }
  },
  makeDebtPayment: async (debtId: string, amount: number) => {
    const pmt = { id: crypto.randomUUID(), amount, date: new Date().toISOString(), method: 'cash' as const }
    set((s: DebtState) => ({
      debts: s.debts.map((d: Debt) => {
        if (d.id !== debtId) return d
        return {
          ...d,
          currentBalance: Math.max(0, d.currentBalance - amount),
          payments: [...d.payments, pmt],
          updatedAt: new Date().toISOString(),
        }
      }),
    }))
    try {
      await atomicDebtPayment(debtId, amount, pmt)
      useToastStore.getState().success(`Payment of ₱${amount.toLocaleString()} recorded!`, 'Paid')
    } catch (err: any) {
      useToastStore.getState().error('Failed to record debt payment', 'Error')
    }
  },
}))
