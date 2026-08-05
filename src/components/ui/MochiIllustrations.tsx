import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

export type IllustrationType =
  | 'empty_wallet'
  | 'empty_transactions'
  | 'empty_budget'
  | 'empty_savings'
  | 'empty_debts'
  | 'empty_subscriptions'
  | 'empty_notifications'
  | 'goal_completed'
  | 'debt_paid'
  | 'savings_growing'
  | 'bills_organized'
  | 'vacation_goal'

interface IllustrationProps {
  type: IllustrationType
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

const sizeMap = {
  sm: { width: 120, height: 100 },
  md: { width: 180, height: 150 },
  lg: { width: 240, height: 200 },
}

export function MochiIllustration({ type, className, size = 'md' }: IllustrationProps) {
  const dims = sizeMap[size]

  return (
    <motion.div
      className={cn('inline-flex flex-col items-center justify-center select-none relative', className)}
      style={{ width: dims.width, height: dims.height }}
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.5, type: 'spring' }}
    >
      <svg
        viewBox="0 0 200 160"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-sm"
      >
        {/* Soft Background Cloud Aura */}
        <ellipse cx="100" cy="140" rx="75" ry="14" fill="rgba(0,0,0,0.06)" />
        <path
          d="M 40 120 C 25 120 15 105 25 90 C 15 75 35 55 55 65 C 65 45 95 45 105 60 C 120 45 150 55 155 75 C 175 75 185 95 170 115 C 180 130 155 140 140 130 Z"
          fill="var(--color-primary-hover, #F472B6)"
          opacity="0.08"
        />

        {/* 1. Empty Wallet Illustration */}
        {type === 'empty_wallet' && (
          <g>
            {/* Open Cozy Wallet */}
            <rect x="50" y="65" width="100" height="65" rx="16" fill="var(--color-surface, #FFFFFF)" stroke="#475569" strokeWidth="4" />
            <path d="M 50 80 H 150 M 130 80 V 110 H 150 V 80" fill="none" stroke="#475569" strokeWidth="3" />
            <circle cx="140" cy="95" r="4" fill="#F59E0B" />

            {/* Mochi Cat Sleeping On Side */}
            <circle cx="85" cy="55" r="22" fill="var(--color-surface-elevated, #FFFFFF)" stroke="#475569" strokeWidth="3.5" />
            <path d="M 77 56 Q 81 60 85 56" stroke="#334155" strokeWidth="2.5" strokeLinecap="round" fill="none" />
            <path d="M 89 56 Q 93 60 97 56" stroke="#334155" strokeWidth="2.5" strokeLinecap="round" fill="none" />
            <path d="M 70 38 L 65 24 L 78 35 Z" fill="var(--color-primary, #F9A8D4)" stroke="#475569" strokeWidth="2.5" />
            <path d="M 100 38 L 105 24 L 92 35 Z" fill="var(--color-primary, #F9A8D4)" stroke="#475569" strokeWidth="2.5" />

            {/* Sparkle Coin floating */}
            <circle cx="145" cy="45" r="10" fill="#FBBF24" stroke="#475569" strokeWidth="2.5" />
            <text x="141" y="49" fill="#78350F" fontSize="12" fontWeight="bold">₱</text>
          </g>
        )}

        {/* 2. Empty Transactions Illustration */}
        {type === 'empty_transactions' && (
          <g>
            {/* Receipt Pad */}
            <rect x="60" y="35" width="80" height="100" rx="10" fill="var(--color-surface, #FFFFFF)" stroke="#475569" strokeWidth="4" />
            <line x1="75" y1="55" x2="125" y2="55" stroke="#CBD5E1" strokeWidth="3" strokeLinecap="round" />
            <line x1="75" y1="70" x2="115" y2="70" stroke="#CBD5E1" strokeWidth="3" strokeLinecap="round" />
            <line x1="75" y1="85" x2="105" y2="85" stroke="#CBD5E1" strokeWidth="3" strokeLinecap="round" />

            {/* Mochi Peeking */}
            <path d="M 70 120 C 70 95 130 95 130 120 Z" fill="var(--color-surface-elevated, #FFFFFF)" stroke="#475569" strokeWidth="3.5" />
            <circle cx="88" cy="108" r="3" fill="#334155" />
            <circle cx="112" cy="108" r="3" fill="#334155" />
            <path d="M 97 112 Q 100 115 103 112" stroke="#334155" strokeWidth="2" strokeLinecap="round" fill="none" />
          </g>
        )}

