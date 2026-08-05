import { cn } from '../../lib/utils'

interface ProgressRingProps {
  progress: number
  size?: number
  strokeWidth?: number
  color?: string
  bgColor?: string
  showText?: boolean
  className?: string
}

export function ProgressRing({ progress, size = 80, strokeWidth = 6, color = 'var(--color-primary)', bgColor = 'var(--color-border)', showText = true, className }: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (Math.min(100, Math.max(0, progress)) / 100) * circumference

  return (
    <div className={cn('relative inline-flex items-center justify-center', className)} style={{ width: size, height: size }}>
      <svg width={size} height={size} className="mochi-progress-ring">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={bgColor} strokeWidth={strokeWidth} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="mochi-progress-ring__circle"
        />
      </svg>
      {showText && (
        <span className="absolute text-sm font-semibold" style={{ color }}>
          {Math.round(progress)}%
        </span>
      )}
    </div>
  )
}

export default ProgressRing

