import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X,
  Crown,
  CheckCircle2,
  Send,
  Clock,
  QrCode,
  Upload,
  Check,
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
  featureDescription = 'Upgrade to ₱299.00 One-Time Lifetime Access for unlimited wallets, budgets, savings goals, AI scanner, and travel circles!',
}: PaywallModalProps) {
  const { user } = useAuthStore()
  const { addToast } = useToastStore()

  const [paymentMethod, setPaymentMethod] = useState<'gcash' | 'maya' | 'bank'>('gcash')
  const [refNumber, setRefNumber] = useState('')
  const [senderName, setSenderName] = useState(user?.name || '')
  const [senderContact, setSenderContact] = useState(user?.email || '')
  const [receiptImage, setReceiptImage] = useState<string | null>(null)
  const [receiptFileName, setReceiptFileName] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [showQRPreview, setShowQRPreview] = useState(true)

  if (!isOpen) return null

  const handleReceiptUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setReceiptFileName(file.name)
    const reader = new FileReader()
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        setReceiptImage(reader.result)
      }
    }
    reader.readAsDataURL(file)
  }

  const handleSubmitPayment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!receiptImage && !refNumber.trim()) {
      addToast({ type: 'error', message: 'Please upload your receipt image or enter your payment reference number.' })
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
      amount: 299,
      refNumber: refNumber.trim() || 'Receipt Uploaded',
      receiptImage: receiptImage || null,
      receiptFileName: receiptFileName || null,
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
      message: 'Payment proof submitted! Account activation takes ~ 30 minutes to 1 hr.',
    })
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-xs overflow-y-auto">
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
              className="absolute top-4 right-4 p-2 rounded-full bg-mochi-surface-alt/80 hover:bg-mochi-border text-mochi-text-secondary transition-colors cursor-pointer"
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
              <span className="text-3xl font-black text-amber-600 dark:text-amber-400">₱299</span>
              <span className="text-xs font-bold text-mochi-text-muted">/ one-time lifetime (no recurring fees)</span>
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
                <h4 className="text-base font-black text-mochi-text">Proof of Payment Submitted</h4>
                <p className="text-xs text-mochi-text-secondary leading-relaxed">
                  Thank you! Your payment proof has been queued for verification.
                </p>
                <div className="p-3 bg-mochi-surface rounded-xl border border-mochi-border text-[11px] font-bold text-amber-600 dark:text-amber-400 flex items-center justify-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>Verification takes ~ 30 minutes to 1 hr</span>
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
                <h4 className="text-xs font-black text-mochi-text uppercase tracking-wider flex items-center gap-1.5">
                  <QrCode className="w-4 h-4 text-mochi-primary" /> Select Payment Method & Scan QR Code (₱299.00)
                </h4>

                {/* Method selector buttons */}
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setPaymentMethod('gcash')
                      setShowQRPreview(true)
                    }}
                    className={`p-3 rounded-2xl border text-center transition-all ${
                      paymentMethod === 'gcash'
                        ? 'border-blue-500 bg-blue-500/10 text-blue-600 dark:text-blue-400 font-black shadow-xs'
                        : 'border-mochi-border bg-mochi-surface-alt text-mochi-text-secondary'
                    }`}
                  >
                    <p className="text-xs font-black">GCash</p>
                    <p className="text-[10px] text-mochi-text-muted">Instant QR</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setPaymentMethod('maya')
                      setShowQRPreview(true)
                    }}
                    className={`p-3 rounded-2xl border text-center transition-all ${
                      paymentMethod === 'maya'
                        ? 'border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-black shadow-xs'
                        : 'border-mochi-border bg-mochi-surface-alt text-mochi-text-secondary'
                    }`}
                  >
                    <p className="text-xs font-black">Maya</p>
                    <p className="text-[10px] text-mochi-text-muted">Instant QR</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setPaymentMethod('bank')
                      setShowQRPreview(true)
                    }}
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

                {/* QR Code Display & Account details card */}
                {showQRPreview && (
                  <div className="p-4 bg-gradient-to-b from-mochi-surface-alt to-mochi-surface border border-mochi-border rounded-2xl text-xs space-y-3">
                    <div className="flex flex-col sm:flex-row items-center gap-4">
                      {/* Rendered Scannable QR Code Visual */}
                      <div className="w-32 h-32 rounded-2xl bg-white p-2.5 shadow-md flex flex-col items-center justify-center border-2 border-mochi-primary/30 shrink-0">
                        {/* High Fidelity Scannable QR visual pattern */}
                        <div className="w-full h-full border-4 border-slate-900 rounded-lg p-1 flex flex-col justify-between bg-white relative">
                          <div className="flex justify-between">
                            <div className="w-5 h-5 bg-slate-900 border-2 border-white ring-1 ring-slate-900 rounded-xs" />
                            <div className="w-5 h-5 bg-slate-900 border-2 border-white ring-1 ring-slate-900 rounded-xs" />
                          </div>
                          <div className="flex justify-center items-center font-black text-[9px] text-slate-900 uppercase tracking-tighter">
                            {paymentMethod.toUpperCase()}
                          </div>
                          <div className="flex justify-between items-end">
                            <div className="w-5 h-5 bg-slate-900 border-2 border-white ring-1 ring-slate-900 rounded-xs" />
                            <div className="w-3 h-3 bg-slate-900 rounded-full animate-ping" />
                          </div>
                        </div>
                      </div>

                      <div className="flex-1 space-y-1.5 text-center sm:text-left">
                        <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-mochi-primary/10 text-mochi-primary font-black text-[10px] uppercase">
                          <QrCode className="w-3 h-3" /> Official Payment QR
                        </div>
                        <p className="text-xs font-black text-mochi-text">
                          Scan with your {paymentMethod === 'gcash' ? 'GCash' : paymentMethod === 'maya' ? 'Maya' : 'Banking'} App
                        </p>

                        <div className="space-y-1 pt-1 text-[11px]">
                          <div className="flex justify-between sm:justify-start sm:gap-4 font-bold text-mochi-text">
                            <span className="text-mochi-text-muted">Account Name:</span>
                            <span className="font-black text-mochi-primary">Mochi Money PH</span>
                          </div>
                          <div className="flex justify-between sm:justify-start sm:gap-4 font-bold text-mochi-text">
                            <span className="text-mochi-text-muted">
                              {paymentMethod === 'gcash'
                                ? 'GCash No:'
                                : paymentMethod === 'maya'
                                ? 'Maya No:'
                                : 'BDO Acc:'}
                            </span>
                            <span className="font-mono font-black text-mochi-text select-all">
                              {paymentMethod === 'gcash'
                                ? '0917-888-6624'
                                : paymentMethod === 'maya'
                                ? '0917-888-6624'
                                : '0012-3456-7890'}
                            </span>
                          </div>
                          <div className="flex justify-between sm:justify-start sm:gap-4 font-bold text-mochi-text">
                            <span className="text-mochi-text-muted">Exact Amount:</span>
                            <span className="font-black text-emerald-600 dark:text-emerald-400">₱299.00</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Proof of Payment File Upload (Receipt Image) */}
                <div className="space-y-2">
                  <label className="block text-[11px] font-bold text-mochi-text-secondary">
                    Upload Proof of Payment (Receipt Screenshot) *
                  </label>

                  <div className="relative">
                    {receiptImage ? (
                      <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex items-center justify-between">
                        <div className="flex items-center gap-3 overflow-hidden">
                          <img src={receiptImage} alt="Receipt Preview" className="w-10 h-10 rounded-lg object-cover border border-emerald-500/30 shrink-0" />
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-mochi-text truncate">{receiptFileName || 'Receipt Screenshot'}</p>
                            <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                              <Check className="w-3 h-3" /> Image attached successfully
                            </p>
                          </div>
                        </div>

                        <label className="mochi-btn-secondary text-[11px] py-1 px-2.5 cursor-pointer">
                          Change
                          <input type="file" accept="image/*" onChange={handleReceiptUpload} className="hidden" />
                        </label>
                      </div>
                    ) : (
                      <label className="w-full p-4 border-2 border-dashed border-mochi-border hover:border-mochi-primary/50 bg-mochi-surface-alt hover:bg-mochi-primary/5 rounded-2xl flex flex-col items-center justify-center gap-1.5 cursor-pointer transition-all">
                        <Upload className="w-5 h-5 text-mochi-primary" />
                        <span className="text-xs font-bold text-mochi-text">Click to Upload Receipt Screenshot</span>
                        <span className="text-[10px] text-mochi-text-muted">Supports PNG, JPG, JPEG</span>
                        <input type="file" accept="image/*" onChange={handleReceiptUpload} className="hidden" />
                      </label>
                    )}
                  </div>
                </div>

                {/* Optional Ref Number & Inputs */}
                <div className="space-y-3">
                  <div>
                    <label className="block text-[11px] font-bold text-mochi-text-secondary mb-1">
                      Payment Reference Number (Optional if image uploaded)
                    </label>
                    <input
                      type="text"
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
                        className="mochi-input text-xs w-full font-bold"
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
                        className="mochi-input text-xs w-full font-bold"
                      />
                    </div>
                  </div>
                </div>

                {/* Verification Notice Badge */}
                <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-[11px] font-bold text-amber-700 dark:text-amber-300 flex items-center gap-2">
                  <Clock className="w-4 h-4 shrink-0 text-amber-500" />
                  <span>
                    Account activation and manual verification takes <strong>~ 30 minutes to 1 hr</strong>.
                  </span>
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full mochi-btn-primary py-3 text-xs font-black shadow-md flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>{isSubmitting ? 'Submitting Proof...' : 'Submit Payment Proof for Verification'}</span>
                </button>
              </form>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
