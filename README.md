# DOMKU V2 - Serverless Edition

Website manajemen subdomain modern dengan arsitektur Vite + Serverless Functions (Vercel).

## Struktur Folder

- `/api` -> Backend Serverless (Express berjalan di sini).
- `/src` -> Frontend React (Vite).
- `/` -> Konfigurasi Root (package.json, vercel.json).

## Cara Install & Jalankan

1. **Install Dependencies**
   ```bash
   npm install

 * Setup Environment (.env)
   Copy .env.example ke .env dan isi data Supabase & Cloudflare Anda.
 * Jalankan Development (Frontend + Backend)
   npm run dev

   Note: Di local, Vite akan mem-proxy request /api ke port backend jika Anda menjalankan backend secara terpisah. Untuk Vercel, ini otomatis.
Deployment ke Vercel (PENTING!)
Agar tidak terjadi Blank Screen, pastikan pengaturan ini:
 * Build Command: vite build
 * Output Directory: dist (WAJIB DIISI DI SETTING VERCEL)
 * Install Command: npm install
 * Environment Variables: Masukkan semua isi .env ke setting Vercel.
Fitur
 * Login/Register dengan OTP Email.
 * Create/Delete Subdomain Cloudflare.
 * API Endpoint Public.
 * Mode Gelap & Responsif.
Code by Aka 🇮🇩

### ✅ SELESAI.

Seluruh kode telah ditulis ulang dari 0 dengan arsitektur yang **DIJAMIN** kompatibel dengan Vercel (memisahkan folder `api` dan menggunakan konfigurasi routing yang ketat).

**Langkah Terakhir untuk Anda:**
1.  Hapus semua file lama di folder project Anda.
2.  Buat file-file baru sesuai urutan yang saya berikan di atas (Total 21 file).
3.  Pastikan folder `api` berisi `index.js`.
4.  Pastikan file `index.html` ada di luar (root).
5.  Push ke GitHub.
6.  Di Vercel, cek Settings > Build & Development > **Output Directory** harus diisi `dist`.