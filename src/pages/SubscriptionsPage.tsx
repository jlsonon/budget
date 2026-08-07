import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Plus,
  Star,
  Pause,
  Play,
  Trash2,
  Bell,
  BellOff,
  Sparkles,
  CreditCard,
} from 'lucide-react'
import { useAppStore, getUid } from '@/store/appStore'
import { Subscription, SubscriptionFrequency } from '@/types'
import Mascot from '@/components/ui/Mascot'
import Dialog from '@/components/ui/Dialog'
import { SubscriptionBrandLogo } from '@/components/ui/SubscriptionBrandLogo'
import { formatCurrency, cn, formatDate } from '@/lib/utils'

export interface PresetService {
  name: string
  category: string
  amount: number
  color: string
  frequency: SubscriptionFrequency
}

const PRESET_SERVICES: PresetService[] = [
  { name: 'Netflix', category: 'Entertainment', amount: 549, color: '#E50914', frequency: 'monthly' },
  { name: 'Spotify', category: 'Music', amount: 149, color: '#1DB954', frequency: 'monthly' },
  { name: 'YouTube Premium', category: 'Entertainment', amount: 159, color: '#FF0000', frequency: 'monthly' },
  { name: 'Apple Music', category: 'Music', amount: 139, color: '#FA243C', frequency: 'monthly' },
  { name: 'iCloud+', category: 'Storage', amount: 149, color: '#007AFF', frequency: 'monthly' },
  { name: 'Disney+', category: 'Entertainment', amount: 369, color: '#113CCF', frequency: 'monthly' },
  { name: 'ChatGPT Plus', category: 'Software', amount: 1150, color: '#10A37F', frequency: 'monthly' },
  { name: 'Amazon Prime', category: 'Entertainment', amount: 149, color: '#FF9900', frequency: 'monthly' },
  { name: 'Adobe Creative Cloud', category: 'Software', amount: 2800, color: '#FF0000', frequency: 'monthly' },
  { name: 'Figma Pro', category: 'Software', amount: 850, color: '#F24E1E', frequency: 'monthly' },
  { name: 'GitHub Pro', category: 'Software', amount: 250, color: '#24292E', frequency: 'monthly' },
  { name: 'Notion', category: 'Software', amount: 450, color: '#000000', frequency: 'monthly' },
  { name: 'Canva Pro', category: 'Software', amount: 490, color: '#00C4CC', frequency: 'monthly' },
  { name: 'Discord Nitro', category: 'Entertainment', amount: 299, color: '#5865F2', frequency: 'monthly' },
  { name: 'PlayStation Plus', category: 'Gaming', amount: 490, color: '#003791', frequency: 'monthly' },
  { name: 'Xbox Game Pass', category: 'Gaming', amount: 490, color: '#107C41', frequency: 'monthly' },
]

import PaywallModal from '@/components/modals/PaywallModal'
import { checkCanAddSubscription } from '@/lib/paywall'
import { useAuthStore } from '@/store/authStore'

