import { useState } from 'react'
import {
  Palette,
  Settings as GeneralIcon,
  Info,
  LifeBuoy,
  ChevronRight,
  LogOut,
  HelpCircle,
  MessageSquare,
  Bug,
  FileText,
  Lock,
  Code,
  Star,
  Send,
} from 'lucide-react'
import { useAuthStore } from '@/store/authStore'

import { useThemeStore } from '@/store/themeStore'
import Dialog from '@/components/ui/Dialog'
import { useToastStore } from '@/store/toastStore'
import { cn } from '@/lib/utils'

// Reusable inline toggle component
const Toggle = ({ checked, onChange }: { checked: boolean; onChange: () => void }) => (
  <button
    role="switch"
    aria-checked={checked}
    onClick={onChange}
    className={cn(
      'relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none',
      checked ? 'bg-mochi-primary' : 'bg-mochi-text/20'
    )}
  >
    <span className="sr-only">Toggle setting</span>
    <span
      className={cn(
        'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-mochi-surface shadow ring-0 transition duration-200 ease-in-out',
        checked ? 'translate-x-5' : 'translate-x-0'
      )}
    />
  </button>
)

const THEME_OPTIONS: Array<{
  id: 'sakura' | 'matcha' | 'peach' | 'ocean' | 'cloud' | 'strawberry' | 'moonlight' | 'cozy-cafe'
  name: string
  desc: string
  colors: [string, string, string]
}> = [
  { id: 'sakura', name: 'Sakura', desc: 'Soft Pastel Pink', colors: ['#F9A8D4', '#A78BFA', '#FAFAFA'] },
  { id: 'matcha', name: 'Matcha', desc: 'Fresh Mint Green', colors: ['#86EFAC', '#6EE7B7', '#FAFAFA'] },
  { id: 'peach', name: 'Peach', desc: 'Warm Peach', colors: ['#FDBA74', '#FCA5A5', '#FAFAFA'] },
  { id: 'ocean', name: 'Ocean', desc: 'Clear Sky Blue', colors: ['#67AED7', '#22D3EE', '#FAFAFA'] },
  { id: 'cloud', name: 'Cloud', desc: 'Lavender Cloud', colors: ['#93C5FD', '#C4B5FD', '#FAFAFA'] },
  { id: 'strawberry', name: 'Strawberry', desc: 'Rose Berry', colors: ['#FB7185', '#FDA4AF', '#FFF1F2'] },
  { id: 'moonlight', name: 'Moonlight', desc: 'Midnight Dark', colors: ['#C4B5FD', '#818CF8', '#0F172A'] },
  { id: 'cozy-cafe', name: 'Cozy Café', desc: 'Warm Coffee Cream', colors: ['#A0785C', '#D4A574', '#FAF5F0'] },
]

