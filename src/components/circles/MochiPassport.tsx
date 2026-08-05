import { motion } from 'framer-motion'
import { Award, Compass, Plane, MapPin, Sparkles } from 'lucide-react'
import type { TravelStamp } from '@/types'
import { formatCurrency } from '@/lib/utils'
import MochiIcon from '@/components/ui/MochiIcons'

interface MochiPassportProps {
  stamps: TravelStamp[]
  userName?: string
  currency?: string
}

export function MochiPassport({ stamps, userName = 'Demo User', currency = 'PHP' }: MochiPassportProps) {
  const totalSavedInTrips = stamps.reduce((sum, s) => sum + s.totalSaved, 0)

  return (
    <div className="mochi-card bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white p-6 rounded-3xl border border-amber-400/30 shadow-2xl relative overflow-hidden">
      {/* Decorative Gold Foil Pattern Background */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-amber-400/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header Stamp Badge */}
      <div className="flex items-center justify-between border-b border-amber-400/20 pb-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-300">
            <Compass className="w-6 h-6 animate-spin-slow" />
          </div>
          <div>
            <h3 className="text-lg font-black tracking-wider text-amber-300 uppercase flex items-center gap-2">
              Mochi Travel Passport
              <Sparkles className="w-4 h-4 text-amber-400" />
            </h3>
            <p className="text-xs text-slate-400 font-medium">Official Record of Completed Circle Voyages</p>
          </div>
        </div>

        <div className="text-right hidden sm:block">
          <p className="text-[10px] uppercase tracking-widest text-slate-400 font-semibold">Passport Holder</p>
          <p className="text-sm font-bold text-amber-200">{userName}</p>
        </div>
      </div>

      {/* Passport Stats Header */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
        <div className="bg-white/5 border border-white/10 rounded-2xl p-3 text-center">
          <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold block">Trips Stamped</span>
          <span className="text-xl font-extrabold text-amber-300">{stamps.length}</span>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-2xl p-3 text-center">
          <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold block">Group Saved</span>
          <span className="text-base font-extrabold text-emerald-400">{formatCurrency(totalSavedInTrips, currency)}</span>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-2xl p-3 text-center col-span-2 sm:col-span-1">
          <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold block">Explorer Status</span>
          <span className="text-xs font-bold text-sky-300 flex items-center justify-center gap-1 mt-1">
            <Award className="w-3.5 h-3.5" /> Voyager Level {Math.max(1, stamps.length)}
          </span>
        </div>
      </div>

      {/* Stamp Grid */}
      <div>
        <h4 className="text-xs font-bold text-amber-400/90 uppercase tracking-wider mb-4 flex items-center gap-1.5">
          <Plane className="w-3.5 h-3.5" />
          Passport Stamp Collection
        </h4>

        {stamps.length === 0 ? (
          <div className="text-center py-8 border border-dashed border-amber-400/20 rounded-2xl bg-white/5">
            <MapPin className="w-8 h-8 text-amber-400/40 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-300">No Passport Stamps Yet</p>
            <p className="text-xs text-slate-400 max-w-xs mx-auto mt-1">
              Complete your first Mochi Circle trip goal to earn an official travel stamp!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {stamps.map((stamp) => (
              <motion.div
                key={stamp.id}
                whileHover={{ scale: 1.05, rotate: 2 }}
                className="relative bg-gradient-to-br from-amber-400/10 via-amber-300/5 to-transparent border-2 border-amber-400/40 rounded-2xl p-4 flex flex-col items-center justify-center text-center shadow-lg"
              >
                {/* Stamp Outer Ring */}
                <div className="w-16 h-16 rounded-full border-2 border-dashed border-amber-300/60 flex items-center justify-center mb-2 bg-amber-400/10">
                  <MochiIcon id={stamp.stampIcon} size="md" style="plain" />
                </div>
                <h5 className="text-xs font-black uppercase text-amber-200 tracking-wider line-clamp-1">
                  {stamp.circleName}
                </h5>
                <p className="text-[10px] text-slate-400 mt-0.5">{stamp.completedDate}</p>
                <div className="mt-2 text-[10px] font-bold bg-amber-400/20 text-amber-300 px-2 py-0.5 rounded-full border border-amber-400/30">
                  ✓ VERIFIED STAMP
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default MochiPassport
