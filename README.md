# Justip Shopper Web CMS (`justip_cms`)

[![React](https://img.shields.io/badge/React-18.3-61DAFB?style=flat&logo=react)](https://react.dev)
[![Vite](https://img.shields.io/badge/Build%20Tool-Vite-646CFF?style=flat&logo=vite)](https://vitejs.dev)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC?style=flat&logo=tailwind-css)](https://tailwindcss.com)
[![PRD Scope](https://img.shields.io/badge/PRD%20Scope-Epic%203%20(Shopper%20Web)-emerald)](../Jastip%20App.md)

Aplikasi web dashboard & CMS (*Content Management System*) khusus untuk **Penyedia Jasa Jastip (Shopper / Traveler)**, dibangun menggunakan **React** dan **Tailwind CSS** berdasarkan spesifikasi pada [Jastip App.md](../Jastip%20App.md) dan kontrak API pada [openapi.yaml](./src/openapi.yaml).

---

## Daftar Isi
- [Tujuan & Latar Belakang](#tujuan--latar-belakang)
- [Tech Stack](#tech-stack)
- [Modul & Fitur Utama](#modul--fitur-utama)
  - [1. Ringkasan & Analitik (Overview)](#1-ringkasan--analitik-overview)
  - [2. Kelola Pesanan (Order Management)](#2-kelola-pesanan-order-management)
  - [3. Kloter Jastip & Buka Kloter Baru (Batch Management)](#3-kloter-jastip--buka-kloter-baru-batch-management)
  - [4. Manajemen Katalog Barang Bawaan](#4-manajemen-katalog-barang-bawaan)
  - [5. Laporan & Ekspor CSV/Excel](#5-laporan--ekspor-csvexcel)
  - [6. Verifikasi Identitas KYC & Rekening](#6-verifikasi-identitas-kyc--rekening)
- [Struktur Direktori](#struktur-direktori)
- [Cara Menjalankan Secara Lokal](#cara-menjalankan-secara-lokal)
  - [Prasyarat](#prasyarat)
  - [Instalasi Dependensi](#instalasi-dependensi)
  - [Menjalankan Development Server](#menjalankan-development-server)
  - [Membangun untuk Produksi (Build)](#membangun-untuk-produksi-build)
- [Integrasi dengan Backend & API Contract](#integrasi-dengan-backend--api-contract)

---

## Tujuan & Latar Belakang
Pada layanan Jastip tradisional, traveler/shopper sering direpotkan oleh:
- Mengumpulkan pesanan secara manual dari obrolan WhatsApp/Instagram DM.
- Mengetik ulang nama barang, jumlah, dan harga ke file spreadsheet Excel.
- Mengecek mutasi bank satu-persatu untuk memverifikasi pembayaran.
- Mengabari pembeli satu-persatu tentang progres barang yang sudah dibeli di toko luar negeri.

**Justip Shopper Web CMS** dirancang khusus untuk mengotomatisasi seluruh alur kerja operasional traveler dari awal keberangkatan hingga barang tiba di Indonesia:
1. Membuka kloter belanja dengan kuota bagasi yang terkontrol.
2. Memantau pesanan masuk yang terverifikasi otomatis via QRIS.
3. Mengubah status pemesanan secara massal (*bulk action*) saat belanja di store negara tujuan.
4. Mengunduh rekapitulasi data transaksi dalam format CSV/Excel dengan sekali klik.

---

## Tech Stack
- **Framework / Library**: [React 18.3](https://react.dev)
- **Build Tool**: [Vite](https://vitejs.dev)
- **Styling**: [Tailwind CSS 3.4](https://tailwindcss.com) + Autoprefixer & PostCSS
- **Ikon**: [Lucide React](https://lucide.dev)
- **Kontrak Data**: [OpenAPI 3.0.3](./src/openapi.yaml)

---

## Modul & Fitur Utama

### 1. Ringkasan & Analitik (Overview)
- **Metrik Finansial**: Kartu KPI yang menampilkan Total Pesanan, Total GMV Omset, Keuntungan Bersih (*Fee Shopper*), dan Persentase Keterisian Kuota Bagasi (*Quota Occupancy Rate*).
- **State Machine Pipeline**: Visualisasi distribusi pesanan di setiap tahapan (*Pending* ➔ *Paid* ➔ *Purchased* ➔ *Shipped*).
- **Jadwal & Aturan Kloter**: Informasi tanggal keberangkatan, batas tutup pesanan (*Order Deadline*), dan aturan khusus bagasi kabin.

### 2. Kelola Pesanan (Order Management)
- **Tabel Data Interaktif**: Menampilkan daftar pesanan lengkap dengan ID Pesanan, kontak WhatsApp pembeli, rincian barang, total nominal, fee shopper, dan status.
- **Filter Status Real-time**: Filter instan berdasarkan status pesanan: `Semua`, `Pending`, `Paid`, `Purchased`, dan `Shipped`.
- **Pencarian Cepat**: Pencarian real-time berdasarkan ID pesanan, nama pembeli, atau nama barang titipan.
- **Bulk Action**: Memilih beberapa pesanan sekaligus melalui checkbox dan mengubah statusnya secara massal (misal: "Tandai Dibeli" saat berada di toko).
- **Detail Pesanan Modal**: Menampilkan foto referensi *Custom Request*, catatan detail pembeli, serta kolom input nomor resi pengiriman kurir.

### 3. Kloter Jastip & Buka Kloter Baru (Batch Management)
- **Form Buka Kloter**: Membuka kloter perjalanan baru dengan input:
  - Destinasi perjalanan & bendera negara (🇯🇵 Tokyo, 🇹🇭 Bangkok, 🇰🇷 Seoul, 🇸🇬 Singapore, 🇫🇷 Paris).
  - Tanggal berangkat dan tanggal kepulangan.
  - Batas akhir pemesanan (*Order Deadline*).
  - Kapasitas kuota maksimal slot pesanan.
  - Aturan dan ketentuan bagasi jastip.
- **Simulasi Pub-Sub Notification**: Saat kloter dipublikasikan, sistem secara asinkron memicu event notifikasi otomatis ke ratusan pembeli yang berlangganan akun shopper.

### 4. Manajemen Katalog Barang Bawaan
- Menambahkan produk rekomendasi bawaan kloter (misal: Tokyo Banana, Snack Bangkok, Gentle Woman totebag).
- Form penambahan produk: Nama barang, kategori (Snack, Skincare, Fashion, Gadget), harga modal beli toko, margin fee shopper, dan URL gambar.

### 5. Laporan & Ekspor CSV/Excel
- Merekapitulasi seluruh transaksi yang masuk tanpa ketergantungan pada input manual spreadsheet.
- Tombol **Export CSV**: Mengenerate file `.csv` otomatis yang langsung terunduh ke perangkat pengguna dengan penamaan dinamis `Rekap_Jastip_[ID_Kloter]_[Tanggal].csv`.

### 6. Verifikasi Identitas KYC & Rekening
- Status verifikasi **KYC Shopper** (*Know Your Customer*): Menampilkan badge identitas terverifikasi (KTP & Nomor Rekening Bank BCA) untuk meningkatkan kepercayaan pembeli terhadap shopper.

---

## Struktur Direktori

```
justip_cms/
├── public/                      # Static assets
├── src/
│   ├── components/
│   │   └── shopper/
│   │       └── ShopperDashboard.jsx  # Komponen utama Shopper CMS (Overview, Orders, Batches, Catalog, Reports, KYC)
│   ├── data/
│   │   └── mockData.js          # Model data awal pesanan, kloter, dan profil shopper
│   ├── App.jsx                  # Root application wrapper
│   ├── index.css                # Tailwind CSS direct entrypoint
│   ├── main.jsx                 # React DOM mount entrypoint
│   └── openapi.yaml             # Salinan kontrak REST API OpenAPI 3.0
├── index.html                   # HTML template
├── package.json                 # NPM scripts & dependencies
├── postcss.config.js            # PostCSS configuration
├── tailwind.config.js           # Tailwind theme configuration
└── vite.config.js               # Vite server & build settings (Port 3000)
```

---

## Cara Menjalankan Secara Lokal

### Prasyarat
- [Node.js](https://nodejs.org) versi 20+ (disarankan Node.js 22 atau 24)
- NPM atau PNPM

### Instalasi Dependensi
```bash
# 1. Masuk ke direktori justip_cms
cd justip_cms

# 2. Pasang paket dependensi
npm install
```

### Menjalankan Development Server
```bash
npm run dev
```
Setelah server berjalan, buka peramban (*browser*) Anda pada tautan:
👉 **`http://localhost:3000`**

### Membangun untuk Produksi (Build)
```bash
# Kompilasi aplikasi untuk produksi
npm run build

# Menjalankan preview hasil kompilasi
npm run preview
```

---

## Integrasi dengan Backend & API Contract

Frontend ini mengacu pada kontrak API resmi pada [openapi.yaml](./src/openapi.yaml) dan dokumentasi [API_CONTRACT.md](../API_CONTRACT.md).

Format respons data yang dikonsumsi oleh CMS menggunakan standar envelope seragam:
```json
{
  "success": true,
  "message": "Daftar pesanan shopper berhasil diambil",
  "data": [ ... ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 48,
    "total_pages": 3
  }
}
```

Endpoint backend utama yang terhubung dengan Shopper CMS:
- `POST /api/v1/shopper/kloters` ➔ Buka kloter baru
- `GET /api/v1/shopper/orders` ➔ Ambil daftar pesanan masuk
- `PATCH /api/v1/shopper/orders/:id/status` ➔ Update status pesanan
- `POST /api/v1/shopper/orders/bulk-status` ➔ Update status massal
- `POST /api/v1/shopper/kloters/:kloter_id/catalog` ➔ Tambah barang katalog
- `GET /api/v1/shopper/reports/orders/export` ➔ Download rekap CSV

---

## Lisensi & Kontributor
- **Owner**: @Fajar Trengginas
- **Project**: Jastip App Ecosystem
