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
  Calendar,
  ChevronLeft,
  ChevronRight,
  Clock,
  History,
  Filter,
} from 'lucide-react'
import { useAppStore } from '@/store/appStore'
import { useAuthStore } from '@/store/authStore'
import { useToastStore } from '@/store/toastStore'
import { useWalletStore } from '@/store/walletStore'
import { saveDocToCloud } from '@/services/cloudSync'
import { FIRESTORE_COLLECTIONS } from '@/services/firestoreCollections'
import { formatCurrency, calculateProgress, formatDate, cn } from '@/lib/utils'
import type { Debt, DebtPayment } from '@/types'
import MochiIllustration from '@/components/ui/MochiIllustrations'
import Mascot from '@/components/ui/Mascot'
import Dialog from '@/components/ui/Dialog'
import MochiCategoryVectorSVG from '@/components/ui/MochiCategoryVectorSVG'
import { exportToDeviceCalendar, triggerNativeDeviceNotification } from '@/lib/calendarExport'

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

function DebtCard({
  debt,
  onPay,
  onViewDetails,
}: {
  debt: Debt
  onPay: (debt: Debt, e: React.MouseEvent) => void
  onViewDetails: (debt: Debt) => void
}) {
  const progress = calculateProgress(debt.originalBalance - debt.currentBalance, debt.originalBalance)
  const vectorId = debtTypeVectorIds[debt.type] || 'vault'
  const isOverdue = new Date(debt.dueDate) < new Date()

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      onClick={() => onViewDetails(debt)}
      className="mochi-card relative overflow-hidden cursor-pointer hover:border-mochi-primary/50 transition-all group"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <MochiCategoryVectorSVG id={vectorId} size="sm" />
          <div>
            <h3 className="text-sm font-black text-mochi-text group-hover:text-mochi-primary transition-colors">
              {debt.lender}
            </h3>
            <p className="text-xs font-semibold text-mochi-text-muted">{debtTypeLabels[debt.type] || debt.type}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {debt.durationMonths && (
            <span className="mochi-badge mochi-badge-info flex items-center gap-1 text-[10px] font-bold">
              <Clock className="w-3 h-3" /> {debt.durationMonths} Mo. Term
            </span>
          )}
          {debt.dueDayOfMonth ? (
            <span className="mochi-badge mochi-badge-info flex items-center gap-1 text-[10px] font-bold">
              <CalendarDays className="w-3 h-3" /> Due {debt.dueDayOfMonth}th
            </span>
          ) : isOverdue ? (
            <span className="mochi-badge mochi-badge-error flex items-center gap-1 text-[10px] font-bold">
              <AlertCircle className="w-3 h-3" /> Overdue
            </span>
          ) : (
            <span className="mochi-badge mochi-badge-warning flex items-center gap-1 text-[10px] font-bold">
              <CalendarDays className="w-3 h-3" />
              {formatDate(debt.dueDate)}
            </span>
          )}
        </div>
      </div>

      {/* Balance & Progress */}
      <div className="mb-3">
        <div className="flex justify-between text-xs mb-1">
          <span className="text-mochi-text-secondary font-bold">
            {formatCurrency(debt.originalBalance - debt.currentBalance)} paid
          </span>
          <span className="text-mochi-text-muted font-bold">{formatCurrency(debt.currentBalance)} remaining</span>
        </div>
        <div className="h-2.5 bg-mochi-border/50 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-mochi-error via-mochi-warning to-mochi-success transition-all duration-500"
            style={{ width: `${Math.min(100, progress)}%` }}
          />
        </div>
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-mochi-border/40">
        <div className="flex flex-col text-xs text-mochi-text-muted">
          <div className="flex items-center gap-1.5 font-bold">
            <Percent className="w-3.5 h-3.5 text-mochi-primary" />
            <span>
              {debt.hasInterest ? `${debt.interestRate || 0}% ${debt.interestType || 'simple'}` : 'Zero Interest (0%)'}
            </span>
          </div>
          {debt.totalLumpSum && (
            <span className="text-[10px] text-mochi-text-muted">
              Lump Sum: <strong>{formatCurrency(debt.totalLumpSum)}</strong>
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-[10px] text-mochi-text-muted font-bold">Min / Monthly</p>
            <p className="text-xs font-black text-mochi-error">{formatCurrency(debt.minimumPayment)}</p>
          </div>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              onPay(debt, e)
            }}
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
      <h3 className="text-lg font-bold text-mochi-text mt-3">You're doing amazing!</h3>
      <p className="mt-2 text-sm text-mochi-text-muted max-w-xs font-semibold">
        No debts tracked yet. If you have any, tracking them is the first step to being debt-free.
      </p>
      <p className="text-xs text-mochi-primary mt-1 font-bold flex items-center gap-1 justify-center">
        <Sparkles className="w-3.5 h-3.5" /> Every journey starts with one step
      </p>
    </div>
  )
}

