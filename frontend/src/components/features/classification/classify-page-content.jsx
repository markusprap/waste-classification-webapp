"use client"

import { useSearchParams } from "next/navigation"
import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { Navbar } from "@/components/features/navigation/navbar"
import { Footer } from "@/components/features/shared/footer"
import { ClassifyUploadSection } from "./classify-upload-section"
import { WasteManagementMethods } from "./waste-management-methods"
import { ArticleRecommendations } from "./article-recommendations"
import { MapSection } from "@/components/features/maps/map-section"
import { useLanguage } from "@/models/language-context"
import { ScrollToTop } from "@/components/features/shared/scroll-to-top"
import { useLoadingState } from "@/hooks/use-loading-state"
import { fetchArticlesByCategory, fetchArticlesByMainCategory } from '@/services/articleService'
import { useAuth } from "@/models/auth-context"
import AuthDialog from "@/components/features/auth/auth-dialog"

export function ClassifyPageContent() {
  const { language, t } = useLanguage()
  const searchParams = useSearchParams()
  const [classificationData, setClassificationData] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [homeClassificationData, setHomeClassificationData] = useState(null);
  const [error, setError] = useState(null);
  const [recommendedArticles, setRecommendedArticles] = useState([]);
  const { isAuthenticated } = useAuth();
  const [authDialogOpen, setAuthDialogOpen] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [scrollY, setScrollY] = useState(0);
  const [mapSectionTop, setMapSectionTop] = useState(0);
  const mapSectionRef = useRef(null);

  const handleAuthClick = () => {
    setAuthDialogOpen(true)
  }

  const handleAuthModeSwitch = (mode) => {
    setAuthMode(mode)
  }

  console.log('🏠 ClassifyPageContent component rendering...');

  // Scroll tracking for sticky login buttons
  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
      // Calculate map section position (relative to document)
      if (mapSectionRef.current) {
        const rect = mapSectionRef.current.getBoundingClientRect();
        setMapSectionTop(window.scrollY + rect.top);
      }
    };
    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Initialize
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
  // Fetch recommended articles when classificationData changes
  useEffect(() => {
    if (classificationData && (classificationData.mainCategory || classificationData.category)) {
      fetchArticlesByMainCategory(
        classificationData.mainCategory,
        classificationData.category
      ).then(setRecommendedArticles)
    } else {
      setRecommendedArticles([])
    }
  }, [classificationData])
  
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 relative min-h-screen">
        {/* Render blur overlay only on main content if not authenticated */}
        {!isAuthenticated && scrollY < mapSectionTop - 200 && (
          <>
            {/* Blur overlay only on main content */}
            <div className="absolute inset-0 z-10 backdrop-blur-md bg-white/70 min-h-screen" />
            {/* Overlay login prompt: container flex-col, pesan plain text, tombol di bawah */}
            <div 
              className="fixed inset-0 z-40 flex items-center justify-center"
              style={{ minHeight: '100vh' }}
            >
              <div className="flex flex-col w-full max-w-xs items-stretch justify-between h-40 bg-white/80 rounded-xl shadow-2xl p-4 border border-emerald-100">
                <div className="flex-1 flex items-center justify-center">
                  <span className="text-base font-semibold text-emerald-700 text-center">
                    {language === 'id' ? 'Login diperlukan untuk mengakses fitur klasifikasi' : 'Login required to access classification features'}
                  </span>
                </div>
                <div className="flex-1 flex items-end justify-center">
                  <button
                    onClick={handleAuthClick}
                    className="w-full px-6 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold text-base shadow-lg hover:from-emerald-700 hover:to-teal-700 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-emerald-400 transform hover:scale-105"
                  >
                    {language === 'id' ? 'Login Sekarang' : 'Login Now'}
                  </button>
                </div>
              </div>
            </div>
          </>
        )}

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

        {/* Article Recommendations */}
        {classificationData && (
          <ArticleRecommendations 
            mainCategory={classificationData.mainCategory}
            category={classificationData.category}
          />
        )}        {/* Map Section */}
        <div ref={mapSectionRef}>
          <MapSection initialUserLocation={userLocation} onLocationUpdate={setUserLocation} />
        </div>
        <ScrollToTop />
      </main>
      <Footer />
      
      {/* Auth Dialog */}
      <AuthDialog
        isOpen={authDialogOpen}
        onClose={() => setAuthDialogOpen(false)}
        mode={authMode}
        onSwitchMode={handleAuthModeSwitch}
      />
    </div>
  )
}
