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
  DollarSign,
  Sparkles,
  Zap,
  Flame,
} from 'lucide-react'
import { useAppStore } from '@/store/appStore'
import { useAuthStore } from '@/store/authStore'
import { formatCurrency, calculateProgress, formatDate } from '@/lib/utils'
import type { Debt } from '@/types'
import MochiIllustration from '@/components/ui/MochiIllustrations'
import Dialog from '@/components/ui/Dialog'
import MochiCategoryVectorSVG from '@/components/ui/MochiCategoryVectorSVG'

const debtTypeLabels: Record<string, string> = {
  borrowed: 'Borrowed from Friend/Family',
  lent: 'Lent Out',
  credit_card: 'Credit Card',
  loan: 'Bank Loan',
  mortgage: 'Housing Mortgage',
  car_loan: 'Auto / Car Loan',
  personal: 'Personal Loan',
  business: 'Business Loan',
  bnpl: 'Buy Now Pay Later (BNPL)',
  medical: 'Medical Debt',
  student_loan: 'Student Loan',
  tax: 'Tax Assessment',
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
  bnpl: 'receipt',
  medical: 'health',
  student_loan: 'education',
  tax: 'shield',
}

function DebtCard({ debt, onPay }: { debt: Debt; onPay: (debt: Debt) => void }) {
  const progress = calculateProgress(debt.originalBalance - debt.currentBalance, debt.originalBalance)
  const vectorId = debtTypeVectorIds[debt.type] || 'vault'
  const isOverdue = new Date(debt.dueDate) < new Date()

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="mochi-card relative overflow-hidden"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <MochiCategoryVectorSVG id={vectorId} size="sm" />
          <div>
            <h3 className="text-sm font-semibold text-mochi-text">{debt.lender}</h3>
            <p className="text-xs text-mochi-text-muted">{debtTypeLabels[debt.type] || debt.type}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {debt.dueDayOfMonth ? (
            <span className="mochi-badge mochi-badge-info flex items-center gap-1 text-[10px]">
              <CalendarDays className="w-3 h-3" /> Due {debt.dueDayOfMonth}th
            </span>
          ) : isOverdue ? (
            <span className="mochi-badge mochi-badge-error flex items-center gap-1 text-[10px]">
              <AlertCircle className="w-3 h-3" /> Overdue
            </span>
          ) : (
            <span className="mochi-badge mochi-badge-warning flex items-center gap-1 text-[10px]">
              <CalendarDays className="w-3 h-3" />
              {formatDate(debt.dueDate)}
            </span>
          )}
        </div>
      </div>

      {/* Balance */}
      <div className="mb-3">
        <div className="flex justify-between text-xs mb-1">
          <span className="text-mochi-text-secondary">{formatCurrency(debt.originalBalance - debt.currentBalance)} paid</span>
          <span className="text-mochi-text-muted">{formatCurrency(debt.currentBalance)} remaining</span>
        </div>
        <div className="h-2.5 bg-mochi-border/50 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-mochi-error via-mochi-warning to-mochi-success transition-all duration-500"
            style={{ width: `${Math.min(100, progress)}%` }}
          />
        </div>
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-mochi-border/40">
        <div className="flex items-center gap-2 text-xs text-mochi-text-muted">
          <Percent className="w-3.5 h-3.5 text-mochi-primary" />
          <span>{debt.interestRate || 0}% {debt.interestType || 'simple'}</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-[10px] text-mochi-text-muted">Min. payment</p>
            <p className="text-xs font-bold text-mochi-error">{formatCurrency(debt.minimumPayment)}</p>
          </div>
          <button
            type="button"
            onClick={() => onPay(debt)}
            className="mochi-btn-primary text-xs py-1.5 px-3 flex items-center gap-1 rounded-xl shadow-xs"
          >
            <DollarSign className="w-3.5 h-3.5" />
            <span>Pay</span>
          </button>
        </div>
      </div>
    </motion.div>
  )
}

function EmptyDebts() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <MochiIllustration type="debt_paid" size="lg" />
      <h3 className="text-lg font-semibold text-mochi-text mt-3">You're doing amazing!</h3>
      <p className="mt-2 text-sm text-mochi-text-muted max-w-xs">
        No debts tracked yet. If you have any, tracking them is the first step to being debt-free.
      </p>
      <p className="text-xs text-mochi-primary mt-1 font-medium flex items-center gap-1 justify-center">
        <Sparkles className="w-3.5 h-3.5" /> Every journey starts with one step
      </p>
    </div>
  )
}

