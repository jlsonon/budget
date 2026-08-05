import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { useAppStore } from '@/store/appStore'
import Dialog from '@/components/ui/Dialog'
import Mascot from '@/components/ui/Mascot'
import GroupMascotSVG from '@/components/ui/GroupMascotSVG'
import { formatDate } from '@/lib/utils'
import {
  Settings,
  Shield,
  LogOut,
  Edit2,
  ChevronRight,
  Award,
  Flame,
  Calendar,
  Activity,
  CheckCircle2,
  Crown,
  Download,
  Lock,
  Sparkles,
  X,
} from 'lucide-react'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35 } },
}

export default function ProfilePage() {
  const navigate = useNavigate()
  const { user, logout, updateUser } = useAuthStore()
  const { transactions, achievements, streaks, wallets, circles } = useAppStore()

  const [isLoading, setIsLoading] = useState(true)
  const [showLogoutDialog, setShowLogoutDialog] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showBackupSuccess, setShowBackupSuccess] = useState(false)

  // Security Toggles
  const [biometricEnabled, setBiometricEnabled] = useState(true)

  // Mascot Companion Customizer
  const [selectedMascot, setSelectedMascot] = useState<'cat' | 'rabbit' | 'fox' | 'bear' | 'shiba' | 'panda'>('cat')
  const [selectedOutfit, setSelectedOutfit] = useState<'casual' | 'beach' | 'winter'>('casual')
  const [selectedMood] = useState<'happy' | 'excited' | 'celebrating' | 'neutral'>('happy')

  const [editName, setEditName] = useState(user?.name || '')
  const [editAvatarUrl, setEditAvatarUrl] = useState(user?.avatar || '')

  useEffect(() => {
    if (user) {
      setEditName(user.name)
      setEditAvatarUrl(user.avatar || '')
    }
  }, [user])

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 500)
    return () => clearTimeout(timer)
  }, [])

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        setEditAvatarUrl(reader.result)
      }
    }
    reader.readAsDataURL(file)
  }

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault()
    if (!editName.trim()) return
    updateUser({
      name: editName.trim(),
      avatar: editAvatarUrl || undefined,
    })
    setShowEditModal(false)
  }

  // Full Data Export (JSON Backup)
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

    setShowBackupSuccess(true)
    setTimeout(() => setShowBackupSuccess(false), 3000)
  }

  // Stats
  const totalTransactions = transactions.length
  const daysActive = user ? Math.max(1, Math.floor((Date.now() - new Date(user.createdAt).getTime()) / (1000 * 60 * 60 * 24))) : 14
  const unlockedAchievements = achievements.filter((a) => a.unlocked).length
  const totalAchievements = achievements.length || 8
  const longestStreak = streaks.reduce((max, s) => Math.max(max, s.longest), 3)

  if (isLoading) {
    return (
      <div className="p-4 sm:p-6 max-w-4xl mx-auto space-y-6 animate-pulse">
        <div className="mochi-card h-48 bg-mochi-surface-alt rounded-3xl" />
        <div className="grid grid-cols-2 gap-4">
          <div className="mochi-card h-24 bg-mochi-surface-alt rounded-2xl" />
          <div className="mochi-card h-24 bg-mochi-surface-alt rounded-2xl" />
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-4 text-center">
        <Mascot mood="sad" size="lg" className="mb-6" />
        <h2 className="text-2xl font-bold text-mochi-text mb-2">Not Logged In</h2>
        <p className="text-mochi-text-secondary mb-6">Please log in to view your profile and settings.</p>
        <Link to="/" className="mochi-btn-primary px-6 py-3 text-white">
          Go to Home
        </Link>
      </div>
    )
  }

  return (
    <motion.div
      className="p-4 sm:p-6 max-w-4xl mx-auto pb-28 space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Edit Profile Modal */}
      <Dialog isOpen={showEditModal} onClose={() => setShowEditModal(false)} size="md">
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-mochi-border">
            <h3 className="text-base font-bold text-mochi-text">Edit Profile & Photo</h3>
            <button onClick={() => setShowEditModal(false)} className="p-1.5 rounded-full hover:bg-mochi-surface-alt text-mochi-text-muted">
              <X className="w-4 h-4" />
            </button>
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div className="flex flex-col items-center gap-3">
              <div className="w-24 h-24 rounded-full bg-mochi-primary/10 border-4 border-mochi-primary/30 flex items-center justify-center overflow-hidden shadow-md">
                {editAvatarUrl ? (
                  <img src={editAvatarUrl} alt="Avatar Preview" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-3xl font-extrabold text-mochi-primary">
                    {editName.charAt(0).toUpperCase() || 'M'}
                  </span>
                )}
              </div>

              <label className="mochi-btn-secondary text-xs px-4 py-2 cursor-pointer flex items-center gap-2">
                <span>Upload Photo from Device</span>
                <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
              </label>
            </div>

            <div>
              <label className="block text-xs font-bold text-mochi-text-secondary mb-1">Display Name *</label>
              <input
                type="text"
                placeholder="Your Name"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="mochi-input text-xs w-full font-bold"
              />
            </div>

            <div className="pt-2 flex gap-3">
              <button
                type="button"
                onClick={() => setShowEditModal(false)}
                className="mochi-btn-secondary text-xs flex-1 py-2.5"
              >
                Cancel
              </button>
              <button type="submit" className="mochi-btn-primary text-xs flex-1 py-2.5">
                Save Profile
              </button>
            </div>
          </form>
        </div>
      </Dialog>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black text-mochi-text">Account & Profile</h1>
          <p className="text-xs text-mochi-text-muted font-medium">Manage membership, security, & Mochi companion</p>
        </div>
        <span className="mochi-badge bg-mochi-primary/15 text-mochi-primary font-extrabold text-xs flex items-center gap-1 border border-mochi-primary/30">
          <Crown className="w-3.5 h-3.5 fill-amber-400 text-amber-500" /> Mochi Pro
        </span>
      </div>

      {/* Signature Mochi Brand Hero Card */}
      <motion.div
        variants={itemVariants}
        className="relative overflow-hidden rounded-3xl bg-gradient-mochi p-6 text-white shadow-xl"
      >
        {/* Soft background glow */}
        <div className="absolute top-0 right-0 w-44 h-44 bg-white/15 rounded-full blur-2xl -translate-y-1/3 translate-x-1/3 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-black/10 rounded-full blur-xl translate-y-1/2 -translate-x-1/2 pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-5 sm:gap-6">
          <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-5 text-center sm:text-left">
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-white/20 backdrop-blur-md border-4 border-white/40 flex items-center justify-center text-4xl font-black shadow-inner overflow-hidden">
                {user.avatar ? (
                  <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                ) : (
                  <span>{user.name.charAt(0).toUpperCase()}</span>
                )}
              </div>
              <button
                onClick={() => setShowEditModal(true)}
                className="absolute bottom-0 right-0 p-2 bg-white text-mochi-primary rounded-full shadow-md hover:scale-105 active:scale-95 transition-transform"
                aria-label="Edit avatar"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>
            </div>

            <div>
              <div className="flex items-center justify-center sm:justify-start gap-2 mb-0.5">
                <h2 className="text-2xl font-black">{user.name}</h2>
                <Crown className="w-5 h-5 fill-amber-300 text-amber-200 shrink-0" />
              </div>
              <p className="text-white/90 text-xs font-bold mb-2.5">{user.email}</p>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-black/20 rounded-full text-[11px] font-extrabold backdrop-blur-md">
                <Calendar className="w-3.5 h-3.5 text-amber-200" />
                Member since {formatDate(user.createdAt)}
              </div>
            </div>
          </div>

          {/* Interactive Mascot Companion badge inside hero */}
          <div className="flex flex-col items-center justify-center bg-white/20 backdrop-blur-md border border-white/30 rounded-2xl p-3 px-5 shadow-xs">
            <Mascot mood={selectedMood} size="md" animate={true} />
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-white mt-1">
              Mochi Buddy
            </span>
          </div>
        </div>
      </motion.div>

      {/* Financial Companion Customizer Widget */}
      <motion.section aria-label="Mochi Companion" variants={itemVariants} className="mochi-card p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-mochi-primary" />
            <h3 className="text-sm font-bold text-mochi-text">Mochi Mascot Customizer</h3>
          </div>
          <span className="text-[10px] font-bold text-mochi-text-muted bg-mochi-surface-alt px-2.5 py-0.5 rounded-full border border-mochi-border">
            Interactive Avatar
          </span>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-5">
          <div className="w-24 h-24 rounded-3xl bg-mochi-surface-alt border-2 border-mochi-primary/30 flex flex-col items-center justify-center p-2 shadow-xs shrink-0">
            <GroupMascotSVG animal={selectedMascot} outfit={selectedOutfit} size="md" />
          </div>

          <div className="flex-1 space-y-3 w-full">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-mochi-text-muted mb-1.5">Mascot Animal</p>
              <div className="flex gap-2 flex-wrap">
                {(['cat', 'rabbit', 'fox', 'bear', 'shiba', 'panda'] as const).map((m) => (
                  <button
                    key={m}
                    onClick={() => setSelectedMascot(m)}
                    className={`px-3 py-1 rounded-xl text-xs font-extrabold capitalize transition-all ${
                      selectedMascot === m
                        ? 'bg-mochi-primary text-white shadow-xs scale-105'
                        : 'bg-mochi-surface-alt text-mochi-text-muted hover:text-mochi-text border border-mochi-border'
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-mochi-text-muted mb-1.5">Outfit & Outfit Theme</p>
              <div className="flex gap-2">
                {(['casual', 'beach', 'winter'] as const).map((o) => (
                  <button
                    key={o}
                    onClick={() => setSelectedOutfit(o)}
                    className={`px-3.5 py-1 rounded-xl text-xs font-bold capitalize transition-all ${
                      selectedOutfit === o
                        ? 'bg-mochi-secondary text-white shadow-xs'
                        : 'bg-mochi-surface-alt text-mochi-text-muted hover:text-mochi-text border border-mochi-border'
                    }`}
                  >
                    {o}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </motion.section>

      {/* Quick Statistics Grid */}
      <motion.section aria-label="Quick Statistics" variants={itemVariants}>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="mochi-card flex flex-col justify-center items-center p-4 text-center">
            <div className="w-10 h-10 rounded-2xl bg-mochi-primary/10 text-mochi-primary flex items-center justify-center mb-2">
              <Activity className="w-5 h-5" />
            </div>
            <p className="text-xl font-black text-mochi-text">{totalTransactions}</p>
            <p className="text-[10px] font-bold text-mochi-text-muted uppercase tracking-wider">Logged Txns</p>
          </div>

          <div className="mochi-card flex flex-col justify-center items-center p-4 text-center">
            <div className="w-10 h-10 rounded-2xl bg-sky-500/10 text-sky-500 flex items-center justify-center mb-2">
              <Calendar className="w-5 h-5" />
            </div>
            <p className="text-xl font-black text-mochi-text">{daysActive}</p>
            <p className="text-[10px] font-bold text-mochi-text-muted uppercase tracking-wider">Days Active</p>
          </div>

          <div className="mochi-card flex flex-col justify-center items-center p-4 text-center">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center mb-2">
              <Award className="w-5 h-5 text-amber-500" />
            </div>
            <p className="text-xl font-black text-mochi-text">
              {unlockedAchievements}<span className="text-xs text-mochi-text-muted font-normal">/{totalAchievements}</span>
            </p>
            <p className="text-[10px] font-bold text-mochi-text-muted uppercase tracking-wider">Badges</p>
          </div>

          <div className="mochi-card flex flex-col justify-center items-center p-4 text-center">
            <div className="w-10 h-10 rounded-2xl bg-orange-500/10 text-orange-500 flex items-center justify-center mb-2">
              <Flame className="w-5 h-5 text-orange-500" />
            </div>
            <p className="text-xl font-black text-mochi-text">{longestStreak} Days</p>
            <p className="text-[10px] font-bold text-mochi-text-muted uppercase tracking-wider">Longest Streak</p>
          </div>
        </div>
      </motion.section>

      {/* Security & Data Backup Center */}
      <motion.section aria-label="Security and Data Center" variants={itemVariants} className="mochi-card p-5 space-y-4">
        <h3 className="text-sm font-bold text-mochi-text flex items-center gap-2">
          <Shield className="w-4 h-4 text-mochi-primary" /> Security & Data Center
        </h3>

        <div className="space-y-3">
          {/* Biometric Toggle */}
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-mochi-surface-alt border border-mochi-border/50">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center">
                <Lock className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-mochi-text">App Biometric Lock</p>
                <p className="text-[10px] text-mochi-text-muted">Require Face ID / PIN code on launch</p>
              </div>
            </div>
            <button
              onClick={() => setBiometricEnabled((v) => !v)}
              className={`w-11 h-6 rounded-full transition-colors relative p-0.5 ${
                biometricEnabled ? 'bg-mochi-primary' : 'bg-mochi-border'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform ${
                  biometricEnabled ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* JSON Export Backup */}
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-mochi-surface-alt border border-mochi-border/50">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
                <Download className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-mochi-text">Export Full App Backup (.JSON)</p>
                <p className="text-[10px] text-mochi-text-muted">Save transactions, wallets, & budgets offline</p>
              </div>
            </div>
            <button
              onClick={handleExportJSON}
              className="mochi-btn-secondary text-xs py-1.5 px-3 flex items-center gap-1 shadow-xs"
            >
              {showBackupSuccess ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> : <Download className="w-3.5 h-3.5" />}
              <span>{showBackupSuccess ? 'Exported!' : 'Export'}</span>
            </button>
          </div>
        </div>
      </motion.section>

      {/* Account Settings & Quick Links */}
      <motion.section aria-label="Settings and Links" variants={itemVariants}>
        <div className="mochi-card overflow-hidden divide-y divide-mochi-border/60">
          <Link to="/settings" className="flex items-center gap-3 p-4 hover:bg-mochi-surface-alt transition-colors">
            <div className="p-2 bg-mochi-primary/10 text-mochi-primary rounded-xl">
              <Settings className="w-4 h-4" />
            </div>
            <span className="flex-1 text-xs font-bold text-mochi-text">App Preferences & Currency</span>
            <ChevronRight className="w-4 h-4 text-mochi-text-muted" />
          </Link>

          <button
            onClick={() => setShowLogoutDialog(true)}
            className="w-full flex items-center gap-3 p-4 hover:bg-rose-500/5 transition-colors text-left"
          >
            <div className="p-2 bg-rose-500/10 text-rose-500 rounded-xl">
              <LogOut className="w-4 h-4" />
            </div>
            <span className="flex-1 text-xs font-bold text-rose-500">Log Out</span>
          </button>
        </div>
      </motion.section>

      {/* Logout Dialog */}
      <Dialog isOpen={showLogoutDialog} onClose={() => setShowLogoutDialog(false)} size="sm">
        <div className="space-y-4 text-center py-2">
          <Mascot mood="sad" size="md" animate={false} />
          <h3 className="text-base font-bold text-mochi-text">Log Out of Mochi Money?</h3>
          <p className="text-xs text-mochi-text-muted">You will need to sign in again to access your data.</p>
          <div className="flex gap-3 pt-2">
            <button
              onClick={() => setShowLogoutDialog(false)}
              className="mochi-btn-secondary text-xs flex-1 py-2.5"
            >
              Cancel
            </button>
            <button
              onClick={handleLogout}
              className="bg-rose-500 hover:bg-rose-600 text-white font-extrabold text-xs flex-1 py-2.5 rounded-2xl shadow-md"
            >
              Log Out
            </button>
          </div>
        </div>
      </Dialog>
    </motion.div>
  )
}
