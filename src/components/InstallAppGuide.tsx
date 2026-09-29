import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { Smartphone, Download, Share, CheckCircle2, ShieldCheck, Zap, Globe, Sparkles, ExternalLink, ArrowRight } from 'lucide-react';

export const InstallAppGuide: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [installedSuccess, setInstalledSuccess] = useState(false);

  const handleInstall = async () => {
    const success = await install();
    if (success) {
      setInstalledSuccess(true);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header Banner */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 p-6 sm:p-8 rounded-2xl border border-emerald-500/20 shadow-xl relative overflow-hidden">
        <div className="absolute -top-12 -right-12 w-52 h-52 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Progressive Web App (PWA)</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Pasang Aplikasi UANG di HP Anda
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
              Jadikan website ini aplikasi resmi di layar utama HP Anda tanpa harus mendownload file berat dari Play Store. 100% cepat, aman, dan tanpa iklan.
            </p>
          </div>

          <div className="shrink-0 flex flex-col items-center sm:items-end gap-2">
            {isInstalled ? (
              <div className="px-4 py-2.5 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-400 text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>Aplikasi Sudah Terpasang!</span>
              </div>
            ) : isInstallable ? (
              <button
                onClick={handleInstall}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 text-sm font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-xl shadow-lg shadow-emerald-500/25 transition-all active:scale-95 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Pasang Sekarang (1-Klik)</span>
              </button>
            ) : (
              <div className="text-center sm:text-right">
                <span className="text-xs font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-800/40 px-3 py-1.5 rounded-xl inline-block">
                  {isIOS ? 'Gunakan Menu Safari di Bawah' : 'Ikuti Petunjuk 3 Detik di Bawah'}
                </span>
              </div>
            )}
            <span className="text-[11px] text-slate-500">Ukuran file &lt; 1 MB · Tanpa kuota</span>
          </div>
        </div>
      </div>

      {/* 3 Keuntungan Memasang Aplikasi */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
          <div className="w-9 h-9 rounded-xl bg-emerald-950/80 border border-emerald-800/40 text-emerald-400 flex items-center justify-center">
            <Zap className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-bold text-white">Layar Penuh (Standalone)</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Tidak ada kolom URL atau tombol browser. Terasa 100% seperti aplikasi native yang diunduh dari Play Store.
          </p>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
          <div className="w-9 h-9 rounded-xl bg-sky-950/80 border border-sky-800/40 text-sky-400 flex items-center justify-center">
            <Smartphone className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-bold text-white">Ikon di Layar Utama</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Muncul di daftar aplikasi ponsel dengan logo eksklusif warna emerald. Cukup 1 ketukan untuk mencatat pengeluaran.
          </p>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
          <div className="w-9 h-9 rounded-xl bg-purple-950/80 border border-purple-800/40 text-purple-400 flex items-center justify-center">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-bold text-white">Data Aman di HP Anda</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Semua catatan keuangan Anda tersimpan privat di memori HP Anda tanpa dikirim ke server luar manapun.
          </p>
        </div>
      </div>

      {/* Tutorial Langkah Demi Langkah */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Tutorial Android */}
        <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-5 sm:p-6 space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-800">
            <span className="text-xl">🤖</span>
            <div>
              <h2 className="text-sm font-bold text-white">Cara Pasang di Android</h2>
              <span className="text-[11px] text-slate-400">Google Chrome / Brave / Edge</span>
            </div>
          </div>

          <ol className="space-y-3 text-xs text-slate-300">
            <li className="flex items-start gap-3 p-3 rounded-xl bg-slate-950/70 border border-slate-800/80">
              <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center shrink-0">
                1
              </span>
              <div>
                <strong className="text-white">Buka link web di Chrome:</strong>
                <p className="text-slate-400 mt-0.5">Pastikan Anda membuka website ini melalui browser Google Chrome di HP.</p>
              </div>
            </li>

            <li className="flex items-start gap-3 p-3 rounded-xl bg-slate-950/70 border border-slate-800/80">
              <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center shrink-0">
                2
              </span>
              <div>
                <strong className="text-white">Ketuk Menu Titik Tiga (⋮):</strong>
                <p className="text-slate-400 mt-0.5">Menu ini berada di pojok kanan atas layar browser Anda.</p>
              </div>
            </li>

            <li className="flex items-start gap-3 p-3 rounded-xl bg-slate-950/70 border border-slate-800/80">
              <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center shrink-0">
                3
              </span>
              <div>
                <strong className="text-white">Pilih "Install aplikasi" atau "Tambahkan ke Layar Utama":</strong>
                <p className="text-slate-400 mt-0.5">Ketuk konfirmasi <em>Install</em>, dan aplikasi akan langsung terpasang di HP Anda!</p>
              </div>
            </li>
          </ol>
        </div>

        {/* Tutorial iPhone (iOS) */}
        <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-5 sm:p-6 space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-800">
            <span className="text-xl">🍎</span>
            <div>
              <h2 className="text-sm font-bold text-white">Cara Pasang di iPhone (iOS)</h2>
              <span className="text-[11px] text-slate-400">Apple Safari Browser</span>
            </div>
          </div>

          <ol className="space-y-3 text-xs text-slate-300">
            <li className="flex items-start gap-3 p-3 rounded-xl bg-slate-950/70 border border-slate-800/80">
              <span className="w-5 h-5 rounded-full bg-sky-500/20 text-sky-400 font-bold flex items-center justify-center shrink-0">
                1
              </span>
              <div>
                <strong className="text-white">Buka di Browser Safari:</strong>
                <p className="text-slate-400 mt-0.5">Buka link web ini melalui aplikasi Safari bawaan iPhone.</p>
              </div>
            </li>

            <li className="flex items-start gap-3 p-3 rounded-xl bg-slate-950/70 border border-slate-800/80">
              <span className="w-5 h-5 rounded-full bg-sky-500/20 text-sky-400 font-bold flex items-center justify-center shrink-0">
                2
              </span>
              <div>
                <strong className="text-white">Ketuk Ikon Bagikan (Share):</strong>
                <p className="text-slate-400 mt-0.5">
                  Ikon kotak dengan panah ke atas (<Share className="w-3.5 h-3.5 inline mx-0.5 text-sky-400" />) di bar menu bawah Safari.
                </p>
              </div>
            </li>

            <li className="flex items-start gap-3 p-3 rounded-xl bg-slate-950/70 border border-slate-800/80">
              <span className="w-5 h-5 rounded-full bg-sky-500/20 text-sky-400 font-bold flex items-center justify-center shrink-0">
                3
              </span>
              <div>
                <strong className="text-white">Pilih "Tambah ke Layar Utama" (Add to Home Screen):</strong>
                <p className="text-slate-400 mt-0.5">Ketuk "Tambah" (Add) di pojok kanan atas. Ikon aplikasi langsung muncul di layar utama.</p>
              </div>
            </li>
          </ol>
        </div>
      </div>

      {/* Info Tambahan: Cara Jadi File APK untuk Play Store */}
      <div className="bg-slate-900/60 rounded-2xl border border-dashed border-slate-800 p-5 space-y-2 text-xs">
        <div className="flex items-center gap-2 text-slate-300 font-bold">
          <Globe className="w-4 h-4 text-emerald-400" />
          <span>Ingin mengubahnya jadi file APK asli untuk Google Play Store?</span>
        </div>
        <p className="text-slate-400 leading-relaxed">
          Karena sistem PWA sudah terpasang lengkap dengan manifest dan icon resolusi tinggi, Anda cukup memasukkan link Vercel Anda ke situs resmi gratis Microsoft <strong className="text-emerald-400">PWABuilder.com</strong> untuk otomatis mengunduh paket Android APK / AAB siap pakai!
        </p>
      </div>
    </div>
  );
};
