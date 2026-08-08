import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Plus,
  Pause,
  Play,
  Trash2,
  CreditCard,
  Calendar,
  ChevronLeft,
  ChevronRight,
  History,
  Filter,
} from 'lucide-react'
import { useAppStore, getUid } from '@/store/appStore'
import { Subscription, SubscriptionFrequency, SubscriptionPayment } from '@/types'
import Mascot from '@/components/ui/Mascot'
import Dialog from '@/components/ui/Dialog'
import { SubscriptionBrandLogo } from '@/components/ui/SubscriptionBrandLogo'
import { formatCurrency, cn, formatDate } from '@/lib/utils'
import PaywallModal from '@/components/modals/PaywallModal'
import { checkCanAddSubscription } from '@/lib/paywall'
import { useAuthStore } from '@/store/authStore'
import { useToastStore } from '@/store/toastStore'
import { exportToDeviceCalendar, triggerNativeDeviceNotification } from '@/lib/calendarExport'

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

const PRESET_BILLS: PresetService[] = [
  { name: 'Meralco Electricity', category: 'Utilities', amount: 3500, color: '#E65100', frequency: 'monthly' },
  { name: 'Maynilad Water', category: 'Utilities', amount: 650, color: '#0288D1', frequency: 'monthly' },
  { name: 'PLDT Home Fiber', category: 'Utilities', amount: 1699, color: '#D32F2F', frequency: 'monthly' },
  { name: 'Globe At Home', category: 'Utilities', amount: 1499, color: '#1976D2', frequency: 'monthly' },
  { name: 'Smart Postpaid', category: 'Utilities', amount: 999, color: '#388E3C', frequency: 'monthly' },
  { name: 'Converge ICT Fiber', category: 'Utilities', amount: 1500, color: '#E64A19', frequency: 'monthly' },
  { name: 'House / Condo Rent', category: 'Housing', amount: 12000, color: '#7B1FA2', frequency: 'monthly' },
  { name: 'PAG-IBIG / SSS / PhilHealth', category: 'Government', amount: 1500, color: '#00796B', frequency: 'monthly' },
]

const PRESET_INCOMES: PresetService[] = [
  { name: 'Monthly Salary', category: 'Income', amount: 35000, color: '#2E7D32', frequency: 'monthly' },
  { name: 'Freelance Retainer', category: 'Income', amount: 15000, color: '#00897B', frequency: 'monthly' },
  { name: 'Bi-Weekly Paycheck', category: 'Income', amount: 17500, color: '#43A047', frequency: 'weekly' },
  { name: 'Monthly Allowance', category: 'Income', amount: 5000, color: '#00ACC1', frequency: 'monthly' },
  { name: 'Store Revenue', category: 'Income', amount: 10000, color: '#8E24AA', frequency: 'monthly' },
]

