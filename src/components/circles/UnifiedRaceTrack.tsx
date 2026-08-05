import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  CheckCircle2,
  Sparkles,
  Flag,
  Trophy,
  Star,
  PartyPopper,
  Plane,
  Waves,
  TreePine,
  Sunrise,
  Mountain,
  Ship,
  Anchor,
  Footprints,
  Building2,
  ShoppingBag,
  Leaf,
  Train,
  Landmark,
  Sailboat,
  Tent,
  Flame,
  Zap,
  MapPin,
  Navigation,
} from 'lucide-react'
import GroupMascotSVG from '@/components/ui/GroupMascotSVG'
import type { CircleMember, JourneyTheme } from '@/types'
import { formatCurrency, cn } from '@/lib/utils'

interface UnifiedRaceTrackProps {
  theme?: JourneyTheme
  targetAmount: number
  members: CircleMember[]
  currency?: string
  onMemberClick?: (member: CircleMember) => void
}

type IconFC = React.FC<{ className?: string }>

interface ThemeConfig {
  name: string
  cardBg: string
  laneBg: string
  trackFill: string
  badgeColor: string
  finishColor: string
  checkpoints: { label: string; Icon: IconFC }[]
  FinishIcon: IconFC
  finishMsg: string
}

const cuteThemeConfigs: Record<JourneyTheme, ThemeConfig> = {
  boracay: {
    name: 'Boracay Beach Getaway',
    cardBg: 'from-amber-100/70 via-sky-100/70 to-pink-100/70 dark:from-slate-900 dark:via-sky-950/60 dark:to-slate-900',
    laneBg: 'bg-white/80 dark:bg-slate-900/80 border-sky-200 dark:border-slate-800',
    trackFill: 'from-sky-400 via-amber-300 to-mochi-primary',
    badgeColor: 'bg-sky-500/10 text-sky-600 border-sky-400/30',
    finishColor: 'text-sky-500',
    checkpoints: [
      { label: 'Departure', Icon: Plane },
      { label: 'Palm Grove', Icon: TreePine },
      { label: 'White Beach', Icon: Waves },
      { label: 'Finish', Icon: Flag },
    ],
    FinishIcon: Waves,
    finishMsg: 'Made it to Boracay!',
  },
  bohol: {
    name: 'Bohol Nature Trail',
    cardBg: 'from-emerald-100/70 via-teal-100/70 to-amber-100/70 dark:from-slate-900 dark:via-emerald-950/60 dark:to-slate-900',
    laneBg: 'bg-white/80 dark:bg-slate-900/80 border-emerald-200 dark:border-slate-800',
    trackFill: 'from-emerald-400 via-teal-300 to-amber-400',
    badgeColor: 'bg-emerald-500/10 text-emerald-600 border-emerald-400/30',
    finishColor: 'text-emerald-500',
    checkpoints: [
      { label: 'Ferry', Icon: Ship },
      { label: 'River', Icon: Anchor },
      { label: 'Trail', Icon: Footprints },
      { label: 'Hills', Icon: Mountain },
    ],
    FinishIcon: Mountain,
    finishMsg: 'Reached Chocolate Hills!',
  },
  manila: {
    name: 'Manila Sunset Run',
    cardBg: 'from-purple-100/70 via-pink-100/70 to-sky-100/70 dark:from-slate-900 dark:via-purple-950/60 dark:to-slate-900',
    laneBg: 'bg-white/80 dark:bg-slate-900/80 border-purple-200 dark:border-slate-800',
    trackFill: 'from-purple-400 via-pink-300 to-amber-400',
    badgeColor: 'bg-purple-500/10 text-purple-600 border-purple-400/30',
    finishColor: 'text-amber-500',
    checkpoints: [
      { label: 'Intramuros', Icon: Landmark },
      { label: 'Skyline', Icon: Building2 },
      { label: 'Bay', Icon: Waves },
      { label: 'Sunset', Icon: Sunrise },
    ],
    FinishIcon: Sunrise,
    finishMsg: 'Manila Bay sunset reached!',
  },
  japan: {
    name: 'Japan Sakura Blossom',
    cardBg: 'from-pink-100/70 via-rose-100/70 to-purple-100/70 dark:from-slate-900 dark:via-pink-950/60 dark:to-slate-900',
    laneBg: 'bg-white/80 dark:bg-slate-900/80 border-pink-200 dark:border-slate-800',
    trackFill: 'from-pink-400 via-rose-300 to-purple-400',
    badgeColor: 'bg-pink-500/10 text-pink-600 border-pink-400/30',
    finishColor: 'text-pink-500',
    checkpoints: [
      { label: 'Shinkansen', Icon: Train },
      { label: 'Sakura Park', Icon: Leaf },
      { label: 'Tokyo', Icon: Building2 },
      { label: 'Fuji', Icon: Mountain },
    ],
    FinishIcon: Mountain,
    finishMsg: 'Arrived at Mount Fuji!',
  },
  korea: {
    name: 'Seoul Autumn Discovery',
    cardBg: 'from-amber-100/70 via-orange-100/70 to-rose-100/70 dark:from-slate-900 dark:via-orange-950/60 dark:to-slate-900',
    laneBg: 'bg-white/80 dark:bg-slate-900/80 border-amber-200 dark:border-slate-800',
    trackFill: 'from-amber-400 via-orange-300 to-rose-400',
    badgeColor: 'bg-amber-500/10 text-amber-600 border-amber-400/30',
    finishColor: 'text-orange-500',
    checkpoints: [
      { label: 'Han River', Icon: Navigation },
      { label: 'Namsan', Icon: MapPin },
      { label: 'Myeongdong', Icon: ShoppingBag },
      { label: 'Finish', Icon: Flag },
    ],
    FinishIcon: Leaf,
    finishMsg: 'Seoul fully explored!',
  },
  europe: {
    name: 'Euro Rail Voyage',
    cardBg: 'from-blue-100/70 via-sky-100/70 to-indigo-100/70 dark:from-slate-900 dark:via-blue-950/60 dark:to-slate-900',
    laneBg: 'bg-white/80 dark:bg-slate-900/80 border-blue-200 dark:border-slate-800',
    trackFill: 'from-sky-400 via-blue-300 to-indigo-400',
    badgeColor: 'bg-blue-500/10 text-blue-600 border-blue-400/30',
    finishColor: 'text-blue-500',
    checkpoints: [
      { label: 'Paris', Icon: Landmark },
      { label: 'Swiss Alps', Icon: Mountain },
      { label: 'Vienna', Icon: Building2 },
      { label: 'Venice', Icon: Sailboat },
    ],
    FinishIcon: Sailboat,
    finishMsg: 'Venice canals reached!',
  },
  camping: {
    name: 'Campfire Wilderness',
    cardBg: 'from-teal-100/70 via-emerald-100/70 to-green-100/70 dark:from-slate-900 dark:via-teal-950/60 dark:to-slate-900',
    laneBg: 'bg-white/80 dark:bg-slate-900/80 border-teal-200 dark:border-slate-800',
    trackFill: 'from-teal-400 via-emerald-300 to-green-400',
    badgeColor: 'bg-teal-500/10 text-teal-600 border-teal-400/30',
    finishColor: 'text-teal-500',
    checkpoints: [
      { label: 'Pine Ridge', Icon: TreePine },
      { label: 'Firefly Valley', Icon: Zap },
      { label: 'Base Camp', Icon: Tent },
      { label: 'Starlight', Icon: Star },
    ],
    FinishIcon: Flame,
    finishMsg: 'Campfire reached!',
  },
}

