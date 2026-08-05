import { useState, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  Plus,
  CreditCard,
  TrendingDown,
  CalendarDays,
  Percent,
  Target,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react'
import { useAppStore } from '@/store/appStore'
import { formatCurrency, calculateProgress } from '@/lib/utils'
import type { Debt } from '@/types'
import MochiIllustration from '@/components/ui/MochiIllustrations'
import Dialog from '@/components/ui/Dialog'
import MochiCategoryVectorSVG from '@/components/ui/MochiCategoryVectorSVG'

const debtTypeLabels: Record<string, string> = {
  borrowed: 'Borrowed',
  lent: 'Lent',
  credit_card: 'Credit Card',
  loan: 'Loan',
  mortgage: 'Mortgage',
  car_loan: 'Car Loan',
  personal: 'Personal Loan',
  business: 'Business Loan',
}

const debtTypeVectorIds: Record<string, string> = {
  borrowed: 'coins',
  lent: 'wallet',
  credit_card: 'receipt',
  loan: 'vault',
  mortgage: 'house',
  car_loan: 'car',
  personal: 'briefcase',
  business: 'laptop',
}



function DebtCard({ debt }: { debt: Debt }) {
  const progress = calculateProgress(debt.originalBalance - debt.currentBalance, debt.originalBalance)
  const vectorId = debtTypeVectorIds[debt.type] || 'vault'
  const isOverdue = new Date(debt.dueDate) < new Date()

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="mochi-card"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <MochiCategoryVectorSVG id={vectorId} size="sm" />
          <div>
            <h3 className="text-sm font-semibold text-mochi-text">{debt.lender}</h3>
            <p className="text-xs text-mochi-text-muted">{debtTypeLabels[debt.type]}</p>
          </div>
        </div>
        {isOverdue ? (
          <span className="mochi-badge mochi-badge-error flex items-center gap-1">
            <AlertCircle className="w-3 h-3" /> Overdue
          </span>
        ) : (
          <span className="mochi-badge mochi-badge-warning flex items-center gap-1">
            <CalendarDays className="w-3 h-3" />
            {new Date(debt.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </span>
        )}
      </div>

      {/* Balance */}
      <div className="mb-3">
        <div className="flex justify-between text-xs mb-1">
          <span className="text-mochi-text-secondary">{formatCurrency(debt.originalBalance - debt.currentBalance)} paid</span>
          <span className="text-mochi-text-muted">{formatCurrency(debt.currentBalance)} remaining</span>
        </div>
        <div className="h-2 bg-mochi-border/50 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-mochi-error to-mochi-warning transition-all duration-500"
            style={{ width: `${Math.min(100, progress)}%` }}
          />
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs text-mochi-text-muted">
          <Percent className="w-3 h-3" />
          <span>{debt.interestRate}% {debt.interestType}</span>
        </div>
        <div className="text-right">
          <p className="text-xs text-mochi-text-muted">Min. payment</p>
          <p className="text-sm font-semibold text-mochi-error">{formatCurrency(debt.minimumPayment)}</p>
        </div>
      </div>
    </motion.div>
  )
}

function EmptyDebts() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <MochiIllustration type="debt_paid" size="lg" />
      <h3 className="text-lg font-semibold text-mochi-text">No debts tracked</h3>
      <p className="mt-2 text-sm text-mochi-text-muted max-w-xs">
        You&apos;re debt-free! Or you haven&apos;t added any debts yet.
      </p>
      <button className="mochi-btn-primary mt-4">
        <Plus className="w-4 h-4" />
        Add Debt
      </button>
    </div>
  )
}