export default function SubscriptionsPage() {
  const { user } = useAuthStore()
  const { subscriptions, wallets, addSubscription, updateSubscription, deleteSubscription } = useAppStore()

  const [isLoading, setIsLoading] = useState(true)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [showPaywall, setShowPaywall] = useState(false)
  const [payingSub, setPayingSub] = useState<Subscription | null>(null)
  const [selectedDetailsSub, setSelectedDetailsSub] = useState<Subscription | null>(null)
  const [payWalletId, setPayWalletId] = useState<string>('')
  const [filterDueThisWeek, setFilterDueThisWeek] = useState(false)

  // History Pagination State
  const [historyPage, setHistoryPage] = useState(1)
  const ITEMS_PER_PAGE = 5

  // Form State
  const [formData, setFormData] = useState<Partial<Subscription>>({
    name: '',
    amount: 0,
    frequency: 'monthly',
    category: 'Entertainment',
    itemType: 'subscription',
    syncToCalendar: true,
    nextBilling: new Date().toISOString().split('T')[0],
    cancelReminderDays: 3,
    status: 'active',
    usageRating: 3,
  })

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 400)
    return () => clearTimeout(timer)
  }, [])

  const currentPresetList = useMemo(() => {
    if (formData.itemType === 'bill') return PRESET_BILLS
    if (formData.itemType === 'income') return PRESET_INCOMES
    return PRESET_SERVICES
  }, [formData.itemType])

  const filteredPresets = useMemo(() => {
    if (!formData.name) return currentPresetList.slice(0, 6)
    return currentPresetList.filter((s) =>
      s.name.toLowerCase().includes((formData.name || '').toLowerCase())
    )
  }, [formData.name, currentPresetList])

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

  // Calculate Subscriptions Due This Week
  const dueThisWeekSubscriptions = useMemo(() => {
    const today = new Date()
    const weekFromNow = new Date()
    weekFromNow.setDate(today.getDate() + 7)

    return activeSubscriptions.filter((sub) => {
      if (!sub.nextBilling) return false
      const due = new Date(sub.nextBilling)
      return due >= today && due <= weekFromNow
    })
  }, [activeSubscriptions])

  const displayedSubscriptions = useMemo(() => {
    const digitalSubs = subscriptions.filter(
      (s) => s.itemType === 'subscription' || (!s.itemType && s.category !== 'Utilities' && s.category !== 'Income' && s.category !== 'Government' && s.category !== 'Housing')
    )
    if (filterDueThisWeek) {
      return dueThisWeekSubscriptions.filter(
        (s) => s.itemType === 'subscription' || (!s.itemType && s.category !== 'Utilities' && s.category !== 'Income' && s.category !== 'Government' && s.category !== 'Housing')
      )
    }
    return digitalSubs
  }, [subscriptions, filterDueThisWeek, dueThisWeekSubscriptions])

  const nextRenewalDate = activeSubscriptions
    .map((s) => new Date(s.nextBilling))
    .sort((a, b) => a.getTime() - b.getTime())[0]

  const topSubscription = useMemo(() => {
    if (activeSubscriptions.length === 0) return null
    return [...activeSubscriptions].sort((a, b) => getMonthlyAmount(b) - getMonthlyAmount(a))[0]
  }, [activeSubscriptions])

  const handleOpenLogPayModal = (sub: Subscription, e: React.MouseEvent) => {
    e.stopPropagation()
    setPayingSub(sub)
    const initialWallet = sub.walletId && wallets.some((w) => w.id === sub.walletId)
      ? sub.walletId
      : wallets[0]?.id || ''
    setPayWalletId(initialWallet)
  }

  const handleConfirmLogPayment = () => {
    if (!payingSub) return

    const selectedWallet = wallets.find((w) => w.id === payWalletId) || wallets[0]
    const todayStr = new Date().toISOString().split('T')[0]

    // 1. Record payment entry inside subscription
    const pmt: SubscriptionPayment = {
      id: crypto.randomUUID(),
      amount: payingSub.amount,
      date: todayStr,
      walletId: selectedWallet?.id,
      walletName: selectedWallet?.name || 'Wallet',
      notes: `Subscription renewal for ${payingSub.name}`,
    }

    const updatedPayments = [pmt, ...(payingSub.payments || [])]

    // 2. Log expense transaction against chosen wallet
    useAppStore.getState().addTransaction({
      id: `txn_sub_${Date.now()}`,
      userId: payingSub.userId || getUid(),
      type: 'expense',
      amount: payingSub.amount,
      currency: 'PHP',
      categoryId: 'subscriptions',
      walletId: selectedWallet?.id,
      merchant: payingSub.name,
      paymentMethod: selectedWallet?.type === 'credit_card' ? 'credit_card' : 'other',
      date: todayStr,
      notes: `Subscription payment for ${payingSub.name}`,
      isFavorite: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })

    // 3. Advance next billing date by 1 cycle
    const nextDate = new Date(payingSub.nextBilling || Date.now())
    if (payingSub.frequency === 'annual') {
      nextDate.setFullYear(nextDate.getFullYear() + 1)
    } else if (payingSub.frequency === 'quarterly') {
      nextDate.setMonth(nextDate.getMonth() + 3)
    } else if (payingSub.frequency === 'weekly') {
      nextDate.setDate(nextDate.getDate() + 7)
    } else {
      nextDate.setMonth(nextDate.getMonth() + 1)
    }

    updateSubscription(payingSub.id, {
      nextBilling: nextDate.toISOString().split('T')[0],
      payments: updatedPayments,
      updatedAt: new Date().toISOString(),
    })

    triggerNativeDeviceNotification(
      'Subscription Renewed',
      `Paid ${formatCurrency(payingSub.amount)} for ${payingSub.name} via ${selectedWallet?.name}`
    )

    useToastStore.getState().success(
      `Deducted ${formatCurrency(payingSub.amount)} from ${selectedWallet?.name || 'Wallet'} for ${payingSub.name}`,
      'Payment Logged!'
    )

    setPayingSub(null)
  }

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name || !formData.amount) return

    const itemType = formData.itemType || 'subscription'
    const newSub: Subscription = {
      id: crypto.randomUUID(),
      userId: getUid(),
      name: formData.name,
      amount: Number(formData.amount),
      frequency: (formData.frequency as SubscriptionFrequency) || 'monthly',
      category: formData.category || (itemType === 'bill' ? 'Utilities' : itemType === 'income' ? 'Income' : 'Entertainment'),
      itemType,
      syncToCalendar: formData.syncToCalendar ?? true,
      walletId: formData.walletId || wallets[0]?.id,
      nextBilling: new Date(formData.nextBilling || Date.now()).toISOString().split('T')[0],
      status: (formData.status as any) || 'active',
      usageRating: formData.usageRating || 3,
      cancelReminderDays: formData.cancelReminderDays || 3,
      payments: [],
      notes: formData.notes,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    addSubscription(newSub)

    if (formData.syncToCalendar) {
      exportToDeviceCalendar({
        title: `${itemType === 'income' ? 'Recurring Income' : itemType === 'bill' ? 'Recurring Bill' : 'Subscription'}: ${newSub.name}`,
        amount: newSub.amount,
        date: newSub.nextBilling,
        description: `${newSub.frequency} recurring ${itemType} payment for ${newSub.name}`,
      })
    }

    triggerNativeDeviceNotification(
      itemType === 'income' ? 'Recurring Income Tracked' : itemType === 'bill' ? 'Recurring Bill Tracked' : 'Subscription Tracked',
      `Added ${newSub.name} (${formatCurrency(newSub.amount)})`
    )

    setIsAddModalOpen(false)
    setFormData({
      name: '',
      amount: 0,
      frequency: 'monthly',
      category: 'Entertainment',
      itemType: 'subscription',
      syncToCalendar: true,
      nextBilling: new Date().toISOString().split('T')[0],
      cancelReminderDays: 3,
      status: 'active',
      usageRating: 3,
    })
  }

  const toggleStatus = (id: string, currentStatus: string, e: React.MouseEvent) => {
    e.stopPropagation()
    updateSubscription(id, {
      status: currentStatus === 'paused' ? 'active' : 'paused',
    })
  }


  const getStatusColor = (status: string) => {
    switch (status) {
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

  // Details Modal History Pagination
  const subPayments = selectedDetailsSub?.payments || []
  const totalSubHistoryPages = Math.ceil(subPayments.length / ITEMS_PER_PAGE) || 1
  const paginatedSubHistory = subPayments.slice(
    (historyPage - 1) * ITEMS_PER_PAGE,
    historyPage * ITEMS_PER_PAGE
  )

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
        featureDescription="Free tier is limited to 2 active subscriptions. Upgrade to Pro ₱299.00 for unlimited recurring services!"
      />

      {/* Log Payment Modal */}
      <Dialog
        isOpen={!!payingSub}
        onClose={() => setPayingSub(null)}
        title={`Confirm Payment for ${payingSub?.name || ''}`}
      >
        {payingSub && (
          <div className="space-y-4">
            <p className="text-xs text-mochi-text-secondary font-medium">
              This will deduct <strong className="text-mochi-text font-black">{formatCurrency(payingSub.amount)}</strong> and automatically advance next billing to the next cycle.
            </p>

            <div>
              <label className="block text-xs font-bold text-mochi-text-secondary mb-1">
                Select Wallet for Payment
              </label>
              <select
                value={payWalletId}
                onChange={(e) => setPayWalletId(e.target.value)}
                className="mochi-input text-xs w-full font-bold"
              >
                {wallets.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="pt-2 flex gap-3">
              <button
                type="button"
                onClick={() => setPayingSub(null)}
                className="mochi-btn-secondary text-xs flex-1 py-2.5 font-bold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmLogPayment}
                className="mochi-btn-primary text-xs flex-1 py-2.5 font-bold flex items-center justify-center gap-1"
              >
                <CreditCard className="w-4 h-4" /> Deduct & Log Payment
              </button>
            </div>
          </div>
        )}
      </Dialog>

      {/* Subscription Details & History Modal with 5-Item Pagination */}
      <Dialog
        isOpen={!!selectedDetailsSub}
        onClose={() => {
          setSelectedDetailsSub(null)
          setHistoryPage(1)
        }}
        title={`${selectedDetailsSub?.name || 'Subscription'} Details & History`}
      >
        {selectedDetailsSub && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 rounded-2xl bg-mochi-surface-alt border border-mochi-border">
              <SubscriptionBrandLogo name={selectedDetailsSub.name} />
              <div>
                <h4 className="text-sm font-black text-mochi-text">{selectedDetailsSub.name}</h4>
                <p className="text-xs text-mochi-text-muted font-bold">
                  {formatCurrency(selectedDetailsSub.amount)} / {selectedDetailsSub.frequency}
                </p>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-mochi-surface-alt/60 border border-mochi-border/60 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-mochi-text-muted font-medium">Assigned Payment Wallet:</span>
                <strong className="text-mochi-text font-bold">
                  {wallets.find((w) => w.id === selectedDetailsSub.walletId)?.name || 'Default Wallet'}
                </strong>
              </div>
              <div className="flex justify-between">
                <span className="text-mochi-text-muted font-medium">Next Billing Date:</span>
                <strong className="text-mochi-primary font-bold">{formatDate(selectedDetailsSub.nextBilling)}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-mochi-text-muted font-medium">Category:</span>
                <strong className="text-mochi-text font-bold">{selectedDetailsSub.category}</strong>
              </div>
            </div>

            <button
              onClick={() => {
                exportToDeviceCalendar({
                  title: `Subscription Renewal: ${selectedDetailsSub.name}`,
                  amount: selectedDetailsSub.amount,
                  date: selectedDetailsSub.nextBilling?.split('T')[0] || new Date().toISOString().split('T')[0],
                  description: `${selectedDetailsSub.frequency} subscription payment for ${selectedDetailsSub.name}`,
                })
                triggerNativeDeviceNotification(
                  'Calendar Event Downloaded',
                  `Exported iCal event for ${selectedDetailsSub.name}`
                )
              }}
              className="mochi-btn-secondary text-xs w-full py-2 px-3 flex items-center justify-center gap-1.5 font-bold"
            >
              <Calendar className="w-3.5 h-3.5 text-mochi-primary" /> Sync to Device Calendar
            </button>

            {/* History Table */}
            <div>
              <h4 className="text-xs font-bold text-mochi-text flex items-center gap-1.5 mb-2">
                <History className="w-4 h-4 text-mochi-primary" /> Payment History ({subPayments.length} records)
              </h4>

              {subPayments.length === 0 ? (
                <div className="p-4 rounded-xl bg-mochi-surface-alt/40 text-center text-xs text-mochi-text-muted font-medium">
                  No previous payments logged yet.
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="divide-y divide-mochi-border/40 border border-mochi-border/60 rounded-xl overflow-hidden">
                    {paginatedSubHistory.map((pmt: SubscriptionPayment) => (
                      <div key={pmt.id} className="p-2.5 flex items-center justify-between text-xs bg-mochi-surface">
                        <div>
                          <p className="font-bold text-mochi-text">{formatCurrency(pmt.amount)}</p>
                          <p className="text-[10px] text-mochi-text-muted">
                            {formatDate(pmt.date)} • {pmt.walletName || 'Wallet'}
                          </p>
                        </div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                          Renewed
                        </span>
                      </div>
                    ))}
                  </div>

                  {totalSubHistoryPages > 1 && (
                    <div className="flex items-center justify-between pt-2">
                      <span className="text-[11px] text-mochi-text-muted font-bold">
                        Page {historyPage} of {totalSubHistoryPages}
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setHistoryPage((p) => Math.max(1, p - 1))}
                          disabled={historyPage === 1}
                          className="p-1 rounded-lg border border-mochi-border hover:bg-mochi-surface-alt disabled:opacity-40"
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setHistoryPage((p) => Math.min(totalSubHistoryPages, p + 1))}
                          disabled={historyPage === totalSubHistoryPages}
                          className="p-1 rounded-lg border border-mochi-border hover:bg-mochi-surface-alt disabled:opacity-40"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </Dialog>

      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-black text-mochi-text">
          Subscriptions & Services
        </h1>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 w-full">
          <p className="text-xs sm:text-sm text-mochi-text-secondary font-semibold flex-1">
            Track recurring memberships, streaming, and software with brand icons & reminders
          </p>
          <div className="flex justify-end w-full sm:w-auto shrink-0">
            <button
              onClick={() => {
                if (!checkCanAddSubscription(user, subscriptions.length)) {
                  setShowPaywall(true)
                } else {
                  setIsAddModalOpen(true)
                }
              }}
              className="mochi-btn-primary whitespace-nowrap inline-flex items-center gap-2 font-bold text-xs sm:text-sm shadow-md cursor-pointer shrink-0 ml-auto"
            >
              <Plus className="w-4 h-4" />
              <span>Add Subscriptions</span>
            </button>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <section aria-label="Subscription Summary" className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        <div className="mochi-card p-4 bg-gradient-to-br from-mochi-surface to-mochi-surface/80 border-t-4 border-t-sky-500 shadow-xs">
          <div className="text-[10px] font-black text-mochi-text-secondary uppercase tracking-wider mb-1">Monthly Spend</div>
          <div className="text-xl sm:text-2xl font-black text-sky-600 dark:text-sky-400">{formatCurrency(monthlyCost)}</div>
        </div>

        <div className="mochi-card p-4 bg-gradient-to-br from-mochi-surface to-mochi-surface/80 border-t-4 border-t-purple-500 shadow-xs">
          <div className="text-[10px] font-black text-mochi-text-secondary uppercase tracking-wider mb-1">Annual Forecast</div>
          <div className="text-xl sm:text-2xl font-black text-purple-600 dark:text-purple-400">{formatCurrency(annualCost)}</div>
        </div>

        <div className="mochi-card p-4 bg-gradient-to-br from-mochi-surface to-mochi-surface/80 border-t-4 border-t-amber-500 shadow-xs">
          <div className="text-[10px] font-black text-mochi-text-secondary uppercase tracking-wider mb-1">Next Renewal</div>
          <div className="text-lg sm:text-xl font-black text-amber-600 dark:text-amber-400 mt-0.5">
            {nextRenewalDate ? formatDate(nextRenewalDate) : 'None'}
          </div>
        </div>

        <div className="mochi-card p-4 bg-gradient-to-br from-mochi-surface to-mochi-surface/80 border-t-4 border-t-rose-500 shadow-xs">
          <div className="text-[10px] font-black text-mochi-text-secondary uppercase tracking-wider mb-1">Top Recurring Bill</div>
          <div className="text-sm font-black text-rose-600 dark:text-rose-400 truncate mt-1">
            {topSubscription ? `${topSubscription.name} (${formatCurrency(topSubscription.amount)})` : 'None'}
          </div>
        </div>

        {/* REPLACED ACTIVE SERVICES CARD WITH DUE THIS WEEK CARD & FILTER TOGGLE */}
        <div
          onClick={() => setFilterDueThisWeek((prev) => !prev)}
          className={`mochi-card p-4 bg-gradient-to-br from-mochi-surface to-mochi-surface/80 border-t-4 border-t-emerald-500 shadow-xs cursor-pointer hover:scale-105 transition-transform ${
            filterDueThisWeek ? 'ring-2 ring-emerald-500' : ''
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <div className="text-[10px] font-black text-mochi-text-secondary uppercase tracking-wider">Due This Week</div>
            <Filter className={`w-3.5 h-3.5 ${filterDueThisWeek ? 'text-emerald-500' : 'text-mochi-text-muted'}`} />
          </div>
          <div className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400">
            {dueThisWeekSubscriptions.length}
          </div>
          <p className="text-[9px] text-mochi-text-muted font-bold mt-0.5">
            {filterDueThisWeek ? 'Showing Due This Week' : 'Click to filter'}
          </p>
        </div>
      </section>

      {/* Add Modal with Separate Subscriptions, Recurring Bills & Income Workflow */}
      <Dialog isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Track Recurring Bill, Income or Subscription">
        <form onSubmit={handleAddSubmit} className="space-y-4">
          {/* Type Segment Selector */}
          <div>
            <label className="block text-xs font-bold text-mochi-text-secondary mb-1.5">Recurring Type *</label>
            <div className="grid grid-cols-3 gap-1.5 p-1 bg-mochi-surface-alt rounded-2xl border border-mochi-border/60">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, itemType: 'subscription', category: 'Entertainment' })}
                className={`py-2 px-1 text-[11px] font-extrabold rounded-xl transition-all ${
                  (formData.itemType || 'subscription') === 'subscription'
                    ? 'bg-mochi-surface text-mochi-primary shadow-xs border border-mochi-primary/20'
                    : 'text-mochi-text-muted hover:text-mochi-text'
                }`}
              >
                Subscription
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, itemType: 'bill', category: 'Utilities' })}
                className={`py-2 px-1 text-[11px] font-extrabold rounded-xl transition-all ${
                  formData.itemType === 'bill'
                    ? 'bg-mochi-surface text-rose-500 shadow-xs border border-rose-500/20'
                    : 'text-mochi-text-muted hover:text-mochi-text'
                }`}
              >
                Recurring Bill
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, itemType: 'income', category: 'Income' })}
                className={`py-2 px-1 text-[11px] font-extrabold rounded-xl transition-all ${
                  formData.itemType === 'income'
                    ? 'bg-mochi-surface text-emerald-500 shadow-xs border border-emerald-500/20'
                    : 'text-mochi-text-muted hover:text-mochi-text'
                }`}
              >
                Recurring Income
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-mochi-text-secondary mb-1">
              {formData.itemType === 'income' ? 'Income / Payout Name *' : formData.itemType === 'bill' ? 'Bill / Provider Name *' : 'Service Name *'}
            </label>
            <input
              type="text"
              placeholder={formData.itemType === 'income' ? 'e.g. Monthly Salary, Retainer' : formData.itemType === 'bill' ? 'e.g. Meralco, Maynilad, PLDT, Rent' : 'e.g. Netflix, Spotify, Canva'}
              value={formData.name || ''}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="mochi-input text-xs w-full font-bold"
              required
            />
            {filteredPresets.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {filteredPresets.map((preset) => (
                  <button
                    key={preset.name}
                    type="button"
                    onClick={() => selectPreset(preset)}
                    className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-mochi-surface-alt border border-mochi-border/60 text-mochi-text hover:bg-mochi-primary/10 transition-colors"
                  >
                    + {preset.name} (₱{preset.amount.toLocaleString()})
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-mochi-text-secondary mb-1">Amount (PHP) *</label>
              <input
                type="number"
                placeholder="e.g. 1500"
                value={formData.amount || ''}
                onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
                className="mochi-input text-xs w-full font-bold"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-mochi-text-secondary mb-1">Frequency</label>
              <select
                value={formData.frequency}
                onChange={(e) => setFormData({ ...formData, frequency: e.target.value as SubscriptionFrequency })}
                className="mochi-input text-xs w-full font-semibold"
              >
                <option value="monthly">Monthly</option>
                <option value="annual">Annual</option>
                <option value="weekly">Weekly</option>
                <option value="quarterly">Quarterly</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-mochi-text-secondary mb-1">
                {formData.itemType === 'income' ? 'Deposit Into Wallet *' : 'Deduct From Wallet *'}
              </label>
              <select
                value={formData.walletId || wallets[0]?.id || ''}
                onChange={(e) => setFormData({ ...formData, walletId: e.target.value })}
                className="mochi-input text-xs w-full font-semibold"
                required
              >
                {wallets.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.name} ({w.type})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-mochi-text-secondary mb-1">Next Date *</label>
              <input
                type="date"
                value={formData.nextBilling}
                onChange={(e) => setFormData({ ...formData, nextBilling: e.target.value })}
                className="mochi-input text-xs w-full font-semibold"
                required
              />
            </div>
          </div>

          {/* Sync to Financial Calendar Toggle */}
          <div className="flex items-center gap-2 p-3 rounded-2xl bg-mochi-surface-alt/60 border border-mochi-border/60">
            <input
              type="checkbox"
              id="syncToCalendar"
              checked={formData.syncToCalendar ?? true}
              onChange={(e) => setFormData({ ...formData, syncToCalendar: e.target.checked })}
              className="w-4 h-4 rounded text-mochi-primary focus:ring-mochi-primary cursor-pointer"
            />
            <label htmlFor="syncToCalendar" className="text-xs font-bold text-mochi-text cursor-pointer">
              Sync event to Financial Calendar & Device Calendar
            </label>
          </div>

          <div className="pt-2 flex gap-3">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="mochi-btn-secondary text-xs flex-1 py-2.5 font-bold"
            >
              Cancel
            </button>
            <button type="submit" className="mochi-btn-primary text-xs flex-1 py-2.5 font-bold">
              Save {formData.itemType === 'income' ? 'Income' : formData.itemType === 'bill' ? 'Recurring Bill' : 'Subscription'}
            </button>
          </div>
        </form>
      </Dialog>

      {/* Main Content List */}
      <section aria-label="Your Subscriptions">
        {displayedSubscriptions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Mascot mood="excited" size="lg" className="mb-4 drop-shadow-xl" />
            <h3 className="text-xl font-black text-mochi-text mb-2">No Subscriptions Found</h3>
            <p className="text-mochi-text-secondary mb-6 max-w-md text-xs sm:text-sm font-medium">
              {filterDueThisWeek
                ? 'Great news! You have no subscription bills due in the next 7 days.'
                : 'Keep your monthly recurring costs cozy and transparent! Track subscriptions with custom wallets.'}
            </p>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="mochi-btn-primary px-5 py-3 text-xs flex items-center gap-2 font-bold"
            >
              <Plus className="w-4 h-4" />
              Track First Subscription
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {displayedSubscriptions.map((sub) => (
                <motion.div
                  key={sub.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  onClick={() => {
                    setSelectedDetailsSub(sub)
                    setHistoryPage(1)
                  }}
                  className="mochi-card relative group overflow-hidden flex flex-col hover:border-mochi-primary/40 transition-all shadow-md cursor-pointer"
                >
                  <div className={cn('absolute top-0 left-0 w-full h-1.5', getValueColor(sub.usageRating))} />

                  <div className="p-5 flex-1">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center space-x-3">
                        <SubscriptionBrandLogo name={sub.name} />
                        <div>
                          <h3 className="font-bold text-mochi-text text-base line-clamp-1">{sub.name}</h3>
                          <div className="flex items-center space-x-2 mt-0.5">
                            <span className={cn('text-[10px] font-bold px-2 py-0.5 rounded-full capitalize', getStatusColor(sub.status))}>
                              {sub.status}
                            </span>
                            <span className="text-xs text-mochi-text-muted capitalize font-bold">{sub.category}</span>
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
                        <div className="font-bold text-mochi-primary">{formatDate(sub.nextBilling)}</div>
                      </div>
                    </div>
                  </div>

                  <div className="px-5 py-3 bg-mochi-surface-alt/40 border-t border-mochi-border/60 flex items-center justify-between text-xs">
                    <button
                      onClick={(e) => handleOpenLogPayModal(sub, e)}
                      className="mochi-btn-primary text-[11px] py-1.5 px-3 font-bold flex items-center gap-1 shadow-xs"
                    >
                      <CreditCard className="w-3.5 h-3.5" /> Pay Now
                    </button>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={(e) => toggleStatus(sub.id, sub.status, e)}
                        className="p-1.5 rounded-lg border border-mochi-border hover:bg-mochi-surface-alt text-mochi-text-muted"
                        title="Pause/Resume"
                      >
                        {sub.status === 'paused' ? <Play className="w-3.5 h-3.5 text-emerald-500" /> : <Pause className="w-3.5 h-3.5" />}
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          deleteSubscription(sub.id)
                        }}
                        className="p-1.5 rounded-lg border border-mochi-border hover:bg-rose-500/10 text-mochi-text-muted hover:text-rose-500"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </section>
    </motion.div>
  )
}
