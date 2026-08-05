import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  CheckCircle2,
  Gift,
  Home,
  Car,
  Plane,
  Waves,
  Building,
  Ship,
  Anchor,
  Footprints,
  Mountain,
  Train,
  Landmark,
  Building2,
  Sunrise,
  Leaf,
  MapPin,
  ShoppingBag,
  Sailboat,
  TreePine,
  Zap,
  Flame,
  Sun,
  UtensilsCrossed,
  Flag,
  Navigation,
} from 'lucide-react'
import GroupMascotSVG from '@/components/ui/GroupMascotSVG'
import type { CircleMember, JourneyTheme } from '@/types'
import { formatCurrency, cn } from '@/lib/utils'

interface MultiLaneJourneyProps {
  theme: JourneyTheme
  targetAmount: number // Total group goal or per-member goal
  members: CircleMember[]
  currency?: string
  onMemberClick?: (member: CircleMember) => void
}

type MascotReaction =
  | 'happy'
  | 'jumping'
  | 'waving'
  | 'dancing'
  | 'cheering'
  | 'thinking'
  | 'selfie'
  | 'halo_halo'
  | 'swimming'

type IconFC = React.FC<{ className?: string }>

const themeAdventurePaths: Record<
  JourneyTheme,
  {
    title: string
    checkpoints: { pct: number; name: string; Icon: IconFC; unlock: string }[]
    laneBg: string
    arrivedBg: string
  }
> = {
  boracay: {
    title: 'Boracay Island Expedition',
    checkpoints: [
      { pct: 0,   name: 'Home Base',      Icon: Home,      unlock: 'Pack Bags' },
      { pct: 15,  name: 'Taxi Ride',      Icon: Car,       unlock: 'Travel Pillow' },
      { pct: 35,  name: 'Cebu Airport',   Icon: Building,  unlock: 'Boarding Pass' },
      { pct: 55,  name: 'Cloud Flight',   Icon: Plane,     unlock: 'In-flight Snack' },
      { pct: 75,  name: 'Caticlan Boat',  Icon: Waves,     unlock: 'Straw Hat' },
      { pct: 90,  name: 'Station 1 Hotel',Icon: Building2, unlock: 'Keycard' },
      { pct: 100, name: 'White Beach',    Icon: Flag,      unlock: 'Beach Party & Passport Stamp' },
    ],
    laneBg: 'from-amber-50/80 via-sky-50/80 to-blue-50/80 dark:from-slate-900/60 dark:via-sky-950/40 dark:to-slate-900/60',
    arrivedBg: 'from-amber-200/40 via-sky-200/40 to-emerald-200/40 dark:from-amber-950/40 dark:to-emerald-950/40',
  },
  bohol: {
    title: 'Bohol Nature Trail',
    checkpoints: [
      { pct: 0,   name: 'Home Base',         Icon: Home,      unlock: 'Compass' },
      { pct: 20,  name: 'Ferry Pier',         Icon: Ship,      unlock: 'Ferry Ticket' },
      { pct: 45,  name: 'Tarsier Sanctuary',  Icon: Anchor,    unlock: 'Tarsier Plush' },
      { pct: 70,  name: 'Loboc Cruise',       Icon: Footprints,unlock: 'Buffet Badge' },
      { pct: 100, name: 'Chocolate Hills',    Icon: Mountain,  unlock: 'Summit Stamp' },
    ],
    laneBg: 'from-emerald-50/80 via-amber-50/80 to-teal-50/80 dark:from-emerald-950/40 dark:to-slate-900/60',
    arrivedBg: 'from-emerald-200/40 via-teal-200/40 to-green-200/40',
  },
  manila: {
    title: 'Manila City Lights Exploration',
    checkpoints: [
      { pct: 0,   name: 'Home',             Icon: Home,      unlock: 'Transit Card' },
      { pct: 25,  name: 'LRT Station',      Icon: Train,     unlock: 'City Map' },
      { pct: 50,  name: 'Intramuros',       Icon: Landmark,  unlock: 'Kalesa Ride' },
      { pct: 75,  name: 'BGC High Street',  Icon: Building2, unlock: 'Coffee Badge' },
      { pct: 100, name: 'Manila Bay Sunset',Icon: Sunrise,   unlock: 'Baywalk Stamp' },
    ],
    laneBg: 'from-slate-50/80 via-indigo-50/80 to-purple-50/80 dark:from-indigo-950/40 dark:to-slate-900/60',
    arrivedBg: 'from-purple-200/40 via-indigo-200/40 to-pink-200/40',
  },
  japan: {
    title: 'Japan Cherry Blossom Journey',
    checkpoints: [
      { pct: 0,   name: 'Home',               Icon: Home,     unlock: 'Passport' },
      { pct: 25,  name: 'Tokyo Shinkansen',    Icon: Train,    unlock: 'Bento Box' },
      { pct: 55,  name: 'Kyoto Shrine',        Icon: Landmark, unlock: 'Omikuji Fortune' },
      { pct: 80,  name: 'Cherry Blossom Park', Icon: Leaf,     unlock: 'Sakura Tea' },
      { pct: 100, name: 'Mount Fuji Summit',   Icon: Mountain, unlock: 'Fuji Stamp' },
    ],
    laneBg: 'from-pink-50/80 via-rose-50/80 to-purple-50/80 dark:from-rose-950/40 dark:to-slate-900/60',
    arrivedBg: 'from-pink-200/40 via-rose-200/40 to-purple-200/40',
  },
  korea: {
    title: 'Seoul Autumn Discovery',
    checkpoints: [
      { pct: 0,   name: 'Home',            Icon: Home,       unlock: 'T-Money Card' },
      { pct: 30,  name: 'Han River Park',  Icon: Navigation,  unlock: 'Ramen Cooker' },
      { pct: 60,  name: 'Namsan Tower',    Icon: MapPin,     unlock: 'Love Lock' },
      { pct: 100, name: 'Myeongdong',      Icon: ShoppingBag,unlock: 'Seoul Stamp' },
    ],
    laneBg: 'from-amber-50/80 via-orange-50/80 to-red-50/80 dark:from-orange-950/40 dark:to-slate-900/60',
    arrivedBg: 'from-amber-200/40 via-orange-200/40 to-red-200/40',
  },
  europe: {
    title: 'Euro Rail Grand Voyage',
    checkpoints: [
      { pct: 0,   name: 'Home Base',           Icon: Home,     unlock: 'Euro Pass' },
      { pct: 30,  name: 'Paris Eiffel Tower',  Icon: Landmark, unlock: 'Croissant' },
      { pct: 65,  name: 'Swiss Alps Train',    Icon: Mountain, unlock: 'Fondue Pot' },
      { pct: 100, name: 'Venice Canals',       Icon: Sailboat, unlock: 'Gondola Stamp' },
    ],
    laneBg: 'from-blue-50/80 via-sky-50/80 to-indigo-50/80 dark:from-blue-950/40 dark:to-slate-900/60',
    arrivedBg: 'from-blue-200/40 via-sky-200/40 to-indigo-200/40',
  },
  camping: {
    title: 'Campfire Mountain Wilderness',
    checkpoints: [
      { pct: 0,   name: 'Cabin Base',      Icon: Home,    unlock: 'Flashlight' },
      { pct: 25,  name: 'Pine Forest',     Icon: TreePine,unlock: 'Hiking Boots' },
      { pct: 60,  name: 'Firefly Valley',  Icon: Zap,     unlock: 'Lantern' },
      { pct: 100, name: 'Starry Campfire', Icon: Flame,   unlock: 'Campfire Stamp' },
    ],
    laneBg: 'from-emerald-50/80 via-teal-50/80 to-green-50/80 dark:from-teal-950/40 dark:to-slate-900/60',
    arrivedBg: 'from-emerald-200/40 via-teal-200/40 to-green-200/40',
  },
}

