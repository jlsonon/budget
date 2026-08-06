import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Home,
  ReceiptText,
  Wallet,
  User,
  Bell,
  Plus,
  PiggyBank,
  CreditCard,
  Repeat,
  Calendar,
  BarChart3,
  Settings,
  Users,
  X,
  MoreHorizontal,
  LayoutDashboard,
  Flame,
  Sun,
  Moon,
  Sparkles,
  LogOut,
  Crown,
  Download,
  ChevronRight,
  Shield,
} from 'lucide-react'
import { useAuthStore } from '../../store/authStore'
import { useAppStore } from '../../store/appStore'
import { useThemeStore } from '../../store/themeStore'
import { useNotificationStore } from '../../store/notificationStore'
import { getGreeting } from '../../lib/utils'
import Mascot from '../ui/Mascot'
import AddTransactionModal from '../modals/AddTransactionModal'

import { Receipt } from 'lucide-react'
import MascotAIChatModal from '../ai/MascotAIChatModal'
import ReceiptScannerModal from '../modals/ReceiptScannerModal'
import { backgroundPrewarmAI } from '../../services/localAI'

const navItems = [
  { icon: Home, label: 'Home', path: '/' },
  { icon: ReceiptText, label: 'Transactions', path: '/transactions' },
  { icon: Wallet, label: 'Wallets', path: '/wallets' },
  { icon: User, label: 'Profile', path: '/profile' },
]

const moreItems = [
  { icon: Users, label: 'Circles', path: '/circles', color: 'text-sky-500 bg-sky-500/10' },
  { icon: PiggyBank, label: 'Savings', path: '/savings', color: 'text-emerald-500 bg-emerald-500/10' },
  { icon: LayoutDashboard, label: 'Plans', path: '/budget', color: 'text-amber-500 bg-amber-500/10' },
  { icon: CreditCard, label: 'Debt', path: '/debts', color: 'text-rose-500 bg-rose-500/10' },
  { icon: Repeat, label: 'Subscriptions', path: '/subscriptions', color: 'text-purple-500 bg-purple-500/10' },
  { icon: Calendar, label: 'Calendar', path: '/calendar', color: 'text-indigo-500 bg-indigo-500/10' },
  { icon: BarChart3, label: 'Reports', path: '/reports', color: 'text-mochi-primary bg-mochi-primary/10' },
  { icon: Settings, label: 'Settings', path: '/settings', color: 'text-mochi-text-secondary bg-mochi-border/50' },
]

