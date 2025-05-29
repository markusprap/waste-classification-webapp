"use client"

import { useState, useRef, useEffect } from "react"
import { ChevronLeft, ChevronRight, MapPin, Navigation } from "lucide-react"
import { useLanguage } from "@/context/language-context"

export function LocationSlider({ locations, userLocation }) {
  const { language } = useLanguage()
  const [currentIndex, setCurrentIndex] = useState(0)
  const sliderRef = useRef(null)

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % locations.length)
  }

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + locations.length) % locations.length)
  }

  useEffect(() => {
    if (sliderRef.current) {
      const slideWidth = sliderRef.current.children[0]?.offsetWidth || 0
      sliderRef.current.scrollTo({
        left: currentIndex * (slideWidth + 16), // 16px for gap
        behavior: "smooth",
      })
    }
  }, [currentIndex])

  if (!locations || locations.length === 0) {
    return (
      <div className="mt-6 text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
        <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          {language === "id" ? "Tidak Ada Bank Sampah Terdekat" : "No Nearby Waste Banks"}
        </h3>
        <p className="text-gray-600 max-w-md mx-auto">
          {language === "id"
            ? "Maaf, tidak ada bank sampah yang ditemukan di sekitar lokasi Anda. Silakan coba lokasi lain."
            : "Sorry, no waste banks found near your location. Please try a different location."}
        </p>
      </div>
    )
  }

  return (
    <div className="mt-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900">
          {language === "id" ? "Bank Sampah Terdekat" : "Nearby Waste Banks"}
        </h3>
        <div className="flex items-center space-x-2">
          <button
            onClick={prevSlide}
            disabled={locations.length <= 1}
            className="p-2 rounded-full bg-white border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-sm text-gray-500">
            {currentIndex + 1} / {locations.length}
          </span>
          <button
            onClick={nextSlide}
            disabled={locations.length <= 1}
            className="p-2 rounded-full bg-white border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="relative overflow-hidden">
        <div ref={sliderRef} className="flex gap-4 overflow-x-auto scrollbar-hide" style={{ scrollbarWidth: "none" }}>
          {locations.map((location, index) => (
            <div
              key={location.id}
              className={`flex-shrink-0 w-80 p-4 rounded-lg border transition-all duration-200 ${
                index === currentIndex ? "border-green-500 bg-green-50" : "border-gray-200 bg-white"
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900 mb-1">
                    {language === "id" ? location.nameId : location.name}
                  </h4>
                  <p className="text-sm text-gray-600 mb-2">{location.address}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-green-600 font-medium bg-green-100 px-2 py-1 rounded">
                      {location.type}
                    </span>
                    {location.distanceText && (
                      <div className="flex items-center space-x-1 text-sm font-medium text-gray-900">
                        <Navigation className="w-3 h-3" />
                        <span>{location.distanceText}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Dots indicator */}
      {locations.length > 1 && (
        <div className="flex justify-center mt-4 space-x-2">
          {locations.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-2 h-2 rounded-full transition-colors ${
                index === currentIndex ? "bg-green-500" : "bg-gray-300"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  )
}