export function MultiLaneJourney({
  theme = 'boracay',
  targetAmount,
  members,
  currency = 'PHP',
  onMemberClick,
}: MultiLaneJourneyProps) {
  const adventure = themeAdventurePaths[theme] || themeAdventurePaths.boracay

  // Per-member target goal (if total group goal, divide equally per member)
  const perMemberTarget = Math.max(1000, targetAmount / Math.max(1, members.length))

  // State to track mascot tap reactions per member
  const [activeReactions, setActiveReactions] = useState<Record<string, MascotReaction>>({})
  const [activeSpeechBubble, setActiveSpeechBubble] = useState<Record<string, string>>({})

  const handleMascotTap = (member: CircleMember, percent: number, remaining: number) => {
    // Cycle reactions on tap
    const reactions: MascotReaction[] = [
      'happy',
      'jumping',
      'waving',
      'dancing',
      'cheering',
      'thinking',
      'selfie',
      'halo_halo',
      'swimming',
    ]
    const currentReaction = activeReactions[member.id] || 'happy'
    const nextIndex = (reactions.indexOf(currentReaction) + 1) % reactions.length
    const nextReaction = reactions[nextIndex]

    setActiveReactions((prev) => ({ ...prev, [member.id]: nextReaction }))

    // Set custom motivational quote depending on progress
    let quote = ''
    if (percent >= 100) {
      quote = `You made it to ${adventure.checkpoints[adventure.checkpoints.length - 1].name}! Time to celebrate!`
    } else if (remaining <= 2000) {
      quote = `Only ${formatCurrency(remaining, currency)} away from ${adventure.checkpoints[adventure.checkpoints.length - 1].name}!`
    } else if (percent >= 50) {
      quote = `Over halfway there! Keep up the momentum!`
    } else {
      quote = `Every peso saved brings us closer to our goal!`
    }

    setActiveSpeechBubble((prev) => ({ ...prev, [member.id]: quote }))

    if (onMemberClick) onMemberClick(member)

    // Clear quote after 4s
    setTimeout(() => {
      setActiveSpeechBubble((prev) => {
        const copy = { ...prev }
        delete copy[member.id]
        return copy
      })
    }, 4000)
  }

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="mochi-card bg-gradient-to-r from-sky-500/10 via-amber-500/10 to-purple-500/10 p-5 rounded-3xl border border-sky-400/30 shadow-md">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-sky-500/20 flex items-center justify-center text-xl">
              🗺️
            </div>
            <div>
              <h3 className="text-base font-black text-mochi-text flex items-center gap-2">
                {adventure.title}
                <span className="mochi-badge mochi-badge-primary text-[10px] font-extrabold uppercase">
                  Multi-Lane Mode
                </span>
              </h3>
              <p className="text-xs text-mochi-text-secondary mt-0.5">
                Every member has their own journey. Tap a mascot to react & cheer!
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-mochi-text-secondary bg-mochi-surface px-3 py-1.5 rounded-full border border-mochi-border">
              Individual Goal: {formatCurrency(perMemberTarget, currency)} each
            </span>
          </div>
        </div>
      </div>

      {/* Group Member Lanes Grid */}
      <div className="space-y-4">
        {members.map((member) => {
          const contributed = member.totalContributed || 0
          const percent = Math.min(100, Math.max(0, (contributed / perMemberTarget) * 100))
          const remaining = Math.max(0, perMemberTarget - contributed)
          const isFinished = percent >= 100
          const reaction = activeReactions[member.id] || (isFinished ? 'dancing' : 'happy')
          const bubble = activeSpeechBubble[member.id]

          return (
            <motion.div
              key={member.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn(
                'relative p-4 sm:p-5 rounded-3xl border shadow-md transition-all overflow-hidden bg-gradient-to-r',
                isFinished ? adventure.arrivedBg : adventure.laneBg,
                isFinished ? 'border-emerald-400/60 shadow-emerald-400/10' : 'border-mochi-border'
              )}
            >
              {/* Member Top Info Header */}
              <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                <div className="flex items-center gap-2.5">
                  {/* Avatar Badge */}
                  <div className="w-8 h-8 rounded-full bg-white shadow-xs border border-slate-200 flex items-center justify-center p-0.5">
                    <GroupMascotSVG animal={member.mascot} outfit={member.outfit} size="xs" />
                  </div>
                  <div>
                    <h4 className="text-sm font-extrabold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
                      {member.name}
                      {member.role === 'owner' && <span title="Circle Owner">⭐</span>}
                      {isFinished && (
                        <span className="text-[10px] bg-emerald-500 text-white font-extrabold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-xs animate-bounce">
                          <CheckCircle2 className="w-3 h-3" /> ARRIVED!
                        </span>
                      )}
                    </h4>
                    <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400">
                      Mascot: <span className="capitalize">{member.mascot}</span> • {member.outfit}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-sm font-black text-slate-900 dark:text-slate-100">
                    {formatCurrency(contributed, currency)}{' '}
                    <span className="text-xs text-slate-500 font-semibold">/ {formatCurrency(perMemberTarget, currency)}</span>
                  </span>
                  <div className="text-xs font-extrabold text-sky-600 dark:text-sky-400">
                    {percent.toFixed(0)}% Completed
                  </div>
                </div>
              </div>

              {/* Speech Bubble Notification */}
              <AnimatePresence>
                {bubble && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8, y: 5 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.8, y: 5 }}
                    className="relative z-20 mb-3 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 text-xs font-bold px-3.5 py-2 rounded-2xl border border-sky-400 shadow-md inline-block"
                  >
                    {bubble}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Individual Lane Trail Canvas */}
              <div className="relative h-20 sm:h-24 w-full bg-white/70 dark:bg-slate-900/70 rounded-2xl p-3 border border-white/50 dark:border-slate-800 shadow-inner flex items-center">
                {/* Lane Checkpoint Markers along non-linear progress */}
                <div className="absolute inset-x-6 top-1/2 -translate-y-1/2 flex items-center justify-between pointer-events-none z-10">
                  {adventure.checkpoints.map((cp) => {
                    const isPassed = percent >= cp.pct
                    return (
                      <div key={cp.pct} className="flex flex-col items-center">
                        <div
                          className={cn(
                            'w-7 h-7 rounded-full flex items-center justify-center text-xs shadow-xs transition-transform border',
                            isPassed
                              ? 'bg-amber-400 border-white text-slate-900 scale-110'
                              : 'bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-400'
                          )}
                          title={`${cp.name} (${cp.pct}%): Unlocks ${cp.unlock}`}
                        >
                          <cp.Icon className="w-3.5 h-3.5" />
                        </div>
                        <span className="text-[9px] font-bold text-slate-600 dark:text-slate-400 mt-1 hidden sm:block whitespace-nowrap">
                          {cp.name}
                        </span>
                      </div>
                    )
                  })}
                </div>

                {/* Lit Progress Fill Track */}
                <div className="absolute inset-x-6 top-1/2 -translate-y-1/2 h-2.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${percent}%` }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                    className={cn(
                      'h-full rounded-full bg-gradient-to-r',
                      isFinished
                        ? 'from-emerald-400 via-teal-400 to-sky-400'
                        : 'from-sky-400 via-amber-400 to-mochi-primary'
                    )}
                  />
                </div>

                {/* Animated Member Mascot walking along progress */}
                <motion.div
                  initial={{ left: '2%' }}
                  animate={{ left: `${Math.min(92, Math.max(4, percent))}%` }}
                  transition={{ type: 'spring', stiffness: 90, damping: 14 }}
                  onClick={() => handleMascotTap(member, percent, remaining)}
                  className="absolute z-20 top-1/2 -translate-y-1/2 -translate-x-1/2 cursor-pointer group"
                >
                  {isFinished ? (
                    /* 100% ARRIVED TRANSFORMATION: Lounging on beach chair with drink */
                    <div className="relative flex flex-col items-center">
                      <div className="flex items-center gap-1 bg-amber-300 text-slate-900 px-2 py-0.5 rounded-full text-[10px] font-black shadow-md border border-amber-400">
                        <Sun className="w-3 h-3 text-amber-700" /> Beach Lounge Mode
                      </div>
                      <div className="relative mt-1">
                        <GroupMascotSVG animal={member.mascot} outfit="beach" size="md" className="rotate-6" />
                        <div className="absolute -top-1 -right-1 w-5 h-5 bg-amber-200 rounded-full flex items-center justify-center border border-amber-400">
                          <UtensilsCrossed className="w-2.5 h-2.5 text-amber-700" />
                        </div>
                        <div className="absolute -bottom-1 -left-2 w-5 h-5 bg-sky-200 rounded-full flex items-center justify-center border border-sky-300">
                          <Waves className="w-2.5 h-2.5 text-sky-600" />
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* WALKING MODE: Mascot walking with footsteps & dust */
                    <div className="relative flex flex-col items-center">
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 text-white text-[9px] font-bold px-2 py-0.5 rounded-full shadow-md whitespace-nowrap mb-1">
                        Tap for reaction!
                      </div>
                      <div className="relative">
                        <GroupMascotSVG
                          animal={member.mascot}
                          outfit={member.outfit}
                          size="md"
                          animated
                          className={cn(
                            reaction === 'jumping' && '-translate-y-3 scale-110',
                            reaction === 'dancing' && 'rotate-12',
                            reaction === 'swimming' && 'rotate-90'
                          )}
                        />
                        {/* Tiny Footstep & Dust Particles */}
                        <motion.div
                          animate={{ opacity: [0.3, 0.9, 0.3], scale: [0.8, 1.3, 0.8] }}
                          transition={{ repeat: Infinity, duration: 1.2 }}
                          className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-6 h-2 bg-amber-300/60 rounded-full blur-xs pointer-events-none"
                        />
                      </div>
                    </div>
                  )}
                </motion.div>
              </div>

              {/* Lane Checkpoint Cosmetic Rewards Banner */}
              <div className="mt-3 flex items-center justify-between text-[11px] font-bold text-slate-600 dark:text-slate-400 bg-white/40 dark:bg-slate-900/40 p-2 rounded-xl border border-white/30">
                <span className="flex items-center gap-1 text-amber-600 dark:text-amber-300">
                  <Gift className="w-3.5 h-3.5" />
                  Unlocked Rewards:
                </span>
                <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-hide">
                  {adventure.checkpoints
                    .filter((cp) => percent >= cp.pct && cp.pct > 0)
                    .map((cp) => {
                      const CpIcon = cp.Icon
                      return (
                        <span
                          key={cp.pct}
                          className="bg-amber-400/20 text-amber-900 dark:text-amber-200 px-2 py-0.5 rounded-full text-[10px] font-extrabold border border-amber-400/30 flex items-center gap-1"
                        >
                          <CpIcon className="w-3 h-3" /> {cp.unlock}
                        </span>
                      )
                    })}
                  {percent < 15 && (
                    <span className="text-[10px] text-slate-400 italic">Save more to unlock travel perks!</span>
                  )}
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}

export default MultiLaneJourney
