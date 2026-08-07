// Transaction types
export type TransactionType = 'income' | 'expense' | 'transfer'
export type PaymentMethod = 'cash' | 'credit_card' | 'debit_card' | 'bank_transfer' | 'gcash' | 'maya' | 'other'
export type RecurringFrequency = 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'quarterly' | 'yearly' | 'once'

export interface BaseDocument {
  schemaVersion?: number
  isDeleted?: boolean
  deletedAt?: string
}

export interface Transaction extends BaseDocument {
  id: string
  userId: string
  type: TransactionType
  amount: number
  currency: string
  categoryId: string
  merchant: string
  paymentMethod: PaymentMethod
  walletId?: string
  date: string // ISO date
  time?: string
  notes?: string
  tags?: string[]
  receiptUrl?: string
  location?: { lat: number; lng: number; address?: string }
  recurring?: {
    frequency: RecurringFrequency
    endDate?: string
    nextDate?: string
  }
  installment?: {
    totalAmount: number
    totalMonths: number
    currentMonth: number
    monthlyAmount: number
  }
  isFavorite: boolean
  createdAt: string
  updatedAt: string
}

// Budget types
export type BudgetPeriod = 'weekly' | 'monthly' | 'custom'
export interface Budget extends BaseDocument {
  id: string
  userId: string
  categoryId: string
  limit: number
  period: BudgetPeriod
  startDate: string
  endDate?: string
  recurring: boolean
  notifications: boolean
  createdAt: string
  updatedAt: string
}

// Savings/Goal types
export interface SavingsGoal extends BaseDocument {
  id: string
  userId: string
  name: string
  targetAmount: number
  currentAmount: number
  currency: string
  deadline?: string
  icon: string
  color: string
  milestones: Milestone[]
  notes?: string
  contributions: Contribution[]
  createdAt: string
  updatedAt: string
}

export interface Milestone {
  id: string
  label: string
  targetAmount: number
  achievedAt?: string
}

export interface Contribution {
  id: string
  amount: number
  date: string
  note?: string
}

// Debt types
export interface Debt extends BaseDocument {
  id: string
  userId: string
  lender: string
  type: 'borrowed' | 'lent' | 'credit_card' | 'loan' | 'mortgage' | 'car_loan' | 'personal' | 'business' | 'bnpl' | 'medical' | 'student_loan' | 'tax'
  originalBalance: number
  currentBalance: number
  interestRate: number
  interestType: 'simple' | 'compound'
  dueDate: string
  dueDayOfMonth?: number
  minimumPayment: number
  schedule: PaymentSchedule[]
  payments: DebtPayment[]
  attachments?: string[]
  notes?: string
  createdAt: string
  updatedAt: string
}

export interface PaymentSchedule {
  id: string
  dueDate: string
  amount: number
  paid: boolean
  paidAt?: string
}

export interface DebtPayment {
  id: string
  amount: number
  date: string
  method: PaymentMethod
  notes?: string
}

// Subscription types
export type SubscriptionFrequency = 'weekly' | 'monthly' | 'quarterly' | 'biannual' | 'annual'
export interface Subscription extends BaseDocument {
  id: string
  userId: string
  name: string
  amount: number
  frequency: SubscriptionFrequency
  nextBilling: string
  category: string
  status: 'active' | 'paused' | 'cancelled' | 'trial'
  walletId?: string
  autoProcess?: boolean
  usageRating?: number // 1-5
  cancelReminderDays: number
  notes?: string
  createdAt: string
  updatedAt: string
}

// Calendar Event types
export type CalendarEventType = 'income' | 'bill' | 'debt' | 'savings' | 'subscription' | 'goal' | 'birthday'

export interface CalendarEvent {
  id: string
  userId: string
  type: CalendarEventType
  title: string
  date: string
  amount?: number
  walletId?: string
  autoProcess?: boolean
  relatedId?: string
  color: string
}

// Financial Health
export interface FinancialHealthScore {
  userId: string
  score: number // 0-100
  savingsRate: number
  budgetAdherence: number
  debtRatio: number
  billConsistency: number
  emergencyFundProgress: number
  subscriptionBurden: number
  history: ScoreHistory[]
  updatedAt: string
}

export interface ScoreHistory {
  date: string
  score: number
}

// Achievement types
export interface Achievement {
  id: string
  name: string
  description: string
  icon: string
  category: string
  requirement: number
  progress: number
  unlocked: boolean
  unlockedAt?: string
}

// Mission types
export type MissionType = 'log_expense' | 'review_spending' | 'save_amount' | 'categorize_transaction' | 'check_bills' | 'review_subscriptions'
export type MissionStatus = 'available' | 'in_progress' | 'completed' | 'expired'

export interface DailyMission {
  id: string
  type: MissionType
  title: string
  description: string
  status: MissionStatus
  reward: string // badge name or xp
  completedAt?: string
  date: string
}

// Streak types
export interface Streak {
  userId: string
  type: 'daily_checkin' | 'expense_logging' | 'savings' | 'budget_review'
  current: number
  longest: number
  lastActiveDate: string
  graceDaysRemaining: number
}

// Notification types
export type NotificationType = 'bill_reminder' | 'debt_due' | 'credit_card' | 'savings_milestone' | 'budget_exceeded' | 'payday' | 'goal_completed' | 'achievement' | 'insight' | 'subscription_renewal'

export interface AppNotification {
  id: string
  userId: string
  type: NotificationType
  title: string
  message: string
  read: boolean
  date: string
  deepLink?: string
  actionLabel?: string
  relatedId?: string
  amount?: number
}

// User Profile
export interface UserProfile {
  id: string
  name: string
  email: string
  avatar?: string
  currency: string
  language: string
  theme: string
  pin?: string
  role?: 'user' | 'admin' | 'superadmin'
  subscriptionTier?: 'free' | 'pro'
  subscriptionStatus?: 'active' | 'free' | 'expired'
  paidAmount?: number
  paidAt?: string
  createdAt: string
  updatedAt: string
}

// Category
export interface Category {
  id: string
  name: string
  icon: string
  color: string
  type: 'income' | 'expense'
  budget?: number
}

// Insight
export interface DailyInsight {
  id: string
  date: string
  title: string
  content: string
  type: 'spending' | 'savings' | 'budget' | 'trend'
  actionable: boolean
  actionLabel?: string
  actionRoute?: string
}

// Mochi Circles Types
export type MascotAnimal = 'cat' | 'fox' | 'bear' | 'rabbit' | 'panda' | 'otter' | 'hamster' | 'red_panda' | 'capybara' | 'shiba' | 'penguin' | 'duck'
export type MascotOutfit = 'casual' | 'beach' | 'winter' | 'raincoat'

export type JourneyTheme = 'boracay' | 'bohol' | 'manila' | 'japan' | 'korea' | 'europe' | 'camping'

export interface CircleMember {
  id: string
  name: string
  avatarUrl?: string
  mascot: MascotAnimal
  outfit: MascotOutfit
  role: 'owner' | 'organizer' | 'member'
  totalContributed: number
  lastContributionAt?: string
}

export interface CircleContribution {
  id: string
  memberId: string
  memberName: string
  mascot: MascotAnimal
  amount: number
  date: string
  note?: string
  reactions?: { emoji: string; count: number; byMe?: boolean }[]
}

export interface WishlistItem {
  id: string
  title: string
  estimatedCost?: number
  completed: boolean
  assignedMemberId?: string
}

export interface CirclePollOption {
  id: string
  text: string
  votes: string[] // memberIds
}

export interface CirclePoll {
  id: string
  question: string
  options: CirclePollOption[]
  active: boolean
}

export interface CircleFile {
  id: string
  name: string
  category: 'itinerary' | 'ticket' | 'booking' | 'other'
  size: string
  url?: string
}

export interface CircleMilestone {
  percentage: number
  label: string
  unlocked: boolean
  rewardLabel: string
}

export interface MochiCircle extends BaseDocument {
  id: string
  userId?: string
  name: string
  description: string
  targetAmount: number
  currentAmount: number
  currency: string
  targetDate: string
  theme: JourneyTheme
  members: CircleMember[]
  contributions: CircleContribution[]
  wishlist: WishlistItem[]
  polls: CirclePoll[]
  files: CircleFile[]
  milestones: CircleMilestone[]
  status: 'active' | 'completed' | 'archived'
  completedAt?: string
  createdAt: string
  updatedAt: string
}

export interface TravelStamp {
  id: string
  circleId: string
  circleName: string
  theme: JourneyTheme
  completedDate: string
  totalSaved: number
  memberCount: number
  stampIcon: string
}

export interface CircleMemory {
  id: string
  circleId: string
  circleName: string
  theme: JourneyTheme
  completedDate: string
  totalSaved: number
  totalMembers: number
  highlights: string[]
}

// Timeline Milestone
export interface TimelineMilestone {
  id: string
  emoji: string
  title: string
  description: string
  achievedAt: string
  category: string
}

// Wallet types
export type WalletType = 'cash' | 'digital_bank' | 'traditional_bank' | 'credit_card' | 'savings' | 'emergency' | 'investment' | 'paypal'

export interface Wallet extends BaseDocument {
  id: string
  userId: string
  name: string
  type: WalletType
  balance: number
  currency: string
  color: string
  isDefault: boolean
  includeInTotal: boolean
  notes?: string
  createdAt: string
  updatedAt: string
}
