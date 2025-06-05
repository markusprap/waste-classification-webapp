"use client"

import { useState, useRef } from "react"
import { Upload, Camera, Loader2, X, Image, CameraIcon, Lock } from "lucide-react"
import { useLanguage } from "@/context/language-context"
import { useAuth } from "@/context/auth-context"
import { useRouter } from "next/navigation"
import { classifyWasteImage } from "@/lib/tensorflow-model"
import { ClassificationResult } from "./classification-results"
import AuthDialog from "@/components/auth/auth-dialog"
import dynamic from "next/dynamic"

// Dynamically import Webcam to avoid SSR issues
const Webcam = dynamic(() => import("react-webcam"), { ssr: false })

export function ImageUpload() {
  const { language } = useLanguage()
  const { user, isAuthenticated, classify } = useAuth()
  const router = useRouter()
  const fileInputRef = useRef(null)
  const cameraInputRef = useRef(null)
  const webcamRef = useRef(null)

  const [selectedImage, setSelectedImage] = useState(null)
  const [selectedFile, setSelectedFile] = useState(null)
  const [isClassifying, setIsClassifying] = useState(false)
  const [classificationResult, setClassificationResult] = useState(null)
  const [error, setError] = useState(null)
  const [showOptions, setShowOptions] = useState(false)
  const [showWebcam, setShowWebcam] = useState(false)
  const [authDialogOpen, setAuthDialogOpen] = useState(false)
  const [authMode, setAuthMode] = useState('login')

  const handleImageSelect = (file, source = "file") => {
    if (!file || !file.type.startsWith('image/')) {
      setError(language === "id" ? "Silakan pilih file gambar" : "Please select an image file")
      return
    }

    if (file.size > 10 * 1024 * 1024) {
      setError(language === "id" ? "Ukuran file maksimal 10MB" : "Maximum file size is 10MB")
      return
    }

    setSelectedFile(file)
    setError(null)
    setClassificationResult(null)
    setShowOptions(false)

    const reader = new FileReader()
    reader.onload = (e) => {
      setSelectedImage(e.target.result)
    }
    reader.readAsDataURL(file)

    console.log(`📁 Image selected from ${source}:`, {
      name: file.name,
      size: file.size,
      type: file.type
    })
  }

  const handleFileInput = (event) => {
    const file = event.target.files[0]
    if (file) {
      handleImageSelect(file, "gallery")
    }
  }

  const handleCameraInput = (event) => {
    const file = event.target.files[0]
    if (file) {
      handleImageSelect(file, "camera")
    }
  }

  const handleDrop = (event) => {
    event.preventDefault()
    setShowOptions(false)
    const file = event.dataTransfer.files[0]
    if (file) {
      handleImageSelect(file, "drag")
    }
  }

  const handleDragOver = (event) => {
    event.preventDefault()
  }

  const handleDragLeave = (event) => {
    event.preventDefault()
  }

  // Open camera with react-webcam
  const openCamera = () => {
    setShowWebcam(true)
    setShowOptions(false)
  }

  // Open file picker for gallery
  const openGallery = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
      fileInputRef.current.click()
    }
    setShowOptions(false)
  }

  // Show upload options
  const showUploadOptions = () => {
    setShowOptions(true)
  }

  // Capture from webcam
  const captureFromWebcam = () => {
    const imageSrc = webcamRef.current.getScreenshot()
    if (imageSrc) {
      fetch(imageSrc)
        .then(res => res.blob())
        .then(blob => {
          const file = new File([blob], "webcam.jpg", { type: "image/jpeg" })
          handleImageSelect(file, "webcam")
        })
      setShowWebcam(false)
    }
  }

  // Cancel webcam
  const cancelWebcam = () => {
    setShowWebcam(false)
  }

  // TRIGGER FUNGSI CLASSIFYMODEL SAAT BUTTON CLASSIFY DIKLIK
  const classifyImage = async () => {
    if (!selectedFile) return

    // Check if user is authenticated
    if (!isAuthenticated) {
      setAuthDialogOpen(true)
      return
    }

    // We don't need to check limits here as the button is already disabled
    // and the API will also check this, but we'll keep a front-end check for UX
    if (isAuthenticated && user?.plan === 'free' && user?.usageCount >= 100) {
      setError(language === "id" 
        ? "Batas harian 100 klasifikasi telah tercapai. Upgrade ke Premium untuk lebih banyak klasifikasi!"
        : "Daily limit of 100 classifications reached. Upgrade to Premium for more classifications!"
      )
      return
    }

    setIsClassifying(true)
    setError(null)

    try {
      console.log('🔍 Classifying image:', selectedFile.name)
      
      // Convert file to base64 for API
      const reader = new FileReader()
      reader.onload = async (e) => {
        const imageData = e.target.result
        
        // Use auth context's classify method which handles API call and usage tracking
        const result = await classify(imageData, null) // We'll add location later if needed
        
        if (result.success) {
          setClassificationResult(result.data.classification)
          console.log('✅ Classification completed:', result.data)
        } else {
          if (result.statusCode === 429) {
            setError(language === "id" 
              ? "Batas klasifikasi harian tercapai. Upgrade plan Anda untuk lebih banyak klasifikasi."
              : "Daily classification limit reached. Please upgrade your plan for more classifications."
            )
          } else {
            setError(result.error)
          }
        }
      }
      reader.readAsDataURL(selectedFile)
      
    } catch (error) {
      console.error('❌ Classification failed:', error)
      setError(`Classification failed: ${error.message}`)
    } finally {
      setIsClassifying(false)
    }
  }

  // NAVIGATE TO CLASSIFY PAGE WITH COMPLETE DATA
  const navigateToClassify = () => {
    if (classificationResult && selectedImage) {
      const classificationPackage = {
        ...classificationResult,
        image: selectedImage,
        imageFileName: selectedFile?.name,
        imageFileSize: selectedFile?.size,
        source: 'home',
        timestamp: new Date().toISOString(),
        fromHomePage: true,
        showInitialResult: true
      }
      sessionStorage.setItem('homeClassificationData', JSON.stringify(classificationPackage))
      router.push('/classify?source=home&hasData=true')
    }
  }

  const resetUpload = () => {
    setSelectedImage(null)
    setSelectedFile(null)
    setClassificationResult(null)
    setError(null)
    setShowOptions(false)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
    if (cameraInputRef.current) {
      cameraInputRef.current.value = ''
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        {/* Webcam Modal */}
        {showWebcam && (
          <div className="fixed inset-0 bg-black bg-opacity-80 z-50 flex flex-col items-center justify-center">
            <div className="bg-white rounded-lg p-4 flex flex-col items-center">
              <Webcam
                audio={false}
                ref={webcamRef}
                screenshotFormat="image/jpeg"
                videoConstraints={{
                  facingMode: "environment"
                }}
                className="rounded-lg mb-4"
              />
              <div className="flex space-x-4">
                <button
                  onClick={captureFromWebcam}
                  className="bg-black text-white px-6 py-2 rounded-lg hover:bg-gray-800"
                >
                  {language === "id" ? "Ambil Foto" : "Capture"}
                </button>
                <button
                  onClick={cancelWebcam}
                  className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400"
                >
                  {language === "id" ? "Batal" : "Cancel"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Image Preview */}
        {selectedImage && (
          <div className="p-6 border-b">
            <div className="relative">
              <img
                src={selectedImage}
                alt="Selected waste"
                className="w-full h-64 object-cover rounded-lg"
              />
              <button
                onClick={resetUpload}
                className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600 transition-colors"
              >
                ×
              </button>
            </div>
            {selectedFile && (
              <div className="mt-2 text-sm text-gray-600 text-center">
                {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
              </div>
            )}
          </div>
        )}

        {/* Upload Area */}
        {!selectedImage && (
          <div className="relative">
            {/* Hidden file inputs */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileInput}
              className="hidden"
            />
            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleCameraInput}
              className="hidden"
            />

            {/* Main Upload Area */}
            <div
              className="p-8 border-2 border-dashed border-gray-300 rounded-lg m-6 text-center hover:border-gray-400 transition-colors cursor-pointer"
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={showUploadOptions}
            >
              <div className="space-y-4">
                <div className="flex justify-center space-x-3">
                  <Upload className="w-8 h-8 text-gray-400" />
                  <Camera className="w-8 h-8 text-gray-400" />
                </div>
                <div>
                  <p className="text-lg font-medium text-gray-900">
                    {language === "id" ? "Unggah atau foto gambar sampah" : "Upload or capture waste image"}
                  </p>
                  <p className="text-sm text-gray-500 mt-2">
                    {language === "id" 
                      ? "Pilih dari galeri, ambil foto, atau seret file | PNG, JPG, GIF hingga 10MB" 
                      : "Choose from gallery, take photo, or drag file | PNG, JPG, GIF up to 10MB"}
                  </p>
                </div>
              </div>
            </div>

            {/* Upload Options Modal */}
            {showOptions && (
              <>
                {/* Backdrop */}
                <div 
                  className="fixed inset-0 bg-black bg-opacity-50 z-40"
                  onClick={() => setShowOptions(false)}
                />
                {/* Options Modal */}
                <div className="fixed inset-x-4 top-1/2 -translate-y-1/2 z-50 max-w-sm mx-auto">
                  <div className="bg-white rounded-xl shadow-2xl overflow-hidden">
                    <div className="p-4 border-b">
                      <div className="flex justify-between items-center">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {language === "id" ? "Pilih Sumber Gambar" : "Choose Image Source"}
                        </h3>
                        <button
                          onClick={() => setShowOptions(false)}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                    <div className="p-4 space-y-3">
                      {/* Camera Option */}
                      <button
                        onClick={openCamera}
                        className="w-full flex items-center space-x-3 p-3 text-left bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                      >
                        <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                          <CameraIcon className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {language === "id" ? "Ambil Foto" : "Take Photo"}
                          </p>
                          <p className="text-sm text-gray-600">
                            {language === "id" ? "Gunakan kamera untuk foto langsung" : "Use camera to capture directly"}
                          </p>
                        </div>
                      </button>
                      {/* Gallery Option */}
                      <button
                        onClick={openGallery}
                        className="w-full flex items-center space-x-3 p-3 text-left bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
                      >
                        <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
                          <Image className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {language === "id" ? "Pilih dari Galeri" : "Choose from Gallery"}
                          </p>
                          <p className="text-sm text-gray-600">
                            {language === "id" ? "Pilih foto dari penyimpanan" : "Select photo from storage"}
                          </p>
                        </div>
                      </button>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="mx-6 mb-4 bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        )}

        {/* Classification Result Component */}
        <ClassificationResult 
          classificationResult={classificationResult}
          onNavigateToClassify={navigateToClassify}
          onClassifyAgain={resetUpload}
        />

        {/* CLASSIFY BUTTON - TRIGGERS classifyModel */}
        {selectedImage && !classificationResult && (
          <div className="p-6 bg-gray-50 border-t">
            {!isAuthenticated && (
              <div className="mb-4 bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="flex items-center space-x-2">
                  <Lock className="w-4 h-4 text-blue-600" />
                  <p className="text-blue-800 text-sm">
                    {language === "id" 
                      ? "Login diperlukan untuk menggunakan fitur klasifikasi AI" 
                      : "Login required to use AI classification feature"
                    }
                  </p>
                </div>
              </div>
            )}

            {isAuthenticated && user?.plan === 'free' && (
              <div className="mb-4 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <p className="text-yellow-800 text-sm">
                  {language === "id" 
                    ? `Sisa klasifikasi hari ini: ${Math.max(0, 100 - (user?.usageCount || 0))}/100` 
                    : `Remaining classifications today: ${Math.max(0, 100 - (user?.usageCount || 0))}/100`
                  }
                </p>
                {user?.usageCount >= 100 && (
                  <p className="text-yellow-800 text-xs mt-1">
                    {language === "id" 
                      ? "Upgrade ke Premium untuk 50 klasifikasi/hari!" 
                      : "Upgrade to Premium for 50 classifications/day!"
                    }
                  </p>
                )}
              </div>
            )}

            {isClassifying ? (
              <div className="flex items-center justify-center space-x-2 py-2">
                <Loader2 className="w-5 h-5 animate-spin text-green-600" />
                <span className="text-green-700">
                  {language === "id" ? "Menganalisis dengan AI..." : "Analyzing with AI..."}
                </span>
              </div>
            ) : (
              <button
                onClick={classifyImage}
                disabled={isAuthenticated && user?.plan === 'free' && user?.usageCount >= 100}
                className={`w-full px-6 py-3 rounded-lg transition-colors font-medium ${
                  !isAuthenticated 
                    ? 'bg-blue-600 hover:bg-blue-700 text-white'
                    : isAuthenticated && user?.plan === 'free' && user?.usageCount >= 100
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-black hover:bg-gray-800 text-white'
                }`}
              >
                {!isAuthenticated 
                  ? (language === "id" ? "Login untuk Klasifikasi" : "Login to Classify")
                  : (language === "id" ? "Klasifikasi dengan AI" : "Classify with AI")
                }
              </button>
            )}
          </div>
        )}
      </div>

      {/* Auth Dialog */}
      <AuthDialog
        isOpen={authDialogOpen}
        onClose={() => setAuthDialogOpen(false)}
        mode={authMode}
        onSwitchMode={(mode) => setAuthMode(mode)}
      />
    </div>
  )
}