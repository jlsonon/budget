import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, Sparkles } from 'lucide-react'
import Mascot from '../../components/ui/Mascot'
import { useAuthStore } from '../../store/authStore'

export default function WelcomeScreen() {
  const navigate = useNavigate()
  const { loginAsGuest } = useAuthStore()

  const handleBypass = () => {
    loginAsGuest()
    navigate('/')
  }

  return (
    <div className="flex flex-col items-center text-center">
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <Mascot size="lg" mood="excited" />
      </motion.div>

      <motion.h1
        className="mt-8 text-3xl font-bold text-mochi-text"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        Welcome to <span className="text-gradient">Mochi Money</span>
      </motion.h1>

      <motion.p
        className="mt-3 text-mochi-text-secondary"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        Managing money has never been this cozy.
      </motion.p>

      <motion.div
        className="mt-10 w-full space-y-3"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <button
          onClick={handleBypass}
          className="w-full mochi-btn-primary py-3.5 text-base shadow-md font-semibold flex items-center justify-center gap-2"
        >
          <Sparkles className="w-5 h-5 text-yellow-200" />
          Enter Dashboard Immediately
          <ArrowRight className="w-4 h-4 ml-1" />
        </button>

        <button
          onClick={() => navigate('/register')}
          className="w-full mochi-btn-secondary py-3.5 text-base"
        >
          Setup New Account
        </button>

        <button
          onClick={() => navigate('/login')}
          className="w-full mochi-btn-ghost py-2.5 text-sm"
        >
          Sign In
        </button>
      </motion.div>

      <motion.div
        className="mt-12 grid grid-cols-4 gap-3"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
      >
        {[
          { name: 'Sakura', color: 'bg-pink-300' },
          { name: 'Matcha', color: 'bg-green-300' },
          { name: 'Ocean', color: 'bg-blue-300' },
          { name: 'Peach', color: 'bg-orange-300' },
        ].map((theme) => (
          <div key={theme.name} className="flex flex-col items-center gap-1.5">
            <div className={`w-10 h-10 rounded-full ${theme.color} shadow-sm`} />
            <span className="text-[10px] text-mochi-text-muted">{theme.name}</span>
          </div>
        ))}
      </motion.div>
    </div>
  )
}
