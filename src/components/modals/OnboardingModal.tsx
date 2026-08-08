import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Target,
  ArrowRight,
  CheckCircle2,
  Shield,
  CreditCard,
  HeartHandshake,
  Smartphone,
  Banknote,
  Building2,
  Sparkles,
  Zap,
} from 'lucide-react'
import Mascot from '@/components/ui/Mascot'
import { useAuthStore } from '@/store/authStore'
import { useAppStore } from '@/store/appStore'
import { useToastStore } from '@/store/toastStore'

interface OnboardingModalProps {
  isOpen: boolean
  onClose: () => void
}

const WALLET_PRESETS = [
  { name: 'GCash', type: 'digital_bank' as const, color: '#007DFE', icon: Smartphone },
  { name: 'Maya', type: 'digital_bank' as const, color: '#00D632', icon: Sparkles },
  { name: 'Cash Wallet', type: 'cash' as const, color: '#10B981', icon: Banknote },
  { name: 'BDO / Bank', type: 'traditional_bank' as const, color: '#1E3A8A', icon: Building2 },
]

const GOAL_FOCUSES = [
  { id: 'savings', title: 'Save More', icon: Shield, desc: 'Set milestone targets and build emergency savings' },
  { id: 'spending', title: 'Control Spending', icon: Target, desc: 'Log spending effortlessly and stay under limits' },
  { id: 'debt', title: 'Pay Debt', icon: CreditCard, desc: 'Organize loan schedules and eliminate interest burden' },
  { id: 'track', title: 'Track Everything', icon: Zap, desc: 'Get full visibility over Cash, GCash, and Bank balances' },
  { id: 'all', title: 'A Little Bit of Everything', icon: HeartHandshake, desc: 'Complete financial companion experience' },
]

