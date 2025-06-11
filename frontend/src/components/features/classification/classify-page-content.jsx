"use client"

import { useSearchParams } from "next/navigation"
import { useState, useEffect } from "react"
import { Navbar } from "@/components/features/navigation/navbar"
import { Footer } from "@/components/features/shared/footer"
import { ClassifyUploadSection } from "./classify-upload-section"
import { WasteManagementMethods } from "./waste-management-methods"
import { MapSection } from "@/components/features/maps/map-section"
import { useLanguage } from "@/models/language-context"
import { ScrollToTop } from "@/components/features/shared/scroll-to-top"
import { useLoadingState } from "@/hooks/use-loading-state"

export function ClassifyPageContent() {
  const { language, t } = useLanguage()
  const searchParams = useSearchParams()
  const [classificationData, setClassificationData] = useState(null)
  const [userLocation, setUserLocation] = useState(null)
  const [homeClassificationData, setHomeClassificationData] = useState(null)
  const [error, setError] = useState(null)

  console.log('🏠 ClassifyPageContent component rendering...');

  // Check for data from home page when component mounts
  useEffect(() => {
    console.log('🏠 ClassifyPageContent - useEffect triggered');
    console.log('🏠 ClassifyPageContent - searchParams:', Object.fromEntries(searchParams.entries()));
    
    try {
      const hasData = searchParams.get("hasData")
      const source = searchParams.get("source")
      
      if (hasData === "true" && source === "home") {
        try {
          const storedData = sessionStorage.getItem('homeClassificationData')
          if (storedData) {
            const parsedData = JSON.parse(storedData)
            console.log('🏠 Loading classification data from home page:', parsedData)
            
            setHomeClassificationData(parsedData)
            setClassificationData(parsedData)
            
            // Clear the session storage after loading
            sessionStorage.removeItem('homeClassificationData')
          }
        } catch (error) {
          console.error('❌ Error loading home classification data:', error)
          setError('Failed to load classification data from home page')
        }
      }
    } catch (error) {
      console.error('❌ Error in ClassifyPageContent useEffect:', error);
      setError('Failed to initialize classify page');
    }
  }, [searchParams])

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mx-6 my-4">
            <p><strong>Error:</strong> {error}</p>
            <button 
              onClick={() => setError(null)}
              className="mt-2 px-3 py-1 bg-red-100 hover:bg-red-200 rounded text-sm"
            >
              Dismiss
            </button>
          </div>
        )}
        
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 py-16 md:py-20">
          <div className="container mx-auto px-6 sm:px-8 md:px-12 lg:px-16">
            <div className="text-center">
              <div className="mb-4 inline-flex items-center rounded-full bg-emerald-100 px-6 py-3 text-sm font-medium text-emerald-700">
                ✨ AI-Powered Classification Engine
              </div>
              <h1 className="text-4xl font-bold text-gray-900 md:text-5xl">
                {t("classify.title")}
              </h1>
              <p className="mt-4 text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
                {t("classify.description")}
              </p>
              <div className="mt-6 flex justify-center items-center space-x-8 text-sm text-gray-500">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span>99.2% Accuracy</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                  <span>Instant Results</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
                  <span>Smart Guidance</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Upload Section */}
        <ClassifyUploadSection
          initialClassificationData={homeClassificationData}
          onClassificationUpdate={setClassificationData}
        />

        {/* Waste Management Methods */}
        <WasteManagementMethods classificationData={classificationData} />

        {/* Map Section */}
        <MapSection initialUserLocation={userLocation} onLocationUpdate={setUserLocation} />
      
        <ScrollToTop />
      </main>
      <Footer />
    </div>
  )
}
