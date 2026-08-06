import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Plus,
  PiggyBank,
  Target,
  CheckCircle2,
  Star,
  Calendar,
} from 'lucide-react'
import ProgressRing from '@/components/ui/ProgressRing'
import MochiIcon from '@/components/ui/MochiIcons'
import MochiIllustration from '@/components/ui/MochiIllustrations'
import { useAppStore, getUid } from '@/store/appStore'
import { formatCurrency, cn, calculateProgress } from '@/lib/utils'
import type { SavingsGoal } from '@/types'
import Dialog from '@/components/ui/Dialog'

const goalIcons: Record<string, string> = {
  travel: 'plane',
  emergency: 'vault',
  gadget: 'laptop',
  car: 'car',
  education: 'graduation',
  house: 'house',
  wedding: 'sparkles',
  other: 'star',
}



function GoalCard({ goal }: { goal: SavingsGoal }) {
  const progress = calculateProgress(goal.currentAmount, goal.targetAmount)
  const iconId = goalIcons[goal.icon] || 'star'

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="mochi-card flex flex-col items-center text-center gap-3"
    >
      <div className="relative inline-flex items-center justify-center">
        <ProgressRing
          progress={progress}
          size={100}
          strokeWidth={8}
          color={goal.color || 'var(--color-primary)'}
          showText={false}
        />
        <div className="absolute">
          <MochiIcon id={iconId} size="md" style="plain" className="text-mochi-text" />
        </div>
      </div>
      <div className="flex-1">
        <h3 className="text-sm font-semibold text-mochi-text">{goal.name}</h3>
        <p className={cn(
          'text-lg font-bold mt-1',
          progress >= 100 ? 'text-mochi-success' : 'text-mochi-text'
        )}>
          {formatCurrency(goal.currentAmount, goal.currency)}
        </p>
        <p className="text-xs text-mochi-text-muted">
          of {formatCurrency(goal.targetAmount, goal.currency)}
        </p>
      </div>
      <div className="w-full flex items-center justify-between text-xs text-mochi-text-muted">
        <span>{Math.round(progress)}% saved</span>
        {goal.deadline && (
          <span className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {new Date(goal.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </span>
        )}
      </div>
      {progress >= 100 && (
        <div className="flex items-center gap-1 text-mochi-success text-xs font-medium">
          <CheckCircle2 className="w-3 h-3" />
          Goal Completed!
        </div>
      )}
    </motion.div>
  )
}

function EmptySavings({ onOpenModal }: { onOpenModal: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <MochiIllustration type="empty_savings" size="lg" />
      <h3 className="text-lg font-semibold text-mochi-text mt-3">Dream it, save it!</h3>
      <p className="mt-2 text-sm text-mochi-text-muted max-w-xs">
        Your savings goals are like seeds — plant one today and watch it grow!
      </p>
      <button onClick={onOpenModal} className="mochi-btn-primary mt-4 cursor-pointer hover:scale-105 transition-transform flex items-center gap-1.5">
        <Plus className="w-4 h-4" />
        Plant First Goal
      </button>
    </div>
  )
}

export default function SavingsPage() {
  const { savingsGoals, addSavingsGoal } = useAppStore()
  const [isLoading, setIsLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const [goalName, setGoalName] = useState('')
  const [targetAmount, setTargetAmount] = useState('')
  const [goalCategory, setGoalCategory] = useState('travel')
  const [status, setStatus] = useState<'idle' | 'success'>('idle')

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 500)
    return () => clearTimeout(timer)
  }, [])

  const allGoals = savingsGoals
  const activeGoals = allGoals.filter((g) => g.currentAmount < g.targetAmount)
  const completedGoals = allGoals.filter((g) => g.currentAmount >= g.targetAmount)

  const totalSaved = allGoals.reduce((sum, g) => sum + g.currentAmount, 0)
  const totalTarget = allGoals.reduce((sum, g) => sum + g.targetAmount, 0)

  const handleCreateGoalSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const target = parseFloat(targetAmount)
    if (!goalName.trim() || isNaN(target) || target <= 0) return

    const newGoal: SavingsGoal = {
      id: `goal_${Date.now()}`,
      userId: getUid(),
      name: goalName.trim(),
      targetAmount: target,
      currentAmount: 0,
      currency: 'PHP',
      deadline: new Date(Date.now() + 180 * 86400000).toISOString(),
      icon: goalCategory,
      color: '#10B981',
      milestones: [],
      contributions: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    addSavingsGoal(newGoal)
    setStatus('success')

    setTimeout(() => {
      setStatus('idle')
      setGoalName('')
      setTargetAmount('')
      setIsModalOpen(false)
    }, 1200)
  }

  if (isLoading) {
    return (
      <div className="space-y-3 animate-pulse" aria-busy="true">
        <div className="mochi-skeleton h-10 w-full" />
        <div className="mochi-skeleton h-40 w-full" />
        <div className="grid grid-cols-2 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="mochi-skeleton h-48" />
          ))}
        </div>
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
      aria-label="Savings Goals"
    >
      {/* Create Goal Modal */}
      <Dialog isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create New Savings Goal">
        {status === 'success' ? (
          <div className="py-6 text-center space-y-2">
            <div className="w-12 h-12 bg-mochi-success/20 text-mochi-success rounded-full flex items-center justify-center mx-auto border border-mochi-success/30 animate-bounce">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-mochi-text">Savings Goal Created!</h4>
            <p className="text-xs text-mochi-text-secondary">Your new goal is ready to receive contributions.</p>
          </div>
        ) : (
          <form onSubmit={handleCreateGoalSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-mochi-text-secondary mb-1">Goal Name *</label>
              <input
                type="text"
                placeholder="e.g. Boracay Vacation, New iPhone, House Downpayment"
                value={goalName}
                onChange={(e) => setGoalName(e.target.value)}
                className="mochi-input text-xs w-full font-bold"
                autoFocus
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-mochi-text-secondary mb-1">Target Amount (PHP) *</label>
              <input
                type="number"
                placeholder="e.g. 50000"
                value={targetAmount}
                onChange={(e) => setTargetAmount(e.target.value)}
                className="mochi-input text-xs w-full font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-mochi-text-secondary mb-1">Category / Icon</label>
              <select
                value={goalCategory}
                onChange={(e) => setGoalCategory(e.target.value)}
                className="mochi-input text-xs w-full font-semibold"
              >
                <option value="travel">Travel & Trips</option>
                <option value="emergency">Emergency Fund</option>
                <option value="gadget">Gadget & Tech</option>
                <option value="car">Vehicle / Car</option>
                <option value="education">Education & Studies</option>
                <option value="house">Home & Real Estate</option>
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
                Create Savings Goal
              </button>
            </div>
          </form>
        )}
      </Dialog>

      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-xl font-bold text-mochi-text">Savings Goals</h1>
          <p className="text-xs text-mochi-text-muted mt-0.5">Every little bit counts toward your dreams</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="mochi-btn-primary text-sm flex items-center gap-1.5">
          <Plus className="w-4 h-4" />
          <span>New Dream</span>
        </button>
      </div>

      {/* Hero Total Saved */}
      <section className="mochi-card bg-gradient-to-br from-mochi-success/10 via-mochi-success/5 to-mochi-primary/5 mb-4" aria-label="Total Saved">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-full bg-mochi-success/10 flex items-center justify-center">
            <PiggyBank className="w-5 h-5 text-mochi-success" />
          </div>
          <div>
            <p className="text-sm text-mochi-text-secondary">Total Saved</p>
            <p className="text-2xl font-bold text-mochi-success">{formatCurrency(totalSaved)}</p>
          </div>
        </div>
        {totalTarget > 0 && (
          <>
            <div className="flex justify-between text-xs text-mochi-text-muted mb-1">
              <span>{((totalSaved / totalTarget) * 100).toFixed(0)}% of total target</span>
              <span>{formatCurrency(totalTarget)} target</span>
            </div>
            <div className="h-2 bg-mochi-border/50 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-mochi-success to-mochi-primary transition-all duration-700"
                style={{ width: `${Math.min(100, (totalSaved / totalTarget) * 100)}%` }}
              />
            </div>
          </>
        )}
        <div className="flex items-center gap-4 mt-3">
          <div className="flex items-center gap-1 text-xs text-mochi-text-secondary">
            <Target className="w-3 h-3" />
            {activeGoals.length} active
          </div>
          <div className="flex items-center gap-1 text-xs text-mochi-success">
            <Star className="w-3 h-3" />
            {completedGoals.length} completed
          </div>
        </div>
      </section>

      {/* Active Goals Grid */}
      {activeGoals.length > 0 && (
        <section aria-label="Active Goals">
          <h2 className="text-sm font-semibold text-mochi-text-secondary mb-2 uppercase tracking-wide">Active Goals</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {activeGoals.map((goal) => (
              <GoalCard key={goal.id} goal={goal} />
            ))}
          </div>
        </section>
      )}

      {/* Completed Goals */}
      {completedGoals.length > 0 && (
        <section aria-label="Completed Goals" className="mt-6">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-sm font-semibold text-mochi-text-secondary uppercase tracking-wide">Completed</h2>
            <span className="text-xs text-mochi-success flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> {completedGoals.length} done
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {completedGoals.map((goal) => (
              <GoalCard key={goal.id} goal={goal} />
            ))}
          </div>
        </section>
      )}

      {/* Empty State */}
      {allGoals.length === 0 && <EmptySavings onOpenModal={() => setIsModalOpen(true)} />}
    </motion.div>
  )
}
