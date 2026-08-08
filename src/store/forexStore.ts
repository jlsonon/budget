import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import {
  fetchLiveForexRates,
  convertCurrencyAmount,
  getExchangeRate,
  FALLBACK_RATES,
  CURRENCY_METADATA,
} from '@/services/forex'
import { formatDate } from '@/lib/utils'

interface ForexState {
  rates: Record<string, number>
  lastUpdated: string
  isFetching: boolean
  error: string | null
  fetchRates: () => Promise<void>
  convert: (amount: number, from: string, to: string, marginPercent?: number) => number
  getRate: (from: string, to: string, marginPercent?: number) => number
}

export const useForexStore = create<ForexState>()(
  persist(
    (set, get) => ({
      rates: FALLBACK_RATES,
      lastUpdated: formatDate(new Date()),
      isFetching: false,
      error: null,

      fetchRates: async () => {
        set({ isFetching: true, error: null })
        try {
          const liveData = await fetchLiveForexRates()
          set({
            rates: liveData.rates,
            lastUpdated: liveData.date,
            isFetching: false,
          })
        } catch (err: any) {
          console.warn('Forex store fetch error:', err)
          set({ isFetching: false, error: 'Could not fetch latest rates. Using cached rates.' })
        }
      },

      convert: (amount: number, from: string, to: string, marginPercent = 0) => {
        return convertCurrencyAmount(amount, from, to, get().rates, marginPercent)
      },

      getRate: (from: string, to: string, marginPercent = 0) => {
        return getExchangeRate(from, to, get().rates, marginPercent)
      },
    }),
    {
      name: 'mochi-forex-store',
      partialize: (state) => ({ rates: state.rates, lastUpdated: state.lastUpdated }),
    }
  )
)

export { CURRENCY_METADATA }
