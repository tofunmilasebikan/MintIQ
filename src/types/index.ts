export const CATEGORIES = [
  'Food',
  'Transportation',
  'Shopping',
  'Bills',
  'Entertainment',
  'Health',
  'Education',
  'Rent/Housing',
  'Travel',
  'Savings',
  'Debt',
  'Other',
] as const;

export type Category = (typeof CATEGORIES)[number];

export interface Expense {
  id: number;
  amount: number;
  category: Category;
  date: string;
  merchant: string | null;
  note: string | null;
  createdAt: string;
}

export type GoalType = 'savings' | 'reduce_spending' | 'debt';
export type GoalRecurrence = 'fixed' | 'monthly';
export type GoalStatus = 'active' | 'completed' | 'carried_over';

export interface Goal {
  id: number;
  name: string;
  targetAmount: number;
  currentAmount: number;
  goalType: GoalType;
  category: Category | null;
  month: string;
  status: GoalStatus;
  recurrence: GoalRecurrence;
  linkSavingsTransactions: boolean;
  createdAt: string;
}

export interface MintIQScoreBreakdown {
  total: number;
  goalProgress: number;
  spendingStability: number;
  savingsBehavior: number;
  trendDirection: number;
}

export interface DashboardStats {
  monthTotal: number;
  weekTotal: number;
  avgDaily: number;
  topCategory: Category | null;
  topCategoryAmount: number;
  projectedMonthly: number;
  score: MintIQScoreBreakdown;
}

export interface ParsedCSVRow {
  rowIndex: number;
  date: string | null;
  amount: number | null;
  merchant: string | null;
  category: Category | null;
  note: string | null;
  isValid: boolean;
  errors: string[];
  inferredCategory: boolean;
}

export interface ImportReviewItem extends ParsedCSVRow {
  id: string;
  isDuplicate: boolean;
  duplicateOfIndex?: number;
  action: 'keep' | 'skip';
}

export type ExpenseInput = Omit<Expense, 'id' | 'createdAt'>;
export type GoalInput = Omit<Goal, 'id' | 'createdAt'>;
