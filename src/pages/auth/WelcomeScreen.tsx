import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, Palette, Check } from 'lucide-react'
import Mascot from '../../components/ui/Mascot'
import { useThemeStore, THEMES, type ThemeInfo } from '../../store/themeStore'
import { hapticLight } from '../../lib/haptics'

export default function WelcomeScreen() {
  const navigate = useNavigate()
  const { theme: currentTheme, setTheme } = useThemeStore()

  const handleSelectTheme = (themeId: any) => {
    hapticLight()
    setTheme(themeId)
  }

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

      {/* Interactive 14-Theme Selector */}
      <motion.div
        className="mt-8 w-full p-4 rounded-3xl bg-mochi-surface-alt/60 border border-mochi-border/60 space-y-3"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <div className="flex items-center justify-between text-xs font-bold text-mochi-text">
          <span className="flex items-center gap-1.5 font-extrabold">
            <Palette className="w-4 h-4 text-mochi-primary" /> Pick Your Cozy Theme
          </span>
          <span className="text-[11px] text-mochi-text-muted capitalize font-semibold">
            {THEMES.find((t) => t.id === currentTheme)?.name || currentTheme} Active
          </span>
        </div>

        <div className="grid grid-cols-4 sm:grid-cols-7 gap-2.5 pt-1">
          {THEMES.map((theme: ThemeInfo) => {
            const isSelected = currentTheme === theme.id
            return (
              <button
                key={theme.id}
                onClick={() => handleSelectTheme(theme.id)}
                className={`flex flex-col items-center gap-1 group cursor-pointer transition-all duration-200 ${
                  isSelected ? 'scale-110' : 'hover:scale-105 opacity-80 hover:opacity-100'
                }`}
                title={`Switch to ${theme.name} Theme`}
              >
                <div
                  className={`w-9 h-9 rounded-full relative flex items-center justify-center transition-all shadow-xs ${
                    isSelected
                      ? 'ring-2 ring-mochi-primary ring-offset-2 shadow-md'
                      : 'border border-white/20'
                  }`}
                  style={{
                    background: `linear-gradient(135deg, ${theme.colors[0]}, ${theme.colors[1]})`,
                  }}
                >
                  {isSelected && <Check className="w-4 h-4 text-white drop-shadow-md stroke-[3]" />}
                </div>
                <span
                  className={`text-[9px] truncate w-full text-center ${
                    isSelected
                      ? 'font-black text-mochi-primary'
                      : 'font-bold text-mochi-text-muted group-hover:text-mochi-text'
                  }`}
                >
                  {theme.name}
                </span>
              </button>
            )
          })}
        </div>
      </motion.div>
    </div>
  )
}
