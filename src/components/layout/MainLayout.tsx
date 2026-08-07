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
  ArrowUpRight,
  ArrowDownLeft,
  ArrowLeftRight,
  Camera,
} from 'lucide-react'
import { useAuthStore } from '../../store/authStore'
import { useAppStore } from '../../store/appStore'
import { useThemeStore } from '../../store/themeStore'
import { useNotificationStore } from '../../store/notificationStore'
import { getGreetingInfo } from '../../lib/utils'
import Mascot from '../ui/Mascot'
import AddTransactionModal from '../modals/AddTransactionModal'
import { TransferModal } from '../modals/TransferModal'

import MascotAIChatModal from '../ai/MascotAIChatModal'
import ReceiptScannerModal from '../modals/ReceiptScannerModal'
import { backgroundPrewarmAI } from '../../services/localAI'
import { calculateRealStreak } from '@/lib/streak'

// 3x3 Grid (9 Icons) for More Menu Modal
const moreItems = [
  { icon: User, label: 'Profile', path: '/profile', color: 'text-mochi-primary bg-mochi-primary/10' },
  { icon: Users, label: 'Circles', path: '/circles', color: 'text-sky-500 bg-sky-500/10' },
  { icon: PiggyBank, label: 'Savings', path: '/savings', color: 'text-emerald-500 bg-emerald-500/10' },
  { icon: LayoutDashboard, label: 'Plans', path: '/budget', color: 'text-amber-500 bg-amber-500/10' },
  { icon: CreditCard, label: 'Debt', path: '/debts', color: 'text-rose-500 bg-rose-500/10' },
  { icon: Repeat, label: 'Subscriptions', path: '/subscriptions', color: 'text-purple-500 bg-purple-500/10' },
  { icon: Calendar, label: 'Calendar', path: '/calendar', color: 'text-indigo-500 bg-indigo-500/10' },
  { icon: BarChart3, label: 'Reports', path: '/reports', color: 'text-blue-500 bg-blue-500/10' },
  { icon: Settings, label: 'Settings', path: '/settings', color: 'text-mochi-text-secondary bg-mochi-border/50' },
]

