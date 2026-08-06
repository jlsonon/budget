import { describe, it, expect, beforeEach } from 'vitest'
import { useTransactionStore } from '../transactionStore'
import { Transaction } from '../../types'

describe('Transaction Store', () => {
  beforeEach(() => {
    useTransactionStore.setState({ transactions: [] })
  })

  it('initializes with empty transactions', () => {
    expect(useTransactionStore.getState().transactions).toEqual([])
  })

  it('sets transactions correctly', () => {
    const mockTxn: Transaction = {
      id: 'txn-1',
      userId: 'u1',
      type: 'expense',
      amount: 100,
      currency: 'PHP',
      categoryId: 'food',
      merchant: 'Jollibee',
      paymentMethod: 'cash',
      date: '2026-08-06',
      isFavorite: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    useTransactionStore.getState().setTransactions([mockTxn])
    expect(useTransactionStore.getState().transactions).toHaveLength(1)
    expect(useTransactionStore.getState().transactions[0].merchant).toBe('Jollibee')
  })

  it('deletes transaction from store', () => {
    const mockTxn: Transaction = {
      id: 'txn-1',
      userId: 'u1',
      type: 'expense',
      amount: 100,
      currency: 'PHP',
      categoryId: 'food',
      merchant: 'Jollibee',
      paymentMethod: 'cash',
      date: '2026-08-06',
      isFavorite: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    useTransactionStore.getState().setTransactions([mockTxn])
    useTransactionStore.getState().deleteTransaction('txn-1')
    expect(useTransactionStore.getState().transactions).toHaveLength(0)
  })
})
