"use client"

import { CheckCircle } from "lucide-react"
import { useLanguage } from "@/context/language-context"

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
          {language === "id" ? classificationResult.typeId : classificationResult.type}
        </h3>
        <p className="text-gray-600 mb-2">
          {language === "id" ? classificationResult.categoryId : classificationResult.category}
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
            className="w-full bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors font-medium flex items-center justify-center space-x-2"
          >
            <span>{language === "id" ? "Lihat Detail & Rekomendasi" : "View Details & Recommendations"}</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
          <button
            onClick={onClassifyAgain}
            className="w-full bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300 transition-colors"
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