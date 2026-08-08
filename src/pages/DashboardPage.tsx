import { useState, useEffect, useMemo, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Plus,
  PiggyBank,
  CreditCard,
  ArrowDownLeft,
  ArrowUpRight,
  Calendar,
  Users,
  Wallet,
  ChevronRight,
  Trophy,
  Zap,
  CheckCircle2,
  Star,
  Sparkles,
  Check,
  Bell,
  Sun,
  Sunset,
  Moon,
  Eye,
  EyeOff,
  LayoutDashboard,
  X,
} from 'lucide-react'
import ProgressRing from '@/components/ui/ProgressRing'
import Mascot from '@/components/ui/Mascot'
import MochiIcon from '@/components/ui/MochiIcons'
import GroupMascotSVG from '@/components/ui/GroupMascotSVG'
import { useAppStore } from '@/store/appStore'
import { useAuthStore } from '@/store/authStore'
import Dialog from '@/components/ui/Dialog'
import { useToastStore } from '@/store/toastStore'
import { formatCurrency, getGreetingInfo, getHealthScoreColor, cn, formatDate, DEFAULT_EXPENSE_CATEGORIES, calculateFinancialHealthScore } from '@/lib/utils'
import { saveDocToCloud } from '@/services/cloudSync'
import { FIRESTORE_COLLECTIONS } from '@/services/firestoreCollections'
import type { Achievement, CalendarEvent as CalendarEventType } from '@/types'

// Official Achievements Template
const officialAchievements: Achievement[] = [
  {
    id: 'a1',
    name: 'First Step',
    description: 'Log your very first income or expense transaction in Mochi Money',
    icon: 'sparkle',
    category: 'Getting Started',
    requirement: 1,
    progress: 0,
    unlocked: false,
  },
  {
    id: 'a2',
    name: 'Savings Master',
    description: 'Save ₱1,000 across all your active savings goals',
    icon: 'piggy',
    category: 'Savings',
    requirement: 1000,
    progress: 0,
    unlocked: false,
  },
  {
    id: 'a3',
    name: 'Debt Slayer',
    description: 'Make a debt repayment or track your debt payoff',
    icon: 'flame',
    category: 'Debt Payoff',
    requirement: 1,
    progress: 0,
    unlocked: false,
  },
  {
    id: 'a4',
    name: 'Budget Master',
    description: 'Keep total monthly expenses within your budget plan',
    icon: 'target',
    category: 'Budgeting',
    requirement: 1,
    progress: 0,
    unlocked: false,
  },
  {
    id: 'a5',
    name: 'Circle Squad',
    description: 'Create or join a shared Mochi Circle bill split group',
    icon: 'group',
    category: 'Social',
    requirement: 1,
    progress: 0,
    unlocked: false,
  },
  {
    id: 'a6',
    name: 'Multi-Wallet Pro',
    description: 'Setup 2 or more active accounts (Cash, GCash, Bank, etc.)',
    icon: 'bot',
    category: 'Organization',
    requirement: 2,
    progress: 0,
    unlocked: false,
  },
]

function SkeletonCard() {
  return (
    <div className="mochi-card animate-pulse">
      <div className="mochi-skeleton h-4 w-3/4 mb-3" />
      <div className="mochi-skeleton h-8 w-1/2" />
    </div>
  )
}

function HealthScoreRing({ score }: { score: number }) {
  const color = getHealthScoreColor(score)

  return (
    <div className="relative inline-flex items-center justify-center">
      <ProgressRing progress={score} size={120} strokeWidth={8} color="var(--color-primary)" showText={false} />
      <div className="absolute flex flex-col items-center">
        <span className={cn('text-2xl font-bold', color)}>{score}</span>
        <span className="text-[10px] text-mochi-text-muted uppercase tracking-wide font-bold">Score</span>
      </div>
    </div>
  )
}

function EmptyTransactions() {
  return (
    <div className="mochi-card flex flex-col items-center justify-center py-10 text-center">
      <Mascot mood="neutral" size="lg" />
      <h3 className="mt-4 font-semibold text-mochi-text">Your story starts here!</h3>
      <p className="mt-1 text-sm text-mochi-text-muted max-w-xs">Every great financial journey begins with a single entry. Add your first one!</p>
      <Link to="/transactions/new" className="mochi-btn-primary mt-5">
        <Plus className="w-4 h-4" />
        Record First Transaction
      </Link>
    </div>
  )
}