export default function DebtPage() {
  const { debts, addDebt, makeDebtPayment } = useAppStore()
  const { user } = useAuthStore()
  const [isLoading, setIsLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [payModalDebt, setPayModalDebt] = useState<Debt | null>(null)
  const [paymentAmount, setPaymentAmount] = useState('')

  const [lenderName, setLenderName] = useState('')
  const [balance, setBalance] = useState('')
  const [currentBal, setCurrentBal] = useState('')
  const [debtType, setDebtType] = useState('credit_card')
  const [dueDay, setDueDay] = useState('15')
  const [interestRate, setInterestRate] = useState('3.5')
  const [interestType, setInterestType] = useState<'simple' | 'compound'>('simple')
  const [minPay, setMinPay] = useState('')
  const [notes, setNotes] = useState('')
  const [status, setStatus] = useState<'idle' | 'success'>('idle')

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 500)
    return () => clearTimeout(timer)
  }, [])

  const [payoffStrategy, setPayoffStrategy] = useState<'snowball' | 'avalanche'>('snowball')

  const sortedDebts = useMemo(() => {
    return [...debts].sort((a, b) => {
      if (payoffStrategy === 'snowball') {
        return a.currentBalance - b.currentBalance
      } else {
        return (b.interestRate || 0) - (a.interestRate || 0)
      }
    })
  }, [debts, payoffStrategy])

  const totalDebt = debts.reduce((sum, d) => sum + d.currentBalance, 0)
  const totalMonthly = debts.reduce((sum, d) => sum + d.minimumPayment, 0)
  const totalOriginal = debts.reduce((sum, d) => sum + d.originalBalance, 0)
  const totalPaid = totalOriginal - totalDebt

  const totalInterestRateAvg = debts.length > 0
    ? debts.reduce((s, d) => s + (d.interestRate || 0), 0) / debts.length
    : 0

  const debtFreeMonths = totalMonthly > 0 ? Math.ceil(totalDebt / totalMonthly) : 0
  const debtFreeDate = new Date(Date.now() + debtFreeMonths * 30 * 86400000)

  const handleAddDebtSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const origBal = parseFloat(balance)
    if (!lenderName.trim() || isNaN(origBal) || origBal <= 0) return

    const curr = currentBal ? parseFloat(currentBal) : origBal
    const rate = parseFloat(interestRate) || 0
    const day = parseInt(dueDay, 10) || 15

    const newDebt: Debt = {
      id: `debt_${Date.now()}`,
      userId: user?.id || 'anon',
      lender: lenderName.trim(),
      type: debtType as any,
      originalBalance: origBal,
      currentBalance: curr,
      interestRate: rate,
      interestType,
      dueDate: new Date(Date.now() + 30 * 86400000).toISOString(),
      dueDayOfMonth: day,
      minimumPayment: minPay ? parseFloat(minPay) : Math.round(origBal * 0.05),
      schedule: [],
      payments: [],
      notes: notes.trim() || undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    addDebt(newDebt)
    setStatus('success')

    setTimeout(() => {
      setStatus('idle')
      setLenderName('')
      setBalance('')
      setCurrentBal('')
      setMinPay('')
      setNotes('')
      setIsModalOpen(false)
    }, 1200)
  }

  const handleRecordPaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!payModalDebt) return
    const amt = parseFloat(paymentAmount)
    if (isNaN(amt) || amt <= 0) return

    makeDebtPayment(payModalDebt.id, amt)
    setPayModalDebt(null)
    setPaymentAmount('')
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
          <form onSubmit={handleAddDebtSubmit} className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-mochi-text-secondary mb-1">Lender / Institution Name *</label>
              <input
                type="text"
                placeholder="e.g. BDO Credit Card, Landbank Loan, Mark (Friend)"
                value={lenderName}
                onChange={(e) => setLenderName(e.target.value)}
                className="mochi-input text-xs w-full font-bold"
                autoFocus
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
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
                <label className="block text-xs font-bold text-mochi-text-secondary mb-1">Current Balance (PHP)</label>
                <input
                  type="number"
                  placeholder="Leave empty if same"
                  value={currentBal}
                  onChange={(e) => setCurrentBal(e.target.value)}
                  className="mochi-input text-xs w-full font-medium"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
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
                  <option value="bnpl">Buy Now Pay Later (BNPL)</option>
                  <option value="medical">Medical Debt</option>
                  <option value="student_loan">Student Loan</option>
                  <option value="tax">Tax Assessment</option>
                  <option value="business">Business Loan</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-mochi-text-secondary mb-1">Monthly Due Day</label>
                <input
                  type="number"
                  min="1"
                  max="31"
                  placeholder="e.g. 15th"
                  value={dueDay}
                  onChange={(e) => setDueDay(e.target.value)}
                  className="mochi-input text-xs w-full font-semibold"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-bold text-mochi-text-secondary mb-1">Interest Rate (%)</label>
                <input
                  type="number"
                  step="0.1"
                  placeholder="e.g. 3.5"
                  value={interestRate}
                  onChange={(e) => setInterestRate(e.target.value)}
                  className="mochi-input text-xs w-full font-semibold"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-mochi-text-secondary mb-1">Interest Type</label>
                <select
                  value={interestType}
                  onChange={(e) => setInterestType(e.target.value as 'simple' | 'compound')}
                  className="mochi-input text-xs w-full font-semibold"
                >
                  <option value="simple">Simple Interest</option>
                  <option value="compound">Compound Interest</option>
                </select>
              </div>
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

            <div>
              <label className="block text-xs font-bold text-mochi-text-secondary mb-1">Notes / Terms</label>
              <input
                type="text"
                placeholder="Optional notes or account number"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
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

      {/* Record Payment Modal */}
      <Dialog isOpen={!!payModalDebt} onClose={() => setPayModalDebt(null)} title={`Record Payment for ${payModalDebt?.lender || ''}`}>
        <form onSubmit={handleRecordPaymentSubmit} className="space-y-4">
          <div>
            <p className="text-xs text-mochi-text-muted mb-2">
              Current Remaining Balance: <strong className="text-mochi-error font-bold">{formatCurrency(payModalDebt?.currentBalance || 0)}</strong>
            </p>
            <label className="block text-xs font-bold text-mochi-text-secondary mb-1">Payment Amount (PHP) *</label>
            <input
              type="number"
              placeholder={`Min suggested: ₱${payModalDebt?.minimumPayment || 0}`}
              value={paymentAmount}
              onChange={(e) => setPaymentAmount(e.target.value)}
              className="mochi-input text-xs w-full font-bold"
              autoFocus
            />
          </div>

          <div className="pt-2 flex gap-3">
            <button
              type="button"
              onClick={() => setPayModalDebt(null)}
              className="mochi-btn-secondary text-xs flex-1 py-2.5"
            >
              Cancel
            </button>
            <button type="submit" className="mochi-btn-primary text-xs flex-1 py-2.5 flex items-center justify-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" />
              <span>Submit Payment</span>
            </button>
          </div>
        </form>
      </Dialog>

      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-xl font-bold text-mochi-text">Debt Progress</h1>
          <p className="text-xs text-mochi-text-muted mt-0.5">Let's work together toward financial freedom</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="mochi-btn-primary text-sm flex items-center gap-1.5">
          <Plus className="w-4 h-4" />
          <span>Track Debt</span>
        </button>
      </div>

      {/* Summary Cards */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4" aria-label="Debt Summary">
        <div className="mochi-card flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-mochi-error/10 flex items-center justify-center">
            <TrendingDown className="w-5 h-5 text-mochi-error" />
          </div>
          <div>
            <p className="text-xs text-mochi-text-muted">Remaining Balance</p>
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
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1 ${
                payoffStrategy === 'snowball'
                  ? 'bg-amber-500 text-white shadow-xs'
                  : 'text-mochi-text-muted hover:text-mochi-text'
              }`}
            >
              <Zap className="w-3.5 h-3.5" /> Snowball
            </button>
            <button
              type="button"
              onClick={() => setPayoffStrategy('avalanche')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1 ${
                payoffStrategy === 'avalanche'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'text-mochi-text-muted hover:text-mochi-text'
              }`}
            >
              <Flame className="w-3.5 h-3.5" /> Avalanche
            </button>
          </div>
        </div>
        <p className="text-xs text-mochi-text-secondary leading-relaxed">
          {payoffStrategy === 'snowball'
            ? 'Snowball Strategy prioritizes smallest balances first to build quick psychological momentum and clear small loans rapidly.'
            : `Avalanche Strategy prioritizes highest interest rates first (avg ${totalInterestRateAvg.toFixed(1)}%) to save maximum interest over time.`}
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
              <DebtCard key={debt.id} debt={debt} onPay={(d) => setPayModalDebt(d)} />
            ))}
          </div>
        )}
      </section>
    </motion.div>
  )
}

