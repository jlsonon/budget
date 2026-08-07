import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { KeyboardEvent, ReactNode } from 'react'

interface InteractiveCardProps {
  children: ReactNode
  onClick?: () => void
  className?: string
  disabled?: boolean
  role?: string
  ariaLabel?: string
  animate?: boolean
}

/**
 * Accessible interactive card component.
 * Wraps motion.div with proper ARIA role, keyboard support,
 * and focus ring for accessibility compliance.
 */
export function InteractiveCard({
  children,
  onClick,
  className,
  disabled = false,
  role = 'button',
  ariaLabel,
  animate = true,
}: InteractiveCardProps) {
  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (disabled) return
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      onClick?.()
    }
  }

  if (!onClick) {
    // Non-interactive card — just a styled container
    return (
      <motion.div
        initial={animate ? { opacity: 0, y: 8 } : undefined}
        animate={animate ? { opacity: 1, y: 0 } : undefined}
        className={cn('mochi-card', className)}
      >
        {children}
      </motion.div>
    )
  }

  return (
    <motion.div
      role={role}
      tabIndex={disabled ? -1 : 0}
      aria-label={ariaLabel}
      aria-disabled={disabled}
      onClick={disabled ? undefined : onClick}
      onKeyDown={handleKeyDown}
      whileHover={disabled ? undefined : { scale: 1.01, y: -1 }}
      whileTap={disabled ? undefined : { scale: 0.98 }}
      className={cn(
        'mochi-card cursor-pointer',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mochi-primary focus-visible:ring-offset-2',
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
    >
      {children}
    </motion.div>
  )
}

export default InteractiveCard
