"use client"

import { CheckCircle } from "lucide-react"
import { useLanguage } from "@/models/language-context"

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

function formatLabel(label) {
  if (!label) return '';
  return label.replace(/_/g, ' ');
}

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

  const formattedDescription = language === "id"
    ? `Item ini diklasifikasikan sebagai ${getCategoryDisplay(classificationResult.type || classificationResult.typeId, 'id')} (${classificationResult.category && MAIN_CATEGORY_MAP[classificationResult.category] ? MAIN_CATEGORY_MAP[classificationResult.category].id : formatLabel(classificationResult.category)})`
    : `This item is classified as ${getCategoryDisplay(classificationResult.type || classificationResult.typeId, 'en')} (${classificationResult.category && MAIN_CATEGORY_MAP[classificationResult.category] ? MAIN_CATEGORY_MAP[classificationResult.category].en : formatLabel(classificationResult.category)})`;

  return (
    <div className="p-8 bg-gradient-to-br from-white via-emerald-50/30 to-teal-50/30 border-t border-gray-100 animate-fade-in">
      <div className="flex flex-col items-center text-center">
        {/* Verification Badge */}
        <div className="mb-6 inline-flex items-center gap-2 bg-emerald-50 text-emerald-700 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-emerald-100 shadow-sm">
          <CheckCircle className="w-3.5 h-3.5" />
          AI Verified Classification
        </div>

        {/* Title & Category */}
        <h3 className="text-3xl font-black text-gray-900 mb-2 tracking-tight">
          {language === "id"
            ? getCategoryDisplay(classificationResult.typeId || classificationResult.type, 'id')
            : getCategoryDisplay(classificationResult.type || classificationResult.typeId, 'en')}
        </h3>

        <div className="flex items-center gap-2 mb-6">
          <span className="text-gray-400 font-bold">
            {language === "id"
              ? (classificationResult.category && MAIN_CATEGORY_MAP[classificationResult.category]
                ? MAIN_CATEGORY_MAP[classificationResult.category].id
                : formatLabel(classificationResult.category))
              : (classificationResult.category && MAIN_CATEGORY_MAP[classificationResult.category]
                ? MAIN_CATEGORY_MAP[classificationResult.category].en
                : formatLabel(classificationResult.category))}
          </span>
          <div className="w-1.5 h-1.5 bg-gray-200 rounded-full"></div>
          <div className="bg-emerald-500 text-white px-2 py-0.5 rounded-md text-[10px] font-black">
            {classificationResult.confidence}%
          </div>
        </div>

        <p className="text-sm text-gray-500 font-medium max-w-sm mb-8 leading-relaxed">
          {formattedDescription}
        </p>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-lg">
          <button
            onClick={onNavigateToClassify}
            className="group h-14 bg-gray-900 text-white rounded-2xl font-bold text-sm transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] shadow-xl flex items-center justify-center gap-3"
          >
            <span>{language === "id" ? "Lihat Detail" : "View Details"}</span>
            <span className="group-hover:translate-x-1 transition-transform">→</span>
          </button>

          <button
            onClick={onClassifyAgain}
            className="h-14 bg-white text-gray-700 border-2 border-gray-100 rounded-2xl font-bold text-sm hover:bg-gray-50 transition-all duration-300"
          >
            {language === "id" ? "Klasifikasi Lagi" : "Classify Again"}
          </button>
        </div>

        <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mt-6 opacity-60">
          {language === "id"
            ? "Mendukung Daur Ulang & Pengurangan Sampah"
            : "Supporting Recycle & Waste Reduction"
          }
        </p>
      </div>
    </div>
  )
}
