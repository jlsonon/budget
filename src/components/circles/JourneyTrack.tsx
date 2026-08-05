import { useState } from 'react'
import { Waves, Mountain, Building2, Leaf, Flag, Flame, Train } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, MapPin, CheckCircle2 } from 'lucide-react'
import GroupMascotSVG from '@/components/ui/GroupMascotSVG'
import type { CircleMember, JourneyTheme } from '@/types'
import { formatCurrency, cn } from '@/lib/utils'

interface JourneyTrackProps {
  theme: JourneyTheme
  targetAmount: number
  currentAmount: number
  members: CircleMember[]
  currency?: string
}

type IconFC = React.FC<{ className?: string }>

const themeDetails: Record<
  JourneyTheme,
  {
    name: string
    startBg: string
    midBg: string
    endBg: string
    accentColor: string
    pathColor: string
    pathGlow: string
    Icon: IconFC
    iconColor?: string
    checkpoints: string[]
  }
> = {
  boracay: {
    name: 'Boracay Beach Road',
    startBg: 'from-amber-100 via-sky-100 to-sky-200',
    midBg: 'from-sky-200 via-cyan-100 to-amber-200',
    endBg: 'from-amber-300 via-orange-300 to-sky-400',
    accentColor: '#0EA5E9',
    pathColor: '#F59E0B',
    pathGlow: 'rgba(245, 158, 11, 0.4)',
    Icon: Waves,
    iconColor: 'text-sky-500',
    checkpoints: ['Airport', 'Flight', 'Palm Grove', 'White Beach', 'Boracay Sunset'],
  },
  bohol: {
    name: 'Bohol Countryside',
    startBg: 'from-emerald-100 via-green-100 to-amber-100',
    midBg: 'from-amber-100 via-emerald-200 to-amber-200',
    endBg: 'from-emerald-200 via-teal-200 to-green-300',
    accentColor: '#10B981',
    pathColor: '#B45309',
    pathGlow: 'rgba(180, 83, 9, 0.4)',
    Icon: Mountain,
    iconColor: 'text-emerald-600',
    checkpoints: ['Tagbilaran', 'Tarsier Sanctuary', 'Loboc River', 'Chocolate Hills'],
  },
  manila: {
    name: 'Manila Lights',
    startBg: 'from-slate-200 via-indigo-100 to-purple-200',
    midBg: 'from-purple-200 via-slate-300 to-indigo-300',
    endBg: 'from-indigo-300 via-purple-400 to-pink-300',
    accentColor: '#8B5CF6',
    pathColor: '#6366F1',
    pathGlow: 'rgba(99, 102, 241, 0.4)',
    Icon: Building2,
    iconColor: 'text-purple-500',
    checkpoints: ['Intramuros', 'Rizal Park', 'BGC Skyline', 'Manila Bay Sunset'],
  },
  japan: {
    name: 'Japan Cherry Blossom Run',
    startBg: 'from-pink-100 via-rose-100 to-purple-100',
    midBg: 'from-purple-100 via-pink-200 to-rose-200',
    endBg: 'from-rose-200 via-purple-300 to-pink-300',
    accentColor: '#EC4899',
    pathColor: '#F43F5E',
    pathGlow: 'rgba(244, 63, 94, 0.4)',
    Icon: Leaf,
    iconColor: 'text-pink-500',
    checkpoints: ['Tokyo Station', 'Kyoto Shrine', 'Cherry Blossoms', 'Mount Fuji'],
  },
  korea: {
    name: 'Seoul Autumn Trail',
    startBg: 'from-amber-100 via-orange-100 to-red-100',
    midBg: 'from-orange-100 via-red-200 to-amber-200',
    endBg: 'from-amber-200 via-orange-300 to-red-300',
    accentColor: '#F97316',
    pathColor: '#EA580C',
    pathGlow: 'rgba(234, 88, 12, 0.4)',
    Icon: Flag,
    iconColor: 'text-orange-500',
    checkpoints: ['Incheon', 'Han River', 'Namsan Tower', 'Myeongdong'],
  },
  europe: {
    name: 'Euro Rail Adventure',
    startBg: 'from-blue-100 via-indigo-100 to-sky-200',
    midBg: 'from-sky-200 via-blue-200 to-indigo-200',
    endBg: 'from-indigo-200 via-sky-300 to-purple-300',
    accentColor: '#2563EB',
    pathColor: '#3B82F6',
    pathGlow: 'rgba(59, 130, 246, 0.4)',
    Icon: Train,
    iconColor: 'text-blue-500',
    checkpoints: ['London Express', 'Paris Eifel', 'Alpine Pass', 'Rome Coliseum'],
  },
  camping: {
    name: 'Campfire Wilderness',
    startBg: 'from-emerald-100 via-teal-100 to-green-200',
    midBg: 'from-green-200 via-emerald-200 to-teal-300',
    endBg: 'from-teal-300 via-emerald-400 to-green-400',
    accentColor: '#059669',
    pathColor: '#047857',
    pathGlow: 'rgba(4, 120, 87, 0.4)',
    Icon: Flame,
    iconColor: 'text-emerald-500',
    checkpoints: ['Pine Ridge', 'River Crossing', 'Firefly Valley', 'Starlight Cabin'],
  },
}

