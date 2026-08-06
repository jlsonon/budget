import { CreateMLCEngine, MLCEngine, InitProgressReport } from '@mlc-ai/web-llm'

// Fast, reliable 1B WebGPU model (10x smaller download, instant load)
export const OPTIMAL_LOCAL_MODEL = 'Llama-3.2-1B-Instruct-q4f16_1-MLC'

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

// Fallback rule-based AI parser when offline, WebGPU unsupported, or model fetch fails
function fallbackRuleBasedAI(
  userQuery: string,
  financialSummaryText: string
): { text: string; action?: ParsedAIAction } {
  const query = userQuery.toLowerCase().trim()

  // Match expense logging
  const expenseMatch = query.match(/(?:spent|log|pay|paid|buy|bought|cost|expense)\s+(\d+(?:\.\d+)?)\s+(?:on|for)?\s*([a-z0-9\s]+)/i)
    || query.match(/(\d+(?:\.\d+)?)\s+(?:on|for)\s+([a-z0-9\s]+)/i)
  
  if (expenseMatch) {
    const amount = parseFloat(expenseMatch[1] || expenseMatch[2])
    const merchant = (expenseMatch[2] || expenseMatch[1] || 'Expense').trim()
    return {
      text: `Recorded expense of ₱${amount} for ${merchant}.`,
      action: {
        action: 'add_transaction',
        payload: { type: 'expense', amount, merchant, category: 'food' }
      }
    }
  }

  // Match income logging
  const incomeMatch = query.match(/(?:received|income|salary|earn|earned|got paid|deposit)\s+(\d+(?:\.\d+)?)/i)
  if (incomeMatch) {
    const amount = parseFloat(incomeMatch[1])
    return {
      text: `Recorded income of ₱${amount}.`,
      action: {
        action: 'add_transaction',
        payload: { type: 'income', amount, merchant: 'Income Deposit', category: 'salary' }
      }
    }
  }

  // Match savings goal
  const goalMatch = query.match(/(?:create|add|set|new)\s+(?:savings\s+)?goal\s+([a-z0-9\s]+)\s+(\d+)/i)
  if (goalMatch) {
    const name = goalMatch[1].trim()
    const targetAmount = parseFloat(goalMatch[2])
    return {
      text: `Created savings goal "${name}" with target ₱${targetAmount}.`,
      action: {
        action: 'add_savings_goal',
        payload: { name, targetAmount }
      }
    }
  }

  // General summary response
  return {
    text: `Here is your current financial summary:\n${financialSummaryText}\n\nYou can ask me to log expenses, create savings goals, or check your balance!`,
    action: { action: 'none' }
  }
}

export async function askMochiAI(
  userQuery: string,
  financialSummaryText: string,
  onStreamChunk?: (chunk: string) => void
): Promise<{ text: string; action?: ParsedAIAction }> {
  try {
    const engine = await getOrInitLocalAI()

    const systemPrompt = `You are Mochi, a practical and direct personal financial assistant for the Mochi Money app.
Your goal is to answer questions, analyze finances, and execute user commands cleanly.

CRITICAL FORMATTING CONSTRAINTS:
1. Do NOT use any emojis.
2. Do NOT use generic AI filler, hyperbole, or robotic introductory phrases (such as "Certainly!", "As an AI assistant", "Great question!").
3. Keep answers direct, professional, clear, and human-toned.

ACTION EXECUTION MANDATE:
When the user mentions spending money, receiving income, logging an expense, adding a goal, or deleting a subscription (e.g. "spent 250 on lunch", "log 500 coffee", "add goal iPhone 60000"), you MUST append an ACTION_JSON block at the bottom:

Examples:
ACTION_JSON: {"action": "add_transaction", "payload": {"type": "expense", "amount": 250, "merchant": "Lunch", "category": "food"}}
ACTION_JSON: {"action": "add_transaction", "payload": {"type": "income", "amount": 5000, "merchant": "Salary", "category": "salary"}}
ACTION_JSON: {"action": "add_savings_goal", "payload": {"name": "Emergency Fund", "targetAmount": 50000}}
ACTION_JSON: {"action": "delete_subscription", "payload": {"name": "Netflix"}}
ACTION_JSON: {"action": "transfer_funds", "payload": {"amount": 1000, "fromWallet": "Cash Wallet", "toWallet": "GCash"}}

USER CURRENT FINANCIAL CONTEXT:
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
