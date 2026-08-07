import { CreateMLCEngine, MLCEngine, InitProgressReport } from '@mlc-ai/web-llm'

// Ultra-fast, reliable 0.5B WebGPU model (~180MB download, instant load)
export const OPTIMAL_LOCAL_MODEL = 'Qwen2.5-0.5B-Instruct-q4f16_1-MLC'

let engineInstance: MLCEngine | null = null
let isPrewarming = false
let idleTimer: any = null

const IDLE_UNLOAD_MS = 3 * 60 * 1000 // 3 minutes

function resetIdleTimer() {
  if (idleTimer) clearTimeout(idleTimer)
  idleTimer = setTimeout(async () => {
    if (engineInstance) {
      try {
        await engineInstance.unload()
      } catch (e) {
        console.warn('VRAM idle auto-unload notice:', e)
      }
      engineInstance = null
    }
  }, IDLE_UNLOAD_MS)
}

export function checkWebGPUSupport(): boolean {
  return typeof navigator !== 'undefined' && 'gpu' in navigator
}

export function isLocalAILoaded(): boolean {
  return !!engineInstance
}

export async function getOrInitLocalAI(
  onProgress?: (report: InitProgressReport) => void
): Promise<MLCEngine> {
  resetIdleTimer()

  if (engineInstance) {
    return engineInstance
  }

  if (!checkWebGPUSupport()) {
    throw new Error('WebGPU is not enabled or supported on this device/browser.')
  }

  engineInstance = await CreateMLCEngine(OPTIMAL_LOCAL_MODEL, {
    initProgressCallback: (report) => {
      if (onProgress) {
        onProgress(report)
      }
    },
  })

  return engineInstance
}

export function backgroundPrewarmAI(): void {
  if (engineInstance || isPrewarming || !checkWebGPUSupport()) return

  isPrewarming = true
  const startPrewarm = async () => {
    try {
      await getOrInitLocalAI()
    } catch (e) {
      console.warn('Background AI prewarm notice:', e)
    } finally {
      isPrewarming = false
    }
  }

  if ('requestIdleCallback' in window) {
    window.requestIdleCallback(() => startPrewarm())
  } else {
    setTimeout(startPrewarm, 1500)
  }
}

export interface ParsedAIAction {
  action: 'add_transaction' | 'add_savings_goal' | 'delete_subscription' | 'transfer_funds' | 'none'
  payload?: any
}

