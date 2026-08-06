import { describe, it, expect } from 'vitest'
import { TransactionSchema, validateOrThrow } from '../validators'

describe('Validators', () => {
  it('validates a correct transaction object', () => {
    const validTxn = {
      id: 'tx-123',
      userId: 'u-1',
      type: 'expense' as const,
      amount: 250,
      currency: 'PHP',
      categoryId: 'food',
      merchant: 'Starbucks',
      paymentMethod: 'cash' as const,
      date: '2026-08-06',
      isFavorite: false,
    }
    expect(() => validateOrThrow(TransactionSchema, validTxn)).not.toThrow()
  })

  it('rejects invalid transaction with negative amount', () => {
    const invalidTxn = {
      id: 'tx-123',
      userId: 'u-1',
      type: 'expense' as const,
      amount: -50,
      currency: 'PHP',
      categoryId: 'food',
      merchant: 'Starbucks',
      paymentMethod: 'cash' as const,
      date: '2026-08-06',
      isFavorite: false,
    }
    expect(() => validateOrThrow(TransactionSchema, invalidTxn)).toThrow()
  })
})