export default function DebtPage() {
  const { debts, addDebt, makeDebtPayment, wallets } = useAppStore()
  const { user } = useAuthStore()
  const [isLoading, setIsLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [payModalDebt, setPayModalDebt] = useState<Debt | null>(null)
  const [selectedDetailsDebt, setSelectedDetailsDebt] = useState<Debt | null>(null)
  const [paymentAmount, setPaymentAmount] = useState('')
  const [selectedWalletId, setSelectedWalletId] = useState('')
  const [paymentNotes, setPaymentNotes] = useState('')

  // History Pagination State
  const [historyPage, setHistoryPage] = useState(1)
  const ITEMS_PER_PAGE = 5

  // Form State
  const [lenderName, setLenderName] = useState('')
  const [balance, setBalance] = useState('')
  const [currentBal, setCurrentBal] = useState('')
  const [debtType, setDebtType] = useState('credit_card')
  const [durationMonths, setDurationMonths] = useState('12')
  const [hasInterest, setHasInterest] = useState(false)
  const [interestRate, setInterestRate] = useState('0')
  const [interestType, setInterestType] = useState<'simple' | 'compound'>('simple')
  const [paymentWalletId, setPaymentWalletId] = useState('')
  const [dueDay, setDueDay] = useState('15')
  const [minPay, setMinPay] = useState('')
  const [notes, setNotes] = useState('')
  const [status, setStatus] = useState<'idle' | 'success'>('idle')

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 500)
    return () => clearTimeout(timer)
  }, [])

  const [activeTab, setActiveTab] = useState<'my_debts' | 'owed_to_me'>('my_debts')

  // People Debt State (Owed to Me)
  const [peopleDebts, setPeopleDebts] = useState<Array<{
    id: string
    borrowerName: string
    reason: string
    totalAmount: number
    principalAmount: number
    interestAmount?: number
    collectedAmount: number
    dueDate?: string
    walletId?: string
    status: 'pending' | 'settled'
    createdAt: string
  }>>(() => {
    try {
      const saved = localStorage.getItem('mochi_people_debts')
      if (!saved) return []
      const parsed = JSON.parse(saved)
      return Array.isArray(parsed)
        ? parsed.filter((d: any) => d.borrowerName !== 'Juan Dela Cruz' && d.id !== 'pd_1')
        : []
    } catch {
      return []
    }
  })

  useEffect(() => {
    localStorage.setItem('mochi_people_debts', JSON.stringify(peopleDebts))
  }, [peopleDebts])

  // Owed To Me Filter State ('all' | 'pending' | 'settled')
  const [owedFilter, setOwedFilter] = useState<'all' | 'pending' | 'settled'>('all')

  const filteredPeopleDebts = useMemo(() => {
    return peopleDebts.filter((pd) => {
      const remaining = pd.totalAmount - pd.collectedAmount
      const isSettled = pd.status === 'settled' || remaining <= 0
      if (owedFilter === 'pending') return !isSettled
      if (owedFilter === 'settled') return isSettled
      return true
    })
  }, [peopleDebts, owedFilter])

  const pendingCount = useMemo(
    () => peopleDebts.filter((pd) => pd.status !== 'settled' && pd.totalAmount - pd.collectedAmount > 0).length,
    [peopleDebts]
  )
  const settledCount = useMemo(
    () => peopleDebts.filter((pd) => pd.status === 'settled' || pd.totalAmount - pd.collectedAmount <= 0).length,
    [peopleDebts]
  )

  // Owed To Me Modal States
  const [isOwedModalOpen, setIsOwedModalOpen] = useState(false)
  const [owedName, setOwedName] = useState('')
  const [owedAmount, setOwedAmount] = useState('')
  const [owedInterest, setOwedInterest] = useState('')
  const [owedReason, setOwedReason] = useState('')
  const [owedDueDate, setOwedDueDate] = useState('')
  const [owedLendWalletId, setOwedLendWalletId] = useState('')

  // Owed Repayment Deposit Modal State
  const [repayModalDebt, setRepayModalDebt] = useState<any | null>(null)
  const [repayAmount, setRepayAmount] = useState('')
  const [repayWalletId, setRepayWalletId] = useState('')

  const handleAddOwedSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const amt = parseFloat(owedAmount)
    if (!owedName.trim() || isNaN(amt) || amt <= 0) return

    const interestVal = parseFloat(owedInterest) || 0
    const totalOwed = amt + interestVal
    const walletId = owedLendWalletId || wallets[0]?.id

    const newOwed = {
      id: `pd_${Date.now()}`,
      userId: user?.id || 'anon',
      borrowerName: owedName.trim(),
      reason: owedReason.trim() || 'Personal Loan',
      totalAmount: totalOwed,
      principalAmount: amt,
      interestAmount: interestVal > 0 ? interestVal : undefined,
      collectedAmount: 0,
      dueDate: owedDueDate || undefined,
      walletId,
      status: 'pending' as const,
      createdAt: new Date().toISOString(),
    }

    setPeopleDebts((prev) => [newOwed, ...prev])

    // Save to Firestore
    try {
      await saveDocToCloud(FIRESTORE_COLLECTIONS.PEOPLE_DEBTS, newOwed)
    } catch (err) {
      console.warn('Firestore sync notice for People Debt:', err)
    }

    // Deduct money from the selected Lend Wallet!
    if (walletId) {
      await useWalletStore.getState().adjustWalletBalance(walletId, -amt)

      // Add Expense Transaction for money lent out
      await useAppStore.getState().addTransaction({
        id: `txn_lend_${Date.now()}`,
        userId: user?.id || 'anon',
        type: 'expense',
        amount: amt,
        currency: 'PHP',
        categoryId: 'other',
        walletId,
        merchant: `Lent to ${owedName.trim()}`,
        paymentMethod: 'cash',
        date: new Date().toISOString().split('T')[0],
        notes: `Money lent out: ${owedReason.trim() || 'Personal Loan'}`,
        isFavorite: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
    }

    if (owedDueDate) {
      triggerNativeDeviceNotification(
        'Debt Collection Reminder Set',
        `Reminder scheduled for ${owedName} (${formatCurrency(totalOwed)}) due on ${owedDueDate}.`
      )
    }

    useToastStore.getState().success(
      `Lent ${formatCurrency(amt)} to ${owedName}! Balance updated.`,
      'Owed to Me'
    )
    setIsOwedModalOpen(false)
    setOwedName('')
    setOwedAmount('')
    setOwedInterest('')
    setOwedReason('')
    setOwedDueDate('')
  }

  const handleLogOwedRepayment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!repayModalDebt) return
    const amt = parseFloat(repayAmount)
    if (isNaN(amt) || amt <= 0) return

    const wallet = wallets.find((w) => w.id === repayWalletId) || wallets[0]

    const updatedDebts = peopleDebts.map((d) => {
      if (d.id !== repayModalDebt.id) return d
      const newCollected = d.collectedAmount + amt
      const isFullyPaid = newCollected >= d.totalAmount
      return {
        ...d,
        collectedAmount: newCollected,
        status: isFullyPaid ? ('settled' as const) : ('pending' as const),
      }
    })

    setPeopleDebts(updatedDebts)

    const updatedItem = updatedDebts.find((d) => d.id === repayModalDebt.id)
    if (updatedItem) {
      try {
        await saveDocToCloud(FIRESTORE_COLLECTIONS.PEOPLE_DEBTS, {
          ...updatedItem,
          userId: user?.id || 'anon',
        })
      } catch (err) {
        console.warn('Firestore sync notice for repayment:', err)
      }
    }

    // Deposit income transaction into selected wallet
    await useAppStore.getState().addTransaction({
      id: `txn_repay_${Date.now()}`,
      userId: user?.id || 'anon',
      type: 'income',
      amount: amt,
      currency: 'PHP',
      categoryId: 'debt_collection',
      walletId: wallet?.id,
      merchant: `Collection from ${repayModalDebt.borrowerName}`,
      paymentMethod: 'cash',
      date: new Date().toISOString().split('T')[0],
      notes: `Repayment for ${repayModalDebt.reason}`,
      isFavorite: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })

    useToastStore.getState().success(
      `Collected ${formatCurrency(amt)} from ${repayModalDebt.borrowerName}! Deposited to ${wallet?.name || 'Wallet'}.`,
      'Payment Logged'
    )
    setRepayModalDebt(null)
    setRepayAmount('')
  }

  const handleCopyReminder = (d: any) => {
    const remaining = d.totalAmount - d.collectedAmount
    const text = `Hi ${d.borrowerName}! Friendly reminder regarding the ${d.reason} (${formatCurrency(remaining)} remaining). You can send via GCash/Bank when ready. Thank you!`
    navigator.clipboard.writeText(text)
    useToastStore.getState().success(`Reminder copied to clipboard for ${d.borrowerName}!`, 'One-Tap Reminder')
    triggerNativeDeviceNotification('Reminder Copied', text)
  }

  const [payoffStrategy, setPayoffStrategy] = useState<'snowball' | 'avalanche'>('snowball')

  // Live Lump Sum & Monthly Computation in Form
  const calculatedLumpSum = useMemo(() => {
    const orig = parseFloat(balance) || 0
    const months = parseInt(durationMonths, 10) || 12
    const rate = hasInterest ? parseFloat(interestRate) || 0 : 0
    if (orig <= 0) return 0
    if (!hasInterest || rate <= 0) return orig
    const years = months / 12

    if (interestType === 'compound') {
      const monthlyRate = (rate / 100) / 12
      return orig * Math.pow(1 + monthlyRate, months)
    } else {
      return orig + orig * (rate / 100) * years
    }
  }, [balance, durationMonths, hasInterest, interestRate, interestType])

  const calculatedMonthly = useMemo(() => {
    const months = parseInt(durationMonths, 10) || 12
    return months > 0 ? calculatedLumpSum / months : 0
  }, [calculatedLumpSum, durationMonths])

  const sortedDebts = useMemo(() => {
    return [...debts].sort((a, b) => {
      if (payoffStrategy === 'snowball') {
        return a.currentBalance - b.currentBalance
      } else {
        return (b.interestRate || 0) - (a.interestRate || 0)
      }
    })
  }, [debts, payoffStrategy])

  // My Debts Metrics
  const totalDebt = debts.reduce((sum, d) => sum + d.currentBalance, 0)
  const totalMonthly = debts.reduce((sum, d) => sum + d.minimumPayment, 0)
  const totalOriginal = debts.reduce((sum, d) => sum + d.originalBalance, 0)
  const totalPaid = totalOriginal - totalDebt
  const debtFreeMonths = totalMonthly > 0 ? Math.ceil(totalDebt / totalMonthly) : 0
  const debtFreeDate = new Date(Date.now() + debtFreeMonths * 30 * 86400000)

  // Owed To Me Metrics
  const totalOwedToYou = peopleDebts.reduce((sum, d) => sum + (d.totalAmount - d.collectedAmount), 0)
  const totalCollectedFromPeople = peopleDebts.reduce((sum, d) => sum + d.collectedAmount, 0)
  const totalOwedOriginal = peopleDebts.reduce((sum, d) => sum + d.totalAmount, 0)
  const owedCollectionProgress = totalOwedOriginal > 0 ? Math.round((totalCollectedFromPeople / totalOwedOriginal) * 100) : 100
  const upcomingDueDebts = peopleDebts.filter((d) => d.dueDate && d.status !== 'settled').sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime())
  const nextOwedDueDate = upcomingDueDebts[0]?.dueDate

  const handleAddDebtSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const origBal = parseFloat(balance)
    if (!lenderName.trim() || isNaN(origBal) || origBal <= 0) return

    const curr = currentBal ? parseFloat(currentBal) : origBal
    const months = parseInt(durationMonths, 10) || 12
    const rate = hasInterest ? parseFloat(interestRate) || 0 : 0
    const day = parseInt(dueDay, 10) || 15
    const walletId = paymentWalletId || wallets[0]?.id

    const newDebt: Debt = {
      id: `debt_${Date.now()}`,
      userId: user?.id || 'anon',
      lender: lenderName.trim(),
      type: debtType as any,
      originalBalance: origBal,
      currentBalance: curr,
      hasInterest,
      interestRate: rate,
      interestType,
      durationMonths: months,
      totalLumpSum: calculatedLumpSum,
      monthlyAmortization: calculatedMonthly,
      paymentWalletId: walletId,
      dueDate: new Date(Date.now() + 30 * 86400000).toISOString(),
      dueDayOfMonth: day,
      minimumPayment: minPay ? parseFloat(minPay) : Math.round(calculatedMonthly || origBal * 0.05),
      schedule: [],
      payments: [],
      notes: notes.trim() || undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    addDebt(newDebt)
    triggerNativeDeviceNotification('New Debt Tracked', `Added ${lenderName} (${formatCurrency(origBal)})`)
    setStatus('success')

    setTimeout(() => {
      setStatus('idle')
      setLenderName('')
      setBalance('')
      setCurrentBal('')
      setMinPay('')
      setNotes('')
      setHasInterest(false)
      setIsModalOpen(false)
    }, 1200)
  }

  const handleRecordPaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!payModalDebt) return
    const amt = parseFloat(paymentAmount)
    if (isNaN(amt) || amt <= 0) return

    const walletId = selectedWalletId || payModalDebt.paymentWalletId || wallets[0]?.id
    await makeDebtPayment(payModalDebt.id, amt, walletId, paymentNotes)

    triggerNativeDeviceNotification(
      'Debt Payment Processed',
      `Paid ${formatCurrency(amt)} toward ${payModalDebt.lender}. Balance auto-deducted.`
    )

    setPayModalDebt(null)
    setPaymentAmount('')
    setPaymentNotes('')
  }

  // History Pagination Helpers
  const currentPayments = selectedDetailsDebt?.payments || []
  const totalHistoryPages = Math.ceil(currentPayments.length / ITEMS_PER_PAGE) || 1
  const paginatedHistory = currentPayments.slice(
    (historyPage - 1) * ITEMS_PER_PAGE,
    historyPage * ITEMS_PER_PAGE
  )

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
            <p className="text-xs text-mochi-text-secondary font-semibold">Track your payoff progress with Debt Snowball/Avalanche.</p>
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
                <label className="block text-xs font-bold text-mochi-text-secondary mb-1">Original Principal (PHP) *</label>
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
                  placeholder="Empty if same as principal"
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
                <label className="block text-xs font-bold text-mochi-text-secondary mb-1">Duration / Months Term</label>
                <input
                  type="number"
                  min="1"
                  max="360"
                  placeholder="e.g. 12"
                  value={durationMonths}
                  onChange={(e) => setDurationMonths(e.target.value)}
                  className="mochi-input text-xs w-full font-bold"
                />
              </div>
            </div>

            {/* Interest Rate Toggle */}
            <div className="p-3 bg-mochi-surface-alt/60 rounded-2xl border border-mochi-border/60 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-mochi-text flex items-center gap-1.5">
                  <Percent className="w-4 h-4 text-mochi-primary" /> Apply Interest Rate?
                </span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hasInterest}
                    onChange={(e) => setHasInterest(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-mochi-border rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-mochi-primary" />
                </label>
              </div>

              {hasInterest && (
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-mochi-border/40">
                  <div>
                    <label className="block text-[11px] font-bold text-mochi-text-secondary mb-1">Annual Rate (%)</label>
                    <input
                      type="number"
                      step="0.1"
                      placeholder="e.g. 5.0"
                      value={interestRate}
                      onChange={(e) => setInterestRate(e.target.value)}
                      className="mochi-input text-xs w-full font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-mochi-text-secondary mb-1">Interest Type</label>
                    <select
                      value={interestType}
                      onChange={(e) => setInterestType(e.target.value as 'simple' | 'compound')}
                      className="mochi-input text-xs w-full font-semibold"
                    >
                      <option value="simple">Simple</option>
                      <option value="compound">Compound</option>
                    </select>
                  </div>
                </div>
              )}

              {/* Live Computation Preview */}
              <div className="pt-2 flex justify-between items-center text-xs border-t border-mochi-border/40">
                <span className="text-mochi-text-muted font-medium">Final Lump Sum Computation:</span>
                <strong className="text-mochi-primary font-black">{formatCurrency(calculatedLumpSum)}</strong>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-bold text-mochi-text-secondary mb-1">Payment Wallet</label>
                <select
                  value={paymentWalletId}
                  onChange={(e) => setPaymentWalletId(e.target.value)}
                  className="mochi-input text-xs w-full font-semibold"
                >
                  {wallets.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.name}
                    </option>
                  ))}
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

            <div>
              <label className="block text-xs font-bold text-mochi-text-secondary mb-1">Monthly Payment (PHP)</label>
              <input
                type="number"
                placeholder={`Suggested: ₱${Math.round(calculatedMonthly || 0).toLocaleString()}`}
                value={minPay}
                onChange={(e) => setMinPay(e.target.value)}
                className="mochi-input text-xs w-full font-bold"
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
                className="mochi-btn-secondary text-xs flex-1 py-2.5 font-bold"
              >
                Cancel
              </button>
              <button type="submit" className="mochi-btn-primary text-xs flex-1 py-2.5 font-bold">
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
            <p className="text-xs text-mochi-text-muted mb-2 font-medium">
              Current Remaining Balance: <strong className="text-mochi-error font-black">{formatCurrency(payModalDebt?.currentBalance || 0)}</strong>
            </p>

            <label className="block text-xs font-bold text-mochi-text-secondary mb-1">Payment Amount (PHP) *</label>
            <input
              type="number"
              placeholder={`Min suggested: ₱${payModalDebt?.minimumPayment || 0}`}
              value={paymentAmount}
              onChange={(e) => setPaymentAmount(e.target.value)}
              className="mochi-input text-xs w-full font-bold mb-3"
              autoFocus
            />

            <label className="block text-xs font-bold text-mochi-text-secondary mb-1">Select Wallet for Payment *</label>
            <select
              value={selectedWalletId || payModalDebt?.paymentWalletId || wallets[0]?.id || ''}
              onChange={(e) => setSelectedWalletId(e.target.value)}
              className="mochi-input text-xs w-full font-bold mb-3"
            >
              {wallets.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.name}
                </option>
              ))}
            </select>

            <label className="block text-xs font-bold text-mochi-text-secondary mb-1">Payment Notes (Optional)</label>
            <input
              type="text"
              placeholder="e.g. Monthly installment payment"
              value={paymentNotes}
              onChange={(e) => setPaymentNotes(e.target.value)}
              className="mochi-input text-xs w-full font-medium"
            />
          </div>

          <div className="pt-2 flex gap-3">
            <button
              type="button"
              onClick={() => setPayModalDebt(null)}
              className="mochi-btn-secondary text-xs flex-1 py-2.5 font-bold"
            >
              Cancel
            </button>
            <button type="submit" className="mochi-btn-primary text-xs flex-1 py-2.5 flex items-center justify-center gap-1.5 font-bold">
              <CheckCircle2 className="w-4 h-4" />
              <span>Submit & Deduct</span>
            </button>
          </div>
        </form>
      </Dialog>

      {/* Debt Details & Payment History Modal with 5-Item Pagination */}
      <Dialog
        isOpen={!!selectedDetailsDebt}
        onClose={() => {
          setSelectedDetailsDebt(null)
          setHistoryPage(1)
        }}
        title={`${selectedDetailsDebt?.lender || 'Debt'} Details & History`}
      >
        {selectedDetailsDebt && (
          <div className="space-y-4">
            {/* Overview Summary */}
            <div className="p-4 rounded-2xl bg-mochi-surface-alt/60 border border-mochi-border/60 space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-mochi-text-muted font-medium">Original Principal:</span>
                <strong className="text-mochi-text font-bold">{formatCurrency(selectedDetailsDebt.originalBalance)}</strong>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-mochi-text-muted font-medium">Remaining Balance:</span>
                <strong className="text-mochi-error font-black">{formatCurrency(selectedDetailsDebt.currentBalance)}</strong>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-mochi-text-muted font-medium">Term Duration:</span>
                <strong className="text-mochi-text font-bold">{selectedDetailsDebt.durationMonths || 12} Months</strong>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-mochi-text-muted font-medium">Total Lump Sum:</span>
                <strong className="text-mochi-primary font-black">{formatCurrency(selectedDetailsDebt.totalLumpSum || selectedDetailsDebt.originalBalance)}</strong>
              </div>
              <div className="flex justify-between items-center text-xs pt-2 border-t border-mochi-border/40">
                <span className="text-mochi-text-muted font-medium">Assigned Payment Wallet:</span>
                <strong className="text-mochi-text font-bold">
                  {wallets.find((w) => w.id === selectedDetailsDebt.paymentWalletId)?.name || 'Cash Wallet'}
                </strong>
              </div>
            </div>

            {/* Action Toolbar */}
            <div className="flex gap-2">
              <button
                onClick={() => {
                  exportToDeviceCalendar({
                    title: `Debt Due: ${selectedDetailsDebt.lender}`,
                    amount: selectedDetailsDebt.minimumPayment,
                    date: selectedDetailsDebt.dueDate?.split('T')[0] || new Date().toISOString().split('T')[0],
                    description: `Monthly payment of ₱${selectedDetailsDebt.minimumPayment.toLocaleString()} for ${selectedDetailsDebt.lender}`,
                  })
                  triggerNativeDeviceNotification('Calendar Event Downloaded', `Exported iCal event for ${selectedDetailsDebt.lender}`)
                }}
                className="mochi-btn-secondary text-xs flex-1 py-2 px-3 flex items-center justify-center gap-1.5 font-bold"
              >
                <Calendar className="w-3.5 h-3.5 text-mochi-primary" /> Sync to Device Calendar
              </button>
            </div>

            {/* Payment History Table */}
            <div>
              <h4 className="text-xs font-bold text-mochi-text flex items-center gap-1.5 mb-2">
                <History className="w-4 h-4 text-mochi-primary" /> Payment History ({currentPayments.length} records)
              </h4>

              {currentPayments.length === 0 ? (
                <div className="p-4 rounded-xl bg-mochi-surface-alt/40 text-center text-xs text-mochi-text-muted font-medium">
                  No payment records logged yet.
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="divide-y divide-mochi-border/40 border border-mochi-border/60 rounded-xl overflow-hidden">
                    {paginatedHistory.map((pmt: DebtPayment) => (
                      <div key={pmt.id} className="p-2.5 flex items-center justify-between text-xs bg-mochi-surface">
                        <div>
                          <p className="font-bold text-mochi-text">{formatCurrency(pmt.amount)}</p>
                          <p className="text-[10px] text-mochi-text-muted">
                            {formatDate(pmt.date)} • {pmt.notes || 'Direct Payment'}
                          </p>
                        </div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                          Paid
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Pagination Controls */}
                  {totalHistoryPages > 1 && (
                    <div className="flex items-center justify-between pt-2">
                      <span className="text-[11px] text-mochi-text-muted font-bold">
                        Page {historyPage} of {totalHistoryPages}
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setHistoryPage((p) => Math.max(1, p - 1))}
                          disabled={historyPage === 1}
                          className="p-1 rounded-lg border border-mochi-border hover:bg-mochi-surface-alt disabled:opacity-40"
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setHistoryPage((p) => Math.min(totalHistoryPages, p + 1))}
                          disabled={historyPage === totalHistoryPages}
                          className="p-1 rounded-lg border border-mochi-border hover:bg-mochi-surface-alt disabled:opacity-40"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </Dialog>

      {/* Page Header */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <h1 className="text-xl font-black text-mochi-text">Debt & Collection Hub</h1>
          <p className="text-xs text-mochi-text-muted mt-0.5 font-semibold">Track what you owe and money owed to you</p>
        </div>
        {activeTab === 'my_debts' ? (
          <button onClick={() => setIsModalOpen(true)} className="mochi-btn-primary text-xs sm:text-sm flex items-center gap-1.5 font-bold shadow-md">
            <Plus className="w-4 h-4" />
            <span>Track Debt</span>
          </button>
        ) : (
          <button onClick={() => setIsOwedModalOpen(true)} className="mochi-btn-primary text-xs sm:text-sm bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1.5 font-bold shadow-md">
            <Plus className="w-4 h-4" />
            <span>Add Owed to Me</span>
          </button>
        )}
      </div>

      {/* Primary Tab Switcher: My Debts vs Owed to Me */}
      <div className="p-1 bg-mochi-surface-alt rounded-2xl border border-mochi-border grid grid-cols-2 gap-1 mb-4">
        <button
          onClick={() => setActiveTab('my_debts')}
          className={cn(
            'py-2.5 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 cursor-pointer',
            activeTab === 'my_debts'
              ? 'bg-mochi-surface text-mochi-primary shadow-xs border border-mochi-border'
              : 'text-mochi-text-muted hover:text-mochi-text'
          )}
        >
          <CreditCard className="w-4 h-4" /> My Debts ({debts.length})
        </button>
        <button
          onClick={() => setActiveTab('owed_to_me')}
          className={cn(
            'py-2.5 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 cursor-pointer',
            activeTab === 'owed_to_me'
              ? 'bg-mochi-surface text-emerald-600 dark:text-emerald-400 shadow-xs border border-mochi-border'
              : 'text-mochi-text-muted hover:text-mochi-text'
          )}
        >
          <DollarSign className="w-4 h-4 text-emerald-500" /> Owed to Me ({peopleDebts.length})
        </button>
      </div>

      {/* 2x2 Metric Grid */}
      <section className="grid grid-cols-2 gap-3 mb-4" aria-label="Debt Metrics 2x2 Grid">
        {activeTab === 'my_debts' ? (
          <>
            <div className="mochi-card flex flex-col justify-between p-3.5 border border-mochi-border/70">
              <div className="flex items-center gap-1.5">
                <TrendingDown className="w-4 h-4 text-mochi-error shrink-0" />
                <span className="text-[11px] font-extrabold text-mochi-text-muted">Remaining Balance</span>
              </div>
              <p className="text-base sm:text-lg font-black text-mochi-error mt-2">{formatCurrency(totalDebt)}</p>
            </div>

            <div className="mochi-card flex flex-col justify-between p-3.5 border border-mochi-border/70">
              <div className="flex items-center gap-1.5">
                <CreditCard className="w-4 h-4 text-mochi-warning shrink-0" />
                <span className="text-[11px] font-extrabold text-mochi-text-muted">Monthly Payments</span>
              </div>
              <p className="text-base sm:text-lg font-black text-mochi-text mt-2">{formatCurrency(totalMonthly)}</p>
            </div>

            <div className="mochi-card flex flex-col justify-between p-3.5 border border-mochi-border/70">
              <div className="flex items-center gap-1.5">
                <CalendarDays className="w-4 h-4 text-mochi-success shrink-0" />
                <span className="text-[11px] font-extrabold text-mochi-text-muted">Debt-Free Date</span>
              </div>
              <p className="text-base sm:text-lg font-black text-mochi-success mt-2">
                {debtFreeMonths > 0 ? debtFreeDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'Free!'}
              </p>
            </div>

            <div className="mochi-card flex flex-col justify-between p-3.5 border border-mochi-border/70">
              <div className="flex items-center gap-1.5">
                <Target className="w-4 h-4 text-mochi-primary shrink-0" />
                <span className="text-[11px] font-extrabold text-mochi-text-muted">Payoff Progress</span>
              </div>
              <p className="text-base sm:text-lg font-black text-mochi-primary mt-2">
                {totalOriginal > 0 ? `${((totalPaid / totalOriginal) * 100).toFixed(0)}%` : '100%'}
              </p>
            </div>
          </>
        ) : (
          <>
            <div className="mochi-card flex flex-col justify-between p-3.5 border border-mochi-border/70">
              <div className="flex items-center gap-1.5">
                <TrendingDown className="w-4 h-4 text-emerald-500 shrink-0" />
                <span className="text-[11px] font-extrabold text-mochi-text-muted">Total Owed to You</span>
              </div>
              <p className="text-base sm:text-lg font-black text-emerald-600 dark:text-emerald-400 mt-2">{formatCurrency(totalOwedToYou)}</p>
            </div>

            <div className="mochi-card flex flex-col justify-between p-3.5 border border-mochi-border/70">
              <div className="flex items-center gap-1.5">
                <DollarSign className="w-4 h-4 text-amber-500 shrink-0" />
                <span className="text-[11px] font-extrabold text-mochi-text-muted">Collected So Far</span>
              </div>
              <p className="text-base sm:text-lg font-black text-amber-600 dark:text-amber-400 mt-2">{formatCurrency(totalCollectedFromPeople)}</p>
            </div>

            <div className="mochi-card flex flex-col justify-between p-3.5 border border-mochi-border/70">
              <div className="flex items-center gap-1.5">
                <CalendarDays className="w-4 h-4 text-sky-500 shrink-0" />
                <span className="text-[11px] font-extrabold text-mochi-text-muted">Next Due Date</span>
              </div>
              <p className="text-base sm:text-lg font-black text-sky-600 dark:text-sky-400 mt-2">
                {nextOwedDueDate ? formatDate(nextOwedDueDate) : 'None Set'}
              </p>
            </div>

            <div className="mochi-card flex flex-col justify-between p-3.5 border border-mochi-border/70">
              <div className="flex items-center gap-1.5">
                <Target className="w-4 h-4 text-mochi-primary shrink-0" />
                <span className="text-[11px] font-extrabold text-mochi-text-muted">Collection Progress</span>
              </div>
              <p className="text-base sm:text-lg font-black text-mochi-primary mt-2">
                {owedCollectionProgress}%
              </p>
            </div>
          </>
        )}
      </section>

      {/* Debt Payoff Progress Milestones Banner (Enhanced & Zero Emojis) */}
      {debts.length > 0 && (() => {
        const totalOrig = debts.reduce((sum, d) => sum + (d.originalBalance || d.currentBalance || 1), 0)
        const totalCurr = debts.reduce((sum, d) => sum + (d.currentBalance || 0), 0)
        const paidTotal = Math.max(0, totalOrig - totalCurr)
        const progressPct = Math.min(100, Math.round((paidTotal / totalOrig) * 100))

        const mascotMood = progressPct >= 100 ? 'celebrating' : progressPct >= 50 ? 'excited' : 'working'

        // 5 Step Milestones (e.g. 100%, 75%, 50%, 25%, 0% remaining)
        const milestoneSteps = [
          { label: `₱${(totalOrig).toLocaleString()}`, pct: 0, title: 'Start' },
          { label: `₱${(totalOrig * 0.75).toLocaleString()}`, pct: 25, title: '25% Paid' },
          { label: `₱${(totalOrig * 0.5).toLocaleString()}`, pct: 50, title: 'Halfway' },
          { label: `₱${(totalOrig * 0.25).toLocaleString()}`, pct: 75, title: '75% Paid' },
          { label: '₱0 Paid Off', pct: 100, title: 'Debt Free' },
        ]

        return (
          <section className="p-5 rounded-3xl bg-gradient-to-br from-amber-500/15 via-rose-500/10 to-mochi-primary/15 border border-amber-500/30 shadow-md space-y-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-mochi-surface flex items-center justify-center shadow-md border border-mochi-border shrink-0">
                  <Mascot size="sm" mood={mascotMood} animate={true} />
                </div>
                <div>
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span className="text-[10px] font-black uppercase tracking-wider text-amber-600 dark:text-amber-400 bg-amber-500/20 px-2 py-0.5 rounded-full">
                      Payoff Milestones
                    </span>
                    <span className="text-xs font-black text-mochi-text">{progressPct}% Paid Off</span>
                  </div>
                  <h4 className="text-sm font-black text-mochi-text">
                    Debt Payoff Journey: ₱{totalOrig.toLocaleString()} ➔ ₱{totalCurr.toLocaleString()} Remaining
                  </h4>
                </div>
              </div>

              <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-black text-sm shrink-0 bg-emerald-500/15 px-3 py-1.5 rounded-2xl border border-emerald-500/30">
                <Sparkles className="w-4 h-4 animate-pulse text-emerald-500" />
                <span>{formatCurrency(paidTotal)} Paid</span>
              </div>
            </div>

            {/* Visual Step Checkpoints Bar */}
            <div className="space-y-1.5 pt-1">
              <div className="h-2.5 rounded-full bg-mochi-surface border border-mochi-border overflow-hidden p-0.5">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-amber-500 via-rose-500 to-emerald-500 transition-all duration-500"
                  style={{ width: `${progressPct}%` }}
                />
              </div>

              <div className="grid grid-cols-5 gap-1 text-center pt-1">
                {milestoneSteps.map((step) => {
                  const isPassed = progressPct >= step.pct
                  return (
                    <div key={step.pct} className="space-y-0.5">
                      <div
                        className={cn(
                          'w-2 h-2 rounded-full mx-auto transition-all',
                          isPassed ? 'bg-emerald-500 ring-2 ring-emerald-500/30' : 'bg-mochi-border'
                        )}
                      />
                      <p className={cn('text-[9px] font-black truncate', isPassed ? 'text-mochi-text' : 'text-mochi-text-muted')}>
                        {step.title}
                      </p>
                      <p className="text-[8px] font-extrabold text-mochi-text-muted truncate">{step.label}</p>
                    </div>
                  )
                })}
              </div>
            </div>
          </section>
        )
      })()}

      {/* Main Tab Content */}
      {activeTab === 'my_debts' ? (
        <section aria-label="Debts List" className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-black text-mochi-text-secondary uppercase tracking-wide">
              Your Debts ({sortedDebts.length})
            </h2>
            <div className="flex items-center gap-1 bg-mochi-surface-alt p-1 rounded-xl border border-mochi-border text-[10px]">
              <button
                type="button"
                onClick={() => setPayoffStrategy('snowball')}
                className={cn(
                  'px-2 py-0.5 rounded-lg font-bold transition-all',
                  payoffStrategy === 'snowball' ? 'bg-amber-500 text-white' : 'text-mochi-text-muted'
                )}
              >
                Snowball
              </button>
              <button
                type="button"
                onClick={() => setPayoffStrategy('avalanche')}
                className={cn(
                  'px-2 py-0.5 rounded-lg font-bold transition-all',
                  payoffStrategy === 'avalanche' ? 'bg-purple-600 text-white' : 'text-mochi-text-muted'
                )}
              >
                Avalanche
              </button>
            </div>
          </div>

          {sortedDebts.length === 0 ? (
            <EmptyDebts />
          ) : (
            <div className="grid gap-3">
              {sortedDebts.map((debt) => (
                <DebtCard
                  key={debt.id}
                  debt={debt}
                  onPay={(d, e) => {
                    e.stopPropagation()
                    setPayModalDebt(d)
                  }}
                  onViewDetails={(d) => {
                    setSelectedDetailsDebt(d)
                    setHistoryPage(1)
                  }}
                />
              ))}
            </div>
          )}
        </section>
      ) : (
        /* Owed to Me Section */
        <section aria-label="Owed to Me List" className="space-y-3">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-xs font-black text-mochi-text-secondary uppercase tracking-wide">
              Debts Owed to You ({filteredPeopleDebts.length})
            </h2>
            <div className="flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5 text-mochi-text-muted shrink-0" />
              <select
                value={owedFilter}
                onChange={(e) => setOwedFilter(e.target.value as any)}
                className="mochi-input text-[11px] font-extrabold py-1 px-2 rounded-xl border border-mochi-border/80 bg-mochi-surface-alt/70 text-mochi-text shadow-2xs cursor-pointer"
              >
                <option value="all">All Debts ({peopleDebts.length})</option>
                <option value="pending">Pending ({pendingCount})</option>
                <option value="settled">Fully Settled ({settledCount})</option>
              </select>
            </div>
          </div>

          {filteredPeopleDebts.length === 0 ? (
            <div className="mochi-card text-center py-12 space-y-2">
              <Sparkles className="w-8 h-8 text-emerald-500 mx-auto" />
              <h3 className="text-sm font-bold text-mochi-text">
                {owedFilter === 'settled'
                  ? 'No fully settled debts yet'
                  : owedFilter === 'pending'
                  ? 'No pending debt collections'
                  : 'No money owed to you right now'}
              </h3>
              <p className="text-xs text-mochi-text-muted">Keep track of money lent to friends or split bills effortlessly.</p>
              <button onClick={() => setIsOwedModalOpen(true)} className="mochi-btn-primary text-xs mt-2 font-bold inline-flex items-center gap-1">
                <Plus className="w-3.5 h-3.5" /> Add Money Owed to You
              </button>
            </div>
          ) : (
            <div className="grid gap-3">
              {filteredPeopleDebts.map((pd) => {
                const remaining = pd.totalAmount - pd.collectedAmount
                const progress = Math.min(100, Math.round((pd.collectedAmount / pd.totalAmount) * 100))
                const isSettled = pd.status === 'settled' || remaining <= 0

                return (
                  <div key={pd.id} className="mochi-card space-y-3 border border-mochi-border hover:border-emerald-500/40 transition-all">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-sm font-black text-mochi-text">{pd.borrowerName}</h3>
                        <p className="text-xs font-bold text-mochi-text-muted">{pd.reason}</p>
                      </div>
                      <span className={cn(
                        'text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full border',
                        isSettled
                          ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                          : 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30'
                      )}>
                        {isSettled ? 'Fully Settled' : 'Pending Collection'}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-xs font-bold">
                        <span className="text-emerald-600 dark:text-emerald-400">{formatCurrency(pd.collectedAmount)} collected</span>
                        <span className="text-mochi-text-muted">{formatCurrency(remaining)} remaining</span>
                      </div>
                      <div className="h-2 rounded-full bg-mochi-border/60 overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-500"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-mochi-border/60 text-xs">
                      {pd.dueDate ? (
                        <span className="text-[11px] font-bold text-sky-600 dark:text-sky-400 flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" /> Due {formatDate(pd.dueDate)}
                        </span>
                      ) : (
                        <span className="text-[11px] text-mochi-text-muted">No due date</span>
                      )}

                      <div className="flex items-center gap-2">
                        {!isSettled && (
                          <button
                            type="button"
                            onClick={() => handleCopyReminder(pd)}
                            className="px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-300 font-extrabold text-xs transition-colors flex items-center gap-1 border border-amber-500/30 cursor-pointer"
                            title="Copy polite SMS / chat reminder"
                          >
                            <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Reminder
                          </button>
                        )}
                        {!isSettled && (
                          <button
                            type="button"
                            onClick={() => {
                              setRepayModalDebt(pd)
                              setRepayAmount(String(remaining))
                            }}
                            className="mochi-btn-primary text-xs py-1.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-xl shadow-xs cursor-pointer"
                          >
                            Log
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </section>
      )}

      {/* Add Owed to Me Modal */}
      <Dialog isOpen={isOwedModalOpen} onClose={() => setIsOwedModalOpen(false)} title="Add Debt Owed to You">
        <form onSubmit={handleAddOwedSubmit} className="space-y-3">
          <div>
            <label className="block text-xs font-bold text-mochi-text-secondary mb-1">Person / Borrower Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Juan Dela Cruz, Maria Santos"
              value={owedName}
              onChange={(e) => setOwedName(e.target.value)}
              className="mochi-input text-xs w-full font-bold"
              autoFocus
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-bold text-mochi-text-secondary mb-1">Amount Lent (PHP) *</label>
              <input
                type="number"
                required
                step="any"
                min="1"
                placeholder="e.g. 3500"
                value={owedAmount}
                onChange={(e) => setOwedAmount(e.target.value)}
                className="mochi-input text-xs w-full font-bold"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-mochi-text-secondary mb-1">Interest / Fee (PHP)</label>
              <input
                type="number"
                step="any"
                min="0"
                placeholder="e.g. 200 (Optional)"
                value={owedInterest}
                onChange={(e) => setOwedInterest(e.target.value)}
                className="mochi-input text-xs w-full font-semibold"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-bold text-mochi-text-secondary mb-1">Lend From Wallet *</label>
              <select
                value={owedLendWalletId || wallets[0]?.id || ''}
                onChange={(e) => setOwedLendWalletId(e.target.value)}
                className="mochi-input text-xs w-full font-bold"
              >
                {wallets.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.name} ({formatCurrency(w.balance, w.currency)})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-mochi-text-secondary mb-1">Due Date (Self Reminder)</label>
              <input
                type="date"
                value={owedDueDate}
                onChange={(e) => setOwedDueDate(e.target.value)}
                className="mochi-input text-xs w-full font-semibold"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-mochi-text-secondary mb-1">Reason / Description</label>
            <input
              type="text"
              placeholder="e.g. Boracay Trip Dinner, Concert Ticket"
              value={owedReason}
              onChange={(e) => setOwedReason(e.target.value)}
              className="mochi-input text-xs w-full font-semibold"
            />
          </div>

          <div className="pt-2 flex gap-3">
            <button
              type="button"
              onClick={() => setIsOwedModalOpen(false)}
              className="mochi-btn-secondary text-xs flex-1 py-2.5 font-bold"
            >
              Cancel
            </button>
            <button type="submit" className="mochi-btn-primary text-xs flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold">
              Add Record
            </button>
          </div>
        </form>
      </Dialog>

      {/* Log Repayment Modal */}
      <Dialog isOpen={!!repayModalDebt} onClose={() => setRepayModalDebt(null)} title={`Log Collection from ${repayModalDebt?.borrowerName || ''}`}>
        {repayModalDebt && (
          <form onSubmit={handleLogOwedRepayment} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-mochi-text-secondary mb-1">Collection Amount (PHP) *</label>
              <input
                type="number"
                required
                step="any"
                min="1"
                placeholder="0.00"
                value={repayAmount}
                onChange={(e) => setRepayAmount(e.target.value)}
                className="mochi-input text-lg font-black text-emerald-600 w-full"
                autoFocus
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-mochi-text-secondary mb-1">Deposit Into Wallet</label>
              <select
                value={repayWalletId || wallets[0]?.id || ''}
                onChange={(e) => setRepayWalletId(e.target.value)}
                className="mochi-input text-xs w-full font-bold"
              >
                {wallets.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.name} ({formatCurrency(w.balance, w.currency)})
                  </option>
                ))}
              </select>
            </div>

            <div className="pt-2 flex gap-3">
              <button
                type="button"
                onClick={() => setRepayModalDebt(null)}
                className="mochi-btn-secondary text-xs flex-1 py-2.5 font-bold"
              >
                Cancel
              </button>
              <button type="submit" className="mochi-btn-primary text-xs flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold">
                Log Repayment
              </button>
            </div>
          </form>
        )}
      </Dialog>
    </motion.div>
  )
}
