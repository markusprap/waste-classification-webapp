"use client"

import { Button } from "@/components/ui/button"
import { CheckCircle, Lightbulb, Recycle, Leaf, Trash2, RotateCcw } from "lucide-react"
import wasteInfo from "./waste-info.json"

// Mapping baru sesuai class_names.json
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

const DESCRIPTION_MAP = {
  Alat_Pembersih_Kimia: {
    id: 'Sisa alat pembersih berbahan kimia, seperti botol deterjen, pembersih lantai, dsb.',
    en: 'Waste from chemical cleaning tools, such as detergent bottles, floor cleaners, etc.'
  },
  Alumunium: {
    id: 'Sampah berbahan alumunium seperti kaleng minuman, foil, dsb.',
    en: 'Aluminum waste such as drink cans, foil, etc.'
  },
  Baterai: {
    id: 'Baterai bekas yang mengandung bahan berbahaya dan harus dibuang khusus.',
    en: 'Used batteries containing hazardous materials and must be specially disposed.'
  },
  Kaca: {
    id: 'Sampah kaca seperti botol kaca, pecahan kaca, dsb.',
    en: 'Glass waste such as glass bottles, glass shards, etc.'
  },
  Kardus: {
    id: 'Kardus bekas kemasan, kotak, dsb. Dapat didaur ulang.',
    en: 'Used cardboard packaging, boxes, etc. Can be recycled.'
  },
  Karet: {
    id: 'Sampah berbahan karet seperti ban, sandal, dsb.',
    en: 'Rubber waste such as tires, sandals, etc.'
  },
  Kertas: {
    id: 'Kertas bekas, koran, majalah, dsb. Dapat didaur ulang.',
    en: 'Used paper, newspapers, magazines, etc. Can be recycled.'
  },
  Lampu_dan_Elektronik: {
    id: 'Lampu bekas, elektronik rusak, dsb. Mengandung bahan berbahaya.',
    en: 'Used lamps, broken electronics, etc. Contain hazardous materials.'
  },
  Minyak_dan_Oli_Bekas: {
    id: 'Minyak goreng bekas, oli bekas kendaraan, dsb.',
    en: 'Used cooking oil, used vehicle oil, etc.'
  },
  Obat_dan_Medis: {
    id: 'Obat kadaluarsa, alat medis bekas, dsb.',
    en: 'Expired medicines, used medical equipment, etc.'
  },
  Plastik: {
    id: 'Sampah plastik seperti botol, kantong, kemasan, dsb.',
    en: 'Plastic waste such as bottles, bags, packaging, etc.'
  },
  Sisa_Buah_dan_Sayur: {
    id: 'Sisa buah dan sayur dari dapur, pasar, dsb.',
    en: 'Fruit and vegetable waste from kitchen, market, etc.'
  },
  Sisa_Makanan: {
    id: 'Sisa makanan yang tidak habis dikonsumsi.',
    en: 'Leftover food that is not consumed.'
  },
  Styrofoam: {
    id: 'Kemasan makanan/minuman berbahan styrofoam.',
    en: 'Food/drink packaging made of styrofoam.'
  },
  Tekstil: {
    id: 'Kain bekas, pakaian, dsb.',
    en: 'Used fabrics, clothes, etc.'
  },
};

