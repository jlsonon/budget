import { create } from 'zustand'
import {
  Transaction,
  Budget,
  SavingsGoal,
  Debt,
  Subscription,
  DailyMission,
  Achievement,
  Streak,
  MochiCircle,
  TravelStamp,
  Wallet,
} from '../types'
import { saveDocToCloud, deleteDocFromCloud } from '../services/cloudSync'
import { FIRESTORE_COLLECTIONS } from '../services/firestoreCollections'
import { useAuthStore } from './authStore'

const getUid = (): string => useAuthStore.getState().user?.id || 'anon'

interface AppState {
  // Transactions
  transactions: Transaction[]
  isLoadingTransactions: boolean
  setTransactions: (txns: Transaction[]) => void
  addTransaction: (txn: Transaction) => void
  updateTransaction: (id: string, updates: Partial<Transaction>) => void
  deleteTransaction: (id: string) => void

  // Budgets
  budgets: Budget[]
  setBudgets: (budgets: Budget[]) => void
  addBudget: (budget: Budget) => void
  updateBudget: (id: string, updates: Partial<Budget>) => void

  // Savings
  savingsGoals: SavingsGoal[]
  setSavingsGoals: (goals: SavingsGoal[]) => void
  addSavingsGoal: (goal: SavingsGoal) => void
  contributeToGoal: (goalId: string, amount: number) => void

  // Debts
  debts: Debt[]
  setDebts: (debts: Debt[]) => void
  addDebt: (debt: Debt) => void
  makeDebtPayment: (debtId: string, amount: number) => void

  // Subscriptions
  subscriptions: Subscription[]
  setSubscriptions: (subs: Subscription[]) => void
  addSubscription: (sub: Subscription) => void
  updateSubscription: (id: string, updates: Partial<Subscription>) => void
  deleteSubscription: (id: string) => void
  processDueRecurring: () => void

  // Missions
  missions: DailyMission[]
  setMissions: (missions: DailyMission[]) => void
  completeMission: (id: string) => void

  // Achievements
  achievements: Achievement[]
  setAchievements: (achievements: Achievement[]) => void

  // Streaks
  streaks: Streak[]
  setStreaks: (streaks: Streak[]) => void
  incrementStreak: (type: Streak['type']) => void

  // Mochi Circles
  circles: MochiCircle[]
  passportStamps: TravelStamp[]
  addCircle: (circle: MochiCircle) => void
  contributeToCircle: (circleId: string, amount: number, note?: string) => void
  toggleCircleWishlist: (circleId: string, itemId: string) => void
  voteCirclePoll: (circleId: string, pollId: string, optionId: string) => void
  addCircleWishlistItem: (circleId: string, title: string, cost?: number) => void
  addCirclePoll: (circleId: string, question: string, options: string[]) => void

  // Wallets
  wallets: Wallet[]
  setWallets: (wallets: Wallet[]) => void
  addWallet: (wallet: Wallet) => void
  updateWallet: (id: string, updates: Partial<Wallet>) => void
  deleteWallet: (id: string) => void
  adjustWalletBalance: (id: string, amount: number) => void

  // UI
  isAddModalOpen: boolean
  defaultModalType: 'expense' | 'income'
  setAddModalOpen: (open: boolean, type?: 'expense' | 'income') => void
}

const initialCircles: MochiCircle[] = []
const initialPassportStamps: TravelStamp[] = []

