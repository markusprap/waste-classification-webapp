"use client"

import { useState, useRef, useEffect } from "react"
import { Upload, Camera, Loader2, X, Image, CameraIcon, RefreshCcw, Zap } from "lucide-react"
import { useLanguage } from "@/models/language-context"
import { useRouter } from "next/navigation"
import { ClassificationResult } from "@/components/classification"
import dynamic from "next/dynamic"
import { useLoadingState } from "@/hooks/use-loading-state"
import { useAuth } from "@/models/auth-context"
import { LimitReachedModal } from "../classification/limit-reached-modal"

const Webcam = dynamic(() => import("react-webcam"), { ssr: false })

export function ImageUpload() {
  const { language } = useLanguage()
  const router = useRouter()
  const fileInputRef = useRef(null)
  const cameraInputRef = useRef(null)
  const webcamRef = useRef(null)
  const { withLoading, isLoading } = useLoadingState()
  const [selectedImage, setSelectedImage] = useState(null)
  const [selectedFile, setSelectedFile] = useState(null)
  const [classificationResult, setClassificationResult] = useState(null)
  const [error, setError] = useState(null)
  const [showOptions, setShowOptions] = useState(false)
  const [showWebcam, setShowWebcam] = useState(false)
  const [showLimitModal, setShowLimitModal] = useState(false)
  const [limitInfo, setLimitInfo] = useState(null)
  const [isDragOver, setIsDragOver] = useState(false)

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
    setIsDragOver(true)
  }

  const handleDragLeave = (event) => {
    event.preventDefault()
    setIsDragOver(false)
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
    setIsDragOver(false)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
    if (cameraInputRef.current) {
      cameraInputRef.current.value = ''
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 overflow-hidden relative group/container">
        {/* Header Decoration */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 z-10"></div>

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
          <div className="p-8 border-b border-gray-50">
            <div className="relative group/image">
              <div className="absolute inset-0 bg-black/20 group-hover/image:bg-black/10 transition-colors rounded-3xl z-10"></div>
              <img
                src={selectedImage}
                alt="Selected waste"
                className="w-full h-80 object-cover rounded-3xl"
              />
              <button
                onClick={resetUpload}
                className="absolute top-4 right-4 z-20 bg-white/90 backdrop-blur-md text-gray-900 rounded-full w-10 h-10 flex items-center justify-center shadow-lg hover:bg-red-500 hover:text-white transition-all duration-300"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            {selectedFile && (
              <div className="mt-4 flex items-center justify-center gap-4 text-sm font-medium text-gray-400">
                <span className="truncate max-w-[200px]">{selectedFile.name}</span>
                <div className="w-1.5 h-1.5 bg-gray-200 rounded-full"></div>
                <span>{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</span>
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
              className={`
                min-h-[300px] flex flex-col items-center justify-center p-10 
                border-2 border-dashed rounded-[2.5rem] transition-all duration-500
                cursor-pointer overflow-hidden relative m-8
                ${isDragOver
                  ? 'border-emerald-500 bg-emerald-50/50 scale-[0.98]'
                  : 'border-gray-200 bg-gray-50/30 hover:border-emerald-300 hover:bg-emerald-50/20'}
              `}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={showUploadOptions}
            >
              {/* Decorative elements */}
              <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-100/20 blur-2xl rounded-full translate-x-12 -translate-y-12"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-teal-100/20 blur-2xl rounded-full -translate-x-12 translate-y-12"></div>

              <div className="relative z-10 flex flex-col items-center">
                <div className="mb-8 p-6 bg-white rounded-3xl shadow-xl shadow-emerald-500/10 group-hover/container:scale-110 group-hover/container:rotate-3 transition-transform duration-500">
                  <div className="flex gap-4">
                    <Upload className="w-8 h-8 text-emerald-500" />
                    <Camera className="w-8 h-8 text-teal-500" />
                  </div>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900 mb-3">
                    {language === "id" ? "Klasifikasi Sekarang" : "Classify Now"}
                  </p>
                  <p className="text-gray-500 font-medium max-w-[280px] leading-relaxed mx-auto">
                    {language === "id"
                      ? "Unggah galeri, ambil foto, atau seret file gambar di sini"
                      : "Upload from gallery, capture photo, or drag image here"}
                  </p>
                </div>
                <div className="mt-8 flex items-center gap-3 py-2 px-5 bg-white rounded-full text-xs font-bold text-gray-400 shadow-sm border border-gray-100">
                  <span className="text-emerald-500">PNG</span>
                  <span>JPG</span>
                  <span>GIF</span>
                  <span className="text-gray-200">|</span>
                  <span>MAX 10MB</span>
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
                        className="group w-full flex items-center gap-4 p-4 rounded-2xl bg-emerald-50 hover:bg-emerald-100 transition-all border border-emerald-100/50 hover:border-emerald-200 text-left"
                      >
                        <div className="w-12 h-12 bg-emerald-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:scale-110 transition-transform duration-500 shrink-0">
                          <CameraIcon className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-bold text-emerald-900 text-base mb-0.5 leading-none">
                            {language === "id" ? "Ambil Foto" : "Take Photo"}
                          </h4>
                          <p className="text-emerald-700/60 text-[10px] font-bold leading-tight uppercase tracking-wider">
                            {language === "id" ? "Kamera Langsung" : "Instant Capture"}
                          </p>
                        </div>
                        <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity">
                          <span className="text-lg font-black">→</span>
                        </div>
                      </button>

                      <button
                        onClick={openGallery}
                        className="group w-full flex items-center gap-4 p-4 rounded-2xl bg-teal-50 hover:bg-teal-100 transition-all border border-teal-100/50 hover:border-teal-200 text-left"
                      >
                        <div className="w-12 h-12 bg-teal-500 rounded-xl flex items-center justify-center shadow-lg shadow-teal-500/20 group-hover:scale-110 transition-transform duration-500 shrink-0">
                          <Image className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-bold text-teal-900 text-base mb-0.5 leading-none">
                            {language === "id" ? "Pilih Galeri" : "Choose Gallery"}
                          </h4>
                          <p className="text-teal-700/60 text-[10px] font-bold leading-tight uppercase tracking-wider">
                            {language === "id" ? "Dari Perangkat" : "From Device"}
                          </p>
                        </div>
                        <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-teal-500 opacity-0 group-hover:opacity-100 transition-opacity">
                          <span className="text-lg font-black">→</span>
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
          <div className="p-8 pt-0">
            <button
              onClick={classifyImage}
              disabled={isLoading}
              className={`
                w-full h-16 rounded-2xl font-extrabold text-lg tracking-wide
                transition-all duration-300 shadow-xl
                flex items-center justify-center gap-3
                ${isLoading
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white transform hover:scale-[1.02] active:scale-[0.98] shadow-emerald-500/25'}
              `}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-6 h-6 animate-spin" />
                  {language === "id" ? "MENGANALISIS..." : "ANALYZING..."}
                </>
              ) : (
                <>
                  <Zap className="w-6 h-6" />
                  {language === "id" ? "KLASIFIKASI DENGAN AI" : "CLASSIFY WITH AI"}
                </>
              )}
            </button>
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
