import React, { useState } from 'react';
import { TransactionType, CategoryId, PaymentMethod, SavingsGoal } from '../types/finance';
import { CATEGORIES, PAYMENT_METHODS } from '../constants/categories';
import { formatIDR, parseNumberInput } from '../utils/formatters';
import { X, Utensils, Car, Coffee, Package, Gamepad2 } from 'lucide-react';

interface TransactionFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddTransaction: (tx: {
    type: TransactionType;
    amount: number;
    category: CategoryId;
    description: string;
    date: string;
    paymentMethod: PaymentMethod;
    savingsGoalId?: string;
  }) => void;
  goals: SavingsGoal[];
}

export const TransactionFormModal: React.FC<TransactionFormModalProps> = ({
  isOpen,
  onClose,
  onAddTransaction,
  goals,
}) => {
  const [type, setType] = useState<TransactionType>('expense');
  const [amountStr, setAmountStr] = useState('');
  const [category, setCategory] = useState<CategoryId>('makan');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('qris');
  const [selectedGoalId, setSelectedGoalId] = useState<string>(() => (goals.length > 0 ? goals[0].id : ''));

  if (!isOpen) return null;

  const availableCategories = Object.values(CATEGORIES).filter((c) => c.type === type);

  const handleTypeChange = (newType: TransactionType) => {
    setType(newType);
    setSelectedGoalId(goals.length > 0 ? goals[0].id : '');
    if (newType === 'expense') setCategory('makan');
    else if (newType === 'income') setCategory('gaji');
    else if (newType === 'savings') setCategory('tabungan_utama');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseNumberInput(amountStr);
    if (amount <= 0) return;

    onAddTransaction({
      type,
      amount,
      category,
      description: description.trim() || availableCategories.find((c) => c.id === category)?.label || '',
      date,
      paymentMethod,
      savingsGoalId: selectedGoalId ? selectedGoalId : undefined,
    });

    setAmountStr('');
    setDescription('');
    setSelectedGoalId('');
    onClose();
  };

  const quickExpenseCategories: { id: CategoryId; label: string; icon: React.ReactNode; color: string }[] = [
    { id: 'makan', label: 'Makan', icon: <Utensils className="w-3.5 h-3.5" />, color: '#f97316' },
    { id: 'transportasi', label: 'Transport', icon: <Car className="w-3.5 h-3.5" />, color: '#38bdf8' },
    { id: 'jajan', label: 'Jajan', icon: <Coffee className="w-3.5 h-3.5" />, color: '#fb7185' },
    { id: 'keperluan', label: 'Keperluan', icon: <Package className="w-3.5 h-3.5" />, color: '#c084fc' },
    { id: 'game', label: 'Game', icon: <Gamepad2 className="w-3.5 h-3.5" />, color: '#34d399' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4">
      <div className="bg-slate-900 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-800">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <h3 className="text-base font-bold text-white">Catat Transaksi Baru</h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {/* Transaction Type Switch */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5">
              Jenis Transaksi
            </label>
            <div className="grid grid-cols-3 gap-1 p-1 bg-slate-950 border border-slate-800 rounded-xl">
              <button
                type="button"
                onClick={() => handleTypeChange('expense')}
                className={`py-1.5 text-xs font-bold rounded-lg transition-colors ${
                  type === 'expense'
                    ? 'bg-rose-500 text-white shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Pengeluaran
              </button>
              <button
                type="button"
                onClick={() => handleTypeChange('savings')}
                className={`py-1.5 text-xs font-bold rounded-lg transition-colors ${
                  type === 'savings'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Setor Tabungan
              </button>
              <button
                type="button"
                onClick={() => handleTypeChange('income')}
                className={`py-1.5 text-xs font-bold rounded-lg transition-colors ${
                  type === 'income'
                    ? 'bg-emerald-500 text-slate-950 font-extrabold shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Pemasukan
              </button>
            </div>
          </div>

          {/* Quick Expense Categories if Expense */}
          {type === 'expense' && (
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                Pilih Pos Pengeluaran:
              </label>
              <div className="grid grid-cols-5 gap-1.5">
                {quickExpenseCategories.map((qc) => {
                  const isSelected = category === qc.id;
                  return (
                    <button
                      key={qc.id}
                      type="button"
                      onClick={() => setCategory(qc.id)}
                      className={`flex flex-col items-center justify-center p-2 rounded-xl border text-xs transition-colors ${
                        isSelected
                          ? 'border-emerald-500 bg-emerald-950/70 text-white font-bold'
                          : 'border-slate-800 bg-slate-950/70 text-slate-400 hover:bg-slate-800'
                      }`}
                    >
                      <span style={{ color: qc.color }}>{qc.icon}</span>
                      <span className="text-[10px] mt-1 truncate">{qc.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Amount input */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">
              Nominal (Rupiah)
            </label>
            <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 focus-within:ring-1 focus-within:ring-emerald-500">
              <span className="text-xs font-mono font-bold text-slate-500">Rp</span>
              <input
                type="text"
                required
                autoFocus
                placeholder="Misal: 35000"
                value={amountStr}
                onChange={(e) => setAmountStr(e.target.value)}
                className="w-full bg-transparent font-mono text-sm font-bold text-white focus:outline-hidden"
              />
            </div>
            {amountStr && (
              <span className="text-[11px] text-emerald-400 font-mono mt-1 block">
                Terbaca: {formatIDR(parseNumberInput(amountStr))}
              </span>
            )}
          </div>

          {/* Category selection dropdown if not expense */}
          {type !== 'expense' && (
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">
                Kategori Pos
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as CategoryId)}
                className="w-full text-xs bg-slate-950 border border-slate-800 text-white rounded-xl px-3 py-2.5 focus:ring-1 focus:ring-emerald-500 focus:outline-hidden"
              >
                {availableCategories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Optional Goal link if savings */}
          {type === 'savings' && goals.length > 0 && (
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">
                Alokasikan ke Target Tabungan (Opsional)
              </label>
              <select
                value={selectedGoalId}
                onChange={(e) => setSelectedGoalId(e.target.value)}
                className="w-full text-xs bg-slate-950 border border-slate-800 text-white rounded-xl px-3 py-2.5 focus:ring-1 focus:ring-emerald-500 focus:outline-hidden"
              >
                <option value="">-- Tabungan Umum / Tidak Ditautkan --</option>
                {goals.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.title} ({formatIDR(g.currentAmount)} / {formatIDR(g.targetAmount)})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Optional: Deduct from Savings Goal if Expense */}
          {type === 'expense' && goals.length > 0 && (
            <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-300">
                  Sumber Dana Pembayaran:
                </label>
                <span className="text-[10px] text-slate-500">Opsional</span>
              </div>
              <select
                value={selectedGoalId}
                onChange={(e) => setSelectedGoalId(e.target.value)}
                className="w-full text-xs bg-slate-900 border border-slate-700 text-white rounded-lg px-2.5 py-2 focus:ring-1 focus:ring-emerald-500 focus:outline-hidden"
              >
                {goals.map((g) => (
                  <option key={g.id} value={g.id}>
                    🏦 Potong dari Tabungan: {g.title} (Sisa Saldo: {formatIDR(g.currentAmount)})
                  </option>
                ))}
                <option value="">👛 Saldo Kas / Dompet Luar (Jangan potong tabungan)</option>
              </select>
              {selectedGoalId ? (
                <p className="text-[11px] text-amber-400 font-medium">
                  ✓ Saldo tabungan <strong>{goals.find((g) => g.id === selectedGoalId)?.title}</strong> akan otomatis terpotong sebesar nominal pengeluaran.
                </p>
              ) : (
                <p className="text-[10px] text-slate-500">
                  Uang pengeluaran ini tidak akan memotong saldo tabungan.
                </p>
              )}
            </div>
          )}

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">
              Keterangan Pengeluaran
            </label>
            <input
              type="text"
              placeholder={
                category === 'makan'
                  ? 'Misal: Nasi Padang / Belanja sayur'
                  : category === 'transportasi'
                  ? 'Misal: Bensin Pertamax / Ongkos KRL'
                  : category === 'jajan'
                  ? 'Misal: Es Kopi Susu / Boba'
                  : category === 'keperluan'
                  ? 'Misal: Sabun & Deterjen / Pulsa'
                  : category === 'game'
                  ? 'Misal: Top up Diamond ML / Game Steam'
                  : 'Keterangan transaksi'
              }
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full text-xs bg-slate-950 border border-slate-800 text-white rounded-xl px-3 py-2.5 focus:ring-1 focus:ring-emerald-500 focus:outline-hidden"
            />
          </div>

          {/* Date & Payment Method */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">
                Tanggal
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full text-xs bg-slate-950 border border-slate-800 text-white rounded-xl px-3 py-2 focus:ring-1 focus:ring-emerald-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">
                Metode Pembayaran
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                className="w-full text-xs bg-slate-950 border border-slate-800 text-white rounded-xl px-3 py-2 focus:ring-1 focus:ring-emerald-500 focus:outline-hidden"
              >
                {PAYMENT_METHODS.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 text-xs font-semibold text-slate-400 hover:text-white rounded-lg"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 text-xs font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-xl shadow-xs"
            >
              Simpan Transaksi
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
