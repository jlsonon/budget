import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Users,
  Plus,
  Compass,
  Award,
  Calendar,
  Lock,
  ArrowRight,
} from 'lucide-react'
import { useAppStore, getUid } from '@/store/appStore'
import CircleDetailView from '@/components/circles/CircleDetailView'
import MochiPassport from '@/components/circles/MochiPassport'
import CircleScrapbook from '@/components/circles/CircleScrapbook'
import GroupMascotSVG from '@/components/ui/GroupMascotSVG'
import Dialog from '@/components/ui/Dialog'
import type { JourneyTheme, MascotAnimal, MascotOutfit, MochiCircle } from '@/types'
import { formatCurrency, formatDate, cn } from '@/lib/utils'

import MochiIcon from '@/components/ui/MochiIcons'

const journeyThemes: { id: JourneyTheme; name: string; iconId: string }[] = [
  { id: 'boracay', name: 'Boracay Beach Road', iconId: 'palmtree' },
  { id: 'bohol', name: 'Bohol Countryside', iconId: 'mountain' },
  { id: 'manila', name: 'Manila Lights', iconId: 'house' },
  { id: 'japan', name: 'Japan Cherry Blossom', iconId: 'plant' },
  { id: 'korea', name: 'Seoul Autumn Trail', iconId: 'sprout' },
  { id: 'europe', name: 'Euro Rail Adventure', iconId: 'plane' },
  { id: 'camping', name: 'Campfire Wilderness', iconId: 'sparkles' },
]

const mascotAnimals: { id: MascotAnimal; name: string }[] = [
  { id: 'cat', name: 'Cat' },
  { id: 'fox', name: 'Fox' },
  { id: 'bear', name: 'Bear' },
  { id: 'rabbit', name: 'Rabbit' },
  { id: 'panda', name: 'Panda' },
  { id: 'otter', name: 'Otter' },
  { id: 'hamster', name: 'Hamster' },
  { id: 'red_panda', name: 'Red Panda' },
  { id: 'capybara', name: 'Capybara' },
  { id: 'shiba', name: 'Shiba' },
  { id: 'penguin', name: 'Penguin' },
  { id: 'duck', name: 'Duck' },
]

const mascotOutfits: { id: MascotOutfit; name: string }[] = [
  { id: 'casual', name: 'Casual' },
  { id: 'beach', name: 'Beach Outfit' },
  { id: 'winter', name: 'Winter Warm' },
  { id: 'raincoat', name: 'Raincoat' },
]