export default function MainLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, logout } = useAuthStore()
  const { setAddModalOpen, wallets, transactions, circles } = useAppStore()
  const { theme, setTheme } = useThemeStore()
  const notifications = useNotificationStore((s) => s.notifications)
  const hasUnreadNotifs = notifications.some((n) => !n.read)

  const [showMore, setShowMore] = useState(false)
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const [backupSuccess, setBackupSuccess] = useState(false)
  const [showAIChat, setShowAIChat] = useState(false)
  const [showScanner, setShowScanner] = useState(false)
  const [showTransferModal, setShowTransferModal] = useState(false)
  const [showRadialMenu, setShowRadialMenu] = useState(false)

  // Pre-warm local AI engine silently in the background on app load
  useEffect(() => {
    backgroundPrewarmAI()
  }, [])

  const { current: activeStreak } = calculateRealStreak(transactions)
  const greetingInfo = getGreetingInfo()

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
      <TransferModal isOpen={showTransferModal} onClose={() => setShowTransferModal(false)} />
      <MascotAIChatModal isOpen={showAIChat} onClose={() => setShowAIChat(false)} />
      <ReceiptScannerModal isOpen={showScanner} onClose={() => setShowScanner(false)} />

      {/* Modern High-Glass Top Header */}
      <header className="sticky top-0 z-40 bg-mochi-surface/90 backdrop-blur-2xl border-b border-mochi-border/80 px-4 py-3 safe-top shadow-2xs">
        <div className="flex items-center justify-between max-w-7xl mx-auto relative">
          {/* Left: Mascot & Greeting Block */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/')}
              className="relative p-0.5 rounded-2xl bg-gradient-to-tr from-mochi-primary via-purple-500 to-pink-500 shadow-xs hover:scale-105 active:scale-95 transition-transform"
              aria-label="Go to Home"
              title="Go to Home"
            >
              <div className="bg-mochi-surface rounded-[14px] p-1 flex items-center justify-center">
                <Mascot size="sm" mood="happy" animate={true} />
              </div>
            </button>

            <div>
              <div className="text-[10px] font-black text-mochi-primary uppercase tracking-widest">
                {greetingInfo.greeting}
              </div>
              <h1 className="text-base md:text-lg font-black text-mochi-text tracking-tight">
                {user?.name || 'Mochi Friend'}
              </h1>
            </div>
          </div>

          {/* Right: Streak Pill, Notifications, Profile Avatar */}
          <div className="flex items-center gap-2">
            {/* Streak Counter Badge */}
            <button
              onClick={() => navigate('/profile')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-gradient-to-r from-amber-500/15 via-orange-500/15 to-amber-500/15 border border-amber-500/30 text-amber-600 dark:text-amber-400 font-black text-xs shadow-2xs hover:scale-105 active:scale-95 transition-transform"
              title="Active Transaction Streak • View in Profile"
            >
              <Flame className="w-4 h-4 text-amber-500 fill-amber-400 animate-pulse" />
              <span>{activeStreak} {activeStreak === 1 ? 'Day' : 'Days'}</span>
            </button>

            {/* Notifications Bell */}
            <button
              onClick={() => navigate('/notifications')}
              className="p-2.5 rounded-2xl bg-mochi-surface-alt border border-mochi-border text-mochi-text-secondary hover:text-mochi-text hover:bg-mochi-border/50 transition-colors relative shadow-2xs"
              aria-label="Notifications"
            >
              <Bell className="w-4 h-4" />
              {hasUnreadNotifs && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-mochi-primary rounded-full animate-pulse" />
              )}
            </button>

            {/* Profile Avatar Quick Menu Trigger */}
            <button
              onClick={() => setShowProfileMenu((prev) => !prev)}
              className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-mochi-primary to-purple-500 p-0.5 shadow-xs hover:scale-105 active:scale-95 transition-transform"
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
                        <Crown className="w-3 h-3 fill-amber-400" /> Pro Member
                      </span>
                      <span className="text-[9px] font-bold text-amber-600 dark:text-amber-400 uppercase">Active</span>
                    </div>
                  </div>

                  {/* Menu Action Links */}
                  <div className="p-2 space-y-1">
                    {(user?.role === 'superadmin' || user?.email === 'jlsonon12@gmail.com') && (
                      <button
                        onClick={() => {
                          setShowProfileMenu(false)
                          navigate('/superadmin')
                        }}
                        className="w-full flex items-center justify-between p-2.5 rounded-2xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-600 dark:text-purple-300 transition-colors text-left border border-purple-500/20 mb-1"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="p-1.5 bg-purple-500/20 text-purple-600 dark:text-purple-300 rounded-xl">
                            <Shield className="w-4 h-4" />
                          </div>
                          <span className="text-xs font-black">Superadmin Console</span>
                        </div>
                        <ChevronRight className="w-4 h-4 text-purple-500" />
                      </button>
                    )}

                    <button
                      onClick={() => {
                        setTheme(theme === 'moonlight' || theme === 'night-sky' ? 'sakura' : 'moonlight')
                      }}
                      className="w-full flex items-center justify-between p-2.5 rounded-2xl hover:bg-mochi-surface-alt transition-colors text-left"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="p-1.5 bg-amber-500/10 text-amber-500 rounded-xl">
                          {theme === 'moonlight' || theme === 'night-sky' ? (
                            <Sun className="w-4 h-4 text-amber-400" />
                          ) : (
                            <Moon className="w-4 h-4 text-indigo-500" />
                          )}
                        </div>
                        <span className="text-xs font-bold text-mochi-text">Dark / Light Mode</span>
                      </div>
                      <span className="text-[10px] font-bold text-mochi-text-muted capitalize">
                        {theme === 'moonlight' || theme === 'night-sky' ? 'Dark' : 'Light'}
                      </span>
                    </button>

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

      {/* Mobile Bottom Navigation - 5 Columns with ENLARGED INTERACTIVE CENTER '+' BUTTON & 'MORE' TAB */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-mochi-surface/95 backdrop-blur-2xl border-t border-mochi-border/80 safe-bottom md:hidden shadow-2xl">
        <div className="grid grid-cols-5 items-center py-2 text-center relative">
          {/* Column 1: Home */}
          <button
            onClick={() => navigate('/')}
            className={`flex flex-col items-center justify-center gap-1 p-2 rounded-2xl transition-all ${
              location.pathname === '/'
                ? 'text-mochi-primary font-extrabold scale-105 bg-mochi-primary/10 border border-mochi-primary/20'
                : 'text-mochi-text-muted hover:text-mochi-text'
            }`}
          >
            <Home className={`w-5 h-5 ${location.pathname === '/' ? 'stroke-[2.5px]' : 'stroke-2'}`} />
            <span className="text-[10px] font-black">Home</span>
          </button>

          {/* Column 2: Transactions */}
          <button
            onClick={() => navigate('/transactions')}
            className={`flex flex-col items-center justify-center gap-1 p-2 rounded-2xl transition-all ${
              location.pathname === '/transactions'
                ? 'text-mochi-primary font-extrabold scale-105 bg-mochi-primary/10 border border-mochi-primary/20'
                : 'text-mochi-text-muted hover:text-mochi-text'
            }`}
          >
            <ReceiptText className={`w-5 h-5 ${location.pathname === '/transactions' ? 'stroke-[2.5px]' : 'stroke-2'}`} />
            <span className="text-[10px] font-black">Txns</span>
          </button>

          {/* Column 3 (DEAD CENTER): ENLARGED, GLOWING & HIGHLY INTERACTIVE '+' BUTTON */}
          <div className="flex items-center justify-center -mt-7">
            <motion.button
              whileHover={{ scale: 1.14, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
              transition={{ type: 'spring', stiffness: 400, damping: 17 }}
              onClick={() => setShowRadialMenu((prev) => !prev)}
              className={`w-16 h-16 rounded-full bg-gradient-to-tr from-mochi-primary via-purple-500 to-pink-500 text-white flex items-center justify-center shadow-[0_12px_30px_-4px_rgba(236,72,153,0.6)] border-4 border-mochi-surface select-none cursor-pointer relative ${
                showRadialMenu ? 'ring-4 ring-pink-500/50 animate-pulse' : ''
              }`}
              aria-label="Quick Actions Radial Menu"
              title="Tap for Quick Actions Menu"
            >
              <Plus
                className={`w-8 h-8 stroke-[3.5px] transition-transform duration-300 ${
                  showRadialMenu ? 'rotate-45 text-rose-200' : ''
                }`}
              />
            </motion.button>
          </div>

          {/* Column 4: Wallets */}
          <button
            onClick={() => navigate('/wallets')}
            className={`flex flex-col items-center justify-center gap-1 p-2 rounded-2xl transition-all ${
              location.pathname === '/wallets'
                ? 'text-mochi-primary font-extrabold scale-105 bg-mochi-primary/10 border border-mochi-primary/20'
                : 'text-mochi-text-muted hover:text-mochi-text'
            }`}
          >
            <Wallet className={`w-5 h-5 ${location.pathname === '/wallets' ? 'stroke-[2.5px]' : 'stroke-2'}`} />
            <span className="text-[10px] font-black">Wallets</span>
          </button>

          {/* Column 5: More (Opens 3x3 Grid including Profile & Modules) */}
          <button
            onClick={() => setShowMore(true)}
            className="flex flex-col items-center justify-center gap-1 p-2 rounded-2xl text-mochi-text-muted hover:text-mochi-text transition-colors"
          >
            <MoreHorizontal className="w-5 h-5 stroke-2" />
            <span className="text-[10px] font-black">More</span>
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
            {[
              { icon: Home, label: 'Home', path: '/' },
              { icon: ReceiptText, label: 'Transactions', path: '/transactions' },
              { icon: Wallet, label: 'Wallets', path: '/wallets' },
              { icon: User, label: 'Profile', path: '/profile' },
            ].map((item) => {
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

        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setAddModalOpen(true)}
          className="w-13 h-13 rounded-2xl bg-gradient-to-tr from-mochi-primary via-purple-500 to-pink-500 text-white flex items-center justify-center shadow-lg transition-all"
          title="Add Transaction"
        >
          <Plus className="w-6 h-6 stroke-[3]" />
        </motion.button>
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

      {/* Explore All Modules Sheet - PERFECT 3 x 3 GRID (9 Icons including Profile) */}
      <AnimatePresence>
        {showMore && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-end sm:items-center justify-center p-4"
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
                  <h3 className="text-sm font-black text-mochi-text">More Options</h3>
                </div>
                <button onClick={() => setShowMore(false)} className="p-1.5 rounded-full hover:bg-mochi-surface-alt text-mochi-text-muted">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Exact 3 by 3 Grid Layout for 9 Icons */}
              <div className="grid grid-cols-3 gap-3.5">
                {moreItems.map((item) => {
                  const Icon = item.icon
                  return (
                    <button
                      key={item.path}
                      onClick={() => {
                        navigate(item.path)
                        setShowMore(false)
                      }}
                      className="flex flex-col items-center justify-center gap-2 p-3 rounded-2xl bg-mochi-surface-alt/40 border border-mochi-border/40 hover:bg-mochi-surface-alt hover:scale-105 transition-all shadow-2xs group"
                    >
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${item.color} border border-current/10 shadow-2xs group-hover:scale-110 transition-transform`}>
                        <Icon className="w-5.5 h-5.5" />
                      </div>
                      <span className="text-[11px] font-black text-mochi-text text-center truncate w-full">{item.label}</span>
                    </button>
                  )
                })}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Semicircle Radial Quick-Menu Overlay */}
      <AnimatePresence>
        {showRadialMenu && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs md:hidden"
              onClick={() => setShowRadialMenu(false)}
            />

            {/* Upper Semicircle Radial Options Menu Arc */}
            <div className="fixed bottom-[22px] left-1/2 -translate-x-1/2 z-50 pointer-events-none md:hidden">
              <motion.div
                initial={{ opacity: 0, scale: 0.3, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.3, y: 15 }}
                transition={{ type: 'spring', damping: 24, stiffness: 280 }}
                className="relative w-80 h-44 flex items-end justify-center pointer-events-auto"
              >
                {[
                  {
                    id: 'expense',
                    label: 'Expense',
                    icon: ArrowUpRight,
                    color: 'from-rose-500 to-pink-500 text-white',
                    angle: -75,
                    onClick: () => {
                      setShowRadialMenu(false)
                      setAddModalOpen(true)
                    },
                  },
                  {
                    id: 'income',
                    label: 'Income',
                    icon: ArrowDownLeft,
                    color: 'from-emerald-500 to-teal-500 text-white',
                    angle: -37.5,
                    onClick: () => {
                      setShowRadialMenu(false)
                      setAddModalOpen(true)
                    },
                  },
                  {
                    id: 'transfer',
                    label: 'Transfer',
                    icon: ArrowLeftRight,
                    color: 'from-purple-500 to-indigo-500 text-white',
                    angle: 0,
                    onClick: () => {
                      setShowRadialMenu(false)
                      setShowTransferModal(true)
                    },
                  },
                  {
                    id: 'scan',
                    label: 'Scan Receipt',
                    icon: Camera,
                    color: 'from-cyan-500 to-blue-500 text-white',
                    angle: 37.5,
                    onClick: () => {
                      setShowRadialMenu(false)
                      setShowScanner(true)
                    },
                  },
                  {
                    id: 'ai',
                    label: 'Mochi AI',
                    icon: Sparkles,
                    color: 'from-amber-500 to-orange-500 text-white',
                    angle: 75,
                    onClick: () => {
                      setShowRadialMenu(false)
                      setShowAIChat(true)
                    },
                  },
                ].map((item, index) => {
                  const Icon = item.icon
                  const radius = 125
                  const rad = item.angle * (Math.PI / 180)
                  const x = radius * Math.sin(rad)
                  const y = -radius * Math.cos(rad)

                  return (
                    <motion.button
                      key={item.id}
                      initial={{ opacity: 0, scale: 0, x: 0, y: 0 }}
                      animate={{ opacity: 1, scale: 1, x, y }}
                      exit={{ opacity: 0, scale: 0, x: 0, y: 0 }}
                      transition={{ delay: index * 0.035, type: 'spring', damping: 22, stiffness: 310 }}
                      onClick={item.onClick}
                      className="absolute flex flex-col items-center gap-1 hover:scale-110 active:scale-95 transition-transform group cursor-pointer"
                    >
                      <div
                        className={`w-12 h-12 rounded-full bg-gradient-to-tr ${item.color} flex items-center justify-center shadow-2xl border-2 border-white dark:border-mochi-surface`}
                      >
                        <Icon className="w-5.5 h-5.5 stroke-[2.5px]" />
                      </div>
                      <span className="text-[10px] font-black text-white bg-black/80 px-2.5 py-0.5 rounded-full backdrop-blur-md whitespace-nowrap shadow-md border border-white/10">
                        {item.label}
                      </span>
                    </motion.button>
                  )
                })}
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
