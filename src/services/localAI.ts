import { CreateMLCEngine, MLCEngine, InitProgressReport } from '@mlc-ai/web-llm'

// Ultra-intelligent, top-tier WebGPU model
export const OPTIMAL_LOCAL_MODEL = 'Llama-3.2-3B-Instruct-q4f16_1-MLC'

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
  CreateMLCEngine(OPTIMAL_LOCAL_MODEL)
    .then((eng) => {
      engineInstance = eng
      resetIdleTimer()
    })
    .catch((err) => {
      console.warn('Background AI prewarm notice:', err)
    })
    .finally(() => {
      isPrewarming = false
    })
}

export interface ParsedAIAction {
  action: 'add_transaction' | 'add_savings_goal' | 'delete_subscription' | 'transfer_funds' | 'none'
  payload?: any
}

export function fallbackRuleBasedAI(
  userQuery: string,
  financialSummaryText: string
): { text: string; action?: ParsedAIAction } {
  const query = userQuery.toLowerCase()

  // 1. Transaction (Expense / Income) logging check
  const logTxnMatch = query.match(/(?:log|add|spent|spend|bought|buy|pay|paid|cost|expense|income|earned|salary|deposit|received)\s+(?:₱|php|\$)?\s*(\d+(?:\.\d{1,2})?)/i) ||
                      query.match(/(?:₱|php|\$)\s*(\d+(?:\.\d{1,2})?)\s+(?:for|at|on|spent|bought|paid)?/i)

  if (logTxnMatch) {
    const amt = parseFloat(logTxnMatch[1])
    const isIncome = /(?:income|earned|salary|deposit|received|bonus|cash\s*in)/i.test(query)
    const type = isIncome ? 'income' : 'expense'
    
    let rawMerchant = query
      .replace(/(?:log|add|spent|spend|bought|buy|pay|paid|cost|expense|income|earned|salary|deposit|received|for|at|on|using|via|with|payment\s+to|₱|php|\$|\d+(?:\.\d{1,2})?)/gi, '')
      .replace(/(?:gcash|maya|cash|bank|bdo|bpi|paypal|wallet)/gi, '')
      .replace(/[,;.]/g, '')
      .trim()

    let merchant = rawMerchant
    if (/llaamove|lalamove/i.test(query)) merchant = 'Lalamove'
    else if (/grab/i.test(query)) merchant = 'Grab'
    else if (/angkas/i.test(query)) merchant = 'Angkas'
    else if (!merchant || merchant.length < 2) {
      merchant = isIncome ? 'Income Deposit' : 'Expense Item'
    }
    merchant = merchant.charAt(0).toUpperCase() + merchant.slice(1)

    let category = 'other'
    if (/(?:lunch|dinner|breakfast|food|coffee|jollibee|mcdo|mcdonald|starbucks|restaurant|eat|samgyup)/i.test(query)) category = 'food'
    else if (/(?:groceries|grocery|supermarket|mart|savemore|puregold)/i.test(query)) category = 'groceries'
    else if (/(?:gas|fuel|ride|grab|angkas|moveit|jeepney|bus|transport|commute|llaamove|lalamove|courier|delivery)/i.test(query)) category = 'transportation'
    else if (/(?:shopee|lazada|mall|clothes|shopping|bought|store)/i.test(query)) category = 'shopping'
    else if (/(?:meralco|electric|water|internet|pldt|globe|bill|utility)/i.test(query)) category = 'utilities'
    else if (/(?:salary|freelance|paycheck|bonus)/i.test(query)) category = 'salary'

    let detectedWallet = 'cash'
    if (query.includes('gcash')) detectedWallet = 'gcash'
    else if (query.includes('maya')) detectedWallet = 'maya'
    else if (query.includes('bank') || query.includes('bdo') || query.includes('bpi')) detectedWallet = 'bank'

    return {
      text: `Logged ${type} of ₱${amt.toLocaleString('en-US', { minimumFractionDigits: 2 })} for ${merchant} (${category.toUpperCase()} • Wallet: ${detectedWallet.toUpperCase()}).`,
      action: {
        action: 'add_transaction',
        payload: {
          type,
          amount: amt,
          merchant,
          category,
          wallet: detectedWallet,
        },
      },
    }
  }

  // 2. Savings Goal / Deposit check
  const goalMatch = query.match(/(?:create|add|set|new|save|deposit)\s*(?:a)?\s*savings?\s*(?:goal|for|to)?\s*([a-zA-Z\s]+?)\s*(\d+)/i)
  if (goalMatch) {
    const goalName = goalMatch[1].trim()
    const targetAmt = parseFloat(goalMatch[2])
    return {
      text: `Created savings goal "${goalName}" with target ₱${targetAmt.toLocaleString()}.`,
      action: {
        action: 'add_savings_goal',
        payload: {
          name: goalName,
          targetAmount: targetAmt,
        },
      },
    }
  }

  // 3. Balance & Assets queries ("how much is my money")
  if (/(?:balance|assets|total\s*money|wallets|how\s*much\s*(?:is|do\s*i\s*have)?\s*my\s*money)/i.test(query)) {
    const assetMatch = financialSummaryText.match(/Total Assets:\s*(₱[\d,.]+)/i)
    const walletMatch = financialSummaryText.match(/Wallets:\s*([^\n]+)/i)
    const total = assetMatch ? assetMatch[1] : 'your accounts'
    const list = walletMatch ? walletMatch[1] : 'Cash Wallet'
    return {
      text: `Your current total balance is ${total} across your accounts (${list}).`,
      action: { action: 'none' },
    }
  }

  // 4. Expense & Spending queries
  if (/(?:spending|spent|expenses|monthly\s*spend|how\s*much\s*did\s*i\s*spend)/i.test(query)) {
    const expMatch = financialSummaryText.match(/Monthly Expenses Tracked:\s*(₱[\d,.]+)/i)
    const spentText = expMatch ? expMatch[1] : '₱0.00'
    return {
      text: `You have tracked ${spentText} in total expenses this month. Check out your Reports tab for category breakdowns.`,
      action: { action: 'none' },
    }
  }

  // 5. Income queries
  if (/(?:income|earned|salary|earnings)/i.test(query)) {
    const incMatch = financialSummaryText.match(/Monthly Income Tracked:\s*(₱[\d,.]+)/i)
    const incText = incMatch ? incMatch[1] : '₱0.00'
    return {
      text: `You have tracked ${incText} in monthly income deposits so far.`,
      action: { action: 'none' },
    }
  }

  // 6. Financial Advice & Tips
  if (/(?:advice|tip|tips|recommend|recommendation|how\s*to\s*save|budget\s*help)/i.test(query)) {
    return {
      text: `3 key financial recommendations:\n1. Save at least 20% of net income each month.\n2. Review subscription renewals to catch unused services.\n3. Keep a 3-month emergency buffer in your savings vault.`,
      action: { action: 'none' },
    }
  }

  // 7. Help & Commands
  if (/(?:help|command|commands|what\s*can\s*you\s*do|features)/i.test(query)) {
    return {
      text: `Here is what I can do:\n• Log expenses: e.g. "log 250 gcash payment to lalamove"\n• Record income: e.g. "received 15000 salary"\n• Create savings goals: e.g. "create goal Travel 50000"\n• Diagnostic answers for your total balances and spending.`,
      action: { action: 'none' },
    }
  }

  // 8. Default friendly response
  return {
    text: `I am your personal AI assistant. You can ask me to log an expense (e.g. "log 250 gcash payment to lalamove"), check your balance, or give you financial insights.`,
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

    const systemPrompt = `You are Mochi, the AI financial assistant for Mochi Money.

STRICT RESPONSE RULES:
1. Keep answers concise, clear, and direct (1 to 3 sentences maximum).
2. NEVER output math formula derivations, algebraic steps, or step-by-step arithmetic (do NOT write "Net Cash Surplus = Assets - Expenses" or "Expenses = X + Y").
3. Use exact numbers directly from the context.
4. Do NOT use emojis.
5. If the user asks to log an expense/income or set a goal, respond with 1 concise sentence and append ACTION_JSON at the end:
ACTION_JSON: {"action": "add_transaction", "payload": {"type": "expense", "amount": 250, "merchant": "Lalamove", "category": "transportation", "wallet": "GCash"}}

LIVE USER FINANCIAL DATA:
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
          .replace(/\{[\s\S]*?"action"\s*:\s*"[^"]+"[\s\S]*?\}/g, '')
          .trim()
        if (cleanDisplay) {
          onStreamChunk(cleanDisplay)
        }
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

function cleanAndParseJSON(jsonCandidate: string): any {
  try {
    return JSON.parse(jsonCandidate)
  } catch (e1) {
    try {
      const sanitized = jsonCandidate
        .replace(/,\s*([\}\]])/g, '$1')
        .replace(/[\u0000-\u001F]+/g, ' ')
      return JSON.parse(sanitized)
    } catch (e2) {
      return null
    }
  }
}

function processFinalText(rawText: string): { text: string; action?: ParsedAIAction } {
  let action: ParsedAIAction | undefined = undefined

  // 1. Try explicit ACTION_JSON prefix match
  const matchExplicit = rawText.match(/ACTION_JSON:\s*(\{[\s\S]*?\})/s)
  if (matchExplicit && matchExplicit[1]) {
    const parsed = cleanAndParseJSON(matchExplicit[1])
    if (parsed) action = parsed
  }

  // 2. Fallback regex to capture any JSON block with action key
  if (!action) {
    const matchGeneric = rawText.match(/(\{[\s\S]*?"action"\s*:\s*"[^"]+"[\s\S]*?\})/s)
    if (matchGeneric && matchGeneric[1]) {
      const parsed = cleanAndParseJSON(matchGeneric[1])
      if (parsed) action = parsed
    }
  }

  let cleanText = rawText
    .replace(/ACTION_JSON:[\s\S]*$/, '')
    .replace(/```json[\s\S]*?```/, '')
    .replace(/\{[\s\S]*?"action"\s*:\s*"[^"]+"[\s\S]*?\}/g, '')
    .trim()

  if (!cleanText || cleanText.startsWith('{')) {
    cleanText = 'Request processed successfully.'
  }

  return { text: cleanText, action }
}
