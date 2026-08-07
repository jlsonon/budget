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
  Plus,
  Trash2,
  Maximize2,
  FileText,
  Percent,
  TrendingDown,
  Sparkles,
  ShieldCheck,
} from 'lucide-react'
import { useAppStore, getUid } from '@/store/appStore'
import { DEFAULT_EXPENSE_CATEGORIES } from '@/lib/utils'
import Mascot from '@/components/ui/Mascot'
import { performLocalOCR, processReceiptTextWithAI, ScannedReceiptResult, LineItem } from '@/services/receiptScanner'

interface ReceiptScannerModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function ReceiptScannerModal({ isOpen, onClose }: ReceiptScannerModalProps) {
  const { wallets, budgets, transactions, addTransaction } = useAppStore()
  const [step, setStep] = useState<'upload' | 'camera' | 'paste' | 'scanning' | 'review'>('upload')
  
  // Camera state
  const videoRef = useRef<HTMLVideoElement>(null)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [cameraError, setCameraError] = useState('')

  // Scan state
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [showImageZoom, setShowImageZoom] = useState(false)
  const [manualText, setManualText] = useState('')
  const [progressText, setProgressText] = useState('')
  const [progressPercent, setProgressPercent] = useState(0)

  // Review Form state
  const [scannedData, setScannedData] = useState<ScannedReceiptResult>({
    merchant: '',
    amount: 0,
    subtotal: 0,
    tax: 0,
    category: 'food',
    date: new Date().toISOString().split('T')[0],
    lineItems: [],
    rawText: '',
    confidence: 85,
    categoryConfidence: 80,
  })
  const [selectedWalletId, setSelectedWalletId] = useState(wallets[0]?.id || '')
  const [isSaving, setIsSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)

  // Itemized line item state
  const [lineItems, setLineItems] = useState<LineItem[]>([])
  const [newLineItemDesc, setNewLineItemDesc] = useState('')
  const [newLineItemAmt, setNewLineItemAmt] = useState('')

