import type { MascotAnimal, MascotOutfit } from '@/types'
import { cn } from '@/lib/utils'

interface GroupMascotSVGProps {
  animal?: MascotAnimal
  outfit?: MascotOutfit
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  className?: string
  animated?: boolean
}

const sizeClasses = {
  xs: 'w-7 h-7',
  sm: 'w-10 h-10',
  md: 'w-14 h-14',
  lg: 'w-20 h-20',
  xl: 'w-28 h-28',
}

export function GroupMascotSVG({
  animal = 'cat',
  outfit = 'casual',
  size = 'md',
  className,
  animated = true,
}: GroupMascotSVGProps) {
  // Base colors per animal species
  const animalColors: Record<MascotAnimal, { body: string; innerEar: string; snout: string; accent: string }> = {
    cat: { body: '#FFDFDF', innerEar: '#FFB2B2', snout: '#FFF0F0', accent: '#FF758F' },
    fox: { body: '#FF9E4A', innerEar: '#FFC899', snout: '#FFFFFF', accent: '#D95D00' },
    bear: { body: '#A06A42', innerEar: '#DDB697', snout: '#F2D4C2', accent: '#6B4226' },
    rabbit: { body: '#F3F4F6', innerEar: '#FFB8D2', snout: '#FFFFFF', accent: '#EC4899' },
    panda: { body: '#F9FAFB', innerEar: '#374151', snout: '#E5E7EB', accent: '#111827' },
    otter: { body: '#9CA3AF', innerEar: '#E5E7EB', snout: '#F3F4F6', accent: '#4B5563' },
    hamster: { body: '#FBBF24', innerEar: '#FDE68A', snout: '#FFFBEB', accent: '#D97706' },
    red_panda: { body: '#EA580C', innerEar: '#FED7AA', snout: '#FFF7ED', accent: '#9A3412' },
    capybara: { body: '#B45309', innerEar: '#FDE68A', snout: '#FEF3C7', accent: '#78350F' },
    shiba: { body: '#F59E0B', innerEar: '#FDE68A', snout: '#FFFFFF', accent: '#B45309' },
    penguin: { body: '#1E293B', innerEar: '#38BDF8', snout: '#F59E0B', accent: '#0284C7' },
    duck: { body: '#FACC15', innerEar: '#FEF08A', snout: '#F97316', accent: '#EAB308' },
  }

  const color = animalColors[animal] || animalColors.cat

  return (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn(
        sizeClasses[size],
        animated && 'transition-transform duration-300 hover:scale-110 active:scale-95',
        className
      )}
    >
      <g>
        {/* Shadow */}
        <ellipse cx="50" cy="90" rx="32" ry="6" fill="black" fillOpacity="0.12" />

        {/* Ears */}
        {animal === 'rabbit' ? (
          <>
            {/* Long rabbit ears */}
            <path d="M35 32 C30 5, 20 5, 30 35 Z" fill={color.body} />
            <path d="M34 30 C30 10, 24 10, 31 32 Z" fill={color.innerEar} />
            <path d="M65 32 C70 5, 80 5, 70 35 Z" fill={color.body} />
            <path d="M66 30 C70 10, 76 10, 69 32 Z" fill={color.innerEar} />
          </>
        ) : animal === 'bear' || animal === 'panda' ? (
          <>
            {/* Round ears */}
            <circle cx="28" cy="26" r="14" fill={color.accent} />
            <circle cx="28" cy="26" r="8" fill={color.innerEar} />
            <circle cx="72" cy="26" r="14" fill={color.accent} />
            <circle cx="72" cy="26" r="8" fill={color.innerEar} />
          </>
        ) : (
          <>
            {/* Pointy ears (cat, fox, shiba) */}
            <path d="M22 38 L34 18 L46 36 Z" fill={color.body} />
            <path d="M26 36 L34 22 L42 35 Z" fill={color.innerEar} />
            <path d="M78 38 L66 18 L54 36 Z" fill={color.body} />
            <path d="M74 36 L66 22 L58 35 Z" fill={color.innerEar} />
          </>
        )}

        {/* Main Body / Head */}
        <circle cx="50" cy="55" r="34" fill={color.body} />

        {/* Panda eye patches */}
        {animal === 'panda' && (
          <>
            <ellipse cx="38" cy="52" rx="10" ry="12" fill="#111827" transform="rotate(-15 38 52)" />
            <ellipse cx="62" cy="52" rx="10" ry="12" fill="#111827" transform="rotate(15 62 52)" />
          </>
        )}

        {/* Snout / Face patch */}
        <ellipse cx="50" cy="64" rx="18" ry="13" fill={color.snout} />

        {/* Rosy Cheeks */}
        <circle cx="28" cy="62" r="6" fill="#FF758F" fillOpacity="0.4" />
        <circle cx="72" cy="62" r="6" fill="#FF758F" fillOpacity="0.4" />

        {/* Eyes */}
        <circle cx="38" cy="52" r="4.5" fill="#1E293B" />
        <circle cx="39.5" cy="50.5" r="1.5" fill="white" />
        <circle cx="62" cy="52" r="4.5" fill="#1E293B" />
        <circle cx="63.5" cy="50.5" r="1.5" fill="white" />

        {/* Nose & Mouth */}
        {animal === 'duck' || animal === 'penguin' ? (
          /* Beak */
          <ellipse cx="50" cy="62" rx="8" ry="5" fill="#F97316" />
        ) : (
          <>
            <polygon points="50,58 46,55 54,55" fill="#475569" />
            <path d="M50 58 C46 64, 42 63, 44 60" stroke="#475569" strokeWidth="2" strokeLinecap="round" />
            <path d="M50 58 C54 64, 58 63, 56 60" stroke="#475569" strokeWidth="2" strokeLinecap="round" />
          </>
        )}

        {/* Outfits */}
        {outfit === 'beach' && (
          <g>
            {/* Straw Hat / Sunglasses */}
            <path d="M20 32 Q50 20 80 32 Q50 38 20 32 Z" fill="#FDE047" stroke="#D97706" strokeWidth="2" />
            <path d="M34 27 C42 16, 58 16, 66 27 Z" fill="#FACC15" />
            {/* Red band */}
            <path d="M30 30 Q50 25 70 30" stroke="#EF4444" strokeWidth="3" />
          </g>
        )}

        {/* Winter Outfit */}
        {outfit === 'winter' && (
          <g>
            {/* Winter Beanie */}
            <path d="M26 36 Q50 12 74 36 Z" fill="#3B82F6" />
            <rect x="22" y="32" width="56" height="8" rx="4" fill="#60A5FA" />
            <circle cx="50" cy="14" r="8" fill="#F3F4F6" />
          </g>
        )}

        {/* Raincoat */}
        {outfit === 'raincoat' && (
          <g>
            {/* Yellow Hood */}
            <path d="M22 36 Q50 14 78 36 Z" fill="#FACC15" />
            <path d="M20 74 C25 88, 75 88, 80 74 L80 82 C75 92, 25 92, 20 82 Z" fill="#EAB308" />
          </g>
        )}
      </g>
    </svg>
  )
}

export default GroupMascotSVG
