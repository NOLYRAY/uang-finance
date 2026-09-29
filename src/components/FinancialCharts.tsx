import React, { useState } from 'react';
import { Transaction, CategoryBudgetMap } from '../types/finance';
import { CATEGORIES } from '../constants/categories';
import { formatIDR, formatPercent } from '../utils/formatters';
import { Utensils, Car, Coffee, Package, Gamepad2, AlertCircle, TrendingUp } from 'lucide-react';

interface FinancialChartsProps {
  transactions: Transaction[];
  categoryBudgets: CategoryBudgetMap;
  onUpdateBudget?: (category: keyof CategoryBudgetMap, newAmount: number) => void;
  onFilterByCategory?: (category: string) => void;
}

export const FinancialCharts: React.FC<FinancialChartsProps> = ({
  transactions,
  categoryBudgets,
  onFilterByCategory,
}) => {
  const [hoveredCat, setHoveredCat] = useState<string | null>(null);

  const targetCategories = ['makan', 'transportasi', 'jajan', 'keperluan', 'game', 'lainnya'] as const;

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

  const categoryData = targetCategories
    .filter((catKey) => catKey !== 'lainnya' || categoryExpenses.lainnya > 0)
    .map((catKey) => {
      const info = CATEGORIES[catKey] || { label: catKey, shortLabel: catKey, color: '#94a3b8' };
      const spent = categoryExpenses[catKey] || 0;
      const budget = categoryBudgets[catKey as keyof CategoryBudgetMap] || 0;
      const percentage = totalExpense > 0 ? (spent / totalExpense) * 100 : 0;
      const budgetUsagePercent = budget > 0 ? (spent / budget) * 100 : 0;
      const isOverBudget = budget > 0 && spent > budget;

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
      };
    });

  // SVG Donut calculation
  const radius = 64;
  const circumference = 2 * Math.PI * radius;
  let cumulativeAngle = 0;

  const getCategoryIcon = (key: string) => {
    switch (key) {
      case 'makan':
        return <Utensils className="w-3.5 h-3.5 text-orange-400" />;
      case 'transportasi':
        return <Car className="w-3.5 h-3.5 text-sky-400" />;
      case 'jajan':
        return <Coffee className="w-3.5 h-3.5 text-rose-400" />;
      case 'keperluan':
        return <Package className="w-3.5 h-3.5 text-purple-400" />;
      case 'game':
        return <Gamepad2 className="w-3.5 h-3.5 text-emerald-400" />;
      default:
        return <TrendingUp className="w-3.5 h-3.5 text-slate-400" />;
    }
  };

  const activeHoverItem = hoveredCat ? categoryData.find((c) => c.key === hoveredCat) : null;

  return (
    <div className="space-y-5 sm:space-y-6 max-w-full overflow-hidden">
      {/* 5 Distinct Aesthetic Category Indicator Cards */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
            5 Pos Pengeluaran Utama
          </span>
          <span className="text-[11px] text-slate-400">
            Klik kartu untuk filter
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 sm:gap-3">
          {categoryData.slice(0, 5).map((item) => {
            const isHovered = hoveredCat === item.key;
            return (
              <div
                key={item.key}
                onClick={() => onFilterByCategory && onFilterByCategory(item.key)}
                onMouseEnter={() => setHoveredCat(item.key)}
                onMouseLeave={() => setHoveredCat(null)}
                className={`bg-slate-900/90 rounded-2xl p-3 sm:p-4 border transition-all cursor-pointer relative overflow-hidden group ${
                  isHovered
                    ? 'border-slate-600 shadow-lg shadow-black/40 -translate-y-0.5'
                    : 'border-slate-800 hover:border-slate-700'
                }`}
              >
                {/* Top header */}
                <div className="flex items-center justify-between gap-1">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-[11px] sm:text-xs font-bold text-white truncate">
                      {item.shortLabel}
                    </span>
                  </div>
                  <span className="p-1 rounded-md bg-slate-800 border border-slate-700/50 shrink-0">
                    {getCategoryIcon(item.key)}
                  </span>
                </div>

                {/* Amount */}
                <div className="mt-2.5 sm:mt-3">
                  <div className="text-sm sm:text-base font-extrabold font-mono tabular-nums text-white tracking-tight truncate">
                    {formatIDR(item.spent)}
                  </div>
                  <div className="flex items-center justify-between text-[10px] sm:text-[11px] text-slate-400 mt-1">
                    <span className="font-mono">{item.percentage.toFixed(0)}% total</span>
                    <span className={item.isOverBudget ? 'text-rose-400 font-bold' : 'text-slate-400 font-mono'}>
                      {item.isOverBudget ? 'Over' : `${item.budgetUsagePercent.toFixed(0)}%`}
                    </span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-300"
                    style={{
                      backgroundColor: item.isOverBudget ? '#ef4444' : item.color,
                      width: `${Math.min(100, item.budgetUsagePercent)}%`,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Visual Center: Donut & Comparative Bar Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Visual 1: Interactive Donut Hub (5 Cols) */}
        <div className="lg:col-span-5 bg-slate-900/90 rounded-2xl p-4 sm:p-6 border border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-white tracking-tight">
                  Distribusi 5 Pos Pengeluaran
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Sentuh diagram untuk melihat detail
                </p>
              </div>
              <span className="text-xs font-mono font-bold text-emerald-400 bg-slate-800 border border-slate-700 px-2 py-0.5 rounded-lg shrink-0">
                {formatIDR(totalExpense)}
              </span>
            </div>

            {totalExpense === 0 ? (
              <div className="py-12 text-center text-xs text-slate-500">
                Belum ada transaksi pengeluaran tercatat.
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center pt-1">
                {/* SVG Donut */}
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
                          onClick={() => onFilterByCategory && onFilterByCategory(item.key)}
                        />
                      );
                    })}
                  </svg>

                  {/* Dynamic center indicator */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none px-3">
                    <span className="text-[11px] text-slate-400 font-medium truncate max-w-[120px]">
                      {activeHoverItem ? activeHoverItem.label : 'Total Keluar'}
                    </span>
                    <span className="text-sm font-extrabold font-mono text-white mt-0.5">
                      {activeHoverItem ? formatIDR(activeHoverItem.spent) : formatIDR(totalExpense)}
                    </span>
                    <span className="text-[11px] font-bold font-mono text-emerald-400 mt-0.5">
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
                        onClick={() => onFilterByCategory && onFilterByCategory(item.key)}
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

        {/* Visual 2: Comparative Bar Chart: Realisasi vs Batas Anggaran (7 Cols) */}
        <div className="lg:col-span-7 bg-slate-900/90 rounded-2xl p-4 sm:p-6 border border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-4">
              <div>
                <h3 className="text-sm font-bold text-white tracking-tight">
                  Grafik Realisasi vs Batas Anggaran
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Memantau batas wajar Makan, Transportasi, Jajan, Keperluan & Game
                </p>
              </div>
            </div>

            {/* Horizontal Bar Chart for 5 categories - RAPIH & RESPONSIVE */}
            <div className="space-y-3 pt-1">
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
                    {/* Baris 1: Ikon + Judul Kategori di Kiri, Badge Persentase di Kanan (TIDAK AKAN TABRAKAN) */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="p-1.5 bg-slate-900 rounded-lg border border-slate-800 shrink-0">
                          {getCategoryIcon(item.key)}
                        </span>
                        <span className="font-bold text-white text-xs sm:text-sm truncate">
                          {item.label}
                        </span>
                      </div>

                      {/* Badge persentase rapi di kanan */}
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

                    {/* Baris 2: Angka Nominal Terpakai di Kiri, Batas Kuota di Kanan */}
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

                    {/* Baris 3: Progress Bar yang Mulus */}
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

                    {/* Baris 4: Status Sisa Kuota di Kiri, Jumlah Transaksi di Kanan */}
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
                        {transactions.filter((t) => t.category === item.key).length} transaksi
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
            <span className="text-slate-500 hidden sm:inline">Garis vertikal = batas limit</span>
          </div>
        </div>
      </div>

      {/* Visual 3: Neraca Makro: Pemasukan vs 5 Pengeluaran vs Tabungan */}
      <div className="bg-slate-900/90 rounded-2xl p-4 sm:p-6 border border-slate-800 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
          <div>
            <h3 className="text-sm font-bold text-white tracking-tight">
              Grafik Aliran Dana: Pengeluaran vs Tabungan
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Alokasi persentase pemasukan Anda bulan ini
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
            <span className="text-emerald-400 font-bold bg-emerald-950/60 border border-emerald-800/40 px-2 py-0.5 rounded-md">
              Masuk: {formatIDR(totalIncome)}
            </span>
            <span className="text-rose-400 font-bold bg-rose-950/60 border border-rose-800/40 px-2 py-0.5 rounded-md">
              Keluar: {formatIDR(totalExpense)}
            </span>
            <span className="text-blue-400 font-bold bg-blue-950/60 border border-blue-800/40 px-2 py-0.5 rounded-md">
              Ditabung: {formatIDR(totalSavings)}
            </span>
          </div>
        </div>

        {totalIncome > 0 && (
          <div className="space-y-3 pt-2">
            <div className="w-full bg-slate-950 h-6 rounded-xl overflow-hidden flex border border-slate-800/80">
              <div
                className="bg-rose-500 h-full transition-all duration-300 flex items-center justify-center text-[10px] text-white font-extrabold truncate px-1"
                style={{ width: `${Math.min(100, (totalExpense / totalIncome) * 100)}%` }}
                title={`Pengeluaran: ${formatIDR(totalExpense)}`}
              >
                {totalExpense > 0 && `${((totalExpense / totalIncome) * 100).toFixed(0)}% Keluar`}
              </div>
              <div
                className="bg-blue-600 h-full transition-all duration-300 flex items-center justify-center text-[10px] text-white font-extrabold truncate px-1"
                style={{ width: `${Math.min(100 - (totalExpense / totalIncome) * 100, (totalSavings / totalIncome) * 100)}%` }}
                title={`Tabungan: ${formatIDR(totalSavings)}`}
              >
                {totalSavings > 0 && `${((totalSavings / totalIncome) * 100).toFixed(0)}% Tabungan`}
              </div>
              <div
                className="bg-emerald-500 h-full transition-all duration-300 flex items-center justify-center text-[10px] text-slate-950 font-extrabold truncate px-1"
                style={{
                  width: `${Math.max(0, 100 - ((totalExpense + totalSavings) / totalIncome) * 100)}%`,
                }}
                title="Sisa Kas Bebas"
              >
                {totalIncome - (totalExpense + totalSavings) > 0 && 'Sisa Kas'}
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800 gap-y-1">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 bg-rose-500 rounded-full shrink-0"></span>
                <span>5 Pos Keluar: <strong className="text-white">{formatIDR(totalExpense)}</strong></span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 bg-blue-500 rounded-full shrink-0"></span>
                <span>Setor Tabungan: <strong className="text-white">{formatIDR(totalSavings)}</strong></span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 bg-emerald-400 rounded-full shrink-0"></span>
                <span>Sisa Kas: <strong className="text-emerald-400">{formatIDR(Math.max(0, totalIncome - (totalExpense + totalSavings)))}</strong></span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
