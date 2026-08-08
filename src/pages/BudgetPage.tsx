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
import { useAppStore, getUid } from '@/store/appStore'
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
            <AlertTriangle className="w-3 h-3" /> A little over
          </span>
        ) : isNear ? (
          <span className="mochi-badge mochi-badge-warning">Almost there!</span>
        ) : (
          <span className="mochi-badge mochi-badge-success flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> Looking good
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
          'text-xs font-medium',
          remaining >= 0 ? 'text-mochi-success' : 'text-mochi-error'
        )}>
          {remaining >= 0 ? `${formatCurrency(remaining)} still yours` : `${formatCurrency(Math.abs(remaining))} over — tomorrow's a fresh start`}
        </p>
        <div className="flex items-center gap-1 text-xs text-mochi-text-muted">
          <Sparkles className="w-3 h-3" />
          <span>{aiSuggestion}</span>
        </div>
      </div>
    </motion.div>
  )
}

import Dialog from '@/components/ui/Dialog'

function EmptyBudgets({ onOpenModal }: { onOpenModal: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <MochiIllustration type="empty_budget" size="lg" />
      <h3 className="text-lg font-semibold text-mochi-text mt-3">No plans yet</h3>
      <p className="mt-2 text-sm text-mochi-text-muted max-w-xs mb-4">
        Setting a budget plan helps you feel calm and in control. Start small — any plan beats no plan!
      </p>
      <button onClick={onOpenModal} className="mochi-btn-primary text-xs flex items-center gap-1.5 py-2.5 px-4 cursor-pointer hover:scale-105 transition-transform">
        <Plus className="w-4 h-4" />
        <span>Create First Plan</span>
      </button>
    </div>
  )
}

import PaywallModal from '@/components/modals/PaywallModal'
import { checkCanAddBudget } from '@/lib/paywall'
import { useAuthStore } from '@/store/authStore'