export const useAppStore = create<AppState>()((set, get) => ({
  transactions: [],
  isLoadingTransactions: false,
  setTransactions: (txns) => set({ transactions: txns }),
  addTransaction: (txn) => {
    set((s) => {
      const nextTxns = [txn, ...s.transactions]
      let nextWallets = s.wallets
      if (txn.walletId) {
        const delta = txn.type === 'expense' ? -txn.amount : txn.amount
        nextWallets = s.wallets.map((w) =>
          w.id === txn.walletId ? { ...w, balance: Math.max(0, w.balance + delta), updatedAt: new Date().toISOString() } : w
        )
        // Persist updated wallet balance to Firestore
        const updatedWallet = nextWallets.find((w) => w.id === txn.walletId)
        if (updatedWallet) saveDocToCloud(FIRESTORE_COLLECTIONS.WALLETS, updatedWallet)
      }
      return { transactions: nextTxns, wallets: nextWallets }
    })
    // Persist transaction to Firestore
    saveDocToCloud(FIRESTORE_COLLECTIONS.TRANSACTIONS, txn)
  },
  updateTransaction: (id, updates) => {
    set((s) => ({
      transactions: s.transactions.map((t) => (t.id === id ? { ...t, ...updates, updatedAt: new Date().toISOString() } : t)),
    }))
    const updated = get().transactions.find((t) => t.id === id)
    if (updated) saveDocToCloud(FIRESTORE_COLLECTIONS.TRANSACTIONS, { ...updated, ...updates, updatedAt: new Date().toISOString() })
  },
  deleteTransaction: (id) => {
    set((s) => {
      const target = s.transactions.find((t) => t.id === id)
      let nextWallets = s.wallets
      if (target && target.walletId) {
        const delta = target.type === 'expense' ? target.amount : -target.amount
        nextWallets = s.wallets.map((w) =>
          w.id === target.walletId ? { ...w, balance: Math.max(0, w.balance + delta), updatedAt: new Date().toISOString() } : w
        )
        const updatedWallet = nextWallets.find((w) => w.id === target.walletId)
        if (updatedWallet) saveDocToCloud(FIRESTORE_COLLECTIONS.WALLETS, updatedWallet)
      }
      return {
        transactions: s.transactions.filter((t) => t.id !== id),
        wallets: nextWallets,
      }
    })
    deleteDocFromCloud(FIRESTORE_COLLECTIONS.TRANSACTIONS, id)
  },

  budgets: [],
  setBudgets: (budgets) => set({ budgets }),
  addBudget: (budget) => {
    set((s) => ({ budgets: [...s.budgets, budget] }))
    saveDocToCloud(FIRESTORE_COLLECTIONS.BUDGETS, budget)
  },
  updateBudget: (id, updates) => {
    set((s) => ({
      budgets: s.budgets.map((b) => (b.id === id ? { ...b, ...updates, updatedAt: new Date().toISOString() } : b)),
    }))
    const updated = get().budgets.find((b) => b.id === id)
    if (updated) saveDocToCloud(FIRESTORE_COLLECTIONS.BUDGETS, { ...updated, ...updates })
  },

  savingsGoals: [],
  setSavingsGoals: (goals) => set({ savingsGoals: goals }),
  addSavingsGoal: (goal) => {
    set((s) => ({ savingsGoals: [...s.savingsGoals, goal] }))
    saveDocToCloud(FIRESTORE_COLLECTIONS.SAVINGS, goal)
  },
  contributeToGoal: (goalId, amount) => {
    set((s) => ({
      savingsGoals: s.savingsGoals.map((g) => {
        if (g.id !== goalId) return g
        const newAmount = g.currentAmount + amount
        return {
          ...g,
          currentAmount: newAmount,
          contributions: [...g.contributions, { id: crypto.randomUUID(), amount, date: new Date().toISOString() }],
          updatedAt: new Date().toISOString(),
        }
      }),
    }))
    const updated = get().savingsGoals.find((g) => g.id === goalId)
    if (updated) saveDocToCloud(FIRESTORE_COLLECTIONS.SAVINGS, { ...updated, currentAmount: updated.currentAmount + amount })
  },

  debts: [],
  setDebts: (debts) => set({ debts }),
  addDebt: (debt) => {
    set((s) => ({ debts: [...s.debts, debt] }))
    saveDocToCloud(FIRESTORE_COLLECTIONS.DEBTS, debt)
  },
  makeDebtPayment: (debtId, amount) => {
    set((s) => ({
      debts: s.debts.map((d) => {
        if (d.id !== debtId) return d
        const newBalance = Math.max(0, d.currentBalance - amount)
        return {
          ...d,
          currentBalance: newBalance,
          payments: [...d.payments, { id: crypto.randomUUID(), amount, date: new Date().toISOString(), method: 'cash' }],
          updatedAt: new Date().toISOString(),
        }
      }),
    }))
    const updated = get().debts.find((d) => d.id === debtId)
    if (updated) saveDocToCloud(FIRESTORE_COLLECTIONS.DEBTS, { ...updated, currentBalance: Math.max(0, updated.currentBalance - amount) })
  },

  subscriptions: [],
  setSubscriptions: (subs) => set({ subscriptions: subs }),
  addSubscription: (sub) => {
    set((s) => ({ subscriptions: [...s.subscriptions, sub] }))
    saveDocToCloud(FIRESTORE_COLLECTIONS.SUBSCRIPTIONS, sub)
  },
  updateSubscription: (id, updates) => {
    set((s) => ({
      subscriptions: s.subscriptions.map((sub) =>
        sub.id === id ? { ...sub, ...updates, updatedAt: new Date().toISOString() } : sub
      ),
    }))
    const updated = get().subscriptions.find((s) => s.id === id)
    if (updated) saveDocToCloud(FIRESTORE_COLLECTIONS.SUBSCRIPTIONS, { ...updated, ...updates })
  },
  deleteSubscription: (id) => {
    set((s) => ({ subscriptions: s.subscriptions.filter((sub) => sub.id !== id) }))
    deleteDocFromCloud(FIRESTORE_COLLECTIONS.SUBSCRIPTIONS, id)
  },

  processDueRecurring: () =>
    set((s) => {
      const today = new Date().toISOString().split('T')[0]
      const newTxns = [...s.transactions]
      let updatedWallets = [...s.wallets]

      // Process due subscriptions
      const nextSubs = s.subscriptions.map((sub) => {
        if (sub.status === 'active' && sub.nextBilling && sub.nextBilling <= today) {
          const targetWalletId = sub.walletId || s.wallets.find((w) => w.isDefault)?.id || s.wallets[0]?.id
          
          // Create auto-logged transaction
          newTxns.unshift({
            id: `auto_sub_${Date.now()}_${sub.id}`,
            userId: sub.userId || '1',
            type: 'expense',
            amount: sub.amount,
            currency: 'PHP',
            categoryId: sub.category || 'utilities',
            merchant: sub.name,
            paymentMethod: 'other',
            walletId: targetWalletId,
            date: today,
            isFavorite: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          })

          // Deduct from wallet balance
          if (targetWalletId) {
            updatedWallets = updatedWallets.map((w) =>
              w.id === targetWalletId ? { ...w, balance: Math.max(0, w.balance - sub.amount), updatedAt: new Date().toISOString() } : w
            )
          }

          // Advance next billing by frequency
          const d = new Date(sub.nextBilling)
          if (sub.frequency === 'weekly') d.setDate(d.getDate() + 7)
          else if (sub.frequency === 'monthly') d.setMonth(d.getMonth() + 1)
          else if (sub.frequency === 'annual') d.setFullYear(d.getFullYear() + 1)
          else d.setMonth(d.getMonth() + 1)

          return { ...sub, nextBilling: d.toISOString().split('T')[0], updatedAt: new Date().toISOString() }
        }
        return sub
      })

      return {
        transactions: newTxns,
        wallets: updatedWallets,
        subscriptions: nextSubs,
      }
    }),

  missions: [],
  setMissions: (missions) => set({ missions }),
  completeMission: (id) =>
    set((s) => ({
      missions: s.missions.map((m) => (m.id === id ? { ...m, status: 'completed' as const, completedAt: new Date().toISOString() } : m)),
    })),

  achievements: [],
  setAchievements: (achievements) => set({ achievements }),

  streaks: [],
  setStreaks: (streaks) => set({ streaks }),
  incrementStreak: (type) =>
    set((s) => ({
      streaks: s.streaks.map((st) =>
        st.type === type
          ? { ...st, current: st.current + 1, longest: Math.max(st.longest, st.current + 1), lastActiveDate: new Date().toISOString().split('T')[0] }
          : st
      ),
    })),

  // Mochi Circles State & Actions
  circles: initialCircles,
  passportStamps: initialPassportStamps,
  addCircle: (circle) => set((s) => ({ circles: [circle, ...s.circles] })),
  contributeToCircle: (circleId, amount, note) =>
    set((s) => ({
      circles: s.circles.map((c) => {
        if (c.id !== circleId) return c
        const newCurrent = c.currentAmount + amount
        const newStatus = newCurrent >= c.targetAmount ? ('completed' as const) : c.status
        const updatedMembers = c.members.map((m) =>
          m.id === 'm1' ? { ...m, totalContributed: m.totalContributed + amount } : m
        )
        const newContrib = {
          id: crypto.randomUUID(),
          memberId: 'm1',
          memberName: 'Jericho (You)',
          mascot: 'cat' as const,
          amount,
          date: new Date().toISOString().split('T')[0],
          note,
        }

        // Check if completing circle and generate stamp
        let stamps = s.passportStamps
        if (newCurrent >= c.targetAmount && c.status !== 'completed') {
          stamps = [
            ...stamps,
            {
              id: crypto.randomUUID(),
              circleId: c.id,
              circleName: c.name,
              theme: c.theme,
              completedDate: new Date().toISOString().split('T')[0],
              totalSaved: newCurrent,
              memberCount: c.members.length,
              stampIcon: '✈️',
            },
          ]
        }

        return {
          ...c,
          currentAmount: newCurrent,
          status: newStatus,
          completedAt: newCurrent >= c.targetAmount ? new Date().toISOString().split('T')[0] : c.completedAt,
          members: updatedMembers,
          contributions: [newContrib, ...c.contributions],
          updatedAt: new Date().toISOString(),
        }
      }),
      passportStamps: s.passportStamps,
    })),

  toggleCircleWishlist: (circleId, itemId) =>
    set((s) => ({
      circles: s.circles.map((c) => {
        if (c.id !== circleId) return c
        return {
          ...c,
          wishlist: c.wishlist.map((item) => (item.id === itemId ? { ...item, completed: !item.completed } : item)),
        }
      }),
    })),

  voteCirclePoll: (circleId, pollId, optionId) =>
    set((s) => ({
      circles: s.circles.map((c) => {
        if (c.id !== circleId) return c
        return {
          ...c,
          polls: c.polls.map((poll) => {
            if (poll.id !== pollId) return poll
            return {
              ...poll,
              options: poll.options.map((opt) => {
                const hasVoted = opt.votes.includes('m1')
                if (opt.id === optionId) {
                  return { ...opt, votes: hasVoted ? opt.votes : [...opt.votes, 'm1'] }
                } else {
                  return { ...opt, votes: opt.votes.filter((v) => v !== 'm1') }
                }
              }),
            }
          }),
        }
      }),
    })),

  addCircleWishlistItem: (circleId, title, cost) =>
    set((s) => ({
      circles: s.circles.map((c) => {
        if (c.id !== circleId) return c
        return {
          ...c,
          wishlist: [...c.wishlist, { id: crypto.randomUUID(), title, estimatedCost: cost, completed: false }],
        }
      }),
    })),

  addCirclePoll: (circleId, question, options) =>
    set((s) => ({
      circles: s.circles.map((c) => {
        if (c.id !== circleId) return c
        return {
          ...c,
          polls: [
            ...c.polls,
            {
              id: crypto.randomUUID(),
              question,
              active: true,
              options: options.map((opt, i) => ({ id: `opt_${i}`, text: opt, votes: [] })),
            },
          ],
        }
      }),
    })),

  // Wallet actions
  wallets: [],
  setWallets: (wallets) => set({ wallets }),
  addWallet: (wallet) => {
    set((s) => ({ wallets: [...s.wallets, wallet] }))
    saveDocToCloud(FIRESTORE_COLLECTIONS.WALLETS, wallet)
  },
  updateWallet: (id, updates) => {
    set((s) => ({
      wallets: s.wallets.map((w) => (w.id === id ? { ...w, ...updates, updatedAt: new Date().toISOString() } : w)),
    }))
    const updated = get().wallets.find((w) => w.id === id)
    if (updated) saveDocToCloud(FIRESTORE_COLLECTIONS.WALLETS, { ...updated, ...updates })
  },
  deleteWallet: (id) => {
    set((s) => ({ wallets: s.wallets.filter((w) => w.id !== id) }))
    deleteDocFromCloud(FIRESTORE_COLLECTIONS.WALLETS, id)
  },
  adjustWalletBalance: (id, amount) => {
    set((s) => ({
      wallets: s.wallets.map((w) =>
        w.id === id ? { ...w, balance: w.balance + amount, updatedAt: new Date().toISOString() } : w
      ),
    }))
    const updated = get().wallets.find((w) => w.id === id)
    if (updated) saveDocToCloud(FIRESTORE_COLLECTIONS.WALLETS, { ...updated, balance: updated.balance + amount })
  },

  isAddModalOpen: false,
  defaultModalType: 'expense',
  setAddModalOpen: (open, type) => set({ isAddModalOpen: open, defaultModalType: type ?? 'expense' }),
}))

export { getUid }