import PaywallModal from '@/components/modals/PaywallModal'
import { isProUser } from '@/lib/paywall'
import { useAuthStore } from '@/store/authStore'

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
  const [circleName, setCircleName] = useState('')
  const [description, setDescription] = useState('')
  const [targetAmount, setTargetAmount] = useState('')
  const [targetDate, setTargetDate] = useState('')
  const [selectedTheme, setSelectedTheme] = useState<JourneyTheme>('boracay')
  const [myMascot, setMyMascot] = useState<MascotAnimal>('cat')
  const [myOutfit, setMyOutfit] = useState<MascotOutfit>('beach')

  const selectedCircle = circles.find((c) => c.id === selectedCircleId)

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const amt = parseFloat(targetAmount)
    if (!circleName || isNaN(amt) || amt <= 0 || !targetDate) return

    const newCircle: MochiCircle = {
      id: crypto.randomUUID(),
      userId: getUid(),
      name: circleName,
      description: description || 'Cooperative savings circle for our shared goal!',
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
          name: 'Jericho (You)',
          mascot: myMascot,
          outfit: myOutfit,
          role: 'owner',
          totalContributed: 0,
        },
      ],
      contributions: [],
      wishlist: [
        { id: crypto.randomUUID(), title: 'Group Photo & Celebration', completed: false },
      ],
      polls: [],
      files: [],
      milestones: [
        { percentage: 25, label: 'Departure', unlocked: false, rewardLabel: 'Snack Badge' },
        { percentage: 50, label: 'Halfway Touchdown', unlocked: false, rewardLabel: 'Outfit Perk' },
        { percentage: 75, label: 'Horizon Line', unlocked: false, rewardLabel: 'Special Scene' },
        { percentage: 100, label: 'Destination Arrival', unlocked: false, rewardLabel: 'Passport Stamp' },
      ],
    }

    addCircle(newCircle)
    setIsCreateModalOpen(false)
    setSelectedCircleId(newCircle.id)
    setCircleName('')
    setDescription('')
    setTargetAmount('')
    setTargetDate('')
  }

  // If a Circle is selected, render full detail view
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

      {/* Header Banner */}
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="mochi-badge mochi-badge-primary text-[10px] font-extrabold uppercase tracking-wider flex items-center gap-1">
              <Users className="w-3 h-3" /> Mochi Circles™
            </span>
            <span className="mochi-badge mochi-badge-success text-[10px] font-bold flex items-center gap-1">
              <Lock className="w-3 h-3" /> Cooperative & Private
            </span>
          </div>
          <h1 className="text-3xl font-black text-mochi-text">Shared Savings & Trips</h1>
          <p className="text-xs sm:text-sm text-mochi-text-secondary mt-1">
            Private financial spaces where friends & family save, plan, and travel together.
          </p>
        </div>

        <button
          onClick={() => {
            if (!isProUser(user)) {
              setShowPaywall(true)
            } else {
              setIsCreateModalOpen(true)
            }
          }}
          className="mochi-btn-primary px-4 py-2.5 shadow-lg flex items-center gap-2 text-xs sm:text-sm"
        >
          <Plus className="w-4 h-4" />
          Create New Circle
        </button>
      </header>

      {/* Main Tabs — compact pill grid */}
      <div className="grid grid-cols-3 gap-1 p-1 bg-mochi-surface-alt rounded-2xl border border-mochi-border">
        {[
          { id: 'circles',   label: 'Circles',   icon: Users,    badge: circles.length       },
          { id: 'passport',  label: 'Passport',  icon: Compass,  badge: passportStamps.length },
          { id: 'scrapbook', label: 'Memories',  icon: Award,    badge: null                  },
        ].map(({ id, label, icon: Icon, badge }) => {
          const isActive = activeTab === id
          return (
            <button
              key={id}
              onClick={() => setActiveTab(id as any)}
              className={cn(
                'flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold transition-all',
                isActive
                  ? 'bg-mochi-surface text-mochi-primary shadow-sm'
                  : 'text-mochi-text-secondary hover:text-mochi-text hover:bg-mochi-surface/60'
              )}
            >
              <Icon className="w-4 h-4" />
              {label}
              {badge !== null && badge > 0 && (
                <span className={cn(
                  'text-[9px] font-extrabold px-1.5 py-0.5 rounded-full leading-none',
                  isActive ? 'bg-mochi-primary/20 text-mochi-primary' : 'bg-mochi-border text-mochi-text-muted'
                )}>
                  {badge}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* 1. Active Circles Grid */}
      {activeTab === 'circles' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {circles.map((circle) => {
            const progress = Math.min(100, (circle.currentAmount / circle.targetAmount) * 100)
            return (
              <motion.div
                key={circle.id}
                whileHover={{ y: -3 }}
                onClick={() => setSelectedCircleId(circle.id)}
                className="mochi-card p-6 rounded-3xl border border-mochi-border hover:border-mochi-primary/40 transition-all cursor-pointer shadow-md flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-extrabold uppercase tracking-wider text-mochi-primary bg-mochi-primary/10 px-2.5 py-1 rounded-full">
                      {circle.theme} Theme
                    </span>
                    <span className="text-xs font-bold text-mochi-text-muted flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" /> {formatDate(circle.targetDate)}
                    </span>
                  </div>

                  <h3 className="text-xl font-black text-mochi-text">{circle.name}</h3>
                  <p className="text-xs text-mochi-text-secondary mt-1 line-clamp-2">{circle.description}</p>

                  {/* Member Mascots Preview */}
                  <div className="flex items-center justify-between my-5 bg-mochi-surface-alt p-3 rounded-2xl border border-mochi-border/50">
                    <div className="flex items-center -space-x-2">
                      {circle.members.map((m) => (
                        <div
                          key={m.id}
                          className="w-10 h-10 rounded-full bg-mochi-surface border-2 border-mochi-primary p-0.5 shadow-sm"
                          title={`${m.name} (${m.mascot})`}
                        >
                          <GroupMascotSVG animal={m.mascot} outfit={m.outfit} size="xs" />
                        </div>
                      ))}
                    </div>
                    <span className="text-xs font-bold text-mochi-text-secondary">
                      {circle.members.length} Members Traveling
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-mochi-text">
                        {formatCurrency(circle.currentAmount, circle.currency)}
                      </span>
                      <span className="text-mochi-text-muted">
                        Goal: {formatCurrency(circle.targetAmount, circle.currency)} ({progress.toFixed(0)}%)
                      </span>
                    </div>
                    <div className="h-3 bg-mochi-border/40 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-sky-400 via-mochi-primary to-amber-400 rounded-full transition-all duration-700"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-mochi-border/40 flex items-center justify-between text-xs font-bold text-mochi-primary">
                  <span>Open Journey Track & Circle Home</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </motion.div>
            )
          })}
        </div>
      )}

      {/* 2. Passport Tab */}
      {activeTab === 'passport' && <MochiPassport stamps={passportStamps} />}

      {/* 3. Scrapbook Tab */}
      {activeTab === 'scrapbook' && <CircleScrapbook circles={circles} />}

      {/* Create Circle Dialog */}
      <Dialog
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create Mochi Circle™"
        size="lg"
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4 pt-2">
          <div>
            <label className="block text-xs font-semibold text-mochi-text-secondary mb-1">
              Circle Name
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Boracay Beach Getaway, Birthday Fund..."
              value={circleName}
              onChange={(e) => setCircleName(e.target.value)}
              className="mochi-input text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-mochi-text-secondary mb-1">
              Circle Description
            </label>
            <input
              type="text"
              placeholder="e.g. Cooperative savings for hotel, food crawl & activities!"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mochi-input text-xs"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-mochi-text-secondary mb-1">
                Target Group Goal (PHP)
              </label>
              <input
                type="number"
                required
                min="100"
                placeholder="60000"
                value={targetAmount}
                onChange={(e) => setTargetAmount(e.target.value)}
                className="mochi-input text-xs font-bold"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-mochi-text-secondary mb-1">
                Target Trip/Goal Date
              </label>
              <input
                type="date"
                required
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                className="mochi-input text-xs"
              />
            </div>
          </div>

          {/* Journey Theme Picker */}
          <div>
            <label className="block text-xs font-semibold text-mochi-text-secondary mb-2">
              Choose Journey Artwork Theme:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-40 overflow-y-auto p-1 scrollbar-hide">
              {journeyThemes.map((theme) => (
                <button
                  key={theme.id}
                  type="button"
                  onClick={() => setSelectedTheme(theme.id)}
                  className={cn(
                    'p-2.5 rounded-2xl border text-left flex items-center gap-2 transition-all',
                    selectedTheme === theme.id
                      ? 'border-mochi-primary bg-mochi-primary/10 shadow-sm'
                      : 'border-mochi-border bg-mochi-surface hover:border-mochi-primary/40'
                  )}
                >
                  <MochiIcon id={theme.iconId} size="sm" style="plain" />
                  <span className="text-xs font-bold text-mochi-text line-clamp-1">{theme.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Mascot & Outfit Choice (Same row dropdowns) */}
          <div className="border-t border-mochi-border pt-3">
            <label className="block text-xs font-semibold text-mochi-text-secondary mb-2">
              Your Member Mascot & Outfit:
            </label>
            <div className="flex items-center gap-4 bg-mochi-surface-alt p-3 rounded-2xl border border-mochi-border">
              <GroupMascotSVG animal={myMascot} outfit={myOutfit} size="md" />

              <div className="flex-1 grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] text-mochi-text-muted font-bold block mb-1">
                    Animal Species
                  </label>
                  <select
                    value={myMascot}
                    onChange={(e) => setMyMascot(e.target.value as MascotAnimal)}
                    className="mochi-input text-xs w-full font-bold py-1.5 px-2 bg-mochi-surface"
                  >
                    {mascotAnimals.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[10px] text-mochi-text-muted font-bold block mb-1">
                    Outfit
                  </label>
                  <select
                    value={myOutfit}
                    onChange={(e) => setMyOutfit(e.target.value as MascotOutfit)}
                    className="mochi-input text-xs w-full font-bold py-1.5 px-2 bg-mochi-surface"
                  >
                    {mascotOutfits.map((o) => (
                      <option key={o.id} value={o.id}>
                        {o.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          <button type="submit" className="mochi-btn-primary w-full text-sm py-3 mt-2 flex items-center justify-center gap-2">
            <Plus className="w-4 h-4" /> Create Mochi Circle
          </button>
        </form>
      </Dialog>
    </div>
  )
}
