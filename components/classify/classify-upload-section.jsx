"use client"

import { useState, useCallback, useRef } from "react"
import { Upload, Camera, X, Loader2, CameraIcon, Image } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useLanguage } from "@/context/language-context"
import { ClassificationResultCard } from "./classification-result-card"
import { classifyWasteImage } from "@/lib/tensorflow-model"
import Webcam from "react-webcam"

export function ClassifyUploadSection({ initialClassificationData, onClassificationUpdate }) {
  const { language } = useLanguage()
  const fileInputRef = useRef(null)
  const cameraInputRef = useRef(null)
  const webcamRef = useRef(null)
  
  const [selectedImage, setSelectedImage] = useState(null)
  const [selectedFile, setSelectedFile] = useState(null)
  const [isDragOver, setIsDragOver] = useState(false)
  const [isClassifying, setIsClassifying] = useState(false)
  const [classificationResult, setClassificationResult] = useState(initialClassificationData || null)
  const [error, setError] = useState(null)
  const [showOptions, setShowOptions] = useState(false)
  const [showWebcam, setShowWebcam] = useState(false)
  const initializedRef = useRef(false)

  // Initialize with initial data only once
  if (initialClassificationData && !initializedRef.current) {
    setClassificationResult(initialClassificationData)
    initializedRef.current = true
  }

  const handleImageSelect = useCallback((file, source = "file") => {
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
    if (onClassificationUpdate) {
      onClassificationUpdate(null)
    }

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
  }, [onClassificationUpdate, language])

  const handleFileInput = useCallback((event) => {
    const file = event.target.files[0]
    if (file) {
      handleImageSelect(file, "gallery")
    }
  }, [handleImageSelect])

  const handleCameraInput = useCallback((event) => {
    const file = event.target.files[0]
    if (file) {
      handleImageSelect(file, "camera")
    }
  }, [handleImageSelect])

  const handleDrop = useCallback((event) => {
    event.preventDefault()
    setIsDragOver(false)
    setShowOptions(false)
    const file = event.dataTransfer.files[0]
    if (file) {
      handleImageSelect(file, "drag")
    }
  }, [handleImageSelect])

  const handleDragOver = useCallback((event) => {
    event.preventDefault()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((event) => {
    event.preventDefault()
    setIsDragOver(false)
  }, [])

  // Camera & Options Logic (same as home page)
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

  const classifyWaste = useCallback(async () => {
    if (!selectedFile) return

    setIsClassifying(true)
    setError(null)

    try {
      console.log('🔍 Classifying waste with TensorFlow model:', selectedFile.name)
      
      const result = await classifyWasteImage(selectedFile, language)
      
      setClassificationResult(result)
      if (onClassificationUpdate) {
        onClassificationUpdate(result)
      }
      
      console.log('✅ Classification completed:', result)
      
    } catch (error) {
      console.error("❌ Classification error:", error)
      setError(`Classification failed: ${error.message}`)
      
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
      if (onClassificationUpdate) {
        onClassificationUpdate(fallbackResult)
      }
    } finally {
      setIsClassifying(false)
    }
  }, [selectedFile, onClassificationUpdate, language])

  const resetUpload = useCallback(() => {
    setSelectedImage(null)
    setSelectedFile(null)
    setClassificationResult(null)
    setError(null)
    setIsClassifying(false)
    setShowOptions(false)
    initializedRef.current = false
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
    if (cameraInputRef.current) {
      cameraInputRef.current.value = ''
    }
    if (onClassificationUpdate) {
      onClassificationUpdate(null)
    }
  }, [onClassificationUpdate])

  return (
    <section className="bg-gray-50 py-16 md:py-20">
      <div className="container mx-auto px-6 sm:px-8 md:px-12 lg:px-16">
        <div className="mx-auto max-w-2xl">
          
          {/* Webcam Modal (Same as Home Page) */}
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

          {/* FORM UPLOAD - MODIFIKASI DARI HOME PAGE */}
          {!classificationResult && (
            <div className="bg-white rounded-xl shadow-lg overflow-hidden my-10 md:my-16">
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

              {/* Upload Area - SAMA PERSIS SEPERTI HOME PAGE */}
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

                  {/* Upload Options Modal - SAMA PERSIS SEPERTI HOME PAGE */}
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

              {/* Classify Button */}
              {selectedImage && (
                <div className="p-6 bg-gray-50 border-t">
                  {isClassifying ? (
                    <div className="flex items-center justify-center space-x-2 py-2">
                      <Loader2 className="w-5 h-5 animate-spin text-green-600" />
                      <span className="text-green-700">
                        {language === "id" ? "Menganalisis dengan AI..." : "Analyzing with AI..."}
                      </span>
                    </div>
                  ) : (
                    <button
                      onClick={classifyWaste}
                      className="w-full bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors font-medium"
                    >
                      {language === "id" ? "Klasifikasi dengan AI" : "Classify with AI"}
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {/* HASIL KLASIFIKASI - PERTAHANKAN DESIGN YANG SUDAH ADA (TIDAK BERUBAH) */}
          {classificationResult && (
            <div className="space-y-6">
              {selectedImage && (
                <div className="relative rounded-lg overflow-hidden">
                  <img
                    src={selectedImage}
                    alt="Classified waste image"
                    className="w-full h-64 object-cover rounded-lg"
                  />
                </div>
              )}
              <ClassificationResultCard
                result={classificationResult}
                language={language}
                onClassifyAgain={resetUpload}
              />
            </div>
          )}
        </div>
      </div>
    </section>
  )
}