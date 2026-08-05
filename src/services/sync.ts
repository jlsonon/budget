import { db } from '../lib/firebase'
import {
  doc,
  getDoc,
  setDoc,
  writeBatch,
  serverTimestamp,
} from 'firebase/firestore'

export interface SyncStatus {
  lastSynced: string | null
  isSyncing: boolean
  error: string | null
}

/**
 * Sync local data to Firestore for a given user.
 * Uses batched writes for efficiency.
 */
export async function syncToCloud(
  userId: string,
  data: {
    transactions?: unknown[]
    budgets?: unknown[]
    savingsGoals?: unknown[]
    debts?: unknown[]
    subscriptions?: unknown[]
    settings?: Record<string, unknown>
  }
): Promise<void> {
  const batch = writeBatch(db)

  // Sync settings/preferences
  if (data.settings) {
    const settingsRef = doc(db, `users/${userId}/preferences/main`)
    batch.set(settingsRef, {
      ...data.settings,
      updatedAt: serverTimestamp(),
    }, { merge: true })
  }

  await batch.commit()
}

/**
 * Fetch last sync timestamp for a user.
 */
export async function getLastSyncTime(userId: string): Promise<string | null> {
  try {
    const docRef = doc(db, `users/${userId}/preferences/sync`)
    const snapshot = await getDoc(docRef)
    if (snapshot.exists()) {
      return snapshot.data().lastSynced || null
    }
    return null
  } catch {
    return null
  }
}

/**
 * Update the last sync timestamp.
 */
export async function updateSyncTimestamp(userId: string): Promise<void> {
  const docRef = doc(db, `users/${userId}/preferences/sync`)
  await setDoc(docRef, {
    lastSynced: new Date().toISOString(),
  }, { merge: true })
}