export default function BudgetPage() {
  const { user } = useAuthStore()
  const { budgets, transactions, addBudget } = useAppStore()
  const [isLoading, setIsLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [showPaywall, setShowPaywall] = useState(false)
  
  const [selectedCategory, setSelectedCategory] = useState(DEFAULT_EXPENSE_CATEGORIES[0]?.id || 'food')
  const [limitAmount, setLimitAmount] = useState('')
  const [period, setPeriod] = useState<'monthly' | 'weekly' | 'custom'>('monthly')

  // Spend Calculator State
  const [calcCategory, setCalcCategory] = useState('food')
  const [calcAmount, setCalcAmount] = useState('')

  const [monthlyIncomeInput] = useState('30000')

  const handleApply503020 = () => {
    const income = parseFloat(monthlyIncomeInput) || 30000
    const needs = income * 0.5
    const wants = income * 0.3
    const today = new Date().toISOString().split('T')[0]

    addBudget({ id: `budget_${Date.now()}_1`, userId: getUid(), categoryId: 'housing', limit: Math.round(needs * 0.5), period: 'monthly', startDate: today, recurring: true, notifications: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() })
    addBudget({ id: `budget_${Date.now()}_2`, userId: getUid(), categoryId: 'food', limit: Math.round(needs * 0.5), period: 'monthly', startDate: today, recurring: true, notifications: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() })
    addBudget({ id: `budget_${Date.now()}_3`, userId: getUid(), categoryId: 'entertainment', limit: Math.round(wants), period: 'monthly', startDate: today, recurring: true, notifications: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() })
  }

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 500)
    return () => clearTimeout(timer)
  }, [])

  const handleCreateBudgetSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const limit = parseFloat(limitAmount)
    if (isNaN(limit) || limit <= 0) return

    const newBudget: Budget = {
      id: `budget_${Date.now()}`,
      userId: getUid(),
      categoryId: selectedCategory,
      limit,
      period,
      startDate: new Date().toISOString().split('T')[0],
      recurring: true,
      notifications: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    addBudget(newBudget)
    setIsModalOpen(false)
    setLimitAmount('')
  }

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
      {/* Create Budget Dialog */}
      <Dialog isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create Spending Plan">
        <form onSubmit={handleCreateBudgetSubmit} className="space-y-4 pt-2">
          <div>
            <label className="block text-xs font-bold text-mochi-text-secondary mb-1">Category *</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="mochi-input text-xs w-full font-bold"
            >
              {DEFAULT_EXPENSE_CATEGORIES.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-mochi-text-secondary mb-1">Limit Amount (PHP) *</label>
            <input
              type="number"
              required
              min="1"
              placeholder="e.g. 5000"
              value={limitAmount}
              onChange={(e) => setLimitAmount(e.target.value)}
              className="mochi-input text-xs w-full font-bold"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-mochi-text-secondary mb-1">Budget Period</label>
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value as any)}
              className="mochi-input text-xs w-full font-semibold"
            >
              <option value="monthly">Monthly</option>
              <option value="weekly">Weekly</option>
              <option value="annual">Annual</option>
            </select>
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
              Create Plan
            </button>
          </div>
        </form>
      </Dialog>

      <PaywallModal
        isOpen={showPaywall}
        onClose={() => setShowPaywall(false)}
        featureTitle="Unlock Unlimited Budgets"
        featureDescription="Free tier is limited to 3 active budget categories. Upgrade to Pro ₱199.00 for unlimited budget plans!"
      />

      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-xl font-bold text-mochi-text">Your Plans</h1>
          <p className="text-xs text-mochi-text-muted mt-0.5">Stay cozy with your spending</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleApply503020}
            className="mochi-btn-secondary text-xs py-2 px-3 flex items-center gap-1.5 shadow-xs"
            title="Auto-calculate 50/30/20 budget"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>50/30/20 Auto</span>
          </button>
          <button
            onClick={() => {
              if (!checkCanAddBudget(user, budgets.length)) {
                setShowPaywall(true)
              } else {
                setIsModalOpen(true)
              }
            }}
            className="mochi-btn-primary text-sm flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">New Plan</span>
          </button>
        </div>
      </div>

      {/* "Can I Spend This?" Interactive Budget Calculator */}
      <section className="mochi-card bg-gradient-to-r from-mochi-primary/10 via-purple-500/10 to-sky-400/10 border border-mochi-primary/30 mb-4 p-4 rounded-3xl shadow-xs space-y-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-mochi-primary" />
          <h3 className="text-sm font-black text-mochi-text">"Can I Spend This?" Calculator</h3>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <div>
            <label className="block text-[10px] font-black uppercase text-mochi-text-secondary mb-1">Target Category</label>
            <select
              value={calcCategory}
              onChange={(e) => setCalcCategory(e.target.value)}
              className="mochi-input text-xs font-bold w-full"
            >
              {DEFAULT_EXPENSE_CATEGORIES.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-black uppercase text-mochi-text-secondary mb-1">Planned Amount (PHP)</label>
            <input
              type="number"
              placeholder="e.g. 500"
              value={calcAmount}
              onChange={(e) => setCalcAmount(e.target.value)}
              className="mochi-input text-xs font-bold w-full"
            />
          </div>
        </div>

        {calcAmount && !isNaN(parseFloat(calcAmount)) && (() => {
          const amt = parseFloat(calcAmount)
          const catObj = DEFAULT_EXPENSE_CATEGORIES.find((c) => c.id === calcCategory)
          const catBudget = budgets.find((b) => b.categoryId === calcCategory)
          const spent = categorySpentMap[calcCategory] || 0
          const remBefore = catBudget ? catBudget.limit - spent : 1000 - spent
          const remAfter = remBefore - amt

          const isSafe = remAfter >= 0

          return (
            <div className={cn(
              'p-3 rounded-2xl border text-xs font-bold flex items-center gap-2 transition-all',
              isSafe ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-700 dark:text-emerald-300' : 'bg-rose-500/15 border-rose-500/30 text-rose-700 dark:text-rose-300'
            )}>
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>
                {isSafe
                  ? `Yes! Mochi says: You'll have ${formatCurrency(remAfter)} remaining in ${catObj?.name || 'this category'}.`
                  : `Careful! Spending ${formatCurrency(amt)} will put ${catObj?.name || 'this category'} ${formatCurrency(Math.abs(remAfter))} over budget.`}
              </span>
            </div>
          )
        })()}
      </section>

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
          <EmptyBudgets onOpenModal={() => setIsModalOpen(true)} />
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
