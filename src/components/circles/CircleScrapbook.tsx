import { motion } from 'framer-motion'
import { Sparkles, Calendar, Users, Heart, Camera } from 'lucide-react'
import type { MochiCircle } from '@/types'
import GroupMascotSVG from '@/components/ui/GroupMascotSVG'
import { formatCurrency } from '@/lib/utils'

interface CircleScrapbookProps {
  circles: MochiCircle[]
}

export function CircleScrapbook({ circles }: CircleScrapbookProps) {
  const completedCircles = circles.filter((c) => c.status === 'completed' || c.currentAmount >= c.targetAmount)

  if (completedCircles.length === 0) {
    return (
      <div className="mochi-card text-center py-12 px-4">
        <Camera className="w-10 h-10 text-mochi-primary/40 mx-auto mb-3" />
        <h4 className="text-base font-bold text-mochi-text">No Completed Scrapbooks Yet</h4>
        <p className="text-xs text-mochi-text-secondary max-w-sm mx-auto mt-1">
          When a Circle reaches 100% of its goal, it automatically transforms into a memory scrapbook for everyone to cherish!
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-mochi-text flex items-center gap-2">
          <Camera className="w-5 h-5 text-mochi-primary" />
          Mochi Memories & Scrapbooks
        </h3>
        <span className="text-xs font-semibold text-mochi-text-secondary bg-mochi-surface px-2.5 py-1 rounded-full border border-mochi-border">
          {completedCircles.length} Memory Books
        </span>
      </div>

      <div className="grid gap-6">
        {completedCircles.map((circle) => (
          <motion.div
            key={circle.id}
            whileHover={{ y: -2 }}
            className="mochi-card bg-gradient-to-br from-amber-500/5 via-sky-500/5 to-purple-500/5 p-6 rounded-3xl border border-mochi-primary/20 shadow-md relative overflow-hidden"
          >
            {/* Scrapbook Tape Accent */}
            <div className="absolute top-2 left-6 w-16 h-4 bg-amber-200/60 rotate-[-4deg] rounded-sm shadow-xs" />
            <div className="absolute top-2 right-6 w-16 h-4 bg-amber-200/60 rotate-[4deg] rounded-sm shadow-xs" />

            <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pt-2">
              <div>
                <span className="text-xs font-extrabold uppercase tracking-wider text-mochi-primary bg-mochi-primary/10 px-2.5 py-0.5 rounded-full">
                  {circle.theme} Voyage
                </span>
                <h4 className="text-xl font-black text-mochi-text mt-1">{circle.name}</h4>
                <p className="text-xs text-mochi-text-secondary flex items-center gap-2 mt-1">
                  <Calendar className="w-3.5 h-3.5" /> Completed on {circle.completedAt || circle.targetDate}
                </p>
              </div>

              <div className="text-right">
                <span className="text-xs text-mochi-text-secondary font-medium block">Total Group Saved</span>
                <span className="text-lg font-extrabold text-mochi-success">
                  {formatCurrency(circle.currentAmount, circle.currency)}
                </span>
              </div>
            </div>

            {/* Group Photo Illustration */}
            <div className="bg-white/80 dark:bg-slate-900/80 rounded-2xl p-4 border border-mochi-border my-4 text-center">
              <p className="text-xs font-bold text-mochi-text-secondary uppercase tracking-wider mb-3 flex items-center justify-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                Group Photo Memory
              </p>
              <div className="flex items-center justify-center -space-x-3 py-2 overflow-x-auto scrollbar-hide">
                {circle.members.map((m) => (
                  <div key={m.id} className="relative group">
                    <div className="w-14 h-14 rounded-full bg-mochi-surface border-2 border-amber-400 p-1 shadow-md">
                      <GroupMascotSVG animal={m.mascot} outfit={m.outfit} size="sm" />
                    </div>
                    <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 text-[9px] font-bold bg-slate-900 text-white px-1.5 py-0.2 rounded-full whitespace-nowrap">
                      {m.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Memory Highlights */}
            <div className="grid sm:grid-cols-2 gap-3 mt-4">
              <div className="bg-mochi-surface/60 rounded-xl p-3 border border-mochi-border/50">
                <h5 className="text-xs font-bold text-mochi-text mb-1 flex items-center gap-1">
                  <Users className="w-3.5 h-3.5 text-mochi-primary" /> Members & Contributions
                </h5>
                <ul className="text-xs space-y-1 text-mochi-text-secondary">
                  {circle.members.map((m) => (
                    <li key={m.id} className="flex justify-between">
                      <span>{m.name} ({m.mascot})</span>
                      <span className="font-semibold text-mochi-text">
                        {formatCurrency(m.totalContributed, circle.currency)}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-mochi-surface/60 rounded-xl p-3 border border-mochi-border/50">
                <h5 className="text-xs font-bold text-mochi-text mb-1 flex items-center gap-1">
                  <Heart className="w-3.5 h-3.5 text-rose-500" /> Wishlist Items Unlocked
                </h5>
                <ul className="text-xs space-y-1 text-mochi-text-secondary">
                  {circle.wishlist.map((item) => (
                    <li key={item.id} className="flex items-center gap-1.5">
                      <span className="text-emerald-500 font-bold">✓</span>
                      <span className="line-through">{item.title}</span>
                    </li>
                  ))}
                  {circle.wishlist.length === 0 && <li>All bucket list items achieved!</li>}
                </ul>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

export default CircleScrapbook