export default function SubscriptionsPage() {
  const { user } = useAuthStore()
  const { subscriptions, addSubscription, updateSubscription, deleteSubscription } = useAppStore()
  
  const [isLoading, setIsLoading] = useState(true)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [showPaywall, setShowPaywall] = useState(false)
  
  // Form State
  const [formData, setFormData] = useState<Partial<Subscription>>({
    name: '',
    amount: 0,
    frequency: 'monthly',
    category: 'Entertainment',
    nextBilling: new Date().toISOString().split('T')[0],
    cancelReminderDays: 3,
    status: 'active',
    usageRating: 3
  })

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 400)
    return () => clearTimeout(timer)
  }, [])

  const filteredPresets = useMemo(() => {
    if (!formData.name) return PRESET_SERVICES.slice(0, 6)
    return PRESET_SERVICES.filter((s) =>
      s.name.toLowerCase().includes((formData.name || '').toLowerCase())
    )
  }, [formData.name])

  const selectPreset = (preset: PresetService) => {
    setFormData((prev) => ({
      ...prev,
      name: preset.name,
      amount: preset.amount,
      category: preset.category,
      frequency: preset.frequency,
    }))
  }

  // Calculations
  const activeSubscriptions = subscriptions.filter(s => s.status === 'active' || s.status === 'trial')
  
  const getMonthlyAmount = (sub: Subscription) => {
    switch (sub.frequency) {
      case 'weekly': return sub.amount * (52 / 12)
      case 'monthly': return sub.amount
      case 'quarterly': return sub.amount / 3
      case 'biannual': return sub.amount / 6
      case 'annual': return sub.amount / 12
      default: return sub.amount
    }
  }

  const monthlyCost = activeSubscriptions.reduce((acc, sub) => acc + getMonthlyAmount(sub), 0)
  const annualCost = monthlyCost * 12

  const nextRenewalDate = activeSubscriptions
    .map(s => new Date(s.nextBilling))
    .sort((a, b) => a.getTime() - b.getTime())[0]

  const topSubscription = useMemo(() => {
    if (activeSubscriptions.length === 0) return null
    return [...activeSubscriptions].sort((a, b) => getMonthlyAmount(b) - getMonthlyAmount(a))[0]
  }, [activeSubscriptions])

  const handleLogPayment = (sub: Subscription) => {
    const todayStr = new Date().toISOString().split('T')[0]
    
    // 1. Log transaction
    useAppStore.getState().addTransaction({
      id: `txn_sub_${Date.now()}`,
      userId: sub.userId || getUid(),
      type: 'expense',
      amount: sub.amount,
      currency: 'PHP',
      categoryId: 'subscriptions',
      merchant: sub.name,
      paymentMethod: 'cash',
      date: todayStr,
      notes: `Recurring subscription billing for ${sub.name}`,
      isFavorite: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })

    // 2. Advance next billing date by 1 month
    const nextDate = new Date(sub.nextBilling || Date.now())
    nextDate.setMonth(nextDate.getMonth() + 1)
    updateSubscription(sub.id, {
      nextBilling: nextDate.toISOString().split('T')[0],
      updatedAt: new Date().toISOString(),
    })
  }

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name || !formData.amount) return

    const newSub: Subscription = {
      id: crypto.randomUUID(),
      userId: getUid(),
      name: formData.name,
      amount: Number(formData.amount),
      frequency: (formData.frequency as SubscriptionFrequency) || 'monthly',
      category: formData.category || 'Other',
      nextBilling: new Date(formData.nextBilling || Date.now()).toISOString(),
      status: (formData.status as any) || 'active',
      usageRating: formData.usageRating || 3,
      cancelReminderDays: formData.cancelReminderDays || 3,
      notes: formData.notes,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    
    addSubscription(newSub)
    setIsAddModalOpen(false)
    setFormData({
      name: '',
      amount: 0,
      frequency: 'monthly',
      category: 'Entertainment',
      nextBilling: new Date().toISOString().split('T')[0],
      cancelReminderDays: 3,
      status: 'active',
      usageRating: 3
    })
  }

  const toggleStatus = (id: string, currentStatus: string) => {
    updateSubscription(id, {
      status: currentStatus === 'paused' ? 'active' : 'paused'
    })
  }
  
  const setRating = (id: string, rating: number) => {
    updateSubscription(id, { usageRating: rating })
  }

  const toggleReminder = (id: string, currentDays: number) => {
    updateSubscription(id, { cancelReminderDays: currentDays > 0 ? 0 : 3 })
  }

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'active': return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 font-bold'
      case 'trial': return 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400 font-bold'
      case 'paused': return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 font-bold'
      case 'cancelled': return 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400 font-bold'
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400 font-bold'
    }
  }
  
  const getValueColor = (rating?: number) => {
    if (!rating) return 'bg-gray-300 dark:bg-gray-700'
    if (rating >= 4) return 'bg-emerald-500'
    if (rating >= 3) return 'bg-amber-500'
    return 'bg-rose-500'
  }

  if (isLoading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
        <div className="flex justify-between items-center mb-8">
          <div className="mochi-skeleton h-10 w-48 rounded-md" />
          <div className="mochi-skeleton h-10 w-32 rounded-full" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="mochi-skeleton h-24 rounded-2xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="mochi-skeleton h-48 rounded-2xl" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8 pb-28"
    >
      <PaywallModal
        isOpen={showPaywall}
        onClose={() => setShowPaywall(false)}
        featureTitle="Unlock Unlimited Subscriptions"
        featureDescription="Free tier is limited to 2 active subscriptions. Upgrade to Pro ₱199.00 for unlimited recurring services & brand alerts!"
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-mochi-text flex items-center gap-2">
            Subscriptions & Services
          </h1>
          <p className="text-xs sm:text-sm text-mochi-text-secondary mt-1">
            Track recurring memberships, streaming, and software with brand icons & reminders
          </p>
        </div>
        <button 
          onClick={() => {
            if (!checkCanAddSubscription(user, subscriptions.length)) {
              setShowPaywall(true)
            } else {
              setIsAddModalOpen(true)
            }
          }}
          className="mochi-btn-primary whitespace-nowrap hidden sm:inline-flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Subscription
        </button>
      </div>

      {/* Summary Cards */}
      <section aria-label="Subscription Summary" className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        <div className="mochi-card p-4 bg-gradient-to-br from-mochi-surface to-mochi-surface/80 border-t-4 border-t-sky-500 shadow-xs">
          <div className="text-[10px] font-extrabold text-mochi-text-secondary uppercase tracking-wider mb-1">Monthly Spend</div>
          <div className="text-xl sm:text-2xl font-black text-sky-600 dark:text-sky-400">{formatCurrency(monthlyCost)}</div>
        </div>

        <div className="mochi-card p-4 bg-gradient-to-br from-mochi-surface to-mochi-surface/80 border-t-4 border-t-purple-500 shadow-xs">
          <div className="text-[10px] font-extrabold text-mochi-text-secondary uppercase tracking-wider mb-1">Annual Forecast</div>
          <div className="text-xl sm:text-2xl font-black text-purple-600 dark:text-purple-400">{formatCurrency(annualCost)}</div>
        </div>

        <div className="mochi-card p-4 bg-gradient-to-br from-mochi-surface to-mochi-surface/80 border-t-4 border-t-amber-500 shadow-xs">
          <div className="text-[10px] font-extrabold text-mochi-text-secondary uppercase tracking-wider mb-1">Next Renewal</div>
          <div className="text-lg sm:text-xl font-black text-amber-600 dark:text-amber-400 mt-0.5">
            {nextRenewalDate ? formatDate(nextRenewalDate) : 'None'}
          </div>
        </div>

        <div className="mochi-card p-4 bg-gradient-to-br from-mochi-surface to-mochi-surface/80 border-t-4 border-t-rose-500 shadow-xs">
          <div className="text-[10px] font-extrabold text-mochi-text-secondary uppercase tracking-wider mb-1">Top Recurring Bill</div>
          <div className="text-sm font-black text-rose-600 dark:text-rose-400 truncate mt-1">
            {topSubscription ? `${topSubscription.name} (${formatCurrency(topSubscription.amount)})` : 'None'}
          </div>
        </div>

        <div className="mochi-card p-4 bg-gradient-to-br from-mochi-surface to-mochi-surface/80 border-t-4 border-t-emerald-500 shadow-xs col-span-2 sm:col-span-1">
          <div className="text-[10px] font-extrabold text-mochi-text-secondary uppercase tracking-wider mb-1">Active Services</div>
          <div className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400">{activeSubscriptions.length}</div>
        </div>
      </section>

      {/* Main Content */}
      <section aria-label="Your Subscriptions">
        {subscriptions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Mascot mood="excited" size="lg" className="mb-4 drop-shadow-xl" />
            <h3 className="text-xl font-black text-mochi-text mb-2">No Subscriptions Tracked Yet</h3>
            <p className="text-mochi-text-secondary mb-6 max-w-md text-xs sm:text-sm">
              Keep your monthly recurring costs cozy and transparent! Choose popular brand presets like Netflix, Spotify, or ChatGPT.
            </p>
            <button 
              onClick={() => setIsAddModalOpen(true)}
              className="mochi-btn-primary px-5 py-3 text-xs flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Track First Subscription
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {subscriptions.map((sub) => (
                <motion.div
                  key={sub.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="mochi-card relative group overflow-hidden flex flex-col hover:border-mochi-primary/40 transition-all shadow-md"
                >
                  {/* Value Indicator Bar */}
                  <div className={cn("absolute top-0 left-0 w-full h-1.5", getValueColor(sub.usageRating))} />
                  
                  <div className="p-5 flex-1">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center space-x-3">
                        <SubscriptionBrandLogo name={sub.name} />
                        <div>
                          <h3 className="font-bold text-mochi-text text-base line-clamp-1">{sub.name}</h3>
                          <div className="flex items-center space-x-2 mt-0.5">
                            <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full capitalize", getStatusColor(sub.status))}>
                              {sub.status}
                            </span>
                            <span className="text-xs text-mochi-text-muted capitalize">{sub.category}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="font-black text-lg text-mochi-text">{formatCurrency(sub.amount)}</div>
                        <div className="text-[10px] font-bold text-mochi-text-muted uppercase">/{sub.frequency}</div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 my-3 p-2.5 rounded-2xl bg-mochi-surface-alt border border-mochi-border/60 text-xs">
                      <div>
                        <div className="text-[10px] font-bold text-mochi-text-muted uppercase">Monthly Cost</div>
                        <div className="font-bold text-mochi-text">{formatCurrency(getMonthlyAmount(sub))}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-[10px] font-bold text-mochi-text-muted uppercase">Next Renewal</div>
                        <div className="font-bold text-mochi-primary">
                          {formatDate(sub.nextBilling)}
                        </div>
                      </div>
                    </div>
                    
                    <div className="pt-3 border-t border-mochi-border/50 flex items-center justify-between">
                      <div className="flex items-center space-x-1" title="Usage Rating">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            onClick={() => setRating(sub.id, star)}
                            className="focus:outline-none transition-transform hover:scale-110 p-0.5"
                          >
                            <Star
                              className={cn(
                                "w-3.5 h-3.5",
                                (sub.usageRating || 0) >= star
                                  ? "fill-amber-400 text-amber-400"
                                  : "text-mochi-border hover:text-amber-200"
                              )}
                            />
                          </button>
                        ))}
                      </div>
                      
                      <button
                        onClick={() => toggleReminder(sub.id, sub.cancelReminderDays)}
                        className={cn(
                          "flex items-center justify-center p-1.5 rounded-full transition-colors",
                          sub.cancelReminderDays > 0 
                            ? "text-sky-500 bg-sky-500/10" 
                            : "text-mochi-text-muted hover:bg-mochi-surface-alt"
                        )}
                        title={sub.cancelReminderDays > 0 ? "Reminder ON" : "Reminder OFF"}
                      >
                        {sub.cancelReminderDays > 0 ? <Bell className="w-4 h-4" /> : <BellOff className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  
                  {/* Action Bar */}
                  <div className="border-t border-mochi-border/40 p-2 bg-mochi-surface-alt flex items-center justify-around gap-1">
                    <button 
                      onClick={() => handleLogPayment(sub)}
                      className="px-2.5 py-1 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 rounded-xl transition-colors flex items-center gap-1 text-xs font-black"
                      title="Log Renewal Payment"
                    >
                      <CreditCard className="w-3.5 h-3.5" />
                      <span>Pay / Log</span>
                    </button>

                    <button 
                      onClick={() => toggleStatus(sub.id, sub.status)}
                      className="p-1.5 text-mochi-text-secondary hover:text-mochi-primary rounded-xl hover:bg-mochi-surface transition-colors flex items-center gap-1 text-xs font-bold"
                      title={sub.status === 'paused' ? 'Resume' : 'Pause'}
                    >
                      {sub.status === 'paused' ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
                      <span>{sub.status === 'paused' ? 'Resume' : 'Pause'}</span>
                    </button>
                    <button 
                      onClick={() => deleteSubscription(sub.id)}
                      className="p-1.5 text-rose-500 hover:text-rose-600 rounded-xl hover:bg-rose-500/10 transition-colors flex items-center gap-1 text-xs font-bold"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>Delete</span>
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </section>

      {/* Floating Action Button for Mobile */}
      <button
        onClick={() => setIsAddModalOpen(true)}
        className="sm:hidden fixed bottom-20 right-6 w-14 h-14 bg-mochi-primary text-white rounded-full shadow-lg flex items-center justify-center hover:scale-105 transition-transform z-40"
      >
        <Plus className="w-6 h-6" />
      </button>

      {/* Add Subscription Dialog with Autocomplete & Presets */}
      <Dialog
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add Subscription"
        size="md"
      >
        <form onSubmit={handleAddSubmit} className="space-y-4 pt-1">
          {/* Autocomplete Quick Select Grid */}
          <div>
            <label className="block text-xs font-bold text-mochi-text-secondary mb-1.5 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-mochi-primary" />
              Quick Select Popular Presets:
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5 max-h-32 overflow-y-auto p-1 border border-mochi-border/60 rounded-2xl bg-mochi-surface-alt scrollbar-hide">
              {filteredPresets.map((preset) => (
                <button
                  key={preset.name}
                  type="button"
                  onClick={() => selectPreset(preset)}
                  className={cn(
                    'p-2 rounded-xl border text-center flex flex-col items-center justify-center gap-1 transition-all',
                    formData.name === preset.name
                      ? 'border-mochi-primary bg-mochi-primary/10 shadow-xs'
                      : 'border-mochi-border bg-mochi-surface hover:border-mochi-primary/30'
                  )}
                >
                  <SubscriptionBrandLogo name={preset.name} size="sm" />
                  <span className="text-[10px] font-bold text-mochi-text line-clamp-1">{preset.name}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-mochi-text-secondary mb-1">Service Name *</label>
            <input
              type="text"
              required
              className="mochi-input text-xs w-full font-bold"
              placeholder="e.g. Netflix, Spotify, ChatGPT..."
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-mochi-text-secondary mb-1">Amount (PHP) *</label>
              <input
                type="number"
                required
                min="0"
                step="0.01"
                className="mochi-input text-xs w-full font-bold"
                placeholder="549"
                value={formData.amount || ''}
                onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-mochi-text-secondary mb-1">Billing Frequency</label>
              <select
                className="mochi-input text-xs w-full font-bold"
                value={formData.frequency}
                onChange={(e) => setFormData({ ...formData, frequency: e.target.value as SubscriptionFrequency })}
              >
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="quarterly">Quarterly</option>
                <option value="annual">Annual</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-mochi-text-secondary mb-1">Next Renewal Date *</label>
              <input
                type="date"
                required
                className="mochi-input text-xs w-full font-bold"
                value={formData.nextBilling}
                onChange={(e) => setFormData({ ...formData, nextBilling: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-mochi-text-secondary mb-1">Category</label>
              <select
                className="mochi-input text-xs w-full font-semibold"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              >
                <option value="Entertainment">Entertainment</option>
                <option value="Music">Music</option>
                <option value="Software">Software</option>
                <option value="Storage">Storage</option>
                <option value="Health">Health</option>
                <option value="Gaming">Gaming</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-mochi-text-secondary mb-1">Value & Priority Rating</label>
            <div className="flex items-center space-x-2 bg-mochi-surface-alt p-2.5 rounded-2xl border border-mochi-border">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setFormData({ ...formData, usageRating: star })}
                  className="focus:outline-none transition-transform hover:scale-110 p-1"
                >
                  <Star
                    className={cn(
                      "w-5 h-5",
                      (formData.usageRating || 0) >= star
                        ? "fill-amber-400 text-amber-400"
                        : "text-mochi-border hover:text-amber-200"
                    )}
                  />
                </button>
              ))}
              <span className="text-xs font-bold text-mochi-text-secondary ml-2">
                {formData.usageRating === 5 ? 'Essential (5/5)' : formData.usageRating === 1 ? 'Cancel soon (1/5)' : `${formData.usageRating}/5`}
              </span>
            </div>
          </div>

          <div className="pt-2 flex gap-3">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="mochi-btn-secondary text-xs flex-1 py-2.5"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="mochi-btn-primary text-xs flex-1 py-2.5"
            >
              Save Subscription
            </button>
          </div>
        </form>
      </Dialog>
    </motion.div>
  )
}
