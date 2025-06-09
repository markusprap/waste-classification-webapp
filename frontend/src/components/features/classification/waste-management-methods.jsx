"use client"

import { Recycle, Leaf, Trash2, RotateCcw } from "lucide-react"
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

  return (
    <section className="bg-gradient-to-br from-gray-50 to-gray-100 py-16 md:py-20" data-section="waste-methods">
      <div className="container mx-auto px-6 sm:px-8 md:px-12 lg:px-16">
        <div className="text-center mb-12">
          <div className="mb-4 inline-flex items-center rounded-full bg-green-100 px-6 py-3 text-sm font-medium text-green-700">
            ♻️ Sustainable Solutions
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            {t("classify.methods.title")}
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-6">
            {t("classify.methods.subtitle")}
          </p>
          {classificationData && (
            <div className="bg-gradient-to-r from-teal-50 to-emerald-50 border border-teal-200 rounded-lg p-4 max-w-xl mx-auto">
              <p className="text-teal-800 font-medium">
                {language === "id"
                  ? `💡 Rekomendasi untuk ${classificationData.typeId || classificationData.type}: ${classificationData.method === "recycle" ? "Daur Ulang" : classificationData.method === "compost" ? "Kompos" : classificationData.method === "reduce" ? "Kurangi" : "Gunakan Kembali"}`
                  : `💡 AI Recommendation for ${classificationData.type}: ${classificationData.method.charAt(0).toUpperCase() + classificationData.method.slice(1)}`}
              </p>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {methods.map((method) => {
            const Icon = method.icon
            const isRecommended = classificationData?.method === method.id

            return (
              <div
                key={method.id}
                className={`text-center p-6 rounded-xl transition-all duration-300 ${
                  isRecommended
                    ? "bg-gradient-to-br from-teal-50 to-emerald-50 border-2 border-teal-400 shadow-xl transform scale-105 relative overflow-hidden"
                    : "bg-white border border-gray-200 hover:shadow-lg hover:scale-102 hover:border-gray-300"
                }`}
              >
                {/* Recommended badge */}
                {isRecommended && (
                  <div className="absolute top-0 right-0 bg-gradient-to-r from-teal-500 to-emerald-500 text-white px-3 py-1 rounded-bl-lg text-xs font-bold">
                    {t("classify.methods.recommended")}
                  </div>
                )}
                
                <div
                  className={`w-16 h-16 rounded-full ${method.color} flex items-center justify-center mx-auto mb-4 transition-all duration-300 ${
                    isRecommended ? "ring-4 ring-teal-200 scale-110" : "hover:scale-105"
                  }`}
                >
                  <Icon className="h-8 w-8" />
                </div>
                <h3 className={`text-xl font-bold mb-2 ${isRecommended ? "text-teal-900" : "text-gray-900"}`}>
                  {language === "id" ? method.titleId : method.title}
                </h3>
                <p className={`text-sm leading-relaxed ${isRecommended ? "text-teal-700" : "text-gray-600"}`}>
                  {language === "id" ? method.descriptionId : method.description}
                </p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
