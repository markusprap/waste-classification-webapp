"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { useLanguage } from "@/models/language-context"
import { Navigation, ExternalLink, MapPin } from "lucide-react"
import { fetchWasteBanks } from "@/services/wasteBankService"

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

export function InteractiveMap({ userLocation, onLocationUpdate }) {
  const mapRef = useRef(null)
  const mapInstanceRef = useRef(null)
  const userMarkerRef = useRef(null)
  const wasteMarkersRef = useRef([])
  const { language } = useLanguage()
  const [mapReady, setMapReady] = useState(false)
  const [wasteLocations, setWasteLocations] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [recommendedWasteBanks, setRecommendedWasteBanks] = useState([])
  const [selectedLocation, setSelectedLocation] = useState(null)
    const [userCity, setUserCity] = useState("")
  
  // Fetch waste bank data from API and process for map display
  useEffect(() => {
    const loadWasteBanks = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const params = {}
        if (userLocation) {
          params.lat = userLocation.lat
          params.lng = userLocation.lng
          params.radius = 50
          params.limit = 100
        }
        
        const wastebanks = await fetchWasteBanks(params)
        
        let mapped = wastebanks
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
        
        if (userLocation) {
          const hasDistanceInfo = mapped.length > 0 && mapped[0].distance !== undefined
          
          if (!hasDistanceInfo) {
        mapped = mapped.map((loc) => ({
          ...loc,
          distance: calculateDistance(userLocation.lat, userLocation.lng, loc.lat, loc.lng),
          distanceText: (() => {
            const dist = calculateDistance(userLocation.lat, userLocation.lng, loc.lat, loc.lng)
            return dist < 1 ? `${Math.round(dist * 1000)}m` : `${dist.toFixed(1)}km`
          })()
        }))
          }

          const filtered = mapped
        .filter((loc) => loc.distance <= 50)
        .sort((a, b) => a.distance - b.distance)
          
          const recommended = filtered.slice(0, 15)
          setRecommendedWasteBanks(recommended)
          
          if (recommended.length > 0) {
        setUserCity(recommended[0].city)
          }

          setWasteLocations(filtered)
        } else {
          const sampleWasteBanks = mapped.slice(0, 20)
          setWasteLocations(sampleWasteBanks)
          setRecommendedWasteBanks(sampleWasteBanks.slice(0, 15))
        }
      } catch (err) {
        console.error('Error loading waste banks:', err)
        setError('Failed to load waste bank data')
        setWasteLocations([])
        setRecommendedWasteBanks([])
      } finally {
        setLoading(false)
      }
    }

    loadWasteBanks()
  }, [userLocation])

  // Initialize map
  useEffect(() => {
    if (typeof window !== "undefined" && mapRef.current && !mapInstanceRef.current) {
      const link = document.createElement("link")
      link.rel = "stylesheet"
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
      link.integrity = "sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
      link.crossOrigin = ""
      document.head.appendChild(link)

      link.onload = () => {
        import("leaflet").then((L) => {
          delete L.Icon.Default.prototype._getIconUrl
          L.Icon.Default.mergeOptions({
            iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
            iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
            shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
          })

          const map = L.map(mapRef.current).setView(
            userLocation ? [userLocation.lat, userLocation.lng] : [-6.2088, 106.8456],
            userLocation ? 12 : 5
          )

          L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          }).addTo(map)

          mapInstanceRef.current = map
          setMapReady(true)
        })
      }

      return () => {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.remove()
          mapInstanceRef.current = null
          setMapReady(false)
        }
        if (document.head.contains(link)) {
          document.head.removeChild(link)
        }
      }
    }
  }, [])

  // Add user location marker
  const addUserLocationMarker = (L, map, location) => {
    if (userMarkerRef.current) {
      map.removeLayer(userMarkerRef.current)
    }
    const userIcon = L.divIcon({
      html: `<div style="background-color: #3b82f6; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3); position: relative;">
               <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 8px; height: 8px; background-color: white; border-radius: 50%;"></div>
             </div>`,
      className: "user-location-icon",
      iconSize: [20, 20],
      iconAnchor: [10, 10],
    })
    userMarkerRef.current = L.marker([location.lat, location.lng], { icon: userIcon }).addTo(map)
    const popupContent = `
      <div style="min-width: 150px; text-align: center;">
        <h3 style="margin: 0 0 8px 0; font-weight: bold; color: #1f2937;">
          ${language === "id" ? "Lokasi Anda" : "Your Location"}
        </h3>
        <p style="margin: 0; color: #6b7280; font-size: 14px;">
          ${location.lat.toFixed(6)}, ${location.lng.toFixed(6)}
        </p>
      </div>
    `
    userMarkerRef.current.bindPopup(popupContent)
  }

  // Function to open Google Maps
  const openInGoogleMaps = (location) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${location.lat},${location.lng}&travelmode=driving`
    window.open(url, '_blank')
  }

  // Function to highlight marker on map
  const highlightLocationOnMap = (location) => {
    if (mapInstanceRef.current && mapReady) {
      // Set view ke lokasi yang dipilih
      mapInstanceRef.current.setView([location.lat, location.lng], 15)
      
      // Buka popup marker jika ada
      wasteMarkersRef.current.forEach(marker => {
        if (marker.getLatLng().lat === location.lat && marker.getLatLng().lng === location.lng) {
          marker.openPopup()
        }
      })
    }
  }
  // Add waste bank markers
  useEffect(() => {
    console.log('🚀 Marker effect triggered - mapReady:', mapReady, 'wasteLocations length:', wasteLocations.length)
    
    if (mapReady && mapInstanceRef.current) {
      import("leaflet").then((L) => {
        console.log('🍃 Leaflet imported, creating markers...')
        
        // Remove existing waste bank markers
        wasteMarkersRef.current.forEach(marker => {
          mapInstanceRef.current.removeLayer(marker)
        })
        wasteMarkersRef.current = []
        console.log('🧹 Cleared existing markers')

        // Add waste bank markers
        const wasteIcon = L.divIcon({
          html: `<div style="background-color: #10b981; width: 24px; height: 24px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.2); display: flex; align-items: center; justify-content: center;">
                   <svg width="12" height="12" fill="white" viewBox="0 0 24 24">
                     <path d="M19 7v2.99s-1.99.01-2 0V7h-3s.01-1.99 0-2h3V2h2v3h3v2h-3zm-3 4V9h-3V7H5c-1.1 0-2 .9-2 2v9c0 1.1.9 2 2 2h6.31l.69-2H5V9h8v2h3z"/>
                   </svg>
                 </div>`,
          className: "custom-div-icon",
          iconSize: [24, 24],
          iconAnchor: [12, 12],        })

        console.log('📍 Creating markers for', wasteLocations.length, 'waste banks')
        wasteLocations.forEach((location, index) => {
          console.log(`📌 Creating marker ${index + 1}:`, location.name, 'at', location.lat, location.lng)
          const marker = L.marker([location.lat, location.lng], { icon: wasteIcon }).addTo(mapInstanceRef.current)
          wasteMarkersRef.current.push(marker)
          
          const popupContent = `
            <div style="min-width: 200px;">
              <h3 style="margin: 0 0 8px 0; font-weight: bold; color: #1f2937;">
                ${location.name}
              </h3>
              <p style="margin: 0 0 4px 0; color: #6b7280; font-size: 14px;">
                ${location.address}
              </p>
              <p style="margin: 0 0 4px 0; color: #10b981; font-size: 12px; font-weight: 500;">
                ${location.type}
              </p>
              ${location.distance ? `<p style="margin: 0 0 8px 0; color: #f59e0b; font-size: 12px; font-weight: 500;">
                ${language === "id" ? "Jarak" : "Distance"}: ${location.distance.toFixed(2)} km
              </p>` : ''}
              <button 
                onclick="window.open('https://www.google.com/maps/dir/?api=1&destination=${location.lat},${location.lng}&travelmode=driving', '_blank')"
                style="background-color: #3b82f6; color: white; border: none; padding: 6px 12px; border-radius: 4px; font-size: 12px; cursor: pointer; display: flex; align-items: center; gap: 4px;"
              >
                <svg width="12" height="12" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2L13.09 8.26L22 9L13.09 9.74L12 16L10.91 9.74L2 9L10.91 8.26L12 2Z"/>
                </svg>
                ${language === "id" ? "Buka di Maps" : "Open in Maps"}
              </button>
            </div>          `
          marker.bindPopup(popupContent)
        })
        
        console.log('✅ Successfully created', wasteMarkersRef.current.length, 'markers on map')
      })
    } else {
      console.log('⏳ Waiting for map to be ready or waste locations to load - mapReady:', mapReady, 'wasteLocations:', wasteLocations.length)
    }
  }, [wasteLocations, mapReady, language])
  // Handle user location updates
  useEffect(() => {
    if (mapReady && mapInstanceRef.current && userLocation) {
      import("leaflet").then((L) => {
        addUserLocationMarker(L, mapInstanceRef.current, userLocation)
        
        // Zoom map to user location when userLocation changes
        mapInstanceRef.current.setView([userLocation.lat, userLocation.lng], 12, {
          animate: true,
          duration: 1
        })
      })
    }
  }, [userLocation, mapReady, language])

  return (
    <div className="mx-auto max-w-7xl">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Map Section */}
        <div className="lg:col-span-2">
          <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
            <div ref={mapRef} className="h-[500px] w-full" style={{ minHeight: "500px" }} />
          </div>
          
          {/* Legend */}
          <div className="mt-4 rounded-lg bg-white border border-gray-200 p-4">
            <h4 className="font-medium text-gray-900 mb-2">
              {language === "id" ? "Legenda" : "Legend"}
            </h4>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-green-500 rounded-full border-2 border-white shadow"></div>
                <span className="text-sm text-gray-600">
                  {language === "id" ? "Lokasi Bank Sampah" : "Waste Bank Locations"}
                </span>
              </div>
              {userLocation && (
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full border-2 border-white shadow"></div>
                  <span className="text-sm text-gray-600">
                    {language === "id" ? "Lokasi Anda" : "Your Location"}
                  </span>
                </div>
              )}            </div>            
            {wasteLocations.length > 0 && userLocation && (
              <div className="mt-2 text-sm text-gray-500">
                {language === "id" 
                  ? `Menampilkan ${recommendedWasteBanks.length} bank sampah dalam radius 50km`
                  : `Showing ${recommendedWasteBanks.length} waste banks within 50km radius`
                }
              </div>
            )}
          </div>
        </div>

        {/* Recommendations Section */}
        <div className="lg:col-span-1">
          <div className="rounded-lg bg-white border border-gray-200 p-4 h-[544px] flex flex-col">
            {!userLocation ? (
              // Show message when no location is set
              <div className="flex-1 flex flex-col items-center justify-center text-center">
                <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <MapPin className="w-8 h-8 text-gray-400" />
                </div>
                <h4 className="font-medium text-gray-900 mb-2">
                  {language === "id" ? "Lokasi Belum Ditentukan" : "Location Not Set"}
                </h4>
                <p className="text-sm text-gray-500 leading-relaxed">
                  {language === "id" 
                    ? "Klik tombol 'Dapatkan Lokasi' untuk melihat rekomendasi bank sampah terdekat di sekitar Anda"
                    : "Click 'Get Location' button to see nearby waste bank recommendations around you"
                  }
                </p>
              </div>
            ) : (
              // Show recommendations when location is available
              <>
                <div className="mb-4">
                  <h4 className="font-medium text-gray-900">
                    {language === "id" 
                      ? `Rekomendasi Bank Sampah${userCity ? ` di ${userCity}` : ""}`
                      : `Waste Bank Recommendations${userCity ? ` in ${userCity}` : ""}`
                    }
                  </h4>
                  <p className="text-sm text-gray-500 mt-1">
                    {language === "id" 
                      ? `${recommendedWasteBanks.length} bank sampah dalam radius 50km`
                      : `${recommendedWasteBanks.length} waste banks within 50km radius`
                    }
                  </p>
                </div>
                
                <div className="flex-1 overflow-y-auto space-y-3">
                  {recommendedWasteBanks.length > 0 ? (
                    recommendedWasteBanks.map((bank, index) => (
                      <div 
                        key={bank.id}
                        className={`p-3 border rounded-lg cursor-pointer transition-all duration-200 ${
                          selectedLocation === bank.id 
                            ? "border-green-500 bg-green-50 shadow-md" 
                            : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                        }`}
                        onClick={() => {
                          setSelectedLocation(selectedLocation === bank.id ? null : bank.id)
                          highlightLocationOnMap(bank)
                        }}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h5 className="font-medium text-sm text-gray-900 leading-tight flex-1 pr-2">
                            {index + 1}. {bank.name}
                          </h5>
                          {bank.distanceText && (
                            <div className="flex items-center space-x-1 text-sm font-medium text-orange-600 shrink-0">
                              <Navigation className="w-3 h-3" />
                              <span>{bank.distanceText}</span>
                            </div>
                          )}
                        </div>
                        
                        <p className="text-xs text-gray-600 mb-3 line-clamp-2">{bank.address}</p>
                        
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-green-600 font-medium bg-green-100 px-2 py-1 rounded-full">
                            {bank.type}
                          </span>
                          
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              openInGoogleMaps(bank)
                            }}
                            className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1 transition-colors"
                          >
                            <ExternalLink className="w-3 h-3" />
                            {language === "id" ? "Buka Maps" : "Open Maps"}
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <div className="mx-auto w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                        <Navigation className="w-6 h-6 text-gray-400" />
                      </div>
                      <h5 className="font-medium text-gray-900 mb-2">
                        {language === "id" ? "Tidak Ada Bank Sampah" : "No Waste Banks Found"}
                      </h5>
                      <p className="text-sm text-gray-500">
                        {language === "id" 
                          ? "Tidak ada bank sampah yang ditemukan dalam radius 50km dari lokasi Anda"
                          : "No waste banks found within 50km radius of your location"
                        }
                      </p>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
