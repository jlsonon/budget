import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search,
  Plus,
  ArrowDownLeft,
  ArrowUpRight,
  X,
  Download,
  Calendar,
  Wallet,
  Trash2,
  AlertTriangle,
  CreditCard,
} from 'lucide-react'
import { useAppStore } from '@/store/appStore'
import { formatCurrency, formatDate, cn } from '@/lib/utils'
import type { Transaction, PaymentMethod, Category } from '@/types'
import { DEFAULT_EXPENSE_CATEGORIES, DEFAULT_INCOME_CATEGORIES } from '@/lib/utils'
import MochiCategoryVectorSVG from '@/components/ui/MochiCategoryVectorSVG'

const categoryMap: Record<string, Category> = {}
;[...DEFAULT_EXPENSE_CATEGORIES, ...DEFAULT_INCOME_CATEGORIES].forEach((c) => {
  categoryMap[c.id] = { ...c, type: DEFAULT_EXPENSE_CATEGORIES.includes(c) ? 'expense' : 'income' }
})

const paymentMethodLabels: Record<PaymentMethod, string> = {
  cash: 'Cash on Hand',
  credit_card: 'Credit Card',
  debit_card: 'Debit Card',
  bank_transfer: 'Bank Transfer',
  gcash: 'GCash',
  maya: 'Maya',
  other: 'Other',
}

// Smart helper for Philippine merchants & payment methods
function getMerchantVectorId(merchant: string, paymentMethod?: string, defaultCategoryIcon?: string): string {
  const m = (merchant || '').toLowerCase()
  const p = (paymentMethod || '').toLowerCase()

  if (m.includes('gcash') || p === 'gcash') return 'gcash'
  if (m.includes('maya') || p === 'maya') return 'maya'
  if (m.includes('jollibee') || m.includes('chickenjoy') || m.includes('mcdo')) return 'jollibee'
  if (m.includes('shopee')) return 'shopee'
  if (m.includes('lazada')) return 'lazada'
  if (m.includes('grab')) return 'grab'
  if (m.includes('meralco') || m.includes('electric')) return 'meralco'
  if (m.includes('7-eleven') || m.includes('7eleven') || m.includes('7 eleven')) return 'seven_eleven'
  if (m.includes('jeepney') || m.includes('angkas') || m.includes('commute') || m.includes('joyride')) return 'jeepney'

  return defaultCategoryIcon || 'receipt'
}

