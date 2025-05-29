"use client"

import { useSearchParams } from "next/navigation"
import { useState, useMemo } from "react"
import { Navbar } from "@/components/common/navbar"
import { Footer } from "@/components/common/footer"
import { ClassifyUploadSection } from "./classify-upload-section"
import { WasteManagementMethods } from "./waste-management-methods"
import { MapSection } from "@/components/home/map-section"
import { useLanguage } from "@/context/language-context"

export function ClassifyPageContent() {
  const { language } = useLanguage()
  const searchParams = useSearchParams()
  const [classificationData, setClassificationData] = useState(null)
  const [userLocation, setUserLocation] = useState(null)

  // Parse URL parameters once using useMemo
  const initialData = useMemo(() => {
    const classificationResult = searchParams.get("result")
    const locationData = searchParams.get("location")

    let parsedClassification = null
    let parsedLocation = null

    if (classificationResult) {
      try {
        parsedClassification = JSON.parse(decodeURIComponent(classificationResult))
      } catch (error) {
        console.error("Error parsing classification result:", error)
      }
    }

    if (locationData) {
      try {
        parsedLocation = JSON.parse(decodeURIComponent(locationData))
      } catch (error) {
        console.error("Error parsing location data:", error)
      }
    }

    return { parsedClassification, parsedLocation }
  }, [searchParams])

  // Set initial data only once
  useState(() => {
    if (initialData.parsedClassification && !classificationData) {
      setClassificationData(initialData.parsedClassification)
    }
    if (initialData.parsedLocation && !userLocation) {
      setUserLocation(initialData.parsedLocation)
    }
  })

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-white py-16 md:py-20">
          <div className="container mx-auto px-6 sm:px-8 md:px-12 lg:px-16">
            <div className="text-center">
              <h1 className="text-4xl font-bold text-gray-900 md:text-5xl">
                {language === "id" ? "Klasifikasi Sampah" : "Waste Classification"}
              </h1>
              <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
                {language === "id"
                  ? "Pelajari tentang berbagai jenis sampah dan cara mengelolanya. Unggah gambar atau foto Anda dan biarkan AI kami mengklasifikasikan sampah Anda."
                  : "Learn about different types of waste and how to manage them. Upload your image or photo and let our AI classify your waste."}
              </p>
            </div>
          </div>
        </section>

        {/* Upload Section */}
        <ClassifyUploadSection
          initialClassificationData={initialData.parsedClassification}
          onClassificationUpdate={setClassificationData}
        />

        {/* Waste Management Methods */}
        <WasteManagementMethods classificationData={classificationData} />

        {/* Map Section */}
        <MapSection initialUserLocation={initialData.parsedLocation} onLocationUpdate={setUserLocation} />
      </main>
      <Footer />
    </div>
  )
}
