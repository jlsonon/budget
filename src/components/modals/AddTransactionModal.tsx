import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X,
  CheckCircle2,
  AlertCircle,
  ArrowDownRight,
  ArrowUpRight,
  ChevronDown,
  Search,
  Star,
  ChevronRight,
  ShieldAlert,
  Sparkles,
} from 'lucide-react'
import { useAppStore } from '@/store/appStore'
import Dialog from '@/components/ui/Dialog'
import Mascot from '@/components/ui/Mascot'
import MochiCategoryVectorSVG from '@/components/ui/MochiCategoryVectorSVG'
import type { Transaction, TransactionType } from '@/types'

const expenseCategories = [
  { id: 'food', label: 'Food & Dining', iconId: 'utensils' },
  { id: 'shopping', label: 'Shopping', iconId: 'shopping_bag' },
  { id: 'housing', label: 'Housing & Rent', iconId: 'house' },
  { id: 'transport', label: 'Transportation', iconId: 'car' },
  { id: 'utilities', label: 'Bills & Utilities', iconId: 'electric' },
  { id: 'entertainment', label: 'Entertainment', iconId: 'gamepad' },
  { id: 'health', label: 'Healthcare', iconId: 'heart' },
  { id: 'education', label: 'Education', iconId: 'graduation' },
  { id: 'personal', label: 'Personal Care', iconId: 'sofa' },
  { id: 'travel', label: 'Travel & Trips', iconId: 'plane' },
  { id: 'other', label: 'Other', iconId: 'receipt' },
]

const incomeCategories = [
  { id: 'income', label: 'Salary & Wages', iconId: 'briefcase' },
  { id: 'freelance', label: 'Freelance', iconId: 'laptop' },
  { id: 'investment', label: 'Investments', iconId: 'piggy_bank' },
  { id: 'gift', label: 'Gifts', iconId: 'gift_bag' },
  { id: 'sales', label: 'Sales / Business', iconId: 'vault' },
  { id: 'other_income', label: 'Other Income', iconId: 'coins' },
]

