"use client"

import { useState, useRef, useEffect } from "react"
import { Upload, Camera, Loader2, X, Image, CameraIcon, Lock } from "lucide-react"
import { useLanguage } from "@/models/language-context"
import { useRouter } from "next/navigation"
import { ClassificationResult } from "@/components/classification"
import dynamic from "next/dynamic"
import { useLoadingState } from "@/hooks/use-loading-state"
import { useAuth } from "@/models/auth-context"
import AuthDialog from "@/components/features/auth/auth-dialog"
import { LimitReachedModal } from "../classification/limit-reached-modal"

const Webcam = dynamic(() => import("react-webcam"), { ssr: false })

export function ImageUpload() {
  const { language } = useLanguage()
  const router = useRouter()
  const fileInputRef = useRef(null)
  const cameraInputRef = useRef(null)
  const webcamRef = useRef(null)
  const dialogRef = useRef(null)
  const { withLoading, isLoading } = useLoadingState()
  const { isAuthenticated } = useAuth()

  const [selectedImage, setSelectedImage] = useState(null)
  const [selectedFile, setSelectedFile] = useState(null)
  // Remove local isClassifying state
  const [classificationResult, setClassificationResult] = useState(null)
  const [error, setError] = useState(null)
  const [showOptions, setShowOptions] = useState(false)
  const [showWebcam, setShowWebcam] = useState(false)
  const [authDialogOpen, setAuthDialogOpen] = useState(false)
  const [showLimitModal, setShowLimitModal] = useState(false)
  const [limitInfo, setLimitInfo] = useState(null)

  // Close AuthDialog when clicking outside
  useEffect(() => {
    if (!authDialogOpen) return
    function handleClickOutside(event) {
      if (dialogRef.current && !dialogRef.current.contains(event.target)) {
        setAuthDialogOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [authDialogOpen])

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

  const openCamera = () => {
    setShowWebcam(true)
    setShowOptions(false)
  }

  const openGallery = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
      fileInputRef.current.click()
    }
    setShowOptions(false)
  }

  const showUploadOptions = () => {
    setShowOptions(true)
  }

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

  const cancelWebcam = () => {
    setShowWebcam(false)
  }

  const classifyImage = async () => {
    if (!selectedFile) return
    setError(null)
    await withLoading(async () => {
      return new Promise((resolve) => {
        try {
          const reader = new FileReader()
          reader.onload = async (e) => {
            try {
              const imageData = e.target.result
              const response = await fetch('/api/classify', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                  imageData,
                  location: null
                }),
              })
              const data = await response.json()
              if (response.status === 429) {
                setLimitInfo({
                  plan: data.plan || 'free',
                  limit: data.limit || 30,
                  usageCount: data.usageCount || 0,
                  requireUpgrade: data.requireUpgrade || (data.plan === 'free'),
                  upgradeUrl: data.upgradeUrl || '/payment',
                  message: data.message || (language === 'id' 
                    ? 'Anda telah mencapai batas klasifikasi harian.' 
                    : 'You have reached your daily classification limit.')
                });
                setShowLimitModal(true);
                setError(data.error || 'Classification limit reached');
                resolve();
                return;
              }
              if (response.ok && data.success) {
                setClassificationResult(data.classification)
              } else {
                setError(data.error || 'Classification failed')
                const fallbackResult = {
                  type: "Unknown Waste",
                  typeId: "Sampah Tidak Dikenal",
                  category: "General Waste",
                  categoryId: "Sampah Umum",
                  confidence: 50,
                  description: "Unable to classify this waste accurately",
                  descriptionId: "Tidak dapat mengklasifikasi sampah ini dengan akurat",
                  disposal: "Place in general waste bin",
                  disposalId: "Masukkan ke tempat sampah umum",
                  recommendation: "Consider manual sorting or ask waste management professionals",
                  recommendationId: "Pertimbangkan pemisahan manual atau tanya profesional pengelolaan sampah",
                  method: "reduce",
                }
                setClassificationResult(fallbackResult)
              }
              resolve()
            } catch (error) {
              setError(`Classification failed: ${error.message}`)
              resolve()
            }
          }
          reader.readAsDataURL(selectedFile)
        } catch (error) {
          setError(`Classification failed: ${error.message}`)
          resolve()
        }
      })
    })
  }

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
      <div className="bg-white rounded-xl shadow-lg overflow-hidden relative">
        {/* Overlay lock if not authenticated */}
        {!isAuthenticated && (
          <>
            <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm">
              <div className="flex flex-col items-center">
                <Lock className="w-12 h-12 text-gray-400 mb-2" />
                <div className="text-gray-700 font-semibold text-lg mb-1">{language === "id" ? "Masuk untuk mengklasifikasikan sampah" : "Login to classify waste"}</div>
                <button
                  onClick={() => setAuthDialogOpen(true)}
                  className="mt-2 px-5 py-2 rounded-lg bg-emerald-600 text-white font-medium hover:bg-emerald-700 transition-all"
                >
                  {language === "id" ? "Masuk / Daftar" : "Login / Register"}
                </button>
              </div>
            </div>
            <div ref={dialogRef}>
              <AuthDialog isOpen={authDialogOpen} onClose={() => setAuthDialogOpen(false)} />
            </div>
          </>
        )}

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
                  className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white px-6 py-2 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg"
                >
                  {language === "id" ? "Ambil Foto" : "Capture"}
                </button>
                <button
                  onClick={cancelWebcam}
                  className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300 transition-all duration-300"
                >
                  {language === "id" ? "Batal" : "Cancel"}
                </button>
              </div>
            </div>
          </div>
        )}

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

        {!selectedImage && (
          <div className="relative">
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

            {showOptions && (
              <>
                <div 
                  className="fixed inset-0 bg-black bg-opacity-50 z-40"
                  onClick={() => setShowOptions(false)}
                />
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
                      <button
                        onClick={openCamera}
                        className="w-full flex items-center space-x-3 p-3 text-left bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-all duration-300 border border-emerald-200 hover:border-emerald-300"
                      >
                        <div className="w-10 h-10 bg-emerald-600 rounded-lg flex items-center justify-center">
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
                      <button
                        onClick={openGallery}
                        className="w-full flex items-center space-x-3 p-3 text-left bg-teal-50 hover:bg-teal-100 rounded-lg transition-all duration-300 border border-teal-200 hover:border-teal-300"
                      >
                        <div className="w-10 h-10 bg-teal-600 rounded-lg flex items-center justify-center">
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

        {error && (
          <div className="mx-6 mb-4 bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        )}

        <ClassificationResult 
          classificationResult={classificationResult}
          onNavigateToClassify={navigateToClassify}
          onClassifyAgain={resetUpload}
        />

        {selectedImage && !classificationResult && (
          <div className="p-6 bg-gray-50 border-t">
            {isLoading ? (
              <div className="flex items-center justify-center space-x-2 py-2">
                <Loader2 className="w-5 h-5 animate-spin text-green-600" />
                <span className="text-green-700">
                  {language === "id" ? "Menganalisis dengan AI..." : "Analyzing with AI..."}
                </span>
              </div>
            ) : (
              <button
                onClick={classifyImage}
                className="w-full px-6 py-3 rounded-lg transition-all duration-300 font-medium transform hover:scale-105 shadow-lg bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white"
              >
                {language === "id" ? "Klasifikasi dengan AI" : "Classify with AI"}
              </button>
            )}
          </div>
        )}
      </div>
      <LimitReachedModal 
        isOpen={showLimitModal}
        onClose={() => setShowLimitModal(false)}
        limitInfo={limitInfo}
      />
    </div>
  )
}
