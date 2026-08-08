import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X,
  RefreshCw,
  ArrowLeftRight,
  Search,
  Globe,
  TrendingUp,
  Sliders,
  ShieldCheck,
} from 'lucide-react'
import { useForexStore, CURRENCY_METADATA } from '@/store/forexStore'
import { useAuthStore } from '@/store/authStore'
import { formatCurrency, formatDate } from '@/lib/utils'

interface ForexCalculatorModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function ForexCalculatorModal({ isOpen, onClose }: ForexCalculatorModalProps) {
  const { user } = useAuthStore()
  const { lastUpdated, isFetching, fetchRates, convert, getRate } = useForexStore()

  const [fromCurrency, setFromCurrency] = useState('USD')
  const [toCurrency, setToCurrency] = useState(user?.currency || 'PHP')
  const [amount, setAmount] = useState('1000')
  const [bankMargin, setBankMargin] = useState<number>(0)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    if (isOpen) {
      fetchRates()
    }
  }, [isOpen, fetchRates])

  if (!isOpen) return null

  const parsedAmount = parseFloat(amount) || 0
  const interbankResult = convert(parsedAmount, fromCurrency, toCurrency)
  const marginFactor = 1 - bankMargin / 100
  const finalResult = interbankResult * marginFactor
  const feeLoss = interbankResult - finalResult

  const interbankRate = getRate(fromCurrency, toCurrency)
  const effectiveRate = interbankRate * marginFactor

  const handleSwap = () => {
    const temp = fromCurrency
    setFromCurrency(toCurrency)
    setToCurrency(temp)
  }

  const currencyList = Object.keys(CURRENCY_METADATA).filter((code) => {
    const meta = CURRENCY_METADATA[code]
    return (
      code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      meta.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-xs overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 16 }}
          className="relative w-full max-w-lg bg-mochi-surface border border-mochi-border rounded-3xl shadow-2xl overflow-hidden my-6"
        >
          {/* Top Banner Header */}
          <div className="relative p-5 bg-gradient-to-r from-mochi-primary/20 via-purple-500/15 to-indigo-500/20 border-b border-mochi-border flex items-center justify-between">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-mochi-primary/20 text-mochi-primary text-[10px] font-black uppercase tracking-wider mb-1">
                <Globe className="w-3.5 h-3.5" /> Live Forex Engine
              </div>
              <h3 className="text-lg font-black text-mochi-text">
                Currency & FX Bank Spread
              </h3>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-full bg-mochi-surface-alt/80 hover:bg-mochi-border text-mochi-text-secondary transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="p-5 sm:p-6 space-y-5 max-h-[78vh] overflow-y-auto">
            {/* Live Sync Status Bar */}
            <div className="flex items-center justify-between p-3.5 bg-mochi-surface-alt/80 rounded-2xl border border-mochi-border/80 text-xs">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-500/30 shrink-0">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <p className="font-black text-mochi-text text-xs">Live Market Rates Synced</p>
                  <p className="text-[10px] text-mochi-text-muted font-bold truncate">
                    Updated: {formatDate(lastUpdated)}
                  </p>
                </div>
              </div>

              <button
                onClick={() => fetchRates()}
                disabled={isFetching}
                className="mochi-btn-secondary text-[11px] py-2 px-3 flex items-center gap-1.5 shadow-xs cursor-pointer font-bold shrink-0"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? 'animate-spin' : ''}`} />
                <span>{isFetching ? 'Syncing...' : 'Sync'}</span>
              </button>
            </div>

            {/* Converter Form Card */}
            <div className="p-4 sm:p-5 bg-gradient-to-br from-mochi-surface via-mochi-surface to-mochi-surface-alt border border-mochi-border rounded-3xl space-y-4 shadow-xs">
              <div>
                <label className="block text-[11px] font-bold text-mochi-text-secondary mb-1">
                  Amount to Convert
                </label>
                <div className="relative flex items-center">
                  <span className="absolute left-3.5 text-base font-bold text-mochi-text-muted">
                    {CURRENCY_METADATA[fromCurrency]?.symbol || '$'}
                  </span>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="1000.00"
                    className="mochi-input text-lg font-black font-mono w-full pl-8"
                  />
                </div>
              </div>

              <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
                {/* From Currency */}
                <div>
                  <label className="block text-[11px] font-bold text-mochi-text-secondary mb-1">From</label>
                  <select
                    value={fromCurrency}
                    onChange={(e) => setFromCurrency(e.target.value)}
                    className="mochi-input text-xs font-black w-full bg-mochi-surface cursor-pointer"
                  >
                    {Object.keys(CURRENCY_METADATA).map((code) => (
                      <option key={code} value={code}>
                        {code} ({CURRENCY_METADATA[code].symbol})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Swap Button */}
                <div className="pt-5">
                  <button
                    onClick={handleSwap}
                    className="p-2.5 rounded-2xl bg-mochi-primary text-white shadow-md hover:scale-110 active:scale-95 transition-transform cursor-pointer"
                    title="Swap Currencies"
                  >
                    <ArrowLeftRight className="w-4 h-4" />
                  </button>
                </div>

                {/* To Currency */}
                <div>
                  <label className="block text-[11px] font-bold text-mochi-text-secondary mb-1">To</label>
                  <select
                    value={toCurrency}
                    onChange={(e) => setToCurrency(e.target.value)}
                    className="mochi-input text-xs font-black w-full bg-mochi-surface cursor-pointer"
                  >
                    {Object.keys(CURRENCY_METADATA).map((code) => (
                      <option key={code} value={code}>
                        {code} ({CURRENCY_METADATA[code].symbol})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Bank Fee Spread Selector */}
              <div className="p-3 bg-mochi-surface-alt rounded-2xl border border-mochi-border space-y-2">
                <div className="flex items-center justify-between text-[11px] font-bold">
                  <span className="flex items-center gap-1.5 text-mochi-text">
                    <Sliders className="w-3.5 h-3.5 text-mochi-primary" /> Bank FX Spread Margin
                  </span>
                  <span className="text-mochi-primary font-black">{bankMargin}% Spread</span>
                </div>

                <div className="grid grid-cols-4 gap-1.5">
                  {[
                    { label: '0% Market', val: 0 },
                    { label: '1% Fintech', val: 1 },
                    { label: '3% Credit Card', val: 3 },
                    { label: '5% Bank/ATM', val: 5 },
                  ].map((preset) => (
                    <button
                      key={preset.val}
                      type="button"
                      onClick={() => setBankMargin(preset.val)}
                      className={`py-1.5 px-2 rounded-xl text-[10px] font-black border transition-all cursor-pointer ${
                        bankMargin === preset.val
                          ? 'bg-mochi-primary text-white border-mochi-primary shadow-xs'
                          : 'bg-mochi-surface border-mochi-border text-mochi-text-secondary hover:text-mochi-text'
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Conversion Result Display Card (Fixes text overflow) */}
              <div className="p-4 bg-mochi-surface border border-mochi-primary/40 rounded-2xl text-center space-y-1.5 shadow-inner overflow-hidden">
                <p className="text-[11px] font-bold text-mochi-text-muted">
                  {formatCurrency(parsedAmount, fromCurrency)} =
                </p>
                <div className="px-2">
                  <p className="text-[20px] sm:text-[24px] font-black text-mochi-primary font-mono tracking-tight leading-tight break-all">
                    {formatCurrency(finalResult, toCurrency)}
                  </p>
                </div>

                {bankMargin > 0 ? (
                  <div className="flex flex-wrap items-center justify-center gap-1.5 pt-1 text-[10px] font-bold">
                    <span className="text-rose-500 font-bold">
                      Bank Fee Loss: -{formatCurrency(feeLoss, toCurrency)}
                    </span>
                    <span className="text-mochi-text-muted">•</span>
                    <span className="text-mochi-text font-black">
                      Rate: 1 {fromCurrency} = {effectiveRate.toFixed(4)} {toCurrency}
                    </span>
                  </div>
                ) : (
                  <div className="pt-1 inline-flex items-center gap-1 px-3 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-extrabold border border-emerald-500/20 max-w-full truncate">
                    <TrendingUp className="w-3 h-3 shrink-0" />
                    <span className="truncate">Interbank Rate: 1 {fromCurrency} = {interbankRate.toFixed(4)} {toCurrency}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Currency Rates Matrix Grid */}
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-2">
                <h4 className="text-xs font-black text-mochi-text uppercase tracking-wider">
                  Global Rates (1 {fromCurrency})
                </h4>
                <div className="relative w-36">
                  <Search className="w-3 h-3 text-mochi-text-muted absolute left-2 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="mochi-input text-[10px] pl-6 py-1 w-full"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {currencyList.map((code) => {
                  const meta = CURRENCY_METADATA[code]
                  const rateValue = getRate(fromCurrency, code, bankMargin)
                  return (
                    <div
                      key={code}
                      onClick={() => setToCurrency(code)}
                      className={`p-2.5 sm:p-3 rounded-2xl border flex items-center justify-between transition-all cursor-pointer overflow-hidden ${
                        toCurrency === code
                          ? 'border-mochi-primary bg-mochi-primary/10 font-black shadow-xs'
                          : 'border-mochi-border bg-mochi-surface-alt hover:border-mochi-text-muted/40'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="w-7 h-7 rounded-xl bg-mochi-primary/15 text-mochi-primary font-black text-xs flex items-center justify-center shrink-0">
                          {meta.symbol}
                        </span>
                        <div className="min-w-0">
                          <p className="text-xs font-black text-mochi-text truncate">{code}</p>
                          <p className="text-[9px] text-mochi-text-muted truncate max-w-[70px] sm:max-w-[90px]">{meta.name}</p>
                        </div>
                      </div>

                      <span className="text-xs font-mono font-black text-mochi-primary shrink-0 ml-1.5">
                        {rateValue < 0.01 ? rateValue.toFixed(4) : rateValue.toFixed(2)}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
