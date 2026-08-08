import { useState } from 'react'
import { motion } from 'framer-motion'
import { X, ArrowRightLeft, CheckCircle2, AlertCircle, Globe } from 'lucide-react'
import { useAppStore } from '@/store/appStore'
import { useForexStore } from '@/store/forexStore'
import { useToastStore } from '@/store/toastStore'
import Dialog from '@/components/ui/Dialog'
import { formatCurrency } from '@/lib/utils'
import type { Transaction } from '@/types'

interface TransferModalProps {
  isOpen: boolean
  onClose: () => void
}

export function TransferModal({ isOpen, onClose }: TransferModalProps) {
  const { wallets, addTransaction } = useAppStore()
  const { getRate } = useForexStore()

  const [fromWalletId, setFromWalletId] = useState<string>(wallets[0]?.id || '')
  const [toWalletId, setToWalletId] = useState<string>(wallets[1]?.id || wallets[0]?.id || '')
  const [amount, setAmount] = useState('')
  const [customRate, setCustomRate] = useState<string>('')
  const [notes, setNotes] = useState('')

  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  const fromWallet = wallets.find((w) => w.id === fromWalletId) || wallets[0]
  const toWallet = wallets.find((w) => w.id === toWalletId) || wallets[1] || wallets[0]

  const isCrossCurrency = fromWallet && toWallet && fromWallet.currency !== toWallet.currency
  const autoRate = isCrossCurrency ? getRate(fromWallet.currency, toWallet.currency) : 1
  const activeRate = customRate ? parseFloat(customRate) || autoRate : autoRate

  const parsedAmount = parseFloat(amount) || 0
  const targetReceivedAmount = isCrossCurrency ? parsedAmount * activeRate : parsedAmount

  const handleTransfer = (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('idle')

    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setStatus('error')
      setErrorMessage('Hmm, that doesn\'t look right. Please enter an amount greater than zero.')
      return
    }

    if (!fromWallet || !toWallet) {
      setStatus('error')
      setErrorMessage('Please pick both a source and destination wallet to continue.')
      return
    }

    if (fromWallet.id === toWallet.id) {
      setStatus('error')
      setErrorMessage('The source and destination wallets need to be different!')
      return
    }

    if (parsedAmount > fromWallet.balance) {
      setStatus('error')
      setErrorMessage(
        `${fromWallet.name} only has ${formatCurrency(fromWallet.balance, fromWallet.currency)} available. Try a smaller amount!`
      )
      return
    }

    const date = new Date().toISOString().split('T')[0]
    const now = new Date().toISOString()

    const transferOutTxn: Transaction = {
      id: `txn_tr_out_${Date.now()}`,
      userId: fromWallet.userId || '1',
      type: 'expense',
      amount: parsedAmount,
      currency: fromWallet.currency,
      categoryId: 'other',
      merchant: `Transfer Out to ${toWallet.name}`,
      paymentMethod: 'bank_transfer',
      walletId: fromWallet.id,
      date,
      notes: notes.trim() || `Inter-wallet transfer to ${toWallet.name}`,
      isFavorite: false,
      createdAt: now,
      updatedAt: now,
    }

    const transferInTxn: Transaction = {
      id: `txn_tr_in_${Date.now()}`,
      userId: toWallet.userId || '1',
      type: 'income',
      amount: targetReceivedAmount,
      currency: toWallet.currency,
      categoryId: 'other_income',
      merchant: `Transfer In from ${fromWallet.name}`,
      paymentMethod: 'bank_transfer',
      walletId: toWallet.id,
      date,
      notes: notes.trim() || `Inter-wallet transfer from ${fromWallet.name} (Forex: 1 ${fromWallet.currency} = ${activeRate.toFixed(4)} ${toWallet.currency})`,
      isFavorite: false,
      createdAt: now,
      updatedAt: now,
    }

    addTransaction(transferOutTxn)
    addTransaction(transferInTxn)

    useToastStore.getState().transfer(
      `Moved ${formatCurrency(parsedAmount, fromWallet.currency)} from ${fromWallet.name} to ${toWallet.name}`,
      'Money Transferred'
    )

    setStatus('success')

    setTimeout(() => {
      setStatus('idle')
      setAmount('')
      setCustomRate('')
      setNotes('')
      onClose()
    }, 1400)
  }

  return (
    <Dialog isOpen={isOpen} onClose={onClose} size="md">
      <div className="space-y-4">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-mochi-border">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center border border-amber-400/20">
              <ArrowRightLeft className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-mochi-text">Move Money</h3>
              <p className="text-xs text-mochi-text-secondary">Transfer between your wallets</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-mochi-surface-alt text-mochi-text-muted hover:text-mochi-text transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error Banner */}
        {status === 'error' && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-300 rounded-2xl text-xs font-semibold flex items-center gap-2"
          >
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </motion.div>
        )}

        {/* Success Banner */}
        {status === 'success' ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="py-8 text-center space-y-3 bg-mochi-surface rounded-3xl border border-mochi-success/30 p-6"
          >
            <div className="w-14 h-14 bg-emerald-500/20 text-emerald-500 rounded-full flex items-center justify-center mx-auto border border-emerald-500/40 animate-bounce">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h4 className="text-lg font-black text-mochi-text">Transfer Completed!</h4>
            <p className="text-xs text-mochi-text-secondary max-w-xs mx-auto">
              Moved <strong>{formatCurrency(parsedAmount, fromWallet?.currency || 'PHP')}</strong> from {fromWallet?.name} to {toWallet?.name} (Received <strong>{formatCurrency(targetReceivedAmount, toWallet?.currency || 'PHP')}</strong>).
            </p>
          </motion.div>
        ) : (
          <form onSubmit={handleTransfer} className="space-y-4">
            {/* Wallets Selection Grid */}
            <div className="grid grid-cols-2 gap-3 p-3 bg-mochi-surface-alt rounded-2xl border border-mochi-border">
              {/* From Wallet */}
              <div>
                <label className="block text-[10px] font-extrabold uppercase tracking-wider text-rose-500 mb-1">
                  From (Source)
                </label>
                <select
                  value={fromWalletId}
                  onChange={(e) => setFromWalletId(e.target.value)}
                  className="mochi-input text-xs font-bold w-full cursor-pointer"
                >
                  {wallets.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.name} ({formatCurrency(w.balance, w.currency)})
                    </option>
                  ))}
                </select>
                {fromWallet && (
                  <p className="text-[10px] text-mochi-text-muted mt-1 font-semibold truncate">
                    Avail: {formatCurrency(fromWallet.balance, fromWallet.currency)}
                  </p>
                )}
              </div>

              {/* To Wallet */}
              <div>
                <label className="block text-[10px] font-extrabold uppercase tracking-wider text-emerald-500 mb-1">
                  To (Target)
                </label>
                <select
                  value={toWalletId}
                  onChange={(e) => setToWalletId(e.target.value)}
                  className="mochi-input text-xs font-bold w-full cursor-pointer"
                >
                  {wallets.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.name} ({formatCurrency(w.balance, w.currency)})
                    </option>
                  ))}
                </select>
                {toWallet && (
                  <p className="text-[10px] text-mochi-text-muted mt-1 font-semibold truncate">
                    Avail: {formatCurrency(toWallet.balance, toWallet.currency)}
                  </p>
                )}
              </div>
            </div>

            {/* Cross Currency Forex Conversion Notice */}
            {isCrossCurrency && (
              <div className="p-3 bg-gradient-to-r from-mochi-primary/10 via-purple-500/10 to-transparent border border-mochi-primary/30 rounded-2xl space-y-2 text-xs">
                <div className="flex items-center justify-between font-bold text-mochi-text">
                  <span className="flex items-center gap-1.5 text-mochi-primary font-black">
                    <Globe className="w-4 h-4" /> Multi-Currency Forex Transfer
                  </span>
                  <span className="text-[10px] bg-mochi-primary/20 text-mochi-primary px-2 py-0.5 rounded-full font-black">
                    1 {fromWallet?.currency} = {autoRate.toFixed(4)} {toWallet?.currency}
                  </span>
                </div>

                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-mochi-text-muted font-bold">Target Account Gets:</span>
                  <span className="font-black text-emerald-600 dark:text-emerald-400 font-mono text-sm">
                    {formatCurrency(targetReceivedAmount, toWallet?.currency)}
                  </span>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-mochi-text-muted mb-0.5">
                    Custom Exchange Rate Override (Optional)
                  </label>
                  <input
                    type="number"
                    step="0.0001"
                    placeholder={`Default: ${autoRate.toFixed(4)}`}
                    value={customRate}
                    onChange={(e) => setCustomRate(e.target.value)}
                    className="mochi-input text-xs w-full font-mono font-bold"
                  />
                </div>
              </div>
            )}

            {/* Amount */}
            <div>
              <label className="block text-xs font-bold text-mochi-text-secondary mb-1">
                Transfer Amount ({fromWallet?.currency || 'PHP'}) *
              </label>
              <div className="relative flex items-center">
                <input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="mochi-input text-lg font-bold w-full font-mono"
                  autoFocus
                />
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-xs font-bold text-mochi-text-secondary mb-1">Transfer Notes (Optional)</label>
              <input
                type="text"
                placeholder="e.g. Wise USD transfer to GCash"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="mochi-input text-xs w-full font-semibold"
              />
            </div>

            {/* Action Buttons */}
            <div className="pt-2 flex gap-3">
              <button type="button" onClick={onClose} className="mochi-btn-secondary text-xs flex-1 py-3">
                Cancel
              </button>
              <button type="submit" className="mochi-btn-primary text-xs flex-1 py-3 shadow-md flex items-center justify-center gap-1.5 cursor-pointer">
                <ArrowRightLeft className="w-4 h-4" /> Transfer Now
              </button>
            </div>
          </form>
        )}
      </div>
    </Dialog>
  )
}

export default TransferModal