export default function SettingsPage() {
  const { theme: currentTheme, setTheme, darkMode, animationsEnabled, soundsEnabled, toggleDarkMode, toggleAnimations, toggleSounds } = useThemeStore()
  const { logout } = useAuthStore()

  // Modal State
  const [activeModal, setActiveModal] = useState<'privacy' | 'terms' | 'licenses' | 'help' | 'feedback' | 'bug' | null>(null)

  // Feedback State
  const [feedbackRating, setFeedbackRating] = useState(5)
  const [feedbackText, setFeedbackText] = useState('')

  // Bug State
  const [bugCategory, setBugCategory] = useState('ui')
  const [bugDescription, setBugDescription] = useState('')

  const handleFeedbackSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!feedbackText.trim()) return
    useToastStore.getState().success('Thank you for your feedback! Mochi appreciates it.', 'Feedback Received')
    setFeedbackText('')
    setActiveModal(null)
  }

  const handleBugSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!bugDescription.trim()) return
    useToastStore.getState().success('Bug report submitted! Our team is on it.', 'Report Sent')
    setBugDescription('')
    setActiveModal(null)
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 pb-24 space-y-6">
      {/* 1. Privacy Policy Modal */}
      <Dialog isOpen={activeModal === 'privacy'} onClose={() => setActiveModal(null)} title="Privacy Policy">
        <div className="space-y-4 text-xs leading-relaxed text-mochi-text-secondary">
          <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-3">
            <Lock className="w-6 h-6 text-emerald-500 shrink-0" />
            <div>
              <h4 className="font-extrabold text-mochi-text">100% Local-First & Encrypted</h4>
              <p className="text-[11px] text-mochi-text-muted">Your financial logs and AI chats remain on your device.</p>
            </div>
          </div>
          <p>
            At <strong>Mochi Money</strong>, we respect your privacy. Our core mascot AI operates 100% locally in your WebGPU browser engine using Llama 3.2 3B Instruct.
          </p>
          <p>
            We do not sell, track, or monetise your personal income, expense logs, or budget goals to third-party advertisers.
          </p>
        </div>
      </Dialog>

      {/* 2. Terms of Service Modal */}
      <Dialog isOpen={activeModal === 'terms'} onClose={() => setActiveModal(null)} title="Terms of Service">
        <div className="space-y-4 text-xs leading-relaxed text-mochi-text-secondary">
          <div className="p-3.5 rounded-2xl bg-sky-500/10 border border-sky-500/30 flex items-center gap-3">
            <FileText className="w-6 h-6 text-sky-500 shrink-0" />
            <div>
              <h4 className="font-extrabold text-mochi-text">Mochi Money Usage Terms</h4>
              <p className="text-[11px] text-mochi-text-muted">Updated for Mochi Local AI WebGPU Engine</p>
            </div>
          </div>
          <p>
            By using Mochi Money, you agree to store financial records responsibly. Mochi Money provides automated budget calculations and AI diagnostics for self-tracking purposes.
          </p>
          <p>
            <em>Disclaimer:</em> Mochi Money and Mochi AI Assistant are self-help tools and do not constitute certified financial or tax advice.
          </p>
        </div>
      </Dialog>

      {/* 3. Open Source Licenses Modal */}
      <Dialog isOpen={activeModal === 'licenses'} onClose={() => setActiveModal(null)} title="Open Source Licenses">
        <div className="space-y-3 text-xs text-mochi-text-secondary">
          <div className="p-3 rounded-2xl bg-purple-500/10 border border-purple-500/30 flex items-center gap-2">
            <Code className="w-5 h-5 text-purple-500" />
            <h4 className="font-extrabold text-mochi-text">Built with Open Source Software</h4>
          </div>
          <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
            {[
              { name: 'React', license: 'MIT', desc: 'UI library by Meta' },
              { name: '@mlc-ai/web-llm', license: 'Apache 2.0', desc: 'WebGPU Local LLM engine' },
              { name: 'Llama 3.2 3B Instruct', license: 'Llama 3.2 Community', desc: 'Meta AI weights' },
              { name: 'Lucide Icons', license: 'ISC', desc: 'Vector icon system' },
              { name: 'Framer Motion', license: 'MIT', desc: 'Animation framework' },
              { name: 'Zustand', license: 'MIT', desc: 'State management' },
              { name: 'Tailwind CSS', license: 'MIT', desc: 'Utility CSS engine' },
            ].map((lib) => (
              <div key={lib.name} className="p-2.5 rounded-xl bg-mochi-surface-alt border border-mochi-border flex items-center justify-between">
                <div>
                  <h5 className="font-bold text-mochi-text">{lib.name}</h5>
                  <p className="text-[10px] text-mochi-text-muted">{lib.desc}</p>
                </div>
                <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-mochi-primary/15 text-mochi-primary">
                  {lib.license}
                </span>
              </div>
            ))}
          </div>
        </div>
      </Dialog>

      {/* 4. Help Center Modal */}
      <Dialog isOpen={activeModal === 'help'} onClose={() => setActiveModal(null)} title="Mochi Help Center & FAQs">
        <div className="space-y-3 text-xs text-mochi-text-secondary max-h-80 overflow-y-auto pr-1">
          <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-amber-500" />
            <h4 className="font-extrabold text-mochi-text">Frequently Asked Questions</h4>
          </div>

          <div className="space-y-2">
            <div className="p-3 rounded-2xl bg-mochi-surface border border-mochi-border space-y-1">
              <h5 className="font-bold text-mochi-text">How does Mochi AI run 100% free & local?</h5>
              <p className="text-[11px] text-mochi-text-muted">
                Mochi uses WebGPU technology to run Llama 3.2 3B Instruct right inside your browser graphics hardware — no API keys required.
              </p>
            </div>

            <div className="p-3 rounded-2xl bg-mochi-surface border border-mochi-border space-y-1">
              <h5 className="font-bold text-mochi-text">How do Mochi Circles and Splitwise work?</h5>
              <p className="text-[11px] text-mochi-text-muted">
                Create a savings circle or join using a 6-digit code to track joint trips, split bills equally, and log shared progress.
              </p>
            </div>

            <div className="p-3 rounded-2xl bg-mochi-surface border border-mochi-border space-y-1">
              <h5 className="font-bold text-mochi-text">How do I sync due dates to device calendar?</h5>
              <p className="text-[11px] text-mochi-text-muted">
                In Subscriptions or Debts, click "Sync to Device Calendar" to download an `.ics` file compatible with Apple, Google, and Android calendars.
              </p>
            </div>
          </div>
        </div>
      </Dialog>

      {/* 5. Send Feedback Modal */}
      <Dialog isOpen={activeModal === 'feedback'} onClose={() => setActiveModal(null)} title="Send Feedback to Mochi">
        <form onSubmit={handleFeedbackSubmit} className="space-y-4 text-xs">
          <div className="p-3 rounded-2xl bg-sky-500/10 border border-sky-500/30 flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-sky-500" />
            <p className="text-mochi-text font-bold">What features would you love to see next in Mochi Money?</p>
          </div>

          <div>
            <label className="block text-center font-bold text-mochi-text-secondary mb-2">Overall Rating</label>
            {/* Centered Rating Stars */}
            <div className="flex justify-center items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setFeedbackRating(star)}
                  className={cn(
                    'p-2.5 rounded-xl border transition-all cursor-pointer hover:scale-110',
                    feedbackRating >= star
                      ? 'bg-amber-400/20 border-amber-400 text-amber-500 shadow-xs'
                      : 'border-mochi-border text-mochi-text-muted hover:border-amber-300'
                  )}
                >
                  <Star className="w-5 h-5 fill-current" />
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block font-bold text-mochi-text-secondary mb-1">Your Feedback & Suggestions *</label>
            <textarea
              required
              rows={3}
              placeholder="Tell us what you love or how we can improve..."
              value={feedbackText}
              onChange={(e) => setFeedbackText(e.target.value)}
              className="mochi-input text-xs w-full font-medium"
              autoFocus
            />
          </div>

          <div className="pt-2 flex gap-3">
            <button
              type="button"
              onClick={() => setActiveModal(null)}
              className="mochi-btn-secondary flex-1 py-2.5 font-bold"
            >
              Cancel
            </button>
            <button type="submit" className="mochi-btn-primary flex-1 py-2.5 font-bold flex items-center justify-center gap-1.5 shadow-md">
              <Send className="w-4 h-4" /> Submit Feedback
            </button>
          </div>
        </form>
      </Dialog>

      {/* 6. Report a Bug Modal */}
      <Dialog isOpen={activeModal === 'bug'} onClose={() => setActiveModal(null)} title="Report a Bug">
        <form onSubmit={handleBugSubmit} className="space-y-4 text-xs">
          <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center gap-2">
            <Bug className="w-5 h-5 text-rose-500" />
            <p className="text-mochi-text font-bold">Describe what went wrong so we can fix it promptly.</p>
          </div>

          <div>
            <label className="block font-bold text-mochi-text-secondary mb-1">Bug Category</label>
            <select
              value={bugCategory}
              onChange={(e) => setBugCategory(e.target.value)}
              className="mochi-input text-xs w-full font-bold"
            >
              <option value="ui">UI & Layout Issue</option>
              <option value="ai">Mochi AI Chat Assistant</option>
              <option value="subscriptions">Subscriptions / Debts</option>
              <option value="circles">Mochi Circles & Splitwise</option>
              <option value="sync">Wallet & Syncing</option>
            </select>
          </div>

          <div>
            <label className="block font-bold text-mochi-text-secondary mb-1">Issue Description *</label>
            <textarea
              required
              rows={3}
              placeholder="What happened and how can we reproduce it?"
              value={bugDescription}
              onChange={(e) => setBugDescription(e.target.value)}
              className="mochi-input text-xs w-full font-medium"
              autoFocus
            />
          </div>

          <div className="pt-2 flex gap-3">
            <button
              type="button"
              onClick={() => setActiveModal(null)}
              className="mochi-btn-secondary flex-1 py-2.5 font-bold"
            >
              Cancel
            </button>
            <button type="submit" className="mochi-btn-primary flex-1 py-2.5 font-bold flex items-center justify-center gap-1.5 shadow-md">
              <Send className="w-4 h-4" /> Send Report
            </button>
          </div>
        </form>
      </Dialog>

      {/* Main Settings Header */}
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-mochi-text tracking-tight">App Settings</h1>
          <p className="text-xs text-mochi-text-muted mt-0.5 font-medium">Customize your Mochi themes & preferences</p>
        </div>
      </header>

      {/* Theme Engine Section */}
      <section className="mochi-card p-5 space-y-3">
        <div className="flex items-center gap-2 mb-1">
          <Palette className="w-5 h-5 text-mochi-primary" />
          <h2 className="text-base font-black text-mochi-text">Themes & Appearance</h2>
        </div>
        <p className="text-xs text-mochi-text-secondary font-medium">Select one of our 8 handcrafted themes:</p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          {THEME_OPTIONS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTheme(t.id)}
              className={cn(
                'flex flex-col items-center gap-2 p-3 rounded-2xl border-2 transition-all cursor-pointer text-center',
                currentTheme === t.id
                  ? 'border-mochi-primary bg-mochi-primary/10 shadow-xs scale-105'
                  : 'border-mochi-border hover:border-mochi-primary/40 bg-mochi-surface'
              )}
            >
              <div className="flex -space-x-1.5">
                {t.colors.map((c, idx) => (
                  <span
                    key={idx}
                    className="w-4 h-4 rounded-full border-2 border-white shadow-xs"
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
              <div className="min-w-0">
                <h4 className="text-xs font-extrabold text-mochi-text truncate">{t.name}</h4>
                <p className="text-[10px] text-mochi-text-muted truncate">{t.desc}</p>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* General Preferences */}
      <section className="mochi-card space-y-4">
        <div className="flex items-center gap-2 mb-1">
          <GeneralIcon className="w-5 h-5 text-mochi-primary" />
          <h2 className="text-base font-black text-mochi-text">Preferences</h2>
        </div>

        <div className="flex items-center justify-between text-xs font-bold text-mochi-text">
          <span>Dark Mode Toggle</span>
          <Toggle checked={darkMode} onChange={toggleDarkMode} />
        </div>
        <div className="flex items-center justify-between text-xs font-bold text-mochi-text">
          <span>Smooth Micro-Animations</span>
          <Toggle checked={animationsEnabled} onChange={toggleAnimations} />
        </div>
        <div className="flex items-center justify-between text-xs font-bold text-mochi-text">
          <span>Mascot Audio Feedback</span>
          <Toggle checked={soundsEnabled} onChange={toggleSounds} />
        </div>
      </section>

      {/* About & Legal with Popup Modals */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="mochi-card space-y-3">
          <div className="flex items-center gap-2 mb-1">
            <Info className="w-5 h-5 text-mochi-primary" />
            <h2 className="text-base font-black text-mochi-text">About & Legal</h2>
          </div>

          <button
            onClick={() => setActiveModal('privacy')}
            className="w-full flex items-center justify-between p-2.5 rounded-2xl hover:bg-mochi-surface-alt text-left text-xs font-bold text-mochi-text transition-colors"
          >
            <span className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-emerald-500" /> Privacy Policy
            </span>
            <ChevronRight className="w-4 h-4 text-mochi-text-muted" />
          </button>

          <button
            onClick={() => setActiveModal('terms')}
            className="w-full flex items-center justify-between p-2.5 rounded-2xl hover:bg-mochi-surface-alt text-left text-xs font-bold text-mochi-text transition-colors"
          >
            <span className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-sky-500" /> Terms of Service
            </span>
            <ChevronRight className="w-4 h-4 text-mochi-text-muted" />
          </button>

          <button
            onClick={() => setActiveModal('licenses')}
            className="w-full flex items-center justify-between p-2.5 rounded-2xl hover:bg-mochi-surface-alt text-left text-xs font-bold text-mochi-text transition-colors"
          >
            <span className="flex items-center gap-2">
              <Code className="w-4 h-4 text-purple-500" /> Open Source Licenses
            </span>
            <ChevronRight className="w-4 h-4 text-mochi-text-muted" />
          </button>
        </div>

        <div className="mochi-card space-y-3">
          <div className="flex items-center gap-2 mb-1">
            <LifeBuoy className="w-5 h-5 text-mochi-primary" />
            <h2 className="text-base font-black text-mochi-text">Support & Community</h2>
          </div>

          <button
            onClick={() => setActiveModal('help')}
            className="w-full flex items-center justify-between p-2.5 rounded-2xl hover:bg-mochi-surface-alt text-left text-xs font-bold text-mochi-text transition-colors"
          >
            <span className="flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-amber-500" /> Help Center & FAQs
            </span>
            <ChevronRight className="w-4 h-4 text-mochi-text-muted" />
          </button>

          <button
            onClick={() => setActiveModal('feedback')}
            className="w-full flex items-center justify-between p-2.5 rounded-2xl hover:bg-mochi-surface-alt text-left text-xs font-bold text-mochi-text transition-colors"
          >
            <span className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-sky-500" /> Send Feedback
            </span>
            <ChevronRight className="w-4 h-4 text-mochi-text-muted" />
          </button>

          <button
            onClick={() => setActiveModal('bug')}
            className="w-full flex items-center justify-between p-2.5 rounded-2xl hover:bg-mochi-surface-alt text-left text-xs font-bold text-mochi-text transition-colors"
          >
            <span className="flex items-center gap-2">
              <Bug className="w-4 h-4 text-rose-500" /> Report a Bug
            </span>
            <ChevronRight className="w-4 h-4 text-mochi-text-muted" />
          </button>
        </div>
      </section>

      {/* Logout */}
      <div className="pt-2">
        <button
          onClick={logout}
          className="w-full mochi-card py-3 flex items-center justify-center gap-2 text-rose-500 font-extrabold hover:bg-rose-500/10 transition-colors text-xs"
        >
          <LogOut className="w-4 h-4" />
          Log Out of Mochi
        </button>
      </div>
    </div>
  )
}
