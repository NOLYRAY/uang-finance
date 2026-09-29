import React from 'react';
import { formatIDR, formatPercent } from '../utils/formatters';
import { ArrowUpRight, ArrowDownRight, PiggyBank, Wallet } from 'lucide-react';

interface SummaryMetricsProps {
  summary: {
    totalIncome: number;
    totalExpense: number;
    totalSavingsDeposit: number;
    netCashFlow: number;
    totalGoalsSaved: number;
    totalGoalsTarget: number;
    savingsRate: number;
    transactionCount: number;
    goalsCount: number;
  };
  onQuickAdd: () => void;
  onNavigateTab: (tab: string) => void;
}

export const SummaryMetrics: React.FC<SummaryMetricsProps> = ({
  summary,
  onQuickAdd,
  onNavigateTab,
}) => {
  const isSurplus = summary.netCashFlow >= 0;
  const currentMonthName = new Intl.DateTimeFormat('id-ID', { month: 'long', year: 'numeric' }).format(new Date());

  return (
    <div className="space-y-4">
      {/* Executive Financial Command Grid (12-cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Dominant Main Balance Anchor (5 Cols) */}
        <div className="lg:col-span-5 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 text-white rounded-2xl p-5 sm:p-6 border border-emerald-500/20 shadow-lg shadow-emerald-950/20 flex flex-col justify-between relative overflow-hidden">
          {/* Subtle Ambient Radial Glow */}
          <div className="absolute -top-12 -right-12 w-44 h-44 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-12 -left-12 w-44 h-44 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shadow-sm shadow-emerald-400"></span>
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Sisa Saldo Kas Bersih
                </span>
              </div>
              <span className="text-[11px] font-mono font-bold text-emerald-400 bg-emerald-950/80 border border-emerald-500/30 px-2.5 py-0.5 rounded-full">
                {currentMonthName}
              </span>
            </div>

            <div className="mt-3">
              <div className={`text-2xl sm:text-4xl font-extrabold font-mono tabular-nums tracking-tight ${isSurplus ? 'text-white' : 'text-rose-400'}`}>
                {formatIDR(summary.netCashFlow)}
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Uang bebas setelah dikurangi 5 pos pengeluaran & tabungan
              </p>
            </div>
          </div>

          <div className="relative z-10 mt-5 pt-4 border-t border-slate-800 flex items-center justify-between text-xs">
            <div className="flex items-center gap-3 sm:gap-4">
              <div>
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Pemasukan</span>
                <span className="font-mono font-bold text-emerald-400 text-xs sm:text-sm">+{formatIDR(summary.totalIncome)}</span>
              </div>
              <div className="w-px h-6 bg-slate-800" />
              <div>
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Keluar (5 Pos)</span>
                <span className="font-mono font-bold text-rose-400 text-xs sm:text-sm">-{formatIDR(summary.totalExpense)}</span>
              </div>
            </div>

            <button
              onClick={onQuickAdd}
              className="px-3 py-1.5 bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-bold text-xs rounded-xl shadow-xs transition-colors shrink-0"
            >
              + Catat
            </button>
          </div>
        </div>

        {/* 3 Companion Cards (7 Cols) */}
        <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          {/* Total Inflow */}
          <div className="bg-slate-900/90 rounded-2xl p-4 sm:p-5 border border-slate-800 hover:border-slate-700 shadow-sm flex flex-col justify-between transition-all">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Masuk</span>
                <span className="p-1.5 bg-emerald-950/80 border border-emerald-800/40 rounded-lg text-emerald-400">
                  <ArrowUpRight className="w-4 h-4" />
                </span>
              </div>
              <div className="mt-2.5 text-lg sm:text-2xl font-bold font-mono tabular-nums text-white tracking-tight">
                {formatIDR(summary.totalIncome)}
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Gaji & sampingan
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
              <span className="font-medium text-emerald-400">Inflow Aktif</span>
              <span className="font-mono text-slate-300">100%</span>
            </div>
          </div>

          {/* Total 5 Expenses */}
          <div
            onClick={() => onNavigateTab('expenses')}
            role="button"
            tabIndex={0}
            className="bg-slate-900/90 rounded-2xl p-4 sm:p-5 border border-slate-800 hover:border-rose-500/50 hover:bg-slate-900 shadow-sm flex flex-col justify-between transition-all cursor-pointer group"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 group-hover:text-rose-400 transition-colors">
                  5 Pos Keluar
                </span>
                <span className="p-1.5 bg-rose-950/80 border border-rose-800/40 rounded-lg text-rose-400 group-hover:bg-rose-500 group-hover:text-slate-950 transition-all">
                  <ArrowDownRight className="w-4 h-4" />
                </span>
              </div>
              <div className="mt-2.5 text-lg sm:text-2xl font-bold font-mono tabular-nums text-white tracking-tight">
                {formatIDR(summary.totalExpense)}
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Makan, transport, jajan, keperluan, game
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
              <span className="text-slate-400">Porsi Pengeluaran:</span>
              <span className="font-mono font-bold text-rose-400 group-hover:underline">
                {summary.totalIncome > 0 ? `${((summary.totalExpense / summary.totalIncome) * 100).toFixed(0)}%` : '0%'} →
              </span>
            </div>
          </div>

          {/* Accumulated Savings */}
          <div
            onClick={() => onNavigateTab('savings')}
            role="button"
            tabIndex={0}
            className="bg-slate-900/90 rounded-2xl p-4 sm:p-5 border border-slate-800 hover:border-blue-500/50 hover:bg-slate-900 shadow-sm flex flex-col justify-between transition-all cursor-pointer group"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 group-hover:text-blue-400 transition-colors">
                  Disimpan
                </span>
                <span className="p-1.5 bg-blue-950/80 border border-blue-800/40 rounded-lg text-blue-400 group-hover:bg-blue-500 group-hover:text-slate-950 transition-all">
                  <PiggyBank className="w-4 h-4" />
                </span>
              </div>
              <div className="mt-2.5 text-lg sm:text-2xl font-bold font-mono tabular-nums text-white tracking-tight">
                {formatIDR(summary.totalGoalsSaved)}
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {summary.goalsCount} target tabungan
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
              <span className="text-slate-400">Rasio Simpanan:</span>
              <span className="font-mono font-bold text-blue-400 group-hover:underline">
                {formatPercent(summary.savingsRate)} →
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
