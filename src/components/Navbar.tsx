import React from 'react';
import { PlusCircle, RotateCcw, Download } from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenAddModal: () => void;
  onExportCSV: () => void;
  onResetSample: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenAddModal,
  onExportCSV,
  onResetSample,
}) => {
  const navItems = [
    { id: 'overview', label: 'Ringkasan' },
    { id: 'expenses', label: 'Pengeluaran' },
    { id: 'savings', label: 'Target Tabungan' },
    { id: 'budget503020', label: 'Batas Anggaran' },
    { id: 'transactions', label: 'Buku Kas' },
    { id: 'installapp', label: '📱 Pasang di HP' },
    { id: 'architecture', label: 'Struktur Web' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 shadow-md">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16">
          {/* Zone 1: Brand title */}
          <a
            href="#overview"
            onClick={(e) => {
              e.preventDefault();
              setActiveTab('overview');
            }}
            className="text-base sm:text-lg font-bold tracking-tight text-white flex items-center gap-2 group shrink-0"
          >
            <span className="w-7 h-7 rounded-lg bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-slate-950 font-extrabold text-xs sm:text-sm shadow-md shadow-emerald-500/20 shrink-0">
              U
            </span>
            <span className="font-black tracking-wider text-base sm:text-lg text-white">
              U<span className="text-emerald-400">ANG</span>
            </span>
          </a>

          {/* Zone 2: 4-6 clean text navigation links */}
          <nav className="hidden md:flex items-center gap-1.5 p-1 bg-slate-950/60 border border-slate-800/80 rounded-xl">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap ${
                    isActive
                      ? 'bg-emerald-500 text-slate-950 shadow-sm shadow-emerald-500/30 font-bold'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Zone 3: Actions */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <button
              onClick={onResetSample}
              title="Reset ke data awal"
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800 rounded-xl transition-colors hidden sm:inline-flex"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              onClick={onExportCSV}
              title="Unduh Laporan CSV"
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800 rounded-xl transition-colors hidden sm:inline-flex"
            >
              <Download className="w-4 h-4" />
            </button>
            <button
              onClick={onOpenAddModal}
              className="inline-flex items-center gap-1.5 px-3 sm:px-3.5 py-1.5 sm:py-2 text-xs font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-xl shadow-md shadow-emerald-500/20 transition-all active:scale-95 whitespace-nowrap"
            >
              <PlusCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span>Catat Transaksi</span>
            </button>
          </div>
        </div>

        {/* Mobile Horizontal Sub-Navigation */}
        <div className="flex md:hidden overflow-x-auto py-2 gap-1.5 border-t border-slate-800/80 scrollbar-none">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`px-3 py-1 text-xs font-semibold rounded-lg whitespace-nowrap transition-colors ${
                  isActive
                    ? 'bg-emerald-500 text-slate-950 font-bold shadow-xs'
                    : 'text-slate-400 hover:text-white bg-slate-800/70'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
