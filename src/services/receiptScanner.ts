import { createWorker } from 'tesseract.js'
import { askMochiAI } from './localAI'

export interface LineItem {
  description: string
  amount: number
  quantity?: number
}

export interface ScannedReceiptResult {
  merchant: string
  amount: number
  subtotal?: number
  tax?: number
  date: string
  category: string
  lineItems: LineItem[]
  rawText: string
  confidence: number
  categoryConfidence?: number
  notes?: string
}

/**
 * Runs offline local OCR on a receipt image file or canvas data URL
 */
export async function performLocalOCR(
  imageSource: File | string,
  onProgress?: (progress: number, status: string) => void
): Promise<{ rawText: string; confidence: number }> {
  if (onProgress) onProgress(10, 'Initializing local OCR worker...')

  try {
    const worker = await createWorker('eng', 1, {
      logger: (m) => {
        if (m.status === 'recognizing text' && onProgress) {
          const pct = Math.round(m.progress * 75) + 20
          onProgress(pct, `Scanning receipt details... (${pct}%)`)
        }
      },
    })

    if (onProgress) onProgress(25, 'Analyzing image layout & optical character contrast...')
    const ret = await worker.recognize(imageSource)
    await worker.terminate()

    if (onProgress) onProgress(95, 'Extracting lines & table structure...')

    return {
      rawText: ret.data.text || '',
      confidence: Math.round(ret.data.confidence || 85),
    }
  } catch (err) {
    console.error('OCR Error:', err)
    return {
      rawText: '',
      confidence: 0,
    }
  }
}

/**
 * Enhanced regex & heuristic fallback parser for receipt details
 */
