import { collection, doc, getDocs, addDoc, updateDoc, deleteDoc, query, where, orderBy } from 'firebase/firestore'
import { db } from '../lib/firebase'
import type { Budget } from '../types'

const COLLECTION = 'budgets'

export async function getBudgets(userId: string): Promise<Budget[]> {
  const q = query(
    collection(db, COLLECTION),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc')
  )
  const snapshot = await getDocs(q)
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Budget))
}

export async function createBudget(budget: Omit<Budget, 'id'>): Promise<string> {
  const docRef = await addDoc(collection(db, COLLECTION), {
    ...budget,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  })
  return docRef.id
}

export async function updateBudget(id: string, updates: Partial<Budget>): Promise<void> {
  await updateDoc(doc(db, COLLECTION, id), {
    ...updates,
    updatedAt: new Date().toISOString(),
  })
}

export async function deleteBudget(id: string): Promise<void> {
  await deleteDoc(doc(db, COLLECTION, id))
}
