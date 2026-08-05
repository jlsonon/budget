import MascotSVG, { type MascotMood } from './MascotSVG'

interface MascotProps {
  mood?: 'happy' | 'excited' | 'neutral' | 'sad' | 'celebrating' | 'sleeping' | 'working'
  size?: 'sm' | 'md' | 'lg' | 'xl'
  animate?: boolean
  className?: string
}

export function Mascot({ mood = 'happy', size = 'md', animate = true, className }: MascotProps) {
  return (
    <MascotSVG
      mood={mood as MascotMood}
      size={size}
      animate={animate}
      className={className}
    />
  )
}

export default Mascot
