import React, { useState, useEffect } from 'react';
import { BudgetConfig, Transaction, CategoryBudgetMap } from '../types/finance';
import { calculate503020 } from '../utils/calculations';
import { formatIDR, parseNumberInput } from '../utils/formatters';
import { Sliders, AlertTriangle, Utensils, Car, Coffee, Package, Gamepad2 } from 'lucide-react';

interface Budget503020CalcProps {
  budgetConfig: BudgetConfig;
  setBudgetConfig: React.Dispatch<React.SetStateAction<BudgetConfig>>;
  transactions: Transaction[];
  onUpdateCategoryBudget?: (key: keyof CategoryBudgetMap, val: number) => void;
}

export const Budget503020Calc: React.FC<Budget503020CalcProps> = ({
  budgetConfig,
  setBudgetConfig,
  transactions,
}) => {
  const [incomeInput, setIncomeInput] = useState<string>(
    budgetConfig.monthlyIncome ? budgetConfig.monthlyIncome.toString() : '0'
  );
  const [selectedPreset, setSelectedPreset] = useState<'standard' | 'family' | 'fire' | 'custom'>('standard');

  const [budgetInputs, setBudgetInputs] = useState<CategoryBudgetMap>(budgetConfig.categoryBudgets);

  useEffect(() => {
    setIncomeInput(budgetConfig.monthlyIncome ? budgetConfig.monthlyIncome.toString() : '0');
    setBudgetInputs(budgetConfig.categoryBudgets);
  }, [budgetConfig.monthlyIncome, budgetConfig.categoryBudgets]);

  const result = calculate503020(budgetConfig.monthlyIncome, budgetConfig, transactions);

  const applyPreset = (preset: 'standard' | 'family' | 'fire') => {
    setSelectedPreset(preset);
    if (preset === 'standard') {
      setBudgetConfig((prev) => ({ ...prev, needsRatio: 50, wantsRatio: 30, savingsRatio: 20 }));
    } else if (preset === 'family') {
      setBudgetConfig((prev) => ({ ...prev, needsRatio: 60, wantsRatio: 20, savingsRatio: 20 }));
    } else if (preset === 'fire') {
      setBudgetConfig((prev) => ({ ...prev, needsRatio: 40, wantsRatio: 20, savingsRatio: 40 }));
    }
  };

  const handleIncomeBlur = () => {
    const parsed = parseNumberInput(incomeInput);
    setBudgetConfig((prev) => ({ ...prev, monthlyIncome: parsed }));
  };

  const handleCategoryBudgetChange = (cat: keyof CategoryBudgetMap, value: string) => {
    const num = parseNumberInput(value);
    setBudgetInputs((prev) => ({ ...prev, [cat]: num }));
    setBudgetConfig((prev) => ({
      ...prev,
      categoryBudgets: {
        ...prev.categoryBudgets,
        [cat]: num,
      },
    }));
  };

  const handleRatioChange = (key: 'needsRatio' | 'wantsRatio' | 'savingsRatio', value: number) => {
    setSelectedPreset('custom');
    setBudgetConfig((prev) => {
      const next = { ...prev, [key]: value };
      return next;
    });
  };

  const totalRatios = budgetConfig.needsRatio + budgetConfig.wantsRatio + budgetConfig.savingsRatio;

  const categorySpent: Record<string, number> = {
    makan: 0,
    transportasi: 0,
    jajan: 0,
    keperluan: 0,
    game: 0,
  };

  for (const t of transactions) {
    if (t.type === 'expense' && categorySpent[t.category] !== undefined) {
      categorySpent[t.category] += t.amount;
    }
  }

  const budgetItems = [
    { key: 'makan' as const, label: 'Biaya Makan', group: 'Kebutuhan (Needs)', icon: <Utensils className="w-4 h-4 text-orange-400" />, color: '#f97316' },
    { key: 'transportasi' as const, label: 'Transportasi', group: 'Kebutuhan (Needs)', icon: <Car className="w-4 h-4 text-sky-400" />, color: '#38bdf8' },
    { key: 'keperluan' as const, label: 'Keperluan', group: 'Kebutuhan (Needs)', icon: <Package className="w-4 h-4 text-purple-400" />, color: '#c084fc' },
    { key: 'jajan' as const, label: 'Jajan & Kopi', group: 'Keinginan (Wants)', icon: <Coffee className="w-4 h-4 text-rose-400" />, color: '#fb7185' },
    { key: 'game' as const, label: 'Game & Top-up', group: 'Keinginan (Wants)', icon: <Gamepad2 className="w-4 h-4 text-emerald-400" />, color: '#34d399' },
  ];

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="bg-slate-900/90 p-5 sm:p-6 rounded-2xl border border-slate-800 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
              <span>Metodologi Alokasi Anggaran</span>
              <span aria-hidden="true">·</span>
              <span>Kalkulator Pengeluaran & Tabungan</span>
            </div>
            <h2 className="text-xl font-bold tracking-tight text-white">
              Alokasi Anggaran Bulanan & 5 Pos Pengeluaran
            </h2>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
              Atur batas anggaran maksimal untuk <strong>Biaya Makan, Transportasi, Jajan, Keperluan, dan Game</strong>, serta seimbangkan dengan persentase tabungan Anda.
            </p>
          </div>

          {/* Income input */}
          <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 shrink-0">
            <label className="block text-xs font-semibold text-slate-400 mb-1">
              Pendapatan Bulanan Bersih
            </label>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-mono font-medium text-slate-500">Rp</span>
              <input
                type="text"
                value={incomeInput}
                onChange={(e) => setIncomeInput(e.target.value)}
                onBlur={handleIncomeBlur}
                className="w-36 font-mono text-sm font-bold text-white bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 focus:ring-1 focus:ring-emerald-500 focus:outline-hidden"
                placeholder="9000000"
              />
            </div>
            <span className="block text-[11px] text-emerald-400 mt-1 font-mono font-medium">
              Terbaca: {formatIDR(parseNumberInput(incomeInput))}
            </span>
          </div>
        </div>

        {/* Preset Selector */}
        <div className="mt-4 pt-4 border-t border-slate-800 flex flex-wrap items-center gap-2">
          <span className="text-xs text-slate-400 font-medium mr-1">Rekomendasi Pola:</span>
          <button
            onClick={() => applyPreset('standard')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors border ${
              selectedPreset === 'standard' && budgetConfig.needsRatio === 50
                ? 'bg-emerald-500 text-slate-950 border-emerald-400 font-bold'
                : 'bg-slate-800/80 text-slate-300 border-slate-700 hover:bg-slate-700'
            }`}
          >
            Standar 50/30/20
          </button>
          <button
            onClick={() => applyPreset('family')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors border ${
              selectedPreset === 'family' && budgetConfig.needsRatio === 60
                ? 'bg-emerald-500 text-slate-950 border-emerald-400 font-bold'
                : 'bg-slate-800/80 text-slate-300 border-slate-700 hover:bg-slate-700'
            }`}
          >
            Keluarga / Cicilan (60/20/20)
          </button>
          <button
            onClick={() => applyPreset('fire')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors border ${
              selectedPreset === 'fire' && budgetConfig.savingsRatio === 40
                ? 'bg-emerald-500 text-slate-950 border-emerald-400 font-bold'
                : 'bg-slate-800/80 text-slate-300 border-slate-700 hover:bg-slate-700'
            }`}
          >
            Investasi Agresif / FIRE (40/20/40)
          </button>
        </div>

        {totalRatios !== 100 && (
          <div className="mt-3 p-2.5 bg-amber-950/60 border border-amber-800/50 rounded-xl text-xs text-amber-300 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400" />
            <span>Total persentase saat ini adalah {totalRatios}%. Disarankan berjumlah 100%.</span>
          </div>
        )}
      </div>

      {/* 5 Pos Pengeluaran: Batas Anggaran & Realisasi Langsung */}
      <div className="bg-slate-900/90 p-5 sm:p-6 rounded-2xl border border-slate-800 shadow-sm">
        <h3 className="text-sm font-bold text-white mb-1">
          Batas Anggaran Khusus 5 Pos Pengeluaran
        </h3>
        <p className="text-xs text-slate-400 mb-4">
          Tentukan batasan uang yang boleh keluar untuk masing-masing pos dalam satu bulan
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {budgetItems.map((item) => {
            const spent = categorySpent[item.key] || 0;
            const currentBudget = budgetInputs[item.key] || 0;
            const isOver = currentBudget > 0 && spent > currentBudget;
            const usagePercent = currentBudget > 0 ? (spent / currentBudget) * 100 : 0;

            return (
              <div key={item.key} className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="p-1.5 rounded-lg bg-slate-900 border border-slate-800">{item.icon}</span>
                    <div>
                      <div className="text-xs font-bold text-white">{item.label}</div>
                      <div className="text-[10px] text-slate-400">{item.group}</div>
                    </div>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                      isOver
                        ? 'bg-rose-950 border-rose-800/50 text-rose-400'
                        : 'bg-emerald-950 border border-emerald-800/50 text-emerald-400'
                    }`}
                  >
                    {isOver ? 'Overbudget' : `${usagePercent.toFixed(0)}% terpakai`}
                  </span>
                </div>

                {/* Input limit */}
                <div>
                  <label className="text-[11px] text-slate-400 font-medium block mb-1">
                    Batas Maksimal Bulanan:
                  </label>
                  <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-700/80 rounded-lg px-2.5 py-1.5 focus-within:ring-1 focus-within:ring-emerald-500">
                    <span className="text-xs font-mono text-slate-500">Rp</span>
                    <input
                      type="text"
                      value={currentBudget}
                      onChange={(e) => handleCategoryBudgetChange(item.key, e.target.value)}
                      className="w-full text-xs font-mono font-bold text-white bg-transparent focus:outline-hidden"
                    />
                  </div>
                </div>

                {/* Progress bar */}
                <div className="space-y-1">
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        isOver ? 'bg-rose-500' : ''
                      }`}
                      style={{
                        backgroundColor: isOver ? '#ef4444' : item.color,
                        width: `${Math.min(100, usagePercent)}%`,
                      }}
                    />
                  </div>
                  <div className="flex justify-between items-center text-[10px] font-mono text-slate-400">
                    <span>Terpakai: {formatIDR(spent)}</span>
                    <span className={isOver ? 'text-rose-400 font-bold' : ''}>
                      {isOver ? `+${formatIDR(spent - currentBudget)}` : `Sisa ${formatIDR(currentBudget - spent)}`}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3 Pillar Comparison Cards (Needs, Wants, Savings) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
        {/* Needs (Kebutuhan 50%) */}
        <div className="bg-slate-900/90 p-5 rounded-2xl border border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-sky-400 uppercase tracking-wider">
                Kebutuhan (Makan, Transport, Keperluan)
              </span>
              <span className="text-xs font-mono font-semibold text-slate-400">
                {budgetConfig.needsRatio}%
              </span>
            </div>
            <div className="mt-2 text-2xl font-bold font-mono tabular-nums text-white">
              {formatIDR(result.needsTarget)}
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Batas total pengeluaran primer esensial Anda.
            </p>

            <div className="mt-4 pt-3 border-t border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Realisasi Tercatat:</span>
                <span className="font-mono font-semibold text-white">
                  {formatIDR(result.needsActual)}
                </span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    result.needsActual > result.needsTarget ? 'bg-rose-500' : 'bg-sky-400'
                  }`}
                  style={{
                    width: `${Math.min(100, result.needsTarget > 0 ? (result.needsActual / result.needsTarget) * 100 : 0)}%`,
                  }}
                />
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span>
                  {result.needsTarget > 0
                    ? `${((result.needsActual / result.needsTarget) * 100).toFixed(0)}% terpakai`
                    : '0%'}
                </span>
                <span className={result.needsActual > result.needsTarget ? 'text-rose-400 font-medium' : 'text-emerald-400 font-medium'}>
                  {result.needsActual > result.needsTarget
                    ? `Overbudget ${formatIDR(result.needsActual - result.needsTarget)}`
                    : `Sisa ${formatIDR(result.needsTarget - result.needsActual)}`}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800">
            <label className="text-[11px] text-slate-400 font-medium flex items-center justify-between">
              <span>Sesuaikan Rasio (%):</span>
              <span className="font-mono font-bold text-white">{budgetConfig.needsRatio}%</span>
            </label>
            <input
              type="range"
              min="20"
              max="80"
              value={budgetConfig.needsRatio}
              onChange={(e) => handleRatioChange('needsRatio', Number(e.target.value))}
              className="w-full accent-sky-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer mt-1"
            />
          </div>
        </div>

        {/* Wants (Keinginan 30%: Jajan & Game) */}
        <div className="bg-slate-900/90 p-5 rounded-2xl border border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-purple-400 uppercase tracking-wider">
                Keinginan (Jajan & Game)
              </span>
              <span className="text-xs font-mono font-semibold text-slate-400">
                {budgetConfig.wantsRatio}%
              </span>
            </div>
            <div className="mt-2 text-2xl font-bold font-mono tabular-nums text-white">
              {formatIDR(result.wantsTarget)}
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Batas belanja kopi/boba, nongkrong, top-up game & Steam.
            </p>

            <div className="mt-4 pt-3 border-t border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Realisasi Tercatat:</span>
                <span className="font-mono font-semibold text-white">
                  {formatIDR(result.wantsActual)}
                </span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    result.wantsActual > result.wantsTarget ? 'bg-rose-500' : 'bg-purple-400'
                  }`}
                  style={{
                    width: `${Math.min(100, result.wantsTarget > 0 ? (result.wantsActual / result.wantsTarget) * 100 : 0)}%`,
                  }}
                />
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span>
                  {result.wantsTarget > 0
                    ? `${((result.wantsActual / result.wantsTarget) * 100).toFixed(0)}% terpakai`
                    : '0%'}
                </span>
                <span className={result.wantsActual > result.wantsTarget ? 'text-rose-400 font-medium' : 'text-emerald-400 font-medium'}>
                  {result.wantsActual > result.wantsTarget
                    ? `Overbudget ${formatIDR(result.wantsActual - result.wantsTarget)}`
                    : `Sisa ${formatIDR(result.wantsTarget - result.wantsActual)}`}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800">
            <label className="text-[11px] text-slate-400 font-medium flex items-center justify-between">
              <span>Sesuaikan Rasio (%):</span>
              <span className="font-mono font-bold text-white">{budgetConfig.wantsRatio}%</span>
            </label>
            <input
              type="range"
              min="5"
              max="50"
              value={budgetConfig.wantsRatio}
              onChange={(e) => handleRatioChange('wantsRatio', Number(e.target.value))}
              className="w-full accent-purple-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer mt-1"
            />
          </div>
        </div>

        {/* Savings (Tabungan 20%) */}
        <div className="bg-slate-900/90 p-5 rounded-2xl border border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                Tabungan & Investasi (Savings)
              </span>
              <span className="text-xs font-mono font-semibold text-slate-400">
                {budgetConfig.savingsRatio}%
              </span>
            </div>
            <div className="mt-2 text-2xl font-bold font-mono tabular-nums text-white">
              {formatIDR(result.savingsTarget)}
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Top up dana darurat, tabungan masa depan, & tabungan gadget/PC.
            </p>

            <div className="mt-4 pt-3 border-t border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Telah Disimpan:</span>
                <span className="font-mono font-semibold text-white">
                  {formatIDR(result.savingsActual)}
                </span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full bg-emerald-400 transition-all duration-300"
                  style={{
                    width: `${Math.min(100, result.savingsTarget > 0 ? (result.savingsActual / result.savingsTarget) * 100 : 0)}%`,
                  }}
                />
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span>
                  {result.savingsTarget > 0
                    ? `${((result.savingsActual / result.savingsTarget) * 100).toFixed(0)}% terpenuhi`
                    : '0%'}
                </span>
                <span className={result.savingsActual >= result.savingsTarget ? 'text-emerald-400 font-semibold' : 'text-blue-400'}>
                  {result.savingsActual >= result.savingsTarget
                    ? 'Target Terlampaui!'
                    : `Kurang ${formatIDR(result.savingsTarget - result.savingsActual)}`}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800">
            <label className="text-[11px] text-slate-400 font-medium flex items-center justify-between">
              <span>Sesuaikan Rasio (%):</span>
              <span className="font-mono font-bold text-white">{budgetConfig.savingsRatio}%</span>
            </label>
            <input
              type="range"
              min="10"
              max="60"
              value={budgetConfig.savingsRatio}
              onChange={(e) => handleRatioChange('savingsRatio', Number(e.target.value))}
              className="w-full accent-emerald-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer mt-1"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
