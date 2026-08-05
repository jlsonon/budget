import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Plus,
  X,
  ArrowUpRight,
  ArrowDownLeft,
  RefreshCw,
  ChevronRight,
  CheckCircle2,
  TrendingUp,
  TrendingDown,
  Minus,
  Trash2,
  AlertTriangle,
  ArrowRightLeft,
  Star,
  ShieldAlert,
} from 'lucide-react'
import { useAppStore } from '@/store/appStore'
import { formatCurrency, formatDate } from '@/lib/utils'
import type { Wallet, WalletType } from '@/types'

// Custom Mochi-style wallet icon SVGs
function WalletTypeSVG({ type, size = 40 }: { type: WalletType; size?: number }) {
  const dim = size
  const configs: Record<WalletType, JSX.Element> = {
    cash: (
      <svg width={dim} height={dim} viewBox="0 0 48 48" fill="none">
        <rect width="48" height="48" rx="16" fill="#FEF3C7" />
        {/* Cute wallet */}
        <rect x="10" y="16" width="28" height="20" rx="6" fill="#FBBF24" stroke="#D97706" strokeWidth="2.5" />
        <rect x="10" y="20" width="28" height="4" fill="#D97706" />
        <rect x="30" y="22" width="8" height="8" rx="4" fill="#FEF3C7" stroke="#D97706" strokeWidth="2" />
        <circle cx="34" cy="26" r="1.5" fill="#D97706" />
        {/* Coin slot top */}
        <path d="M18 16V13C18 11.3431 19.3431 10 21 10H27C28.6569 10 30 11.3431 30 13V16" stroke="#D97706" strokeWidth="2.5" strokeLinecap="round" />
      </svg>
    ),
    digital_bank: (
      <svg width={dim} height={dim} viewBox="0 0 48 48" fill="none">
        <rect width="48" height="48" rx="16" fill="#DBEAFE" />
        {/* Phone */}
        <rect x="15" y="8" width="18" height="32" rx="5" fill="#93C5FD" stroke="#2563EB" strokeWidth="2.5" />
        <rect x="18" y="13" width="12" height="16" rx="2" fill="white" />
        {/* Signal dots */}
        <circle cx="21" cy="35" r="1.5" fill="#2563EB" />
        <circle cx="24" cy="35" r="1.5" fill="#2563EB" />
        <circle cx="27" cy="35" r="1.5" fill="#DBEAFE" />
        {/* Mini chart on screen */}
        <path d="M20 26L22 22L25 24L28 20" stroke="#2563EB" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    traditional_bank: (
      <svg width={dim} height={dim} viewBox="0 0 48 48" fill="none">
        <rect width="48" height="48" rx="16" fill="#FEE2E2" />
        {/* Building */}
        <path d="M24 10L38 18H10L24 10Z" fill="#FCA5A5" stroke="#DC2626" strokeWidth="2.5" strokeLinejoin="round" />
        <rect x="13" y="18" width="4" height="16" fill="#FCA5A5" stroke="#DC2626" strokeWidth="1.5" />
        <rect x="22" y="18" width="4" height="16" fill="#FCA5A5" stroke="#DC2626" strokeWidth="1.5" />
        <rect x="31" y="18" width="4" height="16" fill="#FCA5A5" stroke="#DC2626" strokeWidth="1.5" />
        <rect x="10" y="34" width="28" height="4" rx="2" fill="#DC2626" />
      </svg>
    ),
    credit_card: (
      <svg width={dim} height={dim} viewBox="0 0 48 48" fill="none">
        <rect width="48" height="48" rx="16" fill="#EDE9FE" />
        <rect x="9" y="14" width="30" height="20" rx="5" fill="#C4B5FD" stroke="#7C3AED" strokeWidth="2.5" />
        <rect x="9" y="20" width="30" height="6" fill="#7C3AED" />
        <rect x="12" y="29" width="8" height="3" rx="1.5" fill="#EDE9FE" />
        <rect x="22" y="29" width="5" height="3" rx="1.5" fill="#EDE9FE" />
        <circle cx="35" cy="17" r="3" fill="#F59E0B" />
        <circle cx="38" cy="17" r="3" fill="#FDE68A" fillOpacity="0.8" />
      </svg>
    ),
    savings: (
      <svg width={dim} height={dim} viewBox="0 0 48 48" fill="none">
        <rect width="48" height="48" rx="16" fill="#D1FAE5" />
        {/* Coin jar */}
        <path d="M18 14H30V16C30 16 34 18 34 24V34C34 36.2091 32.2091 38 30 38H18C15.7909 38 14 36.2091 14 34V24C14 18 18 16 18 16V14Z" fill="#6EE7B7" stroke="#059669" strokeWidth="2.5" />
        <rect x="17" y="11" width="14" height="5" rx="2.5" fill="#A7F3D0" stroke="#059669" strokeWidth="2" />
        {/* Coin slot */}
        <rect x="21" y="9" width="6" height="2.5" rx="1.25" fill="#059669" />
        {/* Coins inside */}
        <ellipse cx="24" cy="28" rx="5" ry="2" fill="#FCD34D" stroke="#D97706" strokeWidth="1.5" />
        <ellipse cx="24" cy="32" rx="5" ry="2" fill="#FBBF24" stroke="#D97706" strokeWidth="1.5" />
      </svg>
    ),
    emergency: (
      <svg width={dim} height={dim} viewBox="0 0 48 48" fill="none">
        <rect width="48" height="48" rx="16" fill="#F3E8FF" />
        {/* Safe */}
        <rect x="10" y="12" width="28" height="28" rx="6" fill="#C084FC" stroke="#7E22CE" strokeWidth="2.5" />
        <circle cx="24" cy="26" r="6" fill="#F3E8FF" stroke="#7E22CE" strokeWidth="2" />
        <circle cx="24" cy="26" r="2" fill="#7E22CE" />
        <path d="M24 20V22M24 30V32M18 26H20M28 26H30" stroke="#7E22CE" strokeWidth="2" strokeLinecap="round" />
        <rect x="32" y="24" width="5" height="4" rx="1.5" fill="#7E22CE" />
      </svg>
    ),
    investment: (
      <svg width={dim} height={dim} viewBox="0 0 48 48" fill="none">
        <rect width="48" height="48" rx="16" fill="#ECFDF5" />
        {/* Growing plant */}
        <path d="M24 36V24" stroke="#059669" strokeWidth="3" strokeLinecap="round" />
        <path d="M24 28C24 28 18 24 16 18C20 17 24 21 24 21" fill="#6EE7B7" stroke="#059669" strokeWidth="2" strokeLinejoin="round" />
        <path d="M24 24C24 24 30 20 32 14C28 13 24 17 24 17" fill="#A7F3D0" stroke="#059669" strokeWidth="2" strokeLinejoin="round" />
        {/* Arrow up */}
        <path d="M30 15L34 11L38 15" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M34 11V19" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round" />
      </svg>
    ),
    paypal: (
      <svg width={dim} height={dim} viewBox="0 0 48 48" fill="none">
        <rect width="48" height="48" rx="16" fill="#E0F2FE" />
        {/* Stylized globe / PayPal */}
        <circle cx="24" cy="24" r="14" fill="#BAE6FD" stroke="#0284C7" strokeWidth="2.5" />
        <path d="M14 24H34" stroke="#0284C7" strokeWidth="2" strokeDasharray="3 2" />
        <path d="M24 10C24 10 20 17 20 24C20 31 24 38 24 38" stroke="#0284C7" strokeWidth="2" />
        <path d="M24 10C24 10 28 17 28 24C28 31 24 38 24 38" stroke="#0284C7" strokeWidth="2" />
      </svg>
    ),
  }

  return configs[type] || configs['cash']
}

const walletTypeLabels: Record<WalletType, string> = {
  cash: 'Cash',
  digital_bank: 'Digital Bank / E-Wallet',
  traditional_bank: 'Bank Account',
  credit_card: 'Credit Card',
  savings: 'Savings Fund',
  emergency: 'Emergency Fund',
  investment: 'Investment',
  paypal: 'Online / PayPal',
}

const walletTypeOptions: { value: WalletType; label: string }[] = Object.entries(walletTypeLabels).map(
  ([value, label]) => ({ value: value as WalletType, label })
)

const paletteColors = [
  '#F59E0B', '#EF4444', '#3B82F6', '#10B981', '#8B5CF6',
  '#EC4899', '#F97316', '#06B6D4', '#84CC16', '#6366F1',
]

interface AddWalletSheetProps {
  isOpen: boolean
  onClose: () => void
}

function AddWalletSheet({ isOpen, onClose }: AddWalletSheetProps) {
  const { addWallet } = useAppStore()
  const [name, setName] = useState('')
  const [type, setType] = useState<WalletType>('cash')
  const [balance, setBalance] = useState('')
  const [color, setColor] = useState(paletteColors[0])
  const [saved, setSaved] = useState(false)

  const handleSave = () => {
    if (!name.trim() || isNaN(parseFloat(balance))) return
    addWallet({
      id: `w_${Date.now()}`,
      userId: '1',
      name: name.trim(),
      type,
      balance: parseFloat(balance),
      currency: 'PHP',
      color,
      isDefault: false,
      includeInTotal: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })
    setSaved(true)
    setTimeout(() => {
      setSaved(false)
      setName('')
      setBalance('')
      setType('cash')
      setColor(paletteColors[0])
      onClose()
    }, 1000)
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-[60] bg-mochi-surface rounded-t-3xl border-t border-mochi-border shadow-2xl"
          >
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 rounded-full bg-mochi-border" />
            </div>
            <div className="flex items-center justify-between px-5 py-3 border-b border-mochi-border">
              <h3 className="text-base font-bold text-mochi-text">Add New Wallet</h3>
              <button onClick={onClose} className="p-1.5 rounded-full hover:bg-mochi-surface-alt text-mochi-text-muted">
                <X className="w-4 h-4" />
              </button>
            </div>

            {saved ? (
              <div className="py-10 flex flex-col items-center gap-3">
                <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center">
                  <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                </div>
                <p className="font-bold text-mochi-text">Wallet Added!</p>
              </div>
            ) : (
              <div className="px-5 py-5 space-y-4">
                {/* Preview */}
                <div className="flex items-center gap-4 p-4 rounded-2xl border border-mochi-border bg-mochi-surface-alt">
                  <WalletTypeSVG type={type} size={48} />
                  <div>
                    <p className="font-bold text-mochi-text text-sm">{name || 'Wallet Name'}</p>
                    <p className="text-xs text-mochi-text-muted">{walletTypeLabels[type]}</p>
                    <p className="text-sm font-bold text-mochi-primary">₱{parseFloat(balance || '0').toLocaleString()}</p>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-mochi-text-secondary mb-1">Wallet Name *</label>
                  <input
                    type="text"
                    placeholder="e.g. GCash, BPI Savings, Cash Wallet"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="mochi-input text-xs font-semibold w-full"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-mochi-text-secondary mb-1">Type</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as WalletType)}
                    className="mochi-input text-xs font-semibold w-full"
                  >
                    {walletTypeOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-mochi-text-secondary mb-1">Current Balance (PHP) *</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-mochi-text-muted">₱</span>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={balance}
                      onChange={(e) => setBalance(e.target.value)}
                      className="mochi-input pl-7 text-sm font-bold w-full"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-mochi-text-secondary mb-2">Color</label>
                  <div className="flex gap-2 flex-wrap">
                    {paletteColors.map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setColor(c)}
                        className={`w-7 h-7 rounded-full border-2 transition-transform ${color === c ? 'scale-125 border-white shadow-lg' : 'border-transparent'}`}
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                </div>

                <button
                  onClick={handleSave}
                  disabled={!name.trim() || isNaN(parseFloat(balance))}
                  className="w-full py-3 rounded-2xl bg-gradient-mochi text-white font-extrabold text-sm shadow-md disabled:opacity-50"
                >
                  Add Wallet
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

/* ─── Transfer Funds Sheet ────────────────────────────────────────────── */
function TransferFundsSheet({
  isOpen,
  onClose,
  initialSourceId,
}: {
  isOpen: boolean
  onClose: () => void
  initialSourceId?: string
}) {
  const { wallets, adjustWalletBalance, addTransaction } = useAppStore()
  const [fromId, setFromId] = useState(initialSourceId || wallets[0]?.id || '')
  const [toId, setToId] = useState(wallets.find((w) => w.id !== initialSourceId)?.id || wallets[1]?.id || '')
  const [amount, setAmount] = useState('')
  const [fee, setFee] = useState('0')
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  const sourceWallet = wallets.find((w) => w.id === fromId)
  const destWallet = wallets.find((w) => w.id === toId)

  const handleTransfer = () => {
    setStatus('idle')
    const parsedAmount = parseFloat(amount)
    const parsedFee = parseFloat(fee) || 0

    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setStatus('error')
      setErrorMsg('Please enter a valid transfer amount greater than 0.')
      return
    }

    if (!fromId || !toId || fromId === toId) {
      setStatus('error')
      setErrorMsg('Please select two different wallets for transfer.')
      return
    }

    const totalDeduction = parsedAmount + parsedFee
    if (sourceWallet && totalDeduction > sourceWallet.balance) {
      setStatus('error')
      setErrorMsg(
        `Insufficient balance in ${sourceWallet.name}! Available: ₱${sourceWallet.balance.toLocaleString()}, Required: ₱${totalDeduction.toLocaleString()}.`
      )
      return
    }

    // Adjust balances
    adjustWalletBalance(fromId, -totalDeduction)
    adjustWalletBalance(toId, parsedAmount)

    // Log transaction
    addTransaction({
      id: `txn_transfer_${Date.now()}`,
      userId: '1',
      type: 'transfer',
      amount: parsedAmount,
      currency: 'PHP',
      categoryId: 'other',
      merchant: `Transfer: ${sourceWallet?.name || 'Wallet'} ➔ ${destWallet?.name || 'Wallet'}`,
      paymentMethod: 'other',
      walletId: fromId,
      date: new Date().toISOString().split('T')[0],
      isFavorite: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })

    setStatus('success')
    setTimeout(() => {
      setStatus('idle')
      setAmount('')
      onClose()
    }, 1200)
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-[60] bg-mochi-surface rounded-t-3xl border-t border-mochi-border shadow-2xl max-w-lg mx-auto"
          >
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 rounded-full bg-mochi-border" />
            </div>
            <div className="flex items-center justify-between px-5 py-3 border-b border-mochi-border">
              <div className="flex items-center gap-2">
                <ArrowRightLeft className="w-4 h-4 text-blue-500" />
                <h3 className="text-base font-black text-mochi-text">Transfer Funds</h3>
              </div>
              <button onClick={onClose} className="p-1.5 rounded-full hover:bg-mochi-surface-alt text-mochi-text-muted">
                <X className="w-4 h-4" />
              </button>
            </div>

            {status === 'success' ? (
              <div className="py-10 flex flex-col items-center gap-3 text-center">
                <div className="w-14 h-14 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center">
                  <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                </div>
                <p className="font-black text-mochi-text text-base">Transfer Complete!</p>
                <p className="text-xs text-mochi-text-muted">
                  Moved ₱{parseFloat(amount).toLocaleString()} from {sourceWallet?.name} to {destWallet?.name}
                </p>
              </div>
            ) : (
              <div className="p-5 space-y-4">
                {status === 'error' && (
                  <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-300 rounded-2xl text-xs font-bold flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 shrink-0" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                {/* From / To Row */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-mochi-text-secondary mb-1">From Wallet</label>
                    <select
                      value={fromId}
                      onChange={(e) => setFromId(e.target.value)}
                      className="mochi-input text-xs font-bold w-full"
                    >
                      {wallets.map((w) => (
                        <option key={w.id} value={w.id}>
                          {w.name}
                        </option>
                      ))}
                    </select>
                    {sourceWallet && (
                      <p className="text-[10px] text-mochi-text-muted font-medium mt-1">
                        Balance: ₱{sourceWallet.balance.toLocaleString()}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-mochi-text-secondary mb-1">To Wallet</label>
                    <select
                      value={toId}
                      onChange={(e) => setToId(e.target.value)}
                      className="mochi-input text-xs font-bold w-full"
                    >
                      {wallets.map((w) => (
                        <option key={w.id} value={w.id}>
                          {w.name}
                        </option>
                      ))}
                    </select>
                    {destWallet && (
                      <p className="text-[10px] text-mochi-text-muted font-medium mt-1">
                        Balance: ₱{destWallet.balance.toLocaleString()}
                      </p>
                    )}
                  </div>
                </div>

                {/* Amount */}
                <div>
                  <label className="block text-xs font-bold text-mochi-text-secondary mb-1">Amount to Transfer (PHP) *</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-base font-bold text-mochi-text-muted">₱</span>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="mochi-input pl-8 text-base font-bold w-full"
                    />
                  </div>
                </div>

                {/* Transfer Fee */}
                <div>
                  <label className="block text-xs font-bold text-mochi-text-secondary mb-1">Transfer Fee (Optional)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-mochi-text-muted">₱</span>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={fee}
                      onChange={(e) => setFee(e.target.value)}
                      className="mochi-input pl-7 text-xs font-bold w-full"
                    />
                  </div>
                </div>

                <button
                  onClick={handleTransfer}
                  className="w-full py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs shadow-md transition-all active:scale-95"
                >
                  Confirm Fund Transfer
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

/* ─── Wallet Detail Sheet ─────────────────────────────────────────────── */
function WalletDetailSheet({
  wallet,
  onClose,
  onDelete,
  onOpenTransfer,
}: {
  wallet: Wallet | null
  onClose: () => void
  onDelete: (id: string) => void
  onOpenTransfer?: (sourceId?: string) => void
}) {
  const { transactions, wallets, updateWallet, setAddModalOpen } = useAppStore()
  const [confirmDelete, setConfirmDelete] = useState(false)

  if (!wallet) return null

  const totalAssets = wallets
    .filter((w) => w.includeInTotal)
    .reduce((s, w) => s + w.balance, 0)
  const sharePercent = totalAssets > 0 ? Math.round((wallet.balance / totalAssets) * 100) : 0

  // Last 5 transactions tied to this wallet
  const walletTxs = transactions
    .filter((t) => (t as any).walletId === wallet.id)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5)

  const handleDelete = () => {
    if (confirmDelete) {
      onDelete(wallet.id)
      onClose()
    } else {
      setConfirmDelete(true)
      setTimeout(() => setConfirmDelete(false), 3000)
    }
  }

  // Accent color derived from wallet.color
  const accent = wallet.color || '#6366F1'

  return (
    <AnimatePresence>
      <motion.div
        key="detail-overlay"
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
          className="w-full max-w-lg bg-mochi-surface rounded-t-3xl border-t border-mochi-border shadow-2xl overflow-hidden"
          style={{ maxHeight: '90vh', overflowY: 'auto' }}
        >
          {/* Coloured Header */}
          <div
            className="p-6 pb-5 relative overflow-hidden"
            style={{ background: `linear-gradient(135deg, ${accent}22 0%, ${accent}08 100%)` }}
          >
            <div className="absolute -top-6 -right-6 w-32 h-32 rounded-full blur-2xl opacity-30" style={{ background: accent }} />
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-md"
                  style={{ background: accent }}
                >
                  {wallet.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest opacity-60 text-mochi-text">
                    {walletTypeLabels[wallet.type]}
                  </p>
                  <h3 className="text-lg font-black text-mochi-text">{wallet.name}</h3>
                </div>
              </div>
              <button onClick={onClose} className="p-2 rounded-full hover:bg-mochi-surface-alt transition-colors">
                <X className="w-5 h-5 text-mochi-text-muted" />
              </button>
            </div>

            {/* Big Balance */}
            <div className="mt-4">
              <p className="text-[10px] font-bold uppercase tracking-widest text-mochi-text-muted">Current Balance</p>
              <p className="text-4xl font-black text-mochi-text mt-0.5">
                {formatCurrency(wallet.balance, wallet.currency)}
              </p>
            </div>

            {/* Share of total bar */}
            {wallet.includeInTotal && totalAssets > 0 && (
              <div className="mt-4">
                <div className="flex justify-between text-[10px] font-bold text-mochi-text-muted mb-1">
                  <span>Share of Total Assets</span>
                  <span style={{ color: accent }}>{sharePercent}%</span>
                </div>
                <div className="h-2 bg-mochi-border/40 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${sharePercent}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                    className="h-full rounded-full"
                    style={{ background: accent }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-3 gap-2 px-5 py-4 border-b border-mochi-border">
            <button
              onClick={() => { onClose(); setAddModalOpen(true) }}
              className="flex flex-col items-center gap-1.5 py-3 rounded-2xl font-bold text-xs bg-rose-50 dark:bg-rose-900/20 text-rose-500 transition-all active:scale-95"
            >
              <ArrowUpRight className="w-5 h-5 text-rose-500" />
              <span className="text-mochi-text">Expense</span>
            </button>
            <button
              onClick={() => { onClose(); setAddModalOpen(true) }}
              className="flex flex-col items-center gap-1.5 py-3 rounded-2xl font-bold text-xs bg-emerald-50 dark:bg-emerald-900/20 text-emerald-500 transition-all active:scale-95"
            >
              <ArrowDownLeft className="w-5 h-5 text-emerald-500" />
              <span className="text-mochi-text">Income</span>
            </button>
            <button
              onClick={() => {
                onClose()
                if (onOpenTransfer) onOpenTransfer(wallet.id)
              }}
              className="flex flex-col items-center gap-1.5 py-3 rounded-2xl font-bold text-xs bg-blue-50 dark:bg-blue-900/20 text-blue-500 transition-all active:scale-95"
            >
              <RefreshCw className="w-5 h-5 text-blue-500" />
              <span className="text-mochi-text">Transfer</span>
            </button>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-2 gap-3 px-5 py-4 border-b border-mochi-border">
            <div className="bg-mochi-surface-alt rounded-2xl p-3 border border-mochi-border/50">
              <div className="flex items-center gap-1.5 text-emerald-500 mb-1">
                <TrendingUp className="w-3.5 h-3.5" />
                <span className="text-[10px] font-bold uppercase tracking-wide">Money In</span>
              </div>
              <p className="text-sm font-black text-mochi-text">
                {formatCurrency(
                  walletTxs.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0),
                  wallet.currency
                )}
              </p>
            </div>
            <div className="bg-mochi-surface-alt rounded-2xl p-3 border border-mochi-border/50">
              <div className="flex items-center gap-1.5 text-rose-500 mb-1">
                <TrendingDown className="w-3.5 h-3.5" />
                <span className="text-[10px] font-bold uppercase tracking-wide">Money Out</span>
              </div>
              <p className="text-sm font-black text-mochi-text">
                {formatCurrency(
                  walletTxs.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0),
                  wallet.currency
                )}
              </p>
            </div>
          </div>

          {/* Recent Transactions */}
          <div className="px-5 py-4">
            <h4 className="text-xs font-black text-mochi-text mb-3 uppercase tracking-wide">Recent Transactions</h4>
            {walletTxs.length === 0 ? (
              <div className="text-center py-8">
                <Minus className="w-8 h-8 text-mochi-border mx-auto mb-2" />
                <p className="text-xs text-mochi-text-muted font-semibold">No transactions yet</p>
                <p className="text-[10px] text-mochi-text-muted mt-1">Transactions added via this wallet will appear here</p>
              </div>
            ) : (
              <div className="space-y-2">
                {walletTxs.map((tx) => (
                  <div
                    key={tx.id}
                    className="flex items-center gap-3 p-3 rounded-2xl bg-mochi-surface-alt border border-mochi-border/40"
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                      tx.type === 'income' ? 'bg-emerald-100 dark:bg-emerald-900/30' : 'bg-rose-100 dark:bg-rose-900/30'
                    }`}>
                      {tx.type === 'income'
                        ? <ArrowDownLeft className="w-4 h-4 text-emerald-500" />
                        : <ArrowUpRight className="w-4 h-4 text-rose-500" />
                      }
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-mochi-text truncate">{tx.categoryId || tx.type}</p>
                      <p className="text-[10px] text-mochi-text-muted">{formatDate(tx.date, 'relative')}</p>
                    </div>
                    <p className={`text-sm font-extrabold shrink-0 ${
                      tx.type === 'income' ? 'text-emerald-500' : 'text-rose-500'
                    }`}>
                      {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount, wallet.currency)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Delete & Set Default */}
          <div className="px-5 pb-8 space-y-2">
            {!wallet.isDefault && (
              <button
                onClick={() => {
                  wallets.forEach((w) => updateWallet(w.id, { isDefault: w.id === wallet.id }))
                  onClose()
                }}
                className="w-full py-3 rounded-2xl text-xs font-bold bg-mochi-surface-alt text-mochi-primary border border-mochi-primary/30 flex items-center justify-center gap-2 hover:bg-mochi-primary/10 transition-all"
              >
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" /> Set as Default Primary Wallet
              </button>
            )}
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
                <><Trash2 className="w-4 h-4" /> Remove Wallet</>
              )}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

/* ─── Main WalletsPage ────────────────────────────────────────────────── */
export default function WalletsPage() {
  const { wallets, deleteWallet } = useAppStore()
  const [showAddSheet, setShowAddSheet] = useState(false)
  const [showTransferSheet, setShowTransferSheet] = useState(false)
  const [transferSourceId, setTransferSourceId] = useState<string | undefined>()
  const [selectedWallet, setSelectedWallet] = useState<Wallet | null>(null)

  const totalAssets = wallets
    .filter((w) => w.includeInTotal)
    .reduce((sum, w) => sum + w.balance, 0)

  const walletsByType: Record<string, Wallet[]> = {
    'Cash': wallets.filter((w) => w.type === 'cash'),
    'Digital Banks & E-Wallets': wallets.filter((w) => w.type === 'digital_bank'),
    'Bank Accounts': wallets.filter((w) => w.type === 'traditional_bank'),
    'Credit Cards': wallets.filter((w) => w.type === 'credit_card'),
    'Savings & Funds': wallets.filter((w) => ['savings', 'emergency', 'investment'].includes(w.type)),
    'Other': wallets.filter((w) => w.type === 'paypal'),
  }


  return (
    <motion.div
      className="space-y-5 pb-8"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <AddWalletSheet isOpen={showAddSheet} onClose={() => setShowAddSheet(false)} />
      <TransferFundsSheet
        isOpen={showTransferSheet}
        initialSourceId={transferSourceId}
        onClose={() => {
          setShowTransferSheet(false)
          setTransferSourceId(undefined)
        }}
      />
      {selectedWallet && (
        <WalletDetailSheet
          wallet={selectedWallet}
          onClose={() => setSelectedWallet(null)}
          onDelete={(id) => { deleteWallet(id); setSelectedWallet(null) }}
          onOpenTransfer={(sourceId) => {
            setTransferSourceId(sourceId)
            setShowTransferSheet(true)
          }}
        />
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black text-mochi-text">Wallets & Accounts</h1>
          <p className="text-xs text-mochi-text-muted font-medium">Manage cash, e-wallets, & bank accounts</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setTransferSourceId(undefined)
              setShowTransferSheet(true)
            }}
            className="mochi-btn-secondary text-xs py-2 px-3 flex items-center gap-1.5 shadow-xs"
          >
            <ArrowRightLeft className="w-3.5 h-3.5 text-blue-500" />
            <span>Transfer</span>
          </button>
          <button
            onClick={() => setShowAddSheet(true)}
            className="mochi-btn-primary text-xs py-2 px-3 flex items-center gap-1.5 shadow-md active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4" /> Add Wallet
          </button>
        </div>
      </div>

      {/* Total Assets Hero */}
      <motion.div
        className="mochi-card bg-gradient-to-br from-mochi-primary/10 via-mochi-secondary/10 to-transparent border-mochi-primary/20 text-center py-6 relative overflow-hidden"
        initial={{ scale: 0.97 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.4 }}
      >
        {/* BG decoration */}
        <div className="absolute -top-8 -right-8 w-32 h-32 bg-mochi-primary/5 rounded-full blur-2xl" />
        <div className="absolute -bottom-6 -left-8 w-24 h-24 bg-mochi-secondary/5 rounded-full blur-2xl" />

        <p className="text-xs font-bold text-mochi-text-muted uppercase tracking-widest mb-1">Total Assets</p>
        <motion.p
          className="text-4xl font-black text-mochi-text"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          {formatCurrency(totalAssets, 'PHP')}
        </motion.p>
        <p className="text-xs text-mochi-text-muted mt-1">{wallets.filter((w) => w.includeInTotal).length} wallets tracked</p>

        {/* Asset Allocation Breakdown Bar */}
        {totalAssets > 0 && (
          <div className="mt-5 text-left">
            <div className="flex justify-between items-center text-[10px] font-bold text-mochi-text-muted mb-1.5">
              <span>Asset Allocation</span>
              <span>100% Tracked</span>
            </div>
            <div className="h-3 bg-mochi-border/40 rounded-full overflow-hidden flex gap-0.5 p-0.5">
              {Object.entries({
                Cash: wallets.filter((w) => w.type === 'cash').reduce((s, w) => s + w.balance, 0),
                'E-Wallets': wallets.filter((w) => w.type === 'digital_bank').reduce((s, w) => s + w.balance, 0),
                Banks: wallets.filter((w) => w.type === 'traditional_bank').reduce((s, w) => s + w.balance, 0),
                Savings: wallets.filter((w) => ['savings', 'emergency', 'investment'].includes(w.type)).reduce((s, w) => s + w.balance, 0),
              }).map(([label, val], idx) => {
                const pct = Math.round((val / totalAssets) * 100)
                if (pct <= 0) return null
                const colors = ['bg-amber-400', 'bg-sky-400', 'bg-rose-400', 'bg-emerald-400']
                return (
                  <div
                    key={label}
                    className={`h-full rounded-full ${colors[idx % colors.length]}`}
                    style={{ width: `${pct}%` }}
                    title={`${label}: ₱${val.toLocaleString()} (${pct}%)`}
                  />
                )
              })}
            </div>
          </div>
        )}
      </motion.div>

      {/* Quick Actions */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { icon: ArrowUpRight, label: 'Expense', color: 'bg-rose-100 text-rose-600 dark:bg-rose-900/20 dark:text-rose-400' },
          { icon: ArrowDownLeft, label: 'Income', color: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400' },
          { icon: RefreshCw, label: 'Transfer', color: 'bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400' },
        ].map((action) => {
          const Icon = action.icon
          return (
            <button
              key={action.label}
              className="mochi-card flex flex-col items-center gap-2 py-4 hover:shadow-md active:scale-95 transition-all"
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${action.color}`}>
                <Icon className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-mochi-text">{action.label}</span>
            </button>
          )
        })}
      </div>

      {/* Wallet Groups */}
      {Object.entries(walletsByType).map(([groupLabel, groupWallets]) => {
        if (groupWallets.length === 0) return null
        return (
          <section key={groupLabel}>
            <h2 className="text-xs font-bold text-mochi-text-muted uppercase tracking-wider mb-2">{groupLabel}</h2>
            <div className="space-y-2">
              {groupWallets.map((wallet, i) => (
                <motion.div
                  key={wallet.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  onClick={() => setSelectedWallet(wallet)}
                  className="mochi-card flex items-center gap-4 hover:shadow-md active:scale-[0.99] transition-all cursor-pointer group"
                >
                  {/* Color dot */}
                  <div className="relative shrink-0">
                    <WalletTypeSVG type={wallet.type} size={44} />
                    <div
                      className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-mochi-surface"
                      style={{ background: wallet.color }}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-mochi-text truncate">{wallet.name}</p>
                    <p className="text-[10px] text-mochi-text-muted">{walletTypeLabels[wallet.type]}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-base font-black text-mochi-text">
                      {formatCurrency(wallet.balance, wallet.currency)}
                    </p>
                    {wallet.isDefault && (
                      <span className="text-[9px] font-bold text-mochi-primary bg-mochi-primary/10 px-1.5 py-0.5 rounded-full">Default</span>
                    )}
                  </div>
                  <ChevronRight className="w-4 h-4 text-mochi-text-muted shrink-0 group-hover:translate-x-0.5 transition-transform" />
                </motion.div>
              ))}
            </div>
          </section>
        )
      })}

      {wallets.length === 0 && (
        <div className="mochi-card text-center py-10 flex flex-col items-center gap-3">
          <div className="w-16 h-16 bg-mochi-surface-alt rounded-full flex items-center justify-center">
            <WalletTypeSVG type="cash" size={40} />
          </div>
          <p className="font-bold text-mochi-text">No wallets yet</p>
          <p className="text-xs text-mochi-text-muted max-w-xs">
            Add your first wallet to start tracking your cash, bank accounts, and e-wallets.
          </p>
          <button
            onClick={() => setShowAddSheet(true)}
            className="mt-2 px-4 py-2 bg-gradient-mochi text-white rounded-2xl text-xs font-extrabold shadow-md"
          >
            Add First Wallet
          </button>
        </div>
      )}
    </motion.div>
  )
}
