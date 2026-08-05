import { useState, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  Plus,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
} from 'lucide-react'
import { useAppStore } from '@/store/appStore'
import { formatCurrency, cn, DEFAULT_EXPENSE_CATEGORIES } from '@/lib/utils'
import type { Budget } from '@/types'
import MochiIllustration from '@/components/ui/MochiIllustrations'
import MochiIcon from '@/components/ui/MochiIcons'

const iconMap: Record<string, string> = {}
DEFAULT_EXPENSE_CATEGORIES.forEach((c) => {
  iconMap[c.id] = c.icon
})

const iconCategoryMap: Record<string, string> = {
  Utensils: 'utensils', Car: 'car', ShoppingBag: 'shopping_bag', Receipt: 'receipt',
  Heart: 'heart', Gamepad2: 'gamepad', GraduationCap: 'graduation', Home: 'house',
  Smile: 'smile', Gift: 'gift_bag', Repeat: 'repeat', CreditCard: 'card',
  PiggyBank: 'piggy_bank', Ellipsis: 'receipt',
}

const aiSuggestions = [
  "You're on track! Keep it up this week.",
  "Consider reducing dining out this month.",
  "Try setting a lower limit to save more.",
  "Great job staying under budget!",
  "Watch your transport spending — it's rising.",
]

function calculateProgress(spent: number, limit: number) {
  return (spent / limit) * 100
}



function BudgetCard({ budget, spent }: { budget: Budget; spent: number }) {
  const category = DEFAULT_EXPENSE_CATEGORIES.find((c) => c.id === budget.categoryId)
  const iconName = category ? iconMap[category.id] : 'Utensils'
  const iconId = iconCategoryMap[iconName] || 'receipt'
  const remaining = budget.limit - spent
  const progress = calculateProgress(spent, budget.limit)

  const isOver = spent > budget.limit
  const isNear = !isOver && progress >= 80
  const aiSuggestion = aiSuggestions[Math.floor(Math.random() * aiSuggestions.length)]

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="mochi-card"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <MochiIcon
            id={iconId}
            size="md"
            style="rounded-badge"
            badgeBg={category?.color ? `${category.color}20` : undefined}
            badgeColor={category?.color}
          />
          <div>
            <h3 className="text-sm font-semibold text-mochi-text">{category?.name || budget.categoryId}</h3>
            <p className="text-xs text-mochi-text-muted capitalize">{budget.period}</p>
          </div>
        </div>
        {isOver ? (
          <span className="mochi-badge mochi-badge-error flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" /> Over
          </span>
        ) : isNear ? (
          <span className="mochi-badge mochi-badge-warning">Near Limit</span>
        ) : (
          <span className="mochi-badge mochi-badge-success flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> On Track
          </span>
        )}
      </div>

      {/* Progress Bar */}
      <div className="mb-3">
        <div className="flex justify-between text-xs mb-1">
          <span className="text-mochi-text-secondary">{formatCurrency(spent)}</span>
          <span className="text-mochi-text-muted">of {formatCurrency(budget.limit)}</span>
        </div>
        <div className="h-2 bg-mochi-border/50 rounded-full overflow-hidden">
          <div
            className={cn(
              'h-full rounded-full transition-all duration-500',
              isOver ? 'bg-mochi-error' : isNear ? 'bg-mochi-warning' : 'bg-mochi-primary'
            )}
            style={{ width: `${Math.min(100, progress)}%` }}
          />
        </div>
      </div>

      <div className="flex items-center justify-between">
        <p className={cn(
          'text-xs',
          remaining >= 0 ? 'text-mochi-success' : 'text-mochi-error'
        )}>
          {remaining >= 0 ? `${formatCurrency(remaining)} remaining` : `${formatCurrency(Math.abs(remaining))} over budget`}
        </p>
        <div className="flex items-center gap-1 text-xs text-mochi-text-muted">
          <Sparkles className="w-3 h-3" />
          <span>{aiSuggestion}</span>
        </div>
      </div>
    </motion.div>
  )
}

function EmptyBudgets() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <MochiIllustration type="empty_budget" size="lg" />
      <h3 className="text-lg font-semibold text-mochi-text">No budgets set</h3>
      <p className="mt-2 text-sm text-mochi-text-muted max-w-xs">
        Create budgets to track your spending by category and stay on top of your finances.
      </p>
    </div>
  )
}

