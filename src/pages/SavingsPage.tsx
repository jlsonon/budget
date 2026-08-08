import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Plus,
  PiggyBank,
  Target,
  CheckCircle2,
  Star,
  Calendar,
  Coins,
  Sparkles,
} from 'lucide-react'
import Mascot from '@/components/ui/Mascot'
import ProgressRing from '@/components/ui/ProgressRing'
import MochiIcon from '@/components/ui/MochiIcons'
import MochiIllustration from '@/components/ui/MochiIllustrations'
import { useAppStore, getUid } from '@/store/appStore'
import { formatCurrency, cn, calculateProgress, formatDate } from '@/lib/utils'
import type { SavingsGoal } from '@/types'
import Dialog from '@/components/ui/Dialog'
import Confetti from '@/components/ui/Confetti'
import { useToastStore } from '@/store/toastStore'
import PaywallModal from '@/components/modals/PaywallModal'
import { checkCanAddSavingsGoal } from '@/lib/paywall'
import { useAuthStore } from '@/store/authStore'

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

interface GoalCardProps {
  goal: SavingsGoal
  onViewGoalClick: (goal: SavingsGoal) => void
}

function GoalCard({ goal, onViewGoalClick }: GoalCardProps) {
  const progress = calculateProgress(goal.currentAmount, goal.targetAmount)
  const iconId = goalIcons[goal.icon] || 'star'

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="mochi-card flex flex-col items-center text-center gap-3 relative overflow-hidden"
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
        <h3 className="text-sm font-bold text-mochi-text">{goal.name}</h3>
        <p className={cn(
          'text-lg font-black mt-1',
          progress >= 100 ? 'text-mochi-success' : 'text-mochi-primary'
        )}>
          {formatCurrency(goal.currentAmount, goal.currency)}
        </p>
        <p className="text-xs text-mochi-text-muted font-medium">
          of {formatCurrency(goal.targetAmount, goal.currency)}
        </p>
      </div>

      <div className="w-full flex items-center justify-between text-xs text-mochi-text-muted border-t border-mochi-border/50 pt-2 font-medium">
        <span>{Math.round(progress)}% saved</span>
        {goal.deadline && (
          <span className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {formatDate(goal.deadline)}
          </span>
        )}
      </div>

      <button
        onClick={() => onViewGoalClick(goal)}
        className="mochi-btn-primary w-full text-xs py-2 font-extrabold flex items-center justify-center gap-1.5 shadow-xs active:scale-95 transition-all cursor-pointer"
      >
        <Target className="w-3.5 h-3.5" /> View Goal & Details
      </button>
    </motion.div>
  )
}

function EmptySavings({ onOpenModal }: { onOpenModal: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <MochiIllustration type="empty_savings" size="lg" />
      <h3 className="text-lg font-bold text-mochi-text mt-3">Dream it, save it!</h3>
      <p className="mt-2 text-sm text-mochi-text-muted max-w-xs font-medium">
        Your savings goals are like seeds — plant one today and watch it grow!
      </p>
      <button onClick={onOpenModal} className="mochi-btn-primary mt-4 cursor-pointer hover:scale-105 transition-transform flex items-center gap-1.5 font-bold">
        <Plus className="w-4 h-4" />
        Plant First Goal
      </button>
    </div>
  )
}

