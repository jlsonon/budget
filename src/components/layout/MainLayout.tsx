import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { useState, useEffect, useMemo } from 'react'
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
import { useNotificationStore } from '../../store/notificationStore'
import Mascot from '../ui/Mascot'
import AddTransactionModal from '../modals/AddTransactionModal'
import { TransferModal } from '../modals/TransferModal'

import MascotAIChatModal from '../ai/MascotAIChatModal'
import ReceiptScannerModal from '../modals/ReceiptScannerModal'
import { backgroundPrewarmAI } from '../../services/localAI'
import { calculateRealStreak } from '@/lib/streak'
import { useThemeStore } from '../../store/themeStore'

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

  const { current: activeStreak } = useMemo(
    () => calculateRealStreak(transactions),
    // Only recalculate when transaction count or dates change
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [transactions.length]
  )
  const { toggleDarkMode } = useThemeStore()

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
                Mochi Money
              </div>
              <h1 className="text-base md:text-lg font-black text-mochi-text tracking-tight">
                {user?.name || 'Guest User'}
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
                      onClick={toggleDarkMode}
                      className="w-full flex items-center justify-between p-2.5 rounded-2xl hover:bg-mochi-surface-alt transition-colors text-left"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="p-1.5 bg-amber-500/10 text-amber-500 rounded-xl">
                          <Sun className="w-4 h-4 text-amber-400" />
                        </div>
                        <span className="text-xs font-bold text-mochi-text">Dark / Light Toggle</span>
                      </div>
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
            <span className="text-[10px] font-black">Logs</span>
          </button>

          {/* Column 3 (DEAD CENTER): ENLARGED, GLOWING & HIGHLY INTERACTIVE '+' BUTTON */}
          <div className="flex items-center justify-center -mt-9">
            <motion.button
              whileHover={{ scale: 1.14, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
              transition={{ type: 'spring', stiffness: 400, damping: 17 }}
              onClick={() => setShowRadialMenu((prev) => !prev)}
              className={`w-20 h-20 rounded-full bg-mochi-primary text-white flex items-center justify-center shadow-xl border-4 border-mochi-surface select-none cursor-pointer relative ${
                showRadialMenu ? 'ring-4 ring-mochi-primary/50 animate-pulse' : ''
              }`}
              aria-label="Quick Actions Radial Menu"
              title="Tap for Quick Actions Menu"
            >
              <Plus
                className={`w-10 h-10 stroke-[3.5px] transition-transform duration-300 ${
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
            <Mascot size="sm" animate={true} />
          </button>
        </div>
      </aside>

      {/* 3x3 Grid 'More' Sheet Modal */}
      <AnimatePresence>
        {showMore && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-end md:items-center justify-center p-0 md:p-4"
            onClick={() => setShowMore(false)}
          >
            <motion.div
              initial={{ y: 200, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 200, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="bg-mochi-surface border border-mochi-border rounded-t-3xl md:rounded-3xl p-6 w-full max-w-lg shadow-2xl space-y-5"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-mochi-border/60 pb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black text-mochi-primary uppercase tracking-wider">Features & Navigation</span>
                </div>
                <button
                  onClick={() => setShowMore(false)}
                  className="p-1 rounded-full text-mochi-text-muted hover:text-mochi-text hover:bg-mochi-border/50 transition-colors"
                >
                  <X className="w-5 h-5" />
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

      {/* Movable & Draggable Floating Mochi AI Mascot Button */}
      <motion.div
        drag
        dragConstraints={{ left: -320, right: 10, top: -650, bottom: 10 }}
        dragElastic={0.1}
        dragMomentum={false}
        whileDrag={{ scale: 1.15 }}
        className="fixed bottom-24 right-4 z-40 touch-none select-none cursor-grab active:cursor-grabbing"
      >
        <motion.button
          whileHover={{ scale: 1.12 }}
          whileTap={{ scale: 0.92 }}
          onClick={() => setShowAIChat(true)}
          className="relative p-1 rounded-full bg-gradient-to-tr from-amber-400 via-rose-500 to-mochi-primary shadow-[0_0_24px_rgba(245,158,11,0.45)] border-2 border-white/90 dark:border-slate-800 flex items-center justify-center group cursor-pointer"
          aria-label="Open Mochi AI Assistant"
          title="Drag to move • Click to open Mochi AI"
        >
          <div className="w-20 h-20 rounded-full bg-mochi-surface flex items-center justify-center relative overflow-hidden shadow-inner">
            <Mascot size="md" mood="happy" animate={true} />
          </div>

          {/* Subscript JUST AI Badge (No Emoji!) */}
          <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full bg-gradient-to-r from-amber-500 via-rose-500 to-mochi-primary text-white text-[10px] font-black uppercase tracking-widest shadow-md border border-white dark:border-slate-800 flex items-center justify-center pointer-events-none">
            <span>AI</span>
          </div>

          {/* Floating Tooltip Tag on Hover */}
          <span className="absolute right-full mr-2 px-2.5 py-1 rounded-xl bg-slate-900/90 text-white text-[10px] font-black whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-md backdrop-blur-xs border border-white/10">
            Drag to Move • Mochi AI
          </span>
        </motion.button>
      </motion.div>

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
                      setAddModalOpen(true, 'expense')
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
                      setAddModalOpen(true, 'income')
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
                  const radius = 130
                  const rad = item.angle * (Math.PI / 180)
                  const x = radius * Math.sin(rad)
                  const y = -radius * Math.cos(rad)

                  return (
                    <motion.button
                      key={item.id}
                      initial={{ opacity: 0, scale: 0.2, x: 0, y: 0 }}
                      animate={{ opacity: 1, scale: 1, x, y }}
                      exit={{ opacity: 0, scale: 0.2, x: 0, y: 0 }}
                      whileHover={{ scale: 1.18, y: y - 4 }}
                      whileTap={{ scale: 0.92 }}
                      transition={{
                        delay: index * 0.038,
                        type: 'spring',
                        stiffness: 380,
                        damping: 24,
                        mass: 0.7,
                      }}
                      onClick={item.onClick}
                      className="absolute flex flex-col items-center gap-1.5 transition-shadow group cursor-pointer"
                    >
                      <div
                        className={`w-13 h-13 rounded-full bg-gradient-to-tr ${item.color} flex items-center justify-center shadow-[0_8px_24px_rgba(0,0,0,0.3)] border-2 border-white dark:border-mochi-surface`}
                      >
                        <Icon className="w-6 h-6 stroke-[2.5px]" />
                      </div>
                      <span className="text-[10px] font-black text-white bg-slate-900/90 px-2.5 py-0.5 rounded-full backdrop-blur-md whitespace-nowrap shadow-md border border-white/20">
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