  useEffect(() => {
    if (!isOpen) {
      stopCamera()
      setStep('upload')
      setImagePreview(null)
      setShowImageZoom(false)
      setSaveSuccess(false)
      setManualText('')
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
      const dataUrl = canvas.toDataURL('image/jpeg', 0.9)
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

  const handleManualTextSubmit = () => {
    if (!manualText.trim()) return
    processImageSourceText(manualText)
  }

  const processImageSourceText = async (text: string) => {
    setStep('scanning')
    setProgressPercent(40)
    setProgressText('Processing receipt text with Local AI...')

    try {
      const result = await processReceiptTextWithAI(text, (pct, status) => {
        setProgressPercent(pct)
        setProgressText(status)
      })

      setScannedData(result)
      setLineItems(result.lineItems || [])
      setStep('review')
    } catch (err) {
      console.error(err)
      setStep('review')
    }
  }

  const processImageSource = async (source: File | string) => {
    setStep('scanning')
    setProgressPercent(5)
    setProgressText('Preparing receipt scan engine...')

    try {
      const { rawText, confidence } = await performLocalOCR(source, (pct, status) => {
        setProgressPercent(pct)
        setProgressText(status)
      })

      setProgressPercent(90)
      setProgressText('Local AI classifying receipt structure & line items...')

      const result = await processReceiptTextWithAI(rawText)
      result.confidence = confidence

      setScannedData(result)
      setLineItems(result.lineItems || [])
      setStep('review')
    } catch (err: any) {
      console.error('Receipt scanning error:', err)
      setScannedData({
        merchant: 'Scanned Receipt',
        amount: 0,
        subtotal: 0,
        tax: 0,
        category: 'other',
        date: new Date().toISOString().split('T')[0],
        lineItems: [],
        rawText: '',
        confidence: 70,
        categoryConfidence: 60,
      })
      setLineItems([])
      setStep('review')
    }
  }

  // Add line item
  const handleAddLineItem = () => {
    if (!newLineItemDesc.trim() || !newLineItemAmt) return
    const amt = parseFloat(newLineItemAmt)
    if (isNaN(amt) || amt <= 0) return

    const updated = [...lineItems, { description: newLineItemDesc.trim(), amount: amt }]
    setLineItems(updated)
    setNewLineItemDesc('')
    setNewLineItemAmt('')

    // Recalculate subtotal if items exist
    const itemsSum = updated.reduce((acc, curr) => acc + curr.amount, 0)
    if (itemsSum > scannedData.amount) {
      setScannedData((prev) => ({ ...prev, amount: itemsSum, subtotal: itemsSum - (prev.tax || 0) }))
    }
  }

  const handleRemoveLineItem = (index: number) => {
    const updated = lineItems.filter((_, i) => i !== index)
    setLineItems(updated)
  }

  // Budget impact calculation
  const targetCategory = scannedData.category || 'food'
  const targetCategoryObj = DEFAULT_EXPENSE_CATEGORIES.find((c) => c.id === targetCategory)
  const categoryName = targetCategoryObj?.name || targetCategory
  const matchingBudget = budgets.find((b) => b.categoryId === targetCategory)
  const monthPrefix = new Date().toISOString().slice(0, 7)
  const currentSpent = transactions
    .filter((t) => t.categoryId === targetCategory && t.type === 'expense' && t.date.startsWith(monthPrefix))
    .reduce((sum, t) => sum + t.amount, 0)

  const remainingBudget = matchingBudget ? matchingBudget.limit - currentSpent : null
  const projectedSpent = currentSpent + (scannedData.amount || 0)
  const isOverBudget = matchingBudget ? projectedSpent > matchingBudget.limit : false

  const handleSaveTransaction = () => {
    if (!scannedData.merchant || !scannedData.amount) return
    setIsSaving(true)

    const uid = getUid()
    const now = new Date().toISOString()
    const targetWallet = wallets.find((w) => w.id === selectedWalletId) || wallets[0]

    const itemizedSummary = lineItems.length > 0
      ? `Items: ${lineItems.map((i) => `${i.description} (₱${i.amount})`).join(', ')}`
      : ''
    const notesText = `Scanned Receipt | ${itemizedSummary} ${scannedData.tax ? `| VAT: ₱${scannedData.tax}` : ''}`

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
      notes: notesText,
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
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal Container */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-[60] bg-mochi-surface rounded-t-3xl border-t border-mochi-border shadow-2xl max-w-xl mx-auto flex flex-col max-h-[92vh] overflow-hidden"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-mochi-border/60 bg-mochi-surface-alt/40">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-xs">
                  <Receipt className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-mochi-text flex items-center gap-2">
                    AI Receipt Scanner
                    <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3 text-emerald-500" /> Offline AI
                    </span>
                  </h3>
                  <p className="text-[11px] text-mochi-text-muted font-semibold">
                    Extract merchant, prices, line items & budget impact automatically
                  </p>
                </div>
              </div>

              <button
                onClick={onClose}
                className="p-2 rounded-full hover:bg-mochi-surface-alt text-mochi-text-muted transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-5 overflow-y-auto space-y-4">
              {saveSuccess ? (
                <div className="py-12 flex flex-col items-center gap-3 text-center">
                  <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center">
                    <CheckCircle2 className="w-10 h-10 text-emerald-500 animate-bounce" />
                  </div>
                  <h4 className="text-lg font-black text-mochi-text">Receipt Expense Saved!</h4>
                  <p className="text-xs text-mochi-text-muted">
                    ₱{Number(scannedData.amount).toLocaleString()} at {scannedData.merchant} deducted from wallet.
                  </p>
                </div>
              ) : step === 'scanning' ? (
                <div className="py-12 flex flex-col items-center gap-4 text-center">
                  <Mascot mood="working" size="md" className="drop-shadow-md" />
                  <div>
                    <h4 className="text-base font-black text-mochi-text mb-1">Analyzing Receipt Details</h4>
                    <p className="text-xs text-mochi-text-muted">{progressText}</p>
                  </div>
                  <div className="w-full max-w-xs h-2.5 bg-mochi-border/50 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-mochi-primary transition-all duration-300 rounded-full"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>
              ) : step === 'camera' ? (
                <div className="space-y-4">
                  <div className="relative rounded-3xl overflow-hidden bg-black aspect-[3/4] flex items-center justify-center border-2 border-emerald-500/40 shadow-inner">
                    <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
                    <div className="absolute inset-6 border-2 border-dashed border-emerald-400/80 rounded-2xl pointer-events-none flex flex-col items-center justify-between p-4">
                      <span className="text-[11px] font-bold text-white bg-black/60 px-3 py-1 rounded-full backdrop-blur-xs">
                        Hold steady & align receipt in frame
                      </span>
                      <span className="text-[10px] font-extrabold text-emerald-300 bg-emerald-950/80 px-2.5 py-0.5 rounded-full border border-emerald-500/40">
                        HD OCR Ready
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
                      Back to Input Options
                    </button>
                    <button
                      onClick={capturePhoto}
                      className="mochi-btn-primary text-xs flex-1 py-3 flex items-center justify-center gap-1.5 bg-gradient-to-r from-emerald-500 to-teal-600"
                    >
                      <Camera className="w-4 h-4" /> Snap Receipt Photo
                    </button>
                  </div>
                </div>
              ) : step === 'paste' ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-mochi-text-secondary mb-1 flex items-center gap-1.5">
                      <FileText className="w-4 h-4 text-emerald-500" /> Paste Raw Receipt Text / Digital Invoice
                    </label>
                    <textarea
                      rows={6}
                      className="mochi-input text-xs font-mono w-full p-3 leading-relaxed"
                      placeholder="Paste e-receipt, email order, or copied text here..."
                      value={manualText}
                      onChange={(e) => setManualText(e.target.value)}
                    />
                  </div>

                  <div className="flex gap-3">
                    <button onClick={() => setStep('upload')} className="mochi-btn-secondary text-xs flex-1 py-3">
                      Cancel
                    </button>
                    <button
                      onClick={handleManualTextSubmit}
                      disabled={!manualText.trim()}
                      className="mochi-btn-primary text-xs flex-1 py-3 flex items-center justify-center gap-1.5 bg-gradient-to-r from-emerald-500 to-teal-600"
                    >
                      <Sparkles className="w-4 h-4" /> Parse Receipt Text
                    </button>
                  </div>
                </div>
              ) : step === 'review' ? (
                <div className="space-y-4">
                  {/* Top Preview & Confidence Bar */}
                  <div className="p-3.5 rounded-2xl bg-mochi-surface-alt border border-mochi-border/70 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {imagePreview ? (
                          <div
                            onClick={() => setShowImageZoom(true)}
                            className="relative group cursor-pointer"
                            title="Click to zoom receipt photo"
                          >
                            <img
                              src={imagePreview}
                              alt="Receipt preview"
                              className="w-14 h-14 object-cover rounded-xl border border-mochi-border shrink-0 group-hover:opacity-80 transition-opacity"
                            />
                            <div className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity">
                              <Maximize2 className="w-4 h-4 text-white" />
                            </div>
                          </div>
                        ) : (
                          <div className="w-14 h-14 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
                            <Receipt className="w-7 h-7" />
                          </div>
                        )}
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                              Scan Complete
                            </span>
                            <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                              🎯 {scannedData.confidence}% Confidence
                            </span>
                          </div>
                          <p className="text-xs text-mochi-text-muted mt-0.5">
                            Verify extracted merchant, amount, category & line items below.
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Category Budget Impact Warning Pill */}
                    {matchingBudget && (
                      <div
                        className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-between ${
                          isOverBudget
                            ? 'bg-rose-500/10 border-rose-500/30 text-rose-600 dark:text-rose-400'
                            : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-300'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <TrendingDown className="w-4 h-4 shrink-0" />
                          <span>
                            {isOverBudget
                              ? `⚠️ Warning: Exceeds monthly ${DEFAULT_EXPENSE_CATEGORIES.find((c) => c.id === targetCategory)?.name || targetCategory} budget!`
                              : `💚 Remaining budget in category: ₱${(remainingBudget || 0).toLocaleString()}`}
                          </span>
                        </div>
                        <span className="text-[10px] uppercase font-black px-2 py-0.5 rounded-md bg-current/10">
                          {categoryName} Budget
                        </span>
                      </div>
                    )}
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
                        Grand Total (PHP) *
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
                        <Tag className="w-3 h-3 text-emerald-500" /> Category
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
                        <CalendarIcon className="w-3 h-3 text-emerald-500" /> Transaction Date
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
                        <Wallet className="w-3 h-3 text-emerald-500" /> Deduct Wallet
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

                  {/* Subtotal & VAT Optional Tax fields */}
                  <div className="grid grid-cols-2 gap-3 bg-mochi-surface-alt/50 p-2.5 rounded-2xl border border-mochi-border/60">
                    <div>
                      <label className="block text-[11px] font-bold text-mochi-text-muted mb-1">
                        Subtotal (Excl. Tax)
                      </label>
                      <div className="relative">
                        <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[11px] font-bold text-mochi-text-muted">₱</span>
                        <input
                          type="number"
                          step="0.01"
                          className="mochi-input text-xs font-semibold pl-6 py-1.5 w-full bg-mochi-surface"
                          value={scannedData.subtotal || ''}
                          onChange={(e) => setScannedData({ ...scannedData, subtotal: Number(e.target.value) })}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-mochi-text-muted mb-1 flex items-center gap-1">
                        <Percent className="w-3 h-3 text-emerald-500" /> Estimated VAT / Tax
                      </label>
                      <div className="relative">
                        <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[11px] font-bold text-mochi-text-muted">₱</span>
                        <input
                          type="number"
                          step="0.01"
                          className="mochi-input text-xs font-semibold pl-6 py-1.5 w-full bg-mochi-surface"
                          value={scannedData.tax || ''}
                          onChange={(e) => setScannedData({ ...scannedData, tax: Number(e.target.value) })}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Interactive Itemized Line Items Table */}
                  <div className="border border-mochi-border/80 rounded-2xl p-3 bg-mochi-surface-alt/30 space-y-2">
                    <div className="flex items-center justify-between border-b border-mochi-border/60 pb-2">
                      <span className="text-xs font-black text-mochi-text flex items-center gap-1.5">
                        <Receipt className="w-3.5 h-3.5 text-emerald-500" /> Itemized Breakdown ({lineItems.length})
                      </span>
                      {lineItems.length > 0 && (
                        <span className="text-[10px] font-bold text-mochi-text-muted">
                          Sum: ₱{lineItems.reduce((acc, curr) => acc + curr.amount, 0).toLocaleString()}
                        </span>
                      )}
                    </div>

                    {lineItems.length > 0 ? (
                      <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                        {lineItems.map((item, idx) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between p-2 rounded-xl bg-mochi-surface border border-mochi-border/60 text-xs font-bold"
                          >
                            <span className="truncate flex-1 pr-2 text-mochi-text">{item.description}</span>
                            <span className="text-emerald-600 dark:text-emerald-400 shrink-0 mr-2">
                              ₱{item.amount.toLocaleString()}
                            </span>
                            <button
                              onClick={() => handleRemoveLineItem(idx)}
                              className="text-rose-500 hover:text-rose-700 p-1 rounded-lg hover:bg-rose-500/10"
                              title="Delete item"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-[11px] text-mochi-text-muted italic py-1 text-center">
                        No individual line items parsed. Add items below if needed:
                      </p>
                    )}

                    {/* Add Line Item Input Row */}
                    <div className="flex gap-2 pt-1">
                      <input
                        type="text"
                        placeholder="Item description (e.g. Coffee)"
                        className="mochi-input text-xs py-1.5 px-2.5 flex-1"
                        value={newLineItemDesc}
                        onChange={(e) => setNewLineItemDesc(e.target.value)}
                      />
                      <input
                        type="number"
                        placeholder="Price ₱"
                        className="mochi-input text-xs py-1.5 px-2.5 w-24"
                        value={newLineItemAmt}
                        onChange={(e) => setNewLineItemAmt(e.target.value)}
                      />
                      <button
                        onClick={handleAddLineItem}
                        className="p-2 rounded-xl bg-emerald-500 text-white hover:bg-emerald-600 transition-colors"
                        title="Add item"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
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
                      className="mochi-btn-primary text-xs flex-1 py-3 flex items-center justify-center gap-1.5 bg-gradient-to-r from-emerald-500 to-teal-600"
                    >
                      <CheckCircle2 className="w-4 h-4" /> Save Receipt Expense
                    </button>
                  </div>
                </div>
              ) : (
                /* Upload Step / Choices */
                <div className="space-y-4">
                  <div
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault()
                      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                        handleFileUpload(e.dataTransfer.files[0])
                      }
                    }}
                    className="border-2 border-dashed border-emerald-500/40 rounded-3xl p-8 text-center bg-mochi-surface-alt hover:border-emerald-500/70 transition-colors flex flex-col items-center justify-center gap-3 cursor-pointer group"
                  >
                    <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Upload className="w-7 h-7" />
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-mochi-text mb-1">
                        Drag & Drop Receipt Photo Here
                      </h4>
                      <p className="text-xs text-mochi-text-muted">
                        Supports PNG, JPG, WEBP • Processed 100% locally on your device
                      </p>
                    </div>
                    <label className="mochi-btn-primary text-xs py-2 px-5 cursor-pointer mt-1 bg-gradient-to-r from-emerald-500 to-teal-600">
                      Select Receipt File
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

                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={startCamera}
                      className="py-3.5 px-3 rounded-2xl bg-mochi-surface-alt hover:bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 font-black text-xs flex items-center justify-center gap-2 transition-all active:scale-98 shadow-xs"
                    >
                      <Camera className="w-4 h-4 text-emerald-500" /> Open Camera Viewfinder
                    </button>

                    <button
                      onClick={() => setStep('paste')}
                      className="py-3.5 px-3 rounded-2xl bg-mochi-surface-alt hover:bg-mochi-primary/10 border border-mochi-primary/30 text-mochi-primary font-black text-xs flex items-center justify-center gap-2 transition-all active:scale-98 shadow-xs"
                    >
                      <FileText className="w-4 h-4 text-mochi-primary" /> Paste Raw Text / E-Receipt
                    </button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>

          {/* Image Lightbox Zoom Modal */}
          <AnimatePresence>
            {showImageZoom && imagePreview && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[80] bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
                onClick={() => setShowImageZoom(false)}
              >
                <div className="relative max-w-lg w-full max-h-[85vh] flex items-center justify-center">
                  <button
                    onClick={() => setShowImageZoom(false)}
                    className="absolute -top-10 right-0 p-2 text-white bg-black/50 rounded-full hover:bg-black/70"
                  >
                    <X className="w-6 h-6" />
                  </button>
                  <img
                    src={imagePreview}
                    alt="Receipt Full View"
                    className="max-w-full max-h-[80vh] object-contain rounded-2xl border border-white/20 shadow-2xl"
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
    </AnimatePresence>
  )
}
