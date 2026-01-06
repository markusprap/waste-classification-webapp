"use client"

import { Recycle, Leaf, Trash2, RotateCcw, Zap } from "lucide-react"
import { useLanguage } from "@/models/language-context"

const methods = [
  {
    id: "recycle",
    icon: Recycle,
    color: "bg-blue-100 text-blue-600",
    title: "Recycle",
    titleId: "Daur Ulang",
    description: "Processing waste into new useful materials or products",
    descriptionId: "Memproses sampah menjadi bahan atau produk baru yang berguna",
  },
  {
    id: "compost",
    icon: Leaf,
    color: "bg-green-100 text-green-600",
    title: "Compost",
    titleId: "Kompos",
    description: "Converting organic waste into natural fertilizer",
    descriptionId: "Mengubah sampah organik menjadi pupuk alami",
  },
  {
    id: "reduce",
    icon: Trash2,
    color: "bg-orange-100 text-orange-600",
    title: "Reduce",
    titleId: "Kurangi",
    description: "Minimizing the use of items that could become waste",
    descriptionId: "Meminimalkan penggunaan barang yang bisa menjadi sampah",
  },
  {
    id: "reuse",
    icon: RotateCcw,
    color: "bg-purple-100 text-purple-600",
    title: "Reuse",
    titleId: "Gunakan Kembali",
    description: "Using items again that are still in good condition",
    descriptionId: "Menggunakan kembali barang yang masih dalam kondisi baik",
  },
]

export function WasteManagementMethods({ classificationData }) {
  const { t, language } = useLanguage()

  const getMethodFromCategory = (category) => {
    const methodMap = {
      'cardboard': 'recycle',
      'glass': 'recycle',
      'metal': 'recycle',
      'paper': 'recycle',
      'plastic': 'recycle',
      'trash': 'reduce',
      'battery': 'reduce',
      'biological': 'compost',
      'clothes': 'reuse',
      'shoes': 'reuse',
      'white-glass': 'recycle',
      'other': 'reduce'
    };

    return methodMap[category] || 'reduce';
  }

  function formatLabel(label) {
    if (!label) return '';
    return label.replace(/_/g, ' ');
  }

  return (
    <section className="bg-gray-50/30 py-24 md:py-32 border-y border-gray-100 relative overflow-hidden" data-section="waste-methods">
      {/* Decorative Blur */}
      <div className="absolute top-0 right-0 w-[40%] h-[40%] bg-emerald-50/50 blur-[120px] rounded-full pointer-events-none"></div>

      <div className="container mx-auto px-6 sm:px-8 md:px-12 lg:px-16 relative z-10">
        <div className="text-center mb-20 max-w-3xl mx-auto">
          <div className="mb-6 inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full text-xs font-black text-gray-500 uppercase tracking-widest shadow-sm border border-gray-100">
            <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
            Global Eco Standards
          </div>
          <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-8 tracking-tight">
            {t("classify.methods.title")}
          </h2>
          <p className="text-xl text-gray-500 font-medium leading-relaxed">
            {t("classify.methods.subtitle")}
          </p>

          {classificationData && (
            <div className="mt-10 inline-block animate-bounce-subtle">
              <div className="bg-white border-2 border-emerald-500 rounded-3xl p-6 shadow-2xl shadow-emerald-500/10 flex items-center gap-6">
                <div className="w-14 h-14 bg-emerald-500 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
                  <Zap className="w-7 h-7 text-white" />
                </div>
                <div className="text-left">
                  <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-1">AI SMART RECOMMENDATION</p>
                  <p className="text-xl font-black text-gray-900">
                    {language === "id"
                      ? `${methods.find(m => m.id === (classificationData.method || getMethodFromCategory(classificationData.category)))?.titleId || "-"}`
                      : `${methods.find(m => m.id === (classificationData.method || getMethodFromCategory(classificationData.category)))?.title || "-"}`
                    }
                    <span className="text-gray-400 font-bold ml-2">for {formatLabel(classificationData.type || classificationData.category || 'this item')}</span>
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {methods.map((method, idx) => {
            const Icon = method.icon
            const isRecommended = classificationData &&
              (classificationData.method === method.id ||
                (!classificationData.method && getMethodFromCategory(classificationData.category) === method.id))

            const themeColors = {
              recycle: "text-blue-600 bg-blue-50 border-blue-100 glow-blue",
              compost: "text-emerald-600 bg-emerald-50 border-emerald-100 glow-emerald",
              reduce: "text-amber-600 bg-amber-50 border-amber-100 glow-amber",
              reuse: "text-teal-600 bg-teal-50 border-teal-100 glow-teal"
            }

            return (
              <div
                key={method.id}
                className={`
                  group p-10 rounded-[2.5rem] transition-all duration-700 relative overflow-hidden flex flex-col items-center text-center
                  ${isRecommended
                    ? "bg-white border-4 border-emerald-500 shadow-[0_30px_60px_rgba(0,0,0,0.1)] scale-105 z-20"
                    : "bg-white border border-gray-100 hover:border-gray-300 shadow-sm hover:shadow-xl hover:-translate-y-2"}
                `}
                style={{ animationDelay: `${idx * 0.1}s` }}
              >
                {isRecommended && (
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 bg-emerald-500 text-white px-6 py-2 rounded-b-[1.25rem] text-[10px] font-black uppercase tracking-widest shadow-lg">
                    {t("classify.methods.recommended")} 🌟
                  </div>
                )}

                <div className={`
                  w-24 h-24 rounded-[2rem] flex items-center justify-center mb-8 transition-all duration-700
                  ${themeColors[method.id]} group-hover:scale-110 group-hover:rotate-6
                `}>
                  <Icon className="h-10 w-10" />
                </div>

                <h3 className="text-2xl font-black text-gray-900 mb-4 tracking-tight uppercase">
                  {language === "id" ? method.titleId : method.title}
                </h3>
                <p className="text-gray-500 font-medium text-sm leading-relaxed mb-6">
                  {language === "id" ? method.descriptionId : method.description}
                </p>

                <div className="mt-auto pt-6 w-full">
                  <div className="w-12 h-1.5 bg-gray-100 mx-auto rounded-full group-hover:w-24 group-hover:bg-emerald-500 transition-all duration-500"></div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
      <style jsx>{`
        .glow-blue { shadow-lg ring-blue-500/20 }
        .glow-emerald { shadow-lg ring-emerald-500/20 }
        .glow-amber { shadow-lg ring-amber-500/20 }
        .glow-teal { shadow-lg ring-teal-500/20 }
      `}</style>
    </section>
  )
}
