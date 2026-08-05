import { doc, setDoc, deleteDoc } from 'firebase/firestore'
import { db } from '../lib/firebase'

export interface PendingMutation {
  id: string
  action: 'SET' | 'DELETE'
  collectionName: string
  data?: any
  timestamp: number
}

const QUEUE_STORAGE_KEY = 'mochi_offline_pending_queue_v1'

/**
 * Get all queued offline mutations from localStorage
 */
export function getOfflineQueue(): PendingMutation[] {
  try {
    const raw = localStorage.getItem(QUEUE_STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

/**
 * Save mutation queue to localStorage
 */
export function saveOfflineQueue(queue: PendingMutation[]): void {
  try {
    localStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(queue))
  } catch (err) {
    console.error('Failed to save offline queue:', err)
  }
}

/**
 * Queue a mutation to be synchronized when back online
 */
export function enqueueOfflineMutation(mutation: Omit<PendingMutation, 'timestamp'>): void {
  const queue = getOfflineQueue()
  queue.push({ ...mutation, timestamp: Date.now() })
  saveOfflineQueue(queue)
  console.log(`[OfflineQueue] Enqueued ${mutation.action} for ${mutation.collectionName}/${mutation.id}`)
}

/**
 * Flush pending offline mutations to Firestore when internet connection returns
 */
export async function flushOfflineQueue(): Promise<number> {
  const queue = getOfflineQueue()
  if (queue.length === 0) return 0

  console.log(`[OfflineQueue] Flushing ${queue.length} pending mutations to Firestore...`)
  const remaining: PendingMutation[] = []
  let flushedCount = 0

  for (const item of queue) {
    try {
      const ref = doc(db, item.collectionName, item.id)
      if (item.action === 'SET') {
        await setDoc(ref, item.data, { merge: true })
      } else if (item.action === 'DELETE') {
        await deleteDoc(ref)
      }
      flushedCount++
    } catch (err) {
      console.warn(`[OfflineQueue] Retry failed for ${item.id}, keeping in queue:`, err)
      remaining.push(item)
    }
  }

  saveOfflineQueue(remaining)
  return flushedCount
}

/**
 * Auto-attach window online event listener for PWA resilience
 */
export function initOfflineQueueListener(): void {
  if (typeof window !== 'undefined') {
    window.addEventListener('online', () => {
      console.log('[OfflineQueue] Device is back online! Flushing pending mutations...')
      flushOfflineQueue()
    })
  }
}
