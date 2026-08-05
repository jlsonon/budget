import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Plus,
  Star,
  Edit2,
  Pause,
  Play,
  Trash2,
  RefreshCw,
  Bell,
  BellOff
} from 'lucide-react'
import { useAppStore } from '@/store/appStore'
import { Subscription, SubscriptionFrequency } from '@/types'
import Mascot from '@/components/ui/Mascot'
import Dialog from '@/components/ui/Dialog'
import { formatCurrency, cn } from '@/lib/utils'

// Mock Data
const MOCK_SUBSCRIPTIONS: Subscription[] = [
  {
    id: '1',
    userId: 'user-1',
    name: 'Netflix',
    amount: 549,
    frequency: 'monthly',
    nextBilling: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    category: 'Entertainment',
    status: 'active',
    usageRating: 5,
    cancelReminderDays: 3,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    userId: 'user-1',
    name: 'Spotify',
    amount: 149,
    frequency: 'monthly',
    nextBilling: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
    category: 'Music',
    status: 'active',
    usageRating: 4,
    cancelReminderDays: 3,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '3',
    userId: 'user-1',
    name: 'iCloud+',
    amount: 149,
    frequency: 'monthly',
    nextBilling: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    category: 'Storage',
    status: 'active',
    usageRating: 5,
    cancelReminderDays: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '4',
    userId: 'user-1',
    name: 'Gym Membership',
    amount: 1500,
    frequency: 'monthly',
    nextBilling: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString(),
    category: 'Health',
    status: 'paused',
    usageRating: 2,
    cancelReminderDays: 5,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
]

export default function SubscriptionsPage() {
  const { subscriptions, setSubscriptions, addSubscription, updateSubscription, deleteSubscription } = useAppStore()

  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  
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

  // Initialize mock data
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true)
        // Simulate network delay
        await new Promise((resolve) => setTimeout(resolve, 800))
        if (subscriptions.length === 0) {
          setSubscriptions(MOCK_SUBSCRIPTIONS)
        }
      } catch (err) {
        setError('Failed to load subscriptions. Please try again.')
      } finally {
        setIsLoading(false)
      }
    }
    loadData()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

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

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name || !formData.amount) return

    const newSub: Subscription = {
      id: crypto.randomUUID(),
      userId: 'user-1',
      name: formData.name,
      amount: Number(formData.amount),
      frequency: formData.frequency as SubscriptionFrequency,
      category: formData.category || 'Other',
      nextBilling: new Date(formData.nextBilling || Date.now()).toISOString(),
      status: formData.status as any || 'active',
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
      case 'active': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
      case 'trial': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
      case 'paused': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
      case 'cancelled': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
    }
  }
  
  const getValueColor = (rating?: number) => {
    if (!rating) return 'bg-gray-300 dark:bg-gray-700'
    if (rating >= 4) return 'bg-green-500'
    if (rating >= 3) return 'bg-yellow-500'
    return 'bg-red-500'
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

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-4 text-center">
        <Mascot mood="sad" className="w-48 h-48 mb-6" />
        <h2 className="text-2xl font-bold text-mochi-text mb-2">Oops! Something went wrong</h2>
        <p className="text-mochi-text/70 mb-6 max-w-md">{error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="mochi-btn-primary inline-flex items-center"
        >
          <RefreshCw className="w-5 h-5 mr-2" />
          Try Again
        </button>
      </div>
    )
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-mochi-text">Subscriptions</h1>
          <p className="text-mochi-text/70 mt-1">Manage your recurring payments</p>
        </div>
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="mochi-btn-primary whitespace-nowrap hidden sm:inline-flex items-center"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add Subscription
        </button>
      </div>

      {/* Summary Cards */}
      <section aria-label="Subscription Summary" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="mochi-card p-5 bg-gradient-to-br from-mochi-surface to-mochi-surface/80 border-t-4 border-t-blue-500">
          <div className="text-sm font-medium text-mochi-text/70 mb-1">Monthly Cost</div>
          <div className="text-2xl font-bold text-mochi-text">{formatCurrency(monthlyCost)}</div>
        </div>
        <div className="mochi-card p-5 bg-gradient-to-br from-mochi-surface to-mochi-surface/80 border-t-4 border-t-purple-500">
          <div className="text-sm font-medium text-mochi-text/70 mb-1">Annual Cost</div>
          <div className="text-2xl font-bold text-mochi-text">{formatCurrency(annualCost)}</div>
        </div>
        <div className="mochi-card p-5 bg-gradient-to-br from-mochi-surface to-mochi-surface/80 border-t-4 border-t-orange-500">
          <div className="text-sm font-medium text-mochi-text/70 mb-1">Next Renewal</div>
          <div className="text-xl font-bold text-mochi-text mt-1">
            {nextRenewalDate ? nextRenewalDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : 'None'}
          </div>
        </div>
        <div className="mochi-card p-5 bg-gradient-to-br from-mochi-surface to-mochi-surface/80 border-t-4 border-t-green-500">
          <div className="text-sm font-medium text-mochi-text/70 mb-1">Active Subscriptions</div>
          <div className="text-2xl font-bold text-mochi-text">{activeSubscriptions.length}</div>
        </div>
      </section>

      {/* Main Content */}
      <section aria-label="Your Subscriptions">
        {subscriptions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Mascot mood="excited" className="w-56 h-56 mb-6 drop-shadow-xl" />
            <h3 className="text-2xl font-bold text-mochi-text mb-2">No subscriptions tracked yet!</h3>
            <p className="text-mochi-text/70 mb-8 max-w-md">
              Add your streaming, music, and app subscriptions to see where your money goes every month.
            </p>
            <button 
              onClick={() => setIsAddModalOpen(true)}
              className="mochi-btn-primary"
            >
              <Plus className="w-5 h-5 mr-2" />
              Add Your First Subscription
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {subscriptions.map((sub) => (
                <motion.div
                  key={sub.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="mochi-card relative group overflow-hidden flex flex-col"
                >
                  {/* Value Indicator Bar */}
                  <div className={cn("absolute top-0 left-0 w-full h-1.5", getValueColor(sub.usageRating))} />
                  
                  <div className="p-5 flex-1">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 rounded-2xl bg-mochi-surface-hover flex items-center justify-center text-2xl shadow-sm border border-mochi-border">
                          {/* Fallback to first letter if no specific icon */}
                          <span className="font-bold text-mochi-primary">{sub.name.charAt(0)}</span>
                        </div>
                        <div>
                          <h3 className="font-bold text-mochi-text text-lg">{sub.name}</h3>
                          <div className="flex items-center space-x-2 mt-0.5">
                            <span className={cn("text-xs font-medium px-2 py-0.5 rounded-full capitalize", getStatusColor(sub.status))}>
                              {sub.status}
                            </span>
                            <span className="text-xs text-mochi-text/50 capitalize">• {sub.category}</span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Mobile menu could go here, but for now we use hover actions below */}
                    </div>

                    <div className="flex justify-between items-end mb-4">
                      <div>
                        <div className="text-2xl font-bold text-mochi-text">
                          {formatCurrency(sub.amount)}
                        </div>
                        <div className="text-sm text-mochi-text/60">
                          per {sub.frequency.replace('ly', '')}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium text-mochi-text/80">Next bill</div>
                        <div className="text-sm text-mochi-text/60">
                          {new Date(sub.nextBilling).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                        </div>
                      </div>
                    </div>
                    
                    <div className="pt-4 border-t border-mochi-border flex items-center justify-between">
                      <div className="flex items-center space-x-1" title="Usage Rating">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            onClick={() => setRating(sub.id, star)}
                            className="focus:outline-none transition-transform hover:scale-110 p-0.5"
                          >
                            <Star
                              className={cn(
                                "w-4 h-4",
                                (sub.usageRating || 0) >= star
                                  ? "fill-yellow-400 text-yellow-400"
                                  : "text-mochi-border hover:text-yellow-200"
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
                            ? "text-blue-500 bg-blue-50 dark:bg-blue-900/20" 
                            : "text-mochi-text/40 hover:bg-mochi-surface-hover"
                        )}
                        title={sub.cancelReminderDays > 0 ? "Reminder ON" : "Reminder OFF"}
                      >
                        {sub.cancelReminderDays > 0 ? <Bell className="w-4 h-4" /> : <BellOff className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  
                  {/* Hover/Tap Action Overlay */}
                  <div className="absolute inset-x-0 bottom-0 translate-y-full group-hover:translate-y-0 transition-transform duration-200 ease-in-out bg-mochi-surface/95 backdrop-blur-sm border-t border-mochi-border p-3 flex justify-around">
                    <button 
                      onClick={() => toggleStatus(sub.id, sub.status)}
                      className="p-2 text-mochi-text hover:text-mochi-primary rounded-full hover:bg-mochi-primary/10 transition-colors"
                      title={sub.status === 'paused' ? 'Resume' : 'Pause'}
                    >
                      {sub.status === 'paused' ? <Play className="w-5 h-5" /> : <Pause className="w-5 h-5" />}
                    </button>
                    <button 
                      className="p-2 text-mochi-text hover:text-blue-500 rounded-full hover:bg-blue-500/10 transition-colors"
                      title="Edit"
                    >
                      <Edit2 className="w-5 h-5" />
                    </button>
                    <button 
                      onClick={() => deleteSubscription(sub.id)}
                      className="p-2 text-mochi-text hover:text-red-500 rounded-full hover:bg-red-500/10 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-5 h-5" />
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

      {/* Add Subscription Dialog */}
      <Dialog
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add Subscription"
      >
        <form onSubmit={handleAddSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-mochi-text/70 mb-1">Service Name</label>
            <input
              type="text"
              required
              className="mochi-input w-full"
              placeholder="e.g. Netflix, Spotify"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-mochi-text/70 mb-1">Amount</label>
              <input
                type="number"
                required
                min="0"
                step="0.01"
                className="mochi-input w-full"
                placeholder="0.00"
                value={formData.amount || ''}
                onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-mochi-text/70 mb-1">Frequency</label>
              <select
                className="mochi-input w-full"
                value={formData.frequency}
                onChange={(e) => setFormData({ ...formData, frequency: e.target.value as SubscriptionFrequency })}
              >
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="quarterly">Quarterly</option>
                <option value="biannual">Biannual</option>
                <option value="annual">Annual</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-mochi-text/70 mb-1">Next Billing Date</label>
              <input
                type="date"
                required
                className="mochi-input w-full"
                value={formData.nextBilling}
                onChange={(e) => setFormData({ ...formData, nextBilling: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-mochi-text/70 mb-1">Category</label>
              <select
                className="mochi-input w-full"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              >
                <option value="Entertainment">Entertainment</option>
                <option value="Music">Music</option>
                <option value="Software">Software</option>
                <option value="Storage">Storage</option>
                <option value="Health">Health</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-mochi-text/70 mb-1">Value/Usage Rating</label>
            <div className="flex items-center space-x-2 bg-mochi-surface-hover p-2 rounded-xl">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setFormData({ ...formData, usageRating: star })}
                  className="focus:outline-none transition-transform hover:scale-110 p-1"
                >
                  <Star
                    className={cn(
                      "w-6 h-6",
                      (formData.usageRating || 0) >= star
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-mochi-border hover:text-yellow-200"
                    )}
                  />
                </button>
              ))}
              <span className="text-xs text-mochi-text/50 ml-2">
                {formData.usageRating === 5 ? 'Essential' : formData.usageRating === 1 ? 'Cancel soon' : ''}
              </span>
            </div>
          </div>

          <div className="pt-4 flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="px-4 py-2 rounded-xl font-medium text-mochi-text hover:bg-mochi-surface-hover transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="mochi-btn-primary"
            >
              Save Subscription
            </button>
          </div>
        </form>
      </Dialog>
    </motion.div>
  )
}
