"use client"

import { useState, useRef, useEffect } from "react"
import { ChevronLeft, ChevronRight, MapPin, Navigation } from "lucide-react"
import { useLanguage } from "@/context/language-context"

export function LocationSlider({ locations, userLocation, userCity }) {
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
    if (sliderRef.current && locations.length > 0) {
      const slideWidth = sliderRef.current.children[0]?.offsetWidth || 0
      sliderRef.current.scrollTo({
        left: currentIndex * (slideWidth + 16), // 16px for gap
        behavior: "smooth",
      })
    }
  }, [currentIndex, locations.length])

  if (!locations || locations.length === 0) {
    return (
      <div className="rounded-lg bg-white border border-gray-200 p-6">
        <div className="text-center py-8">
          <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {language === "id" ? "Tidak Ada Bank Sampah Terdekat" : "No Nearby Waste Banks"}
          </h3>
          <p className="text-gray-600 max-w-md mx-auto">
            {language === "id"
              ? "Maaf, tidak ada bank sampah yang ditemukan dalam radius 50 km dari lokasi Anda."
              : "Sorry, no waste banks found within 50 km radius of your location."}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-lg bg-white border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-medium text-gray-900">
            {language === "id" 
              ? `Bank Sampah ${userCity ? `di ${userCity}` : "Terdekat"}`
              : `Waste Banks ${userCity ? `in ${userCity}` : "Nearby"}`
            }
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            {language === "id" 
              ? `Ditemukan ${locations.length} bank sampah dalam radius 50 km`
              : `Found ${locations.length} waste banks within 50 km radius`
            }
          </p>
        </div>
        
        {locations.length > 1 && (
          <div className="flex items-center space-x-2">
            <button
              onClick={prevSlide}
              className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-sm text-gray-500 min-w-[60px] text-center">
              {currentIndex + 1} / {locations.length}
            </span>
            <button
              onClick={nextSlide}
              className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      <div className="relative overflow-hidden">
        <div 
          ref={sliderRef} 
          className="flex gap-4 overflow-x-auto scrollbar-hide" 
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {locations.map((location, index) => (
            <div
              key={location.id}
              className={`flex-shrink-0 w-80 p-4 rounded-lg border transition-all duration-200 ${
                index === currentIndex 
                  ? "border-green-500 bg-green-50 shadow-md" 
                  : "border-gray-200 bg-white hover:border-gray-300"
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-medium text-gray-900 text-sm leading-tight">
                      {index + 1}. {language === "id" ? location.nameId : location.name}
                    </h4>
                    {location.distanceText && (
                      <div className="flex items-center space-x-1 text-sm font-medium text-orange-600 ml-2">
                        <Navigation className="w-3 h-3" />
                        <span>{location.distanceText}</span>
                      </div>
                    )}
                  </div>
                  
                  <p className="text-xs text-gray-600 mb-3 line-clamp-2">{location.address}</p>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-green-600 font-medium bg-green-100 px-2 py-1 rounded-full">
                      {location.type}
                    </span>
                    
                    {location.distance && (
                      <div className="text-xs text-gray-500">
                        {language === "id" ? "Jarak" : "Distance"}: {location.distance.toFixed(2)} km
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
                index === currentIndex ? "bg-green-500" : "bg-gray-300 hover:bg-gray-400"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  )
}