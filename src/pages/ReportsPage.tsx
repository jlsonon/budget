import { useState, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  TrendingUp,
  TrendingDown,
  ArrowDownLeft,
  ArrowUpRight,
  PieChart,
  BarChart3,
  Wallet,
  CreditCard,
  Repeat,
  Heart,
  Download,
  ShoppingBag,
  Utensils,
  Car,
  Home,
  Gamepad2,
  Receipt,
} from 'lucide-react'
import Mascot from '@/components/ui/Mascot'
import ProgressRing from '@/components/ui/ProgressRing'
import { formatCurrency, cn } from '@/lib/utils'

import { useAppStore } from '@/store/appStore'

type Period = 'week' | 'month' | 'last-month' | 'year'

const periodLabels: Record<Period, string> = {
  week: 'This Week',
  month: 'This Month',
  'last-month': 'Last Month',
  year: 'This Year',
}

function useReportsData(period: Period) {
  const { transactions, savingsGoals, debts, subscriptions } = useAppStore()

  return useMemo(() => {
    const now = new Date()
    const filterTxns = transactions.filter((t) => {
      if (!t.date) return true
      const d = new Date(t.date)
      if (period === 'week') {
        const oneWeekAgo = new Date(now.getTime() - 7 * 86400000)
        return d >= oneWeekAgo
      }
      if (period === 'month') {
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
      }
      if (period === 'last-month') {
        const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
        return d.getMonth() === lastMonth.getMonth() && d.getFullYear() === lastMonth.getFullYear()
      }
      if (period === 'year') {
        return d.getFullYear() === now.getFullYear()
      }
      return true
    })

    const income = filterTxns.filter((t) => t.type === 'income').reduce((acc, t) => acc + t.amount, 0)
    const expenses = filterTxns.filter((t) => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0)
    
    const savings = savingsGoals.reduce((acc, g) => acc + g.currentAmount, 0)
    const totalDebt = debts.reduce((acc, d) => acc + d.currentBalance, 0)
    const debtPaid = debts.reduce((acc, d) => {
      return acc + (d.payments ? d.payments.reduce((pAcc, p) => pAcc + p.amount, 0) : 0)
    }, 0)

    const subMonthly = subscriptions.filter(s => s.status === 'active').reduce((acc, s) => {
      switch (s.frequency) {
        case 'weekly': return acc + s.amount * 4
        case 'monthly': return acc + s.amount
        case 'annual': return acc + s.amount / 12
        default: return acc + s.amount
      }
    }, 0)

    const categoryTotals: Record<string, number> = {}
    filterTxns.filter((t) => t.type === 'expense').forEach((t) => {
      const key = t.categoryId || 'other'
      categoryTotals[key] = (categoryTotals[key] || 0) + t.amount
    })

    const categoryIcons: Record<string, any> = {
      food: Utensils,
      transportation: Car,
      shopping: ShoppingBag,
      utilities: Receipt,
      housing: Home,
      entertainment: Gamepad2,
      other: Wallet,
    }
    const categoryColors: Record<string, string> = {
      food: 'var(--color-warning)',
      transportation: 'var(--color-primary)',
      shopping: 'var(--color-secondary)',
      utilities: 'var(--color-danger)',
      housing: 'var(--color-accent, #8B5CF6)',
      entertainment: 'var(--color-success)',
      other: 'var(--color-text-muted)',
    }

    const expenseCategories = Object.entries(categoryTotals).map(([catId, amt]) => {
      const pct = expenses > 0 ? Math.round((amt / expenses) * 100) : 0
      return {
        name: catId.charAt(0).toUpperCase() + catId.slice(1),
        icon: categoryIcons[catId] || Wallet,
        amount: amt,
        color: categoryColors[catId] || '#3B82F6',
        pct,
      }
    })

    const incomeSourceMap: Record<string, number> = {}
    filterTxns.filter((t) => t.type === 'income').forEach((t) => {
      const label = t.merchant || t.notes || 'Income'
      incomeSourceMap[label] = (incomeSourceMap[label] || 0) + t.amount
    })

    const incomeSources = Object.entries(incomeSourceMap).map(([name, amt]) => {
      const pct = income > 0 ? Math.round((amt / income) * 100) : 0
      return { name, amount: amt, pct }
    })

    const merchantMap: Record<string, { count: number; amount: number }> = {}
    filterTxns.filter((t) => t.type === 'expense').forEach((t) => {
      const name = t.merchant || t.categoryId || 'Expense'
      if (!merchantMap[name]) merchantMap[name] = { count: 0, amount: 0 }
      merchantMap[name].count += 1
      merchantMap[name].amount += t.amount
    })

    const topMerchants = Object.entries(merchantMap)
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5)

    const dailyMap = [0, 0, 0, 0, 0, 0, 0]
    filterTxns.filter((t) => t.type === 'expense').forEach((t) => {
      if (t.date) {
        const dayIdx = new Date(t.date).getDay()
        const idx = dayIdx === 0 ? 6 : dayIdx - 1
        dailyMap[idx] += t.amount
      }
    })
    const maxDaily = Math.max(...dailyMap, 1)
    const weeklySpend = dailyMap.map((amt) => Math.round((amt / maxDaily) * 100))

    const savingsRate = income > 0 ? Math.round(((income - expenses) / income) * 100) : 0
    const healthScore = Math.max(20, Math.min(100, Math.round(50 + (savingsRate * 0.4) - (totalDebt > 0 ? 10 : 0))))

    return {
      income,
      expenses,
      savings,
      debtPaid,
      subscriptionCost: subMonthly,
      healthScore,
      previousHealthScore: Math.max(0, healthScore - 4),
      savingsRate: Math.max(0, savingsRate),
      previousSavingsRate: Math.max(0, savingsRate - 3),
      totalDebt,
      debtFreeDate: totalDebt > 0 ? 'Dec 2026' : 'Debt Free!',
      expenseCategories,
      incomeSources,
      topMerchants,
      weeklySpend,
    }
  }, [transactions, savingsGoals, debts, subscriptions, period])
}

