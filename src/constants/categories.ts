import { CategoryInfo, SavingsGoal, Transaction, CategoryBudgetMap } from '../types/finance';

export const CATEGORIES: Record<string, CategoryInfo> = {
  // Pengeluaran Spesifik Sesuai Permintaan Pengguna:
  makan: {
    id: 'makan',
    label: 'Biaya Makan',
    shortLabel: 'Makan',
    type: 'expense',
    color: '#f97316', // Vibrant Orange
    budgetGroup: 'needs',
  },
  transportasi: {
    id: 'transportasi',
    label: 'Transportasi',
    shortLabel: 'Transport',
    type: 'expense',
    color: '#38bdf8', // Neon Sky-400
    budgetGroup: 'needs',
  },
  jajan: {
    id: 'jajan',
    label: 'Jajan & Kopi',
    shortLabel: 'Jajan',
    type: 'expense',
    color: '#fb7185', // Rose/Pink-400
    budgetGroup: 'wants',
  },
  keperluan: {
    id: 'keperluan',
    label: 'Keperluan Rumah/Pribadi',
    shortLabel: 'Keperluan',
    type: 'expense',
    color: '#c084fc', // Purple-400
    budgetGroup: 'needs',
  },
  game: {
    id: 'game',
    label: 'Game & Top-up',
    shortLabel: 'Game',
    type: 'expense',
    color: '#34d399', // Emerald-400
    budgetGroup: 'wants',
  },
  lainnya: {
    id: 'lainnya',
    label: 'Pengeluaran Lainnya',
    shortLabel: 'Lainnya',
    type: 'expense',
    color: '#94a3b8', // Slate-400
    budgetGroup: 'wants',
  },

  // Pemasukan (Income)
  gaji: {
    id: 'gaji',
    label: 'Gaji Pokok / Upah',
    shortLabel: 'Gaji',
    type: 'income',
    color: '#10b981',
  },
  sampingan: {
    id: 'sampingan',
    label: 'Pekerjaan Sampingan',
    shortLabel: 'Sampingan',
    type: 'income',
    color: '#14b8a6',
  },
  uang_saku: {
    id: 'uang_saku',
    label: 'Uang Saku / Kiriman',
    shortLabel: 'Uang Saku',
    type: 'income',
    color: '#06b6d4',
  },
  pemasukan_lain: {
    id: 'pemasukan_lain',
    label: 'Pemasukan Lainnya',
    shortLabel: 'Lain-lain',
    type: 'income',
    color: '#2dd4bf',
  },

  // Tabungan (Savings)
  tabungan_utama: {
    id: 'tabungan_utama',
    label: 'Tabungan Rekening',
    shortLabel: 'Tabungan',
    type: 'savings',
    color: '#60a5fa',
    budgetGroup: 'savings',
  },
  dana_darurat: {
    id: 'dana_darurat',
    label: 'Setoran Dana Darurat',
    shortLabel: 'Dana Darurat',
    type: 'savings',
    color: '#3b82f6',
    budgetGroup: 'savings',
  },
  investasi: {
    id: 'investasi',
    label: 'Investasi / Reksadana',
    shortLabel: 'Investasi',
    type: 'savings',
    color: '#818cf8',
    budgetGroup: 'savings',
  },
  tabungan_game_gadget: {
    id: 'tabungan_game_gadget',
    label: 'Tabungan Gadget / PC Game',
    shortLabel: 'Tabungan PC',
    type: 'savings',
    color: '#38bdf8',
    budgetGroup: 'savings',
  },
};

export const DEFAULT_CATEGORY_BUDGETS: CategoryBudgetMap = {
  makan: 0,
  transportasi: 0,
  jajan: 0,
  keperluan: 0,
  game: 0,
  lainnya: 0,
};

export const PAYMENT_METHODS: { id: string; label: string }[] = [
  { id: 'qris', label: 'QRIS / E-Wallet (GoPay/Shopee)' },
  { id: 'bank_transfer', label: 'Transfer Bank (BCA/Mandiri/BRI)' },
  { id: 'cash', label: 'Uang Tunai (Cash)' },
  { id: 'kartu', label: 'Kartu Debit / Kredit' },
];

export const INITIAL_SAVINGS_GOALS: SavingsGoal[] = [];

export const INITIAL_TRANSACTIONS: Transaction[] = [];
