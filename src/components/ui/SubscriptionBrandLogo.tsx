import { cn } from '@/lib/utils'

interface SubscriptionBrandLogoProps {
  name: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const sizePx = {
  sm: 28,
  md: 40,
  lg: 52,
}

export function SubscriptionBrandLogo({ name, size = 'md', className }: SubscriptionBrandLogoProps) {
  const dimension = sizePx[size] || 40
  const lower = (name || '').toLowerCase()

  if (lower.includes('netflix')) {
    return (
      <svg width={dimension} height={dimension} viewBox="0 0 48 48" fill="none" className={cn('shrink-0 rounded-2xl drop-shadow-xs', className)}>
        <rect width="48" height="48" rx="14" fill="#141414" />
        <path d="M15 10H20V38H15V10Z" fill="#E50914" />
        <path d="M28 10H33V38H28V10Z" fill="#E50914" />
        <path d="M15 10L33 38H28L15 10Z" fill="#B81D24" />
      </svg>
    )
  }

  if (lower.includes('spotify')) {
    return (
      <svg width={dimension} height={dimension} viewBox="0 0 48 48" fill="none" className={cn('shrink-0 rounded-2xl drop-shadow-xs', className)}>
        <rect width="48" height="48" rx="14" fill="#1DB954" />
        <path d="M34 22C27 18 17 17.5 12 19" stroke="#121212" strokeWidth="3.5" strokeLinecap="round" />
        <path d="M32 28C26.5 24.5 18 24 13.5 25.5" stroke="#121212" strokeWidth="3" strokeLinecap="round" />
        <path d="M30 33.5C25.5 31 18.5 30.5 14.5 32" stroke="#121212" strokeWidth="2.5" strokeLinecap="round" />
      </svg>
    )
  }

  if (lower.includes('chatgpt') || lower.includes('openai')) {
    return (
      <svg width={dimension} height={dimension} viewBox="0 0 48 48" fill="none" className={cn('shrink-0 rounded-2xl drop-shadow-xs', className)}>
        <rect width="48" height="48" rx="14" fill="#10A37F" />
        <circle cx="24" cy="24" r="10" stroke="white" strokeWidth="3" fill="none" />
        <path d="M24 14V24L31 28" stroke="white" strokeWidth="3" strokeLinecap="round" />
      </svg>
    )
  }

  if (lower.includes('apple') || lower.includes('icloud')) {
    return (
      <svg width={dimension} height={dimension} viewBox="0 0 48 48" fill="none" className={cn('shrink-0 rounded-2xl drop-shadow-xs', className)}>
        <rect width="48" height="48" rx="14" fill="#000000" />
        <path d="M26.5 13C25.5 14.2 24 15 22.5 15C22.3 13.7 23 12.3 24 11.2C25 10 26.5 9.2 27.8 9C28 10.3 27.5 11.7 26.5 13Z" fill="white" />
        <path d="M32.5 27.5C32.6 24 35.5 22.3 35.6 22.2C34 19.8 31.4 19.5 30.5 19.4C28.2 19.1 26 20.7 24.8 20.7C23.6 20.7 21.8 19.3 19.8 19.4C17.3 19.4 15 20.8 13.8 23C11.3 27.4 13.2 33.8 15.6 37.2C16.8 38.9 18.1 40.7 20 40.6C21.8 40.5 22.5 39.4 24.7 39.4C26.9 39.4 27.6 40.6 29.4 40.6C31.3 40.6 32.5 39 33.7 37.2C35 35.2 35.6 33.3 35.7 33.2C35.5 33.1 32.4 31.9 32.5 27.5Z" fill="white" />
      </svg>
    )
  }

  if (lower.includes('youtube')) {
    return (
      <svg width={dimension} height={dimension} viewBox="0 0 48 48" fill="none" className={cn('shrink-0 rounded-2xl drop-shadow-xs', className)}>
        <rect width="48" height="48" rx="14" fill="#FF0000" />
        <path d="M33 17C35 17.5 35.5 19 35.5 24C35.5 29 35 30.5 33 31C30 31.5 18 31.5 15 31C13 30.5 12.5 29 12.5 24C12.5 19 13 17.5 15 17C18 16.5 30 16.5 33 17Z" fill="#CC0000" />
        <path d="M21 19.5L29 24L21 28.5V19.5Z" fill="white" />
      </svg>
    )
  }

  if (lower.includes('disney')) {
    return (
      <svg width={dimension} height={dimension} viewBox="0 0 48 48" fill="none" className={cn('shrink-0 rounded-2xl drop-shadow-xs', className)}>
        <rect width="48" height="48" rx="14" fill="#113CCF" />
        <path d="M24 12L26.5 19L34 19.5L28.2 24.2L30.5 31.5L24 27L17.5 31.5L19.8 24.2L14 19.5L21.5 19L24 12Z" fill="#FFF" />
      </svg>
    )
  }

  if (lower.includes('amazon') || lower.includes('prime')) {
    return (
      <svg width={dimension} height={dimension} viewBox="0 0 48 48" fill="none" className={cn('shrink-0 rounded-2xl drop-shadow-xs', className)}>
        <rect width="48" height="48" rx="14" fill="#00A8E1" />
        <path d="M14 30C20 34 28 34 34 30" stroke="#FF9900" strokeWidth="3" strokeLinecap="round" />
        <path d="M31 28L35 30L33 34" stroke="#FF9900" strokeWidth="2.5" strokeLinecap="round" />
      </svg>
    )
  }

  if (lower.includes('discord')) {
    return (
      <svg width={dimension} height={dimension} viewBox="0 0 48 48" fill="none" className={cn('shrink-0 rounded-2xl drop-shadow-xs', className)}>
        <rect width="48" height="48" rx="14" fill="#5865F2" />
        <path d="M16 18C19 16.5 29 16.5 32 18M14 22C14 28 17 32 24 32C31 32 34 28 34 22" stroke="white" strokeWidth="3" strokeLinecap="round" />
        <circle cx="19" cy="24" r="2" fill="white" />
        <circle cx="29" cy="24" r="2" fill="white" />
      </svg>
    )
  }

  if (lower.includes('figma')) {
    return (
      <svg width={dimension} height={dimension} viewBox="0 0 48 48" fill="none" className={cn('shrink-0 rounded-2xl drop-shadow-xs', className)}>
        <rect width="48" height="48" rx="14" fill="#1E1E1E" />
        <circle cx="19" cy="16" r="5" fill="#F24E1E" />
        <circle cx="29" cy="16" r="5" fill="#FF7262" />
        <circle cx="19" cy="24" r="5" fill="#A259FF" />
        <circle cx="29" cy="24" r="5" fill="#1ABCFE" />
        <circle cx="19" cy="32" r="5" fill="#0ACF83" />
      </svg>
    )
  }

  if (lower.includes('github')) {
    return (
      <svg width={dimension} height={dimension} viewBox="0 0 48 48" fill="none" className={cn('shrink-0 rounded-2xl drop-shadow-xs', className)}>
        <rect width="48" height="48" rx="14" fill="#24292E" />
        <path d="M24 12C17.4 12 12 17.4 12 24C12 29.3 15.4 33.8 20.2 35.4C20.8 35.5 21 35.1 21 34.8V32.6C17.7 33.3 17 31 17 31C16.5 29.6 15.7 29.2 15.7 29.2C14.6 28.5 15.8 28.5 15.8 28.5C17 28.6 17.6 29.8 17.6 29.8C18.7 31.6 20.4 31.1 21.1 30.8C21.2 30 21.5 29.4 21.9 29C19.2 28.7 16.4 27.6 16.4 22.9C16.4 21.6 16.9 20.5 17.7 19.6C17.5 19.3 17.1 18 17.8 16.3C17.8 16.3 18.8 16 21 17.5C21.9 17.2 23 17.1 24 17.1C25 17.1 26.1 17.2 27 17.5C29.2 16 30.2 16.3 30.2 16.3C30.9 18 30.5 19.3 30.3 19.6C31.1 20.5 31.6 21.6 31.6 22.9C31.6 27.6 28.8 28.7 26.1 29C26.6 29.4 27 30.3 27 31.6V34.8C27 35.1 27.2 35.5 27.8 35.4C32.6 33.8 36 29.3 36 24C36 17.4 30.6 12 24 12Z" fill="white" />
      </svg>
    )
  }

  // Fallback generic pastel brand badge with clean initials
  const initials = name ? name.substring(0, 2).toUpperCase() : 'SUB'
  return (
    <div
      style={{ width: dimension, height: dimension }}
      className={cn(
        'shrink-0 rounded-2xl bg-gradient-to-br from-sky-400 via-mochi-primary to-purple-500 text-white font-black flex items-center justify-center text-xs shadow-xs tracking-wider',
        className
      )}
    >
      {initials}
    </div>
  )
}
