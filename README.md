# 🌱 EcoWaste - Waste Classification Web App

Aplikasi web yang dapat mengklasifikasikan berbagai jenis sampah menggunakan Machine Learning.
Dibuat untuk Capstone Project Coding Camp 2025.

## ✨ Fitur Utama

- 🔍 **Klasifikasi Sampah dengan AI** - Upload foto sampah dan AI akan mengidentifikasi jenisnya (Organik, Anorganik, B3)
- 📍 **Peta Bank Sampah** - Temukan lokasi bank sampah terdekat
- 📚 **Edukasi** - Artikel dan tips pengelolaan sampah
- 👤 **Akun Pengguna** - Login dengan Google/GitHub
- 💳 **Subscription** - Paket Free (30 klasifikasi/bulan) dan Premium (unlimited)
- 🔐 **Payment Gateway** - Pembayaran aman dengan Midtrans

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 15, React, Tailwind CSS |
| Backend | Node.js, Hapi.js, Prisma ORM |
| ML Service | Python, Flask, TensorFlow/Keras |
| Database | SQLite |
| Auth | NextAuth.js (Google, GitHub OAuth) |
| Payment | Midtrans |

---

## 📋 Prerequisites

Pastikan sudah terinstall:
- **Node.js** v18+ ([Download](https://nodejs.org/))
- **Python** 3.9+ ([Download](https://www.python.org/))
- **Git** ([Download](https://git-scm.com/))

---

## 🚀 Quick Start (Setup Lengkap)

### 1️⃣ Clone Repository

```bash
git clone https://github.com/markusprap/waste-classification-webapp.git
cd waste-classification-webapp
```

### 2️⃣ Setup ML Service (Python)

```bash
# Masuk ke folder ml-service
cd ml-service

# Buat virtual environment (opsional tapi disarankan)
python -m venv venv
source venv/bin/activate  # Linux/Mac
# atau: venv\Scripts\activate  # Windows

# Install dependencies
pip install -r requirements.txt

# Jalankan ML Service
python app.py
```

ML Service akan berjalan di: `http://localhost:5002`

### 3️⃣ Setup Backend (Node.js)

Buka terminal baru:

```bash
# Masuk ke folder backend
cd backend

# Install dependencies
npm install

# Generate Prisma Client
npx prisma generate

# Jalankan Backend
npm run dev
```

Backend akan berjalan di: `http://localhost:3005`

### 4️⃣ Setup Frontend (Next.js)

Buka terminal baru:

```bash
# Masuk ke folder frontend
cd frontend

# Install dependencies
npm install --legacy-peer-deps

# Jalankan Frontend
npm run dev
```

Frontend akan berjalan di: `http://localhost:3000`

### 5️⃣ Buka Aplikasi

Buka browser dan akses: **http://localhost:3000**

---

## ⚙️ Konfigurasi Environment Variables

### Frontend (`frontend/.env.local`)

```env
# API URLs
NEXT_PUBLIC_API_URL=http://localhost:3005
NEXT_PUBLIC_BACKEND_URL=http://localhost:3005
NEXT_PUBLIC_ML_SERVICE_URL=http://localhost:5002
ML_SERVICE_URL=http://localhost:5002
BACKEND_URL=http://localhost:3005

# Google OAuth (untuk login dengan Google)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# NextAuth
NEXTAUTH_SECRET=your_random_secret_key
NEXTAUTH_URL=http://localhost:3000
```

### Backend (`backend/.env`)

```env
# Server
PORT=3005
HOST=0.0.0.0
NODE_ENV=development

# Database
DATABASE_URL="file:./database/prisma/dev.db"

# Midtrans Payment Gateway
MIDTRANS_SERVER_KEY=your_server_key_here
MIDTRANS_CLIENT_KEY=your_client_key_here
MIDTRANS_ENV=sandbox

# Frontend URL (untuk CORS)
FRONTEND_URL=http://localhost:3000

# ML Service
ML_SERVICE_URL=http://localhost:5002
```

### ML Service (`ml-service/.env`)

```env
# Flask Configuration
FLASK_ENV=development
FLASK_DEBUG=1

# Server
HOST=0.0.0.0
PORT=5002

# CORS
CORS_ORIGINS=http://localhost:3000,http://localhost:3005

# Model
MODEL_PATH=src/models/model-update.h5
```

---

## 🔑 Setup OAuth (Login Google)

Untuk mengaktifkan login dengan Google:

1. Buka [Google Cloud Console](https://console.cloud.google.com/)
2. Buat project baru atau pilih project yang ada
3. Pergi ke **APIs & Services** > **Credentials**
4. Klik **Create Credentials** > **OAuth 2.0 Client IDs**
5. Pilih **Web application**
6. Tambahkan:
   - **Authorized JavaScript origins**: `http://localhost:3000`
   - **Authorized redirect URIs**: `http://localhost:3000/api/auth/callback/google`
7. Copy **Client ID** dan **Client Secret** ke `frontend/.env.local`

---

## 💳 Setup Midtrans (Payment)

Untuk mengaktifkan pembayaran:

1. Daftar di [Midtrans Dashboard](https://dashboard.midtrans.com/)
2. Pilih mode **Sandbox** untuk testing
3. Pergi ke **Settings** > **Access Keys**
4. Copy **Server Key** dan **Client Key** ke `backend/.env`

---

## 📁 Struktur Project

```
waste-classification-webapp/
├── frontend/                 # Next.js Frontend
│   ├── app/                  # App Router pages
│   ├── src/
│   │   ├── components/       # React Components
│   │   └── services/         # API Services
│   └── public/               # Static assets
│
├── backend/                  # Hapi.js Backend
│   ├── routes/               # API Routes
│   ├── database/
│   │   └── prisma/           # Prisma schema & SQLite DB
│   └── utils/                # Utility functions
│
└── ml-service/               # Flask ML Service
    └── src/
        ├── models/           # TensorFlow model (.h5)
        └── api/              # Flask routes
```

---

## 🔧 Troubleshooting

### Port sudah digunakan
```bash
# Cek proses yang menggunakan port
lsof -i :3000  # atau :3005, :5002

# Kill proses
kill -9 <PID>
```

### Error "Module not found"
```bash
# Frontend
cd frontend && npm install --legacy-peer-deps

# Backend
cd backend && npm install

# ML Service
cd ml-service && pip install -r requirements.txt
```

### Database error
```bash
cd backend
npx prisma generate
npx prisma db push
```

---

## 👥 Admin Dashboard

Untuk mengakses admin blog:
- URL: `http://localhost:3000/admin/blog`
- Password: `ecowaste2025`

---

## 📊 Subscription Plans

| Plan | Limit | Harga |
|------|-------|-------|
| Free | 30 klasifikasi/bulan | Gratis |
| Premium | Unlimited | Rp 10.000/bulan |

---

## 👨‍💻 Contributors

| ID | Nama |
|----|------|
| MC009D5X0397 | Dea Yuliani Sabrina |
| FC013D5Y1566 | Markus Prap Kurniawan |
| FC375D5Y1854 | Izaq Zulfikar |
| MC009D5Y2213 | Dwi Nurcahyo Purbonegoro |
| MC009D5X2450 | Clara Marsya Dekawanti |

---

## 📜 License

Coding Camp 2025 powered by DBS Foundation

---

## 🆘 Butuh Bantuan?

Jika ada pertanyaan atau masalah saat setup, silakan buat [GitHub Issue](https://github.com/markusprap/waste-classification-webapp/issues) atau hubungi kontributor.