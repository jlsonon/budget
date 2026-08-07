import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Debt } from '../types'
import { atomicDebtPayment } from '../services/atomicOps'
import { saveDocToCloud } from '../services/cloudSync'
import { FIRESTORE_COLLECTIONS } from '../services/firestoreCollections'
import { useToastStore } from './toastStore'

export interface DebtState {
  debts: Debt[]
  setDebts: (debts: Debt[]) => void
  addDebt: (debt: Debt) => Promise<void>
  makeDebtPayment: (debtId: string, amount: number, walletId?: string, notes?: string) => Promise<void>
}

export const useDebtStore = create<DebtState>()(
  persist(
    (set) => ({
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
      makeDebtPayment: async (debtId: string, amount: number, walletId?: string, notes?: string) => {
        const debt = useDebtStore.getState().debts.find(d => d.id === debtId)
        const targetWalletId = walletId || debt?.paymentWalletId
        const pmt = { 
          id: crypto.randomUUID(), 
          amount, 
          date: new Date().toISOString(), 
          method: 'cash' as const,
          walletId: targetWalletId,
          notes,
        }

        set((s: DebtState) => ({
          debts: s.debts.map((d: Debt) => {
            if (d.id !== debtId) return d
            return {
              ...d,
              currentBalance: Math.max(0, d.currentBalance - amount),
              payments: [pmt, ...d.payments],
              updatedAt: new Date().toISOString(),
            }
          }),
        }))

        // Auto deduct from target wallet if specified
        if (targetWalletId) {
          const { useWalletStore } = await import('./walletStore')
          const { useTransactionStore } = await import('./transactionStore')
          await useWalletStore.getState().adjustWalletBalance(targetWalletId, -amount)
          
          const wallet = useWalletStore.getState().wallets.find(w => w.id === targetWalletId)
          await useTransactionStore.getState().addTransaction({
            id: `txn_debt_${Date.now()}`,
            userId: debt?.userId || 'anon',
            type: 'expense',
            amount,
            currency: 'PHP',
            categoryId: 'debts',
            merchant: `Debt Payment: ${debt?.lender || 'Loan'}`,
            paymentMethod: 'cash',
            walletId: targetWalletId,
            date: new Date().toISOString().split('T')[0],
            notes: notes || `Payment for ${debt?.lender || 'debt'} (${wallet?.name || 'Wallet'})`,
            isFavorite: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          })
        }

        try {
          await atomicDebtPayment(debtId, amount, pmt)
          useToastStore.getState().success(`Payment of ₱${amount.toLocaleString()} deducted & recorded!`, 'Success')
        } catch (err: any) {
          useToastStore.getState().success(`Payment of ₱${amount.toLocaleString()} recorded locally!`, 'Saved')
        }
      },
    }),
    {
      name: 'mochi-debts-storage',
    }
  )
)
