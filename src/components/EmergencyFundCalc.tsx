import React, { useState } from 'react';
import { EmergencyFundConfig, MaritalStatus } from '../types/finance';
import { calculateEmergencyFundTarget } from '../utils/calculations';
import { formatIDR, parseNumberInput } from '../utils/formatters';
import { ShieldCheck, ShieldAlert, Info } from 'lucide-react';

interface EmergencyFundCalcProps {
  emergencyConfig: EmergencyFundConfig;
  setEmergencyConfig: React.Dispatch<React.SetStateAction<EmergencyFundConfig>>;
  actualMonthlyExpense: number;
}

export const EmergencyFundCalc: React.FC<EmergencyFundCalcProps> = ({
  emergencyConfig,
  setEmergencyConfig,
  actualMonthlyExpense,
}) => {
  const [expenseInput, setExpenseInput] = useState(
    emergencyConfig.monthlyExpense.toString()
  );
  const [currentSavingsInput, setCurrentSavingsInput] = useState(
    emergencyConfig.currentSavings.toString()
  );

  const targetInfo = calculateEmergencyFundTarget(
    emergencyConfig.monthlyExpense,
    emergencyConfig.status,
    emergencyConfig.customMonths
  );

  const deficit = Math.max(0, targetInfo.targetAmount - emergencyConfig.currentSavings);
  const fundedPercentage = targetInfo.targetAmount > 0
    ? (emergencyConfig.currentSavings / targetInfo.targetAmount) * 100
    : 0;

  const monthsCovered = emergencyConfig.monthlyExpense > 0
    ? (emergencyConfig.currentSavings / emergencyConfig.monthlyExpense).toFixed(1)
    : '0';

  const handleExpenseBlur = () => {
    const val = parseNumberInput(expenseInput);
    setEmergencyConfig((prev) => ({ ...prev, monthlyExpense: val }));
  };

  const handleSavingsBlur = () => {
    const val = parseNumberInput(currentSavingsInput);
    setEmergencyConfig((prev) => ({ ...prev, currentSavings: val }));
  };

  const handleStatusChange = (status: MaritalStatus) => {
    let customMonths = 6;
    if (status === 'single') customMonths = 4;
    else if (status === 'married_no_kids') customMonths = 6;
    else if (status === 'married_with_kids') customMonths = 9;
    else if (status === 'freelancer') customMonths = 12;

    setEmergencyConfig((prev) => ({ ...prev, status, customMonths }));
  };

  const syncWithActualExpense = () => {
    if (actualMonthlyExpense > 0) {
      setExpenseInput(actualMonthlyExpense.toString());
      setEmergencyConfig((prev) => ({ ...prev, monthlyExpense: actualMonthlyExpense }));
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900/90 p-5 sm:p-6 rounded-2xl border border-slate-800 shadow-sm">
        <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
          <span>Fondasi Ketahanan Finansial</span>
          <span aria-hidden="true">·</span>
          <span>Emergency Fund Calculator</span>
        </div>
        <h2 className="text-xl font-bold tracking-tight text-white">
          Kalkulator Dana Darurat Ideal
        </h2>
        <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
          Dana darurat adalah uang likuid yang dipersiapkan khusus untuk menghadapi krisis tak terduga seperti sakit, kehilangan pekerjaan, atau bencana mendesak.
        </p>
      </div>

      {/* Grid Inputs & Target Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Configuration Panel */}
        <div className="lg:col-span-2 bg-slate-900/90 p-5 sm:p-6 rounded-2xl border border-slate-800 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-white">1. Parameter Profil Risiko Anda</h3>

          {/* Profil Pilihan */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-2">
              Status Keluarga & Profil Pekerjaan:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => handleStatusChange('single')}
                className={`p-3 text-left rounded-xl border text-xs transition-colors ${
                  emergencyConfig.status === 'single'
                    ? 'border-emerald-500 bg-emerald-950/60 text-white'
                    : 'border-slate-800 hover:border-slate-700 bg-slate-950/70 text-slate-300'
                }`}
              >
                <div className="font-bold text-white">Lajang (Single)</div>
                <div className="text-[11px] mt-0.5 text-slate-400">
                  Ideal 3 - 6x pengeluaran bulanan
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleStatusChange('married_no_kids')}
                className={`p-3 text-left rounded-xl border text-xs transition-colors ${
                  emergencyConfig.status === 'married_no_kids'
                    ? 'border-emerald-500 bg-emerald-950/60 text-white'
                    : 'border-slate-800 hover:border-slate-700 bg-slate-950/70 text-slate-300'
                }`}
              >
                <div className="font-bold text-white">Menikah (Tanpa Anak)</div>
                <div className="text-[11px] mt-0.5 text-slate-400">
                  Ideal 6x pengeluaran keluarga
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleStatusChange('married_with_kids')}
                className={`p-3 text-left rounded-xl border text-xs transition-colors ${
                  emergencyConfig.status === 'married_with_kids'
                    ? 'border-emerald-500 bg-emerald-950/60 text-white'
                    : 'border-slate-800 hover:border-slate-700 bg-slate-950/70 text-slate-300'
                }`}
              >
                <div className="font-bold text-white">Menikah (Dengan Anak)</div>
                <div className="text-[11px] mt-0.5 text-slate-400">
                  Ideal 9 - 12x pengeluaran keluarga
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleStatusChange('freelancer')}
                className={`p-3 text-left rounded-xl border text-xs transition-colors ${
                  emergencyConfig.status === 'freelancer'
                    ? 'border-emerald-500 bg-emerald-950/60 text-white'
                    : 'border-slate-800 hover:border-slate-700 bg-slate-950/70 text-slate-300'
                }`}
              >
                <div className="font-bold text-white">Freelancer / Bisnis</div>
                <div className="text-[11px] mt-0.5 text-slate-400">
                  Ideal 12x karena arus kas fluktuatif
                </div>
              </button>
            </div>
          </div>

          {/* Pengeluaran Bulanan */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-slate-800">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-400">
                  Rata-rata Pengeluaran Bulanan (Rp)
                </label>
                {actualMonthlyExpense > 0 && (
                  <button
                    type="button"
                    onClick={syncWithActualExpense}
                    className="text-[11px] text-emerald-400 hover:underline font-semibold"
                  >
                    Gunakan Real ({formatIDR(actualMonthlyExpense)})
                  </button>
                )}
              </div>
              <input
                type="text"
                value={expenseInput}
                onChange={(e) => setExpenseInput(e.target.value)}
                onBlur={handleExpenseBlur}
                className="w-full text-xs font-mono font-bold bg-slate-950 border border-slate-800 text-white rounded-xl px-3 py-2.5 focus:ring-1 focus:ring-emerald-500 focus:outline-hidden"
              />
              <span className="text-[11px] text-slate-400 font-mono mt-1 block">
                {formatIDR(parseNumberInput(expenseInput))}
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">
                Dana Darurat Saat Ini Tersimpan (Rp)
              </label>
              <input
                type="text"
                value={currentSavingsInput}
                onChange={(e) => setCurrentSavingsInput(e.target.value)}
                onBlur={handleSavingsBlur}
                className="w-full text-xs font-mono font-bold bg-slate-950 border border-slate-800 text-white rounded-xl px-3 py-2.5 focus:ring-1 focus:ring-emerald-500 focus:outline-hidden"
              />
              <span className="text-[11px] text-slate-400 font-mono mt-1 block">
                {formatIDR(parseNumberInput(currentSavingsInput))}
              </span>
            </div>
          </div>

          {/* Slider durasi cadangan */}
          <div className="pt-3 border-t border-slate-800">
            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold text-slate-300">
                Target Durasi Cadangan Hidup:
              </span>
              <span className="font-mono font-bold text-emerald-400">
                {emergencyConfig.customMonths || targetInfo.recommendedMonths} Bulan
              </span>
            </div>
            <input
              type="range"
              min="3"
              max="24"
              value={emergencyConfig.customMonths || targetInfo.recommendedMonths}
              onChange={(e) =>
                setEmergencyConfig((prev) => ({
                  ...prev,
                  customMonths: Number(e.target.value),
                }))
              }
              className="w-full accent-emerald-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer mt-2"
            />
            <div className="flex justify-between text-[11px] text-slate-500 font-mono mt-1">
              <span>3 bln (Minimal)</span>
              <span>6 bln (Standar)</span>
              <span>12 bln (Aman)</span>
              <span>24 bln (Ultra Aman)</span>
            </div>
          </div>
        </div>

        {/* Diagnosis & Goal Status Card */}
        <div className="bg-slate-900/90 p-5 sm:p-6 rounded-2xl border border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              {fundedPercentage >= 100 ? (
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
              ) : (
                <ShieldAlert className="w-5 h-5 text-amber-400" />
              )}
              <h3 className="text-sm font-bold text-white">Kesiapan Dana Darurat</h3>
            </div>

            <div className="mt-3">
              <div className="text-xs text-slate-400">Target Total yang Dibutuhkan</div>
              <div className="text-2xl font-extrabold font-mono tabular-nums text-white mt-0.5">
                {formatIDR(targetInfo.targetAmount)}
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                {targetInfo.description}
              </p>
            </div>

            {/* Gauge progress */}
            <div className="mt-4 pt-3 border-t border-slate-800 space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Ketahanan Saat Ini:</span>
                <span className="font-mono font-bold text-white">{monthsCovered} Bulan</span>
              </div>
              <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    fundedPercentage >= 100 ? 'bg-emerald-400' : 'bg-amber-400'
                  }`}
                  style={{ width: `${Math.min(100, fundedPercentage)}%` }}
                />
              </div>
              <div className="flex justify-between text-[11px] text-slate-400">
                <span className="font-mono text-emerald-400 font-bold">{fundedPercentage.toFixed(1)}% terpenuhi</span>
                <span className={deficit === 0 ? 'text-emerald-400 font-semibold' : 'text-amber-400'}>
                  {deficit === 0 ? 'Lengkap & Aman' : `Kurang ${formatIDR(deficit)}`}
                </span>
              </div>
            </div>

            {/* Recommendation monthly breakdown */}
            {deficit > 0 && (
              <div className="mt-4 p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs space-y-1.5">
                <div className="font-semibold text-slate-200">Saran Setoran Bulanan:</div>
                <div className="flex justify-between text-slate-400">
                  <span>Selesai 6 bulan:</span>
                  <span className="font-mono font-bold text-white">{formatIDR(Math.round(deficit / 6))}/bln</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Selesai 12 bulan:</span>
                  <span className="font-mono font-bold text-white">{formatIDR(Math.round(deficit / 12))}/bln</span>
                </div>
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-400 flex items-start gap-1.5">
            <Info className="w-3.5 h-3.5 shrink-0 text-slate-500 mt-0.5" />
            <span>Simpan di instrumen likuid tanpa penalti pencairan (RDPU / bank digital).</span>
          </div>
        </div>
      </div>
    </div>
  );
};
