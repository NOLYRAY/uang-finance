import { BudgetConfig, MaritalStatus, Transaction } from '../types/finance';
import { CATEGORIES } from '../constants/categories';

export interface Budget503020Result {
  needsTarget: number;
  wantsTarget: number;
  savingsTarget: number;
  // Actuals based on current transactions
  needsActual: number;
  wantsActual: number;
  savingsActual: number;
  totalIncomeActual: number;
  totalExpenseActual: number;
  // Percentage of income actually spent
  needsPercentActual: number;
  wantsPercentActual: number;
  savingsPercentActual: number;
  remainingCash: number;
}

export function calculate503020(
  monthlyIncome: number,
  ratios: { needsRatio: number; wantsRatio: number; savingsRatio: number },
  transactions: Transaction[]
): Budget503020Result {
  const needsTarget = (monthlyIncome * (ratios.needsRatio || 50)) / 100;
  const wantsTarget = (monthlyIncome * (ratios.wantsRatio || 30)) / 100;
  const savingsTarget = (monthlyIncome * (ratios.savingsRatio || 20)) / 100;

  let needsActual = 0;
  let wantsActual = 0;
  let savingsActual = 0;
  let totalIncomeActual = 0;
  let totalExpenseActual = 0;

  for (const t of transactions) {
    if (t.type === 'income') {
      totalIncomeActual += t.amount;
    } else if (t.type === 'expense') {
      totalExpenseActual += t.amount;
      const cat = CATEGORIES[t.category];
      if (cat?.budgetGroup === 'needs') {
        needsActual += t.amount;
      } else {
        wantsActual += t.amount;
      }
    } else if (t.type === 'savings') {
      savingsActual += t.amount;
    }
  }

  const baseIncome = monthlyIncome > 0 ? monthlyIncome : (totalIncomeActual || 1);
  const needsPercentActual = (needsActual / baseIncome) * 100;
  const wantsPercentActual = (wantsActual / baseIncome) * 100;
  const savingsPercentActual = (savingsActual / baseIncome) * 100;
  const remainingCash = baseIncome - (totalExpenseActual + savingsActual);

  return {
    needsTarget,
    wantsTarget,
    savingsTarget,
    needsActual,
    wantsActual,
    savingsActual,
    totalIncomeActual,
    totalExpenseActual,
    needsPercentActual,
    wantsPercentActual,
    savingsPercentActual,
    remainingCash,
  };
}

/**
 * Calculates target emergency fund based on marital/family status and expenses.
 */
export function calculateEmergencyFundTarget(monthlyExpense: number, status: MaritalStatus, customMonths?: number) {
  let recommendedMonths = 6;
  let description = 'Rekomendasi umum untuk perlindungan standar.';

  if (customMonths && customMonths > 0) {
    recommendedMonths = customMonths;
    description = `Target kustom ${customMonths} bulan pengeluaran.`;
  } else {
    switch (status) {
      case 'single':
        recommendedMonths = 4;
        description = 'Lajang / Tanpa Tanggungan (Ideal 3 - 6x pengeluaran bulanan)';
        break;
      case 'married_no_kids':
        recommendedMonths = 6;
        description = 'Menikah Tanpa Anak (Ideal 6x pengeluaran bulanan keluarga)';
        break;
      case 'married_with_kids':
        recommendedMonths = 9;
        description = 'Menikah dengan Anak / Tanggungan (Ideal 9 - 12x pengeluaran)';
        break;
      case 'freelancer':
        recommendedMonths = 12;
        description = 'Pekerja Lepas / Pengusaha dengan Pendapatan Fluktuatif (12x pengeluaran)';
        break;
    }
  }

  const targetAmount = monthlyExpense * recommendedMonths;
  return {
    recommendedMonths,
    targetAmount,
    description,
  };
}

/**
 * Calculates compound interest or savings growth projection over time
 */
export function calculateSavingsProjection(
  initialAmount: number,
  monthlyDeposit: number,
  months: number,
  annualInterestRatePercent: number = 5 // default 5% p.a.
) {
  const monthlyRate = (annualInterestRatePercent / 100) / 12;
  const dataPoints: { month: number; totalSaved: number; totalWithInterest: number; interestEarned: number }[] = [];

  let balanceWithInterest = initialAmount;
  let totalDepositsOnly = initialAmount;

  for (let m = 1; m <= months; m++) {
    totalDepositsOnly += monthlyDeposit;
    // apply interest then add deposit
    balanceWithInterest = (balanceWithInterest * (1 + monthlyRate)) + monthlyDeposit;
    
    if (m % 2 === 0 || m === months || m === 1) {
      dataPoints.push({
        month: m,
        totalSaved: Math.round(totalDepositsOnly),
        totalWithInterest: Math.round(balanceWithInterest),
        interestEarned: Math.round(balanceWithInterest - totalDepositsOnly),
      });
    }
  }

  return {
    finalTotalSaved: totalDepositsOnly,
    finalTotalWithInterest: Math.round(balanceWithInterest),
    finalInterestEarned: Math.max(0, Math.round(balanceWithInterest - totalDepositsOnly)),
    dataPoints,
  };
}

/**
 * Estimates months needed to reach a savings target
 */
export function estimateMonthsToGoal(
  targetAmount: number,
  currentAmount: number,
  monthlyDeposit: number,
  annualRate = 0
): { months: number; isAchievable: boolean } {
  const deficit = targetAmount - currentAmount;
  if (deficit <= 0) return { months: 0, isAchievable: true };
  if (monthlyDeposit <= 0) return { months: Infinity, isAchievable: false };

  if (annualRate <= 0) {
    const months = Math.ceil(deficit / monthlyDeposit);
    return { months, isAchievable: true };
  }

  const r = (annualRate / 100) / 12;
  // Formula: target = current*(1+r)^n + PMT * [((1+r)^n - 1) / r]
  // Simplified approximation loop up to 600 months (50 years)
  let balance = currentAmount;
  let months = 0;
  while (balance < targetAmount && months < 600) {
    balance = (balance * (1 + r)) + monthlyDeposit;
    months++;
  }

  return { months, isAchievable: months < 600 };
}
