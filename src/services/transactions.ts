import {
  collection,
  query,
  where,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  serverTimestamp,
  type QueryDocumentSnapshot,
} from 'firebase/firestore'
import { db } from '../lib/firebase'
import { Transaction } from '../types'

const TRANSACTIONS_COLLECTION = 'transactions'

export async function getTransactions(userId: string): Promise<Transaction[]> {
  try {
    const q = query(collection(db, TRANSACTIONS_COLLECTION), where('userId', '==', userId))
    const snapshot = await getDocs(q)
    const txns = snapshot.docs.map((d: QueryDocumentSnapshot) => ({ id: d.id, ...d.data() } as Transaction))
    return txns.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  } catch (err) {
    console.warn('Firestore fetch transactions skipped or offline:', err)
    return []
  }
}

export async function createTransaction(userId: string, data: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
  const docRef = await addDoc(collection(db, TRANSACTIONS_COLLECTION), {
    ...data,
    userId,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
  return docRef.id
}

export async function updateTransaction(id: string, updates: Partial<Transaction>): Promise<void> {
  await updateDoc(doc(db, TRANSACTIONS_COLLECTION, id), {
    ...updates,
    updatedAt: serverTimestamp(),
  })
}

export async function deleteTransaction(id: string): Promise<void> {
  await deleteDoc(doc(db, TRANSACTIONS_COLLECTION, id))
}
