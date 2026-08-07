import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Plus,
  TrendingUp,
  PiggyBank,
  CreditCard,
  ArrowDownLeft,
  ArrowUpRight,
  Calendar,
  Users,
  Wallet,
  ChevronDown,
  ChevronRight,
  Target,
  Trophy,
  Zap,
  CheckCircle2,
  Circle,
  Star,
  Flame,
} from 'lucide-react'
import ProgressRing from '@/components/ui/ProgressRing'
import Mascot from '@/components/ui/Mascot'
import MochiIcon from '@/components/ui/MochiIcons'
import GroupMascotSVG from '@/components/ui/GroupMascotSVG'
import { useAppStore } from '@/store/appStore'
import { useAuthStore } from '@/store/authStore'
import { formatCurrency, getGreeting, getHealthScoreColor, cn, formatDate } from '@/lib/utils'
import type { Achievement, DailyMission, CalendarEvent as CalendarEventType } from '@/types'

// Clean initial states
const mockMissions: DailyMission[] = []
const mockAchievements: Achievement[] = []
const mockCalendarEvents: CalendarEventType[] = []


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
  const { user } = useAuthStore()
  const { transactions, savingsGoals, debts, circles = [], wallets = [], setAddModalOpen } = useAppStore()
  const [isLoading, setIsLoading] = useState(true)
  const [walletsExpanded, setWalletsExpanded] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1000)
    return () => clearTimeout(timer)
  }, [])

  const mockHealthScore = transactions.length > 0 ? 85 : 100

  // Calculate real monthly income and expenses
  const currentMonthStr = new Date().toISOString().slice(0, 7) // YYYY-MM
  const monthTransactions = transactions.filter((t) => t.date && t.date.startsWith(currentMonthStr))
  
  const realIncome = monthTransactions
    .filter((t) => t.type === 'income')
    .reduce((s, t) => s + t.amount, 0)
  
  const realExpenses = monthTransactions
    .filter((t) => t.type === 'expense')
    .reduce((s, t) => s + t.amount, 0)

  const netCashflow = realIncome - realExpenses
  const savingsRate = realIncome > 0 ? Math.round((netCashflow / realIncome) * 100) : 0

  const upcomingEvents = mockCalendarEvents
    .filter((e) => new Date(e.date) >= new Date())
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 3)

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
        return spentPerDay.map((spent) => Math.max(10, Math.round((spent / maxSpent) * 100)))
      })()

  if (isLoading) {
    return (
      <div className="space-y-4 animate-pulse" aria-busy="true" aria-label="Loading dashboard">
        <div className="mochi-skeleton h-6 w-48" />
        <div className="mochi-skeleton h-4 w-32" />
        <SkeletonCard />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="mochi-skeleton h-24 rounded-lg" />
          ))}
        </div>
        <SkeletonCard />
        <SkeletonCard />
      </div>
    )
  }

  return (
    <motion.div
      className="space-y-4 pb-8"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      role="main"
      aria-label="Dashboard"
    >
      {/* Greeting */}
      <header className="mb-2 flex items-center justify-between">
        <div>
          <p className="text-xs font-bold text-mochi-text-muted">
            {getGreeting()}!
          </p>
          <h1 className="text-xl font-black text-mochi-text">
            {user?.name?.split(' ')[0] || 'Friend'}
          </h1>
        </div>
        <button
          onClick={() => setAddModalOpen(true)}
          className="mochi-btn-primary text-xs py-2 px-3 flex items-center gap-1.5 shadow-md active:scale-95 transition-all"
        >
          <Plus className="w-4 h-4" /> Log Transaction
        </button>
      </header>

      {/* 1-Tap Quick Log Shortcut Widget */}
      <div className="p-3 bg-mochi-surface-alt border border-mochi-border rounded-2xl flex flex-wrap items-center justify-between gap-2 text-xs">
        <span className="font-extrabold text-mochi-text text-[11px] flex items-center gap-1.5">
          <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-400" /> Quick Log:
        </span>
        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => {
              useAppStore.getState().addTransaction({
                id: `txn_${Date.now()}`,
                userId: 'anon',
                type: 'expense',
                amount: 120,
                currency: 'PHP',
                categoryId: 'food',
                merchant: 'Starbucks / Coffee',
                paymentMethod: 'cash',
                isFavorite: false,
                date: new Date().toISOString().split('T')[0],
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              })
            }}
            className="px-2.5 py-1 rounded-xl bg-mochi-surface hover:bg-mochi-border border border-mochi-border font-bold text-mochi-text active:scale-95 transition-all flex items-center gap-1"
          >
            <span>Coffee ₱120</span>
          </button>

          <button
            onClick={() => {
              useAppStore.getState().addTransaction({
                id: `txn_${Date.now()}`,
                userId: 'anon',
                type: 'expense',
                amount: 150,
                currency: 'PHP',
                categoryId: 'transportation',
                merchant: 'Grab / Commute',
                paymentMethod: 'cash',
                isFavorite: false,
                date: new Date().toISOString().split('T')[0],
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              })
            }}
            className="px-2.5 py-1 rounded-xl bg-mochi-surface hover:bg-mochi-border border border-mochi-border font-bold text-mochi-text active:scale-95 transition-all flex items-center gap-1"
          >
            <span>Grab/Ride ₱150</span>
          </button>

          <button
            onClick={() => {
              useAppStore.getState().addTransaction({
                id: `txn_${Date.now()}`,
                userId: 'anon',
                type: 'expense',
                amount: 180,
                currency: 'PHP',
                categoryId: 'food',
                merchant: 'Lunch Meal',
                paymentMethod: 'cash',
                isFavorite: false,
                date: new Date().toISOString().split('T')[0],
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              })
            }}
            className="px-2.5 py-1 rounded-xl bg-mochi-surface hover:bg-mochi-border border border-mochi-border font-bold text-mochi-text active:scale-95 transition-all flex items-center gap-1"
          >
            <span>Lunch ₱180</span>
          </button>
        </div>
      </div>

      {/* Financial Pulse Card */}
      <section aria-label="Financial Pulse">
        <div className="bg-gradient-to-r from-amber-500/10 via-sky-500/10 to-emerald-500/10 border border-mochi-border/80 rounded-3xl p-4 sm:p-5 flex items-center gap-4 relative overflow-hidden shadow-xs">
          <div className="w-11 h-11 rounded-2xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 border border-amber-400/30">
            <Zap className="w-5 h-5 text-amber-500" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-700 dark:text-amber-300 bg-amber-400/20 px-2 py-0.5 rounded-full border border-amber-400/30">
                Financial Pulse
              </span>
              <span className="text-[10px] text-mochi-text-muted font-bold">This Month</span>
            </div>
            <p className="text-xs font-extrabold text-mochi-text leading-relaxed">
              {netCashflow > 0
                ? `You're running a ${formatCurrency(netCashflow)} surplus this month with a ${savingsRate}% savings rate. Keep building your funds!`
                : `Your monthly expenses are running close to your income (${formatCurrency(realExpenses)} spent). Keep an eye on non-essential spending.`}
            </p>
          </div>
        </div>
      </section>

      {/* Financial Health Score Card */}
      <section
        className="mochi-card flex flex-col sm:flex-row items-center gap-4 sm:gap-6"
        aria-label="Financial Health Score"
      >
        <HealthScoreRing score={mockHealthScore} />
        <div className="flex-1 text-center sm:text-left">
          <h2 className="text-lg font-semibold text-mochi-text">Financial Health</h2>
          <p className="text-sm text-mochi-text-muted mt-1">
            {mockHealthScore >= 80
              ? "Excellent! You're doing great!"
              : mockHealthScore >= 60
              ? "Good progress! Keep it up."
              : mockHealthScore >= 40
              ? "Room for improvement. Let's work on it!"
              : "Needs attention. Don't worry, we'll help!"}
          </p>
          <div className="flex flex-wrap gap-2 mt-3 justify-center sm:justify-start">
            <span className="mochi-badge mochi-badge-success">Savings: {savingsGoals.length > 0 ? 'Active' : 'None'}</span>
            <span className={cn('mochi-badge', totalDebt > 0 ? 'mochi-badge-warning' : 'mochi-badge-success')}>
              Debt: {totalDebt > 0 ? formatCurrency(totalDebt) : 'Free!'}
            </span>
          </div>
        </div>
        <Mascot mood={mockHealthScore >= 80 ? 'excited' : mockHealthScore >= 60 ? 'happy' : 'neutral'} size="sm" />
      </section>

      {/* Wallet Overview Widget */}
      {wallets.length > 0 && (
        <section aria-label="Wallet Overview">
          <Link to="/wallets">
            <motion.div
              className="mochi-card bg-gradient-to-br from-amber-500/5 via-orange-500/5 to-transparent border-amber-400/20 hover:border-amber-400/50 transition-all cursor-pointer"
              whileTap={{ scale: 0.99 }}
            >
              {/* Top row */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                    <Wallet className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-mochi-text-muted">Total Assets</p>
                    <p className="text-xl font-black text-mochi-text">
                      {formatCurrency(wallets.filter((w) => w.includeInTotal).reduce((s, w) => s + w.balance, 0), 'PHP')}
                    </p>
                  </div>
                </div>
                <button
                  onClick={(e) => { e.preventDefault(); setWalletsExpanded((x) => !x) }}
                  className="p-1.5 rounded-full hover:bg-mochi-surface-alt transition-colors"
                >
                  <ChevronDown className={`w-4 h-4 text-mochi-text-muted transition-transform ${walletsExpanded ? 'rotate-180' : ''}`} />
                </button>
              </div>

              {/* Always-visible top wallets */}
              <div className="grid grid-cols-2 gap-2">
                {wallets.slice(0, walletsExpanded ? undefined : 4).map((w) => (
                  <div
                    key={w.id}
                    className="flex items-center gap-2 p-2 rounded-xl bg-white/50 dark:bg-white/5 border border-mochi-border/40"
                  >
                    <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: w.color }} />
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] text-mochi-text-muted truncate">{w.name}</p>
                      <p className="text-xs font-extrabold text-mochi-text">{formatCurrency(w.balance, w.currency)}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-end mt-2 gap-1">
                <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400">View All Wallets</span>
                <ChevronRight className="w-3 h-3 text-amber-600 dark:text-amber-400" />
              </div>
            </motion.div>
          </Link>
        </section>
      )}

      {/* Mochi Circles™ Featured Journey Home Widget */}
      {circles.length > 0 && (
        <section aria-label="Mochi Circles Journey Widget">
          <Link
            to="/circles"
            className="mochi-card bg-gradient-to-r from-sky-500/10 via-amber-500/10 to-purple-500/10 p-5 rounded-3xl border border-sky-400/30 hover:border-sky-500/60 transition-all flex flex-col gap-3 group block"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="mochi-badge mochi-badge-primary text-[10px] font-extrabold uppercase tracking-wider flex items-center gap-1">
                  <Users className="w-3 h-3" /> Mochi Circles™
                </span>
                <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
                  {circles[0].name}
                </span>
              </div>
              <span className="text-xs font-bold text-sky-600 group-hover:translate-x-1 transition-transform flex items-center gap-1">
                View Journey Track →
              </span>
            </div>

            {/* Mascot Trail Preview */}
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

      {/* Quick Actions */}
      <section aria-label="Quick Actions">
        <h2 className="text-sm font-semibold text-mochi-text-secondary mb-2 uppercase tracking-wide">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { icon: Plus, label: 'Add Expense', action: () => setAddModalOpen(true, 'expense'), color: 'bg-rose-500/10 text-rose-500' },
            { icon: TrendingUp, label: 'Add Income', action: () => setAddModalOpen(true, 'income'), color: 'bg-emerald-500/10 text-emerald-500' },
            { icon: PiggyBank, label: 'Savings Goals', path: '/savings', color: 'bg-purple-500/10 text-purple-500' },
            { icon: CreditCard, label: 'Debts & Bills', path: '/debts', color: 'bg-amber-500/10 text-amber-500' },
          ].map((item) => {
            const Icon = item.icon
            if (item.action) {
              return (
                <button
                  key={item.label}
                  onClick={item.action}
                  className="mochi-card flex flex-col items-center gap-2 py-4 hover:shadow-lg active:scale-95 transition-all cursor-pointer text-left w-full"
                >
                  <div className={cn('w-10 h-10 rounded-2xl flex items-center justify-center', item.color)}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-bold text-mochi-text text-center">{item.label}</span>
                </button>
              )
            }
            return (
              <Link
                key={item.label}
                to={item.path!}
                className="mochi-card flex flex-col items-center gap-2 py-4 hover:shadow-lg active:scale-95 transition-all cursor-pointer"
              >
                <div className={cn('w-10 h-10 rounded-2xl flex items-center justify-center', item.color)}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold text-mochi-text text-center">{item.label}</span>
              </Link>
            )
          })}
        </div>
      </section>

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
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
            <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 mb-1">
              <ArrowDownLeft className="w-3.5 h-3.5" />
              <span className="text-[10px] font-bold uppercase tracking-wider">Income</span>
            </div>
            <p className="text-sm font-black text-emerald-600 dark:text-emerald-400">{formatCurrency(realIncome)}</p>
          </div>
          <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20">
            <div className="flex items-center gap-1 text-rose-600 dark:text-rose-400 mb-1">
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span className="text-[10px] font-bold uppercase tracking-wider">Expenses</span>
            </div>
            <p className="text-sm font-black text-rose-600 dark:text-rose-400">{formatCurrency(realExpenses)}</p>
          </div>
          <div className="p-3 rounded-2xl bg-sky-500/10 border border-sky-500/20">
            <div className="flex items-center gap-1 text-sky-600 dark:text-sky-400 mb-1">
              <Zap className="w-3.5 h-3.5" />
              <span className="text-[10px] font-bold uppercase tracking-wider">Net Surplus</span>
            </div>
            <p className={`text-sm font-black ${netCashflow >= 0 ? 'text-sky-600 dark:text-sky-400' : 'text-rose-500'}`}>
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
            {transactions.slice(0, 5).map((txn) => (
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

      {/* Today's Mission */}
      <section className="mochi-card" aria-label="Today's Missions">
        <div className="flex items-center gap-2 mb-3">
          <Target className="w-4 h-4 text-mochi-primary" />
          <h2 className="font-semibold text-mochi-text">Today&apos;s Missions</h2>
        </div>
        <div className="space-y-2">
          {mockMissions.map((mission) => (
            <div
              key={mission.id}
              className={cn(
                'flex items-center gap-3 p-3 rounded-lg border transition-colors',
                mission.status === 'completed'
                  ? 'bg-mochi-success/5 border-mochi-success/20'
                  : 'bg-mochi-surface border-mochi-border hover:border-mochi-primary/30'
              )}
            >
              <div className={cn(
                'w-8 h-8 rounded-full flex items-center justify-center shrink-0',
                mission.status === 'completed' ? 'bg-emerald-500 text-white' : 'bg-mochi-primary/10 text-mochi-primary'
              )}>
                {mission.status === 'completed' ? <CheckCircle2 className="w-4 h-4" /> : <Circle className="w-4 h-4" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className={cn(
                  'text-sm font-medium',
                  mission.status === 'completed' ? 'text-mochi-text-muted line-through' : 'text-mochi-text'
                )}>
                  {mission.title}
                </p>
                <p className="text-xs text-mochi-text-muted">{mission.description}</p>
              </div>
              <span className="text-xs font-medium text-mochi-secondary flex-shrink-0">{mission.reward}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Achievement Preview */}
      <section className="mochi-card" aria-label="Achievements">
        <div className="flex items-center gap-2 mb-3">
          <Trophy className="w-4 h-4 text-mochi-warning" />
          <h2 className="font-semibold text-mochi-text">Achievements</h2>
          <span className="ml-auto text-xs text-mochi-text-muted">{mockAchievements.filter((a) => a.unlocked).length}/{mockAchievements.length}</span>
        </div>
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
          {mockAchievements.map((achievement) => (
            <div
              key={achievement.id}
              className={cn(
                'flex-shrink-0 flex flex-col items-center gap-1 p-4 rounded-xl border min-w-[100px] text-center',
                achievement.unlocked
                  ? 'bg-mochi-warning/5 border-mochi-warning/20'
                  : 'bg-mochi-surface border-mochi-border opacity-60'
              )}
            >
              <MochiIcon id={achievement.icon} size="md" style="rounded-badge" />
              <p className="text-xs font-medium text-mochi-text">{achievement.name}</p>
              {achievement.unlocked && <Star className="w-3 h-3 text-mochi-warning" />}
            </div>
          ))}
        </div>
      </section>

      {/* Calendar Preview */}
      <section className="mochi-card" aria-label="Upcoming Events">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-mochi-secondary" />
            <h2 className="font-semibold text-mochi-text">Upcoming</h2>
          </div>
          <Link to="/calendar" className="text-xs text-mochi-primary hover:underline flex items-center gap-1">
            View Calendar <ChevronRight className="w-3 h-3" />
          </Link>
        </div>
        <div className="space-y-2">
          {upcomingEvents.map((event) => (
            <div
              key={event.id}
              className="flex items-center gap-3 p-3 rounded-lg bg-mochi-surface border border-mochi-border hover:border-mochi-border transition-colors"
            >
              <div
                className="w-1 h-10 rounded-full flex-shrink-0"
                style={{ backgroundColor: event.color }}
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-mochi-text truncate">{event.title}</p>
                <p className="text-xs text-mochi-text-muted">
                  {formatDate(event.date)}
                </p>
              </div>
              {event.amount && (
                <span className={cn(
                  'text-sm font-semibold',
                  event.type === 'income' ? 'text-mochi-success' : 'text-mochi-error'
                )}>
                  {event.type === 'income' ? '+' : '-'}{formatCurrency(event.amount)}
                </span>
              )}
            </div>
          ))}
          {upcomingEvents.length === 0 && (
            <p className="text-sm text-mochi-text-muted text-center py-4">No upcoming events</p>
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

      {/* Streak */}
      <section className="mochi-card flex items-center gap-3" aria-label="Streak">
        <div className="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-900/20 flex items-center justify-center">
          <Flame className="w-5 h-5 text-orange-500" />
        </div>
        <div>
          <p className="text-sm font-medium text-mochi-text">3 Day Streak</p>
          <p className="text-xs text-mochi-text-muted">Keep logging to maintain your streak!</p>
        </div>
      </section>
    </motion.div>
  )
}
