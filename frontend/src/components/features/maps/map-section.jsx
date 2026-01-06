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
import { InteractiveMap } from "./interactive-map"
import { MapPin, CheckCircle, AlertTriangle } from "lucide-react"
import { useState, useEffect } from "react"

export function MapSection({ initialUserLocation, onLocationUpdate }) {
  const { t } = useLanguage()
  const [userLocation, setUserLocation] = useState(null)
  const [isGettingLocation, setIsGettingLocation] = useState(false)
  const [showSuccessDialog, setShowSuccessDialog] = useState(false)
  const [showErrorDialog, setShowErrorDialog] = useState(false)
  const [locationData, setLocationData] = useState(null)
  const [errorMessage, setErrorMessage] = useState("")

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
        console.log('Loading saved user location:', parsedLocation)
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

      // Timeout for fallback to default location
      const timeoutId = setTimeout(() => {
        setIsGettingLocation(false)
        setErrorMessage(t("map.dialog.error.timeout") + " " + t("map.dialog.error.usingDefault"))
        // Fallback to Jakarta
        const jakartaLocation = { lat: -6.2088, lng: 106.8456 }
        setUserLocation(jakartaLocation)
        if (onLocationUpdate) {
          onLocationUpdate(jakartaLocation)
        }
        setLocationData({ latitude: -6.2088, longitude: 106.8456 })
        setShowSuccessDialog(true)
      }, 10000)

      navigator.geolocation.getCurrentPosition(
        (position) => {
          clearTimeout(timeoutId)
          const { latitude, longitude } = position.coords
          const location = { lat: latitude, lng: longitude }

          setUserLocation(location)
          if (onLocationUpdate) {
            onLocationUpdate(location)
          }

          try {
            sessionStorage.setItem('userLocation', JSON.stringify(location))
            console.log('User location saved to session storage')
          } catch (error) {
            console.error('Error saving location to session storage:', error)
          }

          setIsGettingLocation(false)

          // Store location data for dialog
          setLocationData({ latitude, longitude })
          setShowSuccessDialog(true)
        },
        (error) => {
          clearTimeout(timeoutId)
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
          timeout: 10000,
          maximumAge: 30000,
        },
      )
    } else {
      setErrorMessage(t("map.dialog.error.unsupported"))
      setShowErrorDialog(true)
    }
  }

  // Function to use default Jakarta location
  const useDefaultLocation = () => {
    const jakartaLocation = { lat: -6.2088, lng: 106.8456 }
    setUserLocation(jakartaLocation)
    if (onLocationUpdate) {
      onLocationUpdate(jakartaLocation)
    }
    try {
      sessionStorage.setItem('userLocation', JSON.stringify(jakartaLocation))
    } catch (error) {
      console.error('Error saving location:', error)
    }
    setShowErrorDialog(false)
    setLocationData({ latitude: -6.2088, longitude: 106.8456 })
    setShowSuccessDialog(true)
  }


  return (
    <section className="relative py-24 md:py-32 overflow-hidden bg-[#F9FBFA]">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-emerald-500/5 blur-[120px] rounded-full -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-teal-500/5 blur-[100px] rounded-full translate-y-1/2"></div>

      <div className="container mx-auto px-6 sm:px-8 md:px-12 lg:px-16 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight leading-tight">
            {t("map.title")}
          </h2>
          <div className="mt-4 flex items-center justify-center gap-2">
            <div className="h-1.5 w-12 bg-emerald-500 rounded-full"></div>
            <div className="h-1.5 w-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
            <div className="h-1.5 w-1.5 bg-emerald-500/50 rounded-full"></div>
          </div>
        </div>

        <div className="bg-white/40 backdrop-blur-xl border border-white/50 rounded-[3rem] p-4 md:p-8 shadow-2xl shadow-emerald-900/5">
          <InteractiveMap userLocation={userLocation} onLocationUpdate={setUserLocation} />
        </div>
        <div className="mt-12 flex justify-center">
          {!userLocation ? (
            <Button
              onClick={getCurrentLocation}
              disabled={isGettingLocation}
              className="px-8 py-7 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-sm uppercase tracking-widest rounded-2xl flex items-center gap-3 disabled:opacity-50 transition-all duration-500 transform hover:scale-105 hover:rotate-1 shadow-xl shadow-emerald-500/20 active:scale-95"
            >
              <div className="p-1.5 bg-white/20 rounded-lg">
                <MapPin className="h-5 w-5" />
              </div>
              {isGettingLocation
                ? t("map.getLocation") === "Get location"
                  ? "Discovering..."
                  : "Mencari Lokasi..."
                : t("map.getLocation")}
            </Button>
          ) : (
            <div className="flex flex-wrap justify-center gap-4">
              <Button
                onClick={getCurrentLocation}
                disabled={isGettingLocation}
                variant="outline"
                className="px-8 py-7 border-2 border-emerald-500/20 hover:border-emerald-500/40 bg-white/50 backdrop-blur-md text-emerald-700 font-bold text-sm uppercase tracking-widest rounded-2xl flex items-center gap-3 transition-all duration-500 hover:bg-emerald-50 shadow-lg shadow-emerald-900/5"
              >
                <div className="p-1.5 bg-emerald-100 rounded-lg">
                  <MapPin className="h-5 w-5 text-emerald-600" />
                </div>
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
                className="px-8 py-7 border-2 border-rose-500/10 hover:border-rose-500/30 hover:bg-rose-50 text-rose-600 font-bold text-sm uppercase tracking-widest rounded-2xl transition-all shadow-lg shadow-rose-900/5"
              >
                {t("map.clearLocation")}
              </Button>
            </div>
          )}
        </div>

        {/* Success Dialog */}
        <AlertDialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
          <AlertDialogContent className="sm:max-w-md p-0 overflow-hidden bg-white/80 backdrop-blur-xl border border-white/20 rounded-[2.5rem] shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-500 to-teal-500"></div>
            <div className="p-8">
              <div className="flex justify-center mb-6">
                <div className="w-20 h-20 bg-emerald-50 rounded-3xl flex items-center justify-center border border-emerald-100 shadow-inner group">
                  <CheckCircle className="w-10 h-10 text-emerald-500 group-hover:scale-110 transition-transform" />
                </div>
              </div>
              <AlertDialogHeader className="text-center">
                <AlertDialogTitle className="text-2xl font-black text-gray-900 leading-tight">
                  {t("map.dialog.success.title")}
                </AlertDialogTitle>
                <AlertDialogDescription className="text-gray-500 font-medium text-sm mt-3 leading-relaxed">
                  {t("map.dialog.success.description")}
                </AlertDialogDescription>
              </AlertDialogHeader>

              {locationData && (
                <div className="bg-emerald-50/50 rounded-2xl p-5 my-6 border border-emerald-100/50">
                  <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-3">
                    {t("map.dialog.success.coordinates")}
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white/60 p-3 rounded-xl border border-white">
                      <p className="text-[9px] font-bold text-gray-400 uppercase mb-0.5">Latitude</p>
                      <p className="font-black text-gray-700 text-xs tracking-tight">{locationData.latitude.toFixed(6)}</p>
                    </div>
                    <div className="bg-white/60 p-3 rounded-xl border border-white">
                      <p className="text-[9px] font-bold text-gray-400 uppercase mb-0.5">Longitude</p>
                      <p className="font-black text-gray-700 text-xs tracking-tight">{locationData.longitude.toFixed(6)}</p>
                    </div>
                  </div>
                </div>
              )}

              <AlertDialogFooter>
                <AlertDialogAction
                  onClick={() => setShowSuccessDialog(false)}
                  className="w-full h-14 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs uppercase tracking-widest rounded-2xl transition-all duration-500 shadow-lg shadow-emerald-500/20"
                >
                  {t("map.dialog.success.button")}
                </AlertDialogAction>
              </AlertDialogFooter>
            </div>
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

            <AlertDialogFooter className="flex flex-col gap-2 sm:flex-col">
              <Button
                onClick={useDefaultLocation}
                className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white"
              >
                📍 Use Jakarta Location
              </Button>
              <AlertDialogAction
                onClick={() => setShowErrorDialog(false)}
                className="w-full bg-gray-200 text-gray-800 hover:bg-gray-300"
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
