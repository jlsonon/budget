import { formatDate } from '@/lib/utils'

export interface ForexRates {
  base: string
  date: string // e.g. "08-08-2026"
  rates: Record<string, number> // Relative to USD
}

// Highly accurate baseline real-world market exchange rates relative to USD
export const FALLBACK_RATES: Record<string, number> = {
  USD: 1,
  PHP: 58.25,
  EUR: 0.916,
  JPY: 147.50,
  GBP: 0.785,
  AUD: 1.520,
  CAD: 1.371,
  SGD: 1.342,
  HKD: 7.810,
  KRW: 1370.00,
  THB: 35.80,
  MYR: 4.42,
  IDR: 16180.00,
  INR: 83.85,
  NZD: 1.640,
  AED: 3.672,
  CNY: 7.185,
}

export const CURRENCY_METADATA: Record<
  string,
  { name: string; symbol: string }
> = {
  PHP: { name: 'Philippine Peso', symbol: '₱' },
  USD: { name: 'US Dollar', symbol: '$' },
  EUR: { name: 'Euro', symbol: '€' },
  JPY: { name: 'Japanese Yen', symbol: '¥' },
  GBP: { name: 'British Pound', symbol: '£' },
  AUD: { name: 'Australian Dollar', symbol: 'A$' },
  CAD: { name: 'Canadian Dollar', symbol: 'C$' },
  SGD: { name: 'Singapore Dollar', symbol: 'S$' },
  HKD: { name: 'Hong Kong Dollar', symbol: 'HK$' },
  KRW: { name: 'South Korean Won', symbol: '₩' },
  THB: { name: 'Thai Baht', symbol: '฿' },
  MYR: { name: 'Malaysian Ringgit', symbol: 'RM' },
  IDR: { name: 'Indonesian Rupiah', symbol: 'Rp' },
  INR: { name: 'Indian Rupee', symbol: '₹' },
  NZD: { name: 'New Zealand Dollar', symbol: 'NZ$' },
  AED: { name: 'UAE Dirham', symbol: 'AED' },
  CNY: { name: 'Chinese Yuan', symbol: '¥' },
}

export async function fetchLiveForexRates(): Promise<ForexRates> {
  const todayStr = formatDate(new Date())

  // API Provider 1: Open ER API
  try {
    const res = await fetch('https://open.er-api.com/v6/latest/USD')
    if (res.ok) {
      const data = await res.json()
      if (data && data.rates && typeof data.rates === 'object') {
        const rawDate = data.time_last_update_utc ? new Date(data.time_last_update_utc) : new Date()
        return {
          base: 'USD',
          date: formatDate(rawDate),
          rates: { ...FALLBACK_RATES, ...data.rates },
        }
      }
    }
  } catch (e) {
    console.warn('Forex Provider 1 (Open ER) skipped:', e)
  }

  // API Provider 2: ExchangeRate-API V4
  try {
    const res2 = await fetch('https://api.exchangerate-api.com/v4/latest/USD')
    if (res2.ok) {
      const data2 = await res2.json()
      if (data2 && data2.rates) {
        return {
          base: 'USD',
          date: data2.date ? formatDate(data2.date) : todayStr,
          rates: { ...FALLBACK_RATES, ...data2.rates },
        }
      }
    }
  } catch (e2) {
    console.warn('Forex Provider 2 (ExchangeRate-API) skipped:', e2)
  }

  // API Provider 3: Frankfurter API
  try {
    const res3 = await fetch('https://api.frankfurter.app/latest?from=USD')
    if (res3.ok) {
      const data3 = await res3.json()
      if (data3 && data3.rates) {
        return {
          base: 'USD',
          date: data3.date ? formatDate(data3.date) : todayStr,
          rates: { ...FALLBACK_RATES, USD: 1, ...data3.rates },
        }
      }
    }
  } catch (e3) {
    console.warn('Forex Provider 3 (Frankfurter) skipped:', e3)
  }

  // Fallback to static baseline rates
  return {
    base: 'USD',
    date: todayStr,
    rates: FALLBACK_RATES,
  }
}

/**
 * Convert amount with optional bank spread margin (0% to 5%)
 */
export function convertCurrencyAmount(
  amount: number,
  fromCurrency = 'PHP',
  toCurrency = 'PHP',
  ratesMap: Record<string, number> = FALLBACK_RATES,
  marginPercent = 0
): number {
  if (amount === 0 || fromCurrency === toCurrency) return amount

  const rates = { ...FALLBACK_RATES, ...ratesMap }
  const fromRateInUSD = rates[fromCurrency] || 1
  const toRateInUSD = rates[toCurrency] || 1

  const rawConverted = (amount / fromRateInUSD) * toRateInUSD
  
  if (marginPercent > 0) {
    const factor = 1 - marginPercent / 100
    return rawConverted * factor
  }

  return rawConverted
}

/**
 * Get direct exchange rate between two currencies with optional bank spread margin
 */
export function getExchangeRate(
  fromCurrency: string,
  toCurrency: string,
  ratesMap: Record<string, number> = FALLBACK_RATES,
  marginPercent = 0
): number {
  return convertCurrencyAmount(1, fromCurrency, toCurrency, ratesMap, marginPercent)
}