// Floating confetti particle
function ConfettiDot({ color, style }: { color: string; style?: React.CSSProperties }) {
  return (
    <motion.div
      className="absolute w-2 h-2 rounded-sm pointer-events-none"
      style={{ backgroundColor: color, ...style }}
      animate={{
        y: [0, -60, 80],
        x: [0, Math.random() * 40 - 20, Math.random() * 60 - 30],
        rotate: [0, 180, 360],
        opacity: [1, 1, 0],
      }}
      transition={{ duration: 1.4 + Math.random() * 0.6, ease: 'easeOut' }}
    />
  )
}

const confettiColors = ['#FF6B9D', '#FFA94D', '#69DB7C', '#74C0FC', '#E599F7', '#FFD43B']

export function UnifiedRaceTrack({
  theme = 'boracay',
  targetAmount,
  members,
  currency = 'PHP',
  onMemberClick,
}: UnifiedRaceTrackProps) {
  const config = cuteThemeConfigs[theme] || cuteThemeConfigs.boracay
  const perMemberTarget = Math.max(1000, targetAmount / Math.max(1, members.length))

  const [speechBubbles, setSpeechBubbles] = useState<Record<string, string>>({})
  const [celebratingId, setCelebratingId] = useState<string | null>(null)

  const handleMascotTap = (member: CircleMember, percent: number, remaining: number) => {
    let quote = ''
    if (percent >= 100) {
      quote = `${config.finishMsg} Time to celebrate!`
      setCelebratingId(member.id)
      setTimeout(() => setCelebratingId(null), 4500)
    } else if (remaining <= 2000) {
      quote = `Almost there! Only ${formatCurrency(remaining, currency)} left!`
    } else {
      quote = `Every contribution brings us closer!`
    }

    setSpeechBubbles((prev) => ({ ...prev, [member.id]: quote }))
    if (onMemberClick) onMemberClick(member)

    setTimeout(() => {
      setSpeechBubbles((prev) => {
        const copy = { ...prev }
        delete copy[member.id]
        return copy
      })
    }, 4000)
  }

  const { FinishIcon } = config

  return (
    <div
      className={cn(
        'mochi-card p-5 sm:p-6 bg-gradient-to-br rounded-3xl border border-mochi-border/80 shadow-lg relative overflow-hidden transition-all duration-700',
        config.cardBg
      )}
    >
      {/* Soft Ambient Bubbles */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-mochi-primary/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5 pb-4 border-b border-mochi-border/60 relative z-20">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="mochi-badge mochi-badge-primary text-[10px] font-extrabold uppercase tracking-wider">
              Mochi Journey Track
            </span>
            <span className={cn('text-[10px] font-bold px-2.5 py-0.5 rounded-full border', config.badgeColor)}>
              {config.name}
            </span>
          </div>
          <h3 className="text-xl font-black text-mochi-text flex items-center gap-2">
            Race to the Destination
            <Sparkles className="w-4 h-4 text-amber-500 animate-spin-slow" />
          </h3>
          <p className="text-xs text-mochi-text-secondary font-medium mt-0.5">
            Target: {formatCurrency(perMemberTarget, currency)} per member · Tap a mascot to cheer
          </p>
        </div>
        <span className="text-xs font-bold text-mochi-text-secondary bg-mochi-surface/80 px-3 py-1.5 rounded-full border border-mochi-border shadow-xs">
          {members.length} Travelers
        </span>
      </div>

      {/* Checkpoint legend */}
      <div className="grid grid-cols-4 gap-1 mb-4 relative z-20">
        {config.checkpoints.map(({ label, Icon }, i) => {
          const isLast = i === config.checkpoints.length - 1
          return (
            <div key={i} className="text-center">
              <div className={cn(
                'flex flex-col items-center gap-0.5 py-1.5 px-1 rounded-xl text-[9px] font-bold leading-tight',
                isLast
                  ? 'bg-mochi-primary/15 text-mochi-primary'
                  : 'text-mochi-text-muted bg-mochi-border/20'
              )}>
                <Icon className={cn('w-3.5 h-3.5', isLast ? 'text-mochi-primary' : 'text-mochi-text-muted')} />
                {label}
              </div>
            </div>
          )
        })}
      </div>

      {/* Stacked Member Travel Lanes */}
      <div className="space-y-5 relative z-20">
        {members.map((member) => {
          const contributed = member.totalContributed || 0
          const percent = Math.min(100, Math.max(0, (contributed / perMemberTarget) * 100))
          const remaining = Math.max(0, perMemberTarget - contributed)
          const isFinished = percent >= 100
          const isCelebrating = celebratingId === member.id
          const bubble = speechBubbles[member.id]

          return (
            <div key={member.id} className="space-y-2">
              {/* Member Header */}
              <div className="flex items-center justify-between text-xs font-bold text-mochi-text px-1">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-mochi-surface border border-mochi-primary p-0.5 shadow-xs flex items-center justify-center">
                    <GroupMascotSVG animal={member.mascot} outfit={member.outfit} size="xs" />
                  </div>
                  <span className="font-extrabold text-mochi-text flex items-center gap-1">
                    {member.name}
                    {member.role === 'owner' && <Sparkles className="w-3 h-3 text-amber-500 inline" />}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-extrabold text-mochi-text">
                    {formatCurrency(contributed, currency)}{' '}
                    <span className="text-[11px] text-mochi-text-muted font-semibold">({percent.toFixed(0)}%)</span>
                  </span>
                  {isFinished && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 260, damping: 12 }}
                      className="text-[10px] bg-mochi-success text-white font-black px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-xs"
                    >
                      <CheckCircle2 className="w-3 h-3" /> ARRIVED
                    </motion.span>
                  )}
                </div>
              </div>

              {/* Speech Bubble */}
              <AnimatePresence>
                {bubble && (
                  <motion.div
                    initial={{ opacity: 0, y: 4, scale: 0.92 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 4, scale: 0.92 }}
                    className="bg-mochi-surface text-mochi-text text-xs font-bold px-3 py-1.5 rounded-2xl border border-mochi-primary/40 shadow-md inline-flex items-center gap-1.5"
                  >
                    <Sparkles className="w-3 h-3 text-amber-400 shrink-0" />
                    {bubble}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* ── The Track Lane ── */}
              <div
                className={cn(
                  'relative rounded-2xl border p-3 overflow-hidden shadow-sm transition-all duration-300',
                  config.laneBg,
                  isFinished && 'ring-2 ring-mochi-success/60',
                  isCelebrating && 'ring-4 ring-amber-400'
                )}
                style={{ height: '72px' }}
              >
                {/* Quarter-mark dashed lines */}
                {[25, 50, 75].map((mark) => (
                  <div
                    key={mark}
                    className="absolute top-0 bottom-0 w-px border-l border-dashed border-mochi-border/50 pointer-events-none"
                    style={{ left: `${mark}%` }}
                  />
                ))}

                {/* Finish flag pole */}
                <div className="absolute right-3 top-1 bottom-1 flex flex-col items-center justify-start pointer-events-none z-10">
                  <Flag className="w-4 h-4 text-mochi-primary" />
                  <div className="w-px flex-1 bg-mochi-primary/30" />
                </div>

                {/* Track rail */}
                <div className="absolute left-5 right-8 top-1/2 -translate-y-1/2 h-4 bg-mochi-border/30 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${percent}%` }}
                    transition={{ duration: 1.2, ease: 'easeOut' }}
                    className={cn('h-full rounded-full bg-gradient-to-r shadow-inner', config.trackFill)}
                  />
                  <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent rounded-full pointer-events-none" />
                </div>

                {/* Running mascot */}
                <motion.div
                  initial={{ left: '3%' }}
                  animate={{ left: `${Math.min(88, Math.max(3, percent - 2))}%` }}
                  transition={{ type: 'spring', stiffness: 80, damping: 16 }}
                  onClick={() => handleMascotTap(member, percent, remaining)}
                  className="absolute z-30 top-1/2 -translate-y-1/2 -translate-x-1/2 cursor-pointer"
                >
                  <div className="relative flex flex-col items-center">
                    {/* Celebration glow ring */}
                    {isCelebrating && (
                      <motion.div
                        className="absolute inset-0 rounded-full bg-amber-400/40 blur-md"
                        animate={{ scale: [1, 1.8, 1] }}
                        transition={{ repeat: Infinity, duration: 0.8 }}
                      />
                    )}
                    <GroupMascotSVG
                      animal={member.mascot}
                      outfit={isFinished ? 'beach' : member.outfit}
                      size="sm"
                      animated
                      className={cn(
                        'drop-shadow-sm transition-transform',
                        isFinished && 'scale-125',
                        isCelebrating && 'scale-150'
                      )}
                    />
                    {/* Dust puff while running */}
                    {!isFinished && (
                      <motion.div
                        animate={{ opacity: [0.3, 0.9, 0.3], scale: [0.8, 1.4, 0.8] }}
                        transition={{ repeat: Infinity, duration: 1.1 }}
                        className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-6 h-1.5 bg-amber-400/50 rounded-full blur-xs pointer-events-none"
                      />
                    )}
                  </div>
                </motion.div>

                {/* Confetti burst when celebrating */}
                <AnimatePresence>
                  {isCelebrating && (
                    <>
                      {Array.from({ length: 14 }).map((_, i) => (
                        <ConfettiDot
                          key={i}
                          color={confettiColors[i % confettiColors.length]}
                          style={{
                            left: `${Math.min(88, Math.max(3, percent - 2))}%`,
                            top: '50%',
                          }}
                        />
                      ))}
                    </>
                  )}
                </AnimatePresence>
              </div>

              {/* ── FINISH CELEBRATION BANNER ── */}
              <AnimatePresence>
                {isFinished && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ type: 'spring', stiffness: 200, damping: 18 }}
                    className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-amber-400/20 via-emerald-400/20 to-sky-400/20 border border-amber-400/40 px-4 py-3 flex items-center gap-3"
                  >
                    {/* Animated sparkle dots (SVG-based) */}
                    <div className="absolute inset-0 pointer-events-none">
                      {['10%', '30%', '55%', '75%', '90%'].map((left, i) => (
                        <motion.div
                          key={i}
                          className="absolute"
                          style={{ left, top: `${20 + i * 12}%` }}
                          animate={{ y: [-2, 2, -2], opacity: [0.4, 1, 0.4] }}
                          transition={{ repeat: Infinity, duration: 1.5 + i * 0.3 }}
                        >
                          <Star className="w-2.5 h-2.5 text-amber-400 fill-amber-300" />
                        </motion.div>
                      ))}
                    </div>

                    <div className={cn(
                      'w-10 h-10 rounded-full flex items-center justify-center shrink-0',
                      'bg-amber-100 dark:bg-amber-900/40'
                    )}>
                      <FinishIcon className={cn('w-5 h-5', config.finishColor)} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-black text-mochi-text flex items-center gap-1.5">
                        <Trophy className="w-3.5 h-3.5 text-amber-500" />
                        {member.name.replace(' (You)', '')} finished!
                      </p>
                      <p className="text-[10px] text-mochi-text-secondary font-semibold">
                        {config.finishMsg} · {formatCurrency(contributed, currency)} contributed
                      </p>
                    </div>

                    <motion.div
                      animate={{ rotate: [0, 15, -15, 0] }}
                      transition={{ repeat: Infinity, duration: 2 }}
                    >
                      <PartyPopper className="w-5 h-5 text-mochi-primary shrink-0" />
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )
        })}
      </div>

      {/* Overall group finish celebration */}
      <AnimatePresence>
        {members.length > 0 && members.every((m) => (m.totalContributed || 0) >= perMemberTarget) && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mt-6 relative z-20 rounded-2xl bg-gradient-to-r from-mochi-primary/20 via-amber-400/20 to-mochi-secondary/20 border-2 border-mochi-primary/40 p-5 text-center"
          >
            <div className="flex items-center justify-center gap-2 mb-2">
              <Trophy className="w-6 h-6 text-amber-500" />
              <PartyPopper className="w-6 h-6 text-mochi-primary" />
              <Trophy className="w-6 h-6 text-amber-500" />
            </div>
            <p className="text-sm font-black text-mochi-text">ALL MEMBERS REACHED THE DESTINATION!</p>
            <p className="text-xs text-mochi-text-secondary mt-1 flex items-center justify-center gap-1.5">
              <FinishIcon className={cn('w-3.5 h-3.5', config.finishColor)} />
              Time to book that trip!
            </p>
            <div className="flex items-center justify-center gap-1 mt-2">
              {members.map((m) => (
                <Star key={m.id} className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default UnifiedRaceTrack
