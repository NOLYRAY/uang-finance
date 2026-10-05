import { useState, useEffect, useMemo, useCallback } from 'react';
import { Transaction, SavingsGoal, BudgetConfig, EmergencyFundConfig, CategoryBudgetMap, CategoryId } from '../types/finance';
import { INITIAL_TRANSACTIONS, INITIAL_SAVINGS_GOALS, DEFAULT_CATEGORY_BUDGETS } from '../constants/categories';

const STORAGE_KEYS = {
  TRANSACTIONS: 'uang_app_transactions_v1',
  GOALS: 'uang_app_goals_v1',
  BUDGET: 'uang_app_budget_v1',
  EMERGENCY: 'uang_app_emergency_v1',
};

const DEFAULT_BUDGET: BudgetConfig = {
  monthlyIncome: 0,
  needsRatio: 50,
  wantsRatio: 30,
  savingsRatio: 20,
  categoryBudgets: DEFAULT_CATEGORY_BUDGETS,
};

const DEFAULT_EMERGENCY: EmergencyFundConfig = {
  monthlyExpense: 0,
  status: 'single',
  customMonths: 6,
  currentSavings: 0,
};

export function useFinanceData() {
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Error loading transactions from localStorage', e);
    }
    return INITIAL_TRANSACTIONS;
  });

  const [goals, setGoals] = useState<SavingsGoal[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.GOALS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Error loading goals from localStorage', e);
    }
    return INITIAL_SAVINGS_GOALS;
  });

  const [budgetConfig, setBudgetConfig] = useState<BudgetConfig>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.BUDGET);
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          ...DEFAULT_BUDGET,
          ...parsed,
          categoryBudgets: { ...DEFAULT_CATEGORY_BUDGETS, ...(parsed.categoryBudgets || {}) },
        };
      }
    } catch (e) {
      console.error('Error loading budget config', e);
    }
    return DEFAULT_BUDGET;
  });

  const [emergencyConfig, setEmergencyConfig] = useState<EmergencyFundConfig>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.EMERGENCY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Error loading emergency fund config', e);
    }
    return DEFAULT_EMERGENCY;
  });

  // Save changes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
    } catch (e) {
      console.error('Failed to save transactions', e);
    }
  }, [transactions]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify(goals));
    } catch (e) {
      console.error('Failed to save goals', e);
    }
  }, [goals]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.BUDGET, JSON.stringify(budgetConfig));
    } catch (e) {
      console.error('Failed to save budget config', e);
    }
  }, [budgetConfig]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.EMERGENCY, JSON.stringify(emergencyConfig));
    } catch (e) {
      console.error('Failed to save emergency config', e);
    }
  }, [emergencyConfig]);

  // Transaction Actions
  const addTransaction = useCallback((tx: Omit<Transaction, 'id' | 'createdAt'>) => {
    const newTx: Transaction = {
      ...tx,
      id: 'tx-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
      createdAt: Date.now(),
    };
    setTransactions((prev) => [newTx, ...prev]);

    // If this transaction is linked to a goal
    if (newTx.savingsGoalId) {
      if (newTx.type === 'savings') {
        // Increment goal amount automatically
        setGoals((prev) =>
          prev.map((g) => (g.id === newTx.savingsGoalId ? { ...g, currentAmount: g.currentAmount + newTx.amount } : g))
        );
      } else if (newTx.type === 'expense') {
        // Decrement goal amount automatically when expense is paid from this savings target
        setGoals((prev) =>
          prev.map((g) => (g.id === newTx.savingsGoalId ? { ...g, currentAmount: Math.max(0, g.currentAmount - newTx.amount) } : g))
        );
      }
    }
    return newTx;
  }, []);

  const updateTransaction = useCallback((id: string, updated: Partial<Transaction>) => {
    setTransactions((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...updated } : t))
    );
  }, []);

  const deleteTransaction = useCallback((id: string) => {
    setTransactions((prev) => {
      const txToDelete = prev.find((t) => t.id === id);
      if (txToDelete && txToDelete.savingsGoalId) {
        if (txToDelete.type === 'savings') {
          // Revert deposit: reduce goal amount
          setGoals((gPrev) =>
            gPrev.map((g) => (g.id === txToDelete.savingsGoalId ? { ...g, currentAmount: Math.max(0, g.currentAmount - txToDelete.amount) } : g))
          );
        } else if (txToDelete.type === 'expense') {
          // Revert withdrawal: restore goal amount
          setGoals((gPrev) =>
            gPrev.map((g) => (g.id === txToDelete.savingsGoalId ? { ...g, currentAmount: g.currentAmount + txToDelete.amount } : g))
          );
        }
      }
      return prev.filter((t) => t.id !== id);
    });
  }, []);

  // Update specific category budget limit (e.g. makan, transportasi, jajan, keperluan, game)
  const updateCategoryBudget = useCallback((key: keyof CategoryBudgetMap, amount: number) => {
    setBudgetConfig((prev) => ({
      ...prev,
      categoryBudgets: {
        ...prev.categoryBudgets,
        [key]: amount,
      },
    }));
  }, []);

  // Goal Actions
  const addGoal = useCallback((goal: Omit<SavingsGoal, 'id' | 'createdAt'>) => {
    const newGoal: SavingsGoal = {
      ...goal,
      id: 'goal-' + Date.now(),
      createdAt: Date.now(),
    };
    setGoals((prev) => [...prev, newGoal]);
    return newGoal;
  }, []);

  const updateGoal = useCallback((id: string, updated: Partial<SavingsGoal>) => {
    setGoals((prev) =>
      prev.map((g) => (g.id === id ? { ...g, ...updated } : g))
    );
  }, []);

  const deleteGoal = useCallback((id: string) => {
    setGoals((prev) => prev.filter((g) => g.id !== id));
  }, []);

  const contributeToGoal = useCallback((goalId: string, amount: number, note?: string) => {
    const goal = goals.find((g) => g.id === goalId);
    if (!goal || amount <= 0) return;

    // Create a transaction record
    const newTx: Transaction = {
      id: 'tx-' + Date.now(),
      type: 'savings',
      amount,
      category: goal.category === 'emergency' ? 'dana_darurat' : 'tabungan_utama',
      description: note || `Setoran untuk target "${goal.title}"`,
      date: new Date().toISOString().split('T')[0],
      paymentMethod: 'bank_transfer',
      savingsGoalId: goalId,
      createdAt: Date.now(),
    };

    setTransactions((prev) => [newTx, ...prev]);
    setGoals((prev) =>
      prev.map((g) => (g.id === goalId ? { ...g, currentAmount: g.currentAmount + amount } : g))
    );
  }, [goals]);

  // Withdraw / spend money from a specific savings goal
  const withdrawFromGoal = useCallback((goalId: string, amount: number, note?: string, category: CategoryId = 'keperluan') => {
    const goal = goals.find((g) => g.id === goalId);
    if (!goal || amount <= 0) return;

    // Create an expense transaction linked to this goal
    const newTx: Transaction = {
      id: 'tx-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
      type: 'expense',
      amount,
      category,
      description: note || `Tarik dana dari target "${goal.title}"`,
      date: new Date().toISOString().split('T')[0],
      paymentMethod: 'bank_transfer',
      savingsGoalId: goalId,
      createdAt: Date.now(),
    };

    setTransactions((prev) => [newTx, ...prev]);
    setGoals((prev) =>
      prev.map((g) => (g.id === goalId ? { ...g, currentAmount: Math.max(0, g.currentAmount - amount) } : g))
    );
    return newTx;
  }, [goals]);

  // Aggregate Metrics & Category Breakdown
  const summary = useMemo(() => {
    let totalIncome = 0;
    let totalExpense = 0;
    let totalSavingsDeposit = 0;

    // Specific expense sums for: Makan, Transportasi, Jajan, Keperluan, Game
    const categoryExpenses: Record<string, number> = {
      makan: 0,
      transportasi: 0,
      jajan: 0,
      keperluan: 0,
      game: 0,
      lainnya: 0,
    };

    for (const t of transactions) {
      if (t.type === 'income') {
        totalIncome += t.amount;
      } else if (t.type === 'expense') {
        totalExpense += t.amount;
        if (categoryExpenses[t.category] !== undefined) {
          categoryExpenses[t.category] += t.amount;
        } else {
          categoryExpenses.lainnya = (categoryExpenses.lainnya || 0) + t.amount;
        }
      } else if (t.type === 'savings') {
        totalSavingsDeposit += t.amount;
      }
    }

    const netCashFlow = totalIncome - totalExpense;
    const totalGoalsSaved = goals.reduce((acc, g) => acc + g.currentAmount, 0);
    const totalGoalsTarget = goals.reduce((acc, g) => acc + g.targetAmount, 0);
    const savingsRate = totalIncome > 0 ? ((totalSavingsDeposit / totalIncome) * 100) : 0;

    return {
      totalIncome,
      totalExpense,
      totalSavingsDeposit,
      netCashFlow,
      totalGoalsSaved,
      totalGoalsTarget,
      savingsRate,
      categoryExpenses,
      transactionCount: transactions.length,
      goalsCount: goals.length,
    };
  }, [transactions, goals]);

  // Reset to default sample
  const resetToSample = useCallback(() => {
    setTransactions(INITIAL_TRANSACTIONS);
    setGoals(INITIAL_SAVINGS_GOALS);
    setBudgetConfig(DEFAULT_BUDGET);
    setEmergencyConfig(DEFAULT_EMERGENCY);
  }, []);

  // Clear data
  const clearAll = useCallback(() => {
    setTransactions([]);
    setGoals([]);
  }, []);

  // Export & Import
  const exportData = useCallback(() => {
    const data = {
      version: '2.0',
      exportedAt: new Date().toISOString(),
      transactions,
      goals,
      budgetConfig,
      emergencyConfig,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bukuartha-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [transactions, goals, budgetConfig, emergencyConfig]);

  const exportCSV = useCallback(() => {
    const headers = ['ID', 'Tipe', 'Tanggal', 'Kategori', 'Keterangan', 'Nominal', 'Metode Bayar'];
    const rows = transactions.map((t) => [
      t.id,
      t.type,
      t.date,
      t.category,
      `"${(t.description || '').replace(/"/g, '""')}"`,
      t.amount,
      t.paymentMethod,
    ]);
    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bukuartha-transaksi-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [transactions]);

  const importData = useCallback((jsonString: string) => {
    try {
      const parsed = JSON.parse(jsonString);
      if (Array.isArray(parsed.transactions)) {
        setTransactions(parsed.transactions);
      }
      if (Array.isArray(parsed.goals)) {
        setGoals(parsed.goals);
      }
      if (parsed.budgetConfig) {
        setBudgetConfig(parsed.budgetConfig);
      }
      if (parsed.emergencyConfig) {
        setEmergencyConfig(parsed.emergencyConfig);
      }
      return { success: true, message: 'Data berhasil diimpor.' };
    } catch (e) {
      return { success: false, message: 'Format file JSON tidak valid.' };
    }
  }, []);

  return {
    transactions,
    goals,
    budgetConfig,
    emergencyConfig,
    summary,
    setBudgetConfig,
    setEmergencyConfig,
    updateCategoryBudget,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    addGoal,
    updateGoal,
    deleteGoal,
    contributeToGoal,
    withdrawFromGoal,
    resetToSample,
    clearAll,
    exportData,
    exportCSV,
    importData,
  };
}
