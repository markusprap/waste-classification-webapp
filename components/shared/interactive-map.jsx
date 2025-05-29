"use client"

import { useEffect, useRef, useState } from "react"
import { useLanguage } from "@/context/language-context"

// Fungsi hitung jarak dua koordinat (km)
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

export function InteractiveMap({ userLocation, onLocationUpdate }) {
  const mapRef = useRef(null)
  const mapInstanceRef = useRef(null)
  const userMarkerRef = useRef(null)
  const { language } = useLanguage()
  const [mapReady, setMapReady] = useState(false)
  const [wasteLocations, setWasteLocations] = useState([])

  // Fetch waste bank dari Nominatim jika userLocation tersedia
  useEffect(() => {
    async function fetchWasteBanks() {
      if (!userLocation) {
        setWasteLocations([
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
        ])
        return
      }
      // Cari "bank sampah" dalam 10km dari userLocation
      const query = language === "id" ? "bank sampah" : "waste bank"
      // Perkiraan bounding box 10km
      const delta = 0.09
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=50&viewbox=${
        userLocation.lng - delta
      },${userLocation.lat + delta},${userLocation.lng + delta},${userLocation.lat - delta}`

      const res = await fetch(url, {
        headers: { "Accept-Language": language === "id" ? "id" : "en" }
      })
      const data = await res.json()
      // Filter hasil dalam radius 10km
      const filtered = data
        .map((item, idx) => ({
          id: item.place_id || idx,
          name: item.display_name.split(",")[0],
          nameId: item.display_name.split(",")[0],
          lat: parseFloat(item.lat),
          lng: parseFloat(item.lon),
          address: item.display_name,
          type: "Waste Bank"
        }))
        .filter(
          (loc) =>
            calculateDistance(userLocation.lat, userLocation.lng, loc.lat, loc.lng) <= 10
        )
      setWasteLocations(filtered)
    }

    fetchWasteBanks()
  }, [userLocation, language])

  useEffect(() => {
    if (typeof window !== "undefined" && mapRef.current && !mapInstanceRef.current) {
      // Load Leaflet CSS dynamically
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
            userLocation ? 13 : 11
          )

          L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          }).addTo(map)

          mapInstanceRef.current = map
          setMapReady(true)

          // Add user marker jika ada
          if (userLocation) {
            addUserLocationMarker(L, map, userLocation)
          }
        })
      }

      return () => {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.remove()
          mapInstanceRef.current = null
        }
        if (document.head.contains(link)) {
          document.head.removeChild(link)
        }
      }
    }
  }, [language, userLocation])

  // Tambahkan marker user
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
    map.setView([location.lat, location.lng], 13)
  }

  // Render ulang marker waste bank jika data berubah
  useEffect(() => {
    if (mapReady && mapInstanceRef.current) {
      import("leaflet").then((L) => {
        // Hapus marker waste lama
        mapInstanceRef.current.eachLayer((layer) => {
          if (layer.options && layer.options.icon && layer.options.icon.options.className === "custom-div-icon") {
            mapInstanceRef.current.removeLayer(layer)
          }
        })
        // Custom icon for waste locations
        const wasteIcon = L.divIcon({
          html: `<div style="background-color: #10b981; width: 24px; height: 24px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.2); display: flex; align-items: center; justify-content: center;">
                   <svg width="12" height="12" fill="white" viewBox="0 0 24 24">
                     <path d="M19 7v2.99s-1.99.01-2 0V7h-3s.01-1.99 0-2h3V2h2v3h3v2h-3zm-3 4V9h-3V7H5c-1.1 0-2 .9-2 2v9c0 1.1.9 2 2 2h6.31l.69-2H5V9h8v2h3z"/>
                   </svg>
                 </div>`,
          className: "custom-div-icon",
          iconSize: [24, 24],
          iconAnchor: [12, 12],
        })
        wasteLocations.forEach((location) => {
          const marker = L.marker([location.lat, location.lng], { icon: wasteIcon }).addTo(mapInstanceRef.current)
          const popupContent = `
            <div style="min-width: 200px;">
              <h3 style="margin: 0 0 8px 0; font-weight: bold; color: #1f2937;">
                ${language === "id" ? location.nameId : location.name}
              </h3>
              <p style="margin: 0 0 4px 0; color: #6b7280; font-size: 14px;">
                ${location.address}
              </p>
              <p style="margin: 0; color: #10b981; font-size: 12px; font-weight: 500;">
                ${location.type}
              </p>
            </div>
          `
          marker.bindPopup(popupContent)
        })
      })
    }
  }, [wasteLocations, mapReady, language])

  // Update user marker jika lokasi berubah
  useEffect(() => {
    if (mapReady && mapInstanceRef.current && userLocation) {
      import("leaflet").then((L) => {
        addUserLocationMarker(L, mapInstanceRef.current, userLocation)
      })
    }
  }, [userLocation, mapReady, language])

  return (
    <div className="mx-auto max-w-4xl">
      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
        <div ref={mapRef} className="h-[400px] w-full" style={{ minHeight: "400px" }} />
      </div>
      {/* Map Legend */}
      <div className="mt-4 rounded-lg bg-white border border-gray-200 p-4">
        <h4 className="font-medium text-gray-900 mb-2">{language === "id" ? "Legenda" : "Legend"}</h4>
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
              <span className="text-sm text-gray-600">{language === "id" ? "Lokasi Anda" : "Your Location"}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}