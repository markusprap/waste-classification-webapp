"use client"

import { useState, useEffect, useCallback } from "react"
import { MapPin } from "lucide-react"
import { useLanguage } from "@/context/language-context"
import { LocationSlider } from "./location-slider"

// Mock waste bank locations with more realistic Jakarta coordinates
const wasteLocations = [
  {
    id: 1,
    name: "Green Waste Center",
    nameId: "Pusat Sampah Hijau",
    lat: -6.2088,
    lng: 106.8456,
    address: "Jl. Sudirman No. 123, Jakarta Pusat",
    type: "Recycling Center",
  },
  {
    id: 2,
    name: "EcoBank Kemang",
    nameId: "EcoBank Kemang",
    lat: -6.2615,
    lng: 106.8106,
    address: "Jl. Kemang Raya No. 45, Jakarta Selatan",
    type: "Waste Bank",
  },
  {
    id: 3,
    name: "Clean City Hub",
    nameId: "Hub Kota Bersih",
    lat: -6.1751,
    lng: 106.865,
    address: "Jl. Menteng No. 67, Jakarta Pusat",
    type: "Collection Point",
  },
  {
    id: 4,
    name: "Recycle Station Senayan",
    nameId: "Stasiun Daur Ulang Senayan",
    lat: -6.2297,
    lng: 106.8075,
    address: "Jl. Senayan No. 89, Jakarta Pusat",
    type: "Recycling Station",
  },
  {
    id: 5,
    name: "Waste Management Kelapa Gading",
    nameId: "Pengelolaan Sampah Kelapa Gading",
    lat: -6.1588,
    lng: 106.9056,
    address: "Jl. Kelapa Gading No. 12, Jakarta Utara",
    type: "Waste Bank",
  },
  {
    id: 6,
    name: "Eco Center Pondok Indah",
    nameId: "Pusat Eco Pondok Indah",
    lat: -6.2659,
    lng: 106.7844,
    address: "Jl. Pondok Indah No. 88, Jakarta Selatan",
    type: "Collection Point",
  },
]

// Function to calculate distance between two coordinates
function calculateDistance(lat1, lng1, lat2, lng2) {
  const R = 6371 // Radius of the Earth in kilometers
  const dLat = (lat2 - lat1) * (Math.PI / 180)
  const dLng = (lng2 - lng1) * (Math.PI / 180)
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLng / 2) * Math.sin(dLng / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  const distance = R * c
  return distance
}

export function SimpleMap({ userLocation }) {
  const { language } = useLanguage()
  const [selectedLocation, setSelectedLocation] = useState(null)
  const [nearbyLocations, setNearbyLocations] = useState(wasteLocations)

  // Memoize the calculation function to prevent unnecessary re-renders
  const calculateNearbyLocations = useCallback((userLoc) => {
    if (!userLoc) {
      return wasteLocations
    }

    const locationsWithDistance = wasteLocations.map((location) => {
      const distance = calculateDistance(userLoc.lat, userLoc.lng, location.lat, location.lng)
      return {
        ...location,
        distance: distance,
        distanceText: distance < 1 ? `${Math.round(distance * 1000)}m` : `${distance.toFixed(1)}km`,
      }
    })

    // Sort by distance and filter nearby locations (within 10km)
    return locationsWithDistance
      .filter((location) => location.distance <= 10) // Only show locations within 10km
      .sort((a, b) => a.distance - b.distance)
  }, [])

  // Calculate nearby locations when user location changes
  useEffect(() => {
    const newNearbyLocations = calculateNearbyLocations(userLocation)
    setNearbyLocations(newNearbyLocations)
  }, [userLocation, calculateNearbyLocations])

  return (
    <div className="mx-auto max-w-4xl">
      {/* Map Placeholder with Visual Representation */}
      <div className="overflow-hidden rounded-lg border border-gray-200 bg-gradient-to-br from-green-50 to-blue-50">
        <div className="relative h-[400px] w-full p-8">
          {/* Background Grid */}
          <div className="absolute inset-0 opacity-10">
            <div className="grid grid-cols-8 grid-rows-6 h-full w-full">
              {Array.from({ length: 48 }).map((_, i) => (
                <div key={i} className="border border-gray-300"></div>
              ))}
            </div>
          </div>

          {/* Map Title */}
          <div className="absolute top-4 left-4 bg-white rounded-lg shadow-sm px-3 py-2">
            <h3 className="font-medium text-gray-900">
              {language === "id" ? "Peta Lokasi Bank Sampah" : "Waste Bank Location Map"}
            </h3>
          </div>

          {/* Location Markers - only show nearby locations if user location exists */}
          {(userLocation ? nearbyLocations : wasteLocations).slice(0, 6).map((location, index) => (
            <div
              key={location.id}
              className={`absolute cursor-pointer transform -translate-x-1/2 -translate-y-1/2 transition-all duration-200 ${
                selectedLocation === location.id ? "scale-125 z-10" : "hover:scale-110"
              }`}
              style={{
                left: `${15 + (index % 3) * 25}%`,
                top: `${25 + Math.floor(index / 3) * 30}%`,
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
                      {location.distanceText && <p className="text-xs text-gray-500">{location.distanceText}</p>}
                    </div>
                    <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-white rotate-45 border-l border-t border-gray-200"></div>
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* User Location (if available) */}
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

      {/* Location Slider */}
      <LocationSlider locations={nearbyLocations} userLocation={userLocation} />

      {/* Map Legend */}
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
  )
}
