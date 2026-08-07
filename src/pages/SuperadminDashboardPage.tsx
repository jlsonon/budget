import { useState, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  Users,
  Shield,
  Crown,
  Search,
  DollarSign,
  RefreshCw,
  Lock,
} from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { formatCurrency, formatDate } from '@/lib/utils'
import type { UserProfile } from '@/types'
import { collection, onSnapshot, doc, updateDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'

const SUPERADMIN_EMAILS = ['jlsonon12@gmail.com', 'superadmin@mochimoney.app', 'owner@mochimoney.app']

export default function SuperadminDashboardPage() {
  const { user } = useAuthStore()
  const [usersList, setUsersList] = useState<UserProfile[]>(() => (user ? [user] : []))
  const [searchQuery, setSearchQuery] = useState('')
  const [tierFilter, setTierFilter] = useState<'all' | 'free' | 'pro'>('all')
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Verify superadmin privilege
  const isSuperadmin =
    user?.role === 'superadmin' ||
    (user?.email && SUPERADMIN_EMAILS.includes(user.email.toLowerCase()))

  // Realtime Firestore sync for users
  useEffect(() => {
    if (!isSuperadmin) return
    try {
      const unsub = onSnapshot(collection(db, 'users'), (snapshot) => {
        const liveUsers: UserProfile[] = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...(doc.data() as any),
        }))
        if (liveUsers.length > 0) {
          setUsersList(liveUsers)
        } else if (user) {
          setUsersList([user])
        }
      })
      return () => unsub()
    } catch (e) {
      console.warn('Firestore superadmin user sync offline fallback:', e)
    }
  }, [isSuperadmin, user])

  const filteredUsers = useMemo(() => {
    return usersList.filter((u) => {
      const matchesSearch =
        u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.email.toLowerCase().includes(searchQuery.toLowerCase())
      const isPro = u.subscriptionTier === 'pro' || u.paidAmount === 199
      const matchesTier =
        tierFilter === 'all' ||
        (tierFilter === 'pro' && isPro) ||
        (tierFilter === 'free' && !isPro)
      return matchesSearch && matchesTier
    })
  }, [usersList, searchQuery, tierFilter])

  // Key metrics
  const totalUsersCount = usersList.length
  const proUsersCount = usersList.filter((u) => u.subscriptionTier === 'pro' || u.paidAmount === 199).length
  const freeUsersCount = totalUsersCount - proUsersCount
  const totalRevenue = proUsersCount * 199
  const conversionRate = totalUsersCount > 0 ? ((proUsersCount / totalUsersCount) * 100).toFixed(1) : '0.0'

  const handleToggleTier = async (targetUser: UserProfile) => {
    const isPro = targetUser.subscriptionTier === 'pro'
    const newTier = isPro ? 'free' : 'pro'
    const newStatus = isPro ? 'free' : 'active'
    const newAmount = isPro ? 0 : 199
    const newPaidAt = isPro ? undefined : new Date().toISOString()

    setUsersList((prev) =>
      prev.map((u) =>
        u.id === targetUser.id
          ? {
              ...u,
              subscriptionTier: newTier,
              subscriptionStatus: newStatus,
              paidAmount: newAmount,
              paidAt: newPaidAt,
            }
          : u
      )
    )

    try {
      const userRef = doc(db, 'users', targetUser.id)
      await updateDoc(userRef, {
        subscriptionTier: newTier,
        subscriptionStatus: newStatus,
        paidAmount: newAmount,
        paidAt: newPaidAt,
        updatedAt: new Date().toISOString(),
      })
    } catch (err) {
      console.warn('Failed to update user tier in Firestore:', err)
    }
  }

  if (!isSuperadmin) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
        <div className="w-16 h-16 bg-rose-500/10 text-rose-500 rounded-full flex items-center justify-center border border-rose-500/20 shadow-md">
          <Lock className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-black text-mochi-text">Superadmin Access Restricted</h2>
        <p className="text-sm text-mochi-text-muted max-w-sm">
          You do not have permission to view the Superadmin Control Panel. Log in with an owner or superadmin account.
        </p>
      </div>
    )
  }

  return (
    <motion.div
      className="space-y-6 pb-20 md:pb-8"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      role="main"
      aria-label="Superadmin Dashboard"
    >
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="mochi-badge mochi-badge-primary uppercase text-[10px] font-black tracking-wider flex items-center gap-1">
              <Shield className="w-3 h-3 text-mochi-primary" /> Superadmin Console
            </span>
            <span className="mochi-badge mochi-badge-success text-[10px] font-bold">
              Live Realtime Firestore Sync
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-mochi-text mt-1">
            User Management & ₱199 Subscriptions
          </h1>
          <p className="text-xs sm:text-sm text-mochi-text-secondary mt-0.5">
            Monitor registered users, track ₱199 one-time lifetime payment subscriptions, and manage access privileges.
          </p>
        </div>

        <button
          onClick={() => {
            setIsRefreshing(true)
            setTimeout(() => setIsRefreshing(false), 800)
          }}
          className="mochi-btn-secondary text-xs flex items-center gap-1.5 py-2.5 px-4 shadow-xs"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* Overview Metrics Grid */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3.5" aria-label="Key Superadmin Metrics">
        {/* Total Users */}
        <div className="mochi-card p-4 flex items-center gap-3.5 bg-gradient-to-br from-mochi-surface to-mochi-surface-alt border-l-4 border-l-sky-500">
          <div className="w-11 h-11 rounded-2xl bg-sky-500/10 text-sky-600 dark:text-sky-400 flex items-center justify-center shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-mochi-text-muted uppercase tracking-wider">Total Users</p>
            <p className="text-xl font-black text-mochi-text">{totalUsersCount}</p>
          </div>
        </div>

        {/* Free Users */}
        <div className="mochi-card p-4 flex items-center gap-3.5 bg-gradient-to-br from-mochi-surface to-mochi-surface-alt border-l-4 border-l-slate-400">
          <div className="w-11 h-11 rounded-2xl bg-slate-500/10 text-slate-600 dark:text-slate-400 flex items-center justify-center shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-mochi-text-muted uppercase tracking-wider">Free Tier Users</p>
            <p className="text-xl font-black text-mochi-text">{freeUsersCount}</p>
          </div>
        </div>

        {/* Pro Lifetime ₱199 */}
        <div className="mochi-card p-4 flex items-center gap-3.5 bg-gradient-to-br from-mochi-surface to-mochi-surface-alt border-l-4 border-l-amber-500">
          <div className="w-11 h-11 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
            <Crown className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-mochi-text-muted uppercase tracking-wider">Pro ₱199 Paid</p>
            <p className="text-xl font-black text-amber-600 dark:text-amber-400">{proUsersCount}</p>
          </div>
        </div>

        {/* Total Revenue */}
        <div className="mochi-card p-4 flex items-center gap-3.5 bg-gradient-to-br from-mochi-surface to-mochi-surface-alt border-l-4 border-l-emerald-500">
          <div className="w-11 h-11 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <DollarSign className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-mochi-text-muted uppercase tracking-wider">Total Revenue</p>
            <p className="text-xl font-black text-emerald-600 dark:text-emerald-400">{formatCurrency(totalRevenue)}</p>
            <span className="text-[10px] font-semibold text-mochi-text-muted block">{conversionRate}% conversion</span>
          </div>
        </div>
      </section>

      {/* User Search & Filter Control Bar */}
      <div className="mochi-card p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-mochi-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by user name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="mochi-input text-xs pl-9 w-full font-semibold"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 w-full sm:w-auto p-1 bg-mochi-surface-alt rounded-2xl border border-mochi-border">
          <button
            onClick={() => setTierFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              tierFilter === 'all'
                ? 'bg-gradient-mochi text-white shadow-xs'
                : 'text-mochi-text-secondary hover:text-mochi-text'
            }`}
          >
            All Users ({usersList.length})
          </button>
          <button
            onClick={() => setTierFilter('free')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              tierFilter === 'free'
                ? 'bg-slate-700 text-white shadow-xs'
                : 'text-mochi-text-secondary hover:text-mochi-text'
            }`}
          >
            Free ({freeUsersCount})
          </button>
          <button
            onClick={() => setTierFilter('pro')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              tierFilter === 'pro'
                ? 'bg-amber-500 text-white shadow-xs'
                : 'text-mochi-text-secondary hover:text-mochi-text'
            }`}
          >
            Pro ₱199 ({proUsersCount})
          </button>
        </div>
      </div>

      {/* Registered Users Table */}
      <div className="mochi-card p-0 overflow-hidden border border-mochi-border">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-mochi-surface-alt border-b border-mochi-border text-[11px] font-bold text-mochi-text-secondary uppercase tracking-wider">
                <th className="py-3 px-4">User Info</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Subscription Tier</th>
                <th className="py-3 px-4">Paid Amount</th>
                <th className="py-3 px-4">Joined Date</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-mochi-border/60 text-xs">
              {filteredUsers.map((u) => {
                const isPro = u.subscriptionTier === 'pro' || u.paidAmount === 199
                return (
                  <tr key={u.id} className="hover:bg-mochi-surface-alt/50 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-mochi p-0.5 shrink-0">
                          <div className="w-full h-full rounded-full bg-mochi-surface flex items-center justify-center font-black text-xs text-mochi-primary overflow-hidden">
                            {u.avatar ? (
                              <img src={u.avatar} alt={u.name} className="w-full h-full object-cover" />
                            ) : (
                              <span>{u.name.charAt(0).toUpperCase()}</span>
                            )}
                          </div>
                        </div>
                        <div>
                          <p className="font-bold text-mochi-text">{u.name}</p>
                          <p className="text-[11px] text-mochi-text-muted">{u.email}</p>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      {u.role === 'superadmin' ? (
                        <span className="mochi-badge bg-purple-500/15 text-purple-600 dark:text-purple-300 font-extrabold text-[10px] flex items-center gap-1 w-max">
                          <Shield className="w-3 h-3" /> Superadmin
                        </span>
                      ) : (
                        <span className="mochi-badge bg-slate-500/10 text-slate-600 dark:text-slate-400 font-bold text-[10px] w-max">
                          User
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-4">
                      {isPro ? (
                        <span className="mochi-badge bg-amber-500/15 text-amber-600 dark:text-amber-300 font-extrabold text-[10px] flex items-center gap-1 w-max">
                          <Crown className="w-3 h-3" /> Pro ₱199 Lifetime
                        </span>
                      ) : (
                        <span className="mochi-badge bg-slate-500/10 text-slate-600 dark:text-slate-400 font-bold text-[10px] w-max">
                          Free Tier
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-4 font-bold text-mochi-text">
                      {isPro ? (
                        <span className="text-emerald-600 dark:text-emerald-400">₱199.00</span>
                      ) : (
                        <span className="text-mochi-text-muted">₱0.00</span>
                      )}
                    </td>

                    <td className="py-3 px-4 text-mochi-text-muted text-[11px]">
                      {u.createdAt ? formatDate(u.createdAt) : 'Aug 2026'}
                    </td>

                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleToggleTier(u)}
                        className={`px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all ${
                          isPro
                            ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-500/20 border border-rose-500/30'
                            : 'bg-emerald-500 text-white shadow-xs hover:bg-emerald-600'
                        }`}
                      >
                        {isPro ? 'Revoke to Free' : 'Grant ₱199 Pro'}
                      </button>
                    </td>
                  </tr>
                )
              })}

              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-mochi-text-muted text-xs">
                    No users found matching "{searchQuery}".
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  )
}
