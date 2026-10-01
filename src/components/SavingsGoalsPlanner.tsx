import React, { useState } from 'react';
import { SavingsGoal } from '../types/finance';
import { formatIDR, formatDateIndo, parseNumberInput } from '../utils/formatters';
import { calculateSavingsProjection, estimateMonthsToGoal, estimateDaysToGoal } from '../utils/calculations';
import { Target, TrendingUp, Calendar, Plus, Trash2, Coins, PiggyBank, Sparkles } from 'lucide-react';

interface SavingsGoalsPlannerProps {
  goals: SavingsGoal[];
  onAddGoal: (goal: Omit<SavingsGoal, 'id' | 'createdAt'>) => void;
  onDeleteGoal: (id: string) => void;
  onContribute: (goalId: string, amount: number, note?: string) => void;
}

export const SavingsGoalsPlanner: React.FC<SavingsGoalsPlannerProps> = ({
  goals,
  onAddGoal,
  onDeleteGoal,
  onContribute,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newTargetAmount, setNewTargetAmount] = useState('0');
  const [newCurrentAmount, setNewCurrentAmount] = useState('0');
  const [newDailyTarget, setNewDailyTarget] = useState('0');
  const [newDeadline, setNewDeadline] = useState('2027-12-31');
  const [newCategory, setNewCategory] = useState<SavingsGoal['category']>('other');
  const [newNotes, setNewNotes] = useState('');

  const [contributeGoalId, setContributeGoalId] = useState<string | null>(null);
  const [contributeAmount, setContributeAmount] = useState('0');

  const [simInitial, setSimInitial] = useState('0');
  const [simMonthly, setSimMonthly] = useState('0');
  const [simYears, setSimYears] = useState('3');
  const [simRate, setSimRate] = useState('6');

  const simResult = calculateSavingsProjection(
    parseNumberInput(simInitial),
    parseNumberInput(simMonthly),
    parseInt(simYears, 10) * 12,
    parseFloat(simRate) || 0
  );

  const handleCreateGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const dailyVal = parseNumberInput(newDailyTarget);
    onAddGoal({
      title: newTitle.trim(),
      targetAmount: parseNumberInput(newTargetAmount),
      currentAmount: parseNumberInput(newCurrentAmount),
      dailyTarget: dailyVal,
      monthlyTarget: dailyVal * 30,
      deadlineDate: newDeadline,
      category: newCategory,
      notes: newNotes.trim() || undefined,
    });

    setShowAddModal(false);
    setNewTitle('');
    setNewNotes('');
  };

  const handleQuickDeposit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contributeGoalId) return;
    const amount = parseNumberInput(contributeAmount);
    if (amount <= 0) return;

    onContribute(contributeGoalId, amount, `Setoran tabungan via planner`);
    setContributeGoalId(null);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Header */}
      <div className="bg-slate-900/90 p-5 sm:p-6 rounded-2xl border border-slate-800 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
              <span>Perencanaan Tabungan & Masa Depan</span>
              <span aria-hidden="true">·</span>
              <span>Target & Estimasi Waktu</span>
            </div>
            <h2 className="text-xl font-bold tracking-tight text-white">
              Target Tabungan & Rencana Investasi
            </h2>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl">
              Pantau akumulasi target tabungan spesifik Anda dan simulasikan potensi pertumbuhan dengan imbal hasil majemuk.
            </p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-xl shadow-md shadow-emerald-500/20 transition-all self-start sm:self-center"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Target Baru</span>
          </button>
        </div>
      </div>

      {/* Goals Grid */}
      {goals.length === 0 ? (
        <div className="bg-slate-900/60 p-8 sm:p-12 rounded-2xl border border-dashed border-slate-800 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-blue-950/80 border border-blue-800/40 text-blue-400 flex items-center justify-center mx-auto">
            <PiggyBank className="w-6 h-6" />
          </div>
          <div className="text-sm font-bold text-white">Belum Ada Target Tabungan</div>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Semua nominal bersih di angka 0. Buat target tabungan pertama Anda (Dana Darurat, PC/Gadget, atau Impian lainnya) untuk mulai melacak.
          </p>
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-xl shadow-md transition-all mt-2"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Target Tabungan</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {goals.map((goal) => {
          const progress = goal.targetAmount > 0 ? (goal.currentAmount / goal.targetAmount) * 100 : 0;
          const deficit = Math.max(0, goal.targetAmount - goal.currentAmount);
          const dailyTarget = goal.dailyTarget || Math.round((goal.monthlyTarget || 0) / 30);
          const timeEst = estimateDaysToGoal(goal.targetAmount, goal.currentAmount, dailyTarget);

          return (
            <div
              key={goal.id}
              className="bg-slate-900/90 p-5 rounded-2xl border border-slate-800 shadow-sm flex flex-col justify-between hover:border-slate-700 transition-all"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-sm font-bold text-white leading-snug">
                      {goal.title}
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
                      <span>Target: {formatDateIndo(goal.deadlineDate)}</span>
                      {goal.notes && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span className="truncate max-w-[130px]">{goal.notes}</span>
                        </>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => onDeleteGoal(goal.id)}
                    className="text-slate-500 hover:text-rose-400 p-1.5 hover:bg-rose-950/40 rounded-lg transition-colors"
                    title="Hapus target"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Progress bar */}
                <div className="mt-4 space-y-1.5">
                  <div className="flex justify-between items-baseline text-xs">
                    <span className="font-mono tabular-nums font-extrabold text-white text-lg">
                      {formatIDR(goal.currentAmount)}
                    </span>
                    <span className="text-slate-400 font-mono text-xs">
                      dari {formatIDR(goal.targetAmount)}
                    </span>
                  </div>

                  <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        progress >= 100 ? 'bg-emerald-400' : 'bg-blue-500'
                      }`}
                      style={{ width: `${Math.min(100, progress)}%` }}
                    />
                  </div>

                  <div className="flex justify-between items-center text-[11px] text-slate-400">
                    <span className="text-emerald-400 font-bold font-mono">{progress.toFixed(1)}% terkumpul</span>
                    <span>
                      {deficit === 0
                        ? 'Target tercapai!'
                        : `Kurang ${formatIDR(deficit)}`}
                    </span>
                  </div>
                </div>

                {/* Estimated Days to Goal */}
                <div className="mt-4 pt-3 border-t border-slate-800 text-xs text-slate-300 space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Setoran Rutin:</span>
                    <span className="font-mono font-medium text-white">
                      {formatIDR(dailyTarget)} <span className="text-[11px] text-slate-400">/ hari</span>
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Estimasi Selesai:</span>
                    <span className="font-mono font-bold text-emerald-400">
                      {timeEst.days === 0
                        ? 'Sudah Tercapai'
                        : `${timeEst.days} hari lagi (${(timeEst.days / 30).toFixed(1)} bln)`}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="mt-5 pt-3 border-t border-slate-800 flex items-center justify-between">
                <span className="text-[11px] text-slate-400 font-medium">
                  {progress >= 100 ? 'Lengkap' : 'Aktif'}
                </span>
                <button
                  onClick={() => {
                    setContributeGoalId(goal.id);
                    setContributeAmount(dailyTarget > 0 ? dailyTarget.toString() : '50000');
                  }}
                  className="px-3 py-1.5 text-xs font-bold text-emerald-400 bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-800/60 rounded-xl transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <Coins className="w-3.5 h-3.5" />
                  <span>Setor Tabungan</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
      )}

      {/* Simulator Bunga Majemuk / Compound Interest Projection */}
      <div className="bg-slate-900/90 p-5 sm:p-6 rounded-2xl border border-slate-800 shadow-sm">
        <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
          <span>Kalkulator Pertumbuhan Finansial</span>
          <span aria-hidden="true">·</span>
          <span>Compound Growth Simulator</span>
        </div>
        <h3 className="text-base font-bold tracking-tight text-white">
          Simulasi Pertumbuhan Tabungan & Investasi
        </h3>
        <p className="text-xs text-slate-400 mt-1 max-w-2xl">
          Lihat perbedaan signifikan antara menabung biasa (0%) vs menempatkannya pada instrumen imbal hasil (Reksadana / Deposito 4-8% p.a.).
        </p>

        {/* Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4 pt-4 border-t border-slate-800">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Saldo Awal (Modal)
            </label>
            <div className="flex items-center gap-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 focus-within:border-emerald-500">
              <span className="text-xs font-mono text-slate-500">Rp</span>
              <input
                type="text"
                value={simInitial}
                onChange={(e) => setSimInitial(e.target.value)}
                className="w-full bg-transparent font-mono text-xs font-bold text-white focus:outline-hidden"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Setoran Rutin Bulanan
            </label>
            <div className="flex items-center gap-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 focus-within:border-emerald-500">
              <span className="text-xs font-mono text-slate-500">Rp</span>
              <input
                type="text"
                value={simMonthly}
                onChange={(e) => setSimMonthly(e.target.value)}
                className="w-full bg-transparent font-mono text-xs font-bold text-white focus:outline-hidden"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Durasi Menabung (Tahun)
            </label>
            <select
              value={simYears}
              onChange={(e) => setSimYears(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-hidden"
            >
              <option value="1">1 Tahun (12 bulan)</option>
              <option value="2">2 Tahun (24 bulan)</option>
              <option value="3">3 Tahun (36 bulan)</option>
              <option value="5">5 Tahun (60 bulan)</option>
              <option value="10">10 Tahun (120 bulan)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Imbal Hasil Tahunan (% p.a.)
            </label>
            <select
              value={simRate}
              onChange={(e) => setSimRate(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-hidden"
            >
              <option value="0">0% (Celengan / Rekening Biasa)</option>
              <option value="4">4% (Deposito Bank Digital)</option>
              <option value="6">6% (Reksadana Pasar Uang / SBN)</option>
              <option value="8">8% (Reksadana Pendapatan Tetap)</option>
              <option value="12">12% (Reksadana Saham / Indeks)</option>
            </select>
          </div>
        </div>

        {/* Results summary banner */}
        <div className="mt-5 p-4 bg-slate-950 rounded-xl border border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <div className="text-xs text-slate-400">Total Modal Disetor Murni</div>
            <div className="text-lg font-bold font-mono tabular-nums mt-0.5 text-slate-300">
              {formatIDR(simResult.finalTotalSaved)}
            </div>
          </div>
          <div>
            <div className="text-xs text-emerald-400">Hasil Akhir Tabungan (Compound)</div>
            <div className="text-xl font-extrabold font-mono tabular-nums mt-0.5 text-white">
              {formatIDR(simResult.finalTotalWithInterest)}
            </div>
          </div>
          <div>
            <div className="text-xs text-blue-400">Bonus Keuntungan Imbal Hasil</div>
            <div className="text-lg font-bold font-mono tabular-nums mt-0.5 text-emerald-400">
              +{formatIDR(simResult.finalInterestEarned)}
            </div>
          </div>
        </div>
      </div>

      {/* Modal Quick Deposit */}
      {contributeGoalId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
          <div className="bg-slate-900 rounded-2xl max-w-sm w-full p-5 shadow-xl border border-slate-800">
            <h3 className="text-base font-bold text-white">Setor ke Tabungan</h3>
            <p className="text-xs text-slate-400 mt-1">
              Catat setoran tabungan Anda. Transaksi ini otomatis tercatat di arus kas dan menambah saldo target.
            </p>
            <form onSubmit={handleQuickDeposit} className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Nominal Setoran (Rp)
                </label>
                <input
                  type="text"
                  value={contributeAmount}
                  onChange={(e) => setContributeAmount(e.target.value)}
                  className="w-full font-mono text-sm font-bold bg-slate-950 text-white border border-slate-800 rounded-xl px-3 py-2 focus:ring-1 focus:ring-emerald-500 focus:outline-hidden"
                />
                <span className="text-[11px] text-emerald-400 font-mono mt-1 block">
                  {formatIDR(parseNumberInput(contributeAmount))}
                </span>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setContributeGoalId(null)}
                  className="px-3.5 py-1.5 text-xs font-semibold text-slate-400 hover:text-white rounded-lg"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-xl shadow-xs"
                >
                  Konfirmasi Setor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Add Goal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
          <div className="bg-slate-900 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-800">
            <h3 className="text-base font-bold text-white">Buat Target Tabungan Baru</h3>
            <p className="text-xs text-slate-400 mt-1">
              Tentukan tujuan finansial Anda agar motivasi menabung tetap konsisten.
            </p>

            <form onSubmit={handleCreateGoal} className="mt-4 space-y-3.5">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Nama Target</label>
                <input
                  type="text"
                  required
                  placeholder="Misal: PC Gaming Baru, Dana Darurat, Umroh"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full text-xs bg-slate-950 border border-slate-800 text-white rounded-xl px-3 py-2 focus:ring-1 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Target Nominal (Rp)</label>
                  <input
                    type="text"
                    required
                    value={newTargetAmount}
                    onChange={(e) => setNewTargetAmount(e.target.value)}
                    className="w-full text-xs font-mono bg-slate-950 border border-slate-800 text-white rounded-xl px-3 py-2 focus:ring-1 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Saldo Awal (Rp)</label>
                  <input
                    type="text"
                    value={newCurrentAmount}
                    onChange={(e) => setNewCurrentAmount(e.target.value)}
                    className="w-full text-xs font-mono bg-slate-950 border border-slate-800 text-white rounded-xl px-3 py-2 focus:ring-1 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-medium text-slate-300">Setoran Rutin Harian</label>
                    <span className="text-[10px] text-emerald-400 font-mono font-bold">/ hari</span>
                  </div>
                  <input
                    type="text"
                    required
                    placeholder="Misal: 10.000"
                    value={newDailyTarget}
                    onChange={(e) => setNewDailyTarget(e.target.value)}
                    className="w-full text-xs font-mono bg-slate-950 border border-emerald-500/50 text-white rounded-xl px-3 py-2 focus:ring-1 focus:ring-emerald-500 focus:outline-hidden"
                  />
                  {parseNumberInput(newDailyTarget) > 0 && (
                    <span className="text-[10px] text-slate-400 block mt-1">
                      ≈ {formatIDR(parseNumberInput(newDailyTarget) * 30)} / bulan
                    </span>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Batas Waktu (Deadline)</label>
                  <input
                    type="date"
                    required
                    value={newDeadline}
                    onChange={(e) => setNewDeadline(e.target.value)}
                    className="w-full text-xs bg-slate-950 border border-slate-800 text-white rounded-xl px-3 py-2 focus:ring-1 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Kategori</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as any)}
                  className="w-full text-xs bg-slate-950 border border-slate-800 text-white rounded-xl px-3 py-2 focus:ring-1 focus:ring-emerald-500 focus:outline-hidden"
                >
                  <option value="game">Gaming & Setup PC</option>
                  <option value="emergency">Dana Darurat</option>
                  <option value="house">Properti / Rumah</option>
                  <option value="vehicle">Kendaraan</option>
                  <option value="gadget">Gadget & Elektronik</option>
                  <option value="travel">Liburan & Travel</option>
                  <option value="investment">Investasi</option>
                  <option value="other">Tujuan Lainnya</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Catatan Tambahan</label>
                <input
                  type="text"
                  placeholder="Misal: Disimpan di RDPU atau rekening terpisah"
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  className="w-full text-xs bg-slate-950 border border-slate-800 text-white rounded-xl px-3 py-2 focus:ring-1 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3.5 py-1.5 text-xs font-semibold text-slate-400 hover:text-white rounded-lg"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-xl shadow-xs"
                >
                  Simpan Target
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
