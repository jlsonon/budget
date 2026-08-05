import { collection, doc, getDocs, addDoc, updateDoc, deleteDoc, query, where, orderBy } from 'firebase/firestore'
import { db } from '../lib/firebase'
import type { Subscription } from '../types'

const COLLECTION = 'subscriptions'

export async function getSubscriptions(userId: string): Promise<Subscription[]> {
  const q = query(
    collection(db, COLLECTION),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc')
  )
  const snapshot = await getDocs(q)
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Subscription))
}

export async function createSubscription(sub: Omit<Subscription, 'id'>): Promise<string> {
  const docRef = await addDoc(collection(db, COLLECTION), {
    ...sub,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  })
  return docRef.id
}

export async function updateSubscription(id: string, updates: Partial<Subscription>): Promise<void> {
  await updateDoc(doc(db, COLLECTION, id), {
    ...updates,
    updatedAt: new Date().toISOString(),
  })
}

export async function deleteSubscription(id: string): Promise<void> {
  await deleteDoc(doc(db, COLLECTION, id))
}