export default function DashboardPage() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const { transactions, savingsGoals, debts, subscriptions = [], circles = [], wallets = [], budgets = [], setAddModalOpen, makeDebtPayment, updateSubscription, addTransaction } = useAppStore()
  const [isLoading, setIsLoading] = useState(true)
  const [showAssetBalance, setShowAssetBalance] = useState(true)
  const [activePayItem, setActivePayItem] = useState<{ id: string; title: string; type: string; amount: number } | null>(null)
  const [payWalletId, setPayWalletId] = useState<string>('')

  // 🍡 Mochi Suggests Completed State
  const [doneSuggestions, setDoneSuggestions] = useState<Record<string, boolean>>({})

  const handleSuggestionAction = (id: string, actionType: string) => {
    setDoneSuggestions((prev) => ({ ...prev, [id]: true }))
    if (actionType === 'review_food') {
      navigate('/budgets')
      useToastStore.getState().success('Opened Budget Plans to review Food spending.', 'Reviewing Food')
    } else if (actionType === 'add_boracay') {
      useToastStore.getState().success('Added ₱50 to your Boracay goal! Tiny win 🎉', 'Tiny Win')
    } else if (actionType === 'view_internet') {
      navigate('/subscriptions')
    } else if (actionType === 'view_budget') {
      navigate('/budgets')
    } else if (actionType === 'save_100') {
      useToastStore.getState().success('Saved ₱100 toward your goal! Great idea 💡', 'Saved ₱100')
    }
  }
  
  // Interactive Modals State
  const [show503020Modal, setShow503020Modal] = useState(false)
  const [showAchievementsModal, setShowAchievementsModal] = useState(false)
  const [showGreetingModal, setShowGreetingModal] = useState(false)
  const [selectedBudgetPlan, setSelectedBudgetPlan] = useState<any | null>(null)
  const [achievementsList, setAchievementsList] = useState<Achievement[]>(officialAchievements)
  const [selectedAchievement, setSelectedAchievement] = useState<Achievement | null>(null)
  const [selectedEvent, setSelectedEvent] = useState<CalendarEventType | null>(null)
  const syncedAchievementsRef = useRef<Set<string>>(new Set())

  // Dynamic 100% Real Upcoming Events from Subscriptions, Debts, and People Debts
  const calendarEventsList = useMemo<CalendarEventType[]>(() => {
    const events: CalendarEventType[] = []

    // 1. Subscriptions
    subscriptions
      .filter((s) => s.status === 'active' && s.nextBilling)
      .forEach((s) => {
        events.push({
          id: `sub_evt_${s.id}`,
          userId: user?.id || 'anon',
          title: `Subscription: ${s.name}`,
          date: s.nextBilling!,
          type: 'subscription',
          amount: s.amount,
          color: '#60A5FA',
        })
      })

    // 2. Debts Minimum Payment
    debts
      .filter((d) => d.currentBalance > 0)
      .forEach((d) => {
        const dueDateStr = d.dueDate ? d.dueDate.split('T')[0] : new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0]
        events.push({
          id: `debt_evt_${d.id}`,
          userId: user?.id || 'anon',
          title: `Debt Minimum: ${d.lender}`,
          date: dueDateStr,
          type: 'bill',
          amount: d.minimumPayment,
          color: '#F87171',
        })
      })

    // 3. People Debts (Owed to Me)
    try {
      const saved = localStorage.getItem('mochi_people_debts')
      if (saved) {
        const peopleDebts = JSON.parse(saved)
        peopleDebts
          .filter((pd: any) => pd.status !== 'settled' && pd.dueDate)
          .forEach((pd: any) => {
            const remaining = pd.totalAmount - pd.collectedAmount
            if (remaining > 0) {
              events.push({
                id: `pd_evt_${pd.id}`,
                userId: user?.id || 'anon',
                title: `Collection: ${pd.borrowerName}`,
                date: pd.dueDate,
                type: 'income',
                amount: remaining,
                color: '#34D399',
              })
            }
          })
      }
    } catch {}

    // Sort chronologically by date
    return events.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  }, [subscriptions, debts, user?.id])

  // Dynamic 100% Real Achievements Evaluation & Cloud Firestore Sync
  useEffect(() => {
    const totalSaved = savingsGoals.reduce((sum, g) => sum + g.currentAmount, 0)
    const hasDebtPayment = debts.some((d) => (d.payments && d.payments.length > 0) || d.currentBalance < d.originalBalance)
    const currentMonthStr = new Date().toISOString().slice(0, 7)
    const monthExpenses = transactions
      .filter((t) => t.type === 'expense' && t.date && t.date.startsWith(currentMonthStr))
      .reduce((sum, t) => sum + t.amount, 0)
    const totalBudgetLimit = budgets.reduce((sum, b) => sum + b.limit, 0)

    const evaluated = officialAchievements.map((ach) => {
      let isUnlocked = false
      let currentProgress = 0

      if (ach.id === 'a1') {
        currentProgress = transactions.length
        isUnlocked = transactions.length >= 1
      } else if (ach.id === 'a2') {
        currentProgress = totalSaved
        isUnlocked = totalSaved >= 1000
      } else if (ach.id === 'a3') {
        currentProgress = hasDebtPayment ? 1 : 0
        isUnlocked = hasDebtPayment
      } else if (ach.id === 'a4') {
        currentProgress = (budgets.length >= 1 && monthExpenses <= totalBudgetLimit) ? 1 : 0
        isUnlocked = budgets.length >= 1 && monthExpenses <= totalBudgetLimit && totalBudgetLimit > 0
      } else if (ach.id === 'a5') {
        currentProgress = circles.length
        isUnlocked = circles.length >= 1
      } else if (ach.id === 'a6') {
        currentProgress = wallets.length
        isUnlocked = wallets.length >= 2
      }

      const item = {
        ...ach,
        progress: Math.min(ach.requirement, currentProgress),
        unlocked: isUnlocked,
        unlockedAt: isUnlocked ? (ach.unlockedAt || new Date().toISOString().split('T')[0]) : undefined,
      }

      if (isUnlocked && !syncedAchievementsRef.current.has(ach.id)) {
        syncedAchievementsRef.current.add(ach.id)
        saveDocToCloud(FIRESTORE_COLLECTIONS.ACHIEVEMENTS, {
          ...item,
          userId: user?.id || 'anon',
        }).catch((err) => console.warn('Achievement firestore sync notice:', err))
      }

      return item
    })

    setAchievementsList(evaluated)
  }, [transactions.length, savingsGoals, debts, budgets, circles.length, wallets.length, user?.id])

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1000)
    return () => clearTimeout(timer)
  }, [])





  // Claim/Unlock Achievement
  const handleClaimAchievement = (ach: Achievement) => {
    setAchievementsList((prev) =>
      prev.map((a) =>
        a.id === ach.id
          ? { ...a, unlocked: true, progress: a.requirement, unlockedAt: new Date().toISOString().split('T')[0] }
          : a
      )
    )
    setSelectedAchievement(null)
    useToastStore.getState().success(`Achievement Unlocked: "${ach.name}"! Badge Earned!`, 'Congratulations!')
  }

  // Settle/Pay Upcoming Event
  const handleSettleEvent = (evt: CalendarEventType) => {
    if (evt.amount && evt.type !== 'income') {
      const walletId = wallets[0]?.id
      addTransaction({
        id: `txn_evt_${Date.now()}`,
        userId: user?.id || 'anon',
        type: 'expense',
        amount: evt.amount,
        currency: 'PHP',
        categoryId: 'bills',
        walletId,
        merchant: evt.title,
        paymentMethod: 'cash',
        date: new Date().toISOString().split('T')[0],
        notes: `Paid upcoming event: ${evt.title}`,
        isFavorite: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
    }
    setSelectedEvent(null)
    useToastStore.getState().success(`Marked "${evt.title}" as paid & logged transaction!`, 'Event Settled')
  }

  const handleConfirmPayDueItem = async () => {
    if (!activePayItem) return
    const chosenWallet = wallets.find((w) => w.id === payWalletId) || wallets[0]
    const walletId = chosenWallet?.id

    if (activePayItem.type === 'Debt') {
      await makeDebtPayment(activePayItem.id, activePayItem.amount, walletId, `Dashboard due payment for ${activePayItem.title}`)
      useToastStore.getState().success(`Paid ₱${activePayItem.amount.toLocaleString()} for ${activePayItem.title}`, 'Payment Success')
    } else {
      // Subscription payment
      const sub = subscriptions.find((s) => s.id === activePayItem.id)
      if (sub) {
        addTransaction({
          id: `txn_sub_${Date.now()}`,
          userId: user?.id || 'anon',
          type: 'expense',
          amount: sub.amount,
          currency: 'PHP',
          categoryId: 'subscriptions',
          walletId,
          merchant: sub.name,
          paymentMethod: 'cash',
          date: new Date().toISOString().split('T')[0],
          notes: `Dashboard payment for ${sub.name}`,
          isFavorite: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        })

        const nextDate = new Date(sub.nextBilling || Date.now())
        nextDate.setMonth(nextDate.getMonth() + 1)
        updateSubscription(sub.id, { nextBilling: nextDate.toISOString().split('T')[0] })
        useToastStore.getState().success(`Renewed ${sub.name} for ₱${sub.amount.toLocaleString()}`, 'Payment Success')
      }
    }

    setActivePayItem(null)
  }

  // Calculate real monthly income and expenses
  const currentMonthStr = new Date().toISOString().slice(0, 7) // YYYY-MM
  const monthTransactions = transactions.filter((t) => t.date && t.date.startsWith(currentMonthStr))
  
  const realIncome = monthTransactions
    .filter((t) => t.type === 'income')
    .reduce((s, t) => s + t.amount, 0)
  
  const realExpenses = monthTransactions
    .filter((t) => t.type === 'expense')
    .reduce((s, t) => s + t.amount, 0)

  const realHealthScore = calculateFinancialHealthScore({ income: realIncome, expenses: realExpenses, totalDebt: debts.reduce((sum, d) => sum + d.currentBalance, 0) })

  const netCashflow = realIncome - realExpenses
  const savingsRate = realIncome > 0 ? Math.round((netCashflow / realIncome) * 100) : 0

  // Calculate Subscriptions and Debts due today, upcoming, or overdue
  const todayStr = new Date().toISOString().split('T')[0]
  const todayTime = new Date(todayStr).getTime()

  const dueItems = [
    ...subscriptions
      .filter((s) => s.status === 'active' && s.nextBilling)
      .map((s) => {
        const itemTime = new Date(s.nextBilling.split('T')[0]).getTime()
        const isOverdue = itemTime < todayTime
        const daysDiff = Math.round((todayTime - itemTime) / 86400000)
        return {
          id: s.id,
          title: s.name,
          type: 'Subscription',
          amount: s.amount,
          dueDate: s.nextBilling,
          isOverdue,
          daysDiff,
          route: '/subscriptions',
        }
      }),
    ...debts
      .filter((d) => d.currentBalance > 0 && d.dueDate)
      .map((d) => {
        const itemTime = new Date(d.dueDate.split('T')[0]).getTime()
        const isOverdue = itemTime < todayTime
        const daysDiff = Math.round((todayTime - itemTime) / 86400000)
        return {
          id: d.id,
          title: d.lender,
          type: 'Debt',
          amount: d.minimumPayment,
          dueDate: d.dueDate.split('T')[0],
          isOverdue,
          daysDiff,
          route: '/debts',
        }
      }),
  ].filter((item) => {
    const itemTime = new Date(item.dueDate.split('T')[0]).getTime()
    const diffDays = (itemTime - todayTime) / 86400000
    return diffDays <= 4 // Show items due within 4 days or overdue!
  })

  const totalSaved = savingsGoals.reduce((sum, g) => sum + g.currentAmount, 0)
  const totalDebt = debts.reduce((sum, d) => sum + d.currentBalance, 0)

  // Real 7-day spending trend calculation
  const last7DaysTrend = transactions.length === 0 
    ? [10, 10, 10, 10, 10, 10, 10]
    : (() => {
        const days = Array.from({ length: 7 }, (_, i) => {
          const d = new Date()
          d.setDate(d.getDate() - (6 - i))
          return d.toISOString().split('T')[0]
        })
        const spentPerDay = days.map((dayStr) =>
          transactions
            .filter((t) => t.type === 'expense' && t.date === dayStr)
            .reduce((sum, t) => sum + t.amount, 0)
        )
        const maxSpent = Math.max(...spentPerDay, 1)
        return spentPerDay.map((spent) => Math.max(12, Math.round((spent / maxSpent) * 100)))
      })()

  const unlockedAchievementsCount = achievementsList.filter((a) => a.unlocked).length

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        <div className="mochi-card animate-pulse flex items-center justify-between">
          <div className="space-y-2">
            <div className="mochi-skeleton h-6 w-40" />
            <div className="mochi-skeleton h-4 w-60" />
          </div>
          <div className="mochi-skeleton w-16 h-16 rounded-full" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SkeletonCard />
          <SkeletonCard />
        </div>
      </div>
    )
  }

  const { greeting, subtitle, iconType, colorClass } = getGreetingInfo()
  const totalAssets = wallets.reduce((sum, w) => sum + w.balance, 0)

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="max-w-4xl mx-auto px-4 py-6 space-y-6"
    >
      {/* 0. Time Greeting Info Modal */}
      <Dialog isOpen={showGreetingModal} onClose={() => setShowGreetingModal(false)} title={`${greeting} from Mochi!`}>
        <div className="space-y-4 text-xs text-center p-2">
          <div className="w-16 h-16 rounded-full mx-auto flex items-center justify-center bg-mochi-primary/10 text-mochi-primary">
            {iconType === 'sun' && <Sun className="w-8 h-8 text-amber-500" />}
            {iconType === 'sunset' && <Sunset className="w-8 h-8 text-purple-400" />}
            {iconType === 'moon' && <Moon className="w-8 h-8 text-indigo-400" />}
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-black text-mochi-text">{greeting}, {user?.name || 'Friend'}!</h3>
            <p className="text-mochi-text-secondary text-xs">{subtitle}</p>
          </div>
          <div className="p-3.5 rounded-2xl bg-mochi-surface-alt border border-mochi-border/70 text-left space-y-2">
            <p className="text-[11px] font-bold text-mochi-text-muted uppercase">Financial Health Snapshot</p>
            <div className="flex items-center justify-between text-xs font-extrabold text-mochi-text">
              <span>Total Assets:</span>
              <span className="text-emerald-500 font-black">{formatCurrency(totalAssets)}</span>
            </div>
            <div className="flex items-center justify-between text-xs font-extrabold text-mochi-text">
              <span>Monthly Surplus:</span>
              <span className={netCashflow >= 0 ? 'text-sky-500' : 'text-rose-500'}>{formatCurrency(netCashflow)}</span>
            </div>
          </div>
          <button
            onClick={() => setShowGreetingModal(false)}
            className="w-full py-3 rounded-2xl bg-mochi-primary text-white font-extrabold text-xs cursor-pointer shadow-md hover:brightness-105"
          >
            Got it, thanks!
          </button>
        </div>
      </Dialog>
      {/* 1. Interactive 50/30/20 Modal */}
      <Dialog isOpen={show503020Modal} onClose={() => setShow503020Modal(false)} title="Understanding the 50/30/20 Budgeting Rule">
        <div className="space-y-4 text-xs leading-relaxed text-mochi-text-secondary">
          <div className="p-3.5 rounded-2xl bg-gradient-to-r from-mochi-primary/10 via-purple-500/10 to-sky-500/10 border border-mochi-primary/20">
            <h4 className="font-extrabold text-mochi-text text-sm flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-mochi-primary" /> Smart Budget Allocation Formula
            </h4>
            <p className="text-mochi-text-muted text-[11px] mt-1">
              The 50/30/20 rule is a simple, effective framework that divides your take-home pay into 3 main buckets to ensure balance and long-term financial security.
            </p>
          </div>

          <div className="space-y-2.5">
            <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20">
              <h5 className="font-extrabold text-rose-600 dark:text-rose-400 text-xs">1. 50% for Essential Needs</h5>
              <p className="text-[11px] text-mochi-text-secondary mt-0.5">
                Housing rent/mortgage, utilities (water, power, internet), groceries, healthcare, transportation, and minimum debt payments.
              </p>
            </div>

            <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20">
              <h5 className="font-extrabold text-amber-600 dark:text-amber-400 text-xs">2. 30% for Personal Wants</h5>
              <p className="text-[11px] text-mochi-text-secondary mt-0.5">
                Dining out, coffee, entertainment, streaming subscriptions, hobbies, shopping, and weekend trips.
              </p>
            </div>

            <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
              <h5 className="font-extrabold text-emerald-600 dark:text-emerald-400 text-xs">3. 20% for Savings & Investments</h5>
              <p className="text-[11px] text-mochi-text-secondary mt-0.5">
                Emergency funds, travel goals, high-yield deposits, retirement contributions, and extra debt payoff.
              </p>
            </div>
          </div>
        </div>
      </Dialog>

      {/* 2. Interactive Achievement Detail Modal */}
      <Dialog
        isOpen={!!selectedAchievement}
        onClose={() => setSelectedAchievement(null)}
        title={selectedAchievement?.name || 'Achievement Details'}
      >
        {selectedAchievement && (
          <div className="space-y-4 text-center py-2">
            <div className="w-16 h-16 rounded-3xl bg-amber-500/15 border-2 border-amber-500/40 flex items-center justify-center mx-auto shadow-md">
              <MochiIcon id={selectedAchievement.icon} size="lg" style="rounded-badge" />
            </div>

            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-600 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20">
                {selectedAchievement.category}
              </span>
              <h3 className="text-base font-extrabold text-mochi-text mt-2">{selectedAchievement.name}</h3>
              <p className="text-xs text-mochi-text-muted mt-1 max-w-xs mx-auto">{selectedAchievement.description}</p>
            </div>

            {/* Progress Bar */}
            <div className="p-3 rounded-2xl bg-mochi-surface-alt border border-mochi-border space-y-1.5 text-left">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-mochi-text-secondary">Progress</span>
                <span className="text-mochi-primary">
                  {selectedAchievement.progress} / {selectedAchievement.requirement}
                </span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-mochi-border overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-amber-400 to-mochi-primary transition-all duration-500"
                  style={{
                    width: `${Math.min(100, Math.round((selectedAchievement.progress / selectedAchievement.requirement) * 100))}%`,
                  }}
                />
              </div>
            </div>

            {/* Status & Action */}
            {selectedAchievement.unlocked ? (
              <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-bold flex items-center justify-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" /> Unlocked on {selectedAchievement.unlockedAt || 'Recently'}!
              </div>
            ) : (
              <button
                onClick={() => handleClaimAchievement(selectedAchievement)}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-amber-400 to-mochi-primary text-white text-xs font-black shadow-md hover:brightness-105 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Trophy className="w-4 h-4" /> Claim Achievement & Earn Badge!
              </button>
            )}
          </div>
        )}
      </Dialog>

      {/* 3. Interactive Upcoming Event Detail Modal */}
      <Dialog
        isOpen={!!selectedEvent}
        onClose={() => setSelectedEvent(null)}
        title={selectedEvent?.title || 'Upcoming Event'}
      >
        {selectedEvent && (
          <div className="space-y-4 text-xs">
            <div className="p-3.5 rounded-2xl bg-mochi-surface-alt border border-mochi-border flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-2xl flex items-center justify-center text-white shrink-0 font-bold shadow-xs"
                style={{ backgroundColor: selectedEvent.color || 'var(--color-primary)' }}
              >
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-extrabold text-mochi-text text-sm">{selectedEvent.title}</h4>
                <p className="text-[11px] text-mochi-text-muted">Due Date: {formatDate(selectedEvent.date)}</p>
              </div>
            </div>

            <p className="text-mochi-text-secondary leading-relaxed bg-mochi-surface p-3 rounded-2xl border border-mochi-border/60">
              Upcoming scheduled payment or financial calendar milestone.
            </p>

            {selectedEvent.amount && (
              <div className="flex items-center justify-between p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20">
                <span className="font-bold text-mochi-text">Amount Due</span>
                <span className="text-sm font-black text-rose-600 dark:text-rose-400">
                  {formatCurrency(selectedEvent.amount)}
                </span>
              </div>
            )}

            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                onClick={() => {
                  useToastStore.getState().info(`Reminder set for ${selectedEvent.title}`, 'Reminder Scheduled')
                  setSelectedEvent(null)
                }}
                className="py-2.5 rounded-2xl border border-mochi-border font-bold text-mochi-text hover:bg-mochi-surface-alt active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Bell className="w-4 h-4 text-mochi-text-muted" /> Remind Me
              </button>

              <button
                onClick={() => handleSettleEvent(selectedEvent)}
                className="py-2.5 rounded-2xl bg-mochi-primary text-white font-black shadow-xs hover:brightness-105 active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Check className="w-4 h-4" /> Mark Paid
              </button>
            </div>
          </div>
        )}
      </Dialog>

      {/* 4. Payment Modal for Due Items */}
      <Dialog isOpen={!!activePayItem} onClose={() => setActivePayItem(null)} title={`Pay ${activePayItem?.title}`}>
        {activePayItem && (
          <div className="space-y-4 text-xs">
            <div className="p-3.5 rounded-2xl bg-mochi-primary/10 border border-mochi-primary/20">
              <p className="text-mochi-text-muted">Item to Pay</p>
              <p className="font-extrabold text-mochi-text text-sm">{activePayItem.title}</p>
              <p className="text-lg font-black text-mochi-primary mt-1">₱{activePayItem.amount.toLocaleString()}</p>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-mochi-text-secondary mb-1.5 uppercase">
                Select Source Wallet
              </label>
              <select
                value={payWalletId}
                onChange={(e) => setPayWalletId(e.target.value)}
                className="w-full p-3 rounded-2xl border border-mochi-border bg-mochi-surface text-mochi-text font-semibold text-xs focus:ring-2 focus:ring-mochi-primary outline-none"
              >
                {wallets.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.name} (Balance: ₱{w.balance.toLocaleString()})
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={handleConfirmPayDueItem}
              className="w-full py-3 rounded-2xl bg-mochi-primary text-white font-extrabold text-xs shadow-md hover:brightness-105 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              Confirm ₱{activePayItem.amount.toLocaleString()} Payment
            </button>
          </div>
        )}
      </Dialog>

      {/* Dynamic Mascot Header Banner */}
      <header
        onClick={() => setShowGreetingModal(true)}
        className="mochi-card flex items-center justify-between cursor-pointer hover:border-mochi-primary/40 transition-all shadow-xs"
        aria-label="Greeting Header"
      >
        <div className="flex items-center gap-3">
          <div className={cn('w-12 h-12 rounded-full flex items-center justify-center shrink-0 border', colorClass)}>
            {iconType === 'sun' && <Sun className="w-6 h-6" />}
            {iconType === 'sunset' && <Sunset className="w-6 h-6" />}
            {iconType === 'moon' && <Moon className="w-6 h-6" />}
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-bold text-mochi-text">
              {greeting}!
            </h1>
            <p className="text-xs text-mochi-text-muted">{subtitle}</p>
          </div>
        </div>
        <HealthScoreRing score={realHealthScore} />
      </header>

      {/* Overdue / Due Soon Alert Banner */}
      {dueItems.length > 0 && (
        <section aria-label="Due Alerts" className="space-y-2">
          {dueItems.map((item) => (
            <div
              key={item.id}
              className={cn(
                'p-3.5 rounded-2xl border flex items-center justify-between shadow-xs transition-all',
                item.isOverdue
                  ? 'bg-rose-500/10 border-rose-500/30'
                  : 'bg-amber-500/10 border-amber-500/30'
              )}
            >
              <div className="flex items-center gap-3">
                <div className={cn(
                  'w-9 h-9 rounded-xl flex items-center justify-center font-black text-xs shrink-0',
                  item.isOverdue ? 'bg-rose-500 text-white' : 'bg-amber-500 text-white'
                )}>
                  !
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-extrabold text-mochi-text">{item.title}</span>
                    <span className={cn(
                      'text-[9px] font-black uppercase px-2 py-0.5 rounded-full',
                      item.isOverdue ? 'bg-rose-500/20 text-rose-600 dark:text-rose-400' : 'bg-amber-500/20 text-amber-600 dark:text-amber-400'
                    )}>
                      {item.isOverdue ? `Overdue by ${item.daysDiff}d` : 'Due Soon'}
                    </span>
                  </div>
                  <p className="text-[11px] text-mochi-text-muted">
                    {item.type} due on {formatDate(item.dueDate)} • <span className="font-bold text-mochi-text">₱{item.amount.toLocaleString()}</span>
                  </p>
                </div>
              </div>

              <button
                onClick={() => {
                  setPayWalletId(wallets[0]?.id || '')
                  setActivePayItem({ id: item.id, title: item.title, type: item.type, amount: item.amount })
                }}
                className="px-3 py-1.5 rounded-xl bg-mochi-primary text-white font-extrabold text-xs shadow-xs hover:brightness-105 active:scale-95 transition-all shrink-0 cursor-pointer"
              >
                Pay Now
              </button>
            </div>
          ))}
        </section>
      )}

      {/* Wallets Widget — Summary Breakdown Card Only */}
      {wallets.length > 0 && (() => {
        const cashTotal = wallets.filter(w => w.type === 'cash').reduce((sum, w) => sum + w.balance, 0)
        const digitalTotal = wallets.filter(w => w.type === 'digital_bank').reduce((sum, w) => sum + w.balance, 0)
        const bankTotal = wallets.filter(w => w.type === 'traditional_bank' || w.type === 'credit_card' || w.type === 'investment').reduce((sum, w) => sum + w.balance, 0)

        // Safe to Spend = Total Balance - Upcoming Bills (7 Days) - Debt Commitments - Savings Vault Commitments
        const next7DaysEnd = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        const next7DaysBills = dueItems.filter(item => item.dueDate <= next7DaysEnd).reduce((sum, item) => sum + item.amount, 0)
        const savingsTotal = savingsGoals.reduce((sum, g) => sum + (g.currentAmount || 0), 0)
        const debtTotal = debts.reduce((sum, d) => sum + (d.minimumPayment || d.currentBalance || 0), 0)
        const safeToSpend = Math.max(0, totalAssets - next7DaysBills - savingsTotal - debtTotal)

        return (
          <section aria-label="Wallets Overview" className="mochi-card space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Wallet className="w-5 h-5 text-mochi-primary" />
                <h2 className="font-bold text-mochi-text text-base">My Money Summary</h2>
              </div>
              <Link to="/wallets" className="text-xs text-mochi-primary font-bold hover:underline flex items-center gap-1">
                View Wallets <ChevronRight className="w-3 h-3" />
              </Link>
            </div>

            {/* Total Money Card with Cash / Digital / Bank Breakdown */}
            <div className="relative overflow-hidden p-5 rounded-3xl bg-gradient-to-br from-mochi-primary/20 via-purple-500/15 to-sky-400/20 border border-mochi-primary/30 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-black uppercase tracking-wider text-mochi-text-secondary">Total Money</span>
                  <h3 className="text-3xl font-black text-mochi-text tracking-tight mt-1">
                    {showAssetBalance ? formatCurrency(totalAssets) : '••••••••'}
                  </h3>
                </div>
                <button
                  onClick={() => setShowAssetBalance((prev) => !prev)}
                  className="p-3 rounded-2xl bg-mochi-surface/75 hover:bg-mochi-surface text-mochi-text-secondary hover:text-mochi-text border border-mochi-border/60 transition-all cursor-pointer shadow-2xs shrink-0"
                  title={showAssetBalance ? 'Hide Balance' : 'Show Balance'}
                >
                  {showAssetBalance ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>

              {/* Cash / Digital Wallets / Banks Breakdown Grid */}
              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-mochi-border/50">
                <div className="p-2.5 rounded-2xl bg-mochi-surface/70 border border-mochi-border/40 text-center">
                  <p className="text-[10px] font-bold text-mochi-text-muted">Cash</p>
                  <p className="text-xs font-black text-emerald-600 dark:text-emerald-400 mt-0.5">
                    {showAssetBalance ? formatCurrency(cashTotal) : '••••'}
                  </p>
                </div>

                <div className="p-2.5 rounded-2xl bg-mochi-surface/70 border border-mochi-border/40 text-center">
                  <p className="text-[10px] font-bold text-mochi-text-muted">Digital Wallets</p>
                  <p className="text-xs font-black text-sky-600 dark:text-sky-400 mt-0.5">
                    {showAssetBalance ? formatCurrency(digitalTotal) : '••••'}
                  </p>
                </div>

                <div className="p-2.5 rounded-2xl bg-mochi-surface/70 border border-mochi-border/40 text-center">
                  <p className="text-[10px] font-bold text-mochi-text-muted">Banks</p>
                  <p className="text-xs font-black text-purple-600 dark:text-purple-400 mt-0.5">
                    {showAssetBalance ? formatCurrency(bankTotal) : '••••'}
                  </p>
                </div>
              </div>
            </div>

            {/* Safe to Spend Banner (Always Visible) */}
            <div className="p-3.5 rounded-2xl bg-gradient-to-r from-emerald-500/15 via-emerald-500/5 to-transparent border border-emerald-500/30 flex items-center justify-between text-xs font-bold">
              <span className="text-mochi-text-secondary flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-emerald-500" /> Safe to Spend Surplus
              </span>
              <span className="text-emerald-600 dark:text-emerald-400 font-black text-sm">
                {formatCurrency(safeToSpend)}
              </span>
            </div>
          </section>
        )
      })()}

      {/* 2.3 "Upcoming Money" Cash Flow Projection Card */}
      <section aria-label="Upcoming Money Projection" className="mochi-card bg-gradient-to-r from-sky-500/10 via-purple-500/10 to-mochi-primary/10 border border-sky-500/30 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-sky-500" />
            <h2 className="font-bold text-mochi-text text-sm">Upcoming Money</h2>
          </div>
          <span className="text-[10px] font-black uppercase text-sky-600 dark:text-sky-400 bg-sky-500/20 px-2 py-0.5 rounded-full">
            Cash Flow
          </span>
        </div>

        {dueItems.length === 0 ? (
          <p className="text-xs text-mochi-text-muted font-medium py-2">No upcoming bills or recurring income scheduled in the next 7 days.</p>
        ) : (
          <div className="space-y-2">
            {dueItems.slice(0, 4).map((item) => (
              <div key={item.id} className="p-2.5 rounded-2xl bg-mochi-surface/80 border border-mochi-border/50 flex items-center justify-between text-xs">
                <div>
                  <p className="font-bold text-mochi-text">{item.title}</p>
                  <p className="text-[10px] text-mochi-text-muted">{formatDate(item.dueDate)}</p>
                </div>
                <span className={cn('font-black', item.type === 'income' ? 'text-emerald-500' : 'text-rose-500')}>
                  {item.type === 'income' ? '+' : '-'}{formatCurrency(item.amount)}
                </span>
              </div>
            ))}

            <div className="p-3 rounded-2xl bg-mochi-surface border border-mochi-border/80 flex items-center justify-between text-xs font-bold mt-2">
              <span className="text-mochi-text-secondary">Projected Ending Balance:</span>
              <span className="text-mochi-primary font-black text-sm">
                After upcoming payments, you may have around {formatCurrency(Math.max(0, totalAssets - dueItems.reduce((s, i) => s + i.amount, 0)))}
              </span>
            </div>
          </div>
        )}
      </section>

      {/* Mochi Circles Widget */}
      {circles.length > 0 && (
        <section aria-label="Mochi Circles" className="relative overflow-hidden p-4 rounded-3xl bg-gradient-to-r from-sky-400/20 via-mochi-primary/15 to-purple-500/20 border border-sky-400/30 shadow-xs">
          <Link to="/circles" className="block space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-sky-500" />
                <h3 className="font-bold text-mochi-text text-sm">{circles[0].name}</h3>
                <span className="text-[9px] font-black uppercase text-sky-600 bg-sky-500/20 px-2 py-0.5 rounded-full">
                  Group Split
                </span>
              </div>
              <ChevronRight className="w-4 h-4 text-mochi-text-muted" />
            </div>

            <div className="flex items-center justify-between bg-white/75 dark:bg-slate-900/80 p-3 rounded-2xl border border-white/40">
              <div className="flex items-center -space-x-3">
                {circles[0].members.map((m: { id: string; mascot: any; outfit: any }) => (
                  <div key={m.id} className="w-9 h-9 rounded-full bg-mochi-surface border-2 border-sky-400 p-0.5 shadow-xs">
                    <GroupMascotSVG animal={m.mascot} outfit={m.outfit} size="xs" />
                  </div>
                ))}
              </div>
              <div className="text-right">
                <p className="text-xs font-extrabold text-mochi-text">
                  {formatCurrency(circles[0].currentAmount, circles[0].currency)}{' '}
                  <span className="text-mochi-text-muted font-semibold">/ {formatCurrency(circles[0].targetAmount, circles[0].currency)}</span>
                </p>
                <p className="text-[10px] font-bold text-sky-600">
                  Everyone contributed this week!
                </p>
              </div>
            </div>
          </Link>
        </section>
      )}

      {/* Monthly Overview */}
      <section className="mochi-card" aria-label="Monthly Overview">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-bold text-mochi-text">Monthly Financial Overview</h2>
            <p className="text-[10px] text-mochi-text-muted">Savings Rate: <span className="text-emerald-500 font-extrabold">{savingsRate}%</span></p>
          </div>
          <span className="text-xs font-extrabold text-mochi-text-muted bg-mochi-surface-alt px-2.5 py-1 rounded-full border border-mochi-border">
            {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 mb-5">
          {/* Income Card */}
          <div className="p-4 rounded-3xl bg-gradient-to-br from-emerald-500/15 via-emerald-500/5 to-transparent border border-emerald-500/30 flex flex-col justify-between shadow-xs hover:border-emerald-500/60 transition-all">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-300">
                <div className="p-1.5 rounded-xl bg-emerald-500/20">
                  <ArrowDownLeft className="w-4 h-4 text-emerald-500" />
                </div>
                <span className="text-xs font-black uppercase tracking-wider">Total Income</span>
              </div>
              <span className="text-[10px] font-extrabold text-emerald-600 dark:text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded-full">
                +Inflow
              </span>
            </div>
            <p className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400 tracking-tight">
              {formatCurrency(realIncome)}
            </p>
          </div>

          {/* Expenses Card */}
          <div className="p-4 rounded-3xl bg-gradient-to-br from-rose-500/15 via-rose-500/5 to-transparent border border-rose-500/30 flex flex-col justify-between shadow-xs hover:border-rose-500/60 transition-all">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5 text-rose-700 dark:text-rose-300">
                <div className="p-1.5 rounded-xl bg-rose-500/20">
                  <ArrowUpRight className="w-4 h-4 text-rose-500" />
                </div>
                <span className="text-xs font-black uppercase tracking-wider">Total Expenses</span>
              </div>
              <span className="text-[10px] font-extrabold text-rose-600 dark:text-rose-400 bg-rose-500/20 px-2 py-0.5 rounded-full">
                -Outflow
              </span>
            </div>
            <p className="text-xl sm:text-2xl font-black text-rose-600 dark:text-rose-400 tracking-tight">
              {formatCurrency(realExpenses)}
            </p>
          </div>

          {/* Net Surplus Card */}
          <div className="p-4 rounded-3xl bg-gradient-to-br from-sky-500/15 via-purple-500/5 to-transparent border border-sky-500/30 flex flex-col justify-between shadow-xs hover:border-sky-500/60 transition-all">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5 text-sky-700 dark:text-sky-300">
                <div className="p-1.5 rounded-xl bg-sky-500/20">
                  <Zap className="w-4 h-4 text-sky-500" />
                </div>
                <span className="text-xs font-black uppercase tracking-wider">Net Surplus</span>
              </div>
              <span className="text-[10px] font-extrabold text-sky-600 dark:text-sky-400 bg-sky-500/20 px-2 py-0.5 rounded-full">
                {savingsRate}% Saved
              </span>
            </div>
            <p className={cn(
              'text-xl sm:text-2xl font-black tracking-tight',
              netCashflow >= 0 ? 'text-sky-600 dark:text-sky-400' : 'text-rose-500'
            )}>
              {formatCurrency(netCashflow)}
            </p>
          </div>
        </div>
        {/* Dynamic 7-day spending chart area */}
        <div className="h-32 rounded-lg bg-gradient-to-br from-mochi-primary/5 to-mochi-secondary/5 border border-mochi-border/50 flex items-end justify-around px-4 pb-2">
          {last7DaysTrend.map((h, i) => (
            <div
              key={i}
              className="w-6 rounded-t bg-gradient-to-t from-mochi-primary to-mochi-secondary transition-all duration-500"
              style={{ height: `${h}%` }}
            />
          ))}
        </div>
        <p className="text-center text-xs text-mochi-text-muted mt-2">
          {transactions.length > 0 ? 'Spending trend (last 7 days)' : 'Log transactions to view your 7-day spending trend'}
        </p>
      </section>

      {/* Recent Transactions */}
      <section aria-label="Recent Transactions">
        <div className="flex items-center justify-between mb-2">
          <h2 className="font-semibold text-mochi-text">Recent Transactions</h2>
          <Link to="/transactions" className="text-xs text-mochi-primary hover:underline flex items-center gap-1">
            View All <ChevronRight className="w-3 h-3" />
          </Link>
        </div>
        {transactions.length === 0 ? (
          <EmptyTransactions />
        ) : (
          <div className="mochi-card space-y-3">
            {[...transactions]
              .sort((a, b) => new Date(b.date || (b as any).createdAt || 0).getTime() - new Date(a.date || (a as any).createdAt || 0).getTime())
              .slice(0, 5)
              .map((txn) => (
              <div key={txn.id} className="flex items-center justify-between py-1">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    'w-10 h-10 rounded-full flex items-center justify-center',
                    txn.type === 'income' ? 'bg-mochi-success/10' : 'bg-mochi-error/10'
                  )}>
                    {txn.type === 'income' ? (
                      <ArrowDownLeft className="w-4 h-4 text-mochi-success" />
                    ) : (
                      <ArrowUpRight className="w-4 h-4 text-mochi-error" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-mochi-text">{txn.merchant}</p>
                    <p className="text-xs text-mochi-text-muted">{txn.categoryId}</p>
                  </div>
                </div>
                <span className={cn(
                  'text-sm font-semibold',
                  txn.type === 'income' ? 'text-mochi-success' : 'text-mochi-error'
                )}>
                  {txn.type === 'income' ? '+' : '-'}{formatCurrency(txn.amount, txn.currency)}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 🍡 Mochi Suggests Section */}
      <section className="mochi-card space-y-3.5" aria-label="Mochi Suggests">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg">🍡</span>
            <div>
              <h2 className="font-bold text-mochi-text text-base flex items-center gap-1.5">
                Mochi Suggests
              </h2>
              <p className="text-xs text-mochi-text-secondary font-medium">A tiny step for today</p>
            </div>
          </div>
          <span className="text-[10px] font-black text-mochi-primary bg-mochi-primary/10 px-2.5 py-1 rounded-full border border-mochi-primary/20">
            {Object.keys(doneSuggestions).length} / 5 Done
          </span>
        </div>

        <div className="space-y-2.5">
          {[
            {
              id: 's1',
              actionType: 'review_food',
              text: 'Review your Food spending',
              buttonText: 'Review',
            },
            {
              id: 's2',
              actionType: 'add_boracay',
              text: "Tiny win: You haven't added anything to your Boracay goal today.",
              buttonText: 'Add ₱50',
            },
            {
              id: 's3',
              actionType: 'view_internet',
              text: 'Quick check: Your Internet bill is due tomorrow.',
              buttonText: 'View',
            },
            {
              id: 's4',
              actionType: 'view_budget',
              text: 'Little challenge: Stay within your Food budget today.',
              buttonText: 'View Budget',
            },
            {
              id: 's5',
              actionType: 'save_100',
              text: 'Nice idea: You could save ₱100 toward your goal today.',
              buttonText: 'Save ₱100',
            },
          ].map((s) => {
            const isDone = doneSuggestions[s.id]
            return (
              <div
                key={s.id}
                className={cn(
                  'p-3 rounded-2xl border flex items-center justify-between gap-3 transition-all',
                  isDone
                    ? 'bg-emerald-500/10 border-emerald-500/30'
                    : 'bg-mochi-surface border-mochi-border hover:border-mochi-primary/30 shadow-2xs'
                )}
              >
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  <div
                    className={cn(
                      'w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-xs font-bold transition-all',
                      isDone
                        ? 'bg-emerald-500 text-white'
                        : 'bg-mochi-primary/10 text-mochi-primary border border-mochi-primary/20'
                    )}
                  >
                    {isDone ? <Check className="w-4 h-4 stroke-[3px]" /> : '•'}
                  </div>
                  <p
                    className={cn(
                      'text-xs font-bold transition-all leading-snug',
                      isDone ? 'text-mochi-text-muted line-through opacity-60' : 'text-mochi-text'
                    )}
                  >
                    {s.text}
                  </p>
                </div>

                <button
                  disabled={isDone}
                  onClick={() => handleSuggestionAction(s.id, s.actionType)}
                  className={cn(
                    'px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer shadow-2xs',
                    isDone
                      ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 cursor-default'
                      : 'mochi-btn-primary py-1 px-3 text-xs'
                  )}
                >
                  {isDone ? 'Completed' : s.buttonText}
                </button>
              </div>
            )
          })}
        </div>
      </section>

      {/* Budget Plans Section (Clickable Summary Card Only) */}
      {budgets.length > 0 && (() => {
        const totalBudgetLimit = budgets.reduce((sum, b) => sum + b.limit, 0)
        const totalBudgetSpent = budgets.reduce((sum, b) => {
          const spent = transactions
            .filter((t) => t.type === 'expense' && t.categoryId === b.categoryId)
            .reduce((tSum, t) => tSum + t.amount, 0)
          return sum + spent
        }, 0)
        const overallProgress = Math.min(100, Math.round((totalBudgetSpent / totalBudgetLimit) * 100))
        const isOverallOver = totalBudgetSpent > totalBudgetLimit

        return (
          <section className="mochi-card space-y-3" aria-label="Budget Plans Summary">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <LayoutDashboard className="w-4.5 h-4.5 text-amber-500" />
                <h2 className="font-bold text-mochi-text">Budget Summary</h2>
              </div>
              <Link to="/budget" className="text-xs font-bold text-mochi-primary hover:underline flex items-center gap-1">
                Manage Plans <ChevronRight className="w-3 h-3" />
              </Link>
            </div>

            {/* Single Clickable Summary Card */}
            <div
              onClick={() => setSelectedBudgetPlan(budgets[0])}
              className="p-4 rounded-3xl bg-gradient-to-br from-amber-500/15 via-orange-500/5 to-transparent border border-amber-500/30 hover:border-amber-500/60 transition-all cursor-pointer space-y-3 shadow-xs"
            >
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-black uppercase tracking-wider text-mochi-text-secondary">Overall Budget Allocation</span>
                  <p className="text-xl font-black text-mochi-text mt-0.5">
                    {formatCurrency(totalBudgetSpent)} <span className="text-xs font-semibold text-mochi-text-muted">/ {formatCurrency(totalBudgetLimit)}</span>
                  </p>
                </div>
                <span className={cn(
                  'text-xs font-black uppercase px-3 py-1 rounded-full',
                  isOverallOver ? 'bg-rose-500/20 text-rose-600' : 'bg-amber-500/20 text-amber-600'
                )}>
                  {isOverallOver ? 'Exceeded' : `${overallProgress}% Used`}
                </span>
              </div>

              <div className="w-full h-2.5 rounded-full bg-mochi-border/60 overflow-hidden">
                <div
                  className={cn('h-full transition-all duration-500', isOverallOver ? 'bg-rose-500' : 'bg-amber-500')}
                  style={{ width: `${Math.min(100, overallProgress)}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-[11px] font-bold text-mochi-text-muted">
                <span>{budgets.length} Categories Budgeted</span>
                <span className="text-mochi-primary hover:underline font-extrabold flex items-center gap-1">
                  View Full Breakdown &rarr;
                </span>
              </div>
            </div>
          </section>
        )
      })()}

      {/* Achievements Section (Summary Card + View Achievements Button) */}
      {achievementsList.length > 0 && (
        <section className="mochi-card space-y-3" aria-label="Achievements">
          <div className="flex items-center gap-2">
            <Trophy className="w-4.5 h-4.5 text-amber-500" />
            <h2 className="font-bold text-mochi-text">Achievements</h2>
          </div>

          {/* Summary Card */}
          <div className="p-4 rounded-3xl bg-gradient-to-br from-amber-500/15 via-orange-500/5 to-transparent border border-amber-500/30 space-y-3 shadow-xs">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-black uppercase tracking-wider text-mochi-text-secondary">Achieved Badges</span>
                <p className="text-2xl font-black text-mochi-text mt-0.5">
                  {unlockedAchievementsCount} <span className="text-xs font-bold text-mochi-text-muted">/ {achievementsList.length} Unlocked</span>
                </p>
              </div>
              <span className="text-xs font-black uppercase text-amber-600 bg-amber-500/20 px-3 py-1 rounded-full border border-amber-500/30">
                {Math.round((unlockedAchievementsCount / achievementsList.length) * 100)}% Complete
              </span>
            </div>

            <div className="w-full h-2.5 rounded-full bg-mochi-border/60 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all duration-500"
                style={{ width: `${Math.round((unlockedAchievementsCount / achievementsList.length) * 100)}%` }}
              />
            </div>

            <button
              onClick={() => setShowAchievementsModal(true)}
              className="w-full py-3 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-xs shadow-md transition-all cursor-pointer hover:scale-[1.01] active:scale-95 flex items-center justify-center gap-2"
            >
              <Trophy className="w-4 h-4" /> View Achievements
            </button>
          </div>
        </section>
      )}

      {/* Calendar Preview (Interactive Upcoming Action Modal) */}
      <section className="mochi-card space-y-3" aria-label="Upcoming Events">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="w-4.5 h-4.5 text-sky-500" />
            <h2 className="font-bold text-mochi-text">Upcoming</h2>
          </div>
          <Link to="/calendar" className="text-xs text-mochi-primary hover:underline flex items-center gap-1 font-bold">
            View Calendar <ChevronRight className="w-3 h-3" />
          </Link>
        </div>

        <div className="space-y-2">
          {calendarEventsList.map((event) => (
            <div
              key={event.id}
              onClick={() => setSelectedEvent(event)}
              className="flex items-center gap-3 p-3.5 rounded-2xl bg-mochi-surface border border-mochi-border hover:border-mochi-primary/40 hover:shadow-xs transition-all cursor-pointer"
            >
              <div
                className="w-1.5 h-10 rounded-full flex-shrink-0"
                style={{ backgroundColor: event.color || 'var(--color-primary)' }}
              />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-mochi-text truncate">{event.title}</p>
                <p className="text-[11px] text-mochi-text-muted">
                  {formatDate(event.date)}
                </p>
              </div>
              {event.amount && (
                <span className={cn(
                  'text-xs font-black px-2.5 py-1 rounded-full',
                  event.type === 'income' ? 'text-emerald-600 bg-emerald-500/10' : 'text-rose-600 bg-rose-500/10'
                )}>
                  {event.type === 'income' ? '+' : '-'}{formatCurrency(event.amount)}
                </span>
              )}
            </div>
          ))}
          {calendarEventsList.length === 0 && (
            <p className="text-xs text-mochi-text-muted text-center py-4">No upcoming events scheduled</p>
          )}
        </div>
      </section>

      {/* Savings + Debt Quick Stats */}
      {(totalSaved > 0 || totalDebt > 0) && (
        <section className="grid grid-cols-1 sm:grid-cols-2 gap-3" aria-label="Quick Stats">
          {totalSaved > 0 && (
            <div className="mochi-card flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-mochi-success/10 flex items-center justify-center">
                <PiggyBank className="w-6 h-6 text-mochi-success" />
              </div>
              <div>
                <p className="text-xs text-mochi-text-muted">Total Saved</p>
                <p className="text-lg font-bold text-mochi-success">{formatCurrency(totalSaved)}</p>
              </div>
            </div>
          )}
          {totalDebt > 0 && (
            <div className="mochi-card flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-mochi-error/10 flex items-center justify-center">
                <CreditCard className="w-6 h-6 text-mochi-error" />
              </div>
              <div>
                <p className="text-xs text-mochi-text-muted">Remaining Debt</p>
                <p className="text-lg font-bold text-mochi-error">{formatCurrency(totalDebt)}</p>
              </div>
            </div>
          )}
        </section>
      )}

      {/* All Achievements Grid & Detail Modal */}
      <Dialog
        isOpen={showAchievementsModal}
        onClose={() => {
          setShowAchievementsModal(false)
          setSelectedAchievement(null)
        }}
        title="Mochi Achievements Badges"
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs">
            <span className="font-extrabold text-amber-700 dark:text-amber-300">Earned Badges</span>
            <span className="font-black text-amber-600 bg-amber-500/20 px-2.5 py-0.5 rounded-full">
              {unlockedAchievementsCount} of {achievementsList.length} Unlocked
            </span>
          </div>

          {/* Inline Detail Card for Selected Achievement */}
          {selectedAchievement && (
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8 }}
              className="p-4 rounded-3xl bg-gradient-to-br from-amber-500/20 via-orange-500/10 to-transparent border-2 border-amber-500/40 relative shadow-xs space-y-3"
            >
              <button
                onClick={() => setSelectedAchievement(null)}
                className="absolute top-3 right-3 p-1.5 rounded-full bg-mochi-surface hover:bg-mochi-surface-alt text-mochi-text-muted hover:text-mochi-text transition-colors cursor-pointer"
                title="Close detail"
              >
                <X className="w-3.5 h-3.5" />
              </button>

              <div className="flex items-center gap-3">
                <MochiIcon id={selectedAchievement.icon} size="lg" style="rounded-badge" />
                <div>
                  <h4 className="text-sm font-black text-mochi-text">{selectedAchievement.name}</h4>
                  <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
                    {selectedAchievement.category}
                  </span>
                </div>
              </div>

              <p className="text-xs text-mochi-text-secondary leading-relaxed">
                {selectedAchievement.description}
              </p>

              {/* Progress & Status */}
              <div className="space-y-1.5 pt-1">
                <div className="flex items-center justify-between text-[11px] font-bold">
                  <span className="text-mochi-text-muted">Progress</span>
                  <span className={selectedAchievement.unlocked ? 'text-amber-600 font-black' : 'text-mochi-text'}>
                    {selectedAchievement.unlocked ? '100% Unlocked' : `${selectedAchievement.progress} / ${selectedAchievement.requirement}`}
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-mochi-border/60 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all duration-500"
                    style={{
                      width: `${Math.min(100, Math.round((selectedAchievement.progress / selectedAchievement.requirement) * 100))}%`,
                    }}
                  />
                </div>
              </div>

              {selectedAchievement.unlocked ? (
                <div className="flex items-center justify-between pt-1">
                  <span className="text-[10px] font-bold text-emerald-600 bg-emerald-500/15 px-3 py-1 rounded-full border border-emerald-500/30 flex items-center gap-1">
                    <Star className="w-3 h-3 text-emerald-500 fill-emerald-500" /> Badge Earned
                  </span>
                  {selectedAchievement.unlockedAt && (
                    <span className="text-[10px] text-mochi-text-muted">
                      Unlocked on {formatDate(selectedAchievement.unlockedAt)}
                    </span>
                  )}
                </div>
              ) : (
                <p className="text-[11px] italic text-mochi-text-muted pt-1">
                  Keep logging transactions to unlock this badge!
                </p>
              )}
            </motion.div>
          )}

          {/* Badges Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {achievementsList.map((ach) => {
              const isSelected = selectedAchievement?.id === ach.id
              return (
                <div
                  key={ach.id}
                  onClick={() => setSelectedAchievement(isSelected ? null : ach)}
                  className={cn(
                    'flex flex-col items-center gap-1.5 p-3 rounded-2xl border text-center transition-all cursor-pointer hover:scale-105 active:scale-95',
                    isSelected && 'ring-2 ring-amber-500 border-amber-500 bg-amber-500/20 scale-105 shadow-md',
                    !isSelected && ach.unlocked && 'bg-gradient-to-b from-amber-500/15 to-amber-500/5 border-amber-500/40 shadow-xs',
                    !isSelected && !ach.unlocked && 'bg-mochi-surface-alt border-mochi-border opacity-70 hover:opacity-100'
                  )}
                >
                  <MochiIcon id={ach.icon} size="md" style="rounded-badge" />
                  <p className="text-xs font-extrabold text-mochi-text line-clamp-1">{ach.name}</p>
                  {ach.unlocked ? (
                    <span className="text-[9px] font-black uppercase text-amber-600 bg-amber-500/20 px-2 py-0.5 rounded-full flex items-center gap-0.5">
                      <Star className="w-2.5 h-2.5 text-amber-500 fill-amber-500" /> Earned
                    </span>
                  ) : (
                    <span className="text-[9px] font-bold text-mochi-text-muted">
                      {ach.progress}/{ach.requirement}
                    </span>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </Dialog>

      {/* Selected Budget Plan Full Detail Modal */}
      <Dialog isOpen={!!selectedBudgetPlan} onClose={() => setSelectedBudgetPlan(null)} title={selectedBudgetPlan ? (DEFAULT_EXPENSE_CATEGORIES.find(c => c.id === selectedBudgetPlan.categoryId)?.name || selectedBudgetPlan.categoryId) : 'Plan Details'}>
        {selectedBudgetPlan && (() => {
          const category = DEFAULT_EXPENSE_CATEGORIES.find(c => c.id === selectedBudgetPlan.categoryId)
          const categoryTxns = transactions.filter(t => t.type === 'expense' && t.categoryId === selectedBudgetPlan.categoryId)
          const spent = categoryTxns.reduce((sum, t) => sum + t.amount, 0)
          const limit = selectedBudgetPlan.limit
          const remaining = limit - spent
          const progress = Math.min(100, Math.round((spent / limit) * 100))
          const isOver = spent > limit

          return (
            <div className="space-y-4 text-xs">
              <div className={cn(
                'p-4 rounded-3xl border flex flex-col gap-2',
                isOver ? 'bg-rose-500/10 border-rose-500/30' : 'bg-amber-500/10 border-amber-500/30'
              )}>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold uppercase text-mochi-text-secondary">{category?.name || selectedBudgetPlan.categoryId} Budget</span>
                  <span className={cn(
                    'text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full',
                    isOver ? 'bg-rose-500 text-white' : 'bg-amber-500 text-white'
                  )}>
                    {isOver ? 'Over Budget' : `${progress}% Used`}
                  </span>
                </div>

                <div className="flex items-baseline justify-between mt-1">
                  <div>
                    <p className="text-2xl font-black text-mochi-text">{formatCurrency(spent)}</p>
                    <p className="text-[11px] text-mochi-text-muted">Spent out of {formatCurrency(limit)}</p>
                  </div>
                  <div className="text-right">
                    <p className={cn('text-sm font-extrabold', isOver ? 'text-rose-500' : 'text-emerald-500')}>
                      {isOver ? `+${formatCurrency(spent - limit)} over` : `${formatCurrency(remaining)} remaining`}
                    </p>
                    <p className="text-[10px] text-mochi-text-muted">Monthly Plan</p>
                  </div>
                </div>

                <div className="w-full h-2.5 rounded-full bg-mochi-border/60 overflow-hidden mt-1">
                  <div
                    className={cn('h-full transition-all duration-500', isOver ? 'bg-rose-500' : 'bg-amber-500')}
                    style={{ width: `${Math.min(100, progress)}%` }}
                  />
                </div>
              </div>

              {/* Transactions Logged Under This Category */}
              <div className="space-y-2">
                <h4 className="font-extrabold text-mochi-text uppercase text-[10px]">Logged Expenses ({categoryTxns.length})</h4>
                {categoryTxns.length === 0 ? (
                  <p className="text-mochi-text-muted text-center py-3 bg-mochi-surface-alt rounded-2xl">No expenses logged under this plan yet.</p>
                ) : (
                  <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                    {categoryTxns.map(t => (
                      <div key={t.id} className="flex items-center justify-between p-2.5 rounded-xl bg-mochi-surface-alt border border-mochi-border/60">
                        <div>
                          <p className="font-bold text-mochi-text">{t.merchant}</p>
                          <p className="text-[10px] text-mochi-text-muted">{formatDate(t.date)}</p>
                        </div>
                        <span className="font-black text-rose-500">-{formatCurrency(t.amount)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => {
                    setSelectedBudgetPlan(null)
                    setAddModalOpen(true, 'expense')
                  }}
                  className="flex-1 py-3 rounded-2xl bg-mochi-primary text-white font-extrabold text-xs cursor-pointer shadow-md hover:brightness-105"
                >
                  Log Expense in Category
                </button>
              </div>
            </div>
          )
        })()}
      </Dialog>
    </motion.div>
  )
}
