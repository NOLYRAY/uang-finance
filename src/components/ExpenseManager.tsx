import React, { useState, useMemo } from 'react';
import { Transaction, CategoryBudgetMap, TransactionType, CategoryId, PaymentMethod } from '../types/finance';
import { CATEGORIES, PAYMENT_METHODS } from '../constants/categories';
import { formatIDR, formatPercent, formatDateIndo, parseNumberInput } from '../utils/formatters';
import {
  Utensils,
  Car,
  Coffee,
  Package,
  Gamepad2,
  TrendingUp,
  AlertCircle,
  PlusCircle,
  Download,
  Search,
  Trash2,
  Sliders,
  Check,
  Plus,
  ArrowUpRight,
  Filter,
} from 'lucide-react';

interface ExpenseManagerProps {
  transactions: Transaction[];
  categoryBudgets: CategoryBudgetMap;
  onUpdateBudget: (category: keyof CategoryBudgetMap, newAmount: number) => void;
  onAddTransaction: (tx: {
    type: TransactionType;
    amount: number;
    category: CategoryId;
    description: string;
    date: string;
    paymentMethod: PaymentMethod;
  }) => void;
  onDeleteTransaction: (id: string) => void;
  onOpenAddModal: () => void;
  onExportCSV: () => void;
}

