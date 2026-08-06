import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Camera,
  Upload,
  X,
  CheckCircle2,
  Receipt,
  Wallet,
  AlertCircle,
  Tag,
  Calendar as CalendarIcon,
} from 'lucide-react'
import { useAppStore, getUid } from '@/store/appStore'
import { DEFAULT_EXPENSE_CATEGORIES } from '@/lib/utils'
import Mascot from '@/components/ui/Mascot'
import { performLocalOCR, processReceiptTextWithAI, ScannedReceiptResult } from '@/services/receiptScanner'

interface ReceiptScannerModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function ReceiptScannerModal({ isOpen, onClose }: ReceiptScannerModalProps) {
  const { wallets, addTransaction } = useAppStore()
  const [step, setStep] = useState<'upload' | 'camera' | 'scanning' | 'review'>('upload')
  
  // Camera state
  const videoRef = useRef<HTMLVideoElement>(null)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [cameraError, setCameraError] = useState('')

  // Scan state
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [progressText, setProgressText] = useState('')
  const [progressPercent, setProgressPercent] = useState(0)

  // Review Form state
  const [scannedData, setScannedData] = useState<Partial<ScannedReceiptResult>>({
    merchant: '',
    amount: 0,
    category: 'food',
    date: new Date().toISOString().split('T')[0],
  })
  const [selectedWalletId, setSelectedWalletId] = useState(wallets[0]?.id || '')
  const [isSaving, setIsSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)

  useEffect(() => {
    if (!isOpen) {
      stopCamera()
      setStep('upload')
      setImagePreview(null)
      setSaveSuccess(false)
    }
  }, [isOpen])

