"use client"

import { useSearchParams } from "next/navigation"
import { useState, useEffect } from "react"
import { Navbar } from "@/components/common/navbar"
import { Footer } from "@/components/common/footer"
import { useLanguage } from "@/context/language-context"
import { ScrollToTop } from "@/components/common/scroll-to-top"

export function ClassifyPageContentDebug() {
  const { language, t } = useLanguage()
  const searchParams = useSearchParams()
  const [classificationData, setClassificationData] = useState(null)
  const [userLocation, setUserLocation] = useState(null)
  const [homeClassificationData, setHomeClassificationData] = useState(null)

  // Check for data from home page when component mounts
  useEffect(() => {
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
      }
    }
  }, [searchParams])

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 py-16 md:py-20">
          <div className="container mx-auto px-6 sm:px-8 md:px-12 lg:px-16">
            <div className="text-center">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
                {t.classify?.title || "Classify Your Waste"}
              </h1>
              <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto">
                {t.classify?.subtitle || "Upload an image to identify and learn proper disposal methods"}
              </p>
            </div>
          </div>
        </section>

        {/* Upload Section Placeholder */}
        <section className="py-16 md:py-20">
          <div className="container mx-auto px-6 sm:px-8 md:px-12 lg:px-16">
            <div className="text-center">
              <p className="text-lg text-gray-600">Upload section will be here</p>
            </div>
          </div>
        </section>

        {/* Methods Section Placeholder */}
        <section className="bg-gray-50 py-16 md:py-20">
          <div className="container mx-auto px-6 sm:px-8 md:px-12 lg:px-16">
            <div className="text-center">
              <p className="text-lg text-gray-600">Waste management methods will be here</p>
            </div>
          </div>
        </section>

        {/* Map Section Placeholder */}
        <section className="py-16 md:py-20">
          <div className="container mx-auto px-6 sm:px-8 md:px-12 lg:px-16">
            <div className="text-center">
              <p className="text-lg text-gray-600">Map section will be here</p>
            </div>
          </div>
        </section>
      </main>
      <Footer />
      <ScrollToTop />
    </div>
  )
}