export function parseReceiptFallback(rawText: string): Partial<ScannedReceiptResult> {
  const lines = rawText.split('\n').map((l) => l.trim()).filter(Boolean)
  
  // 1. Merchant Extraction: Top non-numeric, non-date line with >2 chars
  const merchantCandidate = lines.find(
    (l) =>
      l.length > 2 &&
      !/^\d+$/.test(l) &&
      !/\d{2}\/\d{2}/.test(l) &&
      !/(total|amount|subtotal|receipt|welcome|tax|vat|tin)/i.test(l)
  )
  const merchant = merchantCandidate || (lines[0] ? lines[0].replace(/[^a-zA-Z0-9 &']/g, '') : 'Receipt Merchant')

  // 2. Amount Extraction
  let amount = 0
  let subtotal = 0
  let tax = 0

  // Regex patterns for total amount
  const totalMatches = rawText.match(/(?:total|amount due|grand total|net total|paid|cash|php|₱)\s*[:=]?\s*([₱\d,]+\.\d{2})/gi)
  if (totalMatches && totalMatches.length > 0) {
    const lastMatch = totalMatches[totalMatches.length - 1]
    const numStr = lastMatch.replace(/[^0-9.]/g, '')
    const parsed = parseFloat(numStr)
    if (!isNaN(parsed) && parsed > 0) {
      amount = parsed
    }
  }

  // Fallback: search for largest price value near bottom
  if (!amount) {
    const priceMatches = rawText.match(/(\d+[\.,]\d{2})/g)
    if (priceMatches) {
      const numbers = priceMatches
        .map((p) => parseFloat(p.replace(',', '.')))
        .filter((n) => !isNaN(n) && n < 1000000)
      if (numbers.length > 0) {
        amount = Math.max(...numbers)
      }
    }
  }

  // 3. Tax / VAT Extraction
  const vatMatch = rawText.match(/(?:vat|tax|12%)\s*[:=]?\s*([₱\d,]+\.\d{2})/i)
  if (vatMatch) {
    const parsedVat = parseFloat(vatMatch[1].replace(/[^0-9.]/g, ''))
    if (!isNaN(parsedVat)) tax = parsedVat
  }

  // 4. Line Items Extraction heuristics
  const lineItems: LineItem[] = []
  for (const line of lines) {
    const itemMatch = line.match(/^([A-Za-z0-9\s&\-\.]+?)\s+([₱\d,]+\.\d{2})$/)
    if (itemMatch) {
      const desc = itemMatch[1].trim()
      const itemAmt = parseFloat(itemMatch[2].replace(/[^0-9.]/g, ''))
      if (
        desc.length > 2 &&
        !isNaN(itemAmt) &&
        itemAmt > 0 &&
        itemAmt <= amount &&
        !/(total|subtotal|change|cash|vat|tax|balance)/i.test(desc)
      ) {
        lineItems.push({ description: desc, amount: itemAmt })
      }
    }
  }

  // 5. Date Extraction
  let date = new Date().toISOString().split('T')[0]
  const dateMatch = rawText.match(/(\d{4}[-/.]\d{2}[-/.]\d{2})|(\d{1,2}[-/.]\d{1,2}[-/.]\d{2,4})/)
  if (dateMatch) {
    try {
      const parsedDate = new Date(dateMatch[0])
      if (!isNaN(parsedDate.getTime()) && parsedDate <= new Date()) {
        date = parsedDate.toISOString().split('T')[0]
      }
    } catch (e) {
      // ignore
    }
  }

  // 6. Category Heuristics & Confidence
  let category = 'other'
  let categoryConfidence = 70
  const textLower = rawText.toLowerCase()

  if (textLower.includes('supermarket') || textLower.includes('grocery') || textLower.includes('mart') || textLower.includes('savemore') || textLower.includes('puregold') || textLower.includes('robinsons supermarket')) {
    category = 'groceries'
    categoryConfidence = 95
  } else if (
    textLower.includes('coffee') ||
    textLower.includes('cafe') ||
    textLower.includes('restaurant') ||
    textLower.includes('food') ||
    textLower.includes('kitchen') ||
    textLower.includes('jollibee') ||
    textLower.includes('mcdonald') ||
    textLower.includes('starbucks') ||
    textLower.includes('chowking') ||
    textLower.includes('mang inasal')
  ) {
    category = 'food'
    categoryConfidence = 95
  } else if (textLower.includes('gas') || textLower.includes('fuel') || textLower.includes('transport') || textLower.includes('shell') || textLower.includes('petron') || textLower.includes('caltex') || textLower.includes('grab')) {
    category = 'transportation'
    categoryConfidence = 90
  } else if (textLower.includes('pharmacy') || textLower.includes('drug') || textLower.includes('health') || textLower.includes('mercury') || textLower.includes('watsons')) {
    category = 'health'
    categoryConfidence = 90
  } else if (textLower.includes('mall') || textLower.includes('apparel') || textLower.includes('fashion') || textLower.includes('uniqlo') || textLower.includes('zara') || textLower.includes('store')) {
    category = 'shopping'
    categoryConfidence = 85
  } else if (textLower.includes('meralco') || textLower.includes('maynilad') || textLower.includes('pldt') || textLower.includes('globe') || textLower.includes('water') || textLower.includes('electric')) {
    category = 'utilities'
    categoryConfidence = 90
  }

  return {
    merchant,
    amount,
    subtotal: subtotal || (amount > tax ? Number((amount - tax).toFixed(2)) : amount),
    tax,
    date,
    category,
    lineItems,
    categoryConfidence,
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

  if (!rawText.trim()) {
    return {
      merchant: fallback.merchant || 'Manual Receipt',
      amount: fallback.amount || 0,
      subtotal: fallback.subtotal || 0,
      tax: fallback.tax || 0,
      date: fallback.date || new Date().toISOString().split('T')[0],
      category: fallback.category || 'other',
      lineItems: fallback.lineItems || [],
      rawText: '',
      confidence: 50,
      categoryConfidence: 50,
    }
  }

  try {
    if (onProgress) onProgress(96, 'Local AI classifying receipt breakdown...')

    const aiPrompt = `Analyze this raw receipt text extracted via OCR and extract structured JSON:
RECEIPT TEXT:
"""
${rawText.slice(0, 1500)}
"""

Reply with ONLY a valid JSON object formatted like this:
{
  "merchant": "Store Name",
  "amount": 250.00,
  "subtotal": 223.21,
  "tax": 26.79,
  "date": "YYYY-MM-DD",
  "category": "food",
  "lineItems": [{"description": "Item Name", "amount": 150.00}]
}
Allowed categories: food, groceries, shopping, transportation, utilities, health, entertainment, other.`

    const aiResult = await askMochiAI(aiPrompt, '')
    const jsonMatch = aiResult.text.match(/(\{[\s\S]*?\})/)
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[1])
      return {
        merchant: parsed.merchant || fallback.merchant || 'Merchant Store',
        amount: Number(parsed.amount) || fallback.amount || 0,
        subtotal: Number(parsed.subtotal) || fallback.subtotal || 0,
        tax: Number(parsed.tax) || fallback.tax || 0,
        date: parsed.date || fallback.date || new Date().toISOString().split('T')[0],
        category: parsed.category || fallback.category || 'other',
        lineItems: Array.isArray(parsed.lineItems) && parsed.lineItems.length > 0 ? parsed.lineItems : fallback.lineItems || [],
        rawText,
        confidence: 95,
        categoryConfidence: 90,
      }
    }
  } catch (e) {
    console.warn('Local AI receipt processing fallback notice:', e)
  }

  return {
    merchant: fallback.merchant || 'Store Merchant',
    amount: fallback.amount || 0,
    subtotal: fallback.subtotal || 0,
    tax: fallback.tax || 0,
    date: fallback.date || new Date().toISOString().split('T')[0],
    category: fallback.category || 'other',
    lineItems: fallback.lineItems || [],
    rawText,
    confidence: 85,
    categoryConfidence: fallback.categoryConfidence || 75,
  }
}