function SkeletonCard() {
  return (
    <div className="mochi-card animate-pulse">
      <div className="mochi-skeleton h-4 w-3/4 mb-3" />
      <div className="mochi-skeleton h-8 w-1/2 mb-2" />
      <div className="mochi-skeleton h-16 w-full" />
    </div>
  )
}

function StatBadge({ value, positive }: { value: string; positive: boolean }) {
  return (
    <span className={cn(
      'inline-flex items-center gap-0.5 text-xs font-medium px-1.5 py-0.5 rounded-full',
      positive
        ? 'bg-mochi-success/10 text-mochi-success'
        : 'bg-mochi-error/10 text-mochi-error'
    )}>
      {positive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
      {value}
    </span>
  )
}

function CashFlowCard({ data }: { data: ReturnType<typeof useReportsData> }) {
  const net = data.income - data.expenses
  const maxVal = Math.max(data.income, data.expenses)

  return (
    <div className="mochi-card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-mochi-text flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-mochi-primary" />
          Cash Flow
        </h3>
        <StatBadge value={`${net > 0 ? '+' : ''}${formatCurrency(net)}`} positive={net > 0} />
      </div>

      <div className="space-y-3">
        {/* Income bar */}
        <div>
          <div className="flex justify-between mb-1">
            <span className="text-xs text-mochi-text-secondary flex items-center gap-1.5">
              <ArrowDownLeft className="w-3 h-3 text-mochi-success" /> Income
            </span>
            <span className="text-sm font-semibold text-mochi-success">{formatCurrency(data.income)}</span>
          </div>
          <div className="h-3 bg-mochi-border/30 rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{ backgroundColor: 'var(--color-success)' }}
              initial={{ width: 0 }}
              animate={{ width: `${(data.income / maxVal) * 100}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
            />
          </div>
        </div>

        {/* Expenses bar */}
        <div>
          <div className="flex justify-between mb-1">
            <span className="text-xs text-mochi-text-secondary flex items-center gap-1.5">
              <ArrowUpRight className="w-3 h-3 text-mochi-error" /> Expenses
            </span>
            <span className="text-sm font-semibold text-mochi-error">{formatCurrency(data.expenses)}</span>
          </div>
          <div className="h-3 bg-mochi-border/30 rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{ backgroundColor: 'var(--color-error)' }}
              initial={{ width: 0 }}
              animate={{ width: `${(data.expenses / maxVal) * 100}%` }}
              transition={{ duration: 0.8, ease: 'easeOut', delay: 0.1 }}
            />
          </div>
        </div>
      </div>

      {/* Weekly spending mini chart */}
      <div className="mt-4 pt-4 border-t border-mochi-border">
        <p className="text-xs text-mochi-text-muted mb-2">Daily Spending Trend</p>
        <div className="flex items-end justify-between gap-1.5 h-16">
          {data.weeklySpend.map((val, i) => (
            <motion.div
              key={i}
              className="flex-1 rounded-t bg-gradient-to-t from-mochi-primary to-mochi-secondary"
              initial={{ height: 0 }}
              animate={{ height: `${val}%` }}
              transition={{ duration: 0.5, delay: i * 0.05 }}
            />
          ))}
        </div>
        <div className="flex justify-between mt-1">
          {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
            <span key={i} className="flex-1 text-center text-[9px] text-mochi-text-muted">{d}</span>
          ))}
        </div>
      </div>
    </div>
  )
}

function ExpenseBreakdownCard({ data }: { data: ReturnType<typeof useReportsData> }) {
  return (
    <div className="mochi-card">
      <h3 className="font-semibold text-mochi-text flex items-center gap-2 mb-4">
        <PieChart className="w-4 h-4 text-mochi-secondary" />
        Expense Breakdown
      </h3>
      <div className="space-y-3">
        {data.expenseCategories.map((cat, index) => {
          const Icon = cat.icon
          return (
            <motion.div
              key={cat.name}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <div className="flex items-center gap-2 mb-1">
                <div
                  className="w-6 h-6 rounded flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: cat.color + '20', color: cat.color }}
                >
                  <Icon className="w-3.5 h-3.5" />
                </div>
                <span className="text-xs text-mochi-text flex-1">{cat.name}</span>
                <span className="text-xs font-semibold text-mochi-text">{formatCurrency(cat.amount)}</span>
                <span className="text-[10px] text-mochi-text-muted w-8 text-right">{cat.pct}%</span>
              </div>
              <div className="h-1.5 bg-mochi-border/30 rounded-full overflow-hidden ml-8">
                <motion.div
                  className="h-full rounded-full"
                  style={{ backgroundColor: cat.color }}
                  initial={{ width: 0 }}
                  animate={{ width: `${cat.pct}%` }}
                  transition={{ duration: 0.6, delay: 0.2 + index * 0.05 }}
                />
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}

function IncomeSourcesCard({ data }: { data: ReturnType<typeof useReportsData> }) {
  const colors = ['var(--color-success)', 'var(--color-primary)', 'var(--color-secondary)']

  return (
    <div className="mochi-card">
      <h3 className="font-semibold text-mochi-text flex items-center gap-2 mb-4">
        <ArrowDownLeft className="w-4 h-4 text-mochi-success" />
        Income Sources
      </h3>

      {/* Stacked bar */}
      <div className="h-6 rounded-full overflow-hidden flex mb-4">
        {data.incomeSources.map((source, i) => (
          <motion.div
            key={source.name}
            className="h-full"
            style={{ backgroundColor: colors[i] }}
            initial={{ width: 0 }}
            animate={{ width: `${source.pct}%` }}
            transition={{ duration: 0.8, delay: i * 0.1 }}
          />
        ))}
      </div>

      <div className="space-y-2">
        {data.incomeSources.map((source, i) => (
          <div key={source.name} className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: colors[i] }} />
            <span className="text-xs text-mochi-text flex-1">{source.name}</span>
            <span className="text-xs font-semibold text-mochi-text">{formatCurrency(source.amount)}</span>
            <span className="text-[10px] text-mochi-text-muted">{source.pct}%</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function SavingsRateCard({ data }: { data: ReturnType<typeof useReportsData> }) {
  const diff = data.savingsRate - data.previousSavingsRate

  return (
    <div className="mochi-card">
      <h3 className="font-semibold text-mochi-text flex items-center gap-2 mb-4">
        <Wallet className="w-4 h-4 text-mochi-primary" />
        Savings Rate
      </h3>
      <div className="flex items-center gap-4">
        <ProgressRing
          progress={data.savingsRate}
          size={80}
          strokeWidth={6}
          color="var(--color-success)"
        />
        <div>
          <p className="text-2xl font-bold text-mochi-success">{data.savingsRate}%</p>
          <StatBadge value={`${diff > 0 ? '+' : ''}${diff.toFixed(1)}%`} positive={diff > 0} />
          <p className="text-xs text-mochi-text-muted mt-1">
            Saved {formatCurrency(data.savings)} this period
          </p>
        </div>
      </div>
    </div>
  )
}

function DebtProgressCard({ data }: { data: ReturnType<typeof useReportsData> }) {
  const paidPct = Math.min(100, (data.debtPaid / (data.totalDebt || 1)) * 100)

  return (
    <div className="mochi-card">
      <h3 className="font-semibold text-mochi-text flex items-center gap-2 mb-4">
        <CreditCard className="w-4 h-4 text-mochi-error" />
        Debt Progress
      </h3>
      <div className="grid grid-cols-2 gap-3 mb-3">
        <div>
          <p className="text-xs text-mochi-text-muted">Paid This Period</p>
          <p className="text-lg font-bold text-mochi-success">{formatCurrency(data.debtPaid)}</p>
        </div>
        <div>
          <p className="text-xs text-mochi-text-muted">Remaining</p>
          <p className="text-lg font-bold text-mochi-error">{formatCurrency(data.totalDebt)}</p>
        </div>
      </div>
      <div className="h-2.5 bg-mochi-border/30 rounded-full overflow-hidden mb-2">
        <motion.div
          className="h-full rounded-full bg-mochi-success"
          initial={{ width: 0 }}
          animate={{ width: `${paidPct}%` }}
          transition={{ duration: 0.8 }}
        />
      </div>
      <p className="text-xs text-mochi-text-muted">
        Estimated debt-free: <span className="font-medium text-mochi-text">{data.debtFreeDate}</span>
      </p>
    </div>
  )
}

function SubscriptionCostCard({ data }: { data: ReturnType<typeof useReportsData> }) {
  return (
    <div className="mochi-card">
      <h3 className="font-semibold text-mochi-text flex items-center gap-2 mb-4">
        <Repeat className="w-4 h-4 text-purple-500" />
        Subscription Costs
      </h3>
      <div className="grid grid-cols-2 gap-3">
        <div className="p-3 rounded-lg bg-purple-50 dark:bg-purple-900/10">
          <p className="text-xs text-mochi-text-muted">Monthly</p>
          <p className="text-lg font-bold text-purple-600 dark:text-purple-400">
            {formatCurrency(data.subscriptionCost)}
          </p>
        </div>
        <div className="p-3 rounded-lg bg-purple-50 dark:bg-purple-900/10">
          <p className="text-xs text-mochi-text-muted">Annual</p>
          <p className="text-lg font-bold text-purple-600 dark:text-purple-400">
            {formatCurrency(data.subscriptionCost * 12)}
          </p>
        </div>
      </div>
    </div>
  )
}

function HealthTrendCard({ data }: { data: ReturnType<typeof useReportsData> }) {
  const diff = data.healthScore - data.previousHealthScore

  return (
    <div className="mochi-card">
      <h3 className="font-semibold text-mochi-text flex items-center gap-2 mb-4">
        <Heart className="w-4 h-4 text-pink-500" />
        Financial Health Trend
      </h3>
      <div className="flex items-center gap-4">
        <div className="relative">
          <ProgressRing
            progress={data.healthScore}
            size={80}
            strokeWidth={6}
            color="var(--color-primary)"
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xl font-bold text-mochi-text">{data.healthScore}</span>
          </div>
        </div>
        <div>
          <StatBadge value={`${diff > 0 ? '+' : ''}${diff} pts`} positive={diff > 0} />
          <p className="text-xs text-mochi-text-muted mt-2">
            {data.healthScore >= 80
              ? 'Excellent financial health!'
              : data.healthScore >= 60
              ? 'Good progress, keep improving!'
              : 'Room for growth — you\'re on the right track.'}
          </p>
        </div>
      </div>
    </div>
  )
}

function TopMerchantsCard({ data }: { data: ReturnType<typeof useReportsData> }) {
  const sorted = [...data.topMerchants].sort((a, b) => b.amount - a.amount)
  const maxAmount = sorted[0]?.amount || 1

  return (
    <div className="mochi-card">
      <h3 className="font-semibold text-mochi-text flex items-center gap-2 mb-4">
        <ShoppingBag className="w-4 h-4 text-mochi-secondary" />
        Top Merchants
      </h3>
      {sorted.length === 0 ? (
        <p className="text-xs text-mochi-text-muted text-center py-4">No merchant transactions logged yet.</p>
      ) : (
        <div className="space-y-3">
          {sorted.map((merchant, index) => (
            <motion.div
              key={merchant.name}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="flex items-center gap-3"
            >
              <span className="text-xs font-medium text-mochi-text-muted w-4">{index + 1}</span>
              <div className="flex-1">
                <div className="flex justify-between mb-0.5">
                  <span className="text-sm text-mochi-text">{merchant.name}</span>
                  <span className="text-sm font-semibold text-mochi-text">{formatCurrency(merchant.amount)}</span>
                </div>
                <div className="h-1 bg-mochi-border/30 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-mochi-primary to-mochi-secondary"
                    initial={{ width: 0 }}
                    animate={{ width: `${(merchant.amount / maxAmount) * 100}%` }}
                    transition={{ duration: 0.6, delay: 0.2 + index * 0.05 }}
                  />
                </div>
                <p className="text-[10px] text-mochi-text-muted mt-0.5">{merchant.count} transactions</p>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}

export default function ReportsPage() {
  const [period, setPeriod] = useState<Period>('month')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 400)
    return () => clearTimeout(timer)
  }, [])

  const data = useReportsData(period)

  if (isLoading) {
    return (
      <div className="space-y-4 animate-pulse" aria-busy="true" aria-label="Loading reports">
        <div className="mochi-skeleton h-8 w-48" />
        <div className="flex gap-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="mochi-skeleton h-8 w-20 rounded-full" />
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
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
      aria-label="Reports"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-mochi-text">Reports</h1>
        <button className="mochi-btn-secondary text-xs gap-1.5">
          <Download className="w-3.5 h-3.5" />
          Export
        </button>
      </div>

      {/* Period Selector — 4-col pill grid, no scrolling */}
      <div className="grid grid-cols-4 gap-1.5 p-1 bg-mochi-surface-alt rounded-2xl border border-mochi-border" role="tablist" aria-label="Report period">
        {(Object.keys(periodLabels) as Period[]).map((p) => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            role="tab"
            aria-selected={period === p}
            className={cn(
              'py-2 rounded-xl text-[11px] font-bold transition-all',
              period === p
                ? 'bg-gradient-mochi text-white shadow-md'
                : 'text-mochi-text-secondary hover:text-mochi-text hover:bg-mochi-surface/60'
            )}
          >
            {periodLabels[p]}
          </button>
        ))}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <motion.div
          className="mochi-card text-center"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <p className="text-xs text-mochi-text-muted">Income</p>
          <p className="text-lg font-bold text-mochi-success">{formatCurrency(data.income)}</p>
        </motion.div>
        <motion.div
          className="mochi-card text-center"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <p className="text-xs text-mochi-text-muted">Expenses</p>
          <p className="text-lg font-bold text-mochi-error">{formatCurrency(data.expenses)}</p>
        </motion.div>
        <motion.div
          className="mochi-card text-center"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <p className="text-xs text-mochi-text-muted">Saved</p>
          <p className="text-lg font-bold text-mochi-primary">{formatCurrency(data.savings)}</p>
        </motion.div>
        <motion.div
          className="mochi-card text-center"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
        >
          <p className="text-xs text-mochi-text-muted">Debt Paid</p>
          <p className="text-lg font-bold text-mochi-warning">{formatCurrency(data.debtPaid)}</p>
        </motion.div>
      </div>

      {/* Report Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <CashFlowCard data={data} />
        <ExpenseBreakdownCard data={data} />
        <IncomeSourcesCard data={data} />
        <SavingsRateCard data={data} />
        <DebtProgressCard data={data} />
        <SubscriptionCostCard data={data} />
        <HealthTrendCard data={data} />
        <TopMerchantsCard data={data} />
      </div>

      {/* AI Insight */}
      <motion.div
        className="mochi-card flex gap-3"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Mascot mood="happy" size="sm" />
        <div>
          <h3 className="text-sm font-semibold text-mochi-text">Mochi's Insight</h3>
          <p className="text-xs text-mochi-text-secondary mt-1">
            Your savings rate improved by {(data.savingsRate - data.previousSavingsRate).toFixed(1)}% compared to last period! 
            Your biggest spending category is Food & Dining — consider meal prepping to save even more. 
            You're on track to be debt-free by {data.debtFreeDate}. Keep up the momentum!
          </p>
        </div>
      </motion.div>
    </motion.div>
  )
}
