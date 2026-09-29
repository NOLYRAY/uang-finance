import React, { useState, useEffect } from 'react';
import { detectDigitalTransaction, sendNativePushNotification, DetectedTransaction } from '../utils/transactionDetector';
import { Transaction, TransactionType, CategoryId } from '../types/finance';
import { formatIDR } from '../utils/formatters';
import { CATEGORIES } from '../constants/categories';
import {
  Bell,
  BellRing,
  Smartphone,
  CheckCircle2,
  ArrowDownLeft,
  ArrowUpRight,
  Sparkles,
  ClipboardCheck,
  Zap,
  X,
  HelpCircle,
  Copy,
  ExternalLink,
} from 'lucide-react';

interface DigitalTransactionDetectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddTransaction: (tx: Omit<Transaction, 'id' | 'createdAt'>) => void;
  onShowToast: (msg: string) => void;
}

export const DigitalTransactionDetectorModal: React.FC<DigitalTransactionDetectorModalProps> = ({
  isOpen,
  onClose,
  onAddTransaction,
  onShowToast,
}) => {
  const [inputText, setInputText] = useState('');
  const [detected, setDetected] = useState<DetectedTransaction | null>(null);
  const [hasNotifPermission, setHasNotifPermission] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'detector' | 'automation'>('detector');

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setHasNotifPermission(Notification.permission === 'granted');
    }
  }, []);

  useEffect(() => {
    if (inputText.trim()) {
      const res = detectDigitalTransaction(inputText);
      setDetected(res);
    } else {
      setDetected(null);
    }
  }, [inputText]);

  if (!isOpen) return null;

  const requestPermission = async () => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      const res = await Notification.requestPermission();
      setHasNotifPermission(res === 'granted');
      if (res === 'granted') {
        sendNativePushNotification('🔔 Notifikasi UANG Aktif!', 'Anda akan menerima pemberitahuan setiap ada transaksi digital masuk atau keluar.');
      }
    }
  };

  const handleApply = async () => {
    if (!detected) return;

    const newTx: Omit<Transaction, 'id' | 'createdAt'> = {
      type: detected.type,
      amount: detected.amount,
      category: detected.category,
      description: detected.description,
      date: new Date().toISOString().split('T')[0],
      paymentMethod: detected.paymentMethod,
    };

    onAddTransaction(newTx);

    const isInc = detected.type === 'income';
    const notifTitle = isInc
      ? `💰 Pemasukan Baru: +${formatIDR(detected.amount)}`
      : `💸 Pengeluaran Baru: -${formatIDR(detected.amount)}`;
    const notifBody = `${detected.description} (${CATEGORIES[detected.category]?.label || detected.category})`;

    // Native device push notification
    sendNativePushNotification(notifTitle, notifBody);

    // In-app toast
    onShowToast(`Berhasil mencatat: ${isInc ? '+' : '-'}${formatIDR(detected.amount)} (${detected.source})`);

    setInputText('');
    setDetected(null);
    onClose();
  };

  const handleQuickSample = (sampleText: string) => {
    setInputText(sampleText);
  };

  const handlePasteClipboard = async () => {
    try {
      if (navigator.clipboard) {
        const text = await navigator.clipboard.readText();
        if (text) {
          setInputText(text);
        }
      }
    } catch (e) {
      console.warn('Clipboard read permission denied', e);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-5 sm:p-6 shadow-2xl space-y-5 max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-slate-950 font-black text-sm shadow-md">
              <Zap className="w-5 h-5 fill-slate-950" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-white flex items-center gap-1.5">
                <span>Deteksi Transaksi Digital Otomatis</span>
              </h2>
              <p className="text-[11px] text-slate-400">
                Otomatis kenali DANA, GoPay, OVO, ShopeePay, BCA & Bank lain
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex p-1 bg-slate-950 rounded-xl border border-slate-800 text-xs">
          <button
            onClick={() => setActiveTab('detector')}
            className={`flex-1 py-1.5 rounded-lg font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'detector'
                ? 'bg-emerald-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Pendeteksi Teks & Notifikasi</span>
          </button>
          <button
            onClick={() => setActiveTab('automation')}
            className={`flex-1 py-1.5 rounded-lg font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'automation'
                ? 'bg-emerald-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Otomasi HP (MacroDroid)</span>
          </button>
        </div>

        {activeTab === 'detector' ? (
          <div className="space-y-4">
            {/* Status Push Notification Browser */}
            <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 text-slate-300">
                <BellRing className={`w-4 h-4 ${hasNotifPermission ? 'text-emerald-400' : 'text-amber-400'}`} />
                <span>
                  Notifikasi HP: <strong className={hasNotifPermission ? 'text-emerald-400' : 'text-amber-400'}>
                    {hasNotifPermission ? 'Aktif (Siap Bunyi)' : 'Belum Diizinkan'}
                  </strong>
                </span>
              </div>
              {!hasNotifPermission && (
                <button
                  onClick={requestPermission}
                  className="px-2.5 py-1 text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-lg hover:bg-amber-500/30 transition-all cursor-pointer"
                >
                  Aktifkan Izin
                </button>
              )}
            </div>

            {/* Input Text Box */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <label className="font-semibold text-slate-300">
                  Tempel Salinan Notifikasi / Ketik Santai:
                </label>
                <button
                  onClick={handlePasteClipboard}
                  className="text-[11px] text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-medium cursor-pointer"
                >
                  <ClipboardCheck className="w-3 h-3" />
                  <span>Tempel dari Clipboard</span>
                </button>
              </div>

              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Contoh: 'gw dapet dana 10k' atau 'Kamu menerima saldo DANA Rp 10.000 dari SITI' atau 'Kirim dana 10k buat jajan'"
                rows={3}
                className="w-full bg-slate-950 border border-slate-700/80 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-mono transition-colors"
              />
            </div>

            {/* Quick Test Chips */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Coba Contoh 1-Klik:
              </span>
              <div className="flex flex-wrap gap-1.5 text-xs">
                <button
                  onClick={() => handleQuickSample('gw dapet dana 10k')}
                  className="px-2.5 py-1 rounded-lg bg-emerald-950/60 border border-emerald-800/60 text-emerald-300 hover:bg-emerald-900/50 transition-colors"
                >
                  🟢 Dapat DANA 10k
                </button>
                <button
                  onClick={() => handleQuickSample('kirim dana 10k beli jajan')}
                  className="px-2.5 py-1 rounded-lg bg-rose-950/60 border border-rose-800/60 text-rose-300 hover:bg-rose-900/50 transition-colors"
                >
                  🔴 Kirim DANA 10k (Jajan)
                </button>
                <button
                  onClick={() => handleQuickSample('Kamu menerima saldo DANA Rp 25.000 dari Budi')}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
                >
                  🟢 SMS DANA 25rb
                </button>
                <button
                  onClick={() => handleQuickSample('Transfer BCA Rp 50.000 untuk makan')}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
                >
                  🔴 Transfer BCA 50rb (Makan)
                </button>
              </div>
            </div>

            {/* Live Detection Preview */}
            {detected && (
              <div className="p-4 rounded-xl bg-gradient-to-br from-slate-950 to-slate-900 border border-emerald-500/40 space-y-3 animate-in zoom-in-95">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    Terdeteksi Otomatis ({detected.source})
                  </span>
                  <div className="flex items-center gap-1 text-xs font-bold">
                    {detected.type === 'income' ? (
                      <span className="text-emerald-400 flex items-center gap-1">
                        <ArrowDownLeft className="w-4 h-4" />
                        Pemasukan (Saldo Bertambah)
                      </span>
                    ) : (
                      <span className="text-rose-400 flex items-center gap-1">
                        <ArrowUpRight className="w-4 h-4" />
                        Pengeluaran (Saldo Berkurang)
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-slate-800 pt-2">
                  <div>
                    <span className="text-xs text-slate-400 block">Nominal:</span>
                    <span
                      className={`text-xl font-mono font-black ${
                        detected.type === 'income' ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {detected.type === 'income' ? '+' : '-'}{formatIDR(detected.amount)}
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="text-xs text-slate-400 block">Pos Kategori:</span>
                    <span className="text-xs font-bold text-white bg-slate-800 px-2.5 py-1 rounded-lg inline-block">
                      {CATEGORIES[detected.category]?.label || detected.category}
                    </span>
                  </div>
                </div>

                <div className="text-[11px] text-slate-400 truncate">
                  Deskripsi: <span className="text-slate-200">{detected.description}</span>
                </div>

                <button
                  onClick={handleApply}
                  className="w-full py-2.5 text-xs font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Catat ke Buku Kas & Bunyikan Notifikasi</span>
                </button>
              </div>
            )}
          </div>
        ) : (
          /* Automation Tab: MacroDroid / Tasker Guide */
          <div className="space-y-3 text-xs text-slate-300">
            <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
              <span className="font-bold text-white block">Cara Otomatisasi Tanpa Perlu Buka Web (di HP):</span>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                Di Android, Anda bisa memasang aplikasi gratis seperti <strong>MacroDroid</strong> dari Play Store untuk membaca notifikasi DANA/BCA yang masuk di HP dan otomatis meneruskannya.
              </p>
            </div>

            <ol className="space-y-2 text-[11px]">
              <li className="p-2.5 rounded-lg bg-slate-950/50 border border-slate-800 flex items-start gap-2">
                <span className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center shrink-0">1</span>
                <div>
                  <strong>Buka MacroDroid:</strong> Pilih trigger <em>Notification Received</em> ➔ Pilih aplikasi <strong>DANA</strong> atau <strong>BCA</strong>.
                </div>
              </li>
              <li className="p-2.5 rounded-lg bg-slate-950/50 border border-slate-800 flex items-start gap-2">
                <span className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center shrink-0">2</span>
                <div>
                  <strong>Tindakan (Action):</strong> Salin teks notifikasi ke Clipboard atau buka URL aplikasi dengan teks notifikasi.
                </div>
              </li>
              <li className="p-2.5 rounded-lg bg-slate-950/50 border border-slate-800 flex items-start gap-2">
                <span className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center shrink-0">3</span>
                <div>
                  <strong>Hasil:</strong> Begitu ada saldo masuk atau keluar, sistem pintar langsung memasukkannya ke pos pemasukan atau pengeluaran secara otomatis!
                </div>
              </li>
            </ol>
          </div>
        )}
      </div>
    </div>
  );
};
