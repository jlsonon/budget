import { collection, doc } from 'firebase/firestore'
import { db } from '../lib/firebase'

/**
 * Mochi Money Official Firestore Collection Registry
 * Centralized references for all Firestore collections used in the application.
 */
export const FIRESTORE_COLLECTIONS = {
  USERS: 'users',
  TRANSACTIONS: 'transactions',
  WALLETS: 'wallets',
  BUDGETS: 'budgets',
  SAVINGS: 'savings',
  DEBTS: 'debts',
  SUBSCRIPTIONS: 'subscriptions',
  CIRCLES: 'circles',
  MISSIONS: 'missions',
  ACHIEVEMENTS: 'achievements',
  STREAKS: 'streaks',
  NOTIFICATIONS: 'notifications',
  PEOPLE_DEBTS: 'people_debts',
} as const

// Helper getters for typed Firestore Collection References
export const getUsersCollection = () => collection(db, FIRESTORE_COLLECTIONS.USERS)
export const getTransactionsCollection = () => collection(db, FIRESTORE_COLLECTIONS.TRANSACTIONS)
export const getWalletsCollection = () => collection(db, FIRESTORE_COLLECTIONS.WALLETS)
export const getBudgetsCollection = () => collection(db, FIRESTORE_COLLECTIONS.BUDGETS)
export const getSavingsCollection = () => collection(db, FIRESTORE_COLLECTIONS.SAVINGS)
export const getDebtsCollection = () => collection(db, FIRESTORE_COLLECTIONS.DEBTS)
export const getSubscriptionsCollection = () => collection(db, FIRESTORE_COLLECTIONS.SUBSCRIPTIONS)
export const getCirclesCollection = () => collection(db, FIRESTORE_COLLECTIONS.CIRCLES)
export const getMissionsCollection = () => collection(db, FIRESTORE_COLLECTIONS.MISSIONS)
export const getAchievementsCollection = () => collection(db, FIRESTORE_COLLECTIONS.ACHIEVEMENTS)
export const getStreaksCollection = () => collection(db, FIRESTORE_COLLECTIONS.STREAKS)
export const getNotificationsCollection = () => collection(db, FIRESTORE_COLLECTIONS.NOTIFICATIONS)

// User-scoped document helper
export const getUserDoc = (userId: string) => doc(db, FIRESTORE_COLLECTIONS.USERS, userId)
