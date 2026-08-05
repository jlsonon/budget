import { collection, doc, getDocs, addDoc, updateDoc, deleteDoc, query, where, orderBy } from 'firebase/firestore'
import { db } from '../lib/firebase'
import type { SavingsGoal } from '../types'

const COLLECTION = 'savings'

export async function getSavingsGoals(userId: string): Promise<SavingsGoal[]> {
  const q = query(
    collection(db, COLLECTION),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc')
  )
  const snapshot = await getDocs(q)
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as SavingsGoal))
}

export async function createSavingsGoal(goal: Omit<SavingsGoal, 'id'>): Promise<string> {
  const docRef = await addDoc(collection(db, COLLECTION), {
    ...goal,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  })
  return docRef.id
}

export async function updateSavingsGoal(id: string, updates: Partial<SavingsGoal>): Promise<void> {
  await updateDoc(doc(db, COLLECTION, id), {
    ...updates,
    updatedAt: new Date().toISOString(),
  })
}

export async function deleteSavingsGoal(id: string): Promise<void> {
  await deleteDoc(doc(db, COLLECTION, id))
}
