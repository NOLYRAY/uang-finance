import React, { useState } from 'react';
import { CategoryId, PaymentMethod, TransactionType } from '../types/finance';
import { CATEGORIES } from '../constants/categories';
import { formatIDR, parseNumberInput } from '../utils/formatters';
import { Utensils, Car, Coffee, Package, Gamepad2, PiggyBank, Plus, Check } from 'lucide-react';

interface QuickAddCardProps {
  onAddTransaction: (tx: {
    type: TransactionType;
    amount: number;
    category: CategoryId;
    description: string;
    date: string;
    paymentMethod: PaymentMethod;
  }) => void;
}

export const QuickAddCard: React.FC<QuickAddCardProps> = ({ onAddTransaction }) => {
  const [selectedCat, setSelectedCat] = useState<CategoryId>('makan');
  const [amountStr, setAmountStr] = useState('');
  const [note, setNote] = useState('');
  const [method, setMethod] = useState<PaymentMethod>('qris');
  const [justAdded, setJustAdded] = useState(false);

  const quickButtons: { id: CategoryId; label: string; icon: React.ReactNode; color: string }[] = [
    { id: 'makan', label: 'Makan', icon: <Utensils className="w-3.5 h-3.5" />, color: '#f97316' },
    { id: 'transportasi', label: 'Transport', icon: <Car className="w-3.5 h-3.5" />, color: '#38bdf8' },
    { id: 'jajan', label: 'Jajan', icon: <Coffee className="w-3.5 h-3.5" />, color: '#fb7185' },
    { id: 'keperluan', label: 'Keperluan', icon: <Package className="w-3.5 h-3.5" />, color: '#c084fc' },
    { id: 'game', label: 'Game', icon: <Gamepad2 className="w-3.5 h-3.5" />, color: '#34d399' },
    { id: 'tabungan_utama', label: 'Tabungan', icon: <PiggyBank className="w-3.5 h-3.5" />, color: '#60a5fa' },
  ];

  const presetAmounts = [20000, 50000, 100000, 250000];

  const handleQuickSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseNumberInput(amountStr);
    if (amount <= 0) return;

    const catInfo = CATEGORIES[selectedCat];
    const txType: TransactionType = selectedCat === 'tabungan_utama' ? 'savings' : 'expense';

    onAddTransaction({
      type: txType,
      amount,
      category: selectedCat,
      description: note.trim() || catInfo?.label || 'Pengeluaran Cepat',
      date: new Date().toISOString().split('T')[0],
      paymentMethod: method,
    });

    setAmountStr('');
    setNote('');
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 2000);
  };

  return (
    <div className="bg-slate-900/90 rounded-2xl border border-slate-800 shadow-sm p-5 transition-all">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div>
          <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
            <span>Catat Cepat</span>
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800/40">
              1-Klik
            </span>
          </h3>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Pilih pos pengeluaran & masukkan nominal langsung
          </p>
        </div>
        {justAdded && (
          <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-950/80 border border-emerald-800/50 px-2 py-1 rounded-md">
            <Check className="w-3 h-3" />
            Tersimpan!
          </span>
        )}
      </div>

      <form onSubmit={handleQuickSubmit} className="mt-4 space-y-3.5">
        {/* Category Selector Grid */}
        <div>
          <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
            Pilih Pos:
          </label>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
            {quickButtons.map((btn) => {
              const isActive = selectedCat === btn.id;
              return (
                <button
                  key={btn.id}
                  type="button"
                  onClick={() => setSelectedCat(btn.id)}
                  className={`flex flex-col items-center justify-center py-2 px-1.5 rounded-xl border text-xs font-semibold transition-all ${
                    isActive
                      ? 'border-emerald-500 bg-emerald-500 text-slate-950 shadow-sm font-bold scale-[1.02]'
                      : 'border-slate-800 bg-slate-950/70 text-slate-300 hover:bg-slate-800 hover:border-slate-700'
                  }`}
                >
                  <span
                    className={`p-1 rounded-md mb-1 ${
                      isActive ? 'bg-slate-950 text-emerald-400' : 'bg-slate-800'
                    }`}
                    style={{ color: isActive ? '#34d399' : btn.color }}
                  >
                    {btn.icon}
                  </span>
                  <span className="text-[10px] leading-tight truncate w-full text-center">
                    {btn.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Nominal Input & Quick Presets */}
        <div>
          <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
            Nominal Transaksi (Rp):
          </label>
          <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 focus-within:ring-2 focus-within:ring-emerald-500/20 focus-within:border-emerald-500 transition-all">
            <span className="text-xs font-mono font-bold text-slate-500">Rp</span>
            <input
              type="text"
              required
              placeholder="Contoh: 35000"
              value={amountStr}
              onChange={(e) => setAmountStr(e.target.value)}
              className="w-full bg-transparent font-mono text-sm font-bold text-white focus:outline-hidden"
            />
            {amountStr && (
              <span className="text-[11px] font-mono font-bold text-emerald-400 whitespace-nowrap">
                {formatIDR(parseNumberInput(amountStr))}
              </span>
            )}
          </div>

          {/* Quick preset chips */}
          <div className="flex items-center gap-1.5 mt-2 overflow-x-auto pb-0.5">
            <span className="text-[10px] text-slate-500 font-medium">Pintas:</span>
            {presetAmounts.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setAmountStr(p.toString())}
                className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700 transition-colors"
              >
                +{p / 1000}k
              </button>
            ))}
          </div>
        </div>

        {/* Short Note & Payment Method */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <div>
            <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
              Catatan Singkat:
            </label>
            <input
              type="text"
              placeholder={
                selectedCat === 'makan'
                  ? 'Makan siang warteg / ayam'
                  : selectedCat === 'transportasi'
                  ? 'Bensin motor / KRL'
                  : selectedCat === 'jajan'
                  ? 'Kopi / cemilan sore'
                  : selectedCat === 'keperluan'
                  ? 'Sabun / paket data'
                  : selectedCat === 'game'
                  ? 'Top-up diamond / Steam'
                  : 'Keterangan'
              }
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full text-xs bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 focus:outline-hidden"
            />
          </div>

          <div>
            <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
              Metode Bayar:
            </label>
            <select
              value={method}
              onChange={(e) => setMethod(e.target.value as PaymentMethod)}
              className="w-full text-xs bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 focus:outline-hidden"
            >
              <option value="qris">QRIS / E-Wallet (GoPay/Shopee)</option>
              <option value="cash">Uang Tunai (Cash)</option>
              <option value="bank_transfer">Transfer Bank</option>
              <option value="kartu">Kartu Debit/Kredit</option>
            </select>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={!amountStr}
          className="w-full mt-2 py-2.5 px-4 bg-emerald-400 hover:bg-emerald-300 disabled:opacity-40 disabled:cursor-not-allowed text-slate-950 text-xs font-extrabold rounded-xl shadow-md shadow-emerald-500/20 transition-all flex items-center justify-center gap-1.5"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Simpan Transaksi ({CATEGORIES[selectedCat]?.label || selectedCat})</span>
        </button>
      </form>
    </div>
  );
};
