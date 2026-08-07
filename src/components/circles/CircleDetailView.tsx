import { useState } from 'react'
import {
  Sparkles,
  Plus,
  CheckSquare,
  Square,
  Vote,
  FileText,
  Users,
  Coins,
  Sun,
  Share2,
  CheckCircle2,
  Calculator,
} from 'lucide-react'
import type {
  MochiCircle,
  CircleContribution,
  WishlistItem,
  CirclePoll,
  CircleMember,
} from '@/types'
import UnifiedRaceTrack from './UnifiedRaceTrack'
import GroupMascotSVG from '@/components/ui/GroupMascotSVG'
import Dialog from '@/components/ui/Dialog'
import Confetti from '@/components/ui/Confetti'
import { formatCurrency, formatDate, cn } from '@/lib/utils'
import { useAppStore } from '@/store/appStore'
import { useToastStore } from '@/store/toastStore'

interface CircleDetailViewProps {
  circle: MochiCircle
  onContribute: (circleId: string, amount: number, note: string) => void
  onToggleWishlist: (circleId: string, itemId: string) => void
  onVotePoll: (circleId: string, pollId: string, optionId: string) => void
  onAddWishlistItem: (circleId: string, title: string, cost?: number) => void
  onAddPoll: (circleId: string, question: string, options: string[]) => void
  onBack?: () => void
}

