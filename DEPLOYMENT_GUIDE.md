# Deployment Guide: WasteWise AI Fullstack App

## Struktur Deployment
- **Frontend (Next.js):** Vercel (direkomendasikan)
- **Backend (Node.js/Hapi):** Railway, Render, VPS, atau server cloud lain
- **ML Service (Python Flask/FastAPI):** Railway, Render, VPS, atau server cloud lain
- **Database:** SQLite (bawaan, bisa migrasi ke PostgreSQL jika ingin scalable)

---

## 1. Deploy Frontend (Next.js) ke Vercel
1. **Push kode ke GitHub** (folder `frontend/`).
2. **Login ke [Vercel](https://vercel.com/)** dan klik "Add New Project".
3. Pilih repo GitHub, set root directory ke `frontend`.
4. Build Command: `npm run build`, Output Directory: `.next`, Install Command: `npm install`.
5. Tambahkan environment variable `BACKEND_URL` ke URL backend yang sudah online.
6. Klik **Deploy** dan tunggu proses selesai.

---

## 1A. Deploy Frontend (Next.js) ke Vercel via CLI

Alternatif selain dashboard, Anda bisa deploy langsung dari terminal dengan Vercel CLI:

1. **Install Vercel CLI**
   ```
   npm install -g vercel
   ```
2. **Login ke Vercel**
   ```
   vercel login
   ```
   Masukkan email Vercel Anda dan verifikasi.
3. **Masuk ke folder frontend**
   ```
   cd frontend
   ```
4. **Deploy**
   ```
   vercel
   ```
   Ikuti instruksi di terminal (pilih project, root directory, framework, dsb).
5. **Set Environment Variable**
   Jika diminta, masukkan `BACKEND_URL` sesuai URL backend Anda.
   Atau, setelah deploy:
   ```
   vercel env add BACKEND_URL production
   ```
6. **Cek hasil deploy**
   Vercel akan memberikan URL hasil deploy. Buka dan pastikan aplikasi berjalan.

---

## 2. Deploy Backend (Node.js/Hapi)
### Railway/Render (Rekomendasi)
1. **Push folder `backend/` ke GitHub**.
2. **Buat project baru di Railway/Render** (Deploy from GitHub, pilih folder `backend/`).
3. **Set environment variables:**
   - `PORT` (misal: 3001)
   - `ML_SERVICE_URL` (URL ML service online, misal: `https://ml-service-xxxx.up.railway.app`)
   - `FRONTEND_URL` (URL Vercel frontend)
   - `MIDTRANS_SERVER_KEY`, `MIDTRANS_CLIENT_KEY` (jika ada payment)
4. **Deploy!** Railway/Render akan memberikan URL backend, misal: `https://backend-xxxx.up.railway.app`.
5. **Update `BACKEND_URL` di Vercel ke URL backend ini.**

### VPS/Cloud Server
1. Upload folder `backend/` ke server.
2. Install Node.js & npm.
3. Jalankan `npm install`.
4. Set environment variables (pakai .env atau export di shell).
5. Jalankan backend (pakai PM2): `npx pm2 start server.js --name backend`.
6. Pastikan port terbuka di firewall/server.
7. Update `BACKEND_URL` di Vercel ke URL backend ini.

### Render.com (Alternatif Gratis)

#### Deploy Backend (Node.js/Hapi) ke Render
1. **Push folder `backend/` ke GitHub**
2. **Buat Web Service Baru di Render**
   - Login ke [Render.com](https://dashboard.render.com/)
   - Klik **New +** > **Web Service**
   - Pilih repo GitHub, pilih folder `backend/`
   - **Root Directory:** `backend`
   - **Build Command:** `npm install`
   - **Start Command:** `node server.js`
   - **Environment:** Node
   - **Language:** Node.js
3. **Set Environment Variables**
   - `PORT` (misal: 3001)
   - `ML_SERVICE_URL` (URL ML service online, bisa dummy dulu)
   - `FRONTEND_URL` (URL Vercel frontend)
   - `MIDTRANS_SERVER_KEY`, `MIDTRANS_CLIENT_KEY` (jika ada payment)
4. **Deploy!** Render akan memberikan URL backend, misal: `https://backend-xxxx.onrender.com`
5. **Update `BACKEND_URL` di Vercel** ke URL backend dari Render

### Railway (Alternatif Gratis)

#### Deploy Backend (Node.js/Hapi) ke Railway
1. **Push folder `backend/` ke GitHub**
2. **Buat Project Baru di Railway**
   - Login ke [Railway](https://railway.app/)
   - Klik **New Project** > **Deploy from GitHub Repo**
   - Pilih repo, pilih folder `backend/`
   - Railway otomatis mendeteksi Node.js
   - **Build Command:** `npm install`
   - **Start Command:** `node server.js`
3. **Set Environment Variables**
   - `PORT` (misal: 3001)
   - `ML_SERVICE_URL` (URL ML service online, bisa dummy dulu)
   - `FRONTEND_URL` (URL Vercel frontend)
   - `MIDTRANS_SERVER_KEY`, `MIDTRANS_CLIENT_KEY` (jika ada payment)
4. **Deploy!** Railway akan memberikan URL backend, misal: `https://backend-xxxx.up.railway.app`
5. **Update `BACKEND_URL` di Vercel** ke URL backend dari Railway

> Railway free tier: 500 jam runtime/bulan, auto sleep jika idle, kadang butuh kartu kredit untuk aktivasi.

---

## 3. Deploy ML Service (Python)
### Railway/Render
1. **Push folder `ml-service/` ke GitHub**.
2. **Buat project baru di Railway/Render** (Deploy from GitHub, pilih folder `ml-service/`).
3. **Set environment variables jika ada.**
4. **Deploy!** Railway/Render akan memberikan URL ML service, misal: `https://ml-service-xxxx.up.railway.app`.
5. **Update `ML_SERVICE_URL` di backend ke URL ini.**

### VPS/Cloud Server
1. Upload folder `ml-service/` ke server.
2. Install Python & pip.
3. Jalankan `pip install -r requirements.txt`.
4. Jalankan ML service: `python app.py` atau `gunicorn -w 2 -b 0.0.0.0:5000 app:app`.
5. Pastikan port terbuka di firewall/server.
6. Update `ML_SERVICE_URL` di backend ke URL ini.

### Render.com (Alternatif Gratis)

#### Deploy ML Service (Python) ke Render
1. **Push folder `ml-service/` ke GitHub**
2. **Buat Web Service Baru di Render**
   - **Root Directory:** `ml-service`
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `gunicorn -w 2 -b 0.0.0.0:10000 app:app` (atau sesuai entrypoint)
   - **Environment:** Python 3.x
   - **Language:** Python
3. **Set Environment Variables** (jika ada)
4. **Deploy!** Render akan memberikan URL ML service, misal: `https://ml-service-xxxx.onrender.com`
5. **Update `ML_SERVICE_URL` di backend** ke URL ML service dari Render

### Railway (Alternatif Gratis)

#### Deploy ML Service (Python) ke Railway
1. **Push folder `ml-service/` ke GitHub**
2. **Buat Project Baru di Railway**
   - Login ke [Railway](https://railway.app/)
   - Klik **New Project** > **Deploy from GitHub Repo**
   - Pilih repo, pilih folder `ml-service/`
   - Railway otomatis mendeteksi Python
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `gunicorn -w 2 -b 0.0.0.0:$PORT app:app`
3. **Set Environment Variables** (jika ada)
4. **Deploy!** Railway akan memberikan URL ML service, misal: `https://ml-service-xxxx.up.railway.app`
5. **Update `ML_SERVICE_URL` di backend** ke URL ML service dari Railway

> Railway free tier: 500 jam runtime/bulan, auto sleep jika idle, kadang butuh kartu kredit untuk aktivasi.

---

## 4. Koneksi Antar Service
- **FE (Vercel):** Set `BACKEND_URL` di environment Vercel ke URL backend online.
- **BE:** Set `ML_SERVICE_URL` ke URL ML service online, `FRONTEND_URL` ke URL Vercel.
- **ML Service:** Cukup listen di port yang benar.

---

## 5. Testing & Validasi
1. Cek FE (Vercel) bisa akses API (BE).
2. Cek BE bisa akses ML service (test endpoint `/api/classify`).
3. Cek payment (Midtrans) jika ada.
4. Cek quota, login, dashboard, dsb.

---

## 6. Tips
- Gunakan HTTPS untuk semua endpoint (Railway/Render sudah otomatis).
- Cek log error di dashboard Railway/Render/Vercel jika ada masalah.
- Update README dengan URL deployment.

---

Jika ingin contoh pengisian environment variable di Vercel/Railway/Render, atau butuh template `.env`, cek dokumentasi masing-masing platform atau hubungi instruktur.
