"use client"

import { Button } from "@/components/ui/button"
import { CheckCircle, Lightbulb, Recycle, Leaf, Trash2, RotateCcw, Target } from "lucide-react"
import wasteInfo from "./waste-info.json"

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

function getWasteInfo(subCategory, field, language) {
  if (!subCategory || !wasteInfo[subCategory]) return '';
  return wasteInfo[subCategory][field]?.[language] || '';
}

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

export function ClassificationResultCard({ result, language, onClassifyAgain, isLoading }) {
  if (!result) return null

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
    <div className="relative space-y-8 animate-fade-in">
      {/* Main Status Card */}
      <div className="bg-white rounded-[2.5rem] shadow-[0_15px_40px_rgba(0,0,0,0.03)] border border-gray-100 p-8 md:p-12 relative overflow-hidden">
        {/* Dynamic Background */}
        <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-emerald-100/30 to-teal-100/30 blur-3xl opacity-50"></div>

        <div className="relative z-10 flex flex-col items-center text-center">
          {/* Badge */}
          <div className="mb-8 inline-flex items-center gap-2 bg-emerald-50 text-emerald-700 px-5 py-2 rounded-full text-xs font-black uppercase tracking-widest border border-emerald-100 shadow-sm animate-bounce-subtle">
            <CheckCircle className="w-4 h-4" />
            Confirmed by WasteWise AI
          </div>

          {/* Title */}
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-4 tracking-tight">
            {language === "id"
              ? getCategoryDisplay(result.typeId || result.type, 'id')
              : getCategoryDisplay(result.type || result.typeId, 'en')}
          </h1>

          {/* Subtitle */}
          <div className="flex items-center gap-3 mb-8">
            <span className="text-xl font-bold text-gray-400">
              {language === "id"
                ? (result.category && MAIN_CATEGORY_MAP[result.category] ? MAIN_CATEGORY_MAP[result.category].id : formatLabel(result.category))
                : (result.category && MAIN_CATEGORY_MAP[result.category] ? MAIN_CATEGORY_MAP[result.category].en : formatLabel(result.category))}
            </span>
            <div className="w-2 h-2 bg-gray-200 rounded-full"></div>
            <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500 rounded-lg text-white font-black text-sm shadow-lg shadow-emerald-500/20">
              {result.confidence}%
            </div>
          </div>

          <p className="text-lg text-gray-500 max-w-lg leading-relaxed mb-10">
            {language === "id"
              ? `Item ini diklasifikasikan sebagai ${getCategoryDisplay(result.typeId || result.type, 'id')} dengan tingkat kepercayaan ${result.confidence}%.`
              : `This item is classified as ${getCategoryDisplay(result.type || result.typeId, 'en')} with a ${result.confidence}% confidence level.`}
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full">
            <InfoStat
              icon={<Trash2 className="w-5 h-5" />}
              label={language === "id" ? "Pembuangan" : "Disposal"}
              value={language === "id" ? "Tepat" : "Precise"}
              color="blue"
            />
            <InfoStat
              icon={<Recycle className="w-5 h-5" />}
              label={language === "id" ? "Metode" : "Method"}
              value={getMethodName()}
              color="emerald"
            />
            <InfoStat
              icon={<Leaf className="w-5 h-5" />}
              label={language === "id" ? "Eco-Rate" : "Eco-Rate"}
              value="High"
              color="teal"
            />
            <InfoStat
              icon={<Target className="w-5 h-5" />}
              label={language === "id" ? "Verifikasi" : "Verified"}
              value="AI Base"
              color="amber"
            />
          </div>
        </div>
      </div>

      {/* Warning if low confidence */}
      {result.confidence < 70 && (
        <div className="bg-amber-50 border border-amber-100 rounded-[2rem] p-8 animate-slide-up">
          <div className="flex items-start gap-5">
            <div className="w-14 h-14 bg-amber-100 rounded-2xl flex items-center justify-center flex-shrink-0">
              <Lightbulb className="w-7 h-7 text-amber-600" />
            </div>
            <div>
              <h4 className="text-xl font-black text-amber-900 mb-3 tracking-tight">
                {language === "id" ? "Optimasi Hasil Klasifikasi" : "Optimize Classification"}
              </h4>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2 text-amber-700 font-medium text-sm">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-amber-400 rounded-full"></span>
                  {language === "id" ? "Gunakan cahaya yang terang" : "Use bright lighting"}
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-amber-400 rounded-full"></span>
                  {language === "id" ? "Jarak objek optimal (15-30cm)" : "Optimal distance (15-30cm)"}
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-amber-400 rounded-full"></span>
                  {language === "id" ? "Background minimalis/polos" : "Clean/minimal background"}
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-amber-400 rounded-full"></span>
                  {language === "id" ? "Fokus pada satu objek tunggal" : "Focus on a single object"}
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Info Boxes Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <DetailCard
          icon={<Trash2 className="w-6 h-6" />}
          title={language === "id" ? "Instruksi Pembuangan" : "Disposal Guide"}
          content={getWasteInfo(result.typeId || result.type, 'disposal', language)}
          color="blue"
        />
        <DetailCard
          icon={<Lightbulb className="w-6 h-6" />}
          title={language === "id" ? "Rekomendasi Olah" : "Processing Ops"}
          content={getWasteInfo(result.typeId || result.type, 'recommendation', language)}
          color="emerald"
        />
        <DetailCard
          icon={<Leaf className="w-6 h-6" />}
          title={language === "id" ? "Dampak Lingkungan" : "Eco-Impact"}
          content={getWasteInfo(result.typeId || result.type, 'environmental_impact', language)}
          color="teal"
        />
      </div>

      {/* Final Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 pt-4">
        <Button
          onClick={onClassifyAgain}
          className="h-16 flex-1 bg-gray-900 text-white rounded-[1.25rem] font-bold text-lg hover:bg-gray-800 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] shadow-xl group"
        >
          <RotateCcw className="w-5 h-5 mr-3 group-hover:rotate-[-45deg] transition-transform" />
          {language === "id" ? "Ulangi Klasifikasi" : "New Classification"}
        </Button>

        <Button
          variant="outline"
          className="h-16 flex-1 border-2 border-emerald-500 text-emerald-700 rounded-[1.25rem] font-bold text-lg hover:bg-emerald-50 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg"
          onClick={() => {
            const methodsSection = document.querySelector('[data-section="waste-methods"]')
            if (methodsSection) {
              methodsSection.scrollIntoView({ behavior: 'smooth' })
            }
          }}
        >
          <Recycle className="w-5 h-5 mr-3" />
          {language === "id" ? "Metode Alternatif" : "Alternative Methods"}
        </Button>
      </div>
      <style jsx global>{`
        @keyframes bounce-subtle {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }
        .animate-bounce-subtle {
          animation: bounce-subtle 4s ease-in-out infinite;
        }
      `}</style>
    </div>
  )
}

function InfoStat({ icon, label, value, color }) {
  const colors = {
    blue: "text-blue-600 bg-blue-50",
    emerald: "text-emerald-600 bg-emerald-50",
    teal: "text-teal-600 bg-teal-50",
    amber: "text-amber-600 bg-amber-50"
  }
  return (
    <div className="bg-gray-50/50 rounded-2xl p-4 border border-gray-100 flex flex-col items-center">
      <div className={`w-10 h-10 rounded-xl ${colors[color]} flex items-center justify-center mb-2`}>
        {icon}
      </div>
      <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">{label}</span>
      <span className="text-sm font-bold text-gray-900">{value}</span>
    </div>
  )
}

function DetailCard({ icon, title, content, color }) {
  const colors = {
    blue: "bg-blue-50 border-blue-100 text-blue-900 icon-blue",
    emerald: "bg-emerald-50 border-emerald-100 text-emerald-900 icon-emerald",
    teal: "bg-teal-50 border-teal-100 text-teal-900 icon-teal"
  }
  const iconColors = {
    blue: "bg-blue-500 text-white",
    emerald: "bg-emerald-500 text-white",
    teal: "bg-teal-500 text-white"
  }
  return (
    <div className={`rounded-[2rem] p-8 border ${colors[color]} shadow-sm transition-all duration-300 hover:shadow-md h-full flex flex-col`}>
      <div className={`w-12 h-12 rounded-2xl ${iconColors[color]} flex items-center justify-center mb-6 shadow-lg shadow-black/5`}>
        {icon}
      </div>
      <h4 className="font-black text-lg mb-4 tracking-tight">{title}</h4>
      <p className="text-sm font-medium opacity-80 leading-relaxed">
        {content}
      </p>
    </div>
  )
}