export default function BudgetPage() {
  const { budgets } = useAppStore()
  const [isLoading, setIsLoading] = useState(true)

  const { transactions } = useAppStore()

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1000)
    return () => clearTimeout(timer)
  }, [])

  const categorySpentMap = useMemo(() => {
    const map: Record<string, number> = {}
    transactions.filter((t) => t.type === 'expense').forEach((t) => {
      map[t.categoryId] = (map[t.categoryId] || 0) + t.amount
    })
    return map
  }, [transactions])

  const allBudgets = budgets
  const totalBudget = allBudgets.reduce((sum, b) => sum + b.limit, 0)
  const totalSpent = allBudgets.reduce((sum, b) => sum + (categorySpentMap[b.categoryId] || 0), 0)
  const totalRemaining = totalBudget - totalSpent

  if (isLoading) {
    return (
      <div className="space-y-3 animate-pulse" aria-busy="true">
        <div className="mochi-skeleton h-10 w-full" />
        <div className="mochi-skeleton h-32 w-full" />
        {[1, 2, 3].map((i) => (
          <div key={i} className="mochi-skeleton h-32 w-full" />
        ))}
      </div>
    )
  }

  return (
    <motion.div
      className="pb-20 md:pb-0"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      role="main"
      aria-label="Budget Management"
    >
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold text-mochi-text">Budgets</h1>
        <button className="mochi-btn-primary text-sm">
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Create Budget</span>
        </button>
      </div>

      {/* Summary Card */}
      <section className="mochi-card bg-gradient-to-br from-mochi-primary/5 to-mochi-secondary/5 mb-4" aria-label="Budget Summary">
        <h2 className="text-sm font-medium text-mochi-text-secondary mb-3">Monthly Summary</h2>
        <div className="grid grid-cols-3 gap-4 mb-3">
          <div>
            <p className="text-xs text-mochi-text-muted flex items-center gap-1">
              <Wallet className="w-3 h-3" /> Budget
            </p>
            <p className="text-lg font-bold text-mochi-text">{formatCurrency(totalBudget)}</p>
          </div>
          <div>
            <p className="text-xs text-mochi-text-muted flex items-center gap-1">
              <ArrowUpRight className="w-3 h-3 text-mochi-error" /> Spent
            </p>
            <p className="text-lg font-bold text-mochi-error">{formatCurrency(totalSpent)}</p>
          </div>
          <div>
            <p className="text-xs text-mochi-text-muted flex items-center gap-1">
              <ArrowDownLeft className="w-3 h-3 text-mochi-success" /> Remaining
            </p>
            <p className={cn(
              'text-lg font-bold',
              totalRemaining >= 0 ? 'text-mochi-success' : 'text-mochi-error'
            )}>
              {formatCurrency(Math.abs(totalRemaining))}
            </p>
          </div>
        </div>

        {/* Overall Progress */}
        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-mochi-text-secondary">
              {((totalSpent / totalBudget) * 100).toFixed(0)}% used
            </span>
            <span className="text-mochi-text-muted">{formatCurrency(totalRemaining)} left</span>
          </div>
          <div className="h-3 bg-mochi-border/50 rounded-full overflow-hidden">
            <div
              className={cn(
                'h-full rounded-full transition-all duration-700 bg-gradient-to-r',
                totalSpent / totalBudget > 1
                  ? 'from-mochi-error to-mochi-error'
                  : totalSpent / totalBudget > 0.8
                  ? 'from-mochi-warning to-mochi-error'
                  : 'from-mochi-primary to-mochi-secondary'
              )}
              style={{ width: `${Math.min(100, (totalSpent / totalBudget) * 100)}%` }}
            />
          </div>
        </div>
      </section>

      {/* Budget Cards */}
      <section aria-label="Budget Categories">
        <h2 className="text-sm font-semibold text-mochi-text-secondary mb-2 uppercase tracking-wide">By Category</h2>
        {allBudgets.length === 0 ? (
          <EmptyBudgets />
        ) : (
          <div className="grid gap-3">
            {allBudgets.map((budget) => (
              <BudgetCard
                key={budget.id}
                budget={budget}
                spent={categorySpentMap[budget.categoryId] || 0}
              />
            ))}
          </div>
        )}
      </section>
    </motion.div>
  )
}
