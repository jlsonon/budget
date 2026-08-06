import { doc, writeBatch, increment, arrayUnion } from 'firebase/firestore'
import { db } from '../lib/firebase'
import { FIRESTORE_COLLECTIONS } from './firestoreCollections'
import type { Transaction } from '../types'
import { validateOrThrow, TransactionSchema } from '../lib/validators'

/**
 * Atomically saves a transaction AND updates the wallet balance.
 * Either both succeed or both fail — never partial writes.
 */
export async function atomicAddTransaction(txn: Transaction): Promise<void> {
  // Validate schema
  validateOrThrow(TransactionSchema, txn)

  const batch = writeBatch(db)

  // 1. Write transaction document
  const txnRef = doc(db, FIRESTORE_COLLECTIONS.TRANSACTIONS, txn.id)
  batch.set(txnRef, {
    ...txn,
    schemaVersion: 1,
    isDeleted: false,
    createdAt: txn.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }, { merge: true })

  // 2. Atomically update wallet balance using increment
  if (txn.walletId) {
    const walletRef = doc(db, FIRESTORE_COLLECTIONS.WALLETS, txn.walletId)
    const delta = txn.type === 'expense' ? -txn.amount : txn.amount
    batch.update(walletRef, {
      balance: increment(delta),
      updatedAt: new Date().toISOString(),
    })
  }

  await batch.commit()
}

/**
 * Atomically soft-deletes a transaction AND reverses the wallet balance.
 */
export async function atomicDeleteTransaction(txn: Transaction): Promise<void> {
  const batch = writeBatch(db)

  const txnRef = doc(db, FIRESTORE_COLLECTIONS.TRANSACTIONS, txn.id)
  batch.update(txnRef, {
    isDeleted: true,
    deletedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  })

  if (txn.walletId) {
    const walletRef = doc(db, FIRESTORE_COLLECTIONS.WALLETS, txn.walletId)
    const reverseDelta = txn.type === 'expense' ? txn.amount : -txn.amount
    batch.update(walletRef, {
      balance: increment(reverseDelta),
      updatedAt: new Date().toISOString(),
    })
  }

  await batch.commit()
}

/**
 * Atomically records a savings contribution.
 */
export async function atomicSavingsContribution(
  goalId: string, amount: number, contribution: { id: string; amount: number; date: string; note?: string }
): Promise<void> {
  const batch = writeBatch(db)
  const goalRef = doc(db, FIRESTORE_COLLECTIONS.SAVINGS, goalId)

  batch.update(goalRef, {
    currentAmount: increment(amount),
    contributions: arrayUnion(contribution),
    updatedAt: new Date().toISOString(),
  })

  await batch.commit()
}

/**
 * Atomically records a debt payment.
 */
export async function atomicDebtPayment(
  debtId: string, amount: number, payment: { id: string; amount: number; date: string; method: string; notes?: string }
): Promise<void> {
  const batch = writeBatch(db)
  const debtRef = doc(db, FIRESTORE_COLLECTIONS.DEBTS, debtId)

  batch.update(debtRef, {
    currentBalance: increment(-amount),
    payments: arrayUnion(payment),
    updatedAt: new Date().toISOString(),
  })

  await batch.commit()
}
