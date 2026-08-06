import { createWorker } from 'tesseract.js'
import { askMochiAI } from './localAI'

export interface ScannedReceiptResult {
  merchant: string
  amount: number
  date: string
  category: string
  lineItems: { description: string; amount: number }[]
  rawText: string
  confidence: number
}

/**
 * Runs offline local OCR on a receipt image file or canvas data URL
 */
export async function performLocalOCR(
  imageSource: File | string,
  onProgress?: (progress: number, status: string) => void
): Promise<{ rawText: string; confidence: number }> {
  if (onProgress) onProgress(10, 'Initializing local OCR worker...')

  const worker = await createWorker('eng', 1, {
    logger: (m) => {
      if (m.status === 'recognizing text' && onProgress) {
        const pct = Math.round(m.progress * 80) + 15
        onProgress(pct, `Scanning receipt text... (${pct}%)`)
      }
    },
  })

  if (onProgress) onProgress(20, 'Analyzing image layout...')
  const ret = await worker.recognize(imageSource)
  await worker.terminate()

  if (onProgress) onProgress(95, 'Extracting lines...')

  return {
    rawText: ret.data.text || '',
    confidence: Math.round(ret.data.confidence || 85),
  }
}

/**
 * Regex-based fallback parser for receipt details
 */
export function parseReceiptFallback(rawText: string): Partial<ScannedReceiptResult> {
  const lines = rawText.split('\n').map((l) => l.trim()).filter(Boolean)
  
  // Merchant is typically top non-empty line
  const merchant = lines.find((l) => l.length > 2 && !/\d{2}\/\d{2}/.test(l)) || 'Receipt Merchant'

  // Look for total amount patterns like TOTAL 250.00 or AMOUNT: PHP 1,200.50
  let amount = 0
  const amountMatches = rawText.match(/(?:total|amount|subtotal|due|cash|paid|php|₱)\s*[:=]?\s*([₱\d,]+\.\d{2})/gi)
  if (amountMatches && amountMatches.length > 0) {
    const lastMatch = amountMatches[amountMatches.length - 1]
    const numStr = lastMatch.replace(/[^0-9.]/g, '')
    const parsed = parseFloat(numStr)
    if (!isNaN(parsed) && parsed > 0) {
      amount = parsed
    }
  }

  // Look for date pattern MM/DD/YYYY or YYYY-MM-DD
  let date = new Date().toISOString().split('T')[0]
  const dateMatch = rawText.match(/(\d{4}[-/.]\d{2}[-/.]\d{2})|(\d{1,2}[-/.]\d{1,2}[-/.]\d{2,4})/)
  if (dateMatch) {
    try {
      const parsedDate = new Date(dateMatch[0])
      if (!isNaN(parsedDate.getTime())) {
        date = parsedDate.toISOString().split('T')[0]
      }
    } catch (e) {
      // ignore
    }
  }

  // Categorize based on keywords
  let category = 'other'
  const textLower = rawText.toLowerCase()
  if (textLower.includes('supermarket') || textLower.includes('grocery') || textLower.includes('mart')) {
    category = 'groceries'
  } else if (textLower.includes('coffee') || textLower.includes('cafe') || textLower.includes('restaurant') || textLower.includes('food') || textLower.includes('kitchen') || textLower.includes('jollibee') || textLower.includes('mcdonald')) {
    category = 'food'
  } else if (textLower.includes('gas') || textLower.includes('fuel') || textLower.includes('transport') || textLower.includes('shell') || textLower.includes('petron')) {
    category = 'transportation'
  } else if (textLower.includes('pharmacy') || textLower.includes('drug') || textLower.includes('health') || textLower.includes('mercury')) {
    category = 'health'
  } else if (textLower.includes('mall') || textLower.includes('apparel') || textLower.includes('fashion') || textLower.includes('store')) {
    category = 'shopping'
  }

  return {
    merchant,
    amount,
    date,
    category,
    lineItems: [],
  }
}

/**
 * Parses raw receipt text using Local AI or Fallback logic into a clean structured transaction
 */
export async function processReceiptTextWithAI(
  rawText: string,
  onProgress?: (progress: number, status: string) => void
): Promise<ScannedReceiptResult> {
  const fallback = parseReceiptFallback(rawText)

  try {
    if (onProgress) onProgress(96, 'Local AI classifying receipt categories...')

    const aiPrompt = `Analyze this raw receipt text extracted via OCR and extract structured JSON:
RECEIPT TEXT:
"""
${rawText.slice(0, 1500)}
"""

Reply with ONLY a JSON object formatted like this:
{
  "merchant": "Store Name",
  "amount": 250.00,
  "date": "YYYY-MM-DD",
  "category": "food",
  "lineItems": [{"description": "Item 1", "amount": 150}]
}
Allowed categories: food, groceries, shopping, transportation, utilities, health, entertainment, other.`

    const aiResult = await askMochiAI(aiPrompt, '')
    const jsonMatch = aiResult.text.match(/(\{[\s\S]*?\})/)
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[1])
      return {
        merchant: parsed.merchant || fallback.merchant || 'Merchant Store',
        amount: Number(parsed.amount) || fallback.amount || 0,
        date: parsed.date || fallback.date || new Date().toISOString().split('T')[0],
        category: parsed.category || fallback.category || 'other',
        lineItems: Array.isArray(parsed.lineItems) ? parsed.lineItems : [],
        rawText,
        confidence: 90,
      }
    }
  } catch (e) {
    console.warn('Local AI receipt processing fallback notice:', e)
  }

  return {
    merchant: fallback.merchant || 'Store Merchant',
    amount: fallback.amount || 0,
    date: fallback.date || new Date().toISOString().split('T')[0],
    category: fallback.category || 'other',
    lineItems: fallback.lineItems || [],
    rawText,
    confidence: 80,
  }
}