  const startCamera = async () => {
    setCameraError('')
    setStep('camera')
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
      })
      setStream(mediaStream)
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
      }
    } catch (err: any) {
      console.warn('Camera access error:', err)
      setCameraError('Camera access unavailable. You can upload or drag a receipt photo instead.')
    }
  }

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop())
      setStream(null)
    }
  }

  const capturePhoto = () => {
    if (!videoRef.current) return
    const canvas = document.createElement('canvas')
    canvas.width = videoRef.current.videoWidth || 640
    canvas.height = videoRef.current.videoHeight || 480
    const ctx = canvas.getContext('2d')
    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height)
      const dataUrl = canvas.toDataURL('image/jpeg')
      stopCamera()
      setImagePreview(dataUrl)
      processImageSource(dataUrl)
    }
  }

  const handleFileUpload = (file: File) => {
    if (!file.type.startsWith('image/')) return
    const reader = new FileReader()
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string
      setImagePreview(dataUrl)
      processImageSource(file)
    }
    reader.readAsDataURL(file)
  }

  const processImageSource = async (source: File | string) => {
    setStep('scanning')
    setProgressPercent(5)
    setProgressText('Preparing receipt scan engine...')

    try {
      const { rawText } = await performLocalOCR(source, (pct, status) => {
        setProgressPercent(pct)
        setProgressText(status)
      })

      setProgressPercent(95)
      setProgressText('Local AI analyzing receipt structure...')

      const result = await processReceiptTextWithAI(rawText)

      setScannedData({
        merchant: result.merchant || 'Receipt Merchant',
        amount: result.amount || 0,
        category: result.category || 'food',
        date: result.date || new Date().toISOString().split('T')[0],
        lineItems: result.lineItems || [],
      })
      setStep('review')
    } catch (err: any) {
      console.error('Receipt scanning error:', err)
      setScannedData({
        merchant: 'Scanned Receipt',
        amount: 0,
        category: 'other',
        date: new Date().toISOString().split('T')[0],
      })
      setStep('review')
    }
  }

  const handleSaveTransaction = () => {
    if (!scannedData.merchant || !scannedData.amount) return
    setIsSaving(true)

    const uid = getUid()
    const now = new Date().toISOString()
    const targetWallet = wallets.find((w) => w.id === selectedWalletId) || wallets[0]

    addTransaction({
      id: `txn_receipt_${Date.now()}`,
      userId: uid,
      type: 'expense',
      amount: Number(scannedData.amount),
      currency: 'PHP',
      categoryId: scannedData.category || 'food',
      merchant: scannedData.merchant,
      paymentMethod: 'cash',
      walletId: targetWallet?.id,
      date: scannedData.date || now.split('T')[0],
      notes: `Scanned Receipt | ${scannedData.lineItems?.map((i) => i.description).join(', ') || ''}`,
      receiptUrl: imagePreview || undefined,
      isFavorite: false,
      createdAt: now,
      updatedAt: now,
    })

    setIsSaving(false)
    setSaveSuccess(true)
    setTimeout(() => {
      setSaveSuccess(false)
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
            className="fixed bottom-0 left-0 right-0 z-[60] bg-mochi-surface rounded-t-3xl border-t border-mochi-border shadow-2xl max-w-xl mx-auto flex flex-col max-h-[90vh] overflow-hidden"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-mochi-border/60">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-mochi-primary to-purple-500 flex items-center justify-center text-white shadow-xs">
                  <Receipt className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-mochi-text flex items-center gap-1.5">
                    AI Receipt Scanner
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                      100% Offline
                    </span>
                  </h3>
                  <p className="text-[10px] text-mochi-text-muted font-semibold">
                    Snap or upload a receipt to auto-extract expenses
                  </p>
                </div>
              </div>

              <button
                onClick={onClose}
                className="p-1.5 rounded-full hover:bg-mochi-surface-alt text-mochi-text-muted transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-5 overflow-y-auto">
              {saveSuccess ? (
                <div className="py-12 flex flex-col items-center gap-3 text-center">
                  <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center">
                    <CheckCircle2 className="w-10 h-10 text-emerald-500" />
                  </div>
                  <h4 className="text-lg font-black text-mochi-text">Receipt Expense Logged!</h4>
                  <p className="text-xs text-mochi-text-muted">
                    ₱{Number(scannedData.amount).toLocaleString()} at {scannedData.merchant} saved to transactions.
                  </p>
                </div>
              ) : step === 'scanning' ? (
                <div className="py-12 flex flex-col items-center gap-4 text-center">
                  <Mascot mood="working" size="md" className="drop-shadow-md" />
                  <div>
                    <h4 className="text-base font-black text-mochi-text mb-1">Scanning Receipt Offline</h4>
                    <p className="text-xs text-mochi-text-muted">{progressText}</p>
                  </div>
                  <div className="w-full max-w-xs h-2 bg-mochi-border/50 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-mochi transition-all duration-300 rounded-full"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>
              ) : step === 'camera' ? (
                <div className="space-y-4">
                  <div className="relative rounded-3xl overflow-hidden bg-black aspect-[3/4] flex items-center justify-center border-2 border-mochi-primary/40">
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      className="w-full h-full object-cover"
                    />
                    {/* Viewfinder overlay */}
                    <div className="absolute inset-8 border-2 border-dashed border-white/60 rounded-2xl pointer-events-none flex items-center justify-center">
                      <span className="text-[11px] font-bold text-white/80 bg-black/40 px-3 py-1 rounded-full backdrop-blur-xs">
                        Align Receipt inside frame
                      </span>
                    </div>
                  </div>

                  {cameraError && (
                    <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-600 text-xs font-bold rounded-2xl flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{cameraError}</span>
                    </div>
                  )}

                  <div className="flex gap-3">
                    <button
                      onClick={() => {
                        stopCamera()
                        setStep('upload')
                      }}
                      className="mochi-btn-secondary text-xs flex-1 py-3"
                    >
                      Back to Upload
                    </button>
                    <button
                      onClick={capturePhoto}
                      className="mochi-btn-primary text-xs flex-1 py-3 flex items-center justify-center gap-1.5"
                    >
                      <Camera className="w-4 h-4" /> Snap Receipt
                    </button>
                  </div>
                </div>
              ) : step === 'review' ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-3 rounded-2xl bg-mochi-surface-alt border border-mochi-border/60">
                    {imagePreview ? (
                      <img
                        src={imagePreview}
                        alt="Receipt preview"
                        className="w-14 h-14 object-cover rounded-xl border border-mochi-border shrink-0"
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-xl bg-mochi-primary/10 text-mochi-primary flex items-center justify-center shrink-0">
                        <Receipt className="w-7 h-7" />
                      </div>
                    )}
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-mochi-primary">
                        Scan Complete ✨
                      </span>
                      <p className="text-xs text-mochi-text-muted">
                        Review the extracted details below before logging.
                      </p>
                    </div>
                  </div>

                  {/* Form fields */}
                  <div>
                    <label className="block text-xs font-bold text-mochi-text-secondary mb-1">
                      Merchant / Store Name *
                    </label>
                    <input
                      type="text"
                      required
                      className="mochi-input text-xs font-bold w-full"
                      value={scannedData.merchant}
                      onChange={(e) => setScannedData({ ...scannedData, merchant: e.target.value })}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-mochi-text-secondary mb-1">
                        Total Amount (PHP) *
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-mochi-text-muted">₱</span>
                        <input
                          type="number"
                          step="0.01"
                          required
                          className="mochi-input text-xs font-bold pl-7 w-full"
                          value={scannedData.amount || ''}
                          onChange={(e) => setScannedData({ ...scannedData, amount: Number(e.target.value) })}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-mochi-text-secondary mb-1 flex items-center gap-1">
                        <Tag className="w-3 h-3 text-mochi-primary" /> Category
                      </label>
                      <select
                        className="mochi-input text-xs font-bold w-full"
                        value={scannedData.category}
                        onChange={(e) => setScannedData({ ...scannedData, category: e.target.value })}
                      >
                        {DEFAULT_EXPENSE_CATEGORIES.map((cat) => (
                          <option key={cat.id} value={cat.id}>
                            {cat.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-mochi-text-secondary mb-1 flex items-center gap-1">
                        <CalendarIcon className="w-3 h-3 text-mochi-primary" /> Date
                      </label>
                      <input
                        type="date"
                        className="mochi-input text-xs font-bold w-full"
                        value={scannedData.date}
                        onChange={(e) => setScannedData({ ...scannedData, date: e.target.value })}
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-mochi-text-secondary mb-1 flex items-center gap-1">
                        <Wallet className="w-3 h-3 text-mochi-primary" /> Deduct From Wallet
                      </label>
                      <select
                        className="mochi-input text-xs font-bold w-full"
                        value={selectedWalletId}
                        onChange={(e) => setSelectedWalletId(e.target.value)}
                      >
                        {wallets.map((w) => (
                          <option key={w.id} value={w.id}>
                            {w.name} (₱{w.balance.toLocaleString()})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="pt-2 flex gap-3">
                    <button
                      type="button"
                      onClick={() => setStep('upload')}
                      className="mochi-btn-secondary text-xs flex-1 py-3"
                    >
                      Scan Another
                    </button>
                    <button
                      type="button"
                      onClick={handleSaveTransaction}
                      disabled={isSaving || !scannedData.merchant || !scannedData.amount}
                      className="mochi-btn-primary text-xs flex-1 py-3 flex items-center justify-center gap-1.5"
                    >
                      <CheckCircle2 className="w-4 h-4" /> Save Expense
                    </button>
                  </div>
                </div>
              ) : (
                /* Upload Step */
                <div className="space-y-4">
                  <div
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault()
                      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                        handleFileUpload(e.dataTransfer.files[0])
                      }
                    }}
                    className="border-2 border-dashed border-mochi-primary/30 rounded-3xl p-8 text-center bg-mochi-surface-alt hover:border-mochi-primary/60 transition-colors flex flex-col items-center justify-center gap-3 cursor-pointer group"
                  >
                    <div className="w-14 h-14 rounded-2xl bg-mochi-primary/10 text-mochi-primary flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Upload className="w-7 h-7" />
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-mochi-text mb-1">
                        Drag & Drop Receipt Photo Here
                      </h4>
                      <p className="text-xs text-mochi-text-muted">
                        Supports PNG, JPG, WEBP • Processed 100% locally
                      </p>
                    </div>
                    <label className="mochi-btn-primary text-xs py-2 px-5 cursor-pointer mt-1">
                      Choose Photo File
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            handleFileUpload(e.target.files[0])
                          }
                        }}
                      />
                    </label>
                  </div>

                  <div className="relative flex items-center justify-center my-2">
                    <div className="border-t border-mochi-border w-full" />
                    <span className="bg-mochi-surface px-3 text-[10px] font-bold text-mochi-text-muted uppercase tracking-widest absolute">
                      OR
                    </span>
                  </div>

                  <button
                    onClick={startCamera}
                    className="w-full py-3.5 rounded-2xl bg-mochi-surface-alt hover:bg-mochi-primary/10 border border-mochi-primary/30 text-mochi-primary font-black text-xs flex items-center justify-center gap-2 transition-all active:scale-98 shadow-xs"
                  >
                    <Camera className="w-4 h-4" /> Open Camera Viewfinder
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
