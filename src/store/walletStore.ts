import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Wallet } from '../types'
import { saveDocToCloud, deleteDocFromCloud } from '../services/cloudSync'
import { FIRESTORE_COLLECTIONS } from '../services/firestoreCollections'
import { useToastStore } from './toastStore'

export interface WalletState {
  wallets: Wallet[]
  setWallets: (wallets: Wallet[]) => void
  addWallet: (wallet: Wallet) => Promise<void>
  updateWallet: (id: string, updates: Partial<Wallet>) => Promise<void>
  deleteWallet: (id: string) => Promise<void>
  adjustWalletBalance: (id: string, amount: number) => Promise<void>
}

export const useWalletStore = create<WalletState>()(
  persist(
    (set, get) => ({
      wallets: [],
      setWallets: (wallets: Wallet[]) => set({ wallets }),
      addWallet: async (wallet: Wallet) => {
        set((s: WalletState) => ({ wallets: [...s.wallets, wallet] }))
        try {
          await saveDocToCloud(FIRESTORE_COLLECTIONS.WALLETS, wallet)
          useToastStore.getState().success(`Wallet "${wallet.name}" added!`, 'Success')
        } catch (err: any) {
          useToastStore.getState().error('Failed to add wallet', 'Error')
        }
      },
      updateWallet: async (id: string, updates: Partial<Wallet>) => {
        set((s: WalletState) => ({
          wallets: s.wallets.map((w: Wallet) => (w.id === id ? { ...w, ...updates, updatedAt: new Date().toISOString() } : w)),
        }))
        const updated = get().wallets.find((w: Wallet) => w.id === id)
        if (updated) {
          try {
            await saveDocToCloud(FIRESTORE_COLLECTIONS.WALLETS, updated)
          } catch (err: any) {
            useToastStore.getState().error('Failed to update wallet', 'Error')
          }
        }
      },
      deleteWallet: async (id: string) => {
        set((s: WalletState) => ({ wallets: s.wallets.filter((w: Wallet) => w.id !== id) }))
        try {
          await deleteDocFromCloud(FIRESTORE_COLLECTIONS.WALLETS, id)
          useToastStore.getState().info('Wallet removed', 'Deleted')
        } catch (err: any) {
          useToastStore.getState().error('Failed to delete wallet', 'Error')
        }
      },
      adjustWalletBalance: async (id: string, amount: number) => {
        set((s: WalletState) => ({
          wallets: s.wallets.map((w: Wallet) =>
            w.id === id ? { ...w, balance: Math.max(0, w.balance + amount), updatedAt: new Date().toISOString() } : w
          ),
        }))
        const updated = get().wallets.find((w: Wallet) => w.id === id)
        if (updated) {
          await saveDocToCloud(FIRESTORE_COLLECTIONS.WALLETS, updated)
        }
      },
    }),
    {
      name: 'mochi-wallets-storage',
    }
  )
)
