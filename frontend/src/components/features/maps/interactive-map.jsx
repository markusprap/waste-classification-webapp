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

          // Prevent re-initialization error
          if (mapRef.current._leaflet_id) return;

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
      html: `<div style="position: relative; width: 32px; height: 32px;">
              <span style="position: absolute; top: 0; left: 0; width: 32px; height: 32px; border-radius: 50%; background-color: rgba(59, 130, 246, 0.3); animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></span>
              <div style="position: relative; background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); width: 32px; height: 32px; border-radius: 50%; border: 4px solid white; box-shadow: 0 4px 6px rgba(37, 99, 235, 0.3);">
               <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 10px; height: 10px; background-color: white; border-radius: 50%;"></div>
              </div>
             </div>
             <style>@keyframes ping { 75%, 100% { transform: scale(2); opacity: 0; } }</style>`,
      className: "user-location-icon",
      iconSize: [32, 32],
      iconAnchor: [16, 16],
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
        // Add waste bank markers
        const wasteIcon = L.divIcon({
          html: `<div style="position: relative; width: 40px; height: 40px;">
                   <div style="position: absolute; bottom: 0; left: 50%; transform: translateX(-50%); width: 12px; height: 4px; background: rgba(0,0,0,0.2); border-radius: 50%; filter: blur(2px);"></div>
                   <div style="position: relative; background: linear-gradient(135deg, #10b981 0%, #0d9488 100%); width: 36px; height: 36px; border-radius: 50% 50% 50% 0; border: 3px solid white; box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4); display: flex; align-items: center; justify-content: center; transform: rotate(-45deg); margin-left: 2px; margin-bottom: 8px;">
                     <div style="transform: rotate(45deg);">
                       <svg width="18" height="18" fill="white" viewBox="0 0 24 24">
                         <path d="M19 7v2.99s-1.99.01-2 0V7h-3s.01-1.99 0-2h3V2h2v3h3v2h-3zm-3 4V9h-3V7H5c-1.1 0-2 .9-2 2v9c0 1.1.9 2 2 2h6.31l.69-2H5V9h8v2h3z"/>
                       </svg>
                     </div>
                   </div>
                 </div>`,
          className: "custom-div-icon",
          iconSize: [40, 40],
          iconAnchor: [20, 40],
          popupAnchor: [0, -40]
        })

        console.log('📍 Creating markers for', wasteLocations.length, 'waste banks')
        wasteLocations.forEach((location, index) => {
          console.log(`📌 Creating marker ${index + 1}:`, location.name, 'at', location.lat, location.lng)
          const marker = L.marker([location.lat, location.lng], { icon: wasteIcon }).addTo(mapInstanceRef.current)
          wasteMarkersRef.current.push(marker)

          const popupContent = `
            <div style="font-family: inherit; min-width: 220px; padding: 4px;">
              <h3 style="margin: 0 0 4px 0; font-weight: 900; color: #064e3b; font-size: 16px; letter-spacing: -0.02em;">
                ${location.name}
              </h3>
              <p style="margin: 0 0 8px 0; color: #065f46; font-size: 12px; opacity: 0.8; line-height: 1.4;">
                ${location.address}
              </p>
              
              <div style="display: flex; gap: 6px; margin-bottom: 12px; flex-wrap: wrap;">
                <span style="background-color: #ecfdf5; color: #059669; font-size: 10px; font-weight: 700; padding: 4px 8px; border-radius: 99px; text-transform: uppercase;">
                  ${location.type}
                </span>
                ${location.distance ? `<span style="background-color: #fff7ed; color: #d97706; font-size: 10px; font-weight: 700; padding: 4px 8px; border-radius: 99px; display: flex; align-items: center; gap: 4px;">
                  📍 ${location.distance.toFixed(1)} km
                </span>` : ''}
              </div>

              <button 
                onclick="window.open('https://www.google.com/maps/dir/?api=1&destination=${location.lat},${location.lng}&travelmode=driving', '_blank')"
                style="width: 100%; background: linear-gradient(to right, #059669, #0d9488); color: white; border: none; padding: 10px; border-radius: 12px; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 6px; box-shadow: 0 4px 6px -1px rgba(5, 150, 105, 0.2); transition: all 0.2s;"
                onmouseover="this.style.transform='scale(1.05)'"
                onmouseout="this.style.transform='scale(1)'"
              >
                ${language === "id" ? "Buka Rute" : "Get Directions"}
              </button>
            </div>
          `
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
        <div className="lg:col-span-2 space-y-4">
          <div className="overflow-hidden rounded-[2.5rem] border border-white/20 shadow-2xl bg-white relative group">
            <div ref={mapRef} className="h-[600px] w-full z-0" style={{ minHeight: "600px" }} />

            {/* Overlay Gradient */}
            <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-white/80 to-transparent pointer-events-none z-[400]"></div>
          </div>

          {/* Premium Legend */}
          <div className="rounded-[2rem] bg-white/60 backdrop-blur-md border border-white/50 p-6 flex flex-wrap items-center justify-between gap-4 shadow-sm">
            <h4 className="font-black text-gray-900 uppercase tracking-widest text-xs">
              {language === "id" ? "Legenda Peta" : "Map Legend"}
            </h4>
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-full border border-gray-100 shadow-sm">
                <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse"></div>
                <span className="text-xs font-bold text-gray-600">
                  {language === "id" ? "Bank Sampah" : "Waste Bank"}
                </span>
              </div>
              {userLocation && (
                <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-full border border-gray-100 shadow-sm">
                  <div className="w-2.5 h-2.5 bg-blue-500 rounded-full border-2 border-blue-200"></div>
                  <span className="text-xs font-bold text-gray-600">
                    {language === "id" ? "Posisi Anda" : "Your Location"}
                  </span>
                </div>
              )}
            </div>
            {wasteLocations.length > 0 && userLocation && (
              <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                {language === "id"
                  ? `${recommendedWasteBanks.length} LOKASI TERDEKAT`
                  : `${recommendedWasteBanks.length} NEARBY LOCATIONS`
                }
              </div>
            )}
          </div>
        </div>

        {/* Recommendations Section */}
        {/* Recommendations Section */}
        <div className="lg:col-span-1 h-[680px]">
          <div className="rounded-[2.5rem] bg-white/40 backdrop-blur-md border border-white/50 p-6 h-full flex flex-col shadow-xl shadow-emerald-900/5 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 blur-[80px] rounded-full translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>

            {!userLocation ? (
              // Show message when no location is set
              <div className="flex-1 flex flex-col items-center justify-center text-center relative z-10">
                <div className="w-24 h-24 bg-emerald-50 rounded-3xl flex items-center justify-center mb-8 border border-emerald-100 shadow-inner group">
                  <MapPin className="w-10 h-10 text-emerald-400 group-hover:scale-110 transition-transform duration-500" />
                </div>
                <h4 className="text-xl font-black text-gray-900 mb-3">
                  {language === "id" ? "Mulai Penjelajahan" : "Start Discovering"}
                </h4>
                <p className="text-sm font-medium text-gray-500 leading-relaxed max-w-[200px]">
                  {language === "id"
                    ? "Aktifkan lokasi untuk menemukan titik daur ulang terdekat."
                    : "Enable location services to find nearest recycling points."
                  }
                </p>
              </div>
            ) : (
              // Show recommendations when location is available
              <>
                <div className="mb-6 relative z-10">
                  <h4 className="font-black text-xl text-gray-900 tracking-tight">
                    {language === "id" ? "Rekomendasi Terdekat" : "Nearest Recommendations"}
                  </h4>
                  <p className="text-xs font-bold text-emerald-600 uppercase tracking-widest mt-2 flex items-center gap-2">
                    <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                    {language === "id"
                      ? `${recommendedWasteBanks.length} TITIK DITEMUKAN`
                      : `${recommendedWasteBanks.length} SPOTS FOUND`
                    }
                  </p>
                </div>

                <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar relative z-10">
                  {recommendedWasteBanks.length > 0 ? (
                    recommendedWasteBanks.map((bank, index) => (
                      <div
                        key={bank.id}
                        className={`group p-4 rounded-3xl cursor-pointer transition-all duration-300 border ${selectedLocation === bank.id
                          ? "border-emerald-500 bg-white shadow-lg shadow-emerald-500/10 scale-[1.02]"
                          : "border-white/50 bg-white/50 hover:bg-white hover:border-emerald-200 hover:shadow-md"
                          }`}
                        onClick={() => {
                          setSelectedLocation(selectedLocation === bank.id ? null : bank.id)
                          highlightLocationOnMap(bank)
                        }}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black ${selectedLocation === bank.id ? 'bg-emerald-500 text-white' : 'bg-gray-100 text-gray-500'
                              }`}>
                              {index + 1}
                            </div>
                            <h5 className="font-bold text-sm text-gray-900 leading-tight line-clamp-1">
                              {bank.name}
                            </h5>
                          </div>
                          {bank.distanceText && (
                            <div className="px-2 py-1 bg-amber-50 rounded-lg border border-amber-100 flex items-center gap-1.5">
                              <Navigation className="w-3 h-3 text-amber-500" />
                              <span className="text-[10px] font-bold text-amber-700">{bank.distanceText}</span>
                            </div>
                          )}
                        </div>

                        <p className="text-xs font-medium text-gray-500 mb-4 line-clamp-2 pl-11 leading-relaxed">
                          {bank.address}
                        </p>

                        <div className="flex items-center justify-between pl-11">
                          <span className="text-[10px] uppercase tracking-wider font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-100">
                            {bank.type}
                          </span>

                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              openInGoogleMaps(bank)
                            }}
                            className="w-8 h-8 rounded-full flex items-center justify-center bg-gray-50 hover:bg-blue-50 text-gray-400 hover:text-blue-500 transition-colors border border-gray-100 hover:border-blue-200"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-12">
                      <div className="mx-auto w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4 border border-gray-100">
                        <Navigation className="w-6 h-6 text-gray-300" />
                      </div>
                      <h5 className="font-bold text-gray-900 mb-1">
                        {language === "id" ? "Tidak Ada Hasil" : "No Results Found"}
                      </h5>
                      <p className="text-xs text-gray-500 max-w-[200px] mx-auto">
                        {language === "id"
                          ? "Coba perluas radius pencarian Anda."
                          : "Try expanding your search radius."
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
