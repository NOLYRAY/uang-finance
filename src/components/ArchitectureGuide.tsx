import React, { useState } from 'react';
import { Layers, Database, Code2, Calculator, Server, Copy, Check, BarChart3 } from 'lucide-react';

export const ArchitectureGuide: React.FC = () => {
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(id);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const folderStructureSnippet = `/project-root
├── index.html                 # Entry point HTML & Google Fonts
├── package.json               # Dependencies & build scripts
├── vite.config.ts             # Vite configuration
├── tsconfig.json              # TypeScript compiler options
└── src/
    ├── types/                 # Definisi Tipe & Entitas Data
    │   └── finance.ts         # Transaction, SavingsGoal, BudgetConfig (Makan, Transport, Jajan, Keperluan, Game)
    ├── constants/             # Data Statis & Preset Default
    │   └── categories.ts      # Kategori Makan, Transportasi, Jajan, Keperluan, Game, Tabungan
    ├── utils/                 # Logika Murni & Pemformatan
    │   ├── formatters.ts      # Pemformat mata uang IDR (Rp), tanggal Indonesia, persentase
    │   └── calculations.ts    # Rumus 50/30/20, bunga majemuk, estimasi target tabungan
    ├── hooks/                 # Custom React Hooks
    │   └── useFinanceData.ts  # CRUD state, kalkulasi agregat 5 pos, persistensi localStorage
    ├── components/            # Komponen Tampilan Modular
    │   ├── Navbar.tsx         # Navigasi & top bar contract
    │   ├── SummaryMetrics.tsx # 4 metrik kartu utama (Saldo, Pemasukan, Pengeluaran, Tabungan)
    │   ├── ExpenseManager.tsx # UI Khusus Terpisah Pengeluaran (5 Pos, Grafik, Plafon, Ledger)
    │   ├── QuickAddCard.tsx   # Widget 1-klik catat cepat langsung di halaman
    │   ├── Budget503020Calc.tsx # Kalkulator alokasi gaji & limit bulanan 5 kategori
    │   ├── SavingsGoalsPlanner.tsx # Perencanaan target tabungan & simulator compound interest
    │   ├── EmergencyFundCalc.tsx  # Kalkulator dana darurat berbasis profil risiko
    │   ├── TransactionList.tsx    # Buku kas dengan filter pos (Makan, Transport, Jajan, dll)
    │   ├── TransactionFormModal.tsx # Dialog pencatatan transaksi cepat dengan pemilih pos
    │   └── ArchitectureGuide.tsx  # Cetak biru arsitektur teknis
    ├── App.tsx                # Orkestrasi tampilan dan filter antar modul
    ├── index.css              # Tailwind CSS v4 imports
    └── main.tsx               # Bootstrap React DOM`;

  const schemaSnippet = `// 1. Kategori Pengeluaran Spesifik
export type ExpenseCategory = 
  | 'makan'         // Biaya Makan (Bahan makanan, makan siang/malam)
  | 'transportasi'  // Transportasi (Bensin, ojol, KRL/MRT, servis)
  | 'jajan'         // Jajan & Kopi (Minuman boba, cemilan, nongkrong)
  | 'keperluan'     // Keperluan Rumah/Pribadi (Sabun, deterjen, pulsa, utilitas)
  | 'game'          // Game & Top-up (Diamond, game Steam, skin, console)
  | 'lainnya';

// 2. Batas Anggaran Khusus per Kategori
export interface CategoryBudgetMap {
  makan: number;        // Batas bulanan makan (contoh: Rp 1.500.000)
  transportasi: number; // Batas bulanan transport (contoh: Rp 500.000)
  jajan: number;        // Batas bulanan jajan (contoh: Rp 350.000)
  keperluan: number;    // Batas bulanan keperluan (contoh: Rp 800.000)
  game: number;         // Batas bulanan game (contoh: Rp 250.000)
}

// 3. Entitas Transaksi Kas
export interface Transaction {
  id: string;
  type: 'expense' | 'income' | 'savings';
  amount: number;
  category: ExpenseCategory | IncomeCategory | SavingsCategory;
  description: string;
  date: string;           // YYYY-MM-DD
  paymentMethod: 'qris' | 'bank_transfer' | 'cash' | 'kartu';
  savingsGoalId?: string; // Foreign key ke target tabungan (jika tipe 'savings')
  createdAt: number;
}

// 4. Entitas Target Tabungan
export interface SavingsGoal {
  id: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  monthlyTarget: number;
  deadlineDate: string;
  category: 'emergency' | 'house' | 'vehicle' | 'gadget' | 'game' | 'travel' | 'other';
  notes?: string;
  createdAt: number;
}`;

  return (
    <div className="space-y-6">
      {/* Intro Header */}
      <div className="bg-slate-900/90 p-5 sm:p-6 rounded-2xl border border-slate-800 shadow-sm">
        <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
          <span>Panduan Rancang Bangun Perangkat Lunak</span>
          <span aria-hidden="true">·</span>
          <span>Web Architecture Blueprint</span>
        </div>
        <h2 className="text-xl font-bold tracking-tight text-white">
          Struktur Arsitektur Web Pengeluaran & Tabungan
        </h2>
        <p className="text-xs text-slate-400 mt-1 max-w-3xl leading-relaxed">
          Dokumentasi struktur teknis aplikasi untuk mencatat dan memvisualisasikan pengeluaran <strong>Biaya Makan, Transportasi, Jajan, Keperluan, Game</strong>, serta hubungannya dengan <strong>Tabungan</strong> dan grafik interaktif.
        </p>
      </div>

      {/* 4 Architectural Pillars Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-slate-900/90 p-5 rounded-2xl border border-slate-800">
          <div className="flex items-center gap-2 text-xs font-bold text-orange-400 mb-1">
            <Layers className="w-4 h-4" />
            <span>1. 5 Pos Pengeluaran Terfokus</span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Data dikategorikan langsung ke dalam 5 pos utama: <strong>Makan, Transportasi, Jajan, Keperluan, dan Game</strong>, memudahkan tracking pengeluaran sehari-hari tanpa kebingungan pos generik.
          </p>
        </div>

        <div className="bg-slate-900/90 p-5 rounded-2xl border border-slate-800">
          <div className="flex items-center gap-2 text-xs font-bold text-sky-400 mb-1">
            <BarChart3 className="w-4 h-4" />
            <span>2. Visualisasi Grafik Komprehensif</span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Grafik Donut SVG responsif untuk melihat proporsi persentase tiap pos, ditambah Grafik Batang (Bar Chart) untuk membandingkan realisasi pengeluaran terhadap batas anggaran bulanan.
          </p>
        </div>

        <div className="bg-slate-900/90 p-5 rounded-2xl border border-slate-800">
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 mb-1">
            <Calculator className="w-4 h-4" />
            <span>3. Integrasi Tabungan & Investasi</span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Setiap setoran tabungan terhubung dengan target spesifik (Dana Darurat, PC Gaming, Masa Depan) dan dilengkapi simulasi pertumbuhan bunga majemuk (*compound interest*).
          </p>
        </div>

        <div className="bg-slate-900/90 p-5 rounded-2xl border border-slate-800">
          <div className="flex items-center gap-2 text-xs font-bold text-purple-400 mb-1">
            <Database className="w-4 h-4" />
            <span>4. Persistensi & Kemudahan Ekspor</span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Semua transaksi tersimpan otomatis di <code className="text-emerald-400 font-mono">localStorage</code> browser, dilengkapi fitur unduh berkas CSV dan cadangan data JSON.
          </p>
        </div>
      </div>

      {/* Snippet 1: Folder Structure */}
      <div className="bg-slate-900/90 rounded-2xl border border-slate-800 overflow-hidden">
        <div className="px-5 py-3.5 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-200">
            <Code2 className="w-4 h-4 text-emerald-400" />
            <span>Struktur Folder & File (Project Tree)</span>
          </div>
          <button
            onClick={() => copyToClipboard(folderStructureSnippet, 'tree')}
            className="flex items-center gap-1 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 border border-slate-700 px-2.5 py-1 rounded-lg transition-colors"
          >
            {copiedSection === 'tree' ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>Tersalin!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Salin Struktur</span>
              </>
            )}
          </button>
        </div>
        <div className="p-4 bg-slate-950 text-slate-300 font-mono text-xs overflow-x-auto leading-relaxed">
          <pre>{folderStructureSnippet}</pre>
        </div>
      </div>

      {/* Snippet 2: Database Schema */}
      <div className="bg-slate-900/90 rounded-2xl border border-slate-800 overflow-hidden">
        <div className="px-5 py-3.5 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-200">
            <Database className="w-4 h-4 text-emerald-400" />
            <span>Skema Data TypeScript</span>
          </div>
          <button
            onClick={() => copyToClipboard(schemaSnippet, 'schema')}
            className="flex items-center gap-1 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 border border-slate-700 px-2.5 py-1 rounded-lg transition-colors"
          >
            {copiedSection === 'schema' ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>Tersalin!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Salin Skema</span>
              </>
            )}
          </button>
        </div>
        <div className="p-4 bg-slate-950 text-emerald-400 font-mono text-xs overflow-x-auto leading-relaxed">
          <pre>{schemaSnippet}</pre>
        </div>
      </div>
    </div>
  );
};
