import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, ShieldCheck, X, RefreshCw, Cpu, CheckCircle2, AlertCircle, Trash2 } from 'lucide-react'
import { useAppStore, getUid } from '@/store/appStore'
import { formatCurrency } from '@/lib/utils'
import Mascot from '@/components/ui/Mascot'
import {
  checkWebGPUSupport,
  getOrInitLocalAI,
  askMochiAI,
  isLocalAILoaded,
} from '@/services/localAI'
import type { InitProgressReport } from '@mlc-ai/web-llm'

interface Message {
  id: string
  sender: 'user' | 'mochi'
  text: string
  timestamp: string
  actionSuccessNotice?: string
}

interface MascotAIChatModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function MascotAIChatModal({ isOpen, onClose }: MascotAIChatModalProps) {
  const {
    transactions,
    wallets,
    budgets,
    savingsGoals,
    subscriptions,
    debts,
  } = useAppStore()

  const INITIAL_WELCOME: Message = {
    id: 'welcome',
    sender: 'mochi',
    text: "Hello! I am Mochi, your supercharged AI financial assistant. I run 100% locally inside your browser — keeping your financial records 100% private. Ask me for financial advice, balance diagnostics, or tell me to log an expense or income!",
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  }

  const [messages, setMessages] = useState<Message[]>(() => {
    try {
      const saved = localStorage.getItem('mochi_ai_chat_history')
      if (saved) {
        const parsed = JSON.parse(saved)
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.slice(-15)
        }
      }
    } catch (e) {
      console.warn('Could not load chat history:', e)
    }
    return [INITIAL_WELCOME]
  })

  // Persist latest 15 messages
  useEffect(() => {
    try {
      localStorage.setItem('mochi_ai_chat_history', JSON.stringify(messages.slice(-15)))
    } catch (e) {
      console.warn('Could not save chat history:', e)
    }
  }, [messages])

  const [input, setInput] = useState('')
  const [isInitializing, setIsInitializing] = useState(false)
  const [isModelReady, setIsModelReady] = useState(isLocalAILoaded())
  const [progressText, setProgressText] = useState('')
  const [progressPercent, setProgressPercent] = useState(0)
  const [isGenerating, setIsGenerating] = useState(false)
  const [hasGPU, setHasGPU] = useState(true)
  const chatEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setHasGPU(checkWebGPUSupport())
    if (isOpen && !isLocalAILoaded()) {
      handleInitEngine()
    }
  }, [isOpen])

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isGenerating])

  const handleClearHistory = () => {
    setMessages([INITIAL_WELCOME])
    localStorage.removeItem('mochi_ai_chat_history')
  }

  // Build live financial context string
  const getContextString = () => {
    const totalAssets = wallets.reduce((s, w) => s + w.balance, 0)
    const monthlyIncome = transactions
      .filter((t) => t.type === 'income')
      .reduce((s, t) => s + t.amount, 0)
    const monthlyExpense = transactions
      .filter((t) => t.type === 'expense')
      .reduce((s, t) => s + t.amount, 0)
    const netSurplus = monthlyIncome - monthlyExpense
    const savingsRate = monthlyIncome > 0 ? (((monthlyIncome - monthlyExpense) / monthlyIncome) * 100).toFixed(1) : '0'

    const activeGoals = savingsGoals.map((g) => `${g.name}: ₱${g.currentAmount}/₱${g.targetAmount}`).join(', ')
    const subTotal = subscriptions.reduce((s, sub) => s + sub.amount, 0)
    const subList = subscriptions.map((s) => s.name).join(', ')
    const totalDebt = debts.reduce((s, d) => s + d.currentBalance, 0)
    const walletList = wallets.map((w) => `${w.name} (₱${w.balance})`).join(', ')

    return `Total Assets: ${formatCurrency(totalAssets)}
Wallets: ${walletList || 'Cash Wallet'}
Monthly Income Tracked: ${formatCurrency(monthlyIncome)}
Monthly Expenses Tracked: ${formatCurrency(monthlyExpense)}
Net Cash Surplus/Deficit: ${formatCurrency(netSurplus)}
Savings Rate: ${savingsRate}%
Active Savings Goals: ${activeGoals || 'None'}
Active Subscriptions (${subscriptions.length}): ${subList || 'None'} (${formatCurrency(subTotal)}/mo)
Total Debt Outstanding: ${formatCurrency(totalDebt)}
Active Budget Categories: ${budgets.length}`
  }

  const handleInitEngine = async () => {
    if (!hasGPU) return
    setIsInitializing(true)
    try {
      await getOrInitLocalAI((report: InitProgressReport) => {
        setProgressText(report.text)
        setProgressPercent(Math.round(report.progress * 100))
      })
      setIsModelReady(true)
    } catch (err: any) {
      console.error('Failed to init Local AI engine:', err)
    } finally {
      setIsInitializing(false)
    }
  }

  const executeAction = (actionObj: any, userPrompt?: string): string | undefined => {
    const store = useAppStore.getState()
    const activeWallets = store.wallets
    const uid = getUid()
    const now = new Date().toISOString()
    const today = now.split('T')[0]

    // Ensure default wallet exists
    let defaultWallet = activeWallets.find((w) => w.isDefault) || activeWallets[0]
    if (!defaultWallet) {
      const newWallet = {
        id: `wallet_cash_${Date.now()}`,
        userId: uid,
        name: 'Cash Wallet',
        type: 'cash' as const,
        balance: 0,
        currency: 'PHP',
        icon: 'wallet',
        color: '#10B981',
        isDefault: true,
        includeInTotal: true,
        createdAt: now,
        updatedAt: now,
      }
      store.addWallet(newWallet)
      defaultWallet = newWallet
    }

    // 1. Process explicit action object from LLM
    if (actionObj && actionObj.action && actionObj.action !== 'none') {
      const { action, payload } = actionObj

      if (action === 'add_transaction' && payload) {
        const amount = Number(payload.amount) || 0
        const type = payload.type === 'income' ? 'income' : 'expense'
        const merchant = payload.merchant || payload.notes || 'Transaction'

        if (amount > 0) {
          store.addTransaction({
            id: `txn_ai_${Date.now()}`,
            userId: uid,
            type,
            amount,
            currency: 'PHP',
            categoryId: payload.category || 'other',
            merchant,
            paymentMethod: 'cash',
            walletId: defaultWallet.id,
            date: today,
            notes: `Added via Mochi AI`,
            isFavorite: false,
            createdAt: now,
            updatedAt: now,
          })

          return `Action executed: Logged ${type} of ₱${amount.toLocaleString()} for ${merchant}.`
        }
      }

      if (action === 'add_savings_goal' && payload) {
        const targetAmount = Number(payload.targetAmount) || 1000
        const name = payload.name || 'New Savings Goal'

        store.addSavingsGoal({
          id: `goal_ai_${Date.now()}`,
          userId: uid,
          name,
          targetAmount,
          currentAmount: 0,
          currency: 'PHP',
          icon: 'target',
          color: '#10B981',
          milestones: [],
          contributions: [],
          createdAt: now,
          updatedAt: now,
        })

        return `Action executed: Created savings goal "${name}" with target ₱${targetAmount.toLocaleString()}.`
      }

      if (action === 'delete_subscription' && payload) {
        const nameQuery = String(payload.name || '').toLowerCase()
        const targetSub = store.subscriptions.find((s) => s.name.toLowerCase().includes(nameQuery))
        if (targetSub) {
          store.deleteSubscription(targetSub.id)
          return `Action executed: Deleted subscription "${targetSub.name}".`
        } else {
          return `Notice: Could not find subscription matching "${payload.name}".`
        }
      }
    }

    // 2. Intelligent NLP Fallback: if user explicit intent was to log/spent/buy
    if (userPrompt) {
      const promptLower = userPrompt.toLowerCase()
      const isLogIntent = /(?:log|add|spent|spend|bought|buy|pay|paid|cost|expense|income)/i.test(promptLower)
      const numMatch = userPrompt.match(/(?:₱|php|\$)?\s*(\d+(?:\.\d{1,2})?)/i)

      if (isLogIntent && numMatch) {
        const amount = parseFloat(numMatch[1])
        if (!isNaN(amount) && amount > 0) {
          const type = /(?:income|earned|salary|deposit|received)/i.test(promptLower) ? 'income' : 'expense'
          
          // Extract merchant/description cleanly
          let merchant = userPrompt
            .replace(/(?:log|add|spent|spend|bought|buy|pay|paid|cost|expense|income|for|at|on|₱|php|\$|\d+(?:\.\d{1,2})?)/gi, '')
            .trim()
          if (!merchant || merchant.length < 2) {
            merchant = type === 'expense' ? 'Expense Item' : 'Income Deposit'
          }
          merchant = merchant.charAt(0).toUpperCase() + merchant.slice(1)

          let category = 'other'
          if (/(?:lunch|dinner|breakfast|food|coffee|jollibee|mcdonald|starbucks|eat|restaurant)/i.test(promptLower)) category = 'food'
          else if (/(?:groceries|grocery|supermarket|mart)/i.test(promptLower)) category = 'groceries'
          else if (/(?:gas|fuel|ride|grab|bus|transpo|taxi)/i.test(promptLower)) category = 'transportation'

          store.addTransaction({
            id: `txn_ai_${Date.now()}`,
            userId: uid,
            type,
            amount,
            currency: 'PHP',
            categoryId: category,
            merchant,
            paymentMethod: 'cash',
            walletId: defaultWallet.id,
            date: today,
            notes: `Auto-logged via Mochi AI NLP`,
            isFavorite: false,
            createdAt: now,
            updatedAt: now,
          })

          return `Action executed: Logged ${type} of ₱${amount.toLocaleString()} for ${merchant}.`
        }
      }
    }

    return undefined
  }

  const handleSend = async (queryText?: string) => {
    const textToSend = queryText || input
    if (!textToSend.trim() || isGenerating) return

    const userMsg: Message = {
      id: crypto.randomUUID(),
      sender: 'user',
      text: textToSend.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }

    setMessages((prev) => [...prev, userMsg])
    if (!queryText) setInput('')
    setIsGenerating(true)

    const mochiMsgId = crypto.randomUUID()
    setMessages((prev) => [
      ...prev,
      {
        id: mochiMsgId,
        sender: 'mochi',
        text: 'Processing response...',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ])

    try {
      if (!isModelReady) {
        await handleInitEngine()
      }

      const result = await askMochiAI(textToSend, getContextString(), (streamedText) => {
        setMessages((prev) =>
          prev.map((msg) => (msg.id === mochiMsgId ? { ...msg, text: streamedText } : msg))
        )
      })

      const notice = executeAction(result.action, textToSend)

      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === mochiMsgId
            ? { ...msg, text: result.text || 'Done.', actionSuccessNotice: notice }
            : msg
        )
      )
    } catch (err: any) {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === mochiMsgId
            ? { ...msg, text: `WebGPU Local AI Notice: ${err.message || 'Please check your device WebGPU support.'}` }
            : msg
        )
      )
    } finally {
      setIsGenerating(false)
    }
  }

  const suggestedPrompts = [
    'Log an expense of 180 for lunch at Jollibee',
    'Create a savings goal for Travel Fund 50000',
    'How is my total monthly spend looking?',
  ]

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
            className="fixed bottom-0 left-0 right-0 z-[60] bg-mochi-surface rounded-t-3xl border-t border-mochi-border shadow-2xl max-w-xl mx-auto flex flex-col h-[85vh]"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-mochi-border/60">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Mascot mood={isGenerating ? 'excited' : 'happy'} size="sm" />
                  <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-mochi-surface" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-mochi-text flex items-center gap-2">
                    Mochi AI Assistant
                    <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" /> 100% Free & Local
                    </span>
                  </h3>
                  <p className="text-[10px] text-mochi-text-muted font-bold flex items-center gap-1 mt-0.5">
                    <Cpu className="w-3 h-3 text-mochi-primary" /> Powered by Llama 3.2 3B WebGPU Engine
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={handleClearHistory}
                  title="Clear Chat History"
                  className="p-1.5 rounded-full hover:bg-rose-500/10 text-mochi-text-muted hover:text-rose-500 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>

                <button
                  onClick={onClose}
                  className="p-1.5 rounded-full hover:bg-mochi-surface-alt text-mochi-text-muted transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Model Init Progress Bar */}
            {isInitializing && (
              <div className="p-3 bg-mochi-primary/10 border-b border-mochi-primary/20 text-xs space-y-1.5">
                <div className="flex justify-between font-bold text-mochi-primary">
                  <span className="flex items-center gap-1">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Loading AI engine into browser cache...
                  </span>
                  <span>{progressPercent}%</span>
                </div>
                <div className="h-1.5 bg-mochi-border/50 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-mochi-primary transition-all duration-300 rounded-full"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
                <p className="text-[10px] text-mochi-text-muted line-clamp-1">{progressText}</p>
              </div>
            )}

            {!hasGPU && (
              <div className="p-3 bg-rose-500/10 border-b border-rose-500/20 text-rose-600 text-xs font-bold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>WebGPU is not enabled in this browser. Please enable WebGPU for local AI execution.</span>
              </div>
            )}

            {/* Chat Body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {msg.sender === 'mochi' && (
                    <Mascot mood={isGenerating ? 'excited' : 'happy'} size="sm" className="shrink-0 mt-1" />
                  )}

                  <div className="max-w-[85%] space-y-1">
                    <div
                      className={`rounded-2xl p-3.5 text-xs leading-relaxed font-medium shadow-xs ${
                        msg.sender === 'user'
                          ? 'bg-gradient-mochi text-white rounded-tr-none font-semibold'
                          : 'bg-mochi-surface-alt border border-mochi-border/60 text-mochi-text rounded-tl-none'
                      }`}
                    >
                      <p className="whitespace-pre-wrap">{msg.text}</p>
                      <span
                        className={`text-[9px] block mt-1 font-bold ${
                          msg.sender === 'user' ? 'text-white/70 text-right' : 'text-mochi-text-muted'
                        }`}
                      >
                        {msg.timestamp}
                      </span>
                    </div>

                    {/* Action Execution Success Notice Card */}
                    {msg.actionSuccessNotice && (
                      <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-[11px] font-bold flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                        <span>{msg.actionSuccessNotice}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              <div ref={chatEndRef} />
            </div>

            {/* Suggested Prompts */}
            {messages.length <= 2 && (
              <div className="px-4 py-2 border-t border-mochi-border/40 flex gap-2 overflow-x-auto scrollbar-hide">
                {suggestedPrompts.map((prompt) => (
                  <button
                    key={prompt}
                    onClick={() => handleSend(prompt)}
                    className="whitespace-nowrap px-3 py-1.5 rounded-full text-[11px] font-bold bg-mochi-surface-alt hover:bg-mochi-primary/10 text-mochi-text border border-mochi-border/60 transition-all shrink-0"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            )}

            {/* Input Bar */}
            <div className="p-3 border-t border-mochi-border/60 bg-mochi-surface">
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  handleSend()
                }}
                className="flex items-center gap-2"
              >
                <input
                  type="text"
                  placeholder={
                    isGenerating
                      ? 'Generating response...'
                      : 'Ask a question or log an action e.g. "Log 250 lunch"'
                  }
                  value={input}
                  disabled={isGenerating}
                  onChange={(e) => setInput(e.target.value)}
                  className="mochi-input text-xs font-semibold flex-1 py-2.5"
                />
                <button
                  type="submit"
                  disabled={!input.trim() || isGenerating}
                  className="mochi-btn-primary py-2.5 px-4 text-xs flex items-center gap-1.5 disabled:opacity-40"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