export function JourneyTrack({
  theme = 'boracay',
  targetAmount,
  currentAmount,
  members,
  currency = 'PHP',
}: JourneyTrackProps) {
  const config = themeDetails[theme] || themeDetails.boracay
  const progressPercent = Math.min(100, Math.max(0, (currentAmount / targetAmount) * 100))
  const [selectedMember, setSelectedMember] = useState<CircleMember | null>(null)

  // 4 checkpoints (25%, 50%, 75%, 100%)
  const checkpoints = [
    { percent: 25, label: config.checkpoints[1] || 'Checkpoint 1' },
    { percent: 50, label: config.checkpoints[2] || 'Checkpoint 2' },
    { percent: 75, label: config.checkpoints[3] || 'Checkpoint 3' },
    { percent: 100, label: config.checkpoints[4] || 'Destination' },
  ]

  // Calculate coordinates along a smooth sinusoidal winding path
  // Path points: (x in %, y in px)
  const getCoordinates = (pct: number) => {
    const clampedPct = Math.min(100, Math.max(0, pct))
    // X goes smoothly from 8% to 92%
    const x = 8 + (clampedPct / 100) * 84
    // Y S-curve wave between 40px and 120px
    const y = 80 + Math.sin((clampedPct / 100) * Math.PI * 2.5) * 35
    return { x, y }
  }

  return (
    <div className="relative rounded-3xl overflow-hidden shadow-xl border border-white/20 p-5 bg-gradient-to-br transition-colors duration-700">
      {/* Background Layer with Dynamic Gradient depending on progress */}
      <div
        className={cn(
          'absolute inset-0 bg-gradient-to-br transition-opacity duration-1000',
          progressPercent < 35 && config.startBg,
          progressPercent >= 35 && progressPercent < 75 && config.midBg,
          progressPercent >= 75 && config.endBg
        )}
      />

      {/* Decorative SVG background elements */}
      <svg className="absolute inset-0 w-full h-full opacity-20 pointer-events-none" preserveAspectRatio="none">
        <circle cx="20%" cy="30%" r="60" fill="white" />
        <circle cx="80%" cy="20%" r="80" fill="white" />
        <path d="M0 120 Q50 80 100 120 T200 120" stroke="white" strokeWidth="4" fill="none" />
      </svg>

      {/* Header Info Banner */}
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 mb-6 bg-white/75 backdrop-blur-md rounded-2xl p-3.5 border border-white/40 shadow-sm">
        <div className="flex items-center gap-3">
          <config.Icon className={cn("w-8 h-8", config.iconColor)} />
          <div>
            <h4 className="text-sm font-bold text-slate-800">{config.name}</h4>
            <p className="text-xs text-slate-500 font-medium">
              Cooperative Journey • {members.length} Members Traveling Together
            </p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-base font-extrabold text-slate-900">
            {formatCurrency(currentAmount, currency)}{' '}
            <span className="text-xs font-semibold text-slate-500">/ {formatCurrency(targetAmount, currency)}</span>
          </div>
          <div className="flex items-center justify-end gap-1 text-xs font-bold text-sky-600">
            <Sparkles className="w-3.5 h-3.5" />
            {progressPercent.toFixed(1)}% Completed
          </div>
        </div>
      </div>

      {/* Interactive Winding Journey Canvas */}
      <div className="relative z-10 h-44 sm:h-52 w-full flex items-center justify-center my-2">
        {/* SVG Path line */}
        <svg className="absolute inset-0 w-full h-full overflow-visible pointer-events-none">
          <defs>
            <linearGradient id="journeyGlow" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor={config.pathColor} stopOpacity="0.4" />
              <stop offset="100%" stopColor={config.accentColor} stopOpacity="0.9" />
            </linearGradient>
          </defs>
          {/* Background Track Line */}
          <path
            d="M 8% 80 C 25% 120, 45% 40, 65% 120 C 80% 40, 90% 80, 92% 80"
            stroke="white"
            strokeWidth="12"
            strokeLinecap="round"
            fill="none"
            className="opacity-70"
          />
          {/* Active Lit Track Line */}
          <path
            d="M 8% 80 C 25% 120, 45% 40, 65% 120 C 80% 40, 90% 80, 92% 80"
            stroke="url(#journeyGlow)"
            strokeWidth="8"
            strokeDasharray="6 6"
            strokeLinecap="round"
            fill="none"
          />
        </svg>

        {/* Start Point */}
        <div className="absolute left-[4%] top-[68px] flex flex-col items-center z-20">
          <div className="w-8 h-8 rounded-full bg-white shadow-md border-2 border-slate-300 flex items-center justify-center text-xs font-bold text-slate-700">
            🚩
          </div>
          <span className="text-[10px] font-bold text-slate-700 mt-1 bg-white/80 px-1.5 py-0.5 rounded shadow-xs">
            {config.checkpoints[0]}
          </span>
        </div>

        {/* Checkpoint Markers */}
        {checkpoints.map((cp) => {
          const coords = getCoordinates(cp.percent)
          const isReached = progressPercent >= cp.percent
          return (
            <div
              key={cp.percent}
              className="absolute z-20 flex flex-col items-center -translate-x-1/2 -translate-y-1/2 transition-all"
              style={{ left: `${coords.x}%`, top: `${coords.y}px` }}
            >
              <div
                className={cn(
                  'w-7 h-7 rounded-full flex items-center justify-center shadow-md transition-transform border-2',
                  isReached
                    ? 'bg-amber-400 border-white text-slate-900 scale-110 shadow-amber-300/50'
                    : 'bg-white/80 border-slate-300 text-slate-400'
                )}
              >
                {isReached ? <CheckCircle2 className="w-4 h-4 text-slate-900" /> : <MapPin className="w-3.5 h-3.5" />}
              </div>
              <span className="text-[9px] font-bold text-slate-800 bg-white/90 px-1.5 py-0.5 rounded-full shadow-xs mt-1 whitespace-nowrap">
                {cp.label} ({cp.percent}%)
              </span>
            </div>
          )
        })}

        {/* Member Mascots Traveling Along Path */}
        {members.map((member, index) => {
          // Stagger mascots slightly along group progress line
          const offsetPct = Math.max(0, progressPercent - (index * 3))
          const coords = getCoordinates(offsetPct)
          const isSelected = selectedMember?.id === member.id

          return (
            <motion.div
              key={member.id}
              initial={{ scale: 0 }}
              animate={{ left: `${coords.x}%`, top: `${coords.y - 18}px`, scale: 1 }}
              transition={{ type: 'spring', stiffness: 80, damping: 15 }}
              onClick={() => setSelectedMember(isSelected ? null : member)}
              className="absolute z-30 -translate-x-1/2 -translate-y-1/2 cursor-pointer group"
            >
              {/* Floating Name Badge */}
              <div className="absolute -top-7 left-1/2 -translate-x-1/2 opacity-90 group-hover:opacity-100 transition-opacity">
                <span className="text-[10px] font-extrabold bg-slate-900/80 text-white px-2 py-0.5 rounded-full shadow-md whitespace-nowrap flex items-center gap-1">
                  {member.name}
                  {member.role === 'owner' && '⭐'}
                </span>
              </div>

              {/* Vector Animal Mascot */}
              <div className="relative">
                <GroupMascotSVG
                  animal={member.mascot}
                  outfit={member.outfit}
                  size="md"
                  animated
                  className={cn(isSelected && 'ring-4 ring-amber-400 rounded-full shadow-lg scale-125')}
                />
                {/* Walking dust effect */}
                <motion.div
                  animate={{ opacity: [0.2, 0.8, 0.2], scale: [0.8, 1.2, 0.8] }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                  className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-6 h-2 bg-amber-200/50 rounded-full blur-xs pointer-events-none"
                />
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Selected Member Detail Dialog Overlay */}
      <AnimatePresence>
        {selectedMember && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="relative z-40 mt-4 bg-white/90 backdrop-blur-md rounded-2xl p-4 border border-white/60 shadow-lg flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <GroupMascotSVG animal={selectedMember.mascot} outfit={selectedMember.outfit} size="sm" />
              <div>
                <h5 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                  {selectedMember.name}
                  <span className="text-xs font-semibold text-sky-600 bg-sky-100 px-2 py-0.5 rounded-full capitalize">
                    {selectedMember.mascot} • {selectedMember.outfit}
                  </span>
                </h5>
                <p className="text-xs text-slate-600 mt-0.5">
                  Total Contributed:{' '}
                  <span className="font-bold text-slate-900">
                    {formatCurrency(selectedMember.totalContributed, currency)}
                  </span>
                </p>
              </div>
            </div>
            <button
              onClick={() => setSelectedMember(null)}
              className="text-xs font-semibold text-slate-500 hover:text-slate-800 bg-slate-100 px-3 py-1.5 rounded-lg"
            >
              Close
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default JourneyTrack
