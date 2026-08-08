import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import Mascot from '../../components/ui/Mascot'

export default function WelcomeScreen() {
  const navigate = useNavigate()

  return (
    <div className="flex flex-col items-center text-center max-w-lg mx-auto pb-6">
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <Mascot size="lg" mood="excited" />
      </motion.div>

      <motion.h1
        className="mt-6 text-3xl font-bold text-mochi-text"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        Welcome to <span className="text-gradient">Mochi Money</span>
      </motion.h1>

      <motion.p
        className="mt-2 text-sm text-mochi-text-secondary"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        Managing money has never been this cozy.
      </motion.p>

      <motion.div
        className="mt-8 w-full space-y-3"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <button
          onClick={() => navigate('/register')}
          className="w-full mochi-btn-primary py-3.5 text-base shadow-md font-semibold flex items-center justify-center gap-2 cursor-pointer"
        >
          <span>Get Started / Create Account</span>
          <ArrowRight className="w-4 h-4 ml-1" />
        </button>

        <button
          onClick={() => navigate('/login')}
          className="w-full mochi-btn-secondary py-3.5 text-base font-semibold cursor-pointer"
        >
          Sign In to Existing Account
        </button>
      </motion.div>
    </div>
  )
}
