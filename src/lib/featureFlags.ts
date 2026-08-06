export const FEATURE_FLAGS = {
  // V1 Core Features
  V1_BASIC_EXPENSE_TRACKING: true,
  V1_BASIC_BUDGETS: true,
  V1_BASIC_REPORTS: true,

  // V2 Advanced Features
  AI_COACH: false,
  RECEIPT_SCANNER: false,
  CIRCLES: false, // Group saving/spending
  ACHIEVEMENTS: false,
  MISSIONS: false,
  DEBT_TRACKER: false,
  SAVINGS_GOALS: false,
} as const;

export type FeatureFlag = keyof typeof FEATURE_FLAGS;

export function isFeatureEnabled(flag: FeatureFlag): boolean {
  return FEATURE_FLAGS[flag];
}