        {/* 3. Goal Completed Illustration */}
        {type === 'goal_completed' && (
          <g>
            {/* Trophy */}
            <path d="M 75 40 H 125 V 70 C 125 85 110 95 100 95 C 90 95 75 85 75 70 Z" fill="#FBBF24" stroke="#475569" strokeWidth="4" />
            <rect x="90" y="95" width="20" height="20" fill="#F59E0B" stroke="#475569" strokeWidth="3" />
            <rect x="70" y="115" width="60" height="15" rx="4" fill="#78350F" stroke="#475569" strokeWidth="3" />
            {/* Handles */}
            <path d="M 75 45 C 55 45 55 65 75 65" fill="none" stroke="#FBBF24" strokeWidth="4" strokeLinecap="round" />
            <path d="M 125 45 C 145 45 145 65 125 65" fill="none" stroke="#FBBF24" strokeWidth="4" strokeLinecap="round" />

            {/* Celebrating Mochi Top */}
            <circle cx="100" cy="30" r="16" fill="var(--color-surface, #FFFFFF)" stroke="#475569" strokeWidth="3" />
            <path d="M 94 28 Q 97 24 100 28" stroke="#334155" strokeWidth="2" fill="none" />
            <path d="M 100 28 Q 103 24 106 28" stroke="#334155" strokeWidth="2" fill="none" />
            {/* Star Sparkles */}
            <path d="M 45 30 L 48 35 L 53 35 L 49 39 L 51 44 L 45 41 L 39 44 L 41 39 L 37 35 L 42 35 Z" fill="#FBBF24" />
            <path d="M 155 30 L 158 35 L 163 35 L 159 39 L 161 44 L 155 41 L 149 44 L 151 39 L 147 35 L 152 35 Z" fill="#FBBF24" />
          </g>
        )}

        {/* 4. Debt Paid Illustration */}
        {type === 'debt_paid' && (
          <g>
            {/* Shield with Checkmark */}
            <path d="M 100 35 L 145 50 V 90 C 145 120 100 135 100 135 C 100 135 55 120 55 90 V 50 L 100 35 Z" fill="var(--color-success, #34D399)" stroke="#475569" strokeWidth="4" />
            <path d="M 80 82 L 95 97 L 125 67" fill="none" stroke="#FFFFFF" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />

            {/* Happy Mochi Beside Shield */}
            <circle cx="50" cy="110" r="18" fill="var(--color-surface-elevated, #FFFFFF)" stroke="#475569" strokeWidth="3" />
            <path d="M 44 108 Q 47 104 50 108" stroke="#334155" strokeWidth="2" fill="none" />
            <path d="M 50 108 Q 53 104 56 108" stroke="#334155" strokeWidth="2" fill="none" />
          </g>
        )}

        {/* 5. Savings Growing Illustration */}
        {type === 'savings_growing' && (
          <g>
            {/* Plant Pot */}
            <path d="M 75 95 L 80 130 H 120 L 125 95 Z" fill="#D4A574" stroke="#475569" strokeWidth="3.5" />
            {/* Money Leaves */}
            <path d="M 100 95 C 100 65 65 60 70 85 C 75 95 100 95 100 95 Z" fill="#34D399" stroke="#475569" strokeWidth="3" />
            <path d="M 100 95 C 100 65 135 60 130 85 C 125 95 100 95 100 95 Z" fill="#10B981" stroke="#475569" strokeWidth="3" />
            <path d="M 100 85 C 100 45 100 40 100 40 C 100 40 115 50 100 85 Z" fill="#6EE7B7" stroke="#475569" strokeWidth="3" />

            {/* Coin Flowers */}
            <circle cx="70" cy="65" r="9" fill="#FBBF24" stroke="#475569" strokeWidth="2" />
            <circle cx="130" cy="65" r="9" fill="#FBBF24" stroke="#475569" strokeWidth="2" />
            <circle cx="100" cy="40" r="11" fill="#FBBF24" stroke="#475569" strokeWidth="2" />
          </g>
        )}

        {/* Default / Fallback Mochi Cloud */}
        {!['empty_wallet', 'empty_transactions', 'goal_completed', 'debt_paid', 'savings_growing'].includes(type) && (
          <g>
            <circle cx="100" cy="80" r="40" fill="var(--color-surface, #FFFFFF)" stroke="#475569" strokeWidth="4" />
            {/* Cute face */}
            <path d="M 85 76 Q 90 70 95 76" stroke="#334155" strokeWidth="3" strokeLinecap="round" fill="none" />
            <path d="M 105 76 Q 110 70 115 76" stroke="#334155" strokeWidth="3" strokeLinecap="round" fill="none" />
            <path d="M 97 83 Q 100 87 103 83" stroke="#334155" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            {/* Ears */}
            <path d="M 70 52 L 62 32 C 60 29 65 28 68 31 L 82 44 Z" fill="var(--color-primary, #F9A8D4)" stroke="#475569" strokeWidth="3" />
            <path d="M 130 52 L 138 32 C 140 29 135 28 132 31 L 118 44 Z" fill="var(--color-primary, #F9A8D4)" stroke="#475569" strokeWidth="3" />
          </g>
        )}
      </svg>
    </motion.div>
  )
}

export default MochiIllustration