const DISPOSAL_MAP = {
  Alat_Pembersih_Kimia: {
    id: 'Buang di TPS B3 atau tempat sampah khusus bahan kimia.',
    en: 'Dispose at hazardous waste (B3) collection points.'
  },
  Alumunium: {
    id: 'Kumpulkan dan jual ke pengepul atau bank sampah.',
    en: 'Collect and sell to scrap collectors or waste banks.'
  },
  Baterai: {
    id: 'Jangan buang ke sampah biasa, serahkan ke dropbox baterai.',
    en: 'Do not throw in regular trash, hand over to battery dropbox.'
  },
  Kaca: {
    id: 'Pisahkan dan buang di tempat sampah kaca atau bank sampah.',
    en: 'Separate and dispose in glass bin or waste bank.'
  },
  Kardus: {
    id: 'Lipat dan kumpulkan untuk didaur ulang.',
    en: 'Flatten and collect for recycling.'
  },
  Karet: {
    id: 'Kumpulkan dan serahkan ke bank sampah atau pengepul.',
    en: 'Collect and hand over to waste bank or collectors.'
  },
  Kertas: {
    id: 'Pisahkan dan kumpulkan untuk didaur ulang.',
    en: 'Separate and collect for recycling.'
  },
  Lampu_dan_Elektronik: {
    id: 'Serahkan ke dropbox elektronik atau TPS B3.',
    en: 'Hand over to electronics dropbox or hazardous waste collection.'
  },
  Minyak_dan_Oli_Bekas: {
    id: 'Jangan buang ke saluran air, serahkan ke pengelola limbah.',
    en: 'Do not pour into drains, hand over to waste managers.'
  },
  Obat_dan_Medis: {
    id: 'Serahkan ke apotek atau fasilitas kesehatan.',
    en: 'Hand over to pharmacies or health facilities.'
  },
  Plastik: {
    id: 'Pisahkan dan kumpulkan untuk didaur ulang.',
    en: 'Separate and collect for recycling.'
  },
  Sisa_Buah_dan_Sayur: {
    id: 'Dapat dijadikan kompos atau pakan ternak.',
    en: 'Can be composted or used as animal feed.'
  },
  Sisa_Makanan: {
    id: 'Dapat dijadikan kompos atau pakan ternak.',
    en: 'Can be composted or used as animal feed.'
  },
  Styrofoam: {
    id: 'Kurangi penggunaan, buang di tempat sampah residu.',
    en: 'Reduce use, dispose in residual waste bin.'
  },
  Tekstil: {
    id: 'Sumbangkan jika masih layak pakai, atau daur ulang.',
    en: 'Donate if still usable, or recycle.'
  },
};

const RECOMMENDATION_MAP = {
  Alat_Pembersih_Kimia: {
    id: 'Gunakan secukupnya dan pilih produk ramah lingkungan.',
    en: 'Use as needed and choose eco-friendly products.'
  },
  Alumunium: {
    id: 'Bersihkan sebelum dikumpulkan agar mudah didaur ulang.',
    en: 'Clean before collecting for easier recycling.'
  },
  Baterai: {
    id: 'Kumpulkan terpisah dan serahkan ke dropbox baterai.',
    en: 'Collect separately and hand over to battery dropbox.'
  },
  Kaca: {
    id: 'Pisahkan berdasarkan warna jika memungkinkan.',
    en: 'Separate by color if possible.'
  },
  Kardus: {
    id: 'Jaga agar tetap kering agar mudah didaur ulang.',
    en: 'Keep dry for easier recycling.'
  },
  Karet: {
    id: 'Manfaatkan kembali jika memungkinkan.',
    en: 'Reuse if possible.'
  },
  Kertas: {
    id: 'Jangan campur dengan sampah basah.',
    en: 'Do not mix with wet waste.'
  },
  Lampu_dan_Elektronik: {
    id: 'Jangan dibongkar sendiri, serahkan ke fasilitas resmi.',
    en: 'Do not dismantle yourself, hand over to official facilities.'
  },
  Minyak_dan_Oli_Bekas: {
    id: 'Gunakan kembali jika memungkinkan, jangan buang sembarangan.',
    en: 'Reuse if possible, do not dispose carelessly.'
  },
  Obat_dan_Medis: {
    id: 'Jangan buang ke toilet/sungai.',
    en: 'Do not throw into toilet/river.'
  },
  Plastik: {
    id: 'Kurangi penggunaan plastik sekali pakai.',
    en: 'Reduce single-use plastic.'
  },
  Sisa_Buah_dan_Sayur: {
    id: 'Jadikan kompos untuk pupuk alami.',
    en: 'Compost for natural fertilizer.'
  },
  Sisa_Makanan: {
    id: 'Jadikan kompos untuk pupuk alami.',
    en: 'Compost for natural fertilizer.'
  },
  Styrofoam: {
    id: 'Hindari penggunaan styrofoam.',
    en: 'Avoid using styrofoam.'
  },
  Tekstil: {
    id: 'Daur ulang atau donasikan jika masih layak.',
    en: 'Recycle or donate if still usable.'
  },
};

const WASTE_METHOD_MAP = {
  Alat_Pembersih_Kimia: 'reduce',
  Alumunium: 'recycle',
  Baterai: 'reduce',
  Kaca: 'recycle',
  Kardus: 'recycle',
  Karet: 'reuse',
  Kertas: 'recycle',
  Lampu_dan_Elektronik: 'reduce',
  Minyak_dan_Oli_Bekas: 'reduce',
  Obat_dan_Medis: 'reduce',
  Plastik: 'recycle',
  Sisa_Buah_dan_Sayur: 'compost',
  Sisa_Makanan: 'compost',
  Styrofoam: 'reduce',
  Tekstil: 'reuse',
};

