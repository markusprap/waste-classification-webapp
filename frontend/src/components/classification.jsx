"use client"

import { CheckCircle } from "lucide-react"
import { useLanguage } from "@/models/language-context"

function formatLabel(label) {
  if (!label) return '';
  return label.replace(/_/g, ' ');
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
            ? formatLabel(classificationResult.typeId)
            : formatLabel(classificationResult.type)}
        </h3>
        <p className="text-gray-600 mb-2">
          {language === "id"
            ? formatLabel(classificationResult.categoryId)
            : formatLabel(classificationResult.category)}
        </p>
        <div className="inline-flex items-center bg-green-100 px-3 py-1 rounded-full text-sm font-medium text-green-800 mb-4">
          {classificationResult.confidence}% {language === "id" ? "akurasi" : "confidence"}
        </div>
        {classificationResult.method && (
          <div
            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold mb-4 border no-underline
              ${classificationResult.method === 'recycle' ? 'bg-blue-100 text-blue-800 border-blue-200' : ''}
              ${classificationResult.method === 'compost' ? 'bg-green-100 text-green-800 border-green-200' : ''}
              ${classificationResult.method === 'reduce' ? 'bg-orange-100 text-orange-800 border-orange-200' : ''}
              ${classificationResult.method === 'reuse' ? 'bg-purple-100 text-purple-800 border-purple-200' : ''}
              ${classificationResult.method === 'special' ? 'bg-red-100 text-red-800 border-red-200' : ''}
              ${classificationResult.method === 'check' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' : ''}
            `}
            style={{marginBottom: 16}}
          >
            {language === 'id' ?
              (classificationResult.method === 'recycle' ? 'Daur Ulang' :
                classificationResult.method === 'compost' ? 'Kompos' :
                classificationResult.method === 'reduce' ? 'Kurangi' :
                classificationResult.method === 'reuse' ? 'Gunakan Kembali' :
                classificationResult.method === 'special' ? 'Pembuangan Khusus' :
                classificationResult.method === 'check' ? 'Periksa Manual' :
                classificationResult.method)
              :
              (classificationResult.method === 'recycle' ? 'Recycle' :
                classificationResult.method === 'compost' ? 'Compost' :
                classificationResult.method === 'reduce' ? 'Reduce' :
                classificationResult.method === 'reuse' ? 'Reuse' :
                classificationResult.method === 'special' ? 'Special Disposal' :
                classificationResult.method === 'check' ? 'Check Manual' :
                classificationResult.method)
            }
          </div>
        )}
        <p className="text-sm text-gray-600 mb-6">
          {language === "id" ? classificationResult.descriptionId : classificationResult.description}
        </p>
        <div className="space-y-3">          <button
            onClick={onNavigateToClassify}
            className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white px-6 py-3 rounded-lg transition-all duration-300 font-medium flex items-center justify-center space-x-2 transform hover:scale-105 shadow-lg"
          >
            <span>{language === "id" ? "Lihat Detail & Rekomendasi" : "View Details & Recommendations"}</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>          <button
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