// Enriched natural conversational AI parser for fallback / instant response
function fallbackRuleBasedAI(
  userQuery: string,
  financialSummaryText: string
): { text: string; action?: ParsedAIAction } {
  const query = userQuery.toLowerCase().trim()

  // 1. Match expense logging (e.g. "spent 250 on Starbucks coffee using GCash", "paid 1500 for electricity")
  const expenseMatch =
    query.match(/(?:spent|log|pay|paid|buy|bought|cost|expense)\s+(?:₱|php)?\s*(\d+(?:\.\d+)?)\s+(?:on|for)?\s*([a-z0-9\s]+?)(?:\s+(?:using|via|in|with)\s+([a-z0-9\s]+))?$/i) ||
    query.match(/(\d+(?:\.\d+)?)\s+(?:on|for)\s+([a-z0-9\s]+)/i)

  if (expenseMatch) {
    const rawNum = parseFloat(expenseMatch[1])
    const merchantStr = (expenseMatch[2] || 'Expense').trim()
    const walletHint = (expenseMatch[3] || '').trim()
    if (!isNaN(rawNum) && rawNum > 0) {
      return {
        text: `Recorded an expense of ₱${rawNum.toLocaleString()} for "${merchantStr}"${walletHint ? ` using ${walletHint}` : ''}. Your wallet balance and budget totals have been updated.`,
        action: {
          action: 'add_transaction',
          payload: { type: 'expense', amount: rawNum, merchant: merchantStr, category: 'food' },
        },
      }
    }
  }

  // 2. Match income logging (e.g. "received 35000 salary deposit", "got paid 20000 in BPI")
  const incomeMatch = query.match(/(?:received|income|salary|earn|earned|got paid|deposit)\s+(?:₱|php)?\s*(\d+(?:\.\d+)?)\s*(?:in|from|to)?\s*([a-z0-9\s]+)?/i)
  if (incomeMatch) {
    const rawNum = parseFloat(incomeMatch[1])
    const sourceStr = (incomeMatch[2] || 'Income Deposit').trim()
    if (!isNaN(rawNum) && rawNum > 0) {
      return {
        text: `Recorded income deposit of ₱${rawNum.toLocaleString()} (${sourceStr}). Your wallet balance has been updated.`,
        action: {
          action: 'add_transaction',
          payload: { type: 'income', amount: rawNum, merchant: sourceStr, category: 'salary' },
        },
      }
    }
  }

  // 3. Match savings goal creation (e.g. "add goal Japan 50000", "create savings goal Emergency 20000")
  const goalMatch = query.match(/(?:create|add|set|new)\s+(?:savings\s+)?goal\s+([a-z0-9\s]+)\s+(\d+)/i)
  if (goalMatch) {
    const name = goalMatch[1].trim()
    const targetAmount = parseFloat(goalMatch[2])
    if (name && !isNaN(targetAmount) && targetAmount > 0) {
      return {
        text: `Created new savings goal "${name}" with a target of ₱${targetAmount.toLocaleString()}.`,
        action: {
          action: 'add_savings_goal',
          payload: { name, targetAmount },
        },
      }
    }
  }

  // 4. Greetings
  if (/^(hi|hello|hey|greetings|good\s*(morning|afternoon|evening)|who\s*are\s*you)/i.test(query)) {
    return {
      text: `Hello. I am Mochi, your personal financial assistant. I run locally on your device to keep your financial data 100% private. How can I help you today?`,
      action: { action: 'none' },
    }
  }

  // 5. Balance & Assets queries
  if (/(?:balance|assets|total\s*money|wallets|how\s*much\s*money)/i.test(query)) {
    const assetMatch = financialSummaryText.match(/Total Assets:\s*(₱[\d,.]+)/i)
    const walletMatch = financialSummaryText.match(/Wallets:\s*([^\n]+)/i)
    const total = assetMatch ? assetMatch[1] : 'your accounts'
    const list = walletMatch ? walletMatch[1] : 'Cash Wallet'
    return {
      text: `Your current total balance is ${total} across ${list}.`,
      action: { action: 'none' },
    }
  }

  // 6. Expense & Spending queries
  if (/(?:spending|spent|expenses|monthly\s*spend|how\s*much\s*did\s*i\s*spend)/i.test(query)) {
    const expMatch = financialSummaryText.match(/Monthly Expenses Tracked:\s*(₱[\d,.]+)/i)
    const spentText = expMatch ? expMatch[1] : '₱0.00'
    return {
      text: `You have tracked ${spentText} in total expenses this month. Check out your Reports tab for a category breakdown!`,
      action: { action: 'none' },
    }
  }

  // 7. Income queries
  if (/(?:income|earned|salary|earnings)/i.test(query)) {
    const incMatch = financialSummaryText.match(/Monthly Income Tracked:\s*(₱[\d,.]+)/i)
    const incText = incMatch ? incMatch[1] : '₱0.00'
    return {
      text: `You have tracked ${incText} in monthly income deposits so far.`,
      action: { action: 'none' },
    }
  }

  // 8. Financial Advice & Tips
  if (/(?:advice|tip|tips|recommend|recommendation|how\s*to\s*save|budget\s*help)/i.test(query)) {
    return {
      text: `Here are 3 core financial tips tailored for your budget:\n1. Aim to save at least 20% of your net income each month.\n2. Review subscription renewals to catch any unused recurring services.\n3. Build a 3-month emergency buffer in your savings goals.`,
      action: { action: 'none' },
    }
  }

  // 9. Help & Commands
  if (/(?:help|command|commands|what\s*can\s*you\s*do|features)/i.test(query)) {
    return {
      text: `Here is what I can do for you:\n• Log expenses: e.g. "spent 250 on lunch at Jollibee"\n• Record income: e.g. "received 15000 salary"\n• Create savings goals: e.g. "create goal Travel 50000"\n• Answer inquiries about your balances, spending, and budgets.`,
      action: { action: 'none' },
    }
  }

  // 10. Summary / Overview queries
  if (/(?:summary|overview|status|report|financial\s*health)/i.test(query)) {
    return {
      text: `Here is your financial overview:\n\n${financialSummaryText}`,
      action: { action: 'none' },
    }
  }

  // 11. Default friendly response
  return {
    text: `I'm here to help manage your finances. You can ask me to log an expense (e.g. "spent 200 on coffee"), check your balance, or give you financial tips!`,
    action: { action: 'none' },
  }
}

export async function askMochiAI(
  userQuery: string,
  financialSummaryText: string,
  onStreamChunk?: (chunk: string) => void
): Promise<{ text: string; action?: ParsedAIAction }> {
  try {
    const engine = await getOrInitLocalAI()

    const systemPrompt = `You are Mochi, the world's most intelligent, razor-sharp personal CFO and AI financial advisor built inside Mochi Money.
Your purpose is to deliver brilliant financial insights, precise mathematical analysis, and instant command execution.

INTELLIGENCE & ANALYSIS PROTOCOL:
- When asked for financial advice or analysis, evaluate the user's exact Net Cash Surplus, Savings Rate, Debt Balance, and Active Budgets from their live context.
- Give concrete numerical recommendations (e.g. "Your net cash surplus is ₱8,685.00 this month with a 9.7% savings rate. To hit a 20% target savings rate, aim to trim non-essential spending by ₱900 over the next 14 days.").
- Keep responses direct, professional, hyper-practical, and clear.
- Do NOT use emojis.
- Do NOT use generic robotic filler phrases like "Certainly!", "As an AI assistant", or "Great question!".

ACTION EXECUTION MANDATE:
When the user mentions spending money, receiving income, logging an expense, setting a savings goal, or deleting a subscription (e.g. "spent 250 on lunch", "log 500 coffee", "add goal Emergency Fund 50000"), you MUST append an ACTION_JSON block at the bottom:

Examples:
ACTION_JSON: {"action": "add_transaction", "payload": {"type": "expense", "amount": 250, "merchant": "Starbucks Coffee", "category": "food"}}
ACTION_JSON: {"action": "add_transaction", "payload": {"type": "income", "amount": 25000, "merchant": "Salary Deposit", "category": "salary"}}
ACTION_JSON: {"action": "add_savings_goal", "payload": {"name": "Emergency Fund", "targetAmount": 50000}}
ACTION_JSON: {"action": "delete_subscription", "payload": {"name": "Netflix"}}
ACTION_JSON: {"action": "transfer_funds", "payload": {"amount": 1000, "fromWallet": "Cash Wallet", "toWallet": "GCash"}}

USER LIVE FINANCIAL CONTEXT:
${financialSummaryText}`

    const messages = [
      { role: 'system' as const, content: systemPrompt },
      { role: 'user' as const, content: userQuery },
    ]

    if (onStreamChunk) {
      const completion = await engine.chat.completions.create({
        messages,
        stream: true,
        temperature: 0.2,
      })

      let rawText = ''
      for await (const chunk of completion) {
        const delta = chunk.choices[0]?.delta?.content || ''
        rawText += delta
        
        const cleanDisplay = rawText
          .replace(/ACTION_JSON:[\s\S]*$/, '')
          .replace(/```json[\s\S]*?```/, '')
          .trim()
        onStreamChunk(cleanDisplay)
      }

      return processFinalText(rawText)
    } else {
      const response = await engine.chat.completions.create({
        messages,
        temperature: 0.2,
      })
      const rawText = response.choices[0]?.message?.content || 'Unable to process query.'
      return processFinalText(rawText)
    }
  } catch (err: any) {
    console.warn('WebGPU AI model fetch/initialization fallback:', err)
    const fallbackResult = fallbackRuleBasedAI(userQuery, financialSummaryText)
    if (onStreamChunk) {
      onStreamChunk(fallbackResult.text)
    }
    return fallbackResult
  }
}

function processFinalText(rawText: string): { text: string; action?: ParsedAIAction } {
  let action: ParsedAIAction | undefined = undefined

  // 1. Try explicit ACTION_JSON prefix match
  const matchExplicit = rawText.match(/ACTION_JSON:\s*(\{[\s\S]*?\})/s)
  if (matchExplicit && matchExplicit[1]) {
    try {
      action = JSON.parse(matchExplicit[1])
    } catch (e) {
      console.warn('Failed to parse explicit ACTION_JSON', e)
    }
  }

  // 2. Fallback regex to capture any JSON block with action key
  if (!action) {
    const matchGeneric = rawText.match(/(\{[\s\S]*?"action"\s*:\s*"[^"]+"[\s\S]*?\})/s)
    if (matchGeneric && matchGeneric[1]) {
      try {
        action = JSON.parse(matchGeneric[1])
      } catch (e) {
        console.warn('Failed to parse generic action JSON', e)
      }
    }
  }

  const cleanText = rawText
    .replace(/ACTION_JSON:[\s\S]*$/, '')
    .replace(/```json[\s\S]*?```/, '')
    .trim()

  return { text: cleanText, action }
}
