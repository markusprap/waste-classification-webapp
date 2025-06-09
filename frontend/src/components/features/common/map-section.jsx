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

        <div className="mt-8 flex justify-center">
          {!userLocation ? (
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
          ) : (
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
          )}
        </div>

        {/* Success Dialog */}
        <AlertDialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
          <AlertDialogContent className="sm:max-w-md">
            <AlertDialogHeader className="text-center">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
              </div>
              <AlertDialogTitle className="text-xl font-bold text-gray-900">
                {t("map.dialog.success.title")}
              </AlertDialogTitle>
              <AlertDialogDescription className="text-gray-600 mt-2">
                {t("map.dialog.success.description")}
              </AlertDialogDescription>
            </AlertDialogHeader>
            
            {locationData && (
              <div className="bg-gray-50 rounded-lg p-4 my-4">
                <p className="text-sm font-medium text-gray-700 mb-2">
                  {t("map.dialog.success.coordinates")}
                </p>
                <div className="space-y-1 text-sm text-gray-600">
                  <p>📍 Latitude: {locationData.latitude.toFixed(6)}</p>
                  <p>📍 Longitude: {locationData.longitude.toFixed(6)}</p>
                </div>
              </div>
            )}

            <AlertDialogFooter>
              <AlertDialogAction 
                onClick={() => setShowSuccessDialog(false)}
                className="w-full bg-black hover:bg-gray-800"
              >
                {t("map.dialog.success.button")}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Error Dialog */}
        <AlertDialog open={showErrorDialog} onOpenChange={setShowErrorDialog}>
          <AlertDialogContent className="sm:max-w-md">
            <AlertDialogHeader className="text-center">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                  <AlertTriangle className="w-8 h-8 text-red-600" />
                </div>
              </div>
              <AlertDialogTitle className="text-xl font-bold text-gray-900">
                {t("map.dialog.error.title")}
              </AlertDialogTitle>
              <AlertDialogDescription className="text-gray-600 mt-2">
                {errorMessage}
              </AlertDialogDescription>
            </AlertDialogHeader>

            <AlertDialogFooter>
              <AlertDialogAction 
                onClick={() => setShowErrorDialog(false)}
                className="w-full bg-black hover:bg-gray-800"
              >
                {t("map.dialog.error.button")}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </section>
  )
}
