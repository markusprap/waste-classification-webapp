"use client"

import { Button } from "@/components/ui/button"
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle 
} from "@/components/ui/alert-dialog"
import { useLanguage } from "@/models/language-context"
import { InteractiveMap } from "../maps/interactive-map"
import { MapPin, CheckCircle, AlertTriangle } from "lucide-react"
import { useState, useEffect } from "react"

export function MapSection({ initialUserLocation, onLocationUpdate }) {
  const { t } = useLanguage()
  const [userLocation, setUserLocation] = useState(null)
  const [isGettingLocation, setIsGettingLocation] = useState(false)
  const [showSuccessDialog, setShowSuccessDialog] = useState(false)
  const [showErrorDialog, setShowErrorDialog] = useState(false)
  const [locationData, setLocationData] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (initialUserLocation) {
      setUserLocation(initialUserLocation)
      if (onLocationUpdate) {
        onLocationUpdate(initialUserLocation)
      }
      return
    }

    try {
      const savedLocation = sessionStorage.getItem('userLocation')
      if (savedLocation) {
        const parsedLocation = JSON.parse(savedLocation)
        setUserLocation(parsedLocation)
        if (onLocationUpdate) {
          onLocationUpdate(parsedLocation)
        }
      }
    } catch (error) {
      console.error('Error loading saved location:', error)
    }
  }, [initialUserLocation, onLocationUpdate])
  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      setIsGettingLocation(true)

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords
          const location = { lat: latitude, lng: longitude }

          setUserLocation(location)
          if (onLocationUpdate) {
            onLocationUpdate(location)
          }

          try {
            sessionStorage.setItem('userLocation', JSON.stringify(location))
          } catch (error) {
            console.error('Error saving location to session storage:', error)
          }

          setIsGettingLocation(false)

          setLocationData({ latitude, longitude })
          setShowSuccessDialog(true)
        },
        (error) => {
          setIsGettingLocation(false)

          let errorKey = "map.dialog.error.unavailable"
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorKey = "map.dialog.error.permission"
              break
            case error.POSITION_UNAVAILABLE:
              errorKey = "map.dialog.error.unavailable"
              break
            case error.TIMEOUT:
              errorKey = "map.dialog.error.timeout"
              break
          }

          setErrorMessage(t(errorKey))
          setShowErrorDialog(true)
        },
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 30000,
        },
      )
    } else {
      setErrorMessage(t("map.dialog.error.unsupported"))
      setShowErrorDialog(true)
    }
  }

  return (
    <section className="bg-gray-100 py-20 md:py-24">
      <div className="container mx-auto px-6 sm:px-8 md:px-12 lg:px-16 relative z-10">
        <h2 className="mb-16 text-center text-3xl font-bold">{t("map.title")}</h2>

        <InteractiveMap userLocation={userLocation} onLocationUpdate={setUserLocation} />
        {/* Center the location button in the middle of the section if userLocation is not set */}
        {!userLocation ? (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="pointer-events-auto">
              <Button
                onClick={getCurrentLocation}
                disabled={isGettingLocation}
                className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white flex items-center gap-2 disabled:opacity-50 transition-all duration-300 transform hover:scale-105 shadow-lg text-lg px-8 py-4"
              >
                <MapPin className="h-5 w-5" />
                {isGettingLocation
                  ? t("map.getLocation") === "Get location"
                    ? "Getting location..."
                    : "Mendapatkan lokasi..."
                  : t("map.getLocation")}
              </Button>
            </div>
          </div>
        ) : (
          <div className="mt-8 flex justify-center">
            <div className="flex gap-3">
              <Button
                onClick={getCurrentLocation}
                disabled={isGettingLocation}
                variant="outline"
                className="flex items-center gap-2 disabled:opacity-50"
              >
                <MapPin className="h-4 w-4" />
                {isGettingLocation ? t("map.updatingLocation") : t("map.updateLocation")}
              </Button>
              <Button
                onClick={() => {
                  setUserLocation(null)
                  if (onLocationUpdate) {
                    onLocationUpdate(null)
                  }
                  sessionStorage.removeItem('userLocation')
                }}
                variant="outline"
                className="text-red-600 hover:bg-red-50 hover:text-red-700"
              >
                {t("map.clearLocation")}
              </Button>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
