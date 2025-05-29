"use client"

import { createContext, useState, useContext } from "react"

// Simple translations for demo purposes
const translations = {
  en: {
    home: "Home",
    classify: "Classify",
    team: "Team",
    blog: "Blog",
    "hero.title": "Smart Waste Classification Using Machine Learning",
    "hero.description":
      "Upload an image and let our tools classify your waste into the correct category. Support recycling and learn proper waste management.",
    "hero.getStarted": "Get Started",
    "hero.learnMore": "Learn More",
    "benefits.title": "Benefits",
    "benefits.educational.title": "Educational",
    "benefits.educational.description": "Learn about different types of waste and proper disposal methods",
    "benefits.eco.title": "Eco-Friendly",
    "benefits.eco.description": "Contribute to environmental sustainability through proper waste management",
    "benefits.ai.title": "AI-Powered",
    "benefits.ai.description": "Accurate waste classification using advanced machine learning",
    "classification.title": "Waste Classification",
    "classification.dropText": "Drag and drop your image here or click to upload",
    "classification.chooseFile": "Choose file",
    "classification.classifyButton": "Classify Waste",
    "map.title": "Waste Bank Locations",
    "map.placeholder": "Interactive map would be displayed here",
    "map.placeholderSub": "Showing nearby waste collection points",
    "map.getLocation": "Get location",
    "tech.title": "Technologies Used",
    "footer.tagline": "Smart waste classification for a better future",
    "footer.quickLinks": "Quick Links",
    "footer.contact": "Contact",
  },
  id: {
    home: "Beranda",
    classify: "Klasifikasi",
    team: "Tim",
    blog: "Blog",
    "hero.title": "Klasifikasi Sampah Cerdas Menggunakan Machine Learning",
    "hero.description":
      "Unggah gambar dan biarkan alat kami mengklasifikasikan sampah Anda ke dalam kategori yang tepat. Dukung daur ulang dan pelajari pengelolaan sampah yang tepat.",
    "hero.getStarted": "Mulai",
    "hero.learnMore": "Pelajari Lebih Lanjut",
    "benefits.title": "Manfaat",
    "benefits.educational.title": "Edukatif",
    "benefits.educational.description": "Pelajari tentang berbagai jenis sampah dan metode pembuangan yang tepat",
    "benefits.eco.title": "Ramah Lingkungan",
    "benefits.eco.description": "Berkontribusi pada keberlanjutan lingkungan melalui pengelolaan sampah yang tepat",
    "benefits.ai.title": "Didukung AI",
    "benefits.ai.description": "Klasifikasi sampah yang akurat menggunakan pembelajaran mesin canggih",
    "classification.title": "Klasifikasi Sampah",
    "classification.dropText": "Seret dan lepas gambar Anda di sini atau klik untuk mengunggah",
    "classification.chooseFile": "Pilih file",
    "classification.classifyButton": "Klasifikasikan Sampah",
    "map.title": "Lokasi Bank Sampah",
    "map.placeholder": "Peta interaktif akan ditampilkan di sini",
    "map.placeholderSub": "Menampilkan titik pengumpulan sampah terdekat",
    "map.getLocation": "Dapatkan lokasi",
    "tech.title": "Teknologi yang Digunakan",
    "footer.tagline": "Klasifikasi sampah cerdas untuk masa depan yang lebih baik",
    "footer.quickLinks": "Tautan Cepat",
    "footer.contact": "Kontak",
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
