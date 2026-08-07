import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Subscription, Transaction, Wallet } from '../types'
import { saveDocToCloud, deleteDocFromCloud } from '../services/cloudSync'
import { FIRESTORE_COLLECTIONS } from '../services/firestoreCollections'
import { atomicAddTransaction } from '../services/atomicOps'
import { useWalletStore } from './walletStore'
import { useAuthStore } from './authStore'
import { useToastStore } from './toastStore'

export interface SubscriptionState {
  subscriptions: Subscription[]
  setSubscriptions: (subs: Subscription[]) => void
  addSubscription: (sub: Subscription) => Promise<void>
  updateSubscription: (id: string, updates: Partial<Subscription>) => Promise<void>
  deleteSubscription: (id: string) => Promise<void>
  processDueRecurring: () => Promise<void>
}

export const useSubscriptionStore = create<SubscriptionState>()(
  persist(
    (set, get) => ({
      subscriptions: [],
      setSubscriptions: (subs: Subscription[]) => set({ subscriptions: subs }),
      addSubscription: async (sub: Subscription) => {
        const currentUserId = useAuthStore.getState().user?.id || sub.userId || 'anon'
        const subWithUser = { ...sub, userId: currentUserId }
        
        set((s: SubscriptionState) => ({ subscriptions: [...s.subscriptions, subWithUser] }))
        try {
          await saveDocToCloud(FIRESTORE_COLLECTIONS.SUBSCRIPTIONS, subWithUser)
          useToastStore.getState().success(`Subscription "${subWithUser.name}" saved!`, 'Saved')
        } catch (err: any) {
          useToastStore.getState().error('Failed to add subscription', 'Error')
        }
      },
      updateSubscription: async (id: string, updates: Partial<Subscription>) => {
        const currentUserId = useAuthStore.getState().user?.id || 'anon'
        set((s: SubscriptionState) => ({
          subscriptions: s.subscriptions.map((sub: Subscription) =>
            sub.id === id ? { ...sub, ...updates, userId: currentUserId, updatedAt: new Date().toISOString() } : sub
          ),
        }))
        const updated = get().subscriptions.find((s: Subscription) => s.id === id)
        if (updated) {
          await saveDocToCloud(FIRESTORE_COLLECTIONS.SUBSCRIPTIONS, updated)
        }
      },
      deleteSubscription: async (id: string) => {
        set((s: SubscriptionState) => ({ subscriptions: s.subscriptions.filter((sub: Subscription) => sub.id !== id) }))
        try {
          await deleteDocFromCloud(FIRESTORE_COLLECTIONS.SUBSCRIPTIONS, id)
          useToastStore.getState().info('Subscription deleted', 'Removed')
        } catch (err: any) {
          useToastStore.getState().error('Failed to delete subscription', 'Error')
        }
      },
  processDueRecurring: async () => {
    const today = new Date().toISOString().split('T')[0]
    const state = get()
    const wallets = useWalletStore.getState().wallets
    const userId = useAuthStore.getState().user?.id || 'anon'

    for (const sub of state.subscriptions) {
      if (sub.status === 'active' && sub.nextBilling && sub.nextBilling <= today) {
        const targetWalletId = sub.walletId || wallets.find((w: Wallet) => w.isDefault)?.id || wallets[0]?.id

        const autoTxn: Transaction = {
          id: `auto_sub_${Date.now()}_${sub.id}`,
          userId: sub.userId || userId,
          type: 'expense',
          amount: sub.amount,
          currency: 'PHP',
          categoryId: sub.category || 'utilities',
          merchant: sub.name,
          paymentMethod: 'other',
          walletId: targetWalletId,
          date: today,
          isFavorite: false,
          isDeleted: false,
          schemaVersion: 1,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }

        try {
          await atomicAddTransaction(autoTxn)

          const d = new Date(sub.nextBilling)
          if (sub.frequency === 'weekly') d.setDate(d.getDate() + 7)
          else if (sub.frequency === 'monthly') d.setMonth(d.getMonth() + 1)
          else if (sub.frequency === 'quarterly') d.setMonth(d.getMonth() + 3)
          else if (sub.frequency === 'biannual') d.setMonth(d.getMonth() + 6)
          else if (sub.frequency === 'annual') d.setFullYear(d.getFullYear() + 1)
          else d.setMonth(d.getMonth() + 1)

          const updatedSub: Subscription = {
            ...sub,
            nextBilling: d.toISOString().split('T')[0],
            updatedAt: new Date().toISOString(),
          }

          await saveDocToCloud(FIRESTORE_COLLECTIONS.SUBSCRIPTIONS, updatedSub)

          set((s: SubscriptionState) => ({
            subscriptions: s.subscriptions.map((item: Subscription) => (item.id === sub.id ? updatedSub : item)),
          }))
        } catch (e) {
          console.warn('Subscription auto-process notice:', e)
        }
      }
    }
  },
    }),
    {
      name: 'mochi-subscriptions-storage',
    }
  )
)
