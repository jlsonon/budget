import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const CONFETTI_COLORS = [
  'var(--color-primary)',
  'var(--color-secondary)',
  'var(--color-success)',
  'var(--color-warning)',
  '#F472B6',
  '#34D399',
  '#818CF8',
  '#FBBF24',
]

interface ConfettiPiece {
  id: number
  x: number
  delay: number
  duration: number
  color: string
  size: number
  rotation: number
}

interface ConfettiProps {
  isActive: boolean
  duration?: number
  pieceCount?: number
}

export function Confetti({ isActive, duration = 3000, pieceCount = 40 }: ConfettiProps) {
  const [pieces, setPieces] = useState<ConfettiPiece[]>([])
  const [show, setShow] = useState(false)

  useEffect(() => {
    if (isActive) {
      const newPieces: ConfettiPiece[] = Array.from({ length: pieceCount }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        delay: Math.random() * 0.5,
        duration: 1.5 + Math.random() * 2,
        color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
        size: 4 + Math.random() * 8,
        rotation: Math.random() * 720 - 360,
      }))
      setPieces(newPieces)
      setShow(true)

      const timer = setTimeout(() => {
        setShow(false)
        setPieces([])
      }, duration)

      return () => clearTimeout(timer)
    }
  }, [isActive, duration, pieceCount])

  return (
    <AnimatePresence>
      {show && (
        <div
          className="fixed inset-0 pointer-events-none z-[100] overflow-hidden"
          aria-hidden="true"
        >
          {pieces.map((piece) => (
            <motion.div
              key={piece.id}
              initial={{
                x: `${piece.x}vw`,
                y: '-5vh',
                rotate: 0,
                opacity: 1,
                scale: 1,
              }}
              animate={{
                y: '110vh',
                rotate: piece.rotation,
                opacity: [1, 1, 0.8, 0],
              }}
              transition={{
                duration: piece.duration,
                delay: piece.delay,
                ease: 'easeIn',
              }}
              style={{
                position: 'absolute',
                width: piece.size,
                height: piece.size * (Math.random() > 0.5 ? 1 : 1.5),
                backgroundColor: piece.color,
                borderRadius: Math.random() > 0.5 ? '50%' : '2px',
              }}
            />
          ))}
        </div>
      )}
    </AnimatePresence>
  )
}

export default Confetti

