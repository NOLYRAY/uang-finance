# UANG - Penghitung Pengeluaran & Tabungan Cerdas

Aplikasi web modern untuk mencatat, mengelola, dan memvisualisasikan pos pengeluaran harian (**Biaya Makan, Transportasi, Jajan, Keperluan, dan Game**), aturan finansial 50/30/20, serta perencanaan target tabungan masa depan.

---

## 🌟 Fitur Utama

1. **Dashboard Ringkasan Eksekutif (`Ringkasan`)**:
   - Saldo bersih kas, total arus kas masuk, total 5 pos keluar, dan akumulasi simpanan.
   - Kartu cuplikan 5 pos pengeluaran & target tabungan aktif.
   - Form pencatatan cepat 1-klik (*Quick Add Logger*).
   - Aktivitas transaksi terbaru.

2. **Manajemen Khusus Pengeluaran (`Pengeluaran`)**:
   - Terpisah mandiri dari ringkasan untuk kerapihan data.
   - 5 Pos Pengeluaran Terfokus: **Makan, Transportasi, Jajan, Keperluan, dan Game**.
   - Kartu metrik interaktif dengan indikator sisa kuota dan peringatan *overbudget*.
   - **Grafik Interaktif**:
     - *Donut Chart* proporsi pengeluaran dengan persentase tiap pos.
     - *Bar Chart* realisasi pengeluaran terhadap batas plafon bulanan.
   - Buku riwayat transaksi keluar dilengkapi filter pos dan pencarian teks.
   - Pengaturan plafon batas anggaran langsung per pos.

3. **Perencanaan Tabungan (`Target Tabungan`)**:
   - Buat target tabungan (Dana Darurat, Kendaraan, Gadget/PC Gaming, Liburan).
   - Indikator progres target dan tombol setor tabungan instan.
   - Kalkulator simulasi bunga majemuk (*Compound Interest*).

4. **Kalkulator Aturan 50/30/20 (`Batas Anggaran`)**:
   - Evaluasi alokasi gaji: Kebutuhan Pokok (50%), Keinginan (30%), dan Tabungan (20%).
   - Preset profil pengeluaran fleksibel.

5. **Buku Kas Lengkap (`Buku Kas`)**:
   - Riwayat seluruh transaksi (Masuk, Keluar, dan Setoran Tabungan).
   - Filter pos, metode pembayaran (QRIS, Tunai, Transfer, Kartu), serta pencarian kata kunci.

6. **Cadangkan & Impor Data**:
   - Simpan data otomatis di *browser local storage*.
   - Ekspor laporan ke format **CSV** & cadangan berkas **JSON**.
   - Fitur pemulihan (*import*) data JSON.

---

## 🚀 Teknologi yang Digunakan

- **Frontend**: [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **Bundler & Dev Server**: [Vite](https://vitejs.dev/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Animasi & Transisi**: Native SVG Charts & CSS Transitions

---

## 💻 Cara Menjalankan di Lokal (Local Development)

### 1. Clone Repository
```bash
git clone https://github.com/USERNAME/REPO_NAME.git
cd REPO_NAME
```

### 2. Install Dependensi
```bash
npm install
```

### 3. Salin Konfigurasi Environment (Opsional)
```bash
cp .env.example .env
```

### 4. Jalankan Server Pengembangan
```bash
npm run dev
```
Buka browser di alamat: `http://localhost:3000` (atau port yang tertera di terminal).

### 5. Build untuk Produksi
```bash
npm run build
```

---

## 📄 Lisensi
Didistribusikan di bawah lisensi Apache-2.0.
