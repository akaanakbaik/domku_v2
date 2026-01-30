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

