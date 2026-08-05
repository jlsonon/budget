import { Outlet } from 'react-router-dom'
import { motion } from 'framer-motion'

export default function OnboardingLayout() {
  return (
    <motion.div
      className="min-h-screen flex items-center justify-center bg-gradient-to-br from-mochi-primary/10 via-mochi-bg to-mochi-secondary/10 p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="w-full max-w-lg">
        <Outlet />
      </div>
    </motion.div>
  )
}
