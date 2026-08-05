import { collection, doc, getDocs, addDoc, updateDoc, deleteDoc, query, where, orderBy } from 'firebase/firestore'
import { db } from '../lib/firebase'
import type { Debt } from '../types'

const COLLECTION = 'debts'

export async function getDebts(userId: string): Promise<Debt[]> {
  const q = query(
    collection(db, COLLECTION),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc')
  )
  const snapshot = await getDocs(q)
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Debt))
}

export async function createDebt(debt: Omit<Debt, 'id'>): Promise<string> {
  const docRef = await addDoc(collection(db, COLLECTION), {
    ...debt,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  })
  return docRef.id
}

export async function updateDebt(id: string, updates: Partial<Debt>): Promise<void> {
  await updateDoc(doc(db, COLLECTION, id), {
    ...updates,
    updatedAt: new Date().toISOString(),
  })
}

export async function deleteDebt(id: string): Promise<void> {
  await deleteDoc(doc(db, COLLECTION, id))
}
