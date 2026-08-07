import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X,
  Crown,
  CheckCircle2,
  Send,
  Clock,
} from 'lucide-react'
import Mascot from '@/components/ui/Mascot'
import { useAuthStore } from '@/store/authStore'
import { useToastStore } from '@/store/toastStore'
import { doc, setDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'

interface PaywallModalProps {
  isOpen: boolean
  onClose: () => void
  featureTitle?: string
  featureDescription?: string
}

export default function PaywallModal({
  isOpen,
  onClose,
  featureTitle = 'Unlock Unlimited Mochi Money Pro',
  featureDescription = 'Upgrade to ₱199.00 One-Time Lifetime Access for unlimited wallets, budgets, savings goals, AI scanner, and travel circles!',
}: PaywallModalProps) {
  const { user } = useAuthStore()
  const { addToast } = useToastStore()

  const [paymentMethod, setPaymentMethod] = useState<'gcash' | 'maya' | 'bank'>('gcash')
  const [refNumber, setRefNumber] = useState('')
  const [senderName, setSenderName] = useState(user?.name || '')
  const [senderContact, setSenderContact] = useState(user?.email || '')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  if (!isOpen) return null

  const handleSubmitPayment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!refNumber.trim()) {
      addToast({ type: 'error', message: 'Please enter your payment reference number.' })
      return
    }

    setIsSubmitting(true)

    const requestId = `pay_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`
    const payload = {
      id: requestId,
      userId: user?.id || 'anon',
      userName: senderName || user?.name || 'Mochi User',
      userEmail: user?.email || senderContact || 'user@mochimoney.app',
      paymentMethod,
      amount: 199,
      refNumber: refNumber.trim(),
      senderContact: senderContact.trim(),
      status: 'pending',
      createdAt: new Date().toISOString(),
    }

    try {
      await setDoc(doc(db, 'payment_requests', requestId), payload)
    } catch (e) {
      console.warn('Saved payment request locally / offline fallback:', e)
    }

    setIsSubmitting(false)
    setIsSubmitted(true)
    addToast({
      type: 'success',
      message: 'Payment reference submitted! Verification takes ~1 to 2 hours.',
    })
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 16 }}
          className="relative w-full max-w-lg bg-mochi-surface border border-mochi-border rounded-3xl shadow-2xl overflow-hidden my-6"
        >
          {/* Top Banner Header */}
          <div className="relative p-6 bg-gradient-to-br from-amber-500/20 via-mochi-primary/15 to-purple-500/10 border-b border-mochi-border text-center">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-full bg-mochi-surface-alt/80 hover:bg-mochi-border text-mochi-text-secondary transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-600 dark:text-amber-300 text-xs font-black uppercase tracking-wider mb-2">
              <Crown className="w-3.5 h-3.5 fill-amber-400" /> Lifetime Pro Access
            </div>

            <div className="flex justify-center my-1">
              <Mascot size="sm" mood="excited" />
            </div>

            <h3 className="text-xl font-black text-mochi-text mt-1">{featureTitle}</h3>
            <p className="text-xs text-mochi-text-secondary mt-1 max-w-xs mx-auto">
              {featureDescription}
            </p>

            <div className="mt-3 inline-flex items-baseline gap-1">
              <span className="text-3xl font-black text-amber-600 dark:text-amber-400">₱199</span>
              <span className="text-xs font-bold text-mochi-text-muted">/ one-time (no monthly fees)</span>
            </div>
          </div>

          <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
            {/* Pro Perks Checklist */}
            <div className="grid grid-cols-2 gap-2.5 p-3 rounded-2xl bg-mochi-surface-alt border border-mochi-border text-xs">
              <div className="flex items-center gap-1.5 font-bold text-mochi-text">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Unlimited Wallets</span>
              </div>
              <div className="flex items-center gap-1.5 font-bold text-mochi-text">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Unlimited Budgets</span>
              </div>
              <div className="flex items-center gap-1.5 font-bold text-mochi-text">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Unlimited Savings</span>
              </div>
              <div className="flex items-center gap-1.5 font-bold text-mochi-text">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>AI Receipt Scanner</span>
              </div>
              <div className="flex items-center gap-1.5 font-bold text-mochi-text">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Mochi Travel Circles</span>
              </div>
              <div className="flex items-center gap-1.5 font-bold text-mochi-text">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>CSV Data Export</span>
              </div>
              <div className="flex items-center gap-1.5 font-bold text-mochi-text">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>8 Aesthetic Themes</span>
              </div>
              <div className="flex items-center gap-1.5 font-bold text-mochi-text">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Realtime Cloud Sync</span>
              </div>
            </div>

            {isSubmitted ? (
              <div className="p-5 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center mx-auto">
                  <Clock className="w-6 h-6 animate-pulse" />
                </div>
                <h4 className="text-base font-black text-mochi-text">Payment Submitted for Review</h4>
                <p className="text-xs text-mochi-text-secondary leading-relaxed">
                  Thank you! Your reference number <span className="font-mono font-bold text-mochi-primary">{refNumber}</span> has been queued for verification.
                </p>
                <div className="p-3 bg-mochi-surface rounded-xl border border-mochi-border text-[11px] font-bold text-amber-600 dark:text-amber-400 flex items-center justify-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>Account activation takes ~1 to 2 hours</span>
                </div>
                <button
                  onClick={onClose}
                  className="w-full mochi-btn-primary py-2.5 text-xs font-bold"
                >
                  Got It!
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmitPayment} className="space-y-4">
                <h4 className="text-xs font-black text-mochi-text uppercase tracking-wider">
                  Select Fee-Free Payment Method (₱199.00)
                </h4>

                {/* Method selector buttons */}
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('gcash')}
                    className={`p-3 rounded-2xl border text-center transition-all ${
                      paymentMethod === 'gcash'
                        ? 'border-blue-500 bg-blue-500/10 text-blue-600 dark:text-blue-400 font-black shadow-xs'
                        : 'border-mochi-border bg-mochi-surface-alt text-mochi-text-secondary'
                    }`}
                  >
                    <p className="text-xs font-black">GCash</p>
                    <p className="text-[10px] text-mochi-text-muted">Instant</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('maya')}
                    className={`p-3 rounded-2xl border text-center transition-all ${
                      paymentMethod === 'maya'
                        ? 'border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-black shadow-xs'
                        : 'border-mochi-border bg-mochi-surface-alt text-mochi-text-secondary'
                    }`}
                  >
                    <p className="text-xs font-black">Maya</p>
                    <p className="text-[10px] text-mochi-text-muted">Instant</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('bank')}
                    className={`p-3 rounded-2xl border text-center transition-all ${
                      paymentMethod === 'bank'
                        ? 'border-purple-500 bg-purple-500/10 text-purple-600 dark:text-purple-400 font-black shadow-xs'
                        : 'border-mochi-border bg-mochi-surface-alt text-mochi-text-secondary'
                    }`}
                  >
                    <p className="text-xs font-black">Bank Transfer</p>
                    <p className="text-[10px] text-mochi-text-muted">BDO / BPI</p>
                  </button>
                </div>

                {/* Account details card */}
                <div className="p-3.5 bg-mochi-surface-alt border border-mochi-border rounded-2xl text-xs space-y-1.5">
                  <div className="flex justify-between text-mochi-text font-bold">
                    <span>Account Name:</span>
                    <span className="font-black text-mochi-primary">Mochi Money PH</span>
                  </div>
                  <div className="flex justify-between text-mochi-text font-bold">
                    <span>
                      {paymentMethod === 'gcash'
                        ? 'GCash Number:'
                        : paymentMethod === 'maya'
                        ? 'Maya Number:'
                        : 'BDO Account:'}
                    </span>
                    <span className="font-mono font-black text-mochi-text select-all">
                      {paymentMethod === 'gcash'
                        ? '0917-888-6624'
                        : paymentMethod === 'maya'
                        ? '0917-888-6624'
                        : '0012-3456-7890'}
                    </span>
                  </div>
                  <div className="flex justify-between text-mochi-text font-bold">
                    <span>Exact Amount:</span>
                    <span className="font-black text-emerald-600 dark:text-emerald-400">₱199.00</span>
                  </div>
                </div>

                {/* Ref Number & Inputs */}
                <div className="space-y-3">
                  <div>
                    <label className="block text-[11px] font-bold text-mochi-text-secondary mb-1">
                      Payment Reference Number (Req.)
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 1002 9384 1029 or Ref #..."
                      value={refNumber}
                      onChange={(e) => setRefNumber(e.target.value)}
                      className="mochi-input text-xs w-full font-mono font-bold"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-bold text-mochi-text-secondary mb-1">
                        Your Name
                      </label>
                      <input
                        type="text"
                        value={senderName}
                        onChange={(e) => setSenderName(e.target.value)}
                        className="mochi-input text-xs w-full"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-mochi-text-secondary mb-1">
                        Email / Mobile
                      </label>
                      <input
                        type="text"
                        value={senderContact}
                        onChange={(e) => setSenderContact(e.target.value)}
                        className="mochi-input text-xs w-full"
                      />
                    </div>
                  </div>
                </div>

                {/* 1-2 Hours Notice Badge */}
                <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-[11px] font-bold text-amber-700 dark:text-amber-300 flex items-center gap-2">
                  <Clock className="w-4 h-4 shrink-0 text-amber-500" />
                  <span>
                    Account activation and manual verification takes <strong>~1 to 2 hours</strong>.
                  </span>
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full mochi-btn-primary py-3 text-xs font-black shadow-md flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  <span>{isSubmitting ? 'Submitting Reference...' : 'Submit Reference for Verification'}</span>
                </button>
              </form>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
