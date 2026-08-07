import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import Mascot from '../../components/ui/Mascot'
import { useAuthStore } from '../../store/authStore'

const greetings = [
  'Preparing your cozy financial space...',
  'Getting everything ready...',
  'Mochi is waking up...',
]

export default function SplashScreen() {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuthStore()
  const [greetingIndex, setGreetingIndex] = useState(0)

  useEffect(() => {
    sessionStorage.setItem('mochi_splash_shown', 'true')

    const interval = setInterval(() => {
      setGreetingIndex((prev) => (prev + 1) % greetings.length)
    }, 2000)

    const timer = setTimeout(() => {
      navigate(isAuthenticated ? '/' : '/welcome', { replace: true })
    }, 1500)

    return () => {
      clearInterval(interval)
      clearTimeout(timer)
    }
  }, [navigate, isAuthenticated])

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.6, type: 'spring' }}
      >
        <Mascot size="lg" mood="happy" />
      </motion.div>

      <motion.h1
        className="mt-6 text-3xl font-bold text-gradient"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.4 }}
      >
        Mochi Money
      </motion.h1>

      <motion.p
        className="mt-3 text-sm text-mochi-text-secondary"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.4 }}
      >
        <AnimatePresence mode="wait">
          <motion.span
            key={greetingIndex}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3 }}
          >
            {greetings[greetingIndex]}
          </motion.span>
        </AnimatePresence>
      </motion.p>

      <motion.div
        className="mt-8 flex gap-1.5"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
      >
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="w-2 h-2 rounded-full bg-mochi-primary"
            animate={{ scale: [1, 1.5, 1], opacity: [0.4, 1, 0.4] }}
            transition={{
              duration: 1.2,
              repeat: Infinity,
              delay: i * 0.2,
              ease: 'easeInOut',
            }}
          />
        ))}
      </motion.div>
    </div>
  )
}
