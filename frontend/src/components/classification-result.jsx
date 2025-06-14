"use client"

import { CheckCircle } from "lucide-react"
import { useLanguage } from "@/models/language-context"

function formatLabel(label) {
  if (!label) return '';
  return label.replace(/_/g, ' ');
}

const MAIN_CATEGORY_MAP = {
  Alat_Pembersih_Kimia: { id: 'Anorganik', en: 'Inorganic' },
  Alumunium: { id: 'Anorganik', en: 'Inorganic' },
  Baterai: { id: 'B3', en: 'Hazardous' },
  Kaca: { id: 'Anorganik', en: 'Inorganic' },
  Kardus: { id: 'Anorganik', en: 'Inorganic' },
  Karet: { id: 'Anorganik', en: 'Inorganic' },
  Kertas: { id: 'Anorganik', en: 'Inorganic' },
  Lampu_dan_Elektronik: { id: 'B3', en: 'Hazardous' },
  Minyak_dan_Oli_Bekas: { id: 'B3', en: 'Hazardous' },
  Obat_dan_Medis: { id: 'B3', en: 'Hazardous' },
  Plastik: { id: 'Anorganik', en: 'Inorganic' },
  Sisa_Buah_dan_Sayur: { id: 'Organik', en: 'Organic' },
  Sisa_Makanan: { id: 'Organik', en: 'Organic' },
  Styrofoam: { id: 'Anorganik', en: 'Inorganic' },
  Tekstil: { id: 'Anorganik', en: 'Inorganic' },
};

const CATEGORY_MAP = {
  Alat_Pembersih_Kimia: { id: 'Alat Pembersih Kimia', en: 'Chemical Cleaning Tools' },
  Alumunium: { id: 'Alumunium', en: 'Aluminum' },
  Baterai: { id: 'Baterai', en: 'Battery' },
  Kaca: { id: 'Kaca', en: 'Glass' },
  Kardus: { id: 'Kardus', en: 'Cardboard' },
  Karet: { id: 'Karet', en: 'Rubber' },
  Kertas: { id: 'Kertas', en: 'Paper' },
  Lampu_dan_Elektronik: { id: 'Lampu & Elektronik', en: 'Lamp & Electronics' },
  Minyak_dan_Oli_Bekas: { id: 'Minyak & Oli Bekas', en: 'Used Oil & Grease' },
  Obat_dan_Medis: { id: 'Obat & Medis', en: 'Medicine & Medical' },
  Plastik: { id: 'Plastik', en: 'Plastic' },
  Sisa_Buah_dan_Sayur: { id: 'Sisa Buah & Sayur', en: 'Fruit & Vegetable Waste' },
  Sisa_Makanan: { id: 'Sisa Makanan', en: 'Food Waste' },
  Styrofoam: { id: 'Styrofoam', en: 'Styrofoam' },
  Tekstil: { id: 'Tekstil', en: 'Textile' },
};

function getCategoryDisplay(category, language) {
  return CATEGORY_MAP[category] ? CATEGORY_MAP[category][language] : formatLabel(category);
}

export function ClassificationResult({ 
  classificationResult, 
  onNavigateToClassify, 
  onClassifyAgain 
}) {
  const { language } = useLanguage()

  if (!classificationResult) return null

  return (
    <div className="p-6 bg-gray-50 border-t">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">
          {language === "id"
            ? getCategoryDisplay(classificationResult.typeId || classificationResult.type, 'id')
            : getCategoryDisplay(classificationResult.type || classificationResult.typeId, 'en')}
        </h3>
        <p className="text-gray-600 mb-2">
          {language === "id"
            ? (classificationResult.category && MAIN_CATEGORY_MAP[classificationResult.category] 
                ? MAIN_CATEGORY_MAP[classificationResult.category].id 
                : formatLabel(classificationResult.category))
            : (classificationResult.category && MAIN_CATEGORY_MAP[classificationResult.category] 
                ? MAIN_CATEGORY_MAP[classificationResult.category].en 
                : formatLabel(classificationResult.category))}
        </p>
        <div className="inline-flex items-center bg-green-100 px-3 py-1 rounded-full text-sm font-medium text-green-800 mb-4">
          {classificationResult.confidence}% {language === "id" ? "akurasi" : "confidence"}
        </div>
        <p className="text-sm text-gray-600 mb-6">
          {language === "id" ? classificationResult.descriptionId : classificationResult.description}
        </p>
        <div className="space-y-3">          
          <button
            onClick={onNavigateToClassify}
            className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white px-6 py-3 rounded-lg transition-all duration-300 font-medium flex items-center justify-center space-x-2 transform hover:scale-105 shadow-lg"
          >
            <span>{language === "id" ? "Lihat Detail & Rekomendasi" : "View Details & Recommendations"}</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>          
          <button
            onClick={onClassifyAgain}
            className="w-full bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300 transition-all duration-300"
          >
            {language === "id" ? "Klasifikasi Lagi" : "Classify Again"}
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-3">
          {language === "id" 
            ? "Klik untuk melihat rekomendasi pengelolaan yang detail"
            : "Click to see detailed waste management recommendations"
          }
        </p>
      </div>
    </div>
  )
}