// Fallback mock transactions with PH Merchants
const mockTransactions: Transaction[] = [
  {
    id: '1', userId: '1', type: 'expense', amount: 350, currency: 'PHP',
    categoryId: 'food', merchant: 'Jollibee Chickenjoy Meal', paymentMethod: 'cash', walletId: 'w_cash',
    date: new Date(Date.now() - 86400000).toISOString().split('T')[0], time: '12:30 PM',
    isFavorite: false, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
  },
  {
    id: '2', userId: '1', type: 'income', amount: 45000, currency: 'PHP',
    categoryId: 'salary', merchant: 'BDO Company Payroll', paymentMethod: 'bank_transfer', walletId: 'w_bpi',
    date: new Date(Date.now() - 2 * 86400000).toISOString().split('T')[0], time: '09:00 AM',
    isFavorite: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
  },
  {
    id: '3', userId: '1', type: 'expense', amount: 549, currency: 'PHP',
    categoryId: 'subscriptions', merchant: 'Netflix Philippines', paymentMethod: 'gcash', walletId: 'w_gcash',
    date: new Date(Date.now() - 3 * 86400000).toISOString().split('T')[0], time: '02:15 PM',
    isFavorite: false, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
  },
  {
    id: '4', userId: '1', type: 'expense', amount: 1200, currency: 'PHP',
    categoryId: 'transport', merchant: 'Grab Express & Food', paymentMethod: 'gcash', walletId: 'w_gcash',
    date: new Date(Date.now() - 4 * 86400000).toISOString().split('T')[0], time: '08:15 AM',
    isFavorite: false, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
  },
  {
    id: '5', userId: '1', type: 'expense', amount: 2500, currency: 'PHP',
    categoryId: 'bills', merchant: 'Meralco Electric Bill', paymentMethod: 'maya', walletId: 'w_maya',
    date: new Date(Date.now() - 5 * 86400000).toISOString().split('T')[0], time: '04:45 PM',
    isFavorite: false, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
  },
  {
    id: '6', userId: '1', type: 'expense', amount: 890, currency: 'PHP',
    categoryId: 'shopping', merchant: 'ShopeePay Super Sale', paymentMethod: 'other', walletId: 'w_gcash',
    date: new Date(Date.now() - 6 * 86400000).toISOString().split('T')[0], time: '07:30 PM',
    isFavorite: false, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
  },
  {
    id: '7', userId: '1', type: 'expense', amount: 180, currency: 'PHP',
    categoryId: 'food', merchant: '7-Eleven Snacks & Drinks', paymentMethod: 'cash', walletId: 'w_cash',
    date: new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0], time: '11:15 PM',
    isFavorite: false, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
  },
  {
    id: '8', userId: '1', type: 'expense', amount: 45, currency: 'PHP',
    categoryId: 'transport', merchant: 'Jeepney Commute Fare', paymentMethod: 'cash', walletId: 'w_cash',
    date: new Date(Date.now() - 8 * 86400000).toISOString().split('T')[0], time: '07:00 AM',
    isFavorite: false, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
  },
]

type SortOption = 'date-desc' | 'date-asc' | 'amount-desc' | 'amount-asc'

