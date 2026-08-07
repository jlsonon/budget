import { collection, query, where, onSnapshot, doc, setDoc, deleteDoc } from 'firebase/firestore'
import { db } from '../lib/firebase'
import { useAppStore } from '../store/appStore'
import { FIRESTORE_COLLECTIONS } from './firestoreCollections'
import type { Transaction, Wallet, Budget, SavingsGoal, Debt, Subscription, MochiCircle } from '../types'

/**
 * Multi-device Real-time Snapshot Listener Manager
 * Binds Firestore collection streams directly to Zustand useAppStore state.
 */
export function startRealtimeSync(userId: string): () => void {
  if (!userId) return () => {}

  // 1. Transactions Listener
  const qTxns = query(collection(db, FIRESTORE_COLLECTIONS.TRANSACTIONS), where('userId', '==', userId))
  const unsubTxns = onSnapshot(qTxns, (snapshot) => {
    if (!snapshot.empty) {
      const items = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Transaction))
      items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      useAppStore.getState().setTransactions(items)
    }
  }, (err) => console.warn('Realtime txns sync notice:', err.message))

  // 2. Wallets Listener
  const qWallets = query(collection(db, FIRESTORE_COLLECTIONS.WALLETS), where('userId', '==', userId))
  const unsubWallets = onSnapshot(qWallets, (snapshot) => {
    if (!snapshot.empty) {
      const items = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Wallet))
      useAppStore.getState().setWallets(items)
    } else {
      // Auto-provision default cash wallet for user
      const defaultWallet: Wallet = {
        id: `w_cash_${userId}`,
        userId,
        name: 'Cash Wallet',
        type: 'cash',
        balance: 0,
        currency: 'PHP',
        color: '#F59E0B',
        isDefault: true,
        includeInTotal: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      saveDocToCloud(FIRESTORE_COLLECTIONS.WALLETS, defaultWallet)
      useAppStore.getState().setWallets([defaultWallet])
    }
  }, (err) => console.warn('Realtime wallets sync notice:', err.message))

  // 3. Budgets Listener
  const qBudgets = query(collection(db, FIRESTORE_COLLECTIONS.BUDGETS), where('userId', '==', userId))
  const unsubBudgets = onSnapshot(qBudgets, (snapshot) => {
    if (!snapshot.empty) {
      const items = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Budget))
      useAppStore.getState().setBudgets(items)
    }
  }, (err) => console.warn('Realtime budgets sync notice:', err.message))

  // 4. Savings Goals Listener
  const qSavings = query(collection(db, FIRESTORE_COLLECTIONS.SAVINGS), where('userId', '==', userId))
  const unsubSavings = onSnapshot(qSavings, (snapshot) => {
    if (!snapshot.empty) {
      const items = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as SavingsGoal))
      useAppStore.getState().setSavingsGoals(items)
    }
  }, (err) => console.warn('Realtime savings sync notice:', err.message))

  // 5. Debts Listener
  const qDebts = query(collection(db, FIRESTORE_COLLECTIONS.DEBTS), where('userId', '==', userId))
  const unsubDebts = onSnapshot(qDebts, (snapshot) => {
    if (!snapshot.empty) {
      const items = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Debt))
      useAppStore.getState().setDebts(items)
    }
  }, (err) => console.warn('Realtime debts sync notice:', err.message))

  // 6. Subscriptions Listener
  const qSubs = query(collection(db, FIRESTORE_COLLECTIONS.SUBSCRIPTIONS), where('userId', '==', userId))
  const unsubSubs = onSnapshot(qSubs, (snapshot) => {
    if (!snapshot.empty) {
      const items = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Subscription))
      useAppStore.getState().setSubscriptions(items)
    }
  }, (err) => console.warn('Realtime subs sync notice:', err.message))

  // 7. Mochi Circles Listener
  const qCircles = query(collection(db, FIRESTORE_COLLECTIONS.CIRCLES), where('userId', '==', userId))
  const unsubCircles = onSnapshot(qCircles, (snapshot) => {
    const items = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as MochiCircle))
    if (items.length > 0) {
      useAppStore.setState({ circles: items })
    }
  }, (err) => console.warn('Realtime circles sync notice:', err.message))

  // 8. Notifications Listener
  const qNotifs = query(collection(db, FIRESTORE_COLLECTIONS.NOTIFICATIONS), where('userId', '==', userId))
  const unsubNotifs = onSnapshot(qNotifs, () => {
    // Handled in store or component
  }, (err) => console.warn('Realtime notifications sync notice:', err.message))

  // Master Unsubscribe Function
  return () => {
    unsubTxns()
    unsubWallets()
    unsubBudgets()
    unsubSavings()
    unsubDebts()
    unsubSubs()
    unsubCircles()
    unsubNotifs()
  }
}

/**
 * Cloud Sync Helpers for CRUD operations
 */
export async function saveDocToCloud<T extends { id: string; userId: string }>(collectionName: string, item: T): Promise<void> {
  try {
    const ref = doc(db, collectionName, item.id)
    await setDoc(ref, item, { merge: true })
  } catch (err) {
    console.warn(`[CloudSync] Offline queue active for ${collectionName}/${item.id}:`, err)
  }
}

export async function deleteDocFromCloud(collectionName: string, id: string): Promise<void> {
  try {
    const ref = doc(db, collectionName, id)
    await deleteDoc(ref)
  } catch (err) {
    console.warn(`[CloudSync] Offline delete queue active for ${collectionName}/${id}:`, err)
  }
}
