"use client"

import { Recycle, Leaf, Trash2, RotateCcw } from "lucide-react"
import { useLanguage } from "@/context/language-context"

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
  const { language } = useLanguage()

  return (
    <section className="bg-white py-16 md:py-20" data-section="waste-methods">
      <div className="container mx-auto px-6 sm:px-8 md:px-12 lg:px-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            {language === "id" ? "Metode Pengelolaan Sampah" : "Waste Management Methods"}
          </h2>
          {classificationData && (
            <p className="text-lg text-gray-600">
              {language === "id"
                ? `Rekomendasi untuk ${classificationData.typeId || classificationData.type}: ${classificationData.method === "recycle" ? "Daur Ulang" : classificationData.method === "compost" ? "Kompos" : classificationData.method === "reduce" ? "Kurangi" : "Gunakan Kembali"}`
                : `Recommended for ${classificationData.type}: ${classificationData.method.charAt(0).toUpperCase() + classificationData.method.slice(1)}`}
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {methods.map((method) => {
            const Icon = method.icon
            const isRecommended = classificationData?.method === method.id

            return (
              <div
                key={method.id}
                className={`text-center p-6 rounded-lg transition-all duration-200 ${
                  isRecommended
                    ? "bg-teal-50 border-2 border-teal-500 shadow-lg transform scale-105"
                    : "bg-gray-50 border border-gray-200 hover:shadow-md hover:scale-102"
                }`}
              >
                <div
                  className={`w-16 h-16 rounded-full ${method.color} flex items-center justify-center mx-auto mb-4 ${
                    isRecommended ? "ring-4 ring-teal-200" : ""
                  }`}
                >
                  <Icon className="h-8 w-8" />
                </div>
                <h3 className={`text-xl font-bold mb-2 ${isRecommended ? "text-teal-900" : "text-gray-900"}`}>
                  {language === "id" ? method.titleId : method.title}
                  {isRecommended && (
                    <span className="ml-2 text-sm bg-teal-500 text-white px-2 py-1 rounded-full">
                      {language === "id" ? "Direkomendasikan" : "Recommended"}
                    </span>
                  )}
                </h3>
                <p className={`text-sm ${isRecommended ? "text-teal-700" : "text-gray-600"}`}>
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