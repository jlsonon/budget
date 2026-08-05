import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

export type MascotMood = 'happy' | 'excited' | 'neutral' | 'sad' | 'celebrating' | 'sleeping' | 'working'

interface MascotSVGProps {
  mood?: MascotMood
  size?: 'sm' | 'md' | 'lg' | 'xl'
  animate?: boolean
  className?: string
}

const sizeMap = {
  sm: { width: 36, height: 36 },
  md: { width: 64, height: 64 },
  lg: { width: 96, height: 96 },
  xl: { width: 140, height: 140 },
}

export function MascotSVG({ mood = 'happy', size = 'md', animate = true, className }: MascotSVGProps) {
  const dims = sizeMap[size]

  return (
    <motion.div
      className={cn('inline-flex items-center justify-center select-none relative', className)}
      style={{ width: dims.width, height: dims.height }}
      animate={
        animate
          ? {
              y: mood === 'sleeping' ? [0, 2, 0] : [0, -6, 0],
              rotate: mood === 'celebrating' ? [0, -6, 6, -6, 6, 0] : mood === 'excited' ? [0, -3, 3, 0] : 0,
              scale: mood === 'excited' || mood === 'celebrating' ? [1, 1.06, 1] : 1,
            }
          : {}
      }
      transition={
        animate
          ? {
              y: { duration: mood === 'sleeping' ? 3 : 2.5, repeat: Infinity, ease: 'easeInOut' },
              rotate: { duration: 0.8, ease: 'easeInOut' },
              scale: { duration: 0.6, ease: 'easeInOut' },
            }
          : {}
      }
      role="img"
      aria-label={`Mochi Cat character feeling ${mood}`}
    >
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-md"
      >
        {/* Soft Shadow Base */}
        <ellipse cx="50" cy="88" rx="34" ry="7" fill="rgba(0,0,0,0.08)" />

        {/* Tail */}
        <motion.path
          d="M 74 72 C 84 70 88 56 82 48 C 78 43 73 48 76 54 C 78 58 75 66 68 67"
          stroke="var(--color-primary, #F9A8D4)"
          strokeWidth="6"
          strokeLinecap="round"
          fill="none"
          animate={animate ? { rotate: [0, 8, -5, 0] } : {}}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          style={{ transformOrigin: '70px 70px' }}
        />

        {/* Ears */}
        {/* Left Ear */}
        <path
          d="M 24 38 L 16 18 C 15 15 19 14 22 17 L 36 30 Z"
          fill="var(--color-primary, #F9A8D4)"
          stroke="#475569"
          strokeWidth="3.5"
          strokeLinejoin="round"
        />
        <path d="M 22 34 L 18 21 L 30 30 Z" fill="#F472B6" />

        {/* Right Ear */}
        <path
          d="M 76 38 L 84 18 C 85 15 81 14 78 17 L 64 30 Z"
          fill="var(--color-primary, #F9A8D4)"
          stroke="#475569"
          strokeWidth="3.5"
          strokeLinejoin="round"
        />
        <path d="M 78 34 L 82 21 L 70 30 Z" fill="#F472B6" />

        {/* Body / Head - Soft Round Mochi Shape */}
        <rect
          x="16"
          y="26"
          width="68"
          height="58"
          rx="29"
          fill="var(--color-surface-elevated, #FFFFFF)"
          stroke="#475569"
          strokeWidth="4"
        />
        {/* Inner Blush Fill Overlay */}
        <rect
          x="18"
          y="28"
          width="64"
          height="54"
          rx="27"
          fill="var(--color-surface, #FFFFFF)"
        />

        {/* Rosy Cheeks */}
        <circle cx="28" cy="56" r="6" fill="#FCA5A5" opacity="0.6" />
        <circle cx="72" cy="56" r="6" fill="#FCA5A5" opacity="0.6" />

        {/* Eyes based on Mood */}
        {mood === 'happy' && (
          <>
            <path d="M 33 46 Q 38 40 43 46" stroke="#334155" strokeWidth="3.5" strokeLinecap="round" fill="none" />
            <path d="M 57 46 Q 62 40 67 46" stroke="#334155" strokeWidth="3.5" strokeLinecap="round" fill="none" />
          </>
        )}

        {mood === 'excited' && (
          <>
            <path d="M 32 44 Q 38 36 44 44 M 32 44 Q 38 52 44 44" stroke="#334155" strokeWidth="3.5" strokeLinecap="round" fill="none" />
            <path d="M 56 44 Q 62 36 68 44 M 56 44 Q 62 52 68 44" stroke="#334155" strokeWidth="3.5" strokeLinecap="round" fill="none" />
            {/* Sparkles around eyes */}
            <path d="M 25 36 L 27 38 M 27 36 L 25 38" stroke="#FBBF24" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M 73 36 L 75 38 M 75 36 L 73 38" stroke="#FBBF24" strokeWidth="2.5" strokeLinecap="round" />
          </>
        )}

        {mood === 'celebrating' && (
          <>
            <path d="M 33 48 Q 38 41 43 48" stroke="#334155" strokeWidth="3.5" strokeLinecap="round" fill="none" />
            <path d="M 57 48 Q 62 41 67 48" stroke="#334155" strokeWidth="3.5" strokeLinecap="round" fill="none" />
            {/* Party Hat */}
            <path d="M 42 26 L 50 8 L 58 26 Z" fill="#F472B6" stroke="#334155" strokeWidth="2.5" strokeLinejoin="round" />
            <circle cx="50" cy="7" r="3" fill="#FBBF24" />
          </>
        )}

        {mood === 'neutral' && (
          <>
            <circle cx="37" cy="46" r="3.5" fill="#334155" />
            <circle cx="63" cy="46" r="3.5" fill="#334155" />
          </>
        )}

        {mood === 'sad' && (
          <>
            <path d="M 33 46 Q 38 52 43 46" stroke="#334155" strokeWidth="3.5" strokeLinecap="round" fill="none" />
            <path d="M 57 46 Q 62 52 67 46" stroke="#334155" strokeWidth="3.5" strokeLinecap="round" fill="none" />
            <path d="M 28 50 Q 26 56 28 60" stroke="#60A5FA" strokeWidth="2.5" strokeLinecap="round" fill="none" />
          </>
        )}

        {mood === 'sleeping' && (
          <>
            <path d="M 33 48 Q 38 52 43 48" stroke="#334155" strokeWidth="3" strokeLinecap="round" fill="none" />
            <path d="M 57 48 Q 62 52 67 48" stroke="#334155" strokeWidth="3" strokeLinecap="round" fill="none" />
            {/* Floating Zzz */}
            <motion.text
              x="72"
              y="30"
              fill="#818CF8"
              fontSize="14"
              fontWeight="bold"
              animate={animate ? { opacity: [0.2, 1, 0.2], y: [30, 20, 30] } : {}}
              transition={{ duration: 2.5, repeat: Infinity }}
            >
              z
            </motion.text>
          </>
        )}

        {mood === 'working' && (
          <>
            <circle cx="37" cy="46" r="3.5" fill="#334155" />
            <circle cx="63" cy="46" r="3.5" fill="#334155" />
            {/* Cute Glasses */}
            <circle cx="37" cy="46" r="7" stroke="#334155" strokeWidth="2" fill="none" />
            <circle cx="63" cy="46" r="7" stroke="#334155" strokeWidth="2" fill="none" />
            <line x1="44" y1="46" x2="56" y2="46" stroke="#334155" strokeWidth="2" />
          </>
        )}

        {/* Cute Snout & Whiskers */}
        <path d="M 47 51 L 50 54 L 53 51" stroke="#334155" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        <line x1="18" y1="48" x2="8" y2="46" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" />
        <line x1="18" y1="53" x2="8" y2="55" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" />
        <line x1="82" y1="48" x2="92" y2="46" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" />
        <line x1="82" y1="53" x2="92" y2="55" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" />

        {/* Paws */}
        <ellipse cx="38" cy="78" rx="7" ry="5" fill="var(--color-surface, #FFFFFF)" stroke="#475569" strokeWidth="2.5" />
        <ellipse cx="62" cy="78" rx="7" ry="5" fill="var(--color-surface, #FFFFFF)" stroke="#475569" strokeWidth="2.5" />
      </svg>
    </motion.div>
  )
}

export default MascotSVG