/* ─── Transaction Detail Bottom Sheet ────────────────────────────────── */
function TransactionDetailSheet({
  transaction,
  onClose,
  onDelete,
}: {
  transaction: Transaction | null
  onClose: () => void
  onDelete: (id: string) => void
}) {
  const { wallets } = useAppStore()
  const [confirmDelete, setConfirmDelete] = useState(false)

  if (!transaction) return null

  const category = categoryMap[transaction.categoryId]
  const linkedWallet = wallets.find((w) => w.id === transaction.walletId)
  const isIncome = transaction.type === 'income'

  const handleDelete = () => {
    if (confirmDelete) {
      onDelete(transaction.id)
      onClose()
    } else {
      setConfirmDelete(true)
      setTimeout(() => setConfirmDelete(false), 3000)
    }
  }

  return (
    <AnimatePresence>
      <motion.div
        key="txn-detail-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-end justify-center"
        onClick={onClose}
      >
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', stiffness: 340, damping: 34 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-lg bg-mochi-surface rounded-t-3xl border-t border-mochi-border shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
        >
          {/* Top Bar */}
          <div className="flex items-center justify-between px-6 pt-5 pb-2 shrink-0">
            <span className="text-[10px] font-black uppercase tracking-widest text-mochi-text-muted">
              Transaction Details
            </span>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-mochi-surface-alt text-mochi-text-muted hover:text-mochi-text transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 pt-2 overflow-y-auto space-y-5">
            {/* Header / Hero */}
            <div className="flex flex-col items-center text-center pb-4 border-b border-mochi-border/60">
              <div className={cn(
                'w-16 h-16 rounded-3xl flex items-center justify-center shadow-md mb-3',
                isIncome ? 'bg-emerald-500/15 border border-emerald-500/30' : 'bg-rose-500/15 border border-rose-500/30'
              )}>
                <MochiCategoryVectorSVG id={category?.icon || 'receipt'} size="md" />
              </div>
              <h2 className="text-xl font-black text-mochi-text">{transaction.merchant}</h2>
              <p className="text-xs text-mochi-text-muted font-bold mt-0.5">{category?.name || transaction.categoryId}</p>

              <div className="mt-3">
                <span className={cn(
                  'text-3xl font-black',
                  isIncome ? 'text-emerald-500' : 'text-rose-500'
                )}>
                  {isIncome ? '+' : '-'}{formatCurrency(transaction.amount, transaction.currency)}
                </span>
              </div>
            </div>

            {/* Linked Wallet Info */}
            <div className="bg-mochi-surface-alt rounded-2xl p-4 border border-mochi-border/50">
              <p className="text-[10px] font-bold uppercase tracking-wider text-mochi-text-muted mb-2">Linked Wallet</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-extrabold shadow-xs"
                    style={{ background: linkedWallet?.color || '#6366F1' }}
                  >
                    {linkedWallet ? linkedWallet.name.charAt(0).toUpperCase() : 'W'}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-mochi-text">{linkedWallet?.name || 'Default Wallet'}</p>
                    <p className="text-[10px] text-mochi-text-muted">
                      {isIncome ? 'Credited to balance' : 'Deducted from balance'}
                    </p>
                  </div>
                </div>
                {linkedWallet && (
                  <span className="text-xs font-black text-mochi-text">
                    ₱{linkedWallet.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </span>
                )}
              </div>
            </div>

            {/* Metadata Grid */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-mochi-surface-alt rounded-2xl p-3 border border-mochi-border/50">
                <div className="flex items-center gap-1.5 text-mochi-text-muted mb-1">
                  <Calendar className="w-3.5 h-3.5 text-mochi-primary" />
                  <span className="text-[10px] font-bold uppercase tracking-wider">Date & Time</span>
                </div>
                <p className="text-xs font-bold text-mochi-text">{formatDate(transaction.date, 'long')}</p>
                {transaction.time && (
                  <p className="text-[10px] text-mochi-text-muted font-medium mt-0.5">{transaction.time}</p>
                )}
              </div>

              <div className="bg-mochi-surface-alt rounded-2xl p-3 border border-mochi-border/50">
                <div className="flex items-center gap-1.5 text-mochi-text-muted mb-1">
                  <CreditCard className="w-3.5 h-3.5 text-sky-500" />
                  <span className="text-[10px] font-bold uppercase tracking-wider">Payment Method</span>
                </div>
                <p className="text-xs font-bold text-mochi-text">
                  {paymentMethodLabels[transaction.paymentMethod] || 'Cash'}
                </p>
              </div>
            </div>

            {/* Delete Button */}
            <button
              onClick={handleDelete}
              className={`w-full py-3 rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                confirmDelete
                  ? 'bg-rose-500 text-white shadow-lg'
                  : 'bg-mochi-surface-alt text-rose-500 border border-rose-200 dark:border-rose-900/40'
              }`}
            >
              {confirmDelete ? (
                <><AlertTriangle className="w-4 h-4" /> Tap again to confirm delete</>
              ) : (
                <><Trash2 className="w-4 h-4" /> Delete Transaction</>
              )}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

/* ─── Main Page ─────────────────────────────────────────────────────── */
export default function TransactionsPage({ mode = 'list' }: { mode?: 'list' | 'add' }) {
  const { transactions, deleteTransaction, setAddModalOpen } = useAppStore()

  useEffect(() => {
    if (mode === 'add') {
      setAddModalOpen(true)
    }
  }, [mode, setAddModalOpen])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState<'all' | 'expense' | 'income'>('all')
  const [sort, setSort] = useState<SortOption>('date-desc')
  const [selectedTxn, setSelectedTxn] = useState<Transaction | null>(null)

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 800)
    return () => clearTimeout(timer)
  }, [])

  const allTxns = transactions.length > 0 ? transactions : mockTransactions

  // Filtered transactions
  const filtered = useMemo(() => {
    let result = [...allTxns]

    if (typeFilter !== 'all') {
      result = result.filter((t) => t.type === typeFilter)
    }

    if (search) {
      const q = search.toLowerCase()
      result = result.filter(
        (t) =>
          t.merchant.toLowerCase().includes(q) ||
          t.categoryId.toLowerCase().includes(q) ||
          (t.paymentMethod && paymentMethodLabels[t.paymentMethod]?.toLowerCase().includes(q))
      )
    }

    result.sort((a, b) => {
      switch (sort) {
        case 'date-desc': return new Date(b.date).getTime() - new Date(a.date).getTime()
        case 'date-asc': return new Date(a.date).getTime() - new Date(b.date).getTime()
        case 'amount-desc': return b.amount - a.amount
        case 'amount-asc': return a.amount - b.amount
        default: return 0
      }
    })

    return result
  }, [allTxns, search, typeFilter, sort])

  // Summary stats
  const totalIncome = filtered.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0)
  const totalExpense = filtered.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0)
  const netBalance = totalIncome - totalExpense

  // CSV Export
  const handleExportCSV = () => {
    const headers = ['Date', 'Type', 'Merchant/Description', 'Category', 'Payment Method', 'Amount (PHP)']
    const rows = filtered.map((t) => [
      t.date,
      t.type.toUpperCase(),
      `"${t.merchant.replace(/"/g, '""')}"`,
      t.categoryId,
      paymentMethodLabels[t.paymentMethod] || t.paymentMethod,
      t.amount.toFixed(2),
    ])

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n')
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', `Mochi_Transactions_${new Date().toISOString().slice(0, 10)}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  if (isLoading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="mochi-skeleton h-8 w-48" />
        <div className="grid grid-cols-3 gap-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="mochi-skeleton h-20 rounded-2xl" />
          ))}
        </div>
        <div className="mochi-skeleton h-12 w-full rounded-2xl" />
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="mochi-skeleton h-16 w-full rounded-2xl" />
        ))}
      </div>
    )
  }

  return (
    <motion.div
      className="pb-24 space-y-5"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      role="main"
      aria-label="Transactions"
    >
      {/* Transaction Detail Sheet */}
      {selectedTxn && (
        <TransactionDetailSheet
          transaction={selectedTxn}
          onClose={() => setSelectedTxn(null)}
          onDelete={(id) => {
            deleteTransaction(id)
            setSelectedTxn(null)
          }}
        />
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black text-mochi-text">Transaction Ledger</h1>
          <p className="text-xs text-mochi-text-muted font-medium">{filtered.length} records found</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="mochi-btn-secondary text-xs py-2 px-3 flex items-center gap-1.5 shadow-xs"
            title="Download CSV statement"
          >
            <Download className="w-3.5 h-3.5 text-mochi-primary" />
            <span className="hidden sm:inline">Export CSV</span>
          </button>
          <button
            onClick={() => setAddModalOpen(true)}
            className="mochi-btn-primary text-xs py-2 px-3 flex items-center gap-1.5 shadow-md active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4" /> Log
          </button>
        </div>
      </div>

      {/* Financial Summary Cards */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-3">
          <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 mb-1">
            <ArrowDownLeft className="w-3.5 h-3.5 shrink-0" />
            <span className="text-[10px] font-bold uppercase tracking-wider">Income</span>
          </div>
          <p className="text-sm font-black text-emerald-600 dark:text-emerald-400">
            {formatCurrency(totalIncome)}
          </p>
        </div>

        <div className="bg-rose-500/10 border border-rose-500/20 rounded-2xl p-3">
          <div className="flex items-center gap-1 text-rose-600 dark:text-rose-400 mb-1">
            <ArrowUpRight className="w-3.5 h-3.5 shrink-0" />
            <span className="text-[10px] font-bold uppercase tracking-wider">Expenses</span>
          </div>
          <p className="text-sm font-black text-rose-600 dark:text-rose-400">
            {formatCurrency(totalExpense)}
          </p>
        </div>

        <div className="bg-sky-500/10 border border-sky-500/20 rounded-2xl p-3">
          <div className="flex items-center gap-1 text-sky-600 dark:text-sky-400 mb-1">
            <Wallet className="w-3.5 h-3.5 shrink-0" />
            <span className="text-[10px] font-bold uppercase tracking-wider">Net Flow</span>
          </div>
          <p className={`text-sm font-black ${netBalance >= 0 ? 'text-sky-600 dark:text-sky-400' : 'text-rose-500'}`}>
            {formatCurrency(netBalance)}
          </p>
        </div>
      </div>

      {/* Search & Sort Controls */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-mochi-text-muted" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="mochi-input pl-9 text-xs font-semibold w-full"
              placeholder="Search by merchant, category, or payment..."
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 p-1">
                <X className="w-3.5 h-3.5 text-mochi-text-muted" />
              </button>
            )}
          </div>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortOption)}
            className="mochi-input text-xs font-bold w-auto appearance-none pr-7"
          >
            <option value="date-desc">Newest</option>
            <option value="date-asc">Oldest</option>
            <option value="amount-desc">Highest Amount</option>
            <option value="amount-asc">Lowest Amount</option>
          </select>
        </div>

        {/* Type Filter Pills */}
        <div className="flex items-center gap-2">
          {[
            { id: 'all', label: 'All Records' },
            { id: 'expense', label: 'Expenses Only' },
            { id: 'income', label: 'Income Only' },
          ].map(({ id, label }) => (
            <button
              key={id}
              onClick={() => setTypeFilter(id as any)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                typeFilter === id
                  ? 'bg-mochi-primary text-white shadow-xs'
                  : 'bg-mochi-surface-alt text-mochi-text-muted hover:text-mochi-text border border-mochi-border'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Transaction List */}
      {filtered.length === 0 ? (
        <div className="text-center py-14 bg-mochi-surface rounded-3xl border border-mochi-border p-6">
          <Search className="w-8 h-8 text-mochi-text-muted mx-auto mb-2 opacity-50" />
          <p className="text-xs font-bold text-mochi-text">No transactions found</p>
          <p className="text-[10px] text-mochi-text-muted mt-1">Try adjusting your search or filter options</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((txn) => {
            const category = categoryMap[txn.categoryId]
            const isIncome = txn.type === 'income'
            const vectorId = getMerchantVectorId(txn.merchant, txn.paymentMethod, category?.icon)

            return (
              <motion.div
                key={txn.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={() => setSelectedTxn(txn)}
                className="mochi-card flex items-center gap-3.5 p-3.5 hover:shadow-md active:scale-[0.99] transition-all cursor-pointer group"
              >
                {/* Category Vector SVG Icon */}
                <div className={cn(
                  'w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 border shadow-xs',
                  isIncome ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-rose-500/10 border-rose-500/20'
                )}>
                  <MochiCategoryVectorSVG id={vectorId} size="sm" />
                </div>

                {/* Main details */}
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-extrabold text-mochi-text truncate group-hover:text-mochi-primary transition-colors">
                    {txn.merchant}
                  </p>
                  <div className="flex items-center gap-1.5 text-[10px] text-mochi-text-muted font-medium mt-0.5">
                    <span>{category?.name || txn.categoryId}</span>
                    <span>•</span>
                    <span>{formatDate(txn.date, 'relative')}</span>
                  </div>
                </div>

                {/* Amount & Method */}
                <div className="text-right shrink-0">
                  <p className={cn(
                    'text-sm font-black',
                    isIncome ? 'text-emerald-500' : 'text-rose-500'
                  )}>
                    {isIncome ? '+' : '-'}{formatCurrency(txn.amount, txn.currency)}
                  </p>
                  <span className="text-[9px] font-bold text-mochi-text-muted bg-mochi-surface-alt px-1.5 py-0.5 rounded-full border border-mochi-border/60">
                    {paymentMethodLabels[txn.paymentMethod] || 'Cash'}
                  </span>
                </div>
              </motion.div>
            )
          })}
        </div>
      )}
    </motion.div>
  )
}