export const ExpenseManager: React.FC<ExpenseManagerProps> = ({
  transactions,
  categoryBudgets,
  onUpdateBudget,
  onAddTransaction,
  onDeleteTransaction,
  onOpenAddModal,
  onExportCSV,
}) => {
  const [selectedFilterCategory, setSelectedFilterCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [hoveredCat, setHoveredCat] = useState<string | null>(null);

  // Modal / Inline state for editing a category budget
  const [editingBudgetCat, setEditingBudgetCat] = useState<keyof CategoryBudgetMap | null>(null);
  const [editBudgetValue, setEditBudgetValue] = useState<string>('');

  // Quick Add Expense Local State
  const [quickCat, setQuickCat] = useState<CategoryId>('makan');
  const [quickAmount, setQuickAmount] = useState('');
  const [quickNote, setQuickNote] = useState('');
  const [quickMethod, setQuickMethod] = useState<PaymentMethod>('qris');
  const [quickSuccess, setQuickSuccess] = useState(false);

  // 5 target categories
  const targetCategories = ['makan', 'transportasi', 'jajan', 'keperluan', 'game', 'lainnya'] as const;

  // Calculate expenses per category
  const categoryExpenses: Record<string, number> = {
    makan: 0,
    transportasi: 0,
    jajan: 0,
    keperluan: 0,
    game: 0,
    lainnya: 0,
  };

  let totalExpense = 0;
  let totalIncome = 0;
  let totalSavings = 0;

  for (const t of transactions) {
    if (t.type === 'expense') {
      totalExpense += t.amount;
      if (categoryExpenses[t.category] !== undefined) {
        categoryExpenses[t.category] += t.amount;
      } else {
        categoryExpenses.lainnya += t.amount;
      }
    } else if (t.type === 'income') {
      totalIncome += t.amount;
    } else if (t.type === 'savings') {
      totalSavings += t.amount;
    }
  }

  // Calculate total budget limit for the 5 categories
  const totalBudgetLimit =
    (categoryBudgets.makan || 0) +
    (categoryBudgets.transportasi || 0) +
    (categoryBudgets.jajan || 0) +
    (categoryBudgets.keperluan || 0) +
    (categoryBudgets.game || 0);

  const totalRemainingBudget = totalBudgetLimit - totalExpense;
  const overallBudgetUsage = totalBudgetLimit > 0 ? (totalExpense / totalBudgetLimit) * 100 : 0;

  // Filtered expense transactions
  const expenseTransactions = useMemo(() => {
    return transactions.filter((t) => {
      if (t.type !== 'expense') return false;
      if (selectedFilterCategory !== 'all' && t.category !== selectedFilterCategory) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const descMatch = t.description?.toLowerCase().includes(q);
        const cat = CATEGORIES[t.category];
        const catMatch = cat?.label.toLowerCase().includes(q) || cat?.shortLabel?.toLowerCase().includes(q);
        return descMatch || catMatch;
      }
      return true;
    });
  }, [transactions, selectedFilterCategory, searchQuery]);

  const categoryData = targetCategories
    .filter((catKey) => catKey !== 'lainnya' || categoryExpenses.lainnya > 0)
    .map((catKey) => {
      const info = CATEGORIES[catKey] || { label: catKey, shortLabel: catKey, color: '#94a3b8' };
      const spent = categoryExpenses[catKey] || 0;
      const budget = categoryBudgets[catKey as keyof CategoryBudgetMap] || 0;
      const percentage = totalExpense > 0 ? (spent / totalExpense) * 100 : 0;
      const budgetUsagePercent = budget > 0 ? (spent / budget) * 100 : 0;
      const isOverBudget = budget > 0 && spent > budget;
      const txCount = transactions.filter((t) => t.type === 'expense' && t.category === catKey).length;

      return {
        key: catKey,
        label: info.label,
        shortLabel: info.shortLabel,
        color: info.color,
        spent,
        budget,
        percentage,
        budgetUsagePercent,
        isOverBudget,
        remainingBudget: budget - spent,
        txCount,
      };
    });

  // Top spending category
  const topCategory = useMemo(() => {
    return [...categoryData].sort((a, b) => b.spent - a.spent)[0];
  }, [categoryData]);

  // SVG Donut calculation
  const radius = 64;
  const circumference = 2 * Math.PI * radius;
  let cumulativeAngle = 0;

  const getCategoryIcon = (key: string) => {
    switch (key) {
      case 'makan':
        return <Utensils className="w-4 h-4 text-orange-400" />;
      case 'transportasi':
        return <Car className="w-4 h-4 text-sky-400" />;
      case 'jajan':
        return <Coffee className="w-4 h-4 text-rose-400" />;
      case 'keperluan':
        return <Package className="w-4 h-4 text-purple-400" />;
      case 'game':
        return <Gamepad2 className="w-4 h-4 text-emerald-400" />;
      default:
        return <TrendingUp className="w-4 h-4 text-slate-400" />;
    }
  };

  const activeHoverItem = hoveredCat ? categoryData.find((c) => c.key === hoveredCat) : null;

  const handleOpenEditBudget = (catKey: keyof CategoryBudgetMap, currentVal: number) => {
    setEditingBudgetCat(catKey);
    setEditBudgetValue(currentVal.toString());
  };

  const handleSaveBudget = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBudgetCat) return;
    const newNum = parseNumberInput(editBudgetValue);
    onUpdateBudget(editingBudgetCat, newNum);
    setEditingBudgetCat(null);
  };

  const handleQuickAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseNumberInput(quickAmount);
    if (amount <= 0) return;

    const catInfo = CATEGORIES[quickCat];

    onAddTransaction({
      type: 'expense',
      amount,
      category: quickCat,
      description: quickNote.trim() || catInfo?.label || 'Pengeluaran',
      date: new Date().toISOString().split('T')[0],
      paymentMethod: quickMethod,
    });

    setQuickAmount('');
    setQuickNote('');
    setQuickSuccess(true);
    setTimeout(() => setQuickSuccess(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 rounded-2xl p-5 sm:p-6 border border-slate-800 shadow-md">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-rose-400 mb-1">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
              <span className="uppercase tracking-wider">Pusat Manajemen Pengeluaran</span>
              <span aria-hidden="true" className="text-slate-600">·</span>
              <span className="text-slate-400">5 Pos Finansial Terpisah</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white">
              Kelola Pengeluaran: Makan, Transportasi, Jajan, Keperluan & Game
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-3xl">
              Ruang khusus terpisah untuk memantau alokasi, membatasi pos boros, menganalisis grafik pemakaian, dan mencatat pengeluaran harian.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={onExportCSV}
              className="px-3 sm:px-3.5 py-2 text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 hover:text-white border border-slate-700 rounded-xl transition-colors flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Ekspor CSV</span>
            </button>
            <button
              onClick={onOpenAddModal}
              className="px-3.5 sm:px-4 py-2 text-xs font-bold text-slate-950 bg-rose-400 hover:bg-rose-300 rounded-xl shadow-md shadow-rose-500/20 transition-all active:scale-95 flex items-center gap-1.5"
            >
              <PlusCircle className="w-4 h-4" />
              <span>+ Catat Pengeluaran</span>
            </button>
          </div>
        </div>

        {/* Top 4 Quick KPI Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-5 border-t border-slate-800/80">
          <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              Total Pengeluaran
            </span>
            <div className="text-base sm:text-xl font-bold font-mono text-rose-400 mt-1 tabular-nums">
              {formatIDR(totalExpense)}
            </div>
            <span className="text-[10px] text-slate-500 block mt-0.5">
              {transactions.filter((t) => t.type === 'expense').length} transaksi tercatat
            </span>
          </div>

          <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              Plafon Batas Anggaran
            </span>
            <div className="text-base sm:text-xl font-bold font-mono text-white mt-1 tabular-nums">
              {formatIDR(totalBudgetLimit)}
            </div>
            <span className="text-[10px] text-slate-500 block mt-0.5">
              Akumulasi 5 pos per bulan
            </span>
          </div>

          <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              Sisa Kuota Belanja
            </span>
            <div
              className={`text-base sm:text-xl font-bold font-mono mt-1 tabular-nums ${
                totalRemainingBudget < 0 ? 'text-rose-400' : 'text-emerald-400'
              }`}
            >
              {formatIDR(totalRemainingBudget)}
            </div>
            <span className="text-[10px] text-slate-500 block mt-0.5">
              {totalRemainingBudget < 0 ? 'Plafon terlampaui!' : 'Masih dalam batas aman'}
            </span>
          </div>

          <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              Pos Paling Dominan
            </span>
            <div className="text-base sm:text-xl font-bold text-white mt-1 truncate">
              {topCategory?.shortLabel || '-'}
            </div>
            <span className="text-[10px] font-mono text-amber-400 block mt-0.5">
              {topCategory ? `${topCategory.percentage.toFixed(0)}% (${formatIDR(topCategory.spent)})` : '-'}
            </span>
          </div>
        </div>
      </div>

      {/* 5 Distinct Category Cards Grid */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-sm font-bold text-white tracking-tight uppercase">
              Rincian 5 Pos Pengeluaran
            </h2>
            <p className="text-xs text-slate-400">
              Klik kartu pos untuk memfilter daftar riwayat pengeluaran di bawah, atau atur plafon anggaran
            </p>
          </div>
          {selectedFilterCategory !== 'all' && (
            <button
              onClick={() => setSelectedFilterCategory('all')}
              className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition-colors"
            >
              Reset Filter Kategori
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
          {categoryData.slice(0, 5).map((item) => {
            const isSelected = selectedFilterCategory === item.key;
            return (
              <div
                key={item.key}
                onClick={() => setSelectedFilterCategory(isSelected ? 'all' : item.key)}
                className={`bg-slate-900/90 rounded-2xl p-4 border transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between group ${
                  isSelected
                    ? 'border-emerald-500 ring-2 ring-emerald-500/20 shadow-lg shadow-emerald-950/30 -translate-y-0.5'
                    : 'border-slate-800 hover:border-slate-700 hover:shadow-md'
                }`}
              >
                {/* Accent Top Bar */}
                <div
                  className="absolute top-0 left-0 right-0 h-1"
                  style={{ backgroundColor: item.color }}
                />

                <div>
                  <div className="flex items-center justify-between gap-1 pt-1">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="p-1.5 rounded-lg bg-slate-950 border border-slate-800 shrink-0">
                        {getCategoryIcon(item.key)}
                      </span>
                      <span className="text-xs font-bold text-white truncate">
                        {item.shortLabel}
                      </span>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenEditBudget(item.key as keyof CategoryBudgetMap, item.budget);
                      }}
                      title="Ubah plafon batas anggaran"
                      className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded-md transition-colors"
                    >
                      <Sliders className="w-3 h-3" />
                    </button>
                  </div>

                  {/* Nominal Spent */}
                  <div className="mt-3">
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
                      Realisasi Keluar
                    </span>
                    <div className="text-lg font-bold font-mono text-white tabular-nums tracking-tight mt-0.5">
                      {formatIDR(item.spent)}
                    </div>
                  </div>

                  {/* Usage Progress Bar */}
                  <div className="mt-2.5 space-y-1">
                    <div className="flex items-center justify-between text-[11px] font-mono">
                      <span className="text-slate-400 text-[10px]">
                        Plafon: {formatIDR(item.budget)}
                      </span>
                      <span
                        className={`font-bold ${
                          item.isOverBudget
                            ? 'text-rose-400'
                            : item.budgetUsagePercent > 80
                            ? 'text-amber-400'
                            : 'text-emerald-400'
                        }`}
                      >
                        {item.budgetUsagePercent.toFixed(0)}%
                      </span>
                    </div>

                    <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-300"
                        style={{
                          backgroundColor: item.isOverBudget ? '#ef4444' : item.color,
                          width: `${Math.min(100, item.budgetUsagePercent)}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* Footer status */}
                <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-[10px]">
                  <span className="text-slate-500 font-mono">
                    {item.txCount} transaksi
                  </span>
                  {item.isOverBudget ? (
                    <span className="text-rose-400 font-bold flex items-center gap-0.5">
                      <AlertCircle className="w-3 h-3" /> Over
                    </span>
                  ) : (
                    <span className="text-emerald-400 font-medium truncate">
                      Sisa {formatIDR(item.remainingBudget)}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Visual Charts Section (Grafik Pengeluaran) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6">
        {/* Left: Donut Chart Distribusi (5 Cols) */}
        <div className="lg:col-span-5 bg-slate-900/90 rounded-2xl p-5 border border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div>
                <h3 className="text-sm font-bold text-white tracking-tight">
                  Grafik Proporsi Pengeluaran
                </h3>
                <p className="text-xs text-slate-400">
                  Persentase kontribusi masing-masing pos
                </p>
              </div>
              <span className="text-xs font-mono font-bold text-rose-400 bg-rose-950/80 border border-rose-800/40 px-2 py-0.5 rounded-lg shrink-0">
                {formatIDR(totalExpense)}
              </span>
            </div>

            {totalExpense === 0 ? (
              <div className="py-16 text-center text-xs text-slate-500">
                Belum ada transaksi pengeluaran tercatat.
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center pt-2">
                <div className="relative w-44 h-44 sm:w-48 sm:h-48 mx-auto">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 160 160">
                    <circle
                      cx="80"
                      cy="80"
                      r={radius}
                      className="fill-none stroke-slate-800"
                      strokeWidth="24"
                    />
                    {categoryData.map((item) => {
                      const strokeDasharray = `${(item.percentage / 100) * circumference} ${circumference}`;
                      const strokeDashoffset = -((cumulativeAngle / 100) * circumference);
                      cumulativeAngle += item.percentage;
                      const isHovered = hoveredCat === item.key;

                      return (
                        <circle
                          key={item.key}
                          cx="80"
                          cy="80"
                          r={radius}
                          className="fill-none cursor-pointer transition-all duration-300"
                          stroke={item.color}
                          strokeWidth={isHovered ? 28 : 22}
                          strokeDasharray={strokeDasharray}
                          strokeDashoffset={strokeDashoffset}
                          onMouseEnter={() => setHoveredCat(item.key)}
                          onMouseLeave={() => setHoveredCat(null)}
                          onClick={() => setSelectedFilterCategory(item.key)}
                        />
                      );
                    })}
                  </svg>

                  {/* Dynamic center indicator */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none px-3">
                    <span className="text-[11px] text-slate-400 font-medium truncate max-w-[120px]">
                      {activeHoverItem ? activeHoverItem.label : 'Total Pengeluaran'}
                    </span>
                    <span className="text-sm font-extrabold font-mono text-white mt-0.5">
                      {activeHoverItem ? formatIDR(activeHoverItem.spent) : formatIDR(totalExpense)}
                    </span>
                    <span className="text-[11px] font-bold font-mono text-rose-400 mt-0.5">
                      {activeHoverItem ? formatPercent(activeHoverItem.percentage) : '100%'}
                    </span>
                  </div>
                </div>

                {/* Donut Legend */}
                <div className="w-full grid grid-cols-2 gap-2 mt-5 pt-3.5 border-t border-slate-800">
                  {categoryData.map((item) => {
                    const isHovered = hoveredCat === item.key;
                    return (
                      <div
                        key={item.key}
                        onClick={() => setSelectedFilterCategory(item.key)}
                        onMouseEnter={() => setHoveredCat(item.key)}
                        onMouseLeave={() => setHoveredCat(null)}
                        className={`flex items-center justify-between text-xs p-1.5 sm:p-2 rounded-xl cursor-pointer transition-all border ${
                          isHovered
                            ? 'bg-slate-800 border-slate-700 font-bold scale-[1.02]'
                            : 'border-transparent hover:bg-slate-800/60'
                        }`}
                      >
                        <div className="flex items-center gap-1.5 truncate">
                          <span
                            className="w-2.5 h-2.5 rounded-full shrink-0"
                            style={{ backgroundColor: item.color }}
                          />
                          <span className="text-slate-300 truncate text-[11px]">
                            {item.shortLabel}
                          </span>
                        </div>
                        <span className="font-mono text-white tabular-nums shrink-0 ml-1 font-semibold text-[11px]">
                          {item.percentage.toFixed(0)}%
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right: Comparative Realization Bar Chart (7 Cols) */}
        <div className="lg:col-span-7 bg-slate-900/90 rounded-2xl p-5 border border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div>
                <h3 className="text-sm font-bold text-white tracking-tight">
                  Grafik Realisasi vs Batas Anggaran
                </h3>
                <p className="text-xs text-slate-400">
                  Pemakaian anggaran Makan, Transportasi, Jajan, Keperluan & Game
                </p>
              </div>
            </div>

            {/* Horizontal Bar Chart for 5 categories */}
            <div className="space-y-3 pt-2">
              {categoryData.slice(0, 5).map((item) => {
                const maxVal = Math.max(item.budget, item.spent, 1);
                const percentSpent = (item.spent / maxVal) * 100;
                const percentBudget = (item.budget / maxVal) * 100;

                return (
                  <div
                    key={item.key}
                    onMouseEnter={() => setHoveredCat(item.key)}
                    onMouseLeave={() => setHoveredCat(null)}
                    className="p-3 sm:p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/90 hover:border-slate-700 transition-colors space-y-2.5"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="p-1.5 bg-slate-900 rounded-lg border border-slate-800 shrink-0">
                          {getCategoryIcon(item.key)}
                        </span>
                        <span className="font-bold text-white text-xs sm:text-sm truncate">
                          {item.label}
                        </span>
                      </div>

                      <span
                        className={`text-[11px] font-bold px-2 py-0.5 rounded-full shrink-0 border ${
                          item.isOverBudget
                            ? 'bg-rose-950/90 border-rose-800/60 text-rose-400'
                            : item.budgetUsagePercent > 80
                            ? 'bg-amber-950/90 border-amber-800/60 text-amber-400'
                            : 'bg-emerald-950/90 border-emerald-800/60 text-emerald-400'
                        }`}
                      >
                        {item.budgetUsagePercent.toFixed(0)}%
                      </span>
                    </div>

                    <div className="flex items-baseline justify-between text-xs font-mono">
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-[10px] text-slate-400 font-sans uppercase tracking-wider">Terpakai:</span>
                        <span className="text-sm font-extrabold text-white">{formatIDR(item.spent)}</span>
                      </div>
                      <div className="flex items-baseline gap-1 text-[11px] text-slate-400">
                        <span className="font-sans text-[10px]">Batas:</span>
                        <span className="font-semibold text-slate-300">{formatIDR(item.budget)}</span>
                      </div>
                    </div>

                    <div className="w-full bg-slate-800 h-2 sm:h-2.5 rounded-full overflow-hidden relative">
                      <div
                        className="absolute top-0 bottom-0 w-0.5 bg-slate-400 z-10"
                        style={{ left: `${percentBudget}%` }}
                        title={`Batas Anggaran: ${formatIDR(item.budget)}`}
                      />
                      <div
                        className="h-full rounded-full transition-all duration-300"
                        style={{
                          backgroundColor: item.isOverBudget ? '#ef4444' : item.color,
                          width: `${Math.min(100, percentSpent)}%`,
                        }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-400 pt-0.5">
                      <div className="min-w-0 truncate">
                        {item.isOverBudget ? (
                          <span className="text-rose-400 font-semibold flex items-center gap-1 text-[11px] truncate">
                            <AlertCircle className="w-3 h-3 shrink-0" />
                            Overbudget {formatIDR(item.spent - item.budget)}
                          </span>
                        ) : (
                          <span className="text-[11px] truncate">
                            Sisa kuota: <strong className="text-emerald-400 font-mono font-semibold">{formatIDR(item.remainingBudget)}</strong>
                          </span>
                        )}
                      </div>
                      <span className="text-slate-500 font-mono text-[10px] shrink-0 ml-2">
                        {item.txCount} transaksi
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 bg-emerald-400 rounded-full"></span>
                <span>Aman (&lt;80%)</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 bg-amber-400 rounded-full"></span>
                <span>Waspada (80-100%)</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 bg-rose-400 rounded-full"></span>
                <span>Over (&gt;100%)</span>
              </span>
            </div>
            <span className="text-slate-500 hidden sm:inline">Garis vertikal = batas plafon</span>
          </div>
        </div>
      </div>

      {/* Quick Add Expense Form Card */}
      <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-5 shadow-sm">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
              <span>Catat Pengeluaran Cepat</span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-rose-950 text-rose-400 border border-rose-800/40">
                1-Klik
              </span>
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Langsung simpan transaksi makan, transport, jajan, keperluan atau game Anda
            </p>
          </div>

          {quickSuccess && (
            <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-950/80 border border-emerald-800/50 px-2.5 py-1 rounded-lg">
              <Check className="w-3.5 h-3.5" />
              Pengeluaran Berhasil Dicatat!
            </span>
          )}
        </div>

        <form onSubmit={handleQuickAddExpense} className="mt-4 space-y-4">
          <div>
            <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
              Pilih Pos Pengeluaran:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {(['makan', 'transportasi', 'jajan', 'keperluan', 'game'] as CategoryId[]).map((catId) => {
                const isActive = quickCat === catId;
                const info = CATEGORIES[catId];
                return (
                  <button
                    key={catId}
                    type="button"
                    onClick={() => setQuickCat(catId)}
                    className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs font-semibold transition-all ${
                      isActive
                        ? 'border-rose-500 bg-rose-500/10 text-white font-bold ring-1 ring-rose-500/40'
                        : 'border-slate-800 bg-slate-950/70 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <span className="p-1 rounded-md bg-slate-900 border border-slate-800">
                      {getCategoryIcon(catId)}
                    </span>
                    <span className="truncate">{info?.label || catId}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                Nominal (Rp):
              </label>
              <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 focus-within:ring-2 focus-within:ring-rose-500/20 focus-within:border-rose-500 transition-all">
                <span className="text-xs font-mono font-bold text-slate-500">Rp</span>
                <input
                  type="text"
                  required
                  placeholder="Contoh: 35000"
                  value={quickAmount}
                  onChange={(e) => setQuickAmount(e.target.value)}
                  className="w-full bg-transparent font-mono text-sm font-bold text-white focus:outline-hidden"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                Catatan / Keterangan:
              </label>
              <input
                type="text"
                placeholder={
                  quickCat === 'makan'
                    ? 'Makan siang warteg / sate'
                    : quickCat === 'transportasi'
                    ? 'Bensin motor / KRL'
                    : quickCat === 'jajan'
                    ? 'Kopi / boba sore'
                    : quickCat === 'keperluan'
                    ? 'Sabun / galon air'
                    : 'Top-up game / diamond'
                }
                value={quickNote}
                onChange={(e) => setQuickNote(e.target.value)}
                className="w-full text-xs bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:ring-1 focus:ring-rose-500 focus:border-rose-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                Metode Bayar:
              </label>
              <select
                value={quickMethod}
                onChange={(e) => setQuickMethod(e.target.value as PaymentMethod)}
                className="w-full text-xs bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:ring-1 focus:ring-rose-500 focus:border-rose-500 focus:outline-hidden"
              >
                <option value="qris">QRIS / E-Wallet (GoPay/Shopee)</option>
                <option value="cash">Uang Tunai (Cash)</option>
                <option value="bank_transfer">Transfer Bank</option>
                <option value="kartu">Kartu Debit/Kredit</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={!quickAmount}
            className="w-full py-2.5 px-4 bg-rose-400 hover:bg-rose-300 disabled:opacity-40 disabled:cursor-not-allowed text-slate-950 text-xs font-extrabold rounded-xl shadow-md shadow-rose-500/20 transition-all flex items-center justify-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Simpan Pengeluaran ({CATEGORIES[quickCat]?.label})</span>
          </button>
        </form>
      </div>

      {/* Riwayat Khusus Pengeluaran (Expense Ledger) */}
      <div className="bg-slate-900/90 rounded-2xl border border-slate-800 shadow-sm overflow-hidden">
        {/* Header Controls */}
        <div className="p-4 sm:p-5 border-b border-slate-800 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 text-xs text-rose-400 mb-0.5">
                <span>Buku Pengeluaran</span>
                <span aria-hidden="true" className="text-slate-600">·</span>
                <span className="text-slate-400">Arus Keluar</span>
              </div>
              <h2 className="text-base font-bold text-white tracking-tight">
                Riwayat Khusus Pengeluaran ({expenseTransactions.length} Transaksi)
              </h2>
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Cari warteg, bensin, kopi..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-hidden focus:border-rose-500 transition-colors"
              />
            </div>
          </div>

          {/* Quick Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            <span className="text-xs font-semibold text-slate-400 flex items-center gap-1 mr-1 shrink-0">
              <Filter className="w-3 h-3 text-slate-500" /> Pos:
            </span>
            <button
              onClick={() => setSelectedFilterCategory('all')}
              className={`px-3 py-1 text-xs font-semibold rounded-lg whitespace-nowrap transition-colors ${
                selectedFilterCategory === 'all'
                  ? 'bg-rose-500 text-slate-950 font-bold'
                  : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800'
              }`}
            >
              Semua Pengeluaran
            </button>
            {(['makan', 'transportasi', 'jajan', 'keperluan', 'game'] as CategoryId[]).map((catId) => {
              const isActive = selectedFilterCategory === catId;
              const info = CATEGORIES[catId];
              return (
                <button
                  key={catId}
                  onClick={() => setSelectedFilterCategory(catId)}
                  className={`px-3 py-1 text-xs font-semibold rounded-lg whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-rose-500 text-slate-950 font-bold'
                      : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <span
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: info?.color || '#cbd5e1' }}
                  />
                  <span>{info?.label || catId}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Ledger Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/70 text-slate-400 font-semibold uppercase text-[10px] tracking-wider">
                <th className="py-3 px-4">Tanggal</th>
                <th className="py-3 px-4">Pos Pengeluaran</th>
                <th className="py-3 px-4">Keterangan</th>
                <th className="py-3 px-4">Metode Bayar</th>
                <th className="py-3 px-4 text-right">Nominal Keluar</th>
                <th className="py-3 px-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {expenseTransactions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500 text-xs">
                    Tidak ada transaksi pengeluaran yang sesuai dengan filter.
                  </td>
                </tr>
              ) : (
                expenseTransactions.map((tx) => {
                  const cat = CATEGORIES[tx.category] || {
                    label: tx.category,
                    shortLabel: tx.category,
                    color: '#94a3b8',
                  };

                  return (
                    <tr key={tx.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-4 font-mono text-slate-400 whitespace-nowrap">
                        {formatDateIndo(tx.date)}
                      </td>
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold bg-slate-950 border border-slate-800">
                          <span
                            className="w-2 h-2 rounded-full shrink-0"
                            style={{ backgroundColor: cat.color }}
                          />
                          <span className="text-white">{cat.label}</span>
                        </span>
                      </td>
                      <td className="py-3 px-4 font-medium text-white max-w-xs truncate">
                        {tx.description}
                      </td>
                      <td className="py-3 px-4 text-slate-400 whitespace-nowrap">
                        <span className="uppercase text-[10px] font-mono px-2 py-0.5 rounded-sm bg-slate-800/80 border border-slate-700/50">
                          {PAYMENT_METHODS.find((p) => p.id === tx.paymentMethod)?.label || tx.paymentMethod}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-rose-400 whitespace-nowrap">
                        -{formatIDR(tx.amount)}
                      </td>
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        <button
                          onClick={() => onDeleteTransaction(tx.id)}
                          title="Hapus transaksi"
                          className="p-1 text-slate-500 hover:text-rose-400 hover:bg-rose-950/50 rounded-md transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal / Dialog to Edit Category Budget */}
      {editingBudgetCat && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-xs p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Sliders className="w-4 h-4 text-rose-400" />
                <span>Ubah Plafon Anggaran: {CATEGORIES[editingBudgetCat]?.label}</span>
              </h3>
              <button
                onClick={() => setEditingBudgetCat(null)}
                className="text-slate-400 hover:text-white text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveBudget} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1">
                  Batas Maksimal Pengeluaran Per Bulan (Rp):
                </label>
                <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5">
                  <span className="font-mono text-sm font-bold text-slate-500">Rp</span>
                  <input
                    type="text"
                    required
                    value={editBudgetValue}
                    onChange={(e) => setEditBudgetValue(e.target.value)}
                    className="w-full bg-transparent font-mono text-base font-bold text-white focus:outline-hidden"
                  />
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Nominal preview: <strong className="text-emerald-400 font-mono">{formatIDR(parseNumberInput(editBudgetValue))}</strong>
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingBudgetCat(null)}
                  className="px-3 py-2 text-xs font-semibold text-slate-400 hover:text-white rounded-xl bg-slate-800"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-xl shadow-xs"
                >
                  Simpan Batas Anggaran
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