// Helper functions to map ML service responses to UI elements
function getCategoryDisplay(category, language) {
  return CATEGORY_MAP[category] ? CATEGORY_MAP[category][language] : (language === 'id' ? 'Lainnya' : 'Other');
}
function getDescription(category, language) {
  return DESCRIPTION_MAP[category] ? DESCRIPTION_MAP[category][language] : '';
}
function getDisposal(category, language) {
  return DISPOSAL_MAP[category] ? DISPOSAL_MAP[category][language] : '';
}
function getRecommendation(category, language) {
  return RECOMMENDATION_MAP[category] ? RECOMMENDATION_MAP[category][language] : '';
}
function getWasteMethod(category) {
  return WASTE_METHOD_MAP[category] || 'reduce';
}

// Helper untuk ambil info dari waste-info.json
function getWasteInfo(subCategory, field, language) {
  if (!subCategory || !wasteInfo[subCategory]) return '';
  return wasteInfo[subCategory][field]?.[language] || '';
}

// Tambahkan helper untuk mengubah underscore menjadi spasi
function formatLabel(label) {
  if (!label) return '';
  return label.replace(/_/g, ' ');
}

// Tambahkan mapping main category
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

export function ClassificationResultCard({ result, language, onClassifyAgain, isLoading }) {
  if (!result) return null

  // Loading animation (modern spinner)
  if (isLoading) {
    return (
      <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-white/80 rounded-xl">
        <div className="w-16 h-16 mb-4 relative flex items-center justify-center">
          <span className="absolute inline-flex h-full w-full rounded-full bg-gradient-to-tr from-green-400 via-blue-400 to-yellow-400 opacity-30 animate-spin"></span>
          <span className="relative inline-flex rounded-full h-12 w-12 bg-gradient-to-tr from-green-400 via-blue-400 to-yellow-400 animate-spin-slow"></span>
          <span className="absolute inset-2 rounded-full bg-white"></span>
        </div>
        <div className="text-lg font-semibold text-gray-700 animate-pulse">
          {language === "id" ? "Mengklasifikasikan gambar..." : "Classifying image..."}
        </div>
      </div>
    )
  }

  const getMethodIcon = (method) => {
    const methodToUse = result.method || getWasteMethod(result.category);
    switch (methodToUse) {
      case 'recycle':
        return <Recycle className="w-5 h-5" />
      case 'compost':
        return <Leaf className="w-5 h-5" />
      case 'reduce':
        return <Trash2 className="w-5 h-5" />
      case 'reuse':
        return <RotateCcw className="w-5 h-5" />
      default:
        return <CheckCircle className="w-5 h-5" />
    }
  }

  const getMethodColor = (method) => {
    const methodToUse = result.method || getWasteMethod(result.category);
    switch (methodToUse) {
      case 'recycle':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'compost':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'reduce':
        return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'reuse':
        return 'bg-purple-100 text-purple-800 border-purple-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }
  const getMethodName = (method) => {
    const methodToUse = result.method || getWasteMethod(result.category);
    const methods = {
      recycle: { en: "Recycle", id: "Daur Ulang" },
      compost: { en: "Compost", id: "Kompos" },
      reduce: { en: "Reduce", id: "Kurangi" },
      reuse: { en: "Reuse", id: "Gunakan Kembali" },
      dispose: { en: "Dispose", id: "Buang" }
    }
    return methods[methodToUse] ? (language === "id" ? methods[methodToUse].id : methods[methodToUse].en) : methodToUse
  }
  return (
    <div className="relative space-y-6">
      {/* Loading Spinner Overlay */}
      {isLoading && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-white/80 rounded-xl">
          <div className="w-16 h-16 mb-4 relative flex items-center justify-center">
            <span className="absolute inline-flex h-full w-full rounded-full bg-gradient-to-tr from-green-400 via-blue-400 to-yellow-400 opacity-30 animate-spin"></span>
            <span className="relative inline-flex rounded-full h-12 w-12 bg-gradient-to-tr from-green-400 via-blue-400 to-yellow-400 animate-spin-slow"></span>
            <span className="absolute inset-2 rounded-full bg-white"></span>
          </div>
          <div className="text-lg font-semibold text-gray-700 animate-pulse">
            {language === "id" ? "Mengklasifikasikan gambar..." : "Classifying image..."}
          </div>
        </div>
      )}
      {/* Main Classification Result - match home page style */}
      <div className="p-6 bg-gray-100 border-t rounded-xl">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            {language === "id"
              ? getCategoryDisplay(result.typeId || result.type, 'id')
              : getCategoryDisplay(result.type || result.typeId, 'en')}
          </h3>
          <p className="text-gray-600 mb-2">
            {/* Main category, not sub category */}
            {language === "id"
              ? (result.category && MAIN_CATEGORY_MAP[result.category] ? MAIN_CATEGORY_MAP[result.category].id : formatLabel(result.category))
              : (result.category && MAIN_CATEGORY_MAP[result.category] ? MAIN_CATEGORY_MAP[result.category].en : formatLabel(result.category))}
          </p>
          <div className="inline-flex items-center bg-green-100 px-3 py-1 rounded-full text-sm font-medium text-green-800 mb-4">
            {result.confidence}% {language === "id" ? "akurasi" : "confidence"}
          </div>
          <p className="text-gray-500 mt-2">
            {language === "id"
              ? `Item ini diklasifikasikan sebagai ${getCategoryDisplay(result.typeId || result.type, 'id')} (${result.category && MAIN_CATEGORY_MAP[result.category] ? MAIN_CATEGORY_MAP[result.category].id : formatLabel(result.category)})`
              : `This item is classified as ${getCategoryDisplay(result.type || result.typeId, 'en')} (${result.category && MAIN_CATEGORY_MAP[result.category] ? MAIN_CATEGORY_MAP[result.category].en : formatLabel(result.category)})`}
          </p>
        </div>
      </div>      {/* Disposal Instructions */}
      <div className="bg-blue-50 rounded-lg border border-blue-200 p-6">
        <div className="flex items-center space-x-2 mb-3">
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
            <Trash2 className="w-4 h-4 text-blue-600" />
          </div>
          <h4 className="font-semibold text-blue-900">
            {language === "id" ? "Cara Pembuangan" : "Disposal Instructions"}
          </h4>
        </div>
        <p className="text-blue-800">
          {getWasteInfo(result.typeId || result.type, 'disposal', language)}
        </p>
      </div>
      {/* Recommendation */}
      <div className="bg-green-50 rounded-lg border border-green-200 p-6">
        <div className="flex items-center space-x-2 mb-3">
          <Lightbulb className="h-5 w-5 text-green-600" />
          <h4 className="font-semibold text-green-900">
            {language === "id" ? "Rekomendasi Pengolahan" : "Processing Recommendation"}
          </h4>
        </div>
        <p className="text-green-800">
          {getWasteInfo(result.typeId || result.type, 'recommendation', language)}
        </p>
      </div>      {/* Environmental Impact */}
      <div className="bg-yellow-50 rounded-lg border border-yellow-200 p-6">
        <div className="flex items-center space-x-2 mb-3">
          <Leaf className="h-5 w-5 text-yellow-600" />
          <h4 className="font-semibold text-yellow-900">
            {language === "id" ? "Dampak Lingkungan" : "Environmental Impact"}
          </h4>
        </div>
        <p className="text-yellow-800">
          {getWasteInfo(result.typeId || result.type, 'environmental_impact', language)}
        </p>
      </div>

      {/* Action Buttons */}      <div className="flex flex-col sm:flex-row gap-3">
        <Button 
          onClick={onClassifyAgain} 
          className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:from-emerald-700 hover:to-teal-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
        >
          {language === "id" ? "Klasifikasi Lagi" : "Classify Again"}
        </Button>
        
        <Button 
          variant="outline" 
          className="flex-1 border-emerald-300 text-emerald-700 hover:bg-emerald-50 hover:border-emerald-400 transition-all duration-300 shadow-md"
          onClick={() => {
            // Scroll to waste management methods section
            const methodsSection = document.querySelector('[data-section="waste-methods"]')
            if (methodsSection) {
              methodsSection.scrollIntoView({ behavior: 'smooth' })
            }
          }}
        >
          {language === "id" ? "Lihat Metode Pengelolaan" : "View Management Methods"}
        </Button>
      </div>
    </div>
  )
}
