"use client"

import { Button } from "@/components/ui/button"
import { CheckCircle, Lightbulb, Recycle, Leaf, Trash2, RotateCcw } from "lucide-react"

export function ClassificationResultCard({ result, language, onClassifyAgain }) {
  if (!result) return null

  const getMethodIcon = (method) => {
    switch (method) {
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
    switch (method) {
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
    const methods = {
      recycle: { en: "Recycle", id: "Daur Ulang" },
      compost: { en: "Compost", id: "Kompos" },
      reduce: { en: "Reduce", id: "Kurangi" },
      reuse: { en: "Reuse", id: "Gunakan Kembali" },
      dispose: { en: "Dispose", id: "Buang" }
    }
    return methods[method] ? (language === "id" ? methods[method].id : methods[method].en) : method
  }

  return (
    <div className="space-y-6">
      {/* Main Classification Result - match home page style */}
      <div className="p-6 bg-gray-100 border-t rounded-xl">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            {language === "id" ? result.typeId : result.type}
          </h3>
          <p className="text-gray-600 mb-2">
            {language === "id" ? result.categoryId : result.category}
          </p>
          <div className="inline-flex items-center bg-green-100 px-3 py-1 rounded-full text-sm font-medium text-green-800 mb-4">
            {result.confidence}% {language === "id" ? "akurasi" : "confidence"}
          </div>
          <p className="text-sm text-gray-600 mb-6">
            {language === "id" ? result.descriptionId : result.description}
          </p>
        </div>
      </div>  

      {/* Disposal Instructions */}
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
          {language === "id" ? result.disposalId : result.disposal}
        </p>
      </div>

      {/* Recommendation */}
      {result.recommendation && (
        <div className="bg-green-50 rounded-lg border border-green-200 p-6">
          <div className="flex items-center space-x-2 mb-3">
            <Lightbulb className="h-5 w-5 text-green-600" />
            <h4 className="font-semibold text-green-900">
              {language === "id" ? "Rekomendasi Pengolahan" : "Processing Recommendation"}
            </h4>
          </div>
          <p className="text-green-800">
            {language === "id" ? result.recommendationId : result.recommendation}
          </p>
        </div>
      )}

      {/* Environmental Impact */}
      <div className="bg-yellow-50 rounded-lg border border-yellow-200 p-6">
        <div className="flex items-center space-x-2 mb-3">
          <Leaf className="h-5 w-5 text-yellow-600" />
          <h4 className="font-semibold text-yellow-900">
            {language === "id" ? "Dampak Lingkungan" : "Environmental Impact"}
          </h4>
        </div>
        <p className="text-yellow-800">
          {language === "id" 
            ? `Dengan mengelola ${result.typeId || result.type} dengan benar, Anda membantu mengurangi polusi dan menjaga lingkungan.`
            : `By properly managing ${result.type}, you help reduce pollution and protect the environment.`
          }
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Button 
          onClick={onClassifyAgain} 
          className="flex-1 bg-black text-white hover:bg-gray-800"
        >
          {language === "id" ? "Klasifikasi Lagi" : "Classify Again"}
        </Button>
        
        <Button 
          variant="outline" 
          className="flex-1 border-gray-300 hover:bg-gray-50"
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
