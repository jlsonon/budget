import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Users,
  Plus,
  Compass,
  Award,
  ArrowRight,
  UserPlus,
  Key,
  CheckCircle2,
  Sparkles,
} from 'lucide-react'
import { useAppStore, getUid } from '@/store/appStore'
import CircleDetailView from '@/components/circles/CircleDetailView'
import MochiPassport from '@/components/circles/MochiPassport'
import { CircleScrapbook } from '@/components/circles/CircleScrapbook'
import GroupMascotSVG from '@/components/ui/GroupMascotSVG'
import Dialog from '@/components/ui/Dialog'
import type { JourneyTheme, MochiCircle } from '@/types'
import { formatCurrency, cn } from '@/lib/utils'
import { useToastStore } from '@/store/toastStore'
import PaywallModal from '@/components/modals/PaywallModal'
import { isProUser } from '@/lib/paywall'
import { useAuthStore } from '@/store/authStore'

const journeyThemes: { id: JourneyTheme; name: string; iconId: string }[] = [
  { id: 'boracay', name: 'Boracay Beach Road', iconId: 'palmtree' },
  { id: 'bohol', name: 'Bohol Countryside', iconId: 'mountain' },
  { id: 'manila', name: 'Manila Lights', iconId: 'house' },
  { id: 'japan', name: 'Japan Cherry Blossom', iconId: 'plant' },
  { id: 'korea', name: 'Seoul Autumn Trail', iconId: 'sprout' },
  { id: 'europe', name: 'Euro Rail Adventure', iconId: 'plane' },
  { id: 'camping', name: 'Campfire Wilderness', iconId: 'sparkles' },
]

export default function CirclesPage() {
  const { user } = useAuthStore()
  const {
    circles,
    passportStamps,
    addCircle,
    contributeToCircle,
    toggleCircleWishlist,
    voteCirclePoll,
    addCircleWishlistItem,
    addCirclePoll,
  } = useAppStore()

  const [selectedCircleId, setSelectedCircleId] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'circles' | 'passport' | 'scrapbook'>('circles')
  const [showPaywall, setShowPaywall] = useState(false)

  // New Circle Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false)
  const [joinCodeInput, setJoinCodeInput] = useState('')

  const [circleName, setCircleName] = useState('')
  const [description, setDescription] = useState('')
  const [targetAmount, setTargetAmount] = useState('')
  const [targetDate, setTargetDate] = useState('')
  const [selectedTheme, setSelectedTheme] = useState<JourneyTheme>('boracay')

  const selectedCircle = circles.find((c) => c.id === selectedCircleId)

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const amt = parseFloat(targetAmount)
    if (!circleName || isNaN(amt) || amt <= 0 || !targetDate) return

    const randomCode = `MOCHI-${Math.random().toString(36).substring(2, 7).toUpperCase()}`

    const newCircle: MochiCircle = {
      id: crypto.randomUUID(),
      userId: getUid(),
      name: circleName,
      description: description || 'Cooperative savings circle for our shared goal!',
      inviteCode: randomCode,
      targetAmount: amt,
      currentAmount: 0,
      currency: 'PHP',
      targetDate,
      theme: selectedTheme,
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      members: [
        {
          id: 'm1',
          name: user?.name ? `${user.name} (You)` : 'You (Owner)',
          mascot: 'cat',
          outfit: 'beach',
          role: 'owner',
          totalContributed: 0,
        },
      ],
      contributions: [],
      wishlist: [
        { id: crypto.randomUUID(), title: 'Group Celebration & Memory Photo', completed: false },
      ],
      polls: [],
      files: [],
      milestones: [
        { percentage: 25, label: 'Departure', unlocked: false, rewardLabel: 'Snack Badge' },
        { percentage: 50, label: 'Halfway Touchdown', unlocked: false, rewardLabel: 'Outfit Perk' },
        { percentage: 75, label: 'Horizon Line', unlocked: false, rewardLabel: 'Special Scene' },
        { percentage: 100, label: 'Destination Arrival', unlocked: false, rewardLabel: 'Passport Stamp' },
      ],
      posts: [],
      splits: [],
    }

    addCircle(newCircle)
    useToastStore.getState().success(`Circle "${circleName}" created! Code: ${randomCode}`, 'Created')
    setIsCreateModalOpen(false)
    setSelectedCircleId(newCircle.id)
    setCircleName('')
    setDescription('')
    setTargetAmount('')
    setTargetDate('')
  }

  const handleJoinCircleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const code = joinCodeInput.trim().toUpperCase()
    if (!code) return

    const foundCircle = circles.find(
      (c) => c.inviteCode?.toUpperCase() === code || c.name.toUpperCase().includes(code)
    )

    if (foundCircle) {
      useToastStore.getState().success(`Joined ${foundCircle.name}!`, 'Circle Joined')
      setSelectedCircleId(foundCircle.id)
      setIsJoinModalOpen(false)
      setJoinCodeInput('')
      return
    }

    // If not found in local mock, create a joined circle instance
    const joinedCircle: MochiCircle = {
      id: `circle_joined_${Date.now()}`,
      userId: getUid(),
      name: `Joined Circle (${code})`,
      description: 'Shared group savings and social feed',
      inviteCode: code,
      targetAmount: 50000,
      currentAmount: 12500,
      currency: 'PHP',
      targetDate: new Date(Date.now() + 60 * 86400000).toISOString().split('T')[0],
      theme: 'boracay',
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      members: [
        { id: 'm1', name: 'Circle Host', mascot: 'panda', outfit: 'casual', role: 'owner', totalContributed: 12500 },
        { id: 'm2', name: `${user?.name || 'You'} (Member)`, mascot: 'cat', outfit: 'beach', role: 'member', totalContributed: 0 },
      ],
      contributions: [],
      wishlist: [],
      polls: [],
      files: [],
      milestones: [],
      posts: [],
    }

    addCircle(joinedCircle)
    useToastStore.getState().success(`Successfully joined Circle using code ${code}!`, 'Circle Joined')
    setSelectedCircleId(joinedCircle.id)
    setIsJoinModalOpen(false)
    setJoinCodeInput('')
  }

  if (selectedCircle) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 pb-24">
        <CircleDetailView
          circle={selectedCircle}
          onContribute={contributeToCircle}
          onToggleWishlist={toggleCircleWishlist}
          onVotePoll={voteCirclePoll}
          onAddWishlistItem={addCircleWishlistItem}
          onAddPoll={addCirclePoll}
          onBack={() => setSelectedCircleId(null)}
        />
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 pb-24 space-y-6">
      <PaywallModal
        isOpen={showPaywall}
        onClose={() => setShowPaywall(false)}
        featureTitle="Unlock Mochi Circles™ & Travel Passport"
        featureDescription="Cooperative group savings and travel passport mode is a Pro feature. Upgrade to Pro ₱199.00 to save & travel with friends!"
      />

      {/* Join Circle Modal */}
      <Dialog isOpen={isJoinModalOpen} onClose={() => setIsJoinModalOpen(false)} title="Join an Existing Circle">
        <form onSubmit={handleJoinCircleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-mochi-text-secondary mb-1">
              Enter 6-Digit Invite Code *
            </label>
            <div className="relative">
              <Key className="w-4 h-4 text-mochi-primary absolute left-3 top-3" />
              <input
                type="text"
                placeholder="e.g. MOCHI-8X92K"
                value={joinCodeInput}
                onChange={(e) => setJoinCodeInput(e.target.value)}
                className="mochi-input text-xs w-full font-bold pl-9 tracking-widest uppercase"
                required
                autoFocus
              />
            </div>
            <p className="text-[11px] text-mochi-text-muted mt-1.5 font-medium">
              Ask your circle host or friend for their Mochi Circle invite code to join their group savings feed!
            </p>
          </div>

          <div className="pt-2 flex gap-3">
            <button
              type="button"
              onClick={() => setIsJoinModalOpen(false)}
              className="mochi-btn-secondary text-xs flex-1 py-2.5 font-bold"
            >
              Cancel
            </button>
            <button type="submit" className="mochi-btn-primary text-xs flex-1 py-2.5 font-bold flex items-center justify-center gap-1">
              <CheckCircle2 className="w-4 h-4" /> Join Circle Now
            </button>
          </div>
        </form>
      </Dialog>

      {/* Header Banner */}
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="mochi-badge mochi-badge-primary text-[10px] font-extrabold uppercase tracking-wider flex items-center gap-1">
              <Users className="w-3 h-3" /> Mochi Circles™
            </span>
            <span className="mochi-badge mochi-badge-success text-[10px] font-bold flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-500" /> Group Social & Savings
            </span>
          </div>
          <h1 className="text-3xl font-black text-mochi-text">Shared Savings & Trips</h1>
          <p className="text-xs sm:text-sm text-mochi-text-secondary mt-1 font-semibold">
            Social spaces where friends & family save, plan, and socialize together.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* JOIN CIRCLE BUTTON */}
          <button
            onClick={() => setIsJoinModalOpen(true)}
            className="mochi-btn-secondary px-4 py-2.5 shadow-md flex items-center gap-2 text-xs sm:text-sm font-bold"
          >
            <UserPlus className="w-4 h-4 text-mochi-primary" />
            Join Circle
          </button>

          {/* CREATE CIRCLE BUTTON */}
          <button
            onClick={() => {
              if (!isProUser(user)) {
                setShowPaywall(true)
              } else {
                setIsCreateModalOpen(true)
              }
            }}
            className="mochi-btn-primary px-4 py-2.5 shadow-lg flex items-center gap-2 text-xs sm:text-sm font-bold"
          >
            <Plus className="w-4 h-4" />
            Create New Circle
          </button>
        </div>
      </header>

      {/* Main Tabs */}
      <div className="grid grid-cols-3 gap-1 p-1 bg-mochi-surface-alt rounded-2xl border border-mochi-border">
        {[
          { id: 'circles', label: 'Circles', icon: Users, badge: circles.length },
          { id: 'passport', label: 'Passport', icon: Compass, badge: passportStamps.length },
          { id: 'scrapbook', label: 'Scrapbook', icon: Award },
        ].map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={cn(
                'flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all',
                isActive
                  ? 'bg-mochi-surface text-mochi-primary shadow-xs border border-mochi-border'
                  : 'text-mochi-text-muted hover:text-mochi-text'
              )}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              {typeof tab.badge === 'number' && (
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-mochi-primary/15 text-mochi-primary">
                  {tab.badge}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* Tab 1: Circles Grid */}
      {activeTab === 'circles' && (
        <section aria-label="Active Circles">
          {circles.length === 0 ? (
            <div className="mochi-card p-8 sm:p-12 text-center flex flex-col items-center justify-center border-2 border-dashed border-mochi-border">
              <GroupMascotSVG size="md" className="mb-4" />
              <h3 className="text-xl font-black text-mochi-text mb-2">No Active Circles Yet</h3>
              <p className="text-xs sm:text-sm text-mochi-text-secondary max-w-md mb-6 font-medium">
                Create a circle or join your friends' circle using their invite code to save together!
              </p>
              <div className="flex items-center gap-3">
                <button onClick={() => setIsJoinModalOpen(true)} className="mochi-btn-secondary px-5 py-2.5 text-xs font-bold flex items-center gap-2">
                  <UserPlus className="w-4 h-4 text-mochi-primary" /> Join with Code
                </button>
                <button onClick={() => setIsCreateModalOpen(true)} className="mochi-btn-primary px-5 py-2.5 text-xs font-bold flex items-center gap-2">
                  <Plus className="w-4 h-4" /> Create Circle
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {circles.map((circle) => {
                const progressPct = Math.min(100, Math.round((circle.currentAmount / circle.targetAmount) * 100))
                return (
                  <motion.div
                    key={circle.id}
                    whileHover={{ y: -4 }}
                    onClick={() => setSelectedCircleId(circle.id)}
                    className="mochi-card p-5 cursor-pointer flex flex-col justify-between hover:border-mochi-primary/50 transition-all shadow-md group relative overflow-hidden"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div>
                          <h3 className="text-base font-black text-mochi-text group-hover:text-mochi-primary transition-colors">
                            {circle.name}
                          </h3>
                          <p className="text-xs text-mochi-text-muted line-clamp-1 mt-0.5 font-medium">{circle.description}</p>
                        </div>
                        <span className="text-[10px] font-black px-2.5 py-1 rounded-full bg-mochi-primary/10 text-mochi-primary uppercase border border-mochi-primary/20 shrink-0">
                          {circle.theme}
                        </span>
                      </div>

                      {/* Code Badge */}
                      {circle.inviteCode && (
                        <div className="mb-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-mochi-surface-alt border border-mochi-border text-[10px] font-bold text-mochi-text-secondary">
                          <Key className="w-3 h-3 text-amber-500" />
                          <span>Code: {circle.inviteCode}</span>
                        </div>
                      )}

                      <div className="space-y-1.5 mb-4">
                        <div className="flex justify-between text-xs font-bold">
                          <span className="text-mochi-text-muted">Target Progress</span>
                          <span className="text-mochi-primary">{progressPct}%</span>
                        </div>
                        <div className="h-2.5 bg-mochi-border/50 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-mochi-primary to-purple-500 rounded-full transition-all duration-500"
                            style={{ width: `${progressPct}%` }}
                          />
                        </div>
                        <div className="flex justify-between text-[11px] font-semibold text-mochi-text-secondary">
                          <span>{formatCurrency(circle.currentAmount)}</span>
                          <span>Goal: {formatCurrency(circle.targetAmount)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-mochi-border/60 flex items-center justify-between text-xs">
                      <span className="text-mochi-text-muted font-bold flex items-center gap-1">
                        <Users className="w-3.5 h-3.5" /> {circle.members?.length || 1} Members
                      </span>
                      <span className="font-bold text-mochi-primary flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                        Open Feed <ArrowRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          )}
        </section>
      )}

      {/* Tab 2: Passport */}
      {activeTab === 'passport' && <MochiPassport stamps={passportStamps} />}

      {/* Tab 3: Scrapbook */}
      {activeTab === 'scrapbook' && <CircleScrapbook circles={circles} />}

      {/* Create Modal */}
      <Dialog isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} title="Create New Mochi Circle™">
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-mochi-text-secondary mb-1">Circle Name *</label>
            <input
              type="text"
              placeholder="e.g. Boracay 2026 Trip, Japan Cherry Blossom, House Fund"
              value={circleName}
              onChange={(e) => setCircleName(e.target.value)}
              className="mochi-input text-xs w-full font-bold"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-mochi-text-secondary mb-1">Description</label>
            <input
              type="text"
              placeholder="What is this shared goal about?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mochi-input text-xs w-full font-medium"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-mochi-text-secondary mb-1">Target Savings (PHP) *</label>
              <input
                type="number"
                placeholder="e.g. 50000"
                value={targetAmount}
                onChange={(e) => setTargetAmount(e.target.value)}
                className="mochi-input text-xs w-full font-bold"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-mochi-text-secondary mb-1">Target Date *</label>
              <input
                type="date"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                className="mochi-input text-xs w-full font-bold"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-mochi-text-secondary mb-2">Select Journey Theme</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {journeyThemes.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setSelectedTheme(t.id)}
                  className={cn(
                    'p-2.5 rounded-xl border text-left text-xs font-bold transition-all',
                    selectedTheme === t.id
                      ? 'bg-mochi-primary/10 border-mochi-primary text-mochi-primary'
                      : 'border-mochi-border hover:bg-mochi-surface-alt text-mochi-text'
                  )}
                >
                  {t.name}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-2 flex gap-3">
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(false)}
              className="mochi-btn-secondary text-xs flex-1 py-2.5 font-bold"
            >
              Cancel
            </button>
            <button type="submit" className="mochi-btn-primary text-xs flex-1 py-2.5 font-bold">
              Create Circle
            </button>
          </div>
        </form>
      </Dialog>
    </div>
  )
}
