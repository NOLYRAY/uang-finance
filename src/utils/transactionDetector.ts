import { Transaction, TransactionType, CategoryId, PaymentMethod } from '../types/finance';

export interface DetectedTransaction {
  type: TransactionType;
  amount: number;
  category: CategoryId;
  description: string;
  paymentMethod: PaymentMethod;
  source: 'DANA' | 'GoPay' | 'OVO' | 'ShopeePay' | 'BCA' | 'Mandiri' | 'BRI' | 'BNI' | 'Digital';
  confidence: number;
}

/**
 * Intelligent parser for digital wallet & bank notifications / everyday text.
 * Examples:
 * - "Kamu menerima saldo DANA Rp 10.000 dari BUDI"
 * - "Berhasil kirim Rp 10.000 ke SITI"
 * - "gw dapet dana 10k"
 * - "kirim dana 10k buat jajan"
 * - "bayar qris 25.000 makan siang"
 * - "transfer bca 50rb"
 */
export function detectDigitalTransaction(text: string): DetectedTransaction | null {
  if (!text || text.trim().length === 0) return null;

  const raw = text.trim();
  const lower = raw.toLowerCase();

  // 1. Identify Source
  let source: DetectedTransaction['source'] = 'Digital';
  if (lower.includes('dana')) source = 'DANA';
  else if (lower.includes('gopay') || lower.includes('go-pay') || lower.includes('gojek')) source = 'GoPay';
  else if (lower.includes('ovo')) source = 'OVO';
  else if (lower.includes('shopee') || lower.includes('spay')) source = 'ShopeePay';
  else if (lower.includes('bca')) source = 'BCA';
  else if (lower.includes('mandiri') || lower.includes('livin')) source = 'Mandiri';
  else if (lower.includes('bri') || lower.includes('brimo')) source = 'BRI';
  else if (lower.includes('bni')) source = 'BNI';

  // 2. Identify Amount
  let amount = 0;

  // Patterns like 10k, 50k, 1.5jt, 2.5jt, 500rb, Rp 10.000, 10000
  const kPattern = /(\d+(?:[.,]\d+)?)\s*(?:k|rb|ribu)\b/i;
  const jtPattern = /(\d+(?:[.,]\d+)?)\s*(?:jt|juta)\b/i;
  const rpPattern = /(?:rp\.?|idr)\s*([\d.,]+)/i;
  const numberOnlyPattern = /\b(\d{3,9})\b/;

  const kMatch = lower.match(kPattern);
  const jtMatch = lower.match(jtPattern);
  const rpMatch = lower.match(rpPattern);

  if (jtMatch) {
    const val = parseFloat(jtMatch[1].replace(',', '.'));
    amount = Math.round(val * 1000000);
  } else if (kMatch) {
    const val = parseFloat(kMatch[1].replace(',', '.'));
    amount = Math.round(val * 1000);
  } else if (rpMatch) {
    const cleanNum = rpMatch[1].replace(/\./g, '').replace(',', '.');
    amount = Math.round(parseFloat(cleanNum));
  } else {
    const numMatch = lower.match(numberOnlyPattern);
    if (numMatch) {
      amount = parseInt(numMatch[1], 10);
    }
  }

  if (isNaN(amount) || amount <= 0) {
    return null;
  }

  // 3. Identify Type (Income vs Expense)
  // Income indicators: dapat, dapet, terima, menerima, masuk, kredit, cr, top up, dapat transfer, gajian, dapat dana
  const incomeKeywords = [
    'dapat', 'dapet', 'terima', 'menerima', 'masuk', 'kredit', 'cr', 'top up', 'topup',
    'gajian', 'gaji', 'cashback', 'bonus', 'dari', 'diberi', 'ditransfer'
  ];

  // Expense indicators: kirim, mengirim, transfer ke, bayar, pembayaran, beli, qr, qris, keluar, debet, db, tarik tunai
  const expenseKeywords = [
    'kirim', 'mengirim', 'transfer ke', 'tf ke', 'bayar', 'pembayaran', 'beli', 'belanja',
    'qris', 'qr', 'keluar', 'debet', 'db', 'tarik', 'checkout', 'pesan'
  ];

  let isIncome = false;
  let isExpense = false;

  for (const kw of incomeKeywords) {
    if (lower.includes(kw)) {
      isIncome = true;
      break;
    }
  }

  for (const kw of expenseKeywords) {
    if (lower.includes(kw)) {
      isExpense = true;
      break;
    }
  }

  // Priority logic for ambiguous sentences like "terima kiriman" vs "kirim uang"
  let type: TransactionType = 'expense';
  if (isIncome && !isExpense) {
    type = 'income';
  } else if (isIncome && isExpense) {
    // If it has "terima" or "dapat", usually income (e.g. "kamu menerima dana kiriman")
    if (lower.includes('terima') || lower.includes('dapat') || lower.includes('dapet') || lower.includes('masuk')) {
      type = 'income';
    } else {
      type = 'expense';
    }
  } else {
    // Default fallback
    type = 'expense';
  }

  // 4. Identify Category
  let category: CategoryId = type === 'income' ? 'pemasukan_lain' : 'keperluan';

  if (type === 'expense') {
    if (lower.includes('makan') || lower.includes('resto') || lower.includes('food') || lower.includes('nasi') || lower.includes('mie') || lower.includes('ayam') || lower.includes('bakso') || lower.includes('warung')) {
      category = 'makan';
    } else if (lower.includes('gojek') || lower.includes('grab') || lower.includes('bensin') || lower.includes('pertalite') || lower.includes('pertamax') || lower.includes('parkir') || lower.includes('tol') || lower.includes('ojek') || lower.includes('angkot') || lower.includes('kereta')) {
      category = 'transportasi';
    } else if (lower.includes('kopi') || lower.includes('jajan') || lower.includes('snack') || lower.includes('es teh') || lower.includes('bobba') || lower.includes('boba') || lower.includes('indomaret') || lower.includes('alfamart') || lower.includes('cemilan') || lower.includes('martabak')) {
      category = 'jajan';
    } else if (lower.includes('game') || lower.includes('steam') || lower.includes('mlbb') || lower.includes('diamond') || lower.includes('topup game') || lower.includes('roblox') || lower.includes('genshin') || lower.includes('valorant') || lower.includes('skin')) {
      category = 'game';
    } else {
      category = 'keperluan';
    }
  }

  // 5. Clean Description
  let description = raw;
  if (type === 'income') {
    description = `Terima saldo ${source} (${raw.length > 35 ? raw.slice(0, 32) + '...' : raw})`;
  } else {
    description = `${source}: ${raw.length > 35 ? raw.slice(0, 32) + '...' : raw}`;
  }

  const paymentMethod: PaymentMethod =
    source === 'BCA' || source === 'Mandiri' || source === 'BRI' || source === 'BNI'
      ? 'bank_transfer'
      : 'e_wallet';

  return {
    type,
    amount,
    category,
    description,
    paymentMethod,
    source,
    confidence: 0.95,
  };
}

/**
 * Triggers native browser push notification if permitted
 */
export async function sendNativePushNotification(title: string, body: string) {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return false;
  }

  try {
    let perm = Notification.permission;
    if (perm === 'default') {
      perm = await Notification.requestPermission();
    }

    if (perm === 'granted') {
      const notif = new Notification(title, {
        body,
        icon: '/pwa-192x192.png',
        badge: '/pwa-192x192.png',
      });

      // Auto close after 5 seconds
      setTimeout(() => notif.close(), 5000);
      return true;
    }
  } catch (err) {
    console.error('Failed to trigger notification:', err);
  }

  return false;
}