export default function CircleDetailView({
  circle,
  onContribute,
  onToggleWishlist,
  onVotePoll,
  onAddWishlistItem,
  onAddPoll,
  onBack,
}: CircleDetailViewProps) {
  const [isContributeModalOpen, setIsContributeModalOpen] = useState(false)
  const [contributionAmount, setContributionAmount] = useState('')
  const [contributionNote, setContributionNote] = useState('')
  const [showConfetti, setShowConfetti] = useState(false)
  const [activeTab, setActiveTab] = useState<'journey' | 'splitwise' | 'wishlist' | 'polls' | 'files' | 'members'>('journey')

  const [newWishlistTitle, setNewWishlistTitle] = useState('')
  const [newWishlistCost, setNewWishlistCost] = useState('')

  const [newPollQuestion, setNewPollQuestion] = useState('')
  const [pollOpt1, setPollOpt1] = useState('')
  const [pollOpt2, setPollOpt2] = useState('')

  // Splitwise state
  const [isAddSplitModalOpen, setIsAddSplitModalOpen] = useState(false)
  const [splitTitle, setSplitTitle] = useState('')
  const [splitAmount, setSplitAmount] = useState('')
  const [splitPaidBy, setSplitPaidBy] = useState('m1')

  // Calculate sunrises remaining based on targetDate
  const targetDateObj = new Date(circle.targetDate)
  const diffDays = Math.max(1, Math.ceil((targetDateObj.getTime() - Date.now()) / (1000 * 60 * 60 * 24)))

  const handleContributeSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const amt = parseFloat(contributionAmount)
    if (isNaN(amt) || amt <= 0) return

    onContribute(circle.id, amt, contributionNote)
    setIsContributeModalOpen(false)
    setContributionAmount('')
    setContributionNote('')

    setShowConfetti(true)
    setTimeout(() => setShowConfetti(false), 4000)
  }

  const handleAddWishlistSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newWishlistTitle.trim()) return
    const cost = newWishlistCost ? parseFloat(newWishlistCost) : undefined
    onAddWishlistItem(circle.id, newWishlistTitle.trim(), cost)
    setNewWishlistTitle('')
    setNewWishlistCost('')
  }

  const handleAddPollSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newPollQuestion.trim() || !pollOpt1.trim() || !pollOpt2.trim()) return
    onAddPoll(circle.id, newPollQuestion.trim(), [pollOpt1.trim(), pollOpt2.trim()])
    setNewPollQuestion('')
    setPollOpt1('')
    setPollOpt2('')
  }

  const handleAddSplitSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const amt = parseFloat(splitAmount)
    if (!splitTitle.trim() || isNaN(amt) || amt <= 0) return

    const paidMember = circle.members.find((m) => m.id === splitPaidBy) || circle.members[0]
    const amountPerMember = amt / (circle.members.length || 1)

    const newSplit = {
      id: crypto.randomUUID(),
      title: splitTitle.trim(),
      totalAmount: amt,
      paidByMemberId: paidMember.id,
      paidByMemberName: paidMember.name,
      splitMemberIds: circle.members.map((m) => m.id),
      amountPerMember,
      settledMemberIds: [paidMember.id],
      date: new Date().toISOString(),
    }

    await useAppStore.getState().addCircleBillSplit(circle.id, newSplit)
    useToastStore.getState().success(`Bill split "${splitTitle}" added!`, 'Splitwise')
    setIsAddSplitModalOpen(false)
    setSplitTitle('')
    setSplitAmount('')
  }

  const handleSettleSplit = async (splitId: string) => {
    await useAppStore.getState().settleCircleBillSplit(circle.id, splitId, 'm1')
    useToastStore.getState().success('Marked your share as settled!', 'Settled')
  }

  return (
    <div className="space-y-6 pb-12">
      <Confetti isActive={showConfetti} />

      {/* 1. Circle Header Banner Box */}
      <div className="mochi-card bg-gradient-to-r from-sky-500/10 via-purple-500/10 to-amber-500/10 p-5 sm:p-6 rounded-3xl border border-mochi-border relative shadow-sm">
        {onBack && (
          <button
            onClick={onBack}
            className="text-xs font-bold text-mochi-primary hover:underline mb-3 inline-flex items-center gap-1"
          >
            ← Back to All Circles
          </button>
        )}

        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="mochi-badge mochi-badge-primary uppercase font-extrabold text-[10px] tracking-wider">
                Mochi Circle™ • Active
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-mochi-text mt-2 tracking-tight">{circle.name}</h2>
            <p className="text-xs sm:text-sm text-mochi-text-secondary mt-1 max-w-xl font-medium">{circle.description}</p>

            {/* Cute Countdown Badge */}
            <div className="inline-flex items-center gap-2 mt-4 bg-amber-500/15 text-amber-900 dark:text-amber-200 px-3.5 py-1.5 rounded-full text-xs font-bold border border-amber-500/30">
              <Sun className="w-4 h-4 text-amber-500 animate-spin-slow" />
              <span>
                {diffDays} more sunrises until destination!
              </span>
            </div>
          </div>

          <div className="flex flex-col items-end gap-3">
            <button
              onClick={() => setIsContributeModalOpen(true)}
              className="mochi-btn-primary px-5 py-2.5 shadow-lg flex items-center gap-2 text-xs sm:text-sm font-extrabold active:scale-95 transition-all"
            >
              <Coins className="w-4 h-4" />
              Add Contribution
            </button>
            <button
              type="button"
              onClick={() => {
                const code = circle.inviteCode || `MOCHI-${circle.id.slice(0, 4).toUpperCase()}`
                navigator.clipboard?.writeText(code)
                useToastStore.getState().success(`Invite Code ${code} copied to clipboard!`, 'Code Copied')
              }}
              className="text-xs font-bold text-mochi-text-secondary hover:text-mochi-primary flex items-center gap-1 transition-colors bg-mochi-surface-alt px-3 py-1.5 rounded-xl border border-mochi-border/60"
            >
              <Share2 className="w-3.5 h-3.5 text-mochi-primary" /> Invite Code: <span className="font-mono font-black text-mochi-text uppercase">{circle.inviteCode || `MOCHI-${circle.id.slice(0, 4).toUpperCase()}`}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Tabs Navigation Row (Positioned right below Circle Info Box) */}
      <div className="grid grid-cols-6 gap-1 p-1.5 bg-mochi-surface-alt rounded-2xl border border-mochi-border shadow-xs">
        {[
          { id: 'journey',   label: 'Journey',   icon: Sparkles   },
          { id: 'splitwise', label: 'Splitwise', icon: Calculator },
          { id: 'wishlist',  label: 'Wishlist',  icon: CheckSquare },
          { id: 'polls',     label: 'Polls',     icon: Vote       },
          { id: 'files',     label: 'Files',     icon: FileText   },
          { id: 'members',   label: 'Members',   icon: Users      },
        ].map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === (tab.id as any)
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={cn(
                'flex flex-col items-center gap-1 py-2 px-1 rounded-xl text-[10px] sm:text-xs font-black transition-all',
                isActive
                  ? 'bg-mochi-surface text-mochi-primary shadow-xs border border-mochi-border'
                  : 'text-mochi-text-muted hover:text-mochi-text hover:bg-mochi-surface/60'
              )}
            >
              <Icon className={cn('w-4 h-4', isActive ? 'text-mochi-primary' : 'text-mochi-text-muted')} />
              <span>{tab.label}</span>
            </button>
          )
        })}
      </div>

      {/* 3. Tab Contents Below Header & Tabs Row */}

      {/* Tab 1: Journey Track */}
      {activeTab === 'journey' && (
        <div className="space-y-6">
          <UnifiedRaceTrack
            theme={circle.theme}
            targetAmount={circle.targetAmount}
            members={circle.members}
            currency={circle.currency}
          />

          {/* Recent Group Contributions Feed */}
          <div className="mochi-card p-5">
            <h4 className="text-sm font-bold text-mochi-text mb-4 flex items-center gap-2">
              <Coins className="w-4 h-4 text-mochi-primary" />
              Recent Group Contributions
            </h4>

            {circle.contributions.length === 0 ? (
              <p className="text-xs text-mochi-text-muted text-center py-6">
                No contributions logged yet. Be the first to contribute to this Circle!
              </p>
            ) : (
              <div className="space-y-3">
                {circle.contributions.map((contrib: CircleContribution) => (
                  <div
                    key={contrib.id}
                    className="flex items-center justify-between p-3 rounded-2xl bg-mochi-surface border border-mochi-border/60 hover:border-mochi-primary/30 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <GroupMascotSVG animal={contrib.mascot} size="xs" />
                      <div>
                        <p className="text-xs font-bold text-mochi-text">
                          {contrib.memberName} saved {formatCurrency(contrib.amount, circle.currency)}
                        </p>
                        {contrib.note && <p className="text-[11px] text-mochi-text-muted">"{contrib.note}"</p>}
                      </div>
                    </div>
                    <span className="text-[10px] text-mochi-text-muted font-bold">{formatDate(contrib.date, 'short')}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 2: Splitwise Group Bill Splitter */}
      {activeTab === 'splitwise' && (
        <div className="space-y-4">
          <div className="mochi-card p-5 border border-mochi-border bg-mochi-surface">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
              <div>
                <h4 className="text-base font-black text-mochi-text flex items-center gap-2">
                  <Calculator className="w-5 h-5 text-mochi-primary" />
                  Splitwise Group Bill Splitter
                </h4>
                <p className="text-xs text-mochi-text-secondary mt-0.5 font-medium">
                  Log shared group expenses (dinners, hotels, gas) and calculate equal splits automatically!
                </p>
              </div>
              <button
                onClick={() => setIsAddSplitModalOpen(true)}
                className="mochi-btn-primary text-xs px-4 py-2.5 flex items-center gap-1.5 shadow-md font-bold active:scale-95 transition-all"
              >
                <Plus className="w-4 h-4" /> Add Bill Split
              </button>
            </div>

            {/* Bill Splits List */}
            {(!circle.splits || circle.splits.length === 0) ? (
              <div className="text-center py-10 bg-mochi-surface-alt rounded-2xl border border-dashed border-mochi-border/80">
                <Coins className="w-10 h-10 text-mochi-primary mx-auto mb-2 opacity-60" />
                <p className="text-xs font-black text-mochi-text">No bill splits recorded yet!</p>
                <p className="text-[11px] text-mochi-text-muted mt-1 font-medium">
                  Tap "+ Add Bill Split" above to split a dinner, ride, or hotel stay with circle members.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {circle.splits.map((sp) => {
                  const isSettledByYou = sp.settledMemberIds?.includes('m1') || sp.paidByMemberId === 'm1'
                  return (
                    <div key={sp.id} className="mochi-card p-4 bg-mochi-surface border border-mochi-border/80 flex flex-col gap-3 shadow-xs">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h5 className="text-sm font-black text-mochi-text">{sp.title}</h5>
                          <p className="text-xs text-mochi-text-muted mt-0.5 font-medium">
                            Paid by <span className="font-extrabold text-mochi-primary">{sp.paidByMemberName}</span> • {formatDate(sp.date, 'short')}
                          </p>
                        </div>
                        <div className="text-right">
                          <span className="text-base font-black text-mochi-text">
                            {formatCurrency(sp.totalAmount, circle.currency)}
                          </span>
                          <p className="text-[10px] text-mochi-text-muted font-bold">
                            {formatCurrency(sp.amountPerMember, circle.currency)} / person
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2.5 border-t border-mochi-border/60 text-xs">
                        <span className="text-mochi-text-secondary font-bold text-[11px]">
                          Split among {sp.splitMemberIds?.length || circle.members.length} members
                        </span>

                        {sp.paidByMemberId === 'm1' ? (
                          <span className="px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-extrabold text-[10px] border border-emerald-500/30">
                            You paid this bill
                          </span>
                        ) : isSettledByYou ? (
                          <span className="px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-extrabold text-[10px] flex items-center gap-1 border border-emerald-500/30">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Settled ({formatCurrency(sp.amountPerMember)})
                          </span>
                        ) : (
                          <button
                            onClick={() => handleSettleSplit(sp.id)}
                            className="mochi-btn-primary text-xs px-3.5 py-1.5 font-bold shadow-xs active:scale-95 transition-all"
                          >
                            Settle {formatCurrency(sp.amountPerMember)}
                          </button>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 3: Wishlist */}
      {activeTab === 'wishlist' && (
        <div className="space-y-4">
          <div className="mochi-card p-5 border border-mochi-border">
            <h4 className="text-sm font-bold text-mochi-text mb-3">Group Trip Wishlist</h4>

            <form onSubmit={handleAddWishlistSubmit} className="flex gap-2 mb-4">
              <input
                type="text"
                placeholder="Add item e.g. Snorkeling Gear, SUV Rental"
                value={newWishlistTitle}
                onChange={(e) => setNewWishlistTitle(e.target.value)}
                className="mochi-input text-xs flex-1"
              />
              <input
                type="number"
                placeholder="Est. Cost (optional)"
                value={newWishlistCost}
                onChange={(e) => setNewWishlistCost(e.target.value)}
                className="mochi-input text-xs w-32"
              />
              <button type="submit" className="mochi-btn-primary text-xs px-3 font-bold">
                Add
              </button>
            </form>

            <div className="space-y-2">
              {circle.wishlist.map((item: WishlistItem) => (
                <div
                  key={item.id}
                  onClick={() => onToggleWishlist(circle.id, item.id)}
                  className="flex items-center justify-between p-3 rounded-2xl bg-mochi-surface border border-mochi-border cursor-pointer hover:bg-mochi-surface-alt transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {item.completed ? (
                      <CheckSquare className="w-5 h-5 text-mochi-primary" />
                    ) : (
                      <Square className="w-5 h-5 text-mochi-text-muted" />
                    )}
                    <span
                      className={cn(
                        'text-xs font-bold text-mochi-text',
                        item.completed && 'line-through text-mochi-text-muted'
                      )}
                    >
                      {item.title}
                    </span>
                  </div>
                  {item.estimatedCost && (
                    <span className="text-xs font-extrabold text-mochi-primary">
                      {formatCurrency(item.estimatedCost, circle.currency)}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Polls */}
      {activeTab === 'polls' && (
        <div className="space-y-4">
          <div className="mochi-card p-5 border border-mochi-border">
            <h4 className="text-sm font-bold text-mochi-text mb-3">Group Decision Polls</h4>

            <form onSubmit={handleAddPollSubmit} className="space-y-2 mb-4 p-3 bg-mochi-surface-alt rounded-2xl border border-mochi-border">
              <input
                type="text"
                placeholder="Question e.g. Which dates work best?"
                value={newPollQuestion}
                onChange={(e) => setNewPollQuestion(e.target.value)}
                className="mochi-input text-xs w-full"
              />
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="Option 1"
                  value={pollOpt1}
                  onChange={(e) => setPollOpt1(e.target.value)}
                  className="mochi-input text-xs"
                />
                <input
                  type="text"
                  placeholder="Option 2"
                  value={pollOpt2}
                  onChange={(e) => setPollOpt2(e.target.value)}
                  className="mochi-input text-xs"
                />
              </div>
              <button type="submit" className="mochi-btn-primary text-xs w-full py-2 font-bold mt-1">
                Create Poll
              </button>
            </form>

            <div className="space-y-4">
              {circle.polls.map((poll: CirclePoll) => (
                <div key={poll.id} className="p-4 rounded-2xl bg-mochi-surface border border-mochi-border space-y-3">
                  <h5 className="text-xs font-bold text-mochi-text">{poll.question}</h5>
                  <div className="space-y-2">
                    {poll.options.map((opt) => (
                      <button
                        key={opt.id}
                        onClick={() => onVotePoll(circle.id, poll.id, opt.id)}
                        className="w-full flex items-center justify-between p-2.5 rounded-xl border border-mochi-border hover:border-mochi-primary/50 transition-colors text-left text-xs"
                      >
                        <span className="font-semibold text-mochi-text">{opt.text}</span>
                        <span className="text-[10px] font-black text-mochi-primary bg-mochi-primary/10 px-2 py-0.5 rounded-full">
                          {opt.votes.length} votes
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 5: Files */}
      {activeTab === 'files' && (
        <div className="mochi-card p-5 border border-mochi-border text-center">
          <FileText className="w-10 h-10 text-mochi-primary mx-auto mb-2 opacity-60" />
          <h4 className="text-sm font-bold text-mochi-text">Shared Group Documents</h4>
          <p className="text-xs text-mochi-text-secondary mt-1">
            Keep hotel vouchers, tickets, and flight manifests organized in one space.
          </p>
        </div>
      )}

      {/* Tab 6: Members */}
      {activeTab === 'members' && (
        <div className="mochi-card p-5 border border-mochi-border space-y-3">
          <h4 className="text-sm font-bold text-mochi-text">Circle Members ({circle.members.length})</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {circle.members.map((member: CircleMember) => (
              <div
                key={member.id}
                className="flex items-center gap-3 p-3 rounded-2xl bg-mochi-surface border border-mochi-border"
              >
                <GroupMascotSVG animal={member.mascot} size="sm" />
                <div>
                  <h5 className="text-xs font-bold text-mochi-text">{member.name}</h5>
                  <p className="text-[10px] text-mochi-text-muted capitalize">
                    {member.role} • Saved {formatCurrency(member.totalContributed, circle.currency)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add Contribution Modal */}
      <Dialog
        isOpen={isContributeModalOpen}
        onClose={() => setIsContributeModalOpen(false)}
        title={`Contribute to ${circle.name}`}
      >
        <form onSubmit={handleContributeSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-mochi-text-secondary mb-1">Amount ({circle.currency}) *</label>
            <input
              type="number"
              placeholder="e.g. 1000"
              value={contributionAmount}
              onChange={(e) => setContributionAmount(e.target.value)}
              className="mochi-input text-xs w-full font-bold"
              required
              autoFocus
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-mochi-text-secondary mb-1">Note (optional)</label>
            <input
              type="text"
              placeholder="e.g. Weekly savings deposit, Bonus drop!"
              value={contributionNote}
              onChange={(e) => setContributionNote(e.target.value)}
              className="mochi-input text-xs w-full font-medium"
            />
          </div>

          <div className="pt-2 flex gap-3">
            <button
              type="button"
              onClick={() => setIsContributeModalOpen(false)}
              className="mochi-btn-secondary text-xs flex-1 py-2.5 font-bold"
            >
              Cancel
            </button>
            <button type="submit" className="mochi-btn-primary text-xs flex-1 py-2.5 font-bold flex items-center justify-center gap-1">
              <Coins className="w-4 h-4" /> Deposit Savings
            </button>
          </div>
        </form>
      </Dialog>

      {/* Add Bill Split Dialog */}
      <Dialog
        isOpen={isAddSplitModalOpen}
        onClose={() => setIsAddSplitModalOpen(false)}
        title="Add Splitwise Bill Split"
      >
        <form onSubmit={handleAddSplitSubmit} className="space-y-4 pt-2">
          <div>
            <label className="block text-xs font-bold text-mochi-text-secondary mb-1">
              Bill Title / Description *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Samgyupsal Dinner, Hotel Booking"
              value={splitTitle}
              onChange={(e) => setSplitTitle(e.target.value)}
              className="mochi-input text-xs w-full font-bold"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-mochi-text-secondary mb-1">
              Total Amount ({circle.currency}) *
            </label>
            <input
              type="number"
              required
              step="any"
              min="1"
              placeholder="0.00"
              value={splitAmount}
              onChange={(e) => setSplitAmount(e.target.value)}
              className="mochi-input text-lg font-black text-mochi-primary w-full"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-mochi-text-secondary mb-1">
              Who Paid?
            </label>
            <select
              value={splitPaidBy}
              onChange={(e) => setSplitPaidBy(e.target.value)}
              className="mochi-input text-xs w-full font-bold"
            >
              {circle.members.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} {m.id === 'm1' ? '(You)' : ''}
                </option>
              ))}
            </select>
          </div>

          <p className="text-[11px] text-mochi-text-secondary font-semibold bg-mochi-surface-alt p-3 rounded-2xl border border-mochi-border/80">
            This bill will be split equally among all {circle.members.length} members ({formatCurrency((parseFloat(splitAmount) || 0) / (circle.members.length || 1), circle.currency)} / person).
          </p>

          <div className="pt-2 flex gap-3">
            <button
              type="button"
              onClick={() => setIsAddSplitModalOpen(false)}
              className="mochi-btn-secondary text-xs flex-1 py-2.5 font-bold"
            >
              Cancel
            </button>
            <button type="submit" className="mochi-btn-primary text-xs flex-1 py-2.5 font-bold flex items-center justify-center gap-1.5 shadow-md">
              <Coins className="w-4 h-4" /> Save & Split Bill
            </button>
          </div>
        </form>
      </Dialog>
    </div>
  )
}
