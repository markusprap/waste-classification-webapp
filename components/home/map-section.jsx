"use client"

import { Button } from "@/components/ui/button"
import { useLanguage } from "@/context/language-context"
import { InteractiveMap } from "../shared/interactive-map"
import { MapPin } from "lucide-react"
import { useState } from "react"

export function MapSection() {
  const { t } = useLanguage()
  const [userLocation, setUserLocation] = useState(null)
  const [isGettingLocation, setIsGettingLocation] = useState(false)

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      setIsGettingLocation(true)

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords
          const location = { lat: latitude, lng: longitude }

          setUserLocation(location)
          setIsGettingLocation(false)

          alert(
            `${t("map.getLocation")} berhasil!\nLatitude: ${latitude.toFixed(6)}\nLongitude: ${longitude.toFixed(6)}`,
          )
        },
        (error) => {
          setIsGettingLocation(false)

          let errorMessage = "Unable to retrieve your location"
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = "Location access denied by user"
              break
            case error.POSITION_UNAVAILABLE:
              errorMessage = "Location information is unavailable"
              break
            case error.TIMEOUT:
              errorMessage = "Location request timed out"
              break
          }

          alert(errorMessage)
        },
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 30000,
        },
      )
    } else {
      alert("Geolocation is not supported by this browser")
    }
  }

  return (
    <section className="bg-gray-100 py-20 md:py-24">
      <div className="container mx-auto px-6 sm:px-8 md:px-12 lg:px-16 relative z-10">
        <h2 className="mb-16 text-center text-3xl font-bold">{t("map.title")}</h2>

        <InteractiveMap userLocation={userLocation} onLocationUpdate={setUserLocation} />

        <div className="mt-8 flex justify-center">
          <Button
            onClick={getCurrentLocation}
            disabled={isGettingLocation}
            className="bg-black text-white hover:bg-gray-800 flex items-center gap-2 disabled:opacity-50"
          >
            <MapPin className="h-4 w-4" />
            {isGettingLocation
              ? t("map.getLocation") === "Get location"
                ? "Getting location..."
                : "Mendapatkan lokasi..."
              : t("map.getLocation")}
          </Button>
        </div>
      </div>
    </section>
  )
}