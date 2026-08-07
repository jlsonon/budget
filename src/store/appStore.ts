import { create } from 'zustand'
import { useTransactionStore, TransactionState } from './transactionStore'
import { useWalletStore, WalletState } from './walletStore'
import { useBudgetStore, BudgetState } from './budgetStore'
import { useSavingsStore, SavingsState } from './savingsStore'
import { useDebtStore, DebtState } from './debtStore'
import { useSubscriptionStore, SubscriptionState } from './subscriptionStore'
import { useCircleStore, CircleState } from './circleStore'
import { useUIStore, UISlice } from './uiStore'
import { useSyncStore, SyncState } from './syncStore'
import { useAuthStore } from './authStore'
import { Transaction, Wallet, Budget, SavingsGoal, Debt, Subscription, MochiCircle } from '../types'

export type AppState = TransactionState &
  WalletState &
  BudgetState &
  SavingsState &
  DebtState &
  SubscriptionState &
  CircleState &
  UISlice &
  SyncState

const getUid = (): string => useAuthStore.getState()?.user?.id || 'anon'

export const useAppStore = create<AppState>()((set) => ({
  transactions: [],
  isLoadingTransactions: false,
  wallets: [],
  isLoadingWallets: false,
  budgets: [],
  isLoadingBudgets: false,
  savingsGoals: [],
  isLoadingSavings: false,
  debts: [],
  isLoadingDebts: false,
  subscriptions: [],
  isLoadingSubscriptions: false,
  circles: [],
  passportStamps: [],
  isLoadingCircles: false,
  isAddModalOpen: false,
  defaultModalType: 'expense',
  isReceiptModalOpen: false,
  isAIChatModalOpen: false,
  status: 'idle',
  isOnline: true,
  lastSyncedAt: null,
  pendingWritesCount: 0,
  error: null,
  missions: [],
  achievements: [],
  streaks: [],

  setStatus: (status) => { useSyncStore.getState().setStatus(status); set({ status }) },
  setIsOnline: (online) => { useSyncStore.getState().setIsOnline(online); set({ isOnline: online }) },
  setLastSyncedAt: (date) => { useSyncStore.getState().setLastSyncedAt(date); set({ lastSyncedAt: date }) },
  incrementPending: () => { useSyncStore.getState().incrementPending(); set({ pendingWritesCount: useSyncStore.getState().pendingWritesCount }) },
  decrementPending: () => { useSyncStore.getState().decrementPending(); set({ pendingWritesCount: useSyncStore.getState().pendingWritesCount }) },
  setError: (err) => { useSyncStore.getState().setError(err); set({ error: err }) },
  setMissions: (m) => { useSyncStore.getState().setMissions(m); set({ missions: m }) },
  completeMission: (id) => { useSyncStore.getState().completeMission(id); set({ missions: useSyncStore.getState().missions }) },
  setAchievements: (a) => { useSyncStore.getState().setAchievements(a); set({ achievements: a }) },
  setStreaks: (st) => { useSyncStore.getState().setStreaks(st); set({ streaks: st }) },
  incrementStreak: (type) => { useSyncStore.getState().incrementStreak(type); set({ streaks: useSyncStore.getState().streaks }) },

  setTransactions: (txns: Transaction[]) => { useTransactionStore.getState().setTransactions(txns); set({ transactions: txns }) },
  addTransaction: async (txn: Transaction) => { await useTransactionStore.getState().addTransaction(txn); set({ transactions: useTransactionStore.getState().transactions }) },
  updateTransaction: async (id: string, updates: Partial<Transaction>) => { await useTransactionStore.getState().updateTransaction(id, updates); set({ transactions: useTransactionStore.getState().transactions }) },
  deleteTransaction: async (id: string) => { await useTransactionStore.getState().deleteTransaction(id); set({ transactions: useTransactionStore.getState().transactions }) },

  setWallets: (wallets: Wallet[]) => { useWalletStore.getState().setWallets(wallets); set({ wallets }) },
  addWallet: async (wallet: Wallet) => { await useWalletStore.getState().addWallet(wallet); set({ wallets: useWalletStore.getState().wallets }) },
  updateWallet: async (id: string, updates: Partial<Wallet>) => { await useWalletStore.getState().updateWallet(id, updates); set({ wallets: useWalletStore.getState().wallets }) },
  deleteWallet: async (id: string) => { await useWalletStore.getState().deleteWallet(id); set({ wallets: useWalletStore.getState().wallets }) },
  adjustWalletBalance: async (id: string, amount: number) => { await useWalletStore.getState().adjustWalletBalance(id, amount); set({ wallets: useWalletStore.getState().wallets }) },

  setBudgets: (budgets: Budget[]) => { useBudgetStore.getState().setBudgets(budgets); set({ budgets }) },
  addBudget: async (b: Budget) => { await useBudgetStore.getState().addBudget(b); set({ budgets: useBudgetStore.getState().budgets }) },
  updateBudget: async (id: string, u: Partial<Budget>) => { await useBudgetStore.getState().updateBudget(id, u); set({ budgets: useBudgetStore.getState().budgets }) },

  setSavingsGoals: (g: SavingsGoal[]) => { useSavingsStore.getState().setSavingsGoals(g); set({ savingsGoals: g }) },
  addSavingsGoal: async (g: SavingsGoal) => { await useSavingsStore.getState().addSavingsGoal(g); set({ savingsGoals: useSavingsStore.getState().savingsGoals }) },
  contributeToGoal: async (id: string, amt: number) => { await useSavingsStore.getState().contributeToGoal(id, amt); set({ savingsGoals: useSavingsStore.getState().savingsGoals }) },

  setDebts: (d: Debt[]) => { useDebtStore.getState().setDebts(d); set({ debts: d }) },
  addDebt: async (d: Debt) => { await useDebtStore.getState().addDebt(d); set({ debts: useDebtStore.getState().debts }) },
  makeDebtPayment: async (id: string, amt: number, walletId?: string, notes?: string) => { await useDebtStore.getState().makeDebtPayment(id, amt, walletId, notes); set({ debts: useDebtStore.getState().debts, wallets: useWalletStore.getState().wallets }) },

  setSubscriptions: (s: Subscription[]) => { useSubscriptionStore.getState().setSubscriptions(s); set({ subscriptions: s }) },
  addSubscription: async (sub: Subscription) => { await useSubscriptionStore.getState().addSubscription(sub); set({ subscriptions: useSubscriptionStore.getState().subscriptions }) },
  updateSubscription: async (id: string, u: Partial<Subscription>) => { await useSubscriptionStore.getState().updateSubscription(id, u); set({ subscriptions: useSubscriptionStore.getState().subscriptions }) },
  deleteSubscription: async (id: string) => { await useSubscriptionStore.getState().deleteSubscription(id); set({ subscriptions: useSubscriptionStore.getState().subscriptions }) },
  processDueRecurring: async () => { await useSubscriptionStore.getState().processDueRecurring(); set({ subscriptions: useSubscriptionStore.getState().subscriptions }) },

  setCircles: (c: MochiCircle[]) => { useCircleStore.getState().setCircles(c); set({ circles: c }) },
  addCircle: async (c: MochiCircle) => { await useCircleStore.getState().addCircle(c); set({ circles: useCircleStore.getState().circles }) },
  contributeToCircle: async (id: string, amt: number, note?: string) => { await useCircleStore.getState().contributeToCircle(id, amt, note); set({ circles: useCircleStore.getState().circles }) },
  toggleCircleWishlist: async (id: string, item: string) => { await useCircleStore.getState().toggleCircleWishlist(id, item); set({ circles: useCircleStore.getState().circles }) },
  voteCirclePoll: async (cid: string, pid: string, opt: string) => { await useCircleStore.getState().voteCirclePoll(cid, pid, opt); set({ circles: useCircleStore.getState().circles }) },
  addCircleWishlistItem: async (id: string, t: string, c?: number) => { await useCircleStore.getState().addCircleWishlistItem(id, t, c); set({ circles: useCircleStore.getState().circles }) },
  addCirclePoll: async (id: string, q: string, o: string[]) => { await useCircleStore.getState().addCirclePoll(id, q, o); set({ circles: useCircleStore.getState().circles }) },
  addCircleBillSplit: async (id: string, split: any) => { await useCircleStore.getState().addCircleBillSplit(id, split); set({ circles: useCircleStore.getState().circles }) },
  settleCircleBillSplit: async (id: string, sid: string, mid: string) => { await useCircleStore.getState().settleCircleBillSplit(id, sid, mid); set({ circles: useCircleStore.getState().circles }) },

  setAddModalOpen: (open: boolean, type?: 'expense' | 'income') => { useUIStore.getState().setAddModalOpen(open, type); set({ isAddModalOpen: open, defaultModalType: type ?? 'expense' }) },
  setReceiptModalOpen: (open: boolean) => { useUIStore.getState().setReceiptModalOpen(open); set({ isReceiptModalOpen: open }) },
  setAIChatModalOpen: (open: boolean) => { useUIStore.getState().setAIChatModalOpen(open); set({ isAIChatModalOpen: open }) },
  theme: useUIStore.getState().theme,
  setTheme: (t) => { useUIStore.getState().setTheme(t); set({ theme: t }) },
}))

export { getUid }
