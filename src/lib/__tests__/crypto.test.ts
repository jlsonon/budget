import { describe, it, expect } from 'vitest'
import { hashPin, verifyPin } from '../crypto'

describe('Crypto Utilities', () => {
  it('hashes PIN deterministically', async () => {
    const pin = '1234'
    const hash1 = await hashPin(pin)
    const hash2 = await hashPin(pin)
    expect(hash1).toBe(hash2)
    expect(hash1).not.toBe(pin)
  })

  it('verifies correct PIN', async () => {
    const pin = '5678'
    const hash = await hashPin(pin)
    const isValid = await verifyPin('5678', hash)
    const isInvalid = await verifyPin('0000', hash)
    expect(isValid).toBe(true)
    expect(isInvalid).toBe(false)
  })
})
