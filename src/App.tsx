import React, { useState, useMemo } from 'react';
import { useFinanceData } from './hooks/useFinanceData';
import { Navbar } from './components/Navbar';
import { SummaryMetrics } from './components/SummaryMetrics';
import { QuickAddCard } from './components/QuickAddCard';
import { ExpenseManager } from './components/ExpenseManager';
import { Budget503020Calc } from './components/Budget503020Calc';
import { SavingsGoalsPlanner } from './components/SavingsGoalsPlanner';
import { TransactionList } from './components/TransactionList';
import { TransactionFormModal } from './components/TransactionFormModal';
import { ArchitectureGuide } from './components/ArchitectureGuide';
import { CATEGORIES } from './constants/categories';
import {
  ArrowRight,
  CheckCircle2,
  RotateCcw,
  Download,
  Upload,
  PiggyBank,
  TrendingDown,
  Utensils,
  Car,
  Coffee,
  Package,
  Gamepad2,
  ShieldCheck,
  CreditCard,
  PlusCircle,
} from 'lucide-react';
import { formatIDR, formatDateIndo } from './utils/formatters';

export default function App() {
  const {
    transactions,
    goals,
    budgetConfig,
    summary,
    setBudgetConfig,
    updateCategoryBudget,
    addTransaction,
    deleteTransaction,
    addGoal,
    deleteGoal,
    contributeToGoal,
    resetToSample,
    exportData,
    exportCSV,
    importData,
  } = useFinanceData();

  const [activeTab, setActiveTab] = useState<string>('overview');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleReset = () => {
    if (window.confirm('Reset data ke kondisi awal simulasi?')) {
      resetToSample();
      showToast('Data simulasi berhasil dimuat ulang.');
    }
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const res = importData(content);
      showToast(res.message);
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // 5 Expense category totals for summary snippet
  const categoryExpenses = useMemo(() => {
    const expenses: Record<string, number> = {
      makan: 0,
      transportasi: 0,
      jajan: 0,
      keperluan: 0,
      game: 0,
    };
    for (const t of transactions) {
      if (t.type === 'expense' && expenses[t.category] !== undefined) {
        expenses[t.category] += t.amount;
      }
    }
    return expenses;
  }, [transactions]);

  const totalBudgetLimit = useMemo(() => {
    return (
      (budgetConfig.categoryBudgets.makan || 0) +
      (budgetConfig.categoryBudgets.transportasi || 0) +
      (budgetConfig.categoryBudgets.jajan || 0) +
      (budgetConfig.categoryBudgets.keperluan || 0) +
      (budgetConfig.categoryBudgets.game || 0)
    );
  }, [budgetConfig.categoryBudgets]);

  const recentTransactions = useMemo(() => {
    return transactions.slice(0, 6);
  }, [transactions]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-slate-950">
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenAddModal={() => setIsAddModalOpen(true)}
        onExportCSV={exportCSV}
        onResetSample={handleReset}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-5 sm:py-8 space-y-6">
        {/* TAB 1: RINGKASAN (Overview Dashboard) - Clean & Executive without the heavy expense breakdown */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Top Command Banner */}
            <SummaryMetrics
              summary={summary}
              onQuickAdd={() => setIsAddModalOpen(true)}
              onNavigateTab={(tab) => setActiveTab(tab)}
            />

            {/* Main Overview Grid: Left (7 Cols) Summaries + Right (5 Cols) Quick Logger */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 items-start">
              {/* Left Column: High-level Highlights (7 Cols) */}
              <div className="lg:col-span-7 space-y-5 sm:space-y-6">
                {/* 1. Ringkasan Pengeluaran Snapshot Card with CTA to Dedicated Tab */}
                <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-5 shadow-sm space-y-4 relative overflow-hidden">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-800 gap-2">
                    <div className="flex items-center gap-2">
                      <span className="p-1.5 rounded-lg bg-rose-950/80 border border-rose-800/40 text-rose-400">
                        <TrendingDown className="w-4 h-4" />
                      </span>
                      <div>
                        <h2 className="text-sm font-bold text-white tracking-tight">
                          Ringkasan Pos Pengeluaran
                        </h2>
                        <p className="text-[11px] text-slate-400">
                          Makan, Transportasi, Jajan, Keperluan & Game
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => setActiveTab('expenses')}
                      className="text-xs font-bold text-rose-400 hover:text-rose-300 transition-colors flex items-center gap-1 self-start sm:self-auto bg-rose-950/40 border border-rose-800/40 px-3 py-1.5 rounded-xl hover:bg-rose-950/80"
                    >
                      <span>Buka Halaman Pengeluaran</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Nominal comparison */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80">
                      <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
                        Total Keluar
                      </span>
                      <div className="text-base sm:text-lg font-bold font-mono text-rose-400 mt-0.5">
                        {formatIDR(summary.totalExpense)}
                      </div>
                    </div>

                    <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80">
                      <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
                        Batas Plafon
                      </span>
                      <div className="text-base sm:text-lg font-bold font-mono text-white mt-0.5">
                        {formatIDR(totalBudgetLimit)}
                      </div>
                    </div>

                    <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80 col-span-2 sm:col-span-1">
                      <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
                        Sisa Kuota
                      </span>
                      <div
                        className={`text-base sm:text-lg font-bold font-mono mt-0.5 ${
                          totalBudgetLimit - summary.totalExpense < 0
                            ? 'text-rose-400'
                            : 'text-emerald-400'
                        }`}
                      >
                        {formatIDR(totalBudgetLimit - summary.totalExpense)}
                      </div>
                    </div>
                  </div>

                  {/* Mini segmented bar representing 5 categories */}
                  {summary.totalExpense > 0 && (
                    <div className="space-y-2 pt-1">
                      <div className="flex items-center justify-between text-[11px] text-slate-400">
                        <span className="font-semibold">Proporsi 5 Pos:</span>
                        <span className="text-[10px] font-mono text-slate-500">100% total pengeluaran</span>
                      </div>

                      <div className="w-full bg-slate-950 h-3 rounded-lg overflow-hidden flex border border-slate-800">
                        <div
                          className="bg-orange-500 h-full transition-all"
                          style={{ width: `${(categoryExpenses.makan / summary.totalExpense) * 100}%` }}
                          title={`Makan: ${formatIDR(categoryExpenses.makan)}`}
                        />
                        <div
                          className="bg-sky-500 h-full transition-all"
                          style={{ width: `${(categoryExpenses.transportasi / summary.totalExpense) * 100}%` }}
                          title={`Transportasi: ${formatIDR(categoryExpenses.transportasi)}`}
                        />
                        <div
                          className="bg-rose-500 h-full transition-all"
                          style={{ width: `${(categoryExpenses.jajan / summary.totalExpense) * 100}%` }}
                          title={`Jajan: ${formatIDR(categoryExpenses.jajan)}`}
                        />
                        <div
                          className="bg-purple-500 h-full transition-all"
                          style={{ width: `${(categoryExpenses.keperluan / summary.totalExpense) * 100}%` }}
                          title={`Keperluan: ${formatIDR(categoryExpenses.keperluan)}`}
                        />
                        <div
                          className="bg-emerald-500 h-full transition-all"
                          style={{ width: `${(categoryExpenses.game / summary.totalExpense) * 100}%` }}
                          title={`Game: ${formatIDR(categoryExpenses.game)}`}
                        />
                      </div>

                      {/* Mini Chips */}
                      <div className="flex flex-wrap gap-2 text-[11px] text-slate-400 pt-1">
                        <span className="flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full bg-orange-500" />
                          <span>Makan: <strong className="text-white font-mono">{formatIDR(categoryExpenses.makan)}</strong></span>
                        </span>
                        <span className="flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full bg-sky-500" />
                          <span>Transport: <strong className="text-white font-mono">{formatIDR(categoryExpenses.transportasi)}</strong></span>
                        </span>
                        <span className="flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full bg-rose-500" />
                          <span>Jajan: <strong className="text-white font-mono">{formatIDR(categoryExpenses.jajan)}</strong></span>
                        </span>
                        <span className="flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full bg-purple-500" />
                          <span>Keperluan: <strong className="text-white font-mono">{formatIDR(categoryExpenses.keperluan)}</strong></span>
                        </span>
                        <span className="flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full bg-emerald-500" />
                          <span>Game: <strong className="text-white font-mono">{formatIDR(categoryExpenses.game)}</strong></span>
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Clean CTA Footer */}
                  <div className="pt-2 flex justify-end">
                    <button
                      onClick={() => setActiveTab('expenses')}
                      className="text-xs font-bold text-rose-400 hover:text-white transition-colors flex items-center gap-1"
                    >
                      <span>Lihat Grafik Detail & Buku Riwayat Pengeluaran</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* 2. Target Tabungan Snapshot Card */}
                <div className="bg-slate-900/90 rounded-2xl border border-slate-800 shadow-sm p-5 space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                    <div className="flex items-center gap-2">
                      <span className="p-1.5 rounded-lg bg-blue-950/80 border border-blue-800/40 text-blue-400">
                        <PiggyBank className="w-4 h-4" />
                      </span>
                      <div>
                        <h2 className="text-sm font-bold text-white tracking-tight">
                          Target Tabungan Aktif
                        </h2>
                        <p className="text-[11px] text-slate-400">
                          {summary.goalsCount} target terencana · Total terkumpul {formatIDR(summary.totalGoalsSaved)}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setActiveTab('savings')}
                      className="text-xs font-bold text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1 bg-blue-950/40 border border-blue-800/40 px-3 py-1.5 rounded-xl hover:bg-blue-950/80"
                    >
                      <span>Kelola Tabungan</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="space-y-3">
                    {goals.slice(0, 3).map((goal) => {
                      const progress = goal.targetAmount > 0 ? (goal.currentAmount / goal.targetAmount) * 100 : 0;
                      return (
                        <div key={goal.id} className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-bold text-white truncate max-w-[200px]">{goal.title}</span>
                            <span className="font-mono text-[11px] font-bold text-emerald-400">
                              {progress.toFixed(0)}%
                            </span>
                          </div>
                          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full bg-emerald-400 transition-all duration-300"
                              style={{ width: `${Math.min(100, progress)}%` }}
                            />
                          </div>
                          <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                            <span>{formatIDR(goal.currentAmount)}</span>
                            <span className="text-slate-500">/ {formatIDR(goal.targetAmount)}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 3. Snapshot Aturan 50/30/20 */}
                <div
                  onClick={() => setActiveTab('budget503020')}
                  className="bg-slate-900/90 rounded-2xl border border-slate-800 shadow-sm p-5 hover:border-slate-700 transition-all cursor-pointer group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="p-1.5 rounded-lg bg-sky-950/80 border border-sky-800/40 text-sky-400">
                        <ShieldCheck className="w-4 h-4" />
                      </span>
                      <div>
                        <div className="text-xs font-bold text-sky-400 uppercase tracking-wider">
                          Aturan Finansial 50/30/20
                        </div>
                        <h3 className="text-sm font-bold text-white mt-0.5">
                          Evaluasi Batas Anggaran & Rasio Kebutuhan
                        </h3>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
                  </div>
                  <p className="text-xs text-slate-400 mt-2">
                    Pastikan kebutuhan pokok (Makan, Transport, Keperluan) terkontrol dan tidak melebihi 50% dari pendapatan Anda.
                  </p>
                </div>
              </div>

              {/* Right Column: Quick Add + Fast Navigation (5 Cols) */}
              <div className="lg:col-span-5 space-y-5 sm:space-y-6">
                {/* In-page 1-Click Quick Add Logger */}
                <QuickAddCard onAddTransaction={addTransaction} />

                {/* Quick Action Navigation Card */}
                <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-5 shadow-sm space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Akses Langsung Halaman
                  </h3>
                  <div className="grid grid-cols-2 gap-2.5">
                    <button
                      onClick={() => setActiveTab('expenses')}
                      className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 hover:border-rose-500/50 hover:bg-slate-900 transition-all text-left group"
                    >
                      <span className="text-[10px] font-bold text-rose-400 uppercase tracking-wider block">
                        Terpisah
                      </span>
                      <span className="text-xs font-bold text-white group-hover:text-rose-300 block mt-0.5">
                        UI Pengeluaran →
                      </span>
                      <span className="text-[10px] text-slate-500 block mt-0.5">
                        5 Pos & Grafik Detail
                      </span>
                    </button>

                    <button
                      onClick={() => setActiveTab('savings')}
                      className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 hover:border-blue-500/50 hover:bg-slate-900 transition-all text-left group"
                    >
                      <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider block">
                        Target
                      </span>
                      <span className="text-xs font-bold text-white group-hover:text-blue-300 block mt-0.5">
                        Tabungan →
                      </span>
                      <span className="text-[10px] text-slate-500 block mt-0.5">
                        Simulasi Bunga & Target
                      </span>
                    </button>

                    <button
                      onClick={() => setActiveTab('budget503020')}
                      className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 hover:border-sky-500/50 hover:bg-slate-900 transition-all text-left group"
                    >
                      <span className="text-[10px] font-bold text-sky-400 uppercase tracking-wider block">
                        Alokasi
                      </span>
                      <span className="text-xs font-bold text-white group-hover:text-sky-300 block mt-0.5">
                        Batas Anggaran →
                      </span>
                      <span className="text-[10px] text-slate-500 block mt-0.5">
                        Kalkulator 50/30/20
                      </span>
                    </button>

                    <button
                      onClick={() => setActiveTab('transactions')}
                      className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 hover:border-emerald-500/50 hover:bg-slate-900 transition-all text-left group"
                    >
                      <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block">
                        Riwayat
                      </span>
                      <span className="text-xs font-bold text-white group-hover:text-emerald-300 block mt-0.5">
                        Buku Kas →
                      </span>
                      <span className="text-[10px] text-slate-500 block mt-0.5">
                        Semua Transaksi
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Transactions Preview in Ringkasan */}
            <div className="bg-slate-900/90 rounded-2xl border border-slate-800 shadow-sm overflow-hidden">
              <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white tracking-tight">
                    Aktivitas Transaksi Terbaru
                  </h3>
                  <p className="text-xs text-slate-400">
                    6 catatan transaksi terakhir (Masuk, Keluar, dan Simpanan)
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab('transactions')}
                  className="text-xs font-bold text-emerald-400 hover:text-emerald-300 transition-colors flex items-center gap-1"
                >
                  <span>Lihat Semua di Buku Kas</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="divide-y divide-slate-800/60">
                {recentTransactions.map((tx) => {
                  const cat = CATEGORIES[tx.category] || { label: tx.category, color: '#94a3b8' };
                  const isExpense = tx.type === 'expense';
                  const isIncome = tx.type === 'income';

                  return (
                    <div
                      key={tx.id}
                      className="p-3.5 sm:px-5 flex items-center justify-between hover:bg-slate-800/30 transition-colors text-xs"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: cat.color }}
                        />
                        <div className="min-w-0">
                          <div className="font-semibold text-white truncate">{tx.description}</div>
                          <div className="text-[11px] text-slate-400 flex items-center gap-2">
                            <span>{cat.label}</span>
                            <span aria-hidden="true">·</span>
                            <span className="font-mono">{formatDateIndo(tx.date)}</span>
                          </div>
                        </div>
                      </div>

                      <div className="text-right shrink-0 ml-3">
                        <div
                          className={`font-mono font-bold text-sm tabular-nums ${
                            isExpense
                              ? 'text-rose-400'
                              : isIncome
                              ? 'text-emerald-400'
                              : 'text-blue-400'
                          }`}
                        >
                          {isExpense ? '-' : '+'}{formatIDR(tx.amount)}
                        </div>
                        <span className="text-[10px] text-slate-500 uppercase tracking-wider block">
                          {tx.type}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: PENGELUARAN - SEPARATED DEDICATED VIEW */}
        {activeTab === 'expenses' && (
          <ExpenseManager
            transactions={transactions}
            categoryBudgets={budgetConfig.categoryBudgets}
            onUpdateBudget={updateCategoryBudget}
            onAddTransaction={addTransaction}
            onDeleteTransaction={deleteTransaction}
            onOpenAddModal={() => setIsAddModalOpen(true)}
            onExportCSV={exportCSV}
          />
        )}

        {/* TAB 3: TARGET TABUNGAN */}
        {activeTab === 'savings' && (
          <SavingsGoalsPlanner
            goals={goals}
            onAddGoal={addGoal}
            onDeleteGoal={deleteGoal}
            onContribute={contributeToGoal}
          />
        )}

        {/* TAB 4: BATAS ANGGARAN & 50/30/20 */}
        {activeTab === 'budget503020' && (
          <Budget503020Calc
            budgetConfig={budgetConfig}
            setBudgetConfig={setBudgetConfig}
            transactions={transactions}
            onUpdateCategoryBudget={updateCategoryBudget}
          />
        )}

        {/* TAB 5: BUKU KAS (SEMUA TRANSAKSI) */}
        {activeTab === 'transactions' && (
          <TransactionList
            transactions={transactions}
            onDeleteTransaction={deleteTransaction}
            onOpenAddModal={() => setIsAddModalOpen(true)}
            onExportCSV={exportCSV}
            defaultCategoryFilter={selectedCategoryFilter}
          />
        )}

        {/* TAB 6: STRUKTUR WEB ARSITEKTUR */}
        {activeTab === 'architecture' && <ArchitectureGuide />}
      </main>

      {/* Transaction Modal */}
      <TransactionFormModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddTransaction={addTransaction}
        goals={goals}
      />

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white border border-slate-700 px-4 py-2.5 rounded-xl shadow-2xl text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Dark Footer */}
      <footer className="mt-auto border-t border-slate-800/80 bg-slate-900/60 py-6 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-white tracking-wider">U<span className="text-emerald-400">ANG</span></span>
            <span aria-hidden="true" className="text-slate-600">·</span>
            <span>Penghitung Pengeluaran (Makan, Transport, Jajan, Keperluan, Game) & Tabungan</span>
          </div>

          <div className="flex items-center gap-4 font-medium">
            <label className="cursor-pointer hover:text-white transition-colors flex items-center gap-1">
              <Upload className="w-3.5 h-3.5" />
              <span>Impor JSON</span>
              <input
                type="file"
                accept=".json"
                onChange={handleImportFile}
                className="hidden"
              />
            </label>
            <button
              onClick={exportData}
              className="hover:text-white transition-colors flex items-center gap-1"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Cadangkan JSON</span>
            </button>
            <button
              onClick={handleReset}
              className="hover:text-rose-400 transition-colors flex items-center gap-1"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Data</span>
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
