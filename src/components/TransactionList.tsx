import React, { useState, useMemo } from 'react';
import { Transaction, TransactionType } from '../types/finance';
import { CATEGORIES, PAYMENT_METHODS } from '../constants/categories';
import { formatIDR, formatDateIndo } from '../utils/formatters';
import { Search, Trash2, Download, Utensils, Car, Coffee, Package, Gamepad2, PiggyBank, Plus, X } from 'lucide-react';

interface TransactionListProps {
  transactions: Transaction[];
  onDeleteTransaction: (id: string) => void;
  onOpenAddModal: () => void;
  onExportCSV: () => void;
  defaultCategoryFilter?: string;
}

export const TransactionList: React.FC<TransactionListProps> = ({
  transactions,
  onDeleteTransaction,
  onOpenAddModal,
  onExportCSV,
  defaultCategoryFilter = 'all',
}) => {
  const [filterType, setFilterType] = useState<TransactionType | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>(defaultCategoryFilter);

  const filteredTransactions = useMemo(() => {
    return transactions.filter((t) => {
      if (filterType !== 'all' && t.type !== filterType) return false;
      if (selectedCategory !== 'all' && t.category !== selectedCategory) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const descMatch = t.description?.toLowerCase().includes(q);
        const cat = CATEGORIES[t.category];
        const catMatch = cat?.label.toLowerCase().includes(q) || cat?.shortLabel?.toLowerCase().includes(q);
        return descMatch || catMatch;
      }
      return true;
    });
  }, [transactions, filterType, selectedCategory, searchQuery]);

  const paymentMethodMap = useMemo(() => {
    const map: Record<string, string> = {};
    for (const p of PAYMENT_METHODS) {
      map[p.id] = p.label;
    }
    return map;
  }, []);

  const quickCategoryFilters = [
    { id: 'all', label: 'Semua', color: '#94a3b8' },
    { id: 'makan', label: 'Makan', color: '#f97316' },
    { id: 'transportasi', label: 'Transport', color: '#38bdf8' },
    { id: 'jajan', label: 'Jajan', color: '#fb7185' },
    { id: 'keperluan', label: 'Keperluan', color: '#c084fc' },
    { id: 'game', label: 'Game', color: '#34d399' },
  ];

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
        return <PiggyBank className="w-3.5 h-3.5 text-blue-400" />;
    }
  };

  return (
    <div className="bg-slate-900/90 rounded-2xl border border-slate-800 shadow-sm overflow-hidden">
      {/* Header and Controls */}
      <div className="p-4 sm:p-5 border-b border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-400 mb-0.5">
              <span>Buku Transaksi</span>
              <span aria-hidden="true">·</span>
              <span>Laporan Arus Kas</span>
            </div>
            <h2 className="text-base font-bold text-white tracking-tight">
              Daftar Riwayat Pengeluaran & Tabungan
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onExportCSV}
              className="px-3 py-1.5 text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 hover:text-white border border-slate-700 rounded-xl transition-colors flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5 text-slate-400" />
              <span>Ekspor CSV</span>
            </button>
            <button
              onClick={onOpenAddModal}
              className="px-3.5 py-1.5 text-xs font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tambah Transaksi</span>
            </button>
          </div>
        </div>

        {/* Quick Filter Bar */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 pt-2 border-t border-slate-800">
          {/* Category Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs scrollbar-none">
            {quickCategoryFilters.map((cat) => {
              const isSelected = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => {
                    setSelectedCategory(cat.id);
                    if (cat.id !== 'all') {
                      setFilterType('expense');
                    }
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 flex items-center gap-1.5 border ${
                    isSelected
                      ? 'bg-slate-100 text-slate-950 border-white shadow-xs font-bold'
                      : 'bg-slate-800/80 border-slate-700/80 text-slate-300 hover:bg-slate-700 hover:text-white'
                  }`}
                >
                  {cat.id !== 'all' && (
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: isSelected ? '#0f172a' : cat.color }}
                    />
                  )}
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>

          {/* Search Input */}
          <div className="relative w-full md:w-64 shrink-0">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Cari (makan, bensin, steam)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs pl-8 pr-7 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:bg-slate-950 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-hidden"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-0.5"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Table Data */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="bg-slate-950/70 border-b border-slate-800 text-slate-400 font-semibold uppercase text-[11px] tracking-wider">
              <th className="py-3 px-4 sm:px-5">Tanggal</th>
              <th className="py-3 px-4">Pos Kategori</th>
              <th className="py-3 px-4">Keterangan</th>
              <th className="py-3 px-4 hidden sm:table-cell">Metode Bayar</th>
              <th className="py-3 px-4 sm:px-5 text-right">Nominal</th>
              <th className="py-3 px-4 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {filteredTransactions.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-16 text-center text-slate-500">
                  <div className="flex flex-col items-center justify-center">
                    <Package className="w-8 h-8 text-slate-600 mb-2" />
                    <span className="font-medium text-slate-300">Tidak ada transaksi ditemukan.</span>
                    <span className="text-[11px] text-slate-500 mt-0.5">
                      Coba ganti filter atau catat pengeluaran baru.
                    </span>
                  </div>
                </td>
              </tr>
            ) : (
              filteredTransactions.map((tx) => {
                const cat = CATEGORIES[tx.category] || { label: tx.category, color: '#94a3b8' };
                const isExpense = tx.type === 'expense';
                const isIncome = tx.type === 'income';
                const isSavings = tx.type === 'savings';

                return (
                  <tr key={tx.id} className="hover:bg-slate-800/50 transition-colors group">
                    {/* Tanggal */}
                    <td className="py-3.5 px-4 sm:px-5 font-mono tabular-nums text-slate-400 whitespace-nowrap">
                      {formatDateIndo(tx.date)}
                    </td>

                    {/* Kategori Pos */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span className="p-1 rounded-md bg-slate-950 border border-slate-800">
                          {getCategoryIcon(tx.category)}
                        </span>
                        <span className="font-bold text-white">{cat.label}</span>
                      </div>
                    </td>

                    {/* Deskripsi */}
                    <td className="py-3.5 px-4 text-slate-300 max-w-xs font-medium">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="truncate">{tx.description || '-'}</span>
                        {tx.savingsGoalId && (
                          <span className={`text-[10px] px-1.5 py-0.5 rounded font-semibold shrink-0 border ${
                            isExpense 
                              ? 'bg-amber-950/70 border-amber-800/50 text-amber-300' 
                              : 'bg-blue-950/70 border-blue-800/50 text-blue-300'
                          }`}>
                            {isExpense ? '🏦 Dari Tabungan' : '🏦 Setoran Tabungan'}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Metode Bayar */}
                    <td className="py-3.5 px-4 text-slate-400 hidden sm:table-cell whitespace-nowrap">
                      <span className="bg-slate-800/90 border border-slate-700/60 px-2 py-0.5 rounded-md text-[11px] font-medium text-slate-300">
                        {paymentMethodMap[tx.paymentMethod] || tx.paymentMethod}
                      </span>
                    </td>

                    {/* Nominal */}
                    <td className="py-3.5 px-4 sm:px-5 text-right font-mono tabular-nums font-extrabold whitespace-nowrap">
                      <span
                        className={
                          isIncome
                            ? 'text-emerald-400'
                            : isSavings
                            ? 'text-blue-400'
                            : 'text-white'
                        }
                      >
                        {isIncome ? '+' : isExpense ? '-' : ''}
                        {formatIDR(tx.amount)}
                      </span>
                    </td>

                    {/* Aksi Hapus */}
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => onDeleteTransaction(tx.id)}
                        className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-950/40 rounded-lg transition-colors opacity-70 group-hover:opacity-100"
                        title="Hapus baris transaksi"
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
  );
};