export default function DebtPage() {
  const { debts, addDebt } = useAppStore()
  const [isLoading, setIsLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const [lenderName, setLenderName] = useState('')
  const [balance, setBalance] = useState('')
  const [debtType, setDebtType] = useState('credit_card')
  const [minPay, setMinPay] = useState('')
  const [status, setStatus] = useState<'idle' | 'success'>('idle')

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 500)
    return () => clearTimeout(timer)
  }, [])

  const [payoffStrategy, setPayoffStrategy] = useState<'snowball' | 'avalanche'>('snowball')

  const allDebts = debts

  const sortedDebts = useMemo(() => {
    return [...allDebts].sort((a, b) => {
      if (payoffStrategy === 'snowball') {
        return a.currentBalance - b.currentBalance // Smallest balance first
      } else {
        return (b.interestRate || 0) - (a.interestRate || 0) // Highest interest first
      }
    })
  }, [allDebts, payoffStrategy])

  const totalDebt = allDebts.reduce((sum, d) => sum + d.currentBalance, 0)
  const totalMonthly = allDebts.reduce((sum, d) => sum + d.minimumPayment, 0)
  const totalOriginal = allDebts.reduce((sum, d) => sum + d.originalBalance, 0)
  const totalPaid = totalOriginal - totalDebt

  // Estimated interest savings between Snowball & Avalanche
  const totalInterestRateAvg = allDebts.length > 0
    ? allDebts.reduce((s, d) => s + (d.interestRate || 0), 0) / allDebts.length
    : 0

  const debtFreeMonths = totalMonthly > 0 ? Math.ceil(totalDebt / totalMonthly) : 0
  const debtFreeDate = new Date(Date.now() + debtFreeMonths * 30 * 86400000)

  const handleAddDebtSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const origBal = parseFloat(balance)
    if (!lenderName.trim() || isNaN(origBal) || origBal <= 0) return

    const newDebt: Debt = {
      id: `debt_${Date.now()}`,
      userId: '1',
      lender: lenderName.trim(),
      type: debtType as any,
      originalBalance: origBal,
      currentBalance: origBal,
      interestRate: 3.5,
      interestType: 'simple',
      dueDate: new Date(Date.now() + 30 * 86400000).toISOString(),
      minimumPayment: minPay ? parseFloat(minPay) : Math.round(origBal * 0.05),
      schedule: [],
      payments: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    addDebt(newDebt)
    setStatus('success')

    setTimeout(() => {
      setStatus('idle')
      setLenderName('')
      setBalance('')
      setMinPay('')
      setIsModalOpen(false)
    }, 1200)
  }

  if (isLoading) {
    return (
      <div className="space-y-3 animate-pulse" aria-busy="true">
        <div className="mochi-skeleton h-10 w-full" />
        <div className="grid grid-cols-3 gap-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="mochi-skeleton h-24" />
          ))}
        </div>
        {[1, 2].map((i) => (
          <div key={i} className="mochi-skeleton h-32 w-full" />
        ))}
      </div>
    )
  }

  return (
    <motion.div
      className="pb-20 md:pb-0 space-y-4"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      role="main"
      aria-label="Debt Tracking"
    >
      {/* Add Debt Modal */}
      <Dialog isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add Debt / Loan Record">
        {status === 'success' ? (
          <div className="py-6 text-center space-y-2">
            <div className="w-12 h-12 bg-mochi-success/20 text-mochi-success rounded-full flex items-center justify-center mx-auto border border-mochi-success/30 animate-bounce">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-mochi-text">Debt Record Added!</h4>
            <p className="text-xs text-mochi-text-secondary">Track your payoff progress with Debt Snowball/Avalanche.</p>
          </div>
        ) : (
          <form onSubmit={handleAddDebtSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-mochi-text-secondary mb-1">Lender / Account Name *</label>
              <input
                type="text"
                placeholder="e.g. BDO Credit Card, Landbank Loan, Mark (Friend)"
                value={lenderName}
                onChange={(e) => setLenderName(e.target.value)}
                className="mochi-input text-xs w-full font-bold"
                autoFocus
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-mochi-text-secondary mb-1">Original Balance (PHP) *</label>
              <input
                type="number"
                placeholder="e.g. 25000"
                value={balance}
                onChange={(e) => setBalance(e.target.value)}
                className="mochi-input text-xs w-full font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-mochi-text-secondary mb-1">Debt Category</label>
              <select
                value={debtType}
                onChange={(e) => setDebtType(e.target.value)}
                className="mochi-input text-xs w-full font-semibold"
              >
                <option value="credit_card">Credit Card</option>
                <option value="borrowed">Borrowed from Friend/Family</option>
                <option value="loan">Bank Personal Loan</option>
                <option value="car_loan">Auto / Car Loan</option>
                <option value="mortgage">Housing Mortgage</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-mochi-text-secondary mb-1">Estimated Monthly Minimum Payment (PHP)</label>
              <input
                type="number"
                placeholder="e.g. 1500"
                value={minPay}
                onChange={(e) => setMinPay(e.target.value)}
                className="mochi-input text-xs w-full font-medium"
              />
            </div>

            <div className="pt-2 flex gap-3">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="mochi-btn-secondary text-xs flex-1 py-2.5"
              >
                Cancel
              </button>
              <button type="submit" className="mochi-btn-primary text-xs flex-1 py-2.5">
                Save Debt Record
              </button>
            </div>
          </form>
        )}
      </Dialog>

      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold text-mochi-text">Debts</h1>
        <button onClick={() => setIsModalOpen(true)} className="mochi-btn-primary text-sm flex items-center gap-1.5">
          <Plus className="w-4 h-4" />
          <span>Add Debt</span>
        </button>
      </div>

      {/* Summary Cards */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4" aria-label="Debt Summary">
        <div className="mochi-card flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-mochi-error/10 flex items-center justify-center">
            <TrendingDown className="w-5 h-5 text-mochi-error" />
          </div>
          <div>
            <p className="text-xs text-mochi-text-muted">Total Debt</p>
            <p className="text-lg font-bold text-mochi-error">{formatCurrency(totalDebt)}</p>
          </div>
        </div>
        <div className="mochi-card flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-mochi-warning/10 flex items-center justify-center">
            <CreditCard className="w-5 h-5 text-mochi-warning" />
          </div>
          <div>
            <p className="text-xs text-mochi-text-muted">Monthly Payments</p>
            <p className="text-lg font-bold text-mochi-text">{formatCurrency(totalMonthly)}</p>
          </div>
        </div>
        <div className="mochi-card flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-mochi-success/10 flex items-center justify-center">
            <CalendarDays className="w-5 h-5 text-mochi-success" />
          </div>
          <div>
            <p className="text-xs text-mochi-text-muted">Debt-Free Date</p>
            <p className="text-lg font-bold text-mochi-success">
              {debtFreeMonths > 0
                ? debtFreeDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
                : 'Free!'}
            </p>
          </div>
        </div>
      </section>

      {/* Paid Off Progress */}
      {totalOriginal > 0 && (
        <section className="mochi-card mb-4" aria-label="Debt Payoff Progress">
          <div className="flex items-center gap-2 mb-2">
            <Target className="w-4 h-4 text-mochi-primary" />
            <h2 className="text-sm font-semibold text-mochi-text">Payoff Progress</h2>
          </div>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-mochi-success">{formatCurrency(totalPaid)} paid off</span>
            <span className="text-mochi-text-muted">{formatCurrency(totalOriginal)} original</span>
          </div>
          <div className="h-3 bg-mochi-border/50 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-mochi-error to-mochi-success transition-all duration-700"
              style={{ width: `${(totalPaid / totalOriginal) * 100}%` }}
            />
          </div>
          <p className="text-xs text-mochi-text-muted mt-1 text-center">
            {((totalPaid / totalOriginal) * 100).toFixed(0)}% paid off
          </p>
        </section>
      )}

      {/* Payoff Strategy Selector */}
      <section className="mochi-card bg-gradient-to-r from-amber-500/10 via-purple-500/10 to-sky-500/10 border border-mochi-border p-4 rounded-3xl" aria-label="Payoff Strategy Simulator">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-sm font-bold text-mochi-text">Payoff Strategy Simulator</h2>
            <p className="text-[10px] text-mochi-text-muted">Choose your optimal debt-free strategy</p>
          </div>
          <div className="grid grid-cols-2 gap-1.5 p-1 bg-mochi-surface rounded-xl border border-mochi-border">
            <button
              type="button"
              onClick={() => setPayoffStrategy('snowball')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                payoffStrategy === 'snowball'
                  ? 'bg-amber-500 text-white shadow-xs'
                  : 'text-mochi-text-muted hover:text-mochi-text'
              }`}
            >
              ❄️ Snowball
            </button>
            <button
              type="button"
              onClick={() => setPayoffStrategy('avalanche')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                payoffStrategy === 'avalanche'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'text-mochi-text-muted hover:text-mochi-text'
              }`}
            >
              🏔️ Avalanche
            </button>
          </div>
        </div>
        <p className="text-xs text-mochi-text-secondary leading-relaxed">
          {payoffStrategy === 'snowball'
            ? 'Snowball Strategy prioritizes smallest balances first to build quick psychological wins and momentum.'
            : `Avalanche Strategy prioritizes highest interest rates first (avg ${totalInterestRateAvg.toFixed(1)}%) to save the maximum money on interest.`}
        </p>
      </section>

      {/* Debt Cards */}
      <section aria-label="Debts List">
        <h2 className="text-sm font-semibold text-mochi-text-secondary mb-2 uppercase tracking-wide">
          Your Debts ({payoffStrategy === 'snowball' ? 'Sorted by Smallest Balance' : 'Sorted by Highest Interest'})
        </h2>
        {sortedDebts.length === 0 ? (
          <EmptyDebts />
        ) : (
          <div className="grid gap-3">
            {sortedDebts.map((debt) => (
              <DebtCard key={debt.id} debt={debt} />
            ))}
          </div>
        )}
      </section>
    </motion.div>
  )
}
