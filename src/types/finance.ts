export type TransactionType = 'expense' | 'income' | 'savings';

// Exact expense categories requested by user:
// Makan, Transportasi, Jajan, Keperluan, Game (+ opsi lainnya jika diperlukan)
export type ExpenseCategory = 
  | 'makan'
  | 'transportasi'
  | 'jajan'
  | 'keperluan'
  | 'game'
  | 'lainnya';

export type IncomeCategory =
  | 'gaji'
  | 'sampingan'
  | 'uang_saku'
  | 'pemasukan_lain';

export type SavingsCategory =
  | 'tabungan_utama'
  | 'dana_darurat'
  | 'investasi'
  | 'tabungan_game_gadget';

export type CategoryId = ExpenseCategory | IncomeCategory | SavingsCategory;

export interface CategoryInfo {
  id: CategoryId;
  label: string;
  shortLabel: string;
  type: TransactionType;
  color: string;
  iconName?: string;
  budgetGroup?: 'needs' | 'wants' | 'savings';
}

export type PaymentMethod = 'cash' | 'e_wallet' | 'bank_transfer' | 'qris' | 'kartu';

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  category: CategoryId;
  description: string;
  date: string; // YYYY-MM-DD
  paymentMethod: PaymentMethod;
  savingsGoalId?: string; // Optional reference if this was a deposit into a goal
  createdAt: number;
}

export interface SavingsGoal {
  id: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  monthlyTarget: number;
  deadlineDate: string; // YYYY-MM-DD
  category: 'emergency' | 'house' | 'vehicle' | 'gadget' | 'travel' | 'game' | 'other';
  notes?: string;
  createdAt: number;
}

export interface CategoryBudgetMap {
  makan: number;
  transportasi: number;
  jajan: number;
  keperluan: number;
  game: number;
  lainnya?: number;
}

export interface BudgetConfig {
  monthlyIncome: number;
  needsRatio: number; // e.g. 50
  wantsRatio: number; // e.g. 30
  savingsRatio: number; // e.g. 20
  categoryBudgets: CategoryBudgetMap;
}

export type MaritalStatus = 'single' | 'married_no_kids' | 'married_with_kids' | 'freelancer';

export interface EmergencyFundConfig {
  monthlyExpense: number;
  status: MaritalStatus;
  customMonths?: number;
  currentSavings: number;
}