export default function MainLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, logout } = useAuthStore()
  const { setAddModalOpen, streaks, wallets, transactions, circles } = useAppStore()
  const { theme, setTheme } = useThemeStore()
  const notifications = useNotificationStore((s) => s.notifications)
  const hasUnreadNotifs = notifications.some((n) => !n.read)

  const [showMore, setShowMore] = useState(false)
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const [backupSuccess, setBackupSuccess] = useState(false)
  const [showAIChat, setShowAIChat] = useState(false)
  const [showScanner, setShowScanner] = useState(false)

  // Pre-warm local AI engine silently in the background on app load
  useEffect(() => {
    backgroundPrewarmAI()
  }, [])

  const activeStreak = streaks.reduce((max, s) => Math.max(max, s.current), 3)

  const handleExportJSON = () => {
    const backupData = {
      app: 'Mochi Money',
      version: '1.0.0',
      exportDate: new Date().toISOString(),
      user,
      wallets,
      transactions,
      circles,
    }
    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `Mochi_Money_Backup_${new Date().toISOString().slice(0, 10)}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    setBackupSuccess(true)
    setTimeout(() => setBackupSuccess(false), 2500)
  }

  return (
    <div className="min-h-screen bg-mochi-bg pb-20 md:pb-0 md:pl-20">
      <AddTransactionModal />
      <MascotAIChatModal isOpen={showAIChat} onClose={() => setShowAIChat(false)} />
      <ReceiptScannerModal isOpen={showScanner} onClose={() => setShowScanner(false)} />

      {/* Modern Top Header */}
      <header className="sticky top-0 z-40 bg-mochi-surface/85 backdrop-blur-xl border-b border-mochi-border px-4 py-3 safe-top">
        <div className="flex items-center justify-between max-w-7xl mx-auto relative">
          {/* Left: Mascot & User Greeting */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowProfileMenu((prev) => !prev)}
              className="relative p-0.5 rounded-2xl bg-gradient-mochi shadow-xs hover:scale-105 transition-transform"
              aria-label="Toggle Account Menu"
            >
              <div className="bg-mochi-surface rounded-[14px] p-1 flex items-center justify-center">
                <Mascot size="sm" mood="happy" animate={true} />
              </div>
            </button>

            <div>
              <div className="flex items-center gap-2">
                <p className="text-[11px] font-bold text-mochi-text-muted">{getGreeting()}</p>
                {/* Handcrafted Warm Streak Pill */}
                <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-300 font-extrabold text-[10px] border border-amber-500/20">
                  <Flame className="w-3 h-3 text-amber-500 fill-amber-400" />
                  <span>{activeStreak} Days</span>
                </div>
              </div>
              <h1 className="text-base font-black text-mochi-text tracking-tight">
                {user?.name?.split(' ')[0] || 'Mochi Friend'}
              </h1>
            </div>
          </div>

          {/* Right: Scan Receipt, Mochi AI, Theme Toggle, Notifications, Profile Dropdown */}
          <div className="flex items-center gap-2">
            {/* Scan Receipt Button */}
            <button
              onClick={() => setShowScanner(true)}
              className="p-2 rounded-2xl bg-gradient-to-r from-emerald-500/15 to-teal-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 hover:scale-105 active:scale-95 transition-all flex items-center gap-1.5 px-3 text-xs font-black shadow-xs"
              title="Scan Receipt Offline"
            >
              <Receipt className="w-4 h-4 text-emerald-500" />
              <span className="hidden sm:inline">Scan Receipt</span>
            </button>

            {/* Mochi Local AI Button */}
            <button
              onClick={() => setShowAIChat(true)}
              className="p-2 rounded-2xl bg-gradient-to-r from-mochi-primary/15 via-purple-500/15 to-pink-500/15 border border-mochi-primary/30 text-mochi-primary hover:scale-105 active:scale-95 transition-all flex items-center gap-1.5 px-3 text-xs font-black shadow-xs"
              title="Open Local Mochi AI Assistant"
            >
              <Sparkles className="w-4 h-4 text-mochi-primary" />
              <span className="hidden sm:inline">Mochi AI</span>
            </button>

            {/* Quick Dark / Light Theme Switcher */}
            <button
              onClick={() => setTheme(theme === 'moonlight' || theme === 'night-sky' ? 'sakura' : 'moonlight')}
              className="p-2 rounded-2xl bg-mochi-surface-alt border border-mochi-border text-mochi-text-secondary hover:text-mochi-text hover:bg-mochi-border/50 transition-colors"
              aria-label="Toggle Theme"
              title="Switch Dark / Light Theme"
            >
              {theme === 'moonlight' || theme === 'night-sky' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-500" />}
            </button>

            {/* Notifications Bell */}
            <button
              onClick={() => navigate('/notifications')}
              className="p-2 rounded-2xl bg-mochi-surface-alt border border-mochi-border text-mochi-text-secondary hover:text-mochi-text hover:bg-mochi-border/50 transition-colors relative"
              aria-label="Notifications"
            >
              <Bell className="w-4 h-4" />
              {hasUnreadNotifs && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-mochi-primary rounded-full animate-pulse" />
              )}
            </button>

            {/* Profile Avatar Dropdown Trigger */}
            <button
              onClick={() => setShowProfileMenu((prev) => !prev)}
              className="w-9 h-9 rounded-2xl bg-gradient-mochi p-0.5 shadow-xs hover:scale-105 active:scale-95 transition-transform"
              aria-label="Toggle Profile Quick Menu"
            >
              <div className="w-full h-full rounded-[14px] bg-mochi-surface overflow-hidden flex items-center justify-center font-black text-xs text-mochi-primary">
                {user?.avatar ? (
                  <img src={user.avatar} alt={user?.name || 'Profile'} className="w-full h-full object-cover" />
                ) : (
                  <span>{user?.name?.charAt(0)?.toUpperCase() || 'M'}</span>
                )}
              </div>
            </button>
          </div>

          {/* Profile Quick Menu Dropdown */}
          <AnimatePresence>
            {showProfileMenu && (
              <>
                {/* Backdrop overlay */}
                <div
                  className="fixed inset-0 z-40 bg-black/10"
                  onClick={() => setShowProfileMenu(false)}
                />

                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  transition={{ duration: 0.15, ease: 'easeOut' }}
                  className="absolute top-14 right-0 z-50 w-72 bg-mochi-surface rounded-3xl border border-mochi-border shadow-2xl overflow-hidden"
                >
                  {/* Account Header Preview */}
                  <div className="p-4 bg-gradient-to-br from-mochi-primary/10 via-mochi-secondary/10 to-transparent border-b border-mochi-border">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-full bg-gradient-mochi p-0.5 shadow-xs shrink-0">
                        <div className="w-full h-full rounded-full bg-mochi-surface overflow-hidden flex items-center justify-center font-black text-sm text-mochi-primary">
                          {user?.avatar ? (
                            <img src={user.avatar} alt={user?.name} className="w-full h-full object-cover" />
                          ) : (
                            <span>{user?.name?.charAt(0)?.toUpperCase() || 'M'}</span>
                          )}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-black text-mochi-text truncate">{user?.name || 'Mochi Member'}</h4>
                        <p className="text-[11px] font-bold text-mochi-text-muted truncate">{user?.email || 'pro@mochi.money'}</p>
                      </div>
                    </div>

                    <div className="mt-3 flex items-center justify-between bg-amber-400/15 border border-amber-400/30 rounded-xl px-2.5 py-1">
                      <span className="text-[10px] font-extrabold text-amber-700 dark:text-amber-300 flex items-center gap-1">
                        <Crown className="w-3 h-3 fill-amber-400" /> Mochi Pro Member
                      </span>
                      <span className="text-[9px] font-bold text-amber-600 dark:text-amber-400 uppercase">Active</span>
                    </div>
                  </div>

                  {/* Menu Action Links */}
                  <div className="p-2 space-y-1">
                    <button
                      onClick={() => {
                        setShowProfileMenu(false)
                        navigate('/profile')
                      }}
                      className="w-full flex items-center justify-between p-2.5 rounded-2xl hover:bg-mochi-surface-alt transition-colors text-left"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="p-1.5 bg-mochi-primary/10 text-mochi-primary rounded-xl">
                          <User className="w-4 h-4" />
                        </div>
                        <span className="text-xs font-bold text-mochi-text">View Full Profile</span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-mochi-text-muted" />
                    </button>

                    <button
                      onClick={() => {
                        setShowProfileMenu(false)
                        navigate('/settings')
                      }}
                      className="w-full flex items-center justify-between p-2.5 rounded-2xl hover:bg-mochi-surface-alt transition-colors text-left"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="p-1.5 bg-sky-500/10 text-sky-500 rounded-xl">
                          <Settings className="w-4 h-4" />
                        </div>
                        <span className="text-xs font-bold text-mochi-text">App Settings</span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-mochi-text-muted" />
                    </button>

                    <button
                      onClick={handleExportJSON}
                      className="w-full flex items-center justify-between p-2.5 rounded-2xl hover:bg-mochi-surface-alt transition-colors text-left"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="p-1.5 bg-emerald-500/10 text-emerald-500 rounded-xl">
                          <Download className="w-4 h-4" />
                        </div>
                        <span className="text-xs font-bold text-mochi-text">
                          {backupSuccess ? 'Data Exported!' : 'Export Backup (.JSON)'}
                        </span>
                      </div>
                      <Shield className="w-3.5 h-3.5 text-mochi-text-muted" />
                    </button>
                  </div>

                  {/* Footer Log Out */}
                  <div className="p-2 border-t border-mochi-border">
                    <button
                      onClick={() => {
                        setShowProfileMenu(false)
                        logout()
                        navigate('/')
                      }}
                      className="w-full flex items-center gap-2.5 p-2.5 rounded-2xl hover:bg-rose-500/10 text-rose-500 transition-colors text-left font-bold text-xs"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Log Out of Mochi</span>
                    </button>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 pt-4">
        <Outlet />
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-mochi-surface/90 backdrop-blur-lg border-t border-mochi-border safe-bottom md:hidden">
        <div className="flex items-center justify-around py-2">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = location.pathname === item.path
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`flex flex-col items-center gap-1 p-2 rounded-2xl transition-all ${
                  isActive ? 'text-mochi-primary font-bold scale-105' : 'text-mochi-text-muted hover:text-mochi-text'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5px]' : 'stroke-2'}`} />
                <span className="text-[10px] font-bold">{item.label}</span>
              </button>
            )
          })}

          {/* Quick Add Button */}
          <button
            onClick={() => setAddModalOpen(true)}
            className="w-11 h-11 rounded-2xl bg-gradient-mochi text-white flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-transform -mt-4 border-2 border-mochi-surface"
            aria-label="Add Transaction"
          >
            <Plus className="w-6 h-6 stroke-[3px]" />
          </button>

          {/* More Trigger */}
          <button
            onClick={() => setShowMore(true)}
            className="flex flex-col items-center gap-1 p-2 rounded-2xl text-mochi-text-muted hover:text-mochi-text transition-colors"
          >
            <MoreHorizontal className="w-5 h-5 stroke-2" />
            <span className="text-[10px] font-bold">More</span>
          </button>
        </div>
      </nav>

      {/* Desktop Sidebar Navigation */}
      <aside className="hidden md:flex flex-col fixed top-0 left-0 bottom-0 w-20 bg-mochi-surface border-r border-mochi-border z-40 py-6 items-center justify-between">
        <div className="flex flex-col items-center gap-6">
          <button onClick={() => navigate('/')} className="hover:scale-105 transition-transform">
            <Mascot size="sm" mood="happy" animate={true} />
          </button>

          <div className="flex flex-col items-center gap-3">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = location.pathname === item.path
              return (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className={`p-3 rounded-2xl transition-all ${
                    isActive
                      ? 'bg-mochi-primary/15 text-mochi-primary border border-mochi-primary/30 shadow-2xs'
                      : 'text-mochi-text-muted hover:bg-mochi-surface-alt hover:text-mochi-text'
                  }`}
                  title={item.label}
                >
                  <Icon className="w-5 h-5" />
                </button>
              )
            })}
          </div>
        </div>

        <button
          onClick={() => setAddModalOpen(true)}
          className="w-12 h-12 rounded-2xl bg-gradient-mochi text-white flex items-center justify-center shadow-md hover:scale-105 active:scale-95 transition-transform"
          title="Add Transaction"
        >
          <Plus className="w-6 h-6 stroke-[3]" />
        </button>
      </aside>

      {/* Movable / Draggable Floating Action Button (FAB) for Mochi AI */}
      <motion.div
        drag
        dragConstraints={{ left: -320, right: 20, top: -500, bottom: 20 }}
        dragElastic={0.05}
        dragMomentum={false}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setShowAIChat(true)}
        className="fixed bottom-20 right-4 md:bottom-6 md:right-6 z-40 p-3 rounded-full bg-gradient-to-r from-mochi-primary via-purple-500 to-pink-500 text-white shadow-2xl cursor-grab active:cursor-grabbing flex items-center gap-2 border-2 border-white dark:border-mochi-surface touch-none group select-none"
        title="Drag anywhere • Tap to open Mochi Local AI"
      >
        <Sparkles className="w-5 h-5 text-amber-200 group-hover:rotate-12 transition-transform pointer-events-none" />
        <span className="text-xs font-black pr-1 hidden sm:inline pointer-events-none">Mochi AI</span>
      </motion.div>

      {/* More Modules Dropdown Sheet */}
      <AnimatePresence>
        {showMore && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm flex items-end sm:items-center justify-center p-4"
            onClick={() => setShowMore(false)}
          >
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 50, opacity: 0 }}
              className="w-full max-w-md bg-mochi-surface rounded-3xl border border-mochi-border shadow-2xl p-5 space-y-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between pb-2 border-b border-mochi-border">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-mochi-primary" />
                  <h3 className="text-sm font-bold text-mochi-text">Explore All Modules</h3>
                </div>
                <button onClick={() => setShowMore(false)} className="p-1.5 rounded-full hover:bg-mochi-surface-alt text-mochi-text-muted">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-4 gap-3">
                {moreItems.map((item) => {
                  const Icon = item.icon
                  return (
                    <button
                      key={item.path}
                      onClick={() => {
                        navigate(item.path)
                        setShowMore(false)
                      }}
                      className="flex flex-col items-center gap-1.5 p-2.5 rounded-2xl hover:bg-mochi-surface-alt transition-colors"
                    >
                      <div className={`w-11 h-11 rounded-2xl flex items-center justify-center ${item.color} border border-current/10 shadow-2xs`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className="text-[11px] font-bold text-mochi-text-secondary text-center truncate w-full">{item.label}</span>
                    </button>
                  )
                })}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
