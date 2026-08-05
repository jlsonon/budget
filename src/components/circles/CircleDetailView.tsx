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
  Lock,
  Rocket,
} from 'lucide-react'
import type {
  MochiCircle,
  CircleContribution,
  WishlistItem,
  CirclePoll,
  CirclePollOption,
  CircleFile,
  CircleMember,
} from '@/types'
import UnifiedRaceTrack from './UnifiedRaceTrack'
import GroupMascotSVG from '@/components/ui/GroupMascotSVG'
import Dialog from '@/components/ui/Dialog'
import Confetti from '@/components/ui/Confetti'
import { formatCurrency, formatDate, cn } from '@/lib/utils'

interface CircleDetailViewProps {
  circle: MochiCircle
  onContribute: (circleId: string, amount: number, note: string) => void
  onToggleWishlist: (circleId: string, itemId: string) => void
  onVotePoll: (circleId: string, pollId: string, optionId: string) => void
  onAddWishlistItem: (circleId: string, title: string, cost?: number) => void
  onAddPoll: (circleId: string, question: string, options: string[]) => void
  onBack?: () => void
}

export function CircleDetailView({
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
  const [activeTab, setActiveTab] = useState<'journey' | 'wishlist' | 'polls' | 'files' | 'members'>('journey')

  const [newWishlistTitle, setNewWishlistTitle] = useState('')
  const [newWishlistCost, setNewWishlistCost] = useState('')

  const [newPollQuestion, setNewPollQuestion] = useState('')
  const [pollOpt1, setPollOpt1] = useState('')
  const [pollOpt2, setPollOpt2] = useState('')

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

  return (
    <div className="space-y-6">
      <Confetti isActive={showConfetti} />

      {/* Circle Header Banner */}
      <div className="mochi-card bg-gradient-to-r from-sky-500/10 via-purple-500/10 to-amber-500/10 p-6 rounded-3xl border border-mochi-border relative">
        {onBack && (
          <button
            onClick={onBack}
            className="text-xs font-semibold text-mochi-primary hover:underline mb-3 inline-block"
          >
            ← Back to All Circles
          </button>
        )}

        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="mochi-badge mochi-badge-primary uppercase font-extrabold text-[10px]">
                Private Circle • Invite Only
              </span>
              <span className="mochi-badge mochi-badge-success text-[10px] flex items-center gap-1">
                <Lock className="w-3 h-3" /> Encrypted & Private
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-mochi-text mt-2">{circle.name}</h2>
            <p className="text-xs sm:text-sm text-mochi-text-secondary mt-1 max-w-xl">{circle.description}</p>

            {/* Cute Countdown */}
            <div className="inline-flex items-center gap-2 mt-4 bg-amber-500/15 text-amber-900 dark:text-amber-200 px-3.5 py-1.5 rounded-full text-xs font-bold border border-amber-500/30">
              <Sun className="w-4 h-4 text-amber-500 animate-spin-slow" />
              <span>
                {diffDays} more sunrises until {circle.name}
              </span>
            </div>
          </div>

          <div className="flex flex-col items-end gap-3">
            <button
              onClick={() => setIsContributeModalOpen(true)}
              className="mochi-btn-primary px-5 py-2.5 shadow-lg flex items-center gap-2 text-sm"
            >
              <Coins className="w-4 h-4" />
              Add Contribution
            </button>
            <button className="text-xs font-semibold text-mochi-text-secondary hover:text-mochi-primary flex items-center gap-1">
              <Share2 className="w-3.5 h-3.5" /> Invite Code: MOCHI-{circle.id.slice(0, 4)}
            </button>
          </div>
        </div>
      </div>

      {/* Tabs Navigation — compact pill grid, no horizontal scrolling */}
      <div className="grid grid-cols-5 gap-1 p-1 bg-mochi-surface-alt rounded-2xl border border-mochi-border">
        {[
          { id: 'journey',  label: 'Journey',  icon: Sparkles   },
          { id: 'wishlist', label: 'Wishlist', icon: CheckSquare },
          { id: 'polls',    label: 'Polls',    icon: Vote       },
          { id: 'files',    label: 'Files',    icon: FileText   },
          { id: 'members',  label: 'Members',  icon: Users      },
        ].map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={cn(
                'flex flex-col items-center gap-0.5 py-2 rounded-xl text-[10px] font-bold transition-all',
                isActive
                  ? 'bg-mochi-surface text-mochi-primary shadow-sm'
                  : 'text-mochi-text-secondary hover:text-mochi-text hover:bg-mochi-surface/60'
              )}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* Tab Contents */}

      {/* 1. Journey Track Tab */}
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
                          {contrib.memberName} contributed{' '}
                          <span className="text-mochi-success">{formatCurrency(contrib.amount, circle.currency)}</span>
                        </p>
                        <p className="text-[10px] text-mochi-text-muted mt-0.5">
                          {formatDate(contrib.date, 'relative')} {contrib.note && `• "${contrib.note}"`}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 bg-mochi-surface-alt px-2 py-1 rounded-full text-xs font-bold">
                      <span>Cheer +1</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 2. Shared Wishlist Tab */}
      {activeTab === 'wishlist' && (
        <div className="space-y-4">
          <div className="mochi-card p-5">
            <h4 className="text-sm font-bold text-mochi-text mb-3">Bucket List & Activities</h4>

            <form onSubmit={handleAddWishlistSubmit} className="flex gap-2 mb-4">
              <input
                type="text"
                placeholder="Add new wishlist item (e.g. Island Hopping, Sunset Dinner)..."
                value={newWishlistTitle}
                onChange={(e) => setNewWishlistTitle(e.target.value)}
                className="mochi-input flex-1 text-xs"
              />
              <input
                type="number"
                placeholder="Cost (optional)"
                value={newWishlistCost}
                onChange={(e) => setNewWishlistCost(e.target.value)}
                className="mochi-input w-28 text-xs"
              />
              <button type="submit" className="mochi-btn-primary text-xs px-3">
                <Plus className="w-4 h-4" /> Add
              </button>
            </form>

            <div className="space-y-2">
              {circle.wishlist.map((item: WishlistItem) => (
                <div
                  key={item.id}
                  onClick={() => onToggleWishlist(circle.id, item.id)}
                  className={cn(
                    'flex items-center justify-between p-3 rounded-2xl border transition-all cursor-pointer',
                    item.completed
                      ? 'bg-mochi-primary/5 border-mochi-primary/30 line-through opacity-70'
                      : 'bg-mochi-surface border-mochi-border hover:border-mochi-primary/40'
                  )}
                >
                  <div className="flex items-center gap-3">
                    {item.completed ? (
                      <CheckSquare className="w-5 h-5 text-mochi-primary" />
                    ) : (
                      <Square className="w-5 h-5 text-mochi-text-muted" />
                    )}
                    <span className="text-xs font-semibold text-mochi-text">{item.title}</span>
                  </div>
                  {item.estimatedCost && (
                    <span className="text-xs font-bold text-mochi-text-secondary">
                      {formatCurrency(item.estimatedCost, circle.currency)}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 3. Polls Tab */}
      {activeTab === 'polls' && (
        <div className="space-y-4">
          <div className="mochi-card p-5">
            <h4 className="text-sm font-bold text-mochi-text mb-3">Group Decisions & Polls</h4>

            <form onSubmit={handleAddPollSubmit} className="space-y-2 mb-6 bg-mochi-surface-alt p-3.5 rounded-2xl border border-mochi-border">
              <p className="text-xs font-semibold text-mochi-text">Create a quick decision poll:</p>
              <input
                type="text"
                placeholder="Question (e.g. Hotel A or Hotel B?)..."
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
              <button type="submit" className="mochi-btn-primary text-xs w-full mt-1">
                Post Poll
              </button>
            </form>

            <div className="space-y-4">
              {circle.polls.map((poll: CirclePoll) => (
                <div key={poll.id} className="mochi-card p-4 border border-mochi-border">
                  <h5 className="text-xs font-bold text-mochi-text mb-3 flex items-center gap-2">
                    <Vote className="w-4 h-4 text-mochi-primary" /> {poll.question}
                  </h5>
                  <div className="space-y-2">
                    {poll.options.map((opt: CirclePollOption) => (
                      <button
                        key={opt.id}
                        onClick={() => onVotePoll(circle.id, poll.id, opt.id)}
                        className="w-full text-left p-2.5 rounded-xl border border-mochi-border hover:border-mochi-primary/40 bg-mochi-surface flex items-center justify-between text-xs font-medium"
                      >
                        <span>{opt.text}</span>
                        <span className="font-bold text-mochi-primary bg-mochi-primary/10 px-2 py-0.5 rounded-full">
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

      {/* 4. Files Tab */}
      {activeTab === 'files' && (
        <div className="mochi-card p-5">
          <h4 className="text-sm font-bold text-mochi-text mb-3">Itinerary & Travel Documents</h4>
          <div className="space-y-2">
            {circle.files.map((file: CircleFile) => (
              <div
                key={file.id}
                className="flex items-center justify-between p-3 rounded-2xl bg-mochi-surface border border-mochi-border"
              >
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-mochi-primary" />
                  <div>
                    <p className="text-xs font-bold text-mochi-text">{file.name}</p>
                    <p className="text-[10px] text-mochi-text-muted uppercase">{file.category} • {file.size}</p>
                  </div>
                </div>
                <button className="text-xs font-semibold text-mochi-primary hover:underline">
                  Download
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. Members Tab */}
      {activeTab === 'members' && (
        <div className="mochi-card p-5">
          <h4 className="text-sm font-bold text-mochi-text mb-3">Circle Members</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {circle.members.map((m: CircleMember) => (
              <div
                key={m.id}
                className="flex items-center justify-between p-3.5 rounded-2xl bg-mochi-surface border border-mochi-border"
              >
                <div className="flex items-center gap-3">
                  <GroupMascotSVG animal={m.mascot} outfit={m.outfit} size="sm" />
                  <div>
                    <h5 className="text-xs font-bold text-mochi-text flex items-center gap-1.5">
                      {m.name}
                      {m.role === 'owner' && (
                        <span className="text-[10px] bg-amber-500/20 text-amber-700 dark:text-amber-300 font-extrabold px-2 py-0.2 rounded-full">
                          Owner
                        </span>
                      )}
                    </h5>
                    <p className="text-[10px] text-mochi-text-muted capitalize">
                      Mascot: {m.mascot} • {m.outfit}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-extrabold text-mochi-success">
                    {formatCurrency(m.totalContributed, circle.currency)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add Contribution Dialog */}
      <Dialog
        isOpen={isContributeModalOpen}
        onClose={() => setIsContributeModalOpen(false)}
        title={`Contribute to ${circle.name}`}
      >
        <form onSubmit={handleContributeSubmit} className="space-y-4 pt-2">
          <div className="text-center bg-mochi-surface-alt p-4 rounded-2xl border border-mochi-border">
            <GroupMascotSVG animal="cat" outfit="beach" size="md" className="mx-auto mb-2" />
            <p className="text-xs font-semibold text-mochi-text">
              Every contribution moves your whole group forward along the Journey Track!
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-mochi-text-secondary mb-1">
              Contribution Amount ({circle.currency})
            </label>
            <input
              type="number"
              required
              min="1"
              placeholder="e.g. 500"
              value={contributionAmount}
              onChange={(e) => setContributionAmount(e.target.value)}
              className="mochi-input text-lg font-bold"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-mochi-text-secondary mb-1">
              Optional Note
            </label>
            <input
              type="text"
              placeholder="e.g. Added my savings for island hopping!"
              value={contributionNote}
              onChange={(e) => setContributionNote(e.target.value)}
              className="mochi-input text-xs"
            />
          </div>

          <button type="submit" className="mochi-btn-primary w-full text-sm py-3 mt-2 flex items-center justify-center gap-2">
            <Rocket className="w-4 h-4" /> Confirm & Move Journey Forward
          </button>
        </form>
      </Dialog>
    </div>
  )
}

export default CircleDetailView
