import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, ArrowLeft, Mail, Lock, User, Bell, Target, Wallet } from 'lucide-react'
import { registerWithEmail } from '../../services/auth'
import { useThemeStore, type ThemeName } from '../../store/themeStore'

const themes: { name: ThemeName; color: string; emoji: string }[] = [
  { name: 'sakura', color: 'bg-pink-300', emoji: '🌸' },
  { name: 'matcha', color: 'bg-green-300', emoji: '🍵' },
  { name: 'peach', color: 'bg-orange-300', emoji: '🍑' },
  { name: 'ocean', color: 'bg-blue-300', emoji: '🌊' },
  { name: 'cloud', color: 'bg-sky-300', emoji: '☁️' },
  { name: 'moonlight', color: 'bg-indigo-600', emoji: '🌙' },
]

const steps = ['Account', 'Theme', 'PIN', 'Income', 'Goals', 'Notifications']

export default function RegisterPage() {
  const navigate = useNavigate()
  const { setTheme } = useThemeStore()
  const [currentStep, setCurrentStep] = useState(0)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [selectedTheme, setSelectedTheme] = useState<ThemeName>('sakura')
  const [pin, setPin] = useState('')
  const [pinConfirm, setPinConfirm] = useState('')
  const [monthlyIncome, setMonthlyIncome] = useState('')
  const [notificationsEnabled, setNotificationsEnabled] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleComplete = async () => {
    if (pin !== pinConfirm) {
      setError('PINs do not match')
      return
    }
    if (pin.length !== 4) {
      setError('PIN must be 4 digits')
      return
    }
    try {
      setIsLoading(true)
      setError(null)
      setTheme(selectedTheme)
      await registerWithEmail(email, password)
      navigate('/')
    } catch {
      setError('Could not create account. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-mochi-text">Create your account</h2>
            <div>
              <label htmlFor="reg-name" className="mochi-label">Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-mochi-text-muted" />
                <input id="reg-name" type="text" value={name} onChange={(e) => setName(e.target.value)} className="mochi-input pl-10" placeholder="Your name" required />
              </div>
            </div>
            <div>
              <label htmlFor="reg-email" className="mochi-label">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-mochi-text-muted" />
                <input id="reg-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="mochi-input pl-10" placeholder="you@example.com" required />
              </div>
            </div>
            <div>
              <label htmlFor="reg-password" className="mochi-label">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-mochi-text-muted" />
                <input id="reg-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="mochi-input pl-10" placeholder="Min 6 characters" required minLength={6} />
              </div>
            </div>
          </div>
        )
      case 1:
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-mochi-text">Choose your theme</h2>
            <div className="grid grid-cols-3 gap-3">
              {themes.map((t) => (
                <button
                  key={t.name}
                  onClick={() => setSelectedTheme(t.name)}
                  className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                    selectedTheme === t.name ? 'border-mochi-primary bg-mochi-primary/10' : 'border-mochi-border hover:border-mochi-text-muted/30'
                  }`}
                >
                  <span className="text-2xl">{t.emoji}</span>
                  <div className={`w-8 h-8 rounded-full ${t.color}`} />
                  <span className="text-xs text-mochi-text-secondary capitalize">{t.name}</span>
                </button>
              ))}
            </div>
          </div>
        )
      case 2:
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-mochi-text">Set your PIN</h2>
            <p className="text-sm text-mochi-text-secondary">Choose a 4-digit PIN for quick access</p>
            <div>
              <label htmlFor="reg-pin" className="mochi-label">PIN</label>
              <input id="reg-pin" type="password" inputMode="numeric" maxLength={4} value={pin} onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))} className="mochi-input text-center text-2xl tracking-[0.5em]" placeholder="••••" />
            </div>
            <div>
              <label htmlFor="reg-pin-confirm" className="mochi-label">Confirm PIN</label>
              <input id="reg-pin-confirm" type="password" inputMode="numeric" maxLength={4} value={pinConfirm} onChange={(e) => setPinConfirm(e.target.value.replace(/\D/g, ''))} className="mochi-input text-center text-2xl tracking-[0.5em]" placeholder="••••" />
            </div>
          </div>
        )
      case 3:
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Wallet className="w-5 h-5 text-mochi-primary" />
              <h2 className="text-xl font-semibold text-mochi-text">Monthly income (optional)</h2>
            </div>
            <p className="text-sm text-mochi-text-secondary">Helps Mochi set up your budget</p>
            <div>
              <label htmlFor="reg-income" className="mochi-label">Monthly income</label>
              <input id="reg-income" type="number" inputMode="numeric" value={monthlyIncome} onChange={(e) => setMonthlyIncome(e.target.value)} className="mochi-input" placeholder="₱0.00" />
            </div>
            <button onClick={handleNext} className="w-full mochi-btn-ghost text-sm">Skip for now</button>
          </div>
        )
      case 4:
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5 text-mochi-primary" />
              <h2 className="text-xl font-semibold text-mochi-text">Savings goals (optional)</h2>
            </div>
            <p className="text-sm text-mochi-text-secondary">What are you saving for?</p>
            <div className="grid grid-cols-2 gap-2">
              {['Emergency Fund', 'Vacation', 'House', 'Car', 'Education', 'Gadget'].map((g) => (
                <button key={g} className="p-3 rounded-xl border border-mochi-border hover:border-mochi-primary/50 hover:bg-mochi-primary/5 transition-all text-sm text-mochi-text-secondary">
                  {g}
                </button>
              ))}
            </div>
            <button onClick={handleNext} className="w-full mochi-btn-ghost text-sm">Skip for now</button>
          </div>
        )
      case 5:
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-mochi-primary" />
              <h2 className="text-xl font-semibold text-mochi-text">Stay notified</h2>
            </div>
            <p className="text-sm text-mochi-text-secondary">Get reminders for bills, debts, and goals</p>
            <button
              onClick={() => setNotificationsEnabled(!notificationsEnabled)}
              className={`w-full p-4 rounded-xl border-2 transition-all flex items-center justify-between ${
                notificationsEnabled ? 'border-mochi-primary bg-mochi-primary/10' : 'border-mochi-border'
              }`}
            >
              <span className="text-sm font-medium text-mochi-text">Push Notifications</span>
              <div className={`w-12 h-7 rounded-full transition-colors flex items-center ${notificationsEnabled ? 'bg-mochi-primary' : 'bg-mochi-border'}`}>
                <div className={`w-5 h-5 rounded-full bg-white shadow-sm mx-1 transition-transform ${notificationsEnabled ? 'translate-x-5' : 'translate-x-0'}`} />
              </div>
            </button>
          </div>
        )
      default:
        return null
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 16 }}
      animate={{ opacity: 1, x: 0 }}
      key={currentStep}
      className="flex flex-col"
    >
      {/* Progress */}
      <div className="mb-6">
        <div className="flex justify-between mb-2">
          <span className="text-xs text-mochi-text-muted">Step {currentStep + 1} of {steps.length}</span>
          <span className="text-xs text-mochi-text-muted">{steps[currentStep]}</span>
        </div>
        <div className="h-1.5 bg-mochi-border rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-mochi rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      {/* Step Content */}
      <div className="min-h-[300px]">{renderStep()}</div>

      {/* Error */}
      {error && (
        <p className="text-sm text-mochi-error text-center mt-4">{error}</p>
      )}

      {/* Navigation */}
      <div className="mt-6 flex gap-3">
        {currentStep > 0 && (
          <button onClick={handleBack} className="flex-1 mochi-btn-secondary py-3">
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
        )}
        {currentStep < steps.length - 1 ? (
          <button onClick={handleNext} className="flex-1 mochi-btn-primary py-3">
            Next
            <ArrowRight className="w-4 h-4 ml-1" />
          </button>
        ) : (
          <button
            onClick={handleComplete}
            disabled={isLoading || !email || !password || pin !== pinConfirm}
            className="flex-1 mochi-btn-primary py-3"
          >
            {isLoading ? 'Creating account...' : 'Start using Mochi Money 🍡'}
          </button>
        )}
      </div>
    </motion.div>
  )
}