export default function OnboardingModal({ isOpen, onClose }: OnboardingModalProps) {
  const { user, updateUser } = useAuthStore()
  const { addWallet, addTransaction } = useAppStore()
  const { addToast } = useToastStore()

  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [selectedGoal, setSelectedGoal] = useState('all')
  const [walletName, setWalletName] = useState('GCash')
  const [walletType, setWalletType] = useState<'cash' | 'digital_bank' | 'traditional_bank'>('digital_bank')
  const [initialBalance, setInitialBalance] = useState('1000')

  if (!isOpen) return null

  const handleFinishOnboarding = () => {
    // 1. Set user currency to PHP permanently
    updateUser({ currency: 'PHP', hasCompletedOnboarding: true })

    // 2. Create initial wallet
    const balNum = parseFloat(initialBalance) || 0
    const newWalletId = crypto.randomUUID()
    addWallet({
      id: newWalletId,
      userId: user?.id || 'anon',
      name: walletName,
      type: walletType,
      balance: balNum,
      currency: 'PHP',
      color: walletType === 'cash' ? '#10B981' : '#007DFE',
      isDefault: true,
      includeInTotal: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })

    // 3. Log initial balance transaction if > 0
    if (balNum > 0) {
      addTransaction({
        id: crypto.randomUUID(),
        userId: user?.id || 'anon',
        type: 'income',
        amount: balNum,
        currency: 'PHP',
        categoryId: 'other_income',
        walletId: newWalletId,
        merchant: 'Initial Account Balance',
        paymentMethod: walletType === 'cash' ? 'cash' : walletName.toLowerCase().includes('maya') ? 'maya' : 'gcash',
        date: new Date().toISOString().split('T')[0],
        notes: 'Initial balance set up during Mochi onboarding',
        isFavorite: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
    }

    addToast({
      type: 'success',
      title: 'Welcome to Mochi Money!',
      message: `Your ${walletName} wallet has been created with ₱${balNum.toLocaleString()} PHP.`,
    })

    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 16 }}
        className="relative w-full max-w-md bg-mochi-surface border border-mochi-border rounded-3xl shadow-2xl overflow-hidden my-4"
      >
        {/* Top Header */}
        <div className="relative p-5 bg-gradient-to-r from-mochi-primary/20 via-purple-500/15 to-indigo-500/20 border-b border-mochi-border text-center">
          <div className="mx-auto w-14 h-14 rounded-full bg-mochi-surface flex items-center justify-center shadow-md mb-2">
            <Mascot size="sm" mood="happy" animate={true} />
          </div>
          <h2 className="text-lg font-black text-mochi-text">Welcome to Mochi Money!</h2>
          <p className="text-xs text-mochi-text-secondary font-semibold mt-0.5">
            Let's set up your cozy financial companion in 3 short steps.
          </p>

          {/* Progress Step Bar */}
          <div className="flex items-center justify-center gap-1.5 mt-3">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  s === step
                    ? 'w-8 bg-mochi-primary'
                    : s < step
                    ? 'w-3 bg-emerald-500'
                    : 'w-3 bg-mochi-border'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Modal Step Content */}
        <div className="p-6 space-y-5">
          <AnimatePresence mode="wait">
            {/* STEP 1: GOAL INTENT */}
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div>
                  <h3 className="text-sm font-black text-mochi-text">What are you working toward?</h3>
                  <p className="text-xs text-mochi-text-muted font-bold mt-0.5">
                    Pick your primary focus so Mochi can tailor your daily experience.
                  </p>
                </div>

                <div className="space-y-2">
                  {GOAL_FOCUSES.map((gf) => {
                    const Icon = gf.icon
                    const isSelected = selectedGoal === gf.id
                    return (
                      <button
                        key={gf.id}
                        type="button"
                        onClick={() => setSelectedGoal(gf.id)}
                        className={`w-full p-3.5 rounded-2xl border flex items-center gap-3 text-left transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-mochi-primary/15 border-mochi-primary shadow-sm scale-[1.01]'
                            : 'bg-mochi-surface-alt/60 border-mochi-border hover:border-mochi-text-muted/40 hover:bg-mochi-surface-alt'
                        }`}
                      >
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                            isSelected ? 'bg-mochi-primary text-white shadow-xs' : 'bg-mochi-surface text-mochi-primary border border-mochi-border'
                          }`}
                        >
                          <Icon className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="text-xs font-black text-mochi-text">{gf.title}</p>
                            {isSelected && <CheckCircle2 className="w-4 h-4 text-mochi-primary shrink-0" />}
                          </div>
                          <p className="text-[10px] text-mochi-text-muted font-semibold truncate mt-0.5">{gf.desc}</p>
                        </div>
                      </button>
                    )
                  })}
                </div>

                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="mochi-btn-primary w-full py-3.5 text-xs font-black flex items-center justify-center gap-2 shadow-md hover:scale-[1.01] active:scale-95 transition-all cursor-pointer"
                >
                  <span>Continue to Accounts</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </motion.div>
            )}

            {/* STEP 2: ACCOUNT DISCOVERY */}
            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div>
                  <h3 className="text-sm font-black text-mochi-text">Where's your money?</h3>
                  <p className="text-xs text-mochi-text-muted font-bold mt-0.5">
                    Select your main account card to start tracking immediately in PHP (₱).
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  {WALLET_PRESETS.map((preset) => {
                    const Icon = preset.icon
                    const isSelected = walletName === preset.name
                    return (
                      <button
                        key={preset.name}
                        type="button"
                        onClick={() => {
                          setWalletName(preset.name)
                          setWalletType(preset.type)
                        }}
                        className={`p-3 rounded-2xl border flex items-center gap-2.5 text-left transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-mochi-primary/15 border-mochi-primary shadow-xs scale-105'
                            : 'bg-mochi-surface-alt/60 border-mochi-border hover:border-mochi-text-muted/40 hover:bg-mochi-surface-alt'
                        }`}
                      >
                        <div
                          className="w-9 h-9 rounded-xl flex items-center justify-center text-white shrink-0 shadow-xs"
                          style={{ backgroundColor: preset.color }}
                        >
                          <Icon className="w-4.5 h-4.5" />
                        </div>
                        <span className="text-xs font-black text-mochi-text truncate">{preset.name}</span>
                      </button>
                    )
                  })}
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-mochi-text-secondary">
                    Starting Balance (PHP ₱)
                  </label>
                  <div className="relative flex items-center">
                    <span className="absolute left-3.5 text-base font-black text-mochi-primary">₱</span>
                    <input
                      type="number"
                      value={initialBalance}
                      onChange={(e) => setInitialBalance(e.target.value)}
                      placeholder="1000.00"
                      className="mochi-input text-base font-black font-mono w-full pl-8 shadow-inner"
                    />
                  </div>
                </div>

                <div className="flex gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="mochi-btn-secondary text-xs py-3 px-4 font-bold cursor-pointer"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={() => setStep(3)}
                    className="mochi-btn-primary flex-1 py-3 text-xs font-bold flex items-center justify-center gap-2 shadow-md cursor-pointer"
                  >
                    <span>Continue</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* STEP 3: QUICK SETUP EXIT */}
            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4 text-center"
              >
                <div className="py-2 space-y-3">
                  <div className="w-16 h-16 rounded-full bg-emerald-500/15 text-emerald-500 flex items-center justify-center mx-auto border border-emerald-500/30 shadow-md">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-mochi-text">Ready! Let's start small.</h3>
                    <p className="text-xs text-mochi-text-secondary font-bold max-w-xs mx-auto mt-1">
                      Your {walletName} account is set up with ₱{parseFloat(initialBalance || '0').toLocaleString()} PHP.
                    </p>
                  </div>

                  <div className="p-3 rounded-2xl bg-mochi-surface-alt/70 border border-mochi-border text-xs text-mochi-text-secondary font-bold max-w-xs mx-auto space-y-1 text-left">
                    <div className="flex items-center justify-between text-[11px]">
                      <span>Primary Goal:</span>
                      <span className="font-black text-mochi-primary uppercase">{selectedGoal}</span>
                    </div>
                    <div className="flex items-center justify-between text-[11px]">
                      <span>Main Account:</span>
                      <span className="font-black text-emerald-600 dark:text-emerald-400">{walletName}</span>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleFinishOnboarding}
                  className="mochi-btn-primary w-full py-3.5 text-xs font-extrabold flex items-center justify-center gap-2 shadow-lg hover:scale-[1.01] active:scale-95 transition-all cursor-pointer"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Start Exploring Mochi Money</span>
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  )
}
