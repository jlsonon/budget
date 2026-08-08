import { useState, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  Plus,
  Trash2,
  CreditCard,
  Pencil,
  Clock,
  ArrowUpRight,
  ArrowDownLeft,
  TrendingUp,
} from 'lucide-react'
import { useAppStore, getUid } from '@/store/appStore'
import { Subscription, SubscriptionFrequency, SubscriptionPayment } from '@/types'
import Mascot from '@/components/ui/Mascot'
import Dialog from '@/components/ui/Dialog'
import { SubscriptionBrandLogo } from '@/components/ui/SubscriptionBrandLogo'
import { formatCurrency, cn } from '@/lib/utils'
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

const PRESET_BILLS: PresetService[] = [
  { name: 'Meralco Electricity', category: 'Utilities', amount: 3500, color: '#E65100', frequency: 'monthly' },
  { name: 'Maynilad Water', category: 'Utilities', amount: 650, color: '#0288D1', frequency: 'monthly' },
  { name: 'Manila Water', category: 'Utilities', amount: 580, color: '#0288D1', frequency: 'monthly' },
  { name: 'PLDT Home Fiber', category: 'Utilities', amount: 1699, color: '#D32F2F', frequency: 'monthly' },
  { name: 'Globe At Home', category: 'Utilities', amount: 1499, color: '#1976D2', frequency: 'monthly' },
  { name: 'Smart Postpaid', category: 'Utilities', amount: 999, color: '#388E3C', frequency: 'monthly' },
  { name: 'Converge ICT Fiber', category: 'Utilities', amount: 1500, color: '#E64A19', frequency: 'monthly' },
  { name: 'House / Condo Rent', category: 'Housing', amount: 12000, color: '#7B1FA2', frequency: 'monthly' },
  { name: 'PAG-IBIG Fund', category: 'Government', amount: 200, color: '#00796B', frequency: 'monthly' },
  { name: 'SSS Contribution', category: 'Government', amount: 1125, color: '#00796B', frequency: 'monthly' },
  { name: 'PhilHealth', category: 'Government', amount: 500, color: '#00796B', frequency: 'monthly' },
  { name: 'Cignal TV', category: 'Utilities', amount: 520, color: '#D32F2F', frequency: 'monthly' },
  { name: 'Sky Cable', category: 'Utilities', amount: 999, color: '#1976D2', frequency: 'monthly' },
]

const PRESET_INCOMES: PresetService[] = [
  { name: 'Monthly Salary', category: 'Income', amount: 35000, color: '#2E7D32', frequency: 'monthly' },
  { name: 'Freelance Retainer', category: 'Income', amount: 15000, color: '#00897B', frequency: 'monthly' },
  { name: 'Bi-Weekly Paycheck', category: 'Income', amount: 17500, color: '#43A047', frequency: 'weekly' },
  { name: 'Monthly Allowance', category: 'Income', amount: 5000, color: '#00ACC1', frequency: 'monthly' },
  { name: 'Store Revenue', category: 'Income', amount: 10000, color: '#8E24AA', frequency: 'monthly' },
  { name: 'Consulting Fee', category: 'Income', amount: 12000, color: '#1565C0', frequency: 'monthly' },
]

export default function RecurringPage() {
  const { user } = useAuthStore()
  const { subscriptions, wallets, addSubscription, updateSubscription, deleteSubscription, addTransaction } = useAppStore()

  const [isLoading, setIsLoading] = useState(true)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [showPaywall, setShowPaywall] = useState(false)
  
  // Details / Log Pay Modal State
  const [selectedItem, setSelectedItem] = useState<Subscription | null>(null)
  const [isEditingInDetails, setIsEditingInDetails] = useState(false)
  const [editAmount, setEditAmount] = useState('')
  const [editDay, setEditDay] = useState(15)
  const [payWalletId, setPayWalletId] = useState<string>('')
  
  const [activeTab, setActiveTab] = useState<'bill' | 'income'>('bill')

  // Autocomplete dropdown state
  const [showAutocomplete, setShowAutocomplete] = useState(false)

  // Form State
  const [formData, setFormData] = useState<{
    name: string
    amount: number
    frequency: SubscriptionFrequency
    category: string
    itemType: 'bill' | 'income'
    recurringDay: number
    walletId: string
    syncToCalendar: boolean
  }>({
    name: '',
    amount: 0,
    frequency: 'monthly',
    category: 'Utilities',
    itemType: 'bill',
    recurringDay: 15,
    walletId: wallets[0]?.id || '',
    syncToCalendar: true,
  })

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 400)
    return () => clearTimeout(timer)
  }, [])

  // Filter recurring items (Bills & Income)
  const recurringItems = useMemo(() => {
    return subscriptions.filter(
      (s) => s.itemType === 'bill' || s.itemType === 'income' || s.category === 'Utilities' || s.category === 'Income' || s.category === 'Housing' || s.category === 'Government'
    )
  }, [subscriptions])

  const displayedItems = useMemo(() => {
    if (activeTab === 'income') {
      return recurringItems.filter((s) => s.itemType === 'income' || s.category === 'Income')
    }
    return recurringItems.filter((s) => s.itemType === 'bill' || s.category === 'Utilities' || s.category === 'Housing' || s.category === 'Government' || s.itemType !== 'income')
  }, [recurringItems, activeTab])

  const currentPresetList = useMemo(() => {
    if (formData.itemType === 'income') return PRESET_INCOMES
    return PRESET_BILLS
  }, [formData.itemType])

  // Autocomplete matching list
  const autocompleteMatches = useMemo(() => {
    if (!formData.name) return currentPresetList
    return currentPresetList.filter((s) =>
      s.name.toLowerCase().includes(formData.name.toLowerCase())
    )
  }, [formData.name, currentPresetList])

  const selectAutocompleteItem = (preset: PresetService) => {
    setFormData((prev) => ({
      ...prev,
      name: preset.name,
      amount: preset.amount,
      category: preset.category,
      frequency: preset.frequency,
    }))
    setShowAutocomplete(false)
  }

  // Monthly Cashflow Calculations
  const getMonthlyVal = (sub: Subscription) => {
    switch (sub.frequency) {
      case 'weekly': return sub.amount * (52 / 12)
      case 'monthly': return sub.amount
      case 'quarterly': return sub.amount / 3
      case 'annual': return sub.amount / 12
      default: return sub.amount
    }
  }

  const monthlyBills = recurringItems
    .filter((s) => s.itemType !== 'income' && s.category !== 'Income')
    .reduce((acc, s) => acc + getMonthlyVal(s), 0)

  const monthlyIncome = recurringItems
    .filter((s) => s.itemType === 'income' || s.category === 'Income')
    .reduce((acc, s) => acc + getMonthlyVal(s), 0)

  const netCashflow = monthlyIncome - monthlyBills

  const handleOpenDetails = (item: Subscription) => {
    setSelectedItem(item)
    setPayWalletId(item.walletId || wallets[0]?.id || '')
    setEditAmount(item.amount.toString())
    setEditDay(item.recurringDay || 15)
    setIsEditingInDetails(false)
  }

  // Execute Payment / Payout and show "Transaction Complete"
  const handleExecuteTransaction = () => {
    if (!selectedItem) return

    const selectedWallet = wallets.find((w) => w.id === payWalletId) || wallets[0]
    const isIncomeType = selectedItem.itemType === 'income' || selectedItem.category === 'Income'
    const todayStr = new Date().toISOString().split('T')[0]

    // 1. Log Payment Record
    const newPayment: SubscriptionPayment = {
      id: crypto.randomUUID(),
      amount: selectedItem.amount,
      date: todayStr,
      walletId: selectedWallet?.id,
      walletName: selectedWallet?.name,
    }

    const updatedPayments = [newPayment, ...(selectedItem.payments || [])]

    // 2. Add Real Transaction to Ledger & Update Wallet Balance
    addTransaction({
      id: `txn_${Date.now()}`,
      userId: selectedItem.userId || getUid(),
      type: isIncomeType ? 'income' : 'expense',
      amount: selectedItem.amount,
      currency: 'PHP',
      categoryId: isIncomeType ? 'salary' : 'utilities',
      walletId: selectedWallet?.id,
      merchant: selectedItem.name,
      paymentMethod: selectedWallet?.type === 'credit_card' ? 'credit_card' : 'other',
      date: todayStr,
      notes: `${isIncomeType ? 'Received' : 'Paid'} recurring ${selectedItem.name}`,
      isFavorite: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })

    // 3. Advance Next Date
    const nextDate = new Date(selectedItem.nextBilling || Date.now())
    nextDate.setMonth(nextDate.getMonth() + 1)

    updateSubscription(selectedItem.id, {
      nextBilling: nextDate.toISOString().split('T')[0],
      payments: updatedPayments,
      updatedAt: new Date().toISOString(),
    })

    // Transaction Complete Alert
    useToastStore.getState().success(
      `Transaction complete! ${isIncomeType ? 'Deposited' : 'Deducted'} ${formatCurrency(selectedItem.amount)} ${isIncomeType ? 'into' : 'from'} ${selectedWallet?.name || 'Wallet'} for ${selectedItem.name}.`,
      'Transaction Complete'
    )

    setSelectedItem(null)
  }

  // Save changes from Edit in Details Modal
  const handleSaveDetailsEdit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedItem) return
    const amt = parseFloat(editAmount)
    if (isNaN(amt) || amt <= 0) return

    updateSubscription(selectedItem.id, {
      amount: amt,
      recurringDay: editDay,
      walletId: payWalletId,
      updatedAt: new Date().toISOString(),
    })

    useToastStore.getState().success(`Updated ${selectedItem.name} plan settings.`, 'Saved Changes')
    setIsEditingInDetails(false)
    setSelectedItem(null)
  }

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name || !formData.amount) return

    const itemType = formData.itemType || 'bill'
    const day = formData.recurringDay || 15
    const today = new Date()
    const targetDate = new Date(today.getFullYear(), today.getMonth(), day)
    if (targetDate < today) {
      targetDate.setMonth(targetDate.getMonth() + 1)
    }

    const newSub: Subscription = {
      id: crypto.randomUUID(),
      userId: getUid(),
      name: formData.name,
      amount: Number(formData.amount),
      frequency: formData.frequency || 'monthly',
      category: formData.category || (itemType === 'income' ? 'Income' : 'Utilities'),
      itemType,
      recurringDay: day,
      syncToCalendar: formData.syncToCalendar ?? true,
      walletId: formData.walletId || wallets[0]?.id,
      nextBilling: targetDate.toISOString().split('T')[0],
      status: 'active',
      usageRating: 3,
      cancelReminderDays: 3,
      payments: [],
      notes: `Recurring day of month: Day ${day} at 11:59 PM`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    addSubscription(newSub)

    if (formData.syncToCalendar) {
      exportToDeviceCalendar({
        title: `${itemType === 'income' ? 'Recurring Income' : 'Recurring Bill'}: ${newSub.name}`,
        amount: newSub.amount,
        date: newSub.nextBilling,
        description: `Day ${day} monthly recurring ${itemType} for ${newSub.name}`,
      })
    }

    triggerNativeDeviceNotification(
      itemType === 'income' ? 'Recurring Income Tracked' : 'Recurring Bill Tracked',
      `Added ${newSub.name} (Day ${day} at 11:59 PM • ${formatCurrency(newSub.amount)})`
    )

    setIsAddModalOpen(false)
    setFormData({
      name: '',
      amount: 0,
      frequency: 'monthly',
      category: 'Utilities',
      itemType: 'bill',
      recurringDay: 15,
      walletId: wallets[0]?.id || '',
      syncToCalendar: true,
    })
  }

  if (isLoading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
        <div className="mochi-skeleton h-10 w-48 rounded-md" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
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
        featureTitle="Unlock Unlimited Recurring Items"
        featureDescription="Free tier is limited to 2 active recurring items. Upgrade to Pro for unlimited utility bills & income!"
      />

      {/* View Bill / Income Details & Action Modal */}
      <Dialog
        isOpen={!!selectedItem}
        onClose={() => {
          setSelectedItem(null)
          setIsEditingInDetails(false)
        }}
        title={selectedItem ? `${selectedItem.itemType === 'income' || selectedItem.category === 'Income' ? 'Income' : 'Bill'} Details - ${selectedItem.name}` : 'Details'}
      >
        {selectedItem && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-mochi-surface-alt border border-mochi-border">
              <SubscriptionBrandLogo name={selectedItem.name} size="lg" />
              <div>
                <h4 className="text-base font-black text-mochi-text">{selectedItem.name}</h4>
                <p className="text-xs text-mochi-text-muted font-bold capitalize">
                  {selectedItem.itemType === 'income' || selectedItem.category === 'Income' ? 'Recurring Income' : 'Recurring Bill'} • Day {selectedItem.recurringDay || 15}
                </p>
              </div>
            </div>

            {!isEditingInDetails ? (
              <>
                <div className="p-3.5 rounded-2xl bg-mochi-surface-alt/60 border border-mochi-border/60 space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-mochi-text-muted font-medium">Amount:</span>
                    <strong className={cn('font-black text-sm', selectedItem.itemType === 'income' || selectedItem.category === 'Income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400')}>
                      {formatCurrency(selectedItem.amount)}
                    </strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-mochi-text-muted font-medium">Scheduled Day:</span>
                    <strong className="text-mochi-primary font-bold">Day {selectedItem.recurringDay || 15}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-mochi-text-muted font-medium">Auto Deduction / Deposit Wallet:</span>
                    <strong className="text-mochi-text font-bold">
                      {wallets.find((w) => w.id === (selectedItem.walletId || payWalletId))?.name || 'Default Wallet'}
                    </strong>
                  </div>
                </div>

                {/* Change Wallet Target Dropdown before execution */}
                <div>
                  <label className="block text-xs font-bold text-mochi-text-secondary mb-1">
                    {selectedItem.itemType === 'income' || selectedItem.category === 'Income' ? 'Select Deposit Wallet' : 'Select Payment Wallet'}
                  </label>
                  <select
                    value={payWalletId}
                    onChange={(e) => setPayWalletId(e.target.value)}
                    className="mochi-input text-xs w-full font-bold"
                  >
                    {wallets.map((w) => (
                      <option key={w.id} value={w.id}>
                        {w.name} ({w.type})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Action Buttons: Pay Now / Accept, Edit, Delete, Close */}
                <div className="pt-2 flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={handleExecuteTransaction}
                    className={cn(
                      'mochi-btn-primary text-xs py-3 font-bold flex items-center justify-center gap-2 shadow-md cursor-pointer',
                      selectedItem.itemType === 'income' || selectedItem.category === 'Income' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-rose-600 hover:bg-rose-700'
                    )}
                  >
                    <CreditCard className="w-4 h-4" />
                    <span>{selectedItem.itemType === 'income' || selectedItem.category === 'Income' ? 'Accept Payout Now' : 'Pay Bill Now'}</span>
                  </button>

                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setIsEditingInDetails(true)}
                      className="px-3 py-2.5 rounded-2xl bg-mochi-surface-alt border border-mochi-border text-mochi-text font-bold text-xs flex items-center justify-center gap-1.5 hover:bg-mochi-border/40 transition-colors cursor-pointer"
                    >
                      <Pencil className="w-3.5 h-3.5 text-mochi-primary" />
                      <span>Edit</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        deleteSubscription(selectedItem.id)
                        setSelectedItem(null)
                      }}
                      className="px-3 py-2.5 rounded-2xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 font-bold text-xs flex items-center justify-center gap-1.5 border border-rose-500/30 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setSelectedItem(null)}
                      className="mochi-btn-secondary text-xs py-2.5 font-bold"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </>
            ) : (
              /* Inline Edit Form in Details Modal */
              <form onSubmit={handleSaveDetailsEdit} className="space-y-4 pt-1">
                <div>
                  <label className="block text-xs font-bold text-mochi-text-secondary mb-1">Amount (PHP) *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={editAmount}
                    onChange={(e) => setEditAmount(e.target.value)}
                    className="mochi-input text-xs w-full font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-mochi-text-secondary mb-1">Recurring Day *</label>
                  <select
                    value={editDay}
                    onChange={(e) => setEditDay(Number(e.target.value))}
                    className="mochi-input text-xs w-full font-bold"
                  >
                    {[...Array(31)].map((_, i) => (
                      <option key={i + 1} value={i + 1}>
                        Day {i + 1}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-mochi-text-secondary mb-1">Assigned Wallet *</label>
                  <select
                    value={payWalletId}
                    onChange={(e) => setPayWalletId(e.target.value)}
                    className="mochi-input text-xs w-full font-bold"
                  >
                    {wallets.map((w) => (
                      <option key={w.id} value={w.id}>
                        {w.name} ({w.type})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="pt-2 flex gap-2">
                  <button
                    type="button"
                    onClick={() => setIsEditingInDetails(false)}
                    className="mochi-btn-secondary text-xs flex-1 py-2.5 font-bold"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="mochi-btn-primary text-xs flex-1 py-2.5 font-bold">
                    Save Changes
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </Dialog>

      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-black text-mochi-text">
          Bills & Recurring Income
        </h1>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 w-full">
          <p className="text-xs sm:text-sm text-mochi-text-secondary font-semibold flex-1">
            Track Meralco, Maynilad, rent, PLDT, & salary payouts with wallet sync
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
              <span>Add Recurring Bill / Income</span>
            </button>
          </div>
        </div>
      </div>

      {/* Top 2-Option Segmented Toggle: Bills vs Income */}
      <div className="flex justify-start">
        <div className="inline-flex p-1.5 bg-mochi-surface-alt/90 rounded-2xl border border-mochi-border/80 gap-1.5 shadow-xs w-full sm:w-auto">
          <button
            onClick={() => setActiveTab('bill')}
            className={`flex-1 sm:flex-initial px-6 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-2 ${
              activeTab === 'bill'
                ? 'bg-rose-500 text-white shadow-md scale-[1.02]'
                : 'text-mochi-text-muted hover:text-mochi-text hover:bg-mochi-border/40'
            }`}
          >
            <span>Recurring Bills ({recurringItems.filter((s) => s.itemType === 'bill' || s.category === 'Utilities' || s.category === 'Housing' || s.category === 'Government' || s.itemType !== 'income').length})</span>
          </button>

          <button
            onClick={() => setActiveTab('income')}
            className={`flex-1 sm:flex-initial px-6 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-2 ${
              activeTab === 'income'
                ? 'bg-emerald-500 text-white shadow-md scale-[1.02]'
                : 'text-mochi-text-muted hover:text-mochi-text hover:bg-mochi-border/40'
            }`}
          >
            <span>Recurring Income ({recurringItems.filter((s) => s.itemType === 'income' || s.category === 'Income').length})</span>
          </button>
        </div>
      </div>

      {/* Unified Glassmorphic Cashflow Banner */}
      <section aria-label="Recurring Cashflow Summary" className="mochi-card p-5 bg-gradient-to-br from-mochi-surface via-mochi-surface to-mochi-surface-alt/80 border border-mochi-border shadow-lg rounded-3xl space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 divide-y sm:divide-y-0 sm:divide-x divide-mochi-border/60">
          {/* 1. Monthly Income */}
          <div className="flex items-center gap-3.5 pt-2 sm:pt-0 sm:pr-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-500/20 shadow-xs shrink-0">
              <ArrowDownLeft className="w-6 h-6 stroke-[2.5px]" />
            </div>
            <div>
              <p className="text-[10px] font-black text-mochi-text-muted uppercase tracking-wider">Monthly Income</p>
              <p className="text-xl font-black text-emerald-600 dark:text-emerald-400">{formatCurrency(monthlyIncome)}</p>
            </div>
          </div>

          {/* 2. Monthly Bills */}
          <div className="flex items-center gap-3.5 pt-3 sm:pt-0 sm:px-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center border border-rose-500/20 shadow-xs shrink-0">
              <ArrowUpRight className="w-6 h-6 stroke-[2.5px]" />
            </div>
            <div>
              <p className="text-[10px] font-black text-mochi-text-muted uppercase tracking-wider">Monthly Bills</p>
              <p className="text-xl font-black text-rose-600 dark:text-rose-400">{formatCurrency(monthlyBills)}</p>
            </div>
          </div>

          {/* 3. Net Cashflow */}
          <div className="flex items-center gap-3.5 pt-3 sm:pt-0 sm:pl-4">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border shadow-xs shrink-0 ${
              netCashflow >= 0
                ? 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20'
                : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
            }`}>
              <TrendingUp className="w-6 h-6 stroke-[2.5px]" />
            </div>
            <div>
              <p className="text-[10px] font-black text-mochi-text-muted uppercase tracking-wider">Net Monthly Cashflow</p>
              <p className={`text-xl font-black ${netCashflow >= 0 ? 'text-sky-600 dark:text-sky-400' : 'text-amber-600'}`}>
                {formatCurrency(netCashflow)}
              </p>
            </div>
          </div>
        </div>

        {/* Visual Ratio Progress Bar */}
        {monthlyIncome > 0 && (
          <div className="pt-2 border-t border-mochi-border/40">
            <div className="flex justify-between text-[11px] font-bold text-mochi-text-muted mb-1">
              <span>Income vs Bills Commitment Ratio</span>
              <span>{Math.min(100, Math.round((monthlyBills / monthlyIncome) * 100))}% Committed</span>
            </div>
            <div className="h-2.5 bg-emerald-500/20 rounded-full overflow-hidden flex">
              <div
                className="h-full bg-rose-500 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, (monthlyBills / monthlyIncome) * 100)}%` }}
              />
            </div>
          </div>
        )}
      </section>

      {/* Add Modal with Autocomplete & Recurring Day Selection */}
      <Dialog isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Add Recurring Bill or Income">
        <form onSubmit={handleAddSubmit} className="space-y-4">
          {/* Type Segment Selector */}
          <div>
            <label className="block text-xs font-bold text-mochi-text-secondary mb-1.5">Type *</label>
            <div className="grid grid-cols-2 gap-2 p-1 bg-mochi-surface-alt rounded-2xl border border-mochi-border/60">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, itemType: 'bill', category: 'Utilities' })}
                className={`py-2 px-1 text-xs font-extrabold rounded-xl transition-all cursor-pointer ${
                  formData.itemType === 'bill'
                    ? 'bg-mochi-surface text-rose-500 shadow-xs border border-rose-500/20'
                    : 'text-mochi-text-muted hover:text-mochi-text'
                }`}
              >
                Recurring Bill (Expense)
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, itemType: 'income', category: 'Income' })}
                className={`py-2 px-1 text-xs font-extrabold rounded-xl transition-all cursor-pointer ${
                  formData.itemType === 'income'
                    ? 'bg-mochi-surface text-emerald-500 shadow-xs border border-emerald-500/20'
                    : 'text-mochi-text-muted hover:text-mochi-text'
                }`}
              >
                Recurring Income (Payout)
              </button>
            </div>
          </div>

          {/* Title Field with Autocomplete & Brand Logo Badge */}
          <div className="relative">
            <label className="block text-xs font-bold text-mochi-text-secondary mb-1">
              {formData.itemType === 'income' ? 'Income Title *' : 'Bill / Provider Name *'}
            </label>

            <div className="flex items-center gap-2">
              <SubscriptionBrandLogo name={formData.name || (formData.itemType === 'income' ? 'Salary' : 'Meralco')} size="md" />
              <input
                type="text"
                placeholder={formData.itemType === 'income' ? 'e.g. Monthly Salary, Freelance' : 'e.g. Meralco, Maynilad, PLDT, Rent'}
                value={formData.name}
                onFocus={() => setShowAutocomplete(true)}
                onChange={(e) => {
                  setFormData({ ...formData, name: e.target.value })
                  setShowAutocomplete(true)
                }}
                className="mochi-input text-xs flex-1 font-bold"
                required
              />
            </div>

            {/* Autocomplete Dropdown List */}
            {showAutocomplete && autocompleteMatches.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 z-50 bg-mochi-surface border border-mochi-border rounded-2xl shadow-xl max-h-48 overflow-y-auto divide-y divide-mochi-border/40 p-1">
                {autocompleteMatches.map((preset) => (
                  <button
                    key={preset.name}
                    type="button"
                    onClick={() => selectAutocompleteItem(preset)}
                    className="w-full p-2 flex items-center justify-between hover:bg-mochi-surface-alt transition-colors rounded-xl text-left cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      <SubscriptionBrandLogo name={preset.name} size="sm" />
                      <div>
                        <p className="text-xs font-bold text-mochi-text">{preset.name}</p>
                        <p className="text-[10px] text-mochi-text-muted font-medium">{preset.category}</p>
                      </div>
                    </div>
                    <span className="text-xs font-black text-mochi-primary">₱{preset.amount.toLocaleString()}</span>
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
                placeholder="e.g. 3500"
                value={formData.amount || ''}
                onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
                className="mochi-input text-xs w-full font-bold"
                required
              />
            </div>

            {/* Recurring Day Selector */}
            <div>
              <label className="block text-xs font-bold text-mochi-text-secondary mb-1">Recurring Day *</label>
              <select
                value={formData.recurringDay}
                onChange={(e) => setFormData({ ...formData, recurringDay: Number(e.target.value) })}
                className="mochi-input text-xs w-full font-bold"
                required
              >
                {[...Array(31)].map((_, i) => (
                  <option key={i + 1} value={i + 1}>
                    Day {i + 1}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-mochi-text-secondary mb-1">
              {formData.itemType === 'income' ? 'Deposit Into Wallet *' : 'Deduct From Wallet *'}
            </label>
            <select
              value={formData.walletId}
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

          {/* Sync to Financial Calendar Checkbox */}
          <div className="flex items-center gap-2 p-3 rounded-2xl bg-mochi-surface-alt/60 border border-mochi-border/60">
            <input
              type="checkbox"
              id="syncToCalendar"
              checked={formData.syncToCalendar}
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
              Save {formData.itemType === 'income' ? 'Income' : 'Bill'}
            </button>
          </div>
        </form>
      </Dialog>

      {/* Recurring Items List */}
      <section aria-label="Recurring Items List">
        {displayedItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Mascot mood="excited" size="lg" className="mb-4 drop-shadow-xl" />
            <h3 className="text-xl font-black text-mochi-text mb-2">No Recurring Items Tracked</h3>
            <p className="text-mochi-text-secondary mb-6 max-w-md text-xs sm:text-sm font-medium">
              Track Meralco electricity, water bills, house rent, or monthly salary payouts with assigned wallets.
            </p>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="mochi-btn-primary px-5 py-3 text-xs flex items-center gap-2 font-bold cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Add First Recurring Item
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {displayedItems.map((item) => {
              const isIncome = item.itemType === 'income' || item.category === 'Income'
              const walletName = wallets.find((w) => w.id === item.walletId)?.name || 'Wallet'

              return (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  onClick={() => handleOpenDetails(item)}
                  className="mochi-card relative group overflow-hidden flex flex-col hover:border-mochi-primary/50 transition-all shadow-md cursor-pointer"
                  title="Click to view details, pay/accept, edit or delete"
                >
                  <div className={cn('absolute top-0 left-0 w-full h-1.5', isIncome ? 'bg-emerald-500' : 'bg-rose-500')} />

                  <div className="p-5 flex-1">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center space-x-3">
                        <SubscriptionBrandLogo name={item.name} />
                        <div>
                          <h3 className="font-bold text-mochi-text text-base line-clamp-1 group-hover:text-mochi-primary transition-colors flex items-center gap-1">
                            <span>{item.name}</span>
                            <Pencil className="w-3 h-3 text-mochi-text-muted opacity-0 group-hover:opacity-100 transition-opacity" />
                          </h3>
                          <span className={cn('text-[10px] font-bold px-2 py-0.5 rounded-full capitalize inline-block mt-0.5', isIncome ? 'bg-emerald-500/10 text-emerald-600' : 'bg-rose-500/10 text-rose-600')}>
                            {isIncome ? 'Recurring Income' : 'Recurring Bill'}
                          </span>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className={cn('font-black text-lg', isIncome ? 'text-emerald-600 dark:text-emerald-400' : 'text-mochi-text')}>
                          {isIncome ? '+' : '-'}{formatCurrency(item.amount)}
                        </div>
                        <div className="text-[10px] font-bold text-mochi-text-muted uppercase">/month</div>
                      </div>
                    </div>

                    <div className="p-3 rounded-2xl bg-mochi-surface-alt border border-mochi-border/60 space-y-1.5 text-xs">
                      <div className="flex justify-between">
                        <span className="text-mochi-text-muted font-medium">{isIncome ? 'Deposit Wallet:' : 'Deduct Wallet:'}</span>
                        <strong className="text-mochi-text font-bold">{walletName}</strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-mochi-text-muted font-medium">Scheduled Day:</span>
                        <strong className="text-mochi-primary font-bold">Day {item.recurringDay || 15}</strong>
                      </div>
                    </div>
                  </div>

                  <div className="px-5 py-3 bg-mochi-surface-alt/40 border-t border-mochi-border/60 flex items-center justify-between text-xs">
                    <span className="text-[11px] font-bold text-mochi-text-muted flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-mochi-primary" /> View Details
                    </span>

                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleOpenDetails(item)
                      }}
                      className={cn(
                        'text-[11px] py-1.5 px-3 font-bold flex items-center gap-1 shadow-xs rounded-xl text-white transition-transform hover:scale-105 cursor-pointer',
                        isIncome ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-rose-600 hover:bg-rose-700'
                      )}
                    >
                      <CreditCard className="w-3.5 h-3.5" /> {isIncome ? 'Accept Payout' : 'Pay Bill Now'}
                    </button>
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}
      </section>
    </motion.div>
  )
}
