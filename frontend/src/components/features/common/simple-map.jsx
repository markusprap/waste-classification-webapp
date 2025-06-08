"use client"

import { useState, useEffect, useCallback } from "react"
import { MapPin } from "lucide-react"
import { useLanguage } from "@/context/language-context"
import { LocationSlider } from "./location-slider"
import wastebanks from "./wastebanks.json"

function calculateDistance(lat1, lng1, lat2, lng2) {
  const R = 6371
  const dLat = (lat2 - lat1) * (Math.PI / 180)
  const dLng = (lng2 - lng1) * (Math.PI / 180)
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLng / 2) * Math.sin(dLng / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

// Fungsi untuk mengekstrak nama kota dari alamat
function extractCity(address) {
  if (!address) return ""
  
  const cityPatterns = [
    /Kota\s+([^,]+)/i,
    /Kab\.\s*([^,]+)/i,
    /Kabupaten\s+([^,]+)/i,
    /,\s*([^,]+),\s*[^,]+$/i
  ]
  
  for (const pattern of cityPatterns) {
    const match = address.match(pattern)
    if (match) {
      return match[1].trim()
    }
  }
  
  const parts = address.split(',')
  if (parts.length >= 2) {
    return parts[parts.length - 2].trim()
  }
  
  return ""
}

const mappedWasteLocations = wastebanks
  .filter((d) => d.latitude && d.longitude)
  .map((d, idx) => ({
    id: idx + 1,
    name: d.nama,
    nameId: d.nama,
    lat: d.latitude,
    lng: d.longitude,
    address: d.alamat,
    type: "Bank Sampah",
    city: extractCity(d.alamat)
  }))

export function SimpleMap({ userLocation }) {
  const { language } = useLanguage()
  const [selectedLocation, setSelectedLocation] = useState(null)
  const [nearbyLocations, setNearbyLocations] = useState([])
  const [recommendedWasteBanks, setRecommendedWasteBanks] = useState([])
  const [userCity, setUserCity] = useState("")

  const calculateNearbyLocations = useCallback((userLoc) => {
    if (!userLoc) {
      return []
    }
    
    const locationsWithDistance = mappedWasteLocations.map((location) => {
      const distance = calculateDistance(userLoc.lat, userLoc.lng, location.lat, location.lng)
      return {
        ...location,
        distance: distance,
        distanceText: distance < 1 ? `${Math.round(distance * 1000)}m` : `${distance.toFixed(1)}km`,
      }
    })
    
    // Filter dan sort berdasarkan jarak untuk rekomendasi (radius 50km)
    const recommended = locationsWithDistance
      .filter((location) => location.distance <= 50)
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 10) // Ambil 10 terdekat
    
    setRecommendedWasteBanks(recommended)
    
    // Deteksi kota user
    if (recommended.length > 0) {
      setUserCity(recommended[0].city)
    }
    
    // Untuk ditampilkan di map (radius 10km)
    return locationsWithDistance
      .filter((location) => location.distance <= 10)
      .sort((a, b) => a.distance - b.distance)
  }, [])

  useEffect(() => {
    if (userLocation) {
      const newNearbyLocations = calculateNearbyLocations(userLocation)
      setNearbyLocations(newNearbyLocations)
    } else {
      setNearbyLocations([])
      setRecommendedWasteBanks([])
      setUserCity("")
    }
  }, [userLocation, calculateNearbyLocations])

  // Tampilkan data untuk map: jika ada user location tampilkan nearby, jika tidak tampilkan sample
  const displayLocations = userLocation ? nearbyLocations : mappedWasteLocations.slice(0, 8)

  return (
    <div className="mx-auto max-w-6xl">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Map Section */}
        <div className="lg:col-span-2">
          <div className="overflow-hidden rounded-lg border border-gray-200 bg-gradient-to-br from-green-50 to-blue-50">
            <div className="relative h-[400px] w-full p-8">
              <div className="absolute inset-0 opacity-10">
                <div className="grid grid-cols-8 grid-rows-6 h-full w-full">
                  {Array.from({ length: 48 }).map((_, i) => (
                    <div key={i} className="border border-gray-300"></div>
                  ))}
                </div>
              </div>
              
              <div className="absolute top-4 left-4 bg-white rounded-lg shadow-sm px-3 py-2">
                <h3 className="font-medium text-gray-900">
                  {language === "id" ? "Peta Lokasi Bank Sampah" : "Waste Bank Location Map"}
                </h3>
              </div>

              {/* Waste Bank Markers */}
              {displayLocations.slice(0, 8).map((location, index) => (
                <div
                  key={location.id}
                  className={`absolute cursor-pointer transform -translate-x-1/2 -translate-y-1/2 transition-all duration-200 ${
                    selectedLocation === location.id ? "scale-125 z-10" : "hover:scale-110"
                  }`}
                  style={{
                    left: `${15 + (index % 4) * 20}%`,
                    top: `${20 + Math.floor(index / 4) * 25}%`,
                  }}
                  onClick={() => setSelectedLocation(selectedLocation === location.id ? null : location.id)}
                >
                  <div className="relative">
                    <div className="w-6 h-6 bg-green-500 rounded-full border-2 border-white shadow-lg flex items-center justify-center">
                      <MapPin className="w-3 h-3 text-white" />
                    </div>
                    {selectedLocation === location.id && (
                      <div className="absolute top-8 left-1/2 transform -translate-x-1/2 bg-white rounded-lg shadow-lg p-3 min-w-[200px] z-20">
                        <h4 className="font-medium text-gray-900 mb-1">
                          {language === "id" ? location.nameId : location.name}
                        </h4>
                        <p className="text-sm text-gray-600 mb-1">{location.address}</p>
                        <div className="flex items-center justify-between">
                          <p className="text-xs text-green-600 font-medium">{location.type}</p>
                          {location.distanceText && <p className="text-xs text-orange-500 font-medium">{location.distanceText}</p>}
                        </div>
                        <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-white rotate-45 border-l border-t border-gray-200"></div>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {/* User Location Marker */}
              {userLocation ? (
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                  <div className="w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-lg animate-pulse relative">
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-white rounded-full"></div>
                  </div>
                  <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs text-gray-600 whitespace-nowrap">
                    {language === "id" ? "Lokasi Anda" : "Your Location"}
                  </div>
                </div>
              ) : (
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                  <div className="w-4 h-4 bg-gray-400 rounded-full border-2 border-white shadow-lg"></div>
                  <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs text-gray-600 whitespace-nowrap">
                    {language === "id" ? "Lokasi Tidak Diketahui" : "Location Unknown"}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Legend */}
          <div className="mt-4 rounded-lg bg-white border border-gray-200 p-4">
            <h4 className="font-medium text-gray-900 mb-3">{language === "id" ? "Legenda" : "Legend"}</h4>
            <div className="space-y-2">
              <div className="flex items-center space-x-3">
                <div className="w-4 h-4 bg-green-500 rounded-full border-2 border-white shadow"></div>
                <span className="text-sm text-gray-600">
                  {language === "id" ? "Lokasi Bank Sampah" : "Waste Bank Locations"}
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <div
                  className={`w-3 h-3 rounded-full border-2 border-white shadow ${userLocation ? "bg-blue-500" : "bg-gray-400"}`}
                ></div>
                <span className="text-sm text-gray-600">
                  {userLocation
                    ? language === "id"
                      ? "Lokasi Anda"
                      : "Your Location"
                    : language === "id"
                      ? "Lokasi Tidak Diketahui"
                      : "Location Unknown"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Recommendations Section */}
        <div className="lg:col-span-1">
          {userLocation && recommendedWasteBanks.length > 0 && (
            <div className="rounded-lg bg-white border border-gray-200 p-4">
              <h4 className="font-medium text-gray-900 mb-4">
                {language === "id" 
                  ? `Rekomendasi Bank Sampah ${userCity ? `di ${userCity}` : "Terdekat"}`
                  : `Recommended Waste Banks ${userCity ? `in ${userCity}` : "Nearby"}`
                }
              </h4>
              
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {recommendedWasteBanks.map((bank, index) => (
                  <div 
                    key={bank.id}
                    className="p-3 border border-gray-100 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => setSelectedLocation(selectedLocation === bank.id ? null : bank.id)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <h5 className="font-medium text-sm text-gray-900 truncate">
                          {index + 1}. {bank.name}
                        </h5>
                        <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                          {bank.address}
                        </p>
                        <div className="flex items-center mt-2 space-x-2">
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            {bank.type}
                          </span>
                          <span className="text-xs text-orange-600 font-medium">
                            {bank.distanceText}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {!userLocation && (
            <div className="rounded-lg bg-white border border-gray-200 p-4">
              <div className="text-center py-8">
                <div className="mx-auto w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <MapPin className="w-6 h-6 text-gray-400" />
                </div>
                <h4 className="font-medium text-gray-900 mb-2">
                  {language === "id" ? "Aktifkan Lokasi" : "Enable Location"}
                </h4>
                <p className="text-sm text-gray-500">
                  {language === "id" 
                    ? "Klik tombol 'Get Location' untuk melihat rekomendasi bank sampah terdekat"
                    : "Click 'Get Location' button to see nearby waste bank recommendations"
                  }
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Location Slider - hanya tampil jika ada lokasi user */}
      {userLocation && (
        <div className="mt-6">
          <LocationSlider locations={recommendedWasteBanks} userLocation={userLocation} userCity={userCity} />
        </div>
      )}
    </div>
  )
}