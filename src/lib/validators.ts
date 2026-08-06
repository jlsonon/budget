import { z } from 'zod';

export const TransactionSchema = z.object({
  id: z.string(),
  userId: z.string(),
  type: z.enum(['income', 'expense', 'transfer']),
  amount: z.number().positive(),
  currency: z.string().length(3),
  categoryId: z.string(),
  merchant: z.string(),
  paymentMethod: z.enum(['cash', 'credit_card', 'debit_card', 'bank_transfer', 'gcash', 'maya', 'other']),
  walletId: z.string().optional(),
  date: z.string().datetime({ offset: true }).or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)),
  time: z.string().optional(),
  notes: z.string().optional(),
  tags: z.array(z.string()).optional(),
  receiptUrl: z.string().url().optional(),
  location: z.object({ lat: z.number(), lng: z.number(), address: z.string().optional() }).optional(),
  recurring: z.object({
    frequency: z.enum(['daily', 'weekly', 'biweekly', 'monthly', 'quarterly', 'yearly', 'once']),
    endDate: z.string().optional(),
    nextDate: z.string().optional(),
  }).optional(),
  installment: z.object({
    totalAmount: z.number(),
    totalMonths: z.number(),
    currentMonth: z.number(),
    monthlyAmount: z.number(),
  }).optional(),
  isFavorite: z.boolean(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export const WalletSchema = z.object({
  id: z.string(),
  userId: z.string(),
  name: z.string().min(1),
  type: z.enum(['cash', 'digital_bank', 'traditional_bank', 'credit_card', 'savings', 'emergency', 'investment', 'paypal']),
  balance: z.number(),
  currency: z.string().length(3),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
  isDefault: z.boolean(),
  includeInTotal: z.boolean(),
  notes: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const BudgetSchema = z.object({
  id: z.string(),
  userId: z.string(),
  categoryId: z.string(),
  limit: z.number().positive(),
  period: z.enum(['weekly', 'monthly', 'custom']),
  startDate: z.string(),
  endDate: z.string().optional(),
  recurring: z.boolean(),
  notifications: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const SavingsGoalSchema = z.object({
  id: z.string(),
  userId: z.string(),
  name: z.string().min(1),
  targetAmount: z.number().positive(),
  currentAmount: z.number().min(0),
  currency: z.string().length(3),
  deadline: z.string().optional(),
  icon: z.string(),
  color: z.string(),
  milestones: z.array(z.object({
    id: z.string(),
    label: z.string(),
    targetAmount: z.number().positive(),
    achievedAt: z.string().optional(),
  })),
  notes: z.string().optional(),
  contributions: z.array(z.object({
    id: z.string(),
    amount: z.number().positive(),
    date: z.string(),
    note: z.string().optional(),
  })),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const DebtSchema = z.object({
  id: z.string(),
  userId: z.string(),
  lender: z.string().min(1),
  type: z.enum(['borrowed', 'lent', 'credit_card', 'loan', 'mortgage', 'car_loan', 'personal', 'business']),
  originalBalance: z.number().positive(),
  currentBalance: z.number().min(0),
  interestRate: z.number().min(0),
  interestType: z.enum(['simple', 'compound']),
  dueDate: z.string(),
  minimumPayment: z.number().min(0),
  schedule: z.array(z.object({
    id: z.string(),
    dueDate: z.string(),
    amount: z.number(),
    paid: z.boolean(),
    paidAt: z.string().optional(),
  })),
  payments: z.array(z.object({
    id: z.string(),
    amount: z.number(),
    date: z.string(),
    method: z.enum(['cash', 'credit_card', 'debit_card', 'bank_transfer', 'gcash', 'maya', 'other']),
    notes: z.string().optional(),
  })),
  attachments: z.array(z.string()).optional(),
  notes: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const SubscriptionSchema = z.object({
  id: z.string(),
  userId: z.string(),
  name: z.string().min(1),
  amount: z.number().positive(),
  frequency: z.enum(['weekly', 'monthly', 'quarterly', 'biannual', 'annual']),
  nextBilling: z.string(),
  category: z.string(),
  status: z.enum(['active', 'paused', 'cancelled', 'trial']),
  walletId: z.string().optional(),
  autoProcess: z.boolean().optional(),
  usageRating: z.number().min(1).max(5).optional(),
  cancelReminderDays: z.number().min(0),
  notes: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const UserProfileSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  email: z.string().email(),
  avatar: z.string().url().optional(),
  currency: z.string().length(3),
  language: z.string(),
  theme: z.string(),
  pin: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export function validateOrThrow<T>(schema: z.ZodSchema<T>, data: unknown): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    throw new Error(`Validation Error: ${result.error.message}`);
  }
  return result.data;
}
