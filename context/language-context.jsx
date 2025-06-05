"use client"

import { createContext, useState, useContext } from "react"

// Simple translations for demo purposes
const translations = {
  en: {
    home: "Home",
    classify: "Classify",
    team: "Team",
    blog: "Blog",
    "hero.title": "Transform Your Waste Management with AI Intelligence",
    "hero.description":
      "Revolutionize how you handle waste! Our cutting-edge AI instantly identifies waste types, provides smart disposal guidance, and connects you to the nearest recycling centers. Join thousands making our planet cleaner, one photo at a time.",
    "hero.getStarted": "Start Classifying Now",
    "hero.learnMore": "Discover How It Works",
    "benefits.title": "Why 10,000+ Users Choose WasteWise AI",
    "benefits.educational.title": "🎓 Learn & Master",
    "benefits.educational.description": "Become a waste management expert! Get instant knowledge about every type of waste, learn proper disposal techniques, and understand environmental impact - all powered by AI.",
    "benefits.eco.title": "🌱 Save Our Planet",
    "benefits.eco.description": "Every correctly sorted waste item prevents pollution and saves resources. Your small action creates massive environmental impact. Be part of the green revolution!",
    "benefits.ai.title": "🚀 AI That Never Sleeps",
    "benefits.ai.description": "99.2% accuracy rate with lightning-fast results. Our advanced neural networks trained on millions of waste images deliver instant, reliable classifications 24/7.",
    "classification.title": "🔬 Try Our AI-Powered Classification Now!",
    "classification.dropText": "Drop your waste image here and watch the magic happen! Or click to browse your photos",
    "classification.chooseFile": "📸 Choose Your Photo",
    "classification.classifyButton": "✨ Classify with AI",
    "map.title": "🗺️ Find Recycling Centers Near You",
    "map.placeholder": "Discover eco-friendly waste collection points in your area",
    "map.placeholderSub": "Connected to 500+ verified recycling centers nationwide",
    "map.getLocation": "📍 Find My Location",
    "map.updateLocation": "Update Location",
    "map.updatingLocation": "Updating location...",
    "map.clearLocation": "Clear Location",
    "map.dialog.success.title": "🎯 Location Found Successfully!",
    "map.dialog.success.description": "Your current location has been detected and saved. We can now show you the nearest recycling centers and waste collection points in your area.",
    "map.dialog.success.coordinates": "Your Coordinates:",
    "map.dialog.success.button": "Got it!",
    "map.dialog.error.title": "❌ Location Access Failed",
    "map.dialog.error.button": "Try Again",
    "map.dialog.error.permission": "Location access was denied. Please enable location permissions in your browser settings to find nearby recycling centers.",
    "map.dialog.error.unavailable": "Location information is currently unavailable. Please check your internet connection and GPS settings.",
    "map.dialog.error.timeout": "Location request timed out. Please try again or check your GPS signal.",
    "map.dialog.error.unsupported": "Geolocation is not supported by this browser. Please use a modern browser to access location features.",
    "tech.title": "Technologies Used",
    // Classify Page
    "classify.title": "🔬 AI-Powered Waste Classification",
    "classify.description": "Transform waste management with intelligent AI! Upload any waste image and get instant, accurate classification with smart disposal guidance. Join the green revolution today!",
    "classify.upload.title": "📸 Upload or Capture Your Waste Image",
    "classify.upload.subtitle": "Smart AI analysis in seconds | PNG, JPG, GIF up to 10MB",
    "classify.upload.dragText": "Drop your waste image here and watch AI magic happen!",
    "classify.options.title": "🎯 Choose Your Image Source",
    "classify.camera.title": "📱 Take Live Photo",
    "classify.camera.description": "Capture waste directly with your camera",
    "classify.gallery.title": "🖼️ Browse Gallery",
    "classify.gallery.description": "Select from your saved photos",
    "classify.button.classify": "✨ Analyze with AI Power",
    "classify.analyzing": "🧠 AI Brain Processing...",
    "classify.methods.title": "♻️ Smart Waste Management Methods",
    "classify.methods.subtitle": "Discover the best way to handle your waste sustainably",
    "classify.methods.recommended": "🎯 Perfect Match",
    "footer.tagline": "🌍 Making the world cleaner, one smart classification at a time",
    "footer.quickLinks": "Quick Navigation",
    "footer.contact": "Get In Touch",
    "login": "Login",
    "register": "Register",
    "logout": "Logout",
    "dashboard": "Dashboard",
  },
  id: {
    home: "Beranda",
    classify: "Klasifikasi",
    team: "Tim",
    blog: "Blog",
    "hero.title": "Revolusi Pengelolaan Sampah dengan Kecerdasan AI",
    "hero.description":
      "Ubah cara Anda mengelola sampah! AI canggih kami langsung mengidentifikasi jenis sampah, memberikan panduan pembuangan cerdas, dan menghubungkan Anda ke pusat daur ulang terdekat. Bergabunglah dengan ribuan orang yang membuat planet lebih bersih, satu foto setiap waktu.",
    "hero.getStarted": "Mulai Klasifikasi Sekarang",
    "hero.learnMore": "Temukan Cara Kerjanya",
    "benefits.title": "Mengapa 10,000+ Pengguna Memilih WasteWise AI",
    "benefits.educational.title": "🎓 Belajar & Kuasai",
    "benefits.educational.description": "Jadilah ahli pengelolaan sampah! Dapatkan pengetahuan instan tentang setiap jenis sampah, pelajari teknik pembuangan yang tepat, dan pahami dampak lingkungan - semuanya didukung AI.",
    "benefits.eco.title": "🌱 Selamatkan Planet Kita",
    "benefits.eco.description": "Setiap sampah yang disortir dengan benar mencegah polusi dan menghemat sumber daya. Tindakan kecil Anda menciptakan dampak lingkungan yang besar. Jadilah bagian dari revolusi hijau!",
    "benefits.ai.title": "🚀 AI yang Tidak Pernah Tidur",
    "benefits.ai.description": "Tingkat akurasi 99,2% dengan hasil secepat kilat. Jaringan neural canggih kami yang dilatih pada jutaan gambar sampah memberikan klasifikasi instan dan andal 24/7.",
    "classification.title": "🔬 Coba Klasifikasi Bertenaga AI Kami Sekarang!",
    "classification.dropText": "Jatuhkan gambar sampah Anda di sini dan saksikan keajaibannya! Atau klik untuk menjelajahi foto Anda",
    "classification.chooseFile": "📸 Pilih Foto Anda",
    "classification.classifyButton": "✨ Klasifikasi dengan AI",
    "map.title": "🗺️ Temukan Pusat Daur Ulang di Dekat Anda",
    "map.placeholder": "Temukan titik pengumpulan sampah ramah lingkungan di area Anda",
    "map.placeholderSub": "Terhubung dengan 500+ pusat daur ulang terverifikasi di seluruh Indonesia",
    "map.getLocation": "📍 Temukan Lokasi Saya",
    "map.updateLocation": "Perbarui Lokasi",
    "map.updatingLocation": "Memperbarui lokasi...",
    "map.clearLocation": "Hapus Lokasi",
    "map.dialog.success.title": "🎯 Lokasi Berhasil Ditemukan!",
    "map.dialog.success.description": "Lokasi Anda saat ini telah terdeteksi dan disimpan. Sekarang kami dapat menunjukkan pusat daur ulang dan titik pengumpulan sampah terdekat di area Anda.",
    "map.dialog.success.coordinates": "Koordinat Anda:",
    "map.dialog.success.button": "Mengerti!",
    "map.dialog.error.title": "❌ Akses Lokasi Gagal",
    "map.dialog.error.button": "Coba Lagi",
    "map.dialog.error.permission": "Akses lokasi ditolak. Harap aktifkan izin lokasi di pengaturan browser Anda untuk menemukan pusat daur ulang terdekat.",
    "map.dialog.error.unavailable": "Informasi lokasi saat ini tidak tersedia. Harap periksa koneksi internet dan pengaturan GPS Anda.",
    "map.dialog.error.timeout": "Permintaan lokasi habis waktu. Silakan coba lagi atau periksa sinyal GPS Anda.",
    "map.dialog.error.unsupported": "Geolocation tidak didukung oleh browser ini. Harap gunakan browser modern untuk mengakses fitur lokasi.",
    "tech.title": "Teknologi yang Digunakan",
    // Classify Page
    "classify.title": "🔬 Klasifikasi Sampah Bertenaga AI",
    "classify.description": "Revolusi pengelolaan sampah dengan AI cerdas! Unggah gambar sampah apa pun dan dapatkan klasifikasi instan dan akurat dengan panduan pembuangan pintar. Bergabunglah dengan revolusi hijau hari ini!",
    "classify.upload.title": "📸 Unggah atau Foto Gambar Sampah Anda",
    "classify.upload.subtitle": "Analisis AI pintar dalam hitungan detik | PNG, JPG, GIF hingga 10MB",
    "classify.upload.dragText": "Jatuhkan gambar sampah di sini dan saksikan keajaiban AI!",
    "classify.options.title": "🎯 Pilih Sumber Gambar Anda",
    "classify.camera.title": "📱 Ambil Foto Langsung",
    "classify.camera.description": "Potret sampah langsung dengan kamera Anda",
    "classify.gallery.title": "🖼️ Jelajahi Galeri",
    "classify.gallery.description": "Pilih dari foto yang tersimpan",
    "classify.button.classify": "✨ Analisis dengan Kekuatan AI",
    "classify.analyzing": "🧠 Otak AI Sedang Memproses...",
    "classify.methods.title": "♻️ Metode Pengelolaan Sampah Pintar",
    "classify.methods.subtitle": "Temukan cara terbaik untuk menangani sampah Anda secara berkelanjutan",
    "classify.methods.recommended": "🎯 Cocok Sempurna",
    "footer.tagline": "🌍 Menjadikan dunia lebih bersih, satu klasifikasi cerdas setiap saat",
    "footer.quickLinks": "Navigasi Cepat",
    "footer.contact": "Hubungi Kami",
    "login": "Masuk",
    "register": "Daftar",
    "logout": "Keluar",
    "dashboard": "Dashboard",
  },
}

const LanguageContext = createContext(undefined)

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState("en")

  // Simple translation function
  const t = (key) => {
    return translations[language]?.[key] || key
  }

  return <LanguageContext.Provider value={{ language, setLanguage, t }}>{children}</LanguageContext.Provider>
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider")
  }
  return context
}
