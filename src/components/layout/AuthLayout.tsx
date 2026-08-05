import { Outlet } from 'react-router-dom'
import { motion } from 'framer-motion'

export default function AuthLayout() {
  return (
    <motion.div
      className="min-h-screen flex items-center justify-center bg-gradient-to-br from-mochi-primary/20 via-mochi-bg to-mochi-secondary/20 p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="w-full max-w-md">
        <Outlet />
      </div>
    </motion.div>
  )
}