export default function SavingsPage() {
  const { user } = useAuthStore()
  const { savingsGoals, addSavingsGoal, contributeToGoal, wallets, adjustWalletBalance, addTransaction } = useAppStore()
  const [isLoading, setIsLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [showPaywall, setShowPaywall] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)

  // View Goal Popup Modal & Edit State
  const [viewGoal, setViewGoal] = useState<SavingsGoal | null>(null)
  const [isEditingGoal, setIsEditingGoal] = useState(false)
  const [editName, setEditName] = useState('')
  const [editTarget, setEditTarget] = useState('')

  // New Goal State
  const [goalName, setGoalName] = useState('')
  const [targetAmount, setTargetAmount] = useState('')
  const [goalCategory, setGoalCategory] = useState('travel')
  const [status, setStatus] = useState<'idle' | 'success'>('idle')

  // Deposit Money Modal State
  const [depositGoal, setDepositGoal] = useState<SavingsGoal | null>(null)
  const [depositAmount, setDepositAmount] = useState('')
  const [depositWalletId, setDepositWalletId] = useState('')

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 400)
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

  const handleDepositSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!depositGoal) return
    const amt = parseFloat(depositAmount)
    if (isNaN(amt) || amt <= 0) return

    const wallet = wallets.find((w) => w.id === depositWalletId) || wallets[0]
    const walletId = wallet?.id

    // 1. Contribute to savings goal
    await contributeToGoal(depositGoal.id, amt)

    // 2. Deduct from selected wallet balance
    if (walletId) {
      await adjustWalletBalance(walletId, -amt)
    }

    // 3. Record expense transaction
    addTransaction({
      id: `txn_savings_${Date.now()}`,
      userId: user?.id || 'anon',
      type: 'expense',
      amount: amt,
      currency: 'PHP',
      categoryId: 'savings',
      walletId,
      merchant: `Deposit to ${depositGoal.name}`,
      paymentMethod: 'cash',
      date: new Date().toISOString().split('T')[0],
      notes: `Savings contribution towards ${depositGoal.name}`,
      isFavorite: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })

    useToastStore.getState().success(`Deposited ${formatCurrency(amt)} to ${depositGoal.name}!`, 'Deposit Added')

    setShowConfetti(true)
    setTimeout(() => setShowConfetti(false), 4000)

    setDepositGoal(null)
    setDepositAmount('')
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
      <Confetti isActive={showConfetti} />

      {/* View Goal Detail & Edit Popup Dialog */}
      <Dialog
        isOpen={!!viewGoal}
        onClose={() => {
          setViewGoal(null)
          setIsEditingGoal(false)
        }}
        title={viewGoal?.name || 'Goal Details'}
      >
        {viewGoal && (() => {
          const progress = calculateProgress(viewGoal.currentAmount, viewGoal.targetAmount)
          const rem = Math.max(0, viewGoal.targetAmount - viewGoal.currentAmount)

          // Mascot mood shifts at 25%, 50%, 75%, 90%, 100%
          const mascotMood = progress >= 100 ? 'celebrating' : progress >= 75 ? 'excited' : progress >= 50 ? 'happy' : 'working'

          return (
            <div className="space-y-4 pt-1">
              <div className="flex items-center gap-4 bg-mochi-surface-alt/70 p-4 rounded-3xl border border-mochi-border">
                <div className="relative inline-flex items-center justify-center shrink-0">
                  <ProgressRing
                    progress={progress}
                    size={72}
                    strokeWidth={6}
                    color={viewGoal.color || 'var(--color-primary)'}
                    showText={false}
                  />
                  <div className="absolute">
                    <Mascot size="sm" mood={mascotMood} animate={true} />
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="text-base font-black text-mochi-text truncate">{viewGoal.name}</h3>
                  <p className="text-sm font-black text-mochi-primary mt-0.5">
                    {formatCurrency(viewGoal.currentAmount)} <span className="text-xs text-mochi-text-muted font-bold">/ {formatCurrency(viewGoal.targetAmount)}</span>
                  </p>
                  <p className="text-xs font-bold text-mochi-text-secondary mt-1">
                    {progress >= 100 ? 'Goal Completed!' : `Remaining: ${formatCurrency(rem)}`}
                  </p>
                </div>
              </div>

              {/* Goal Velocity Forecast Advice Card (Zero Emojis) */}
              <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/15 via-rose-500/10 to-mochi-primary/15 border border-amber-500/30 text-xs font-bold space-y-1">
                <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 font-black">
                  <Sparkles className="w-4 h-4" /> Mochi Pace Forecast
                </div>
                <p className="text-mochi-text-secondary leading-relaxed">
                  "At your current pace, you'll reach {viewGoal.name} around {viewGoal.deadline ? formatDate(viewGoal.deadline) : 'Sept 18'}. Save ₱420/week to reach it by {viewGoal.deadline ? formatDate(viewGoal.deadline) : 'Sept 1'}!"
                </p>
              </div>

              {/* Milestone Checkpoints (25%, 50%, 75%, 90%, 100%) */}
              <div className="p-3 rounded-2xl bg-mochi-surface-alt/50 border border-mochi-border space-y-2">
                <span className="text-[10px] font-black uppercase text-mochi-text-muted tracking-wider">Milestones & Mascot Expressions</span>
                <div className="grid grid-cols-5 gap-1 text-center">
                  {[25, 50, 75, 90, 100].map((m) => {
                    const isReached = progress >= m
                    return (
                      <div key={m} className={cn('p-1.5 rounded-xl border text-[10px] font-black transition-colors', isReached ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-600 dark:text-emerald-400' : 'bg-mochi-surface border-mochi-border text-mochi-text-muted')}>
                        {m}%
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Edit Details Section */}
              {isEditingGoal ? (
                <div className="space-y-3 p-3.5 rounded-2xl border border-mochi-primary/40 bg-mochi-primary/5">
                  <h4 className="text-xs font-black text-mochi-text uppercase">Edit Goal Details</h4>
                  <div>
                    <label className="block text-[10px] font-bold text-mochi-text-secondary mb-0.5">Goal Name</label>
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="mochi-input text-xs font-bold w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-mochi-text-secondary mb-0.5">Target Amount (PHP)</label>
                    <input
                      type="number"
                      value={editTarget}
                      onChange={(e) => setEditTarget(e.target.value)}
                      className="mochi-input text-xs font-bold w-full"
                    />
                  </div>
                  <div className="flex gap-2 pt-1">
                    <button
                      onClick={() => setIsEditingGoal(false)}
                      className="mochi-btn-secondary text-xs flex-1 py-2 font-bold cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => {
                        const targetNum = parseFloat(editTarget) || viewGoal.targetAmount
                        useAppStore.getState().setSavingsGoals(
                          savingsGoals.map((g) => (g.id === viewGoal.id ? { ...g, name: editName || g.name, targetAmount: targetNum } : g))
                        )
                        setViewGoal({ ...viewGoal, name: editName || viewGoal.name, targetAmount: targetNum })
                        setIsEditingGoal(false)
                        useToastStore.getState().success('Goal details updated successfully!')
                      }}
                      className="mochi-btn-primary text-xs flex-1 py-2 font-bold cursor-pointer"
                    >
                      Save Changes
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => {
                    setEditName(viewGoal.name)
                    setEditTarget(viewGoal.targetAmount.toString())
                    setIsEditingGoal(true)
                  }}
                  className="w-full py-2 rounded-xl bg-mochi-surface-alt hover:bg-mochi-border text-mochi-text text-xs font-bold border border-mochi-border transition-colors cursor-pointer"
                >
                  Edit Details
                </button>
              )}

              {/* Deposit Money Button */}
              <button
                onClick={() => {
                  const target = viewGoal
                  setViewGoal(null)
                  setDepositGoal(target)
                  setDepositAmount('')
                  setDepositWalletId(wallets[0]?.id || '')
                }}
                className="mochi-btn-primary w-full py-3 text-xs font-extrabold flex items-center justify-center gap-1.5 shadow-md cursor-pointer"
              >
                <Coins className="w-4 h-4" /> + Add Money / Deposit
              </button>
            </div>
          )
        })()}
      </Dialog>

      {/* Deposit Money Modal */}
      <Dialog
        isOpen={!!depositGoal}
        onClose={() => setDepositGoal(null)}
        title={`Add Deposit to ${depositGoal?.name || ''}`}
      >
        {depositGoal && (
          <form onSubmit={handleDepositSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-mochi-text-secondary mb-1">
                Deposit Amount (PHP) *
              </label>
              <input
                type="number"
                step="any"
                min="1"
                placeholder="e.g. 1000"
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
                className="mochi-input text-lg font-black text-mochi-primary w-full"
                required
                autoFocus
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-mochi-text-secondary mb-1">
                Deduct From Wallet
              </label>
              <select
                value={depositWalletId || wallets[0]?.id || ''}
                onChange={(e) => setDepositWalletId(e.target.value)}
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
                onClick={() => setDepositGoal(null)}
                className="mochi-btn-secondary text-xs flex-1 py-2.5 font-bold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="mochi-btn-primary text-xs flex-1 py-2.5 font-bold flex items-center justify-center gap-1.5 shadow-md"
              >
                <Coins className="w-4 h-4" /> Deposit Savings
              </button>
            </div>
          </form>
        )}
      </Dialog>

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
                className="mochi-btn-secondary text-xs flex-1 py-2.5 font-bold"
              >
                Cancel
              </button>
              <button type="submit" className="mochi-btn-primary text-xs flex-1 py-2.5 font-bold">
                Create Savings Goal
              </button>
            </div>
          </form>
        )}
      </Dialog>

      <PaywallModal
        isOpen={showPaywall}
        onClose={() => setShowPaywall(false)}
        featureTitle="Unlock Unlimited Savings Goals"
        featureDescription="Free tier is limited to 2 active savings goals. Upgrade to Pro ₱199.00 for unlimited savings targets & milestones!"
      />

      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-xl font-black text-mochi-text">Savings Goals</h1>
          <p className="text-xs text-mochi-text-muted mt-0.5 font-medium">Every little bit counts toward your dreams</p>
        </div>
        <button
          onClick={() => {
            if (!checkCanAddSavingsGoal(user, savingsGoals.length)) {
              setShowPaywall(true)
            } else {
              setIsModalOpen(true)
            }
          }}
          className="mochi-btn-primary text-xs sm:text-sm font-bold flex items-center gap-1.5 shadow-md active:scale-95 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>New Dream</span>
        </button>
      </div>

      {/* Hero Total Saved */}
      <section className="mochi-card bg-gradient-to-br from-mochi-success/10 via-mochi-success/5 to-mochi-primary/5 mb-4" aria-label="Total Saved">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-2xl bg-mochi-success/15 flex items-center justify-center border border-mochi-success/30">
            <PiggyBank className="w-5 h-5 text-mochi-success" />
          </div>
          <div>
            <p className="text-xs font-bold text-mochi-text-secondary">Total Saved Across Goals</p>
            <p className="text-2xl font-black text-mochi-success">{formatCurrency(totalSaved)}</p>
          </div>
        </div>
        {totalTarget > 0 && (
          <>
            <div className="flex justify-between text-xs text-mochi-text-muted mb-1 font-bold">
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
          <div className="flex items-center gap-1 text-xs text-mochi-text-secondary font-bold">
            <Target className="w-3.5 h-3.5 text-mochi-primary" />
            {activeGoals.length} active
          </div>
          <div className="flex items-center gap-1 text-xs text-mochi-success font-bold">
            <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
            {completedGoals.length} completed
          </div>
        </div>
      </section>

      {/* Active Goals Grid */}
      {activeGoals.length > 0 && (
        <section aria-label="Active Goals">
          <h2 className="text-xs font-black text-mochi-text-secondary mb-3 uppercase tracking-wider">Active Goals</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {activeGoals.map((goal) => (
              <GoalCard key={goal.id} goal={goal} onViewGoalClick={setViewGoal} />
            ))}
          </div>
        </section>
      )}

      {/* Completed Goals */}
      {completedGoals.length > 0 && (
        <section aria-label="Completed Goals" className="mt-6">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xs font-black text-mochi-text-secondary uppercase tracking-wider">Completed</h2>
            <span className="text-xs text-mochi-success flex items-center gap-1 font-bold">
              <CheckCircle2 className="w-3.5 h-3.5" /> {completedGoals.length} done
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {completedGoals.map((goal) => (
              <GoalCard key={goal.id} goal={goal} onViewGoalClick={setViewGoal} />
            ))}
          </div>
        </section>
      )}

      {/* Empty State */}
      {allGoals.length === 0 && <EmptySavings onOpenModal={() => setIsModalOpen(true)} />}
    </motion.div>
  )
}