// Preset Merchant Suggestions Database with official icons and default categories
const MERCHANT_DATABASE = [
  // 1. Food Delivery & Courier Services
  { name: 'GrabFood Order', vectorId: 'grab', defaultCategory: 'food', tags: ['grabfood', 'grab', 'food', 'delivery'] },
  { name: 'Foodpanda Order', vectorId: 'foodpanda', defaultCategory: 'food', tags: ['foodpanda', 'panda', 'delivery'] },
  { name: 'Move It Taxi / Delivery', vectorId: 'moveit', defaultCategory: 'transport', tags: ['move it', 'moveit', 'motorcycle', 'commute'] },
  { name: 'Lalamove Delivery', vectorId: 'lalamove', defaultCategory: 'transport', tags: ['lalamove', 'courier', 'delivery'] },
  { name: 'GrabExpress Booking', vectorId: 'grab', defaultCategory: 'transport', tags: ['grabexpress', 'express', 'delivery'] },
  { name: 'Angkas Motorcycle Taxi', vectorId: 'angkas', defaultCategory: 'transport', tags: ['angkas', 'commute', 'ride'] },
  { name: 'JoyRide Commute', vectorId: 'joyride', defaultCategory: 'transport', tags: ['joyride', 'motorcycle', 'ride'] },

  // 2. Malls, Supermarkets & Convenience Stores
  { name: 'SM Supermalls (SM North / Megamall)', vectorId: 'sm', defaultCategory: 'shopping', tags: ['sm', 'mall', 'sm megamall', 'sm north'] },
  { name: 'Ayala Malls Shopping', vectorId: 'ayala', defaultCategory: 'shopping', tags: ['ayala', 'mall', 'glorietta', 'greenbelt'] },
  { name: '7-Eleven Snacks & Drinks', vectorId: 'seven_eleven', defaultCategory: 'food', tags: ['7-eleven', '7eleven', 'store'] },
  { name: 'Ministop / Uncle John\'s', vectorId: 'uncle_johns', defaultCategory: 'food', tags: ['ministop', 'uncle johns', 'fried chicken'] },
  { name: 'Lawson Station', vectorId: 'lawson', defaultCategory: 'food', tags: ['lawson', 'bento', 'convenience'] },
  { name: 'FamilyMart Mart', vectorId: 'familymart', defaultCategory: 'food', tags: ['familymart', 'onigiri', 'store'] },
  { name: 'SM Supermarket / Savemore', vectorId: 'sm', defaultCategory: 'food', tags: ['sm supermarket', 'savemore', 'hypermarket', 'groceries'] },
  { name: 'Puregold Grocery', vectorId: 'puregold', defaultCategory: 'food', tags: ['puregold', 'supermarket', 'groceries'] },
  { name: 'Robinsons Supermarket', vectorId: 'robinsons', defaultCategory: 'food', tags: ['robinsons', 'groceries'] },
  { name: 'WalterMart Supermarket', vectorId: 'waltermart', defaultCategory: 'food', tags: ['waltermart', 'groceries'] },
  { name: 'Landers Superstore', vectorId: 'landers', defaultCategory: 'food', tags: ['landers', 'membership', 'groceries'] },
  { name: 'S&R Membership Shopping', vectorId: 'snr', defaultCategory: 'food', tags: ['s&r', 'snr', 'pizza', 'groceries'] },
  { name: 'GrabMart Express', vectorId: 'grab', defaultCategory: 'food', tags: ['grabmart', 'groceries'] },
  { name: 'Pandamart Express', vectorId: 'pandamart', defaultCategory: 'food', tags: ['pandamart', 'foodpanda', 'groceries'] },
  { name: 'Shopee Supermarket', vectorId: 'shopee', defaultCategory: 'shopping', tags: ['shopee', 'online'] },
  { name: 'Lazada LazMart', vectorId: 'lazada', defaultCategory: 'shopping', tags: ['lazada', 'lazmart'] },
  { name: 'MetroMart Online Grocery', vectorId: 'metromart', defaultCategory: 'food', tags: ['metromart', 'groceries'] },

  // 3. Pinoy Fast Food & Bakery Chains
  { name: 'Jollibee Chickenjoy', vectorId: 'jollibee', defaultCategory: 'food', tags: ['jollibee', 'yumburger', 'chickenjoy'] },
  { name: 'Chowking Laopao Meal', vectorId: 'chowking', defaultCategory: 'food', tags: ['chowking', 'chao fan', 'halo halo'] },
  { name: 'Mang Inasal Chicken Inasal', vectorId: 'mang_inasal', defaultCategory: 'food', tags: ['mang inasal', 'inasal', 'bbq'] },
  { name: 'Greenwich Pizza & Pasta', vectorId: 'greenwich', defaultCategory: 'food', tags: ['greenwich', 'pizza', 'pasta'] },
  { name: 'Red Ribbon Cake', vectorId: 'red_ribbon', defaultCategory: 'food', tags: ['red ribbon', 'cake', 'pastry'] },
  { name: 'Goldilocks Bakery', vectorId: 'goldilocks', defaultCategory: 'food', tags: ['goldilocks', 'cake', 'polvoron'] },
  { name: 'Binalot Fiesta Rice', vectorId: 'binalot', defaultCategory: 'food', tags: ['binalot', 'adobo', 'rice'] },

  // 4. Western Fast Food & Pizza Chains
  { name: 'McDonald\'s (McDo)', vectorId: 'mcdo', defaultCategory: 'food', tags: ['mcdo', 'mcdonald', 'fries', 'burger'] },
  { name: 'KFC Chicken Bucket', vectorId: 'kfc', defaultCategory: 'food', tags: ['kfc', 'zinger', 'chicken'] },
  { name: 'Burger King Flame-Grilled', vectorId: 'burger_king', defaultCategory: 'food', tags: ['burger king', 'whopper'] },
  { name: 'Wendy\'s Burger & Frosty', vectorId: 'wendys', defaultCategory: 'food', tags: ['wendys', 'frosty'] },
  { name: 'Popeyes Louisiana Chicken', vectorId: 'popeyes', defaultCategory: 'food', tags: ['popeyes', 'biscuits', 'chicken'] },
  { name: 'Subway Sandwich', vectorId: 'subway', defaultCategory: 'food', tags: ['subway', 'sub', 'sandwich'] },
  { name: 'Shakey\'s Pizza & Mojos', vectorId: 'shakeys', defaultCategory: 'food', tags: ['shakeys', 'pizza', 'mojos'] },
  { name: 'Pizza Hut Super Supreme', vectorId: 'pizza_hut', defaultCategory: 'food', tags: ['pizza hut', 'pizza'] },
  { name: 'Domino\'s Pizza', vectorId: 'dominos', defaultCategory: 'food', tags: ['dominos', 'pizza'] },

  // 5. Asian & Milk Tea / Coffee Chains
  { name: 'Tokyo Tokyo Bento', vectorId: 'tokyo_tokyo', defaultCategory: 'food', tags: ['tokyo tokyo', 'ramen', 'bento'] },
  { name: 'Marugame Udon & Tempura', vectorId: 'marugame', defaultCategory: 'food', tags: ['marugame', 'udon', 'tempura'] },
  { name: 'BonChon Korean Fried Chicken', vectorId: 'bonchon', defaultCategory: 'food', tags: ['bonchon', 'korean chicken'] },
  { name: 'Paotsin Dumpling Rice', vectorId: 'paotsin', defaultCategory: 'food', tags: ['paotsin', 'siomai', 'dumplings'] },
  { name: 'Master Siomai', vectorId: 'siomai', defaultCategory: 'food', tags: ['master siomai', 'siomai'] },
  { name: 'Hen Lin Dimsum', vectorId: 'paotsin', defaultCategory: 'food', tags: ['hen lin', 'siopao', 'dimsum'] },
  { name: 'CoCo Fresh Tea & Juice', vectorId: 'coco', defaultCategory: 'food', tags: ['coco', 'boba', 'milk tea'] },
  { name: 'Macao Imperial Tea', vectorId: 'macao', defaultCategory: 'food', tags: ['macao', 'milk tea', 'cheesecake'] },
  { name: 'Chatime Milk Tea', vectorId: 'chatime', defaultCategory: 'food', tags: ['chatime', 'boba', 'tea'] },
  { name: 'Starbucks Coffee', vectorId: 'starbucks', defaultCategory: 'food', tags: ['starbucks', 'coffee', 'frappe'] },
  { name: 'Dunkin\' Donuts & Coffee', vectorId: 'dunkin', defaultCategory: 'food', tags: ['dunkin', 'donuts', 'coffee'] },
  { name: 'Mister Donut Pon de Ring', vectorId: 'mister_donut', defaultCategory: 'food', tags: ['mister donut', 'donuts'] },

  // E-wallets, Utilities & Subscriptions
  { name: 'GCash Money Transfer', vectorId: 'gcash', defaultCategory: 'other', tags: ['gcash', 'e-wallet'] },
  { name: 'Maya E-Wallet Payment', vectorId: 'maya', defaultCategory: 'utilities', tags: ['maya', 'paymaya'] },
  { name: 'Meralco Electric Bill', vectorId: 'meralco', defaultCategory: 'utilities', tags: ['meralco', 'electricity'] },
  { name: 'Jeepney Commute Fare', vectorId: 'jeepney', defaultCategory: 'transport', tags: ['jeepney', 'commute'] },
  { name: 'Netflix Subscription', vectorId: 'netflix', defaultCategory: 'entertainment', tags: ['netflix', 'streaming'] },
  { name: 'Spotify Premium', vectorId: 'spotify', defaultCategory: 'entertainment', tags: ['spotify', 'music'] },
]

function getMerchantVectorId(merchant: string, type: TransactionType, currentCatIcon?: string): string {
  const m = (merchant || '').toLowerCase()
  if (m.includes('gcash')) return 'gcash'
  if (m.includes('maya')) return 'maya'
  if (m.includes('foodpanda') || m.includes('pandamart')) return 'foodpanda'
  if (m.includes('lalamove')) return 'lalamove'
  if (m.includes('angkas') || m.includes('joyride') || m.includes('move it') || m.includes('moveit')) return 'angkas'
  if (m.includes('sm') || m.includes('savemore') || m.includes('hypermarket')) return 'sm'
  if (m.includes('ayala')) return 'ayala'
  if (m.includes('jollibee') || m.includes('chickenjoy')) return 'jollibee'
  if (m.includes('chowking')) return 'chowking'
  if (m.includes('inasal')) return 'mang_inasal'
  if (m.includes('greenwich')) return 'greenwich'
  if (m.includes('red ribbon') || m.includes('redribbon')) return 'red_ribbon'
  if (m.includes('goldilocks')) return 'goldilocks'
  if (m.includes('binalot')) return 'binalot'
  if (m.includes('7-eleven') || m.includes('7eleven')) return 'seven_eleven'
  if (m.includes('uncle john') || m.includes('ministop')) return 'uncle_johns'
  if (m.includes('lawson')) return 'lawson'
  if (m.includes('familymart') || m.includes('family mart')) return 'familymart'
  if (m.includes('puregold')) return 'puregold'
  if (m.includes('robinsons')) return 'robinsons'
  if (m.includes('waltermart') || m.includes('walter mart')) return 'waltermart'
  if (m.includes('landers')) return 'landers'
  if (m.includes('s&r') || m.includes('snr')) return 'snr'
  if (m.includes('metromart')) return 'metromart'
  if (m.includes('mcdo') || m.includes('mcdonald')) return 'mcdo'
  if (m.includes('kfc')) return 'kfc'
  if (m.includes('burger king') || m.includes('burgerking')) return 'burger_king'
  if (m.includes('wendy')) return 'wendys'
  if (m.includes('popeye')) return 'popeyes'
  if (m.includes('subway')) return 'subway'
  if (m.includes('shakey')) return 'shakeys'
  if (m.includes('pizza hut') || m.includes('pizzahut')) return 'pizza_hut'
  if (m.includes('domino')) return 'dominos'
  if (m.includes('tokyo')) return 'tokyo_tokyo'
  if (m.includes('marugame')) return 'marugame'
  if (m.includes('bonchon')) return 'bonchon'
  if (m.includes('paotsin') || m.includes('siomai') || m.includes('hen lin')) return 'paotsin'
  if (m.includes('coco')) return 'coco'
  if (m.includes('macao')) return 'macao'
  if (m.includes('chatime')) return 'chatime'
  if (m.includes('starbucks')) return 'starbucks'
  if (m.includes('dunkin')) return 'dunkin'
  if (m.includes('mister donut') || m.includes('misterdonut')) return 'mister_donut'
  if (m.includes('meralco') || m.includes('electric')) return 'meralco'
  if (m.includes('grab')) return 'grab'
  if (m.includes('shopee')) return 'shopee'
  if (m.includes('lazada')) return 'lazada'
  if (m.includes('jeepney') || m.includes('commute')) return 'jeepney'
  if (m.includes('bdo')) return 'bdo'
  if (m.includes('bpi')) return 'bpi'
  if (m.includes('netflix')) return 'netflix'
  if (m.includes('spotify')) return 'spotify'
  return currentCatIcon || (type === 'expense' ? 'receipt' : 'briefcase')
}

// Frequently used categories (pinned at top of picker)
const FREQUENT_IDS = ['food', 'transport', 'shopping', 'income', 'utilities']

interface CategoryPickerSheetProps {
  isOpen: boolean
  onClose: () => void
  categories: typeof expenseCategories
  selected: string
  onSelect: (id: string) => void
  type: TransactionType
}

function CategoryPickerSheet({ isOpen, onClose, categories, selected, onSelect, type }: CategoryPickerSheetProps) {
  const [search, setSearch] = useState('')

  const isExpense = type === 'expense'
  const accentClass = isExpense
    ? 'border-rose-500 bg-rose-500/10 text-rose-600 dark:text-rose-300'
    : 'border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-300'

  const frequent = categories.filter((c) => FREQUENT_IDS.includes(c.id))
  const filtered = search
    ? categories.filter((c) => c.label.toLowerCase().includes(search.toLowerCase()))
    : categories

  const handleSelect = (id: string) => {
    onSelect(id)
    onClose()
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
            className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm"
            onClick={onClose}
          />
          {/* Bottom Sheet */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-[70] bg-mochi-surface rounded-t-3xl border-t border-mochi-border shadow-2xl max-h-[70vh] flex flex-col"
          >
            {/* Handle bar */}
            <div className="flex justify-center pt-3 pb-1 shrink-0">
              <div className="w-10 h-1 rounded-full bg-mochi-border" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-5 pb-3 pt-1 shrink-0">
              <h3 className="text-base font-bold text-mochi-text">Pick a Category</h3>
              <button
                onClick={onClose}
                className="p-1.5 rounded-full hover:bg-mochi-surface-alt text-mochi-text-muted"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Search */}
            <div className="px-5 pb-3 shrink-0">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-mochi-text-muted" />
                <input
                  type="text"
                  placeholder="Search categories..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="mochi-input pl-9 text-xs w-full font-semibold"
                />
              </div>
            </div>

            {/* Scrollable list */}
            <div className="flex-1 overflow-y-auto px-5 pb-6 space-y-4">
              {/* Frequently used */}
              {!search && (
                <div>
                  <div className="flex items-center gap-1.5 mb-2">
                    <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                    <p className="text-[10px] font-bold text-mochi-text-muted uppercase tracking-wider">Frequently Used</p>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {frequent.map((cat) => (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => handleSelect(cat.id)}
                        className={`p-2.5 rounded-2xl border text-left flex flex-col items-center gap-1.5 transition-all ${
                          selected === cat.id
                            ? accentClass + ' font-extrabold shadow-xs scale-[1.02] border-2'
                            : 'border-mochi-border bg-mochi-surface hover:border-mochi-primary/40 text-mochi-text'
                        }`}
                      >
                        <MochiCategoryVectorSVG id={cat.iconId} size="sm" />
                        <span className="text-[10px] font-bold text-center leading-tight">{cat.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* All / filtered */}
              <div>
                {!search && (
                  <p className="text-[10px] font-bold text-mochi-text-muted uppercase tracking-wider mb-2">All Categories</p>
                )}
                <div className="space-y-1.5">
                  {filtered.map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => handleSelect(cat.id)}
                      className={`w-full p-3 rounded-2xl border text-left flex items-center gap-3 transition-all ${
                        selected === cat.id
                          ? accentClass + ' font-extrabold shadow-xs border-2'
                          : 'border-mochi-border bg-mochi-surface-alt hover:border-mochi-primary/40 text-mochi-text'
                      }`}
                    >
                      <MochiCategoryVectorSVG id={cat.iconId} size="sm" />
                      <span className="text-xs font-bold flex-1 text-left">{cat.label}</span>
                      {selected === cat.id && (
                        <CheckCircle2 className={`w-4 h-4 ${isExpense ? 'text-rose-500' : 'text-emerald-500'}`} />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

export function AddTransactionModal() {
  const { isAddModalOpen, setAddModalOpen, addTransaction, wallets } = useAppStore()

  const [type, setType] = useState<TransactionType>('expense')
  const [amount, setAmount] = useState('')
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState<string>('food')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [walletId, setWalletId] = useState<string>(wallets.find((w) => w.isDefault)?.id || wallets[0]?.id || '')
  const [isCategoryPickerOpen, setIsCategoryPickerOpen] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)

  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  const categories = type === 'expense' ? expenseCategories : incomeCategories
  const selectedCat = categories.find((c) => c.id === category) || categories[0]
  const selectedWallet = wallets.find((w) => w.id === walletId) || wallets[0]

  // Filter merchant suggestions based on user input
  const suggestions = useMemo(() => {
    if (!title.trim()) return []
    const q = title.toLowerCase()
    return MERCHANT_DATABASE.filter(
      (m) => m.name.toLowerCase().includes(q) || m.tags.some((t) => t.includes(q))
    ).slice(0, 5)
  }, [title])

  const liveVectorId = getMerchantVectorId(title, type, selectedCat.iconId)

  const handleSelectSuggestion = (merchant: (typeof MERCHANT_DATABASE)[0]) => {
    setTitle(merchant.name)
    if (merchant.defaultCategory) {
      setCategory(merchant.defaultCategory)
    }
    setShowSuggestions(false)
  }

  const handleTypeChange = (newType: TransactionType) => {
    setType(newType)
    setCategory(newType === 'expense' ? 'food' : 'income')
    setStatus('idle')
    setErrorMessage('')
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('idle')

    const parsedAmount = parseFloat(amount)
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setStatus('error')
      setErrorMessage('Please enter a valid amount greater than 0.')
      return
    }

    if (!title.trim()) {
      setStatus('error')
      setErrorMessage('Please enter a description for this transaction.')
      return
    }

    // Insufficient balance check for expenses
    if (type === 'expense' && selectedWallet && parsedAmount > selectedWallet.balance) {
      setStatus('error')
      setErrorMessage(
        `Insufficient balance in ${selectedWallet.name}! Available balance is ₱${selectedWallet.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}, but this expense is ₱${parsedAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}.`
      )
      return
    }

    const newTxn: Transaction = {
      id: `txn_${Date.now()}`,
      userId: '1',
      type,
      amount: parsedAmount,
      currency: 'PHP',
      categoryId: category,
      merchant: title.trim(),
      paymentMethod: 'gcash',
      walletId: walletId || selectedWallet?.id,
      date,
      isFavorite: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    addTransaction(newTxn)

    setStatus('success')

    setTimeout(() => {
      setStatus('idle')
      setAmount('')
      setTitle('')
      setAddModalOpen(false)
    }, 1200)
  }

  return (
    <>
      <CategoryPickerSheet
        isOpen={isCategoryPickerOpen}
        onClose={() => setIsCategoryPickerOpen(false)}
        categories={categories}
        selected={category}
        onSelect={setCategory}
        type={type}
      />

      <Dialog isOpen={isAddModalOpen} onClose={() => setAddModalOpen(false)} size="md">
        <div className="space-y-4">
          {/* Modal Header */}
          <div className="flex items-center justify-between pb-3 border-b border-mochi-border">
            <div className="flex items-center gap-2.5">
              <Mascot size="sm" mood={type === 'income' ? 'happy' : 'neutral'} animate={false} />
              <div>
                <h3 className="text-lg font-bold text-mochi-text">
                  {type === 'expense' ? 'Record Expense' : 'Record Income'}
                </h3>
                <p className="text-xs text-mochi-text-secondary">
                  {type === 'expense' ? 'Deducts from wallet balance' : 'Adds to wallet balance'}
                </p>
              </div>
            </div>
            <button
              onClick={() => setAddModalOpen(false)}
              className="p-1.5 rounded-full hover:bg-mochi-surface-alt text-mochi-text-muted hover:text-mochi-text transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Type Tabs */}
          <div className="grid grid-cols-2 gap-2 p-1.5 bg-mochi-surface-alt rounded-2xl border border-mochi-border">
            <button
              type="button"
              onClick={() => handleTypeChange('expense')}
              className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-extrabold transition-all ${
                type === 'expense'
                  ? 'bg-rose-500 text-white shadow-md scale-[1.02]'
                  : 'text-mochi-text-secondary hover:text-mochi-text hover:bg-mochi-surface'
              }`}
            >
              <ArrowDownRight className="w-4 h-4" />
              Expense
            </button>
            <button
              type="button"
              onClick={() => handleTypeChange('income')}
              className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-extrabold transition-all ${
                type === 'income'
                  ? 'bg-emerald-500 text-white shadow-md scale-[1.02]'
                  : 'text-mochi-text-secondary hover:text-mochi-text hover:bg-mochi-surface'
              }`}
            >
              <ArrowUpRight className="w-4 h-4" />
              Income
            </button>
          </div>

          {/* Error Banner */}
          {status === 'error' && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-300 rounded-2xl text-xs font-semibold flex items-center gap-2"
            >
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </motion.div>
          )}

          {/* Success State */}
          {status === 'success' ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="py-8 text-center space-y-3 bg-mochi-surface rounded-2xl border border-mochi-primary/30 p-6"
            >
              <div className="w-14 h-14 bg-mochi-success/20 text-mochi-success rounded-full flex items-center justify-center mx-auto border border-mochi-success/40 animate-bounce">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h4 className="text-lg font-black text-mochi-text">
                {type === 'income' ? 'Income Added!' : 'Expense Recorded!'}
              </h4>
              <p className="text-xs text-mochi-text-secondary max-w-xs mx-auto">
                {selectedWallet?.name} balance has been updated.
              </p>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3">
              {/* Amount */}
              <div>
                <label className="block text-xs font-bold text-mochi-text-secondary mb-1">Amount (PHP) *</label>
                <div className="relative flex items-center">
                  <span className="absolute left-3 text-lg font-bold text-mochi-text-muted">₱</span>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="mochi-input pl-8 text-lg font-bold w-full"
                    autoFocus
                  />
                </div>
              </div>

              {/* Description / Merchant with Autocomplete & Live Icon Preview */}
              <div className="relative">
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-mochi-text-secondary">
                    Description / Merchant *
                  </label>
                  {title.trim() && (
                    <span className="text-[10px] font-extrabold text-mochi-primary flex items-center gap-1">
                      <Sparkles className="w-3 h-3" /> Auto Icon Detected
                    </span>
                  )}
                </div>

                <div className="relative flex items-center">
                  <input
                    type="text"
                    placeholder={type === 'expense' ? 'e.g. Jollibee, GCash, Grab, Meralco' : 'e.g. BDO Payroll, Freelance'}
                    value={title}
                    onFocus={() => setShowSuggestions(true)}
                    onChange={(e) => {
                      setTitle(e.target.value)
                      setShowSuggestions(true)
                    }}
                    className="mochi-input text-xs w-full font-semibold pr-11"
                  />

                  {/* Live Vector SVG Icon Preview inside Input */}
                  <div className="absolute right-2.5 pointer-events-none">
                    <MochiCategoryVectorSVG id={liveVectorId} size="sm" />
                  </div>
                </div>

                {/* Autocomplete Suggestions Dropdown */}
                <AnimatePresence>
                  {showSuggestions && suggestions.length > 0 && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setShowSuggestions(false)} />
                      <motion.div
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        className="absolute left-0 right-0 top-full mt-1.5 z-20 bg-mochi-surface border border-mochi-border rounded-2xl shadow-xl overflow-hidden divide-y divide-mochi-border/60"
                      >
                        {suggestions.map((m) => (
                          <button
                            key={m.name}
                            type="button"
                            onClick={() => handleSelectSuggestion(m)}
                            className="w-full flex items-center justify-between p-2.5 px-3.5 hover:bg-mochi-surface-alt transition-colors text-left group"
                          >
                            <div className="flex items-center gap-2.5">
                              <MochiCategoryVectorSVG id={m.vectorId} size="sm" />
                              <div>
                                <p className="text-xs font-extrabold text-mochi-text group-hover:text-mochi-primary transition-colors">
                                  {m.name}
                                </p>
                                <p className="text-[10px] text-mochi-text-muted capitalize">
                                  {m.defaultCategory}
                                </p>
                              </div>
                            </div>
                            <span className="text-[9px] font-extrabold text-mochi-primary bg-mochi-primary/10 px-2 py-0.5 rounded-full border border-mochi-primary/20">
                              Use Official Icon
                            </span>
                          </button>
                        ))}
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>

              {/* Category + Wallet — side by side */}
              <div className="grid grid-cols-2 gap-3">
                {/* Category Trigger */}
                <div>
                  <label className="block text-xs font-bold text-mochi-text-secondary mb-1">Category</label>
                  <button
                    type="button"
                    onClick={() => setIsCategoryPickerOpen(true)}
                    className="w-full mochi-input flex items-center gap-2 text-xs font-bold text-left hover:border-mochi-primary/60 transition-colors"
                  >
                    <MochiCategoryVectorSVG id={selectedCat.iconId} size="sm" />
                    <span className="flex-1 truncate text-mochi-text">{selectedCat.label}</span>
                    <ChevronDown className="w-3.5 h-3.5 text-mochi-text-muted shrink-0" />
                  </button>
                </div>

                {/* Wallet Selector */}
                <div>
                  <label className="block text-xs font-bold text-mochi-text-secondary mb-1">Wallet</label>
                  <div className="relative">
                    <select
                      value={walletId}
                      onChange={(e) => setWalletId(e.target.value)}
                      className={`mochi-input text-xs font-bold w-full appearance-none pr-7 cursor-pointer ${
                        type === 'expense' && selectedWallet && parseFloat(amount) > selectedWallet.balance
                          ? 'border-rose-500 bg-rose-500/5 text-rose-600'
                          : ''
                      }`}
                    >
                      {wallets.map((w) => (
                        <option key={w.id} value={w.id}>
                          {w.name}
                        </option>
                      ))}
                    </select>
                    <ChevronRight className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-mochi-text-muted pointer-events-none rotate-90" />
                  </div>
                  {selectedWallet && (
                    <div className="mt-1 pl-0.5">
                      {type === 'expense' && parseFloat(amount) > selectedWallet.balance ? (
                        <span className="text-[10px] font-extrabold text-rose-500 flex items-center gap-1">
                          <ShieldAlert className="w-3 h-3 shrink-0" /> Exceeds balance (₱{selectedWallet.balance.toLocaleString()})
                        </span>
                      ) : (
                        <span className="text-[10px] text-mochi-text-muted font-medium">
                          Available: ₱{selectedWallet.balance.toLocaleString()}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Date Input */}
              <div>
                <label className="block text-xs font-bold text-mochi-text-secondary mb-1">Date</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="mochi-input text-xs w-full font-bold cursor-pointer"
                />
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setAddModalOpen(false)}
                  className="mochi-btn-secondary text-xs flex-1 py-3"
                >
                  Cancel
                </button>
                <button type="submit" className="mochi-btn-primary text-xs flex-1 py-3 shadow-md">
                  {type === 'expense' ? 'Save Expense' : 'Save Income'}
                </button>
              </div>
            </form>
          )}
        </div>
      </Dialog>
    </>
  )
}

export default AddTransactionModal
