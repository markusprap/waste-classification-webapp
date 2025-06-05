"use client"

import { useState, useCallback, useRef, useEffect } from "react"
import { Upload, Camera, X, Loader2, CameraIcon, Image, Lock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useLanguage } from "@/context/language-context"
import { useAuth } from "@/context/auth-context"
import { ClassificationResultCard } from "./classification-result-card"
import { classifyWasteImage } from "@/lib/tensorflow-model"
import dynamic from "next/dynamic"

// Dynamically import Webcam to avoid SSR issues
const Webcam = dynamic(() => import("react-webcam"), { ssr: false })

export function ClassifyUploadSection({ initialClassificationData, onClassificationUpdate }) {
  const { t, language } = useLanguage()
  const { user, isAuthenticated, classify } = useAuth()
  const fileInputRef = useRef(null)
  const cameraInputRef = useRef(null)
  const webcamRef = useRef(null)
  
  const [selectedImage, setSelectedImage] = useState(null)
  const [selectedFile, setSelectedFile] = useState(null)
  const [isDragOver, setIsDragOver] = useState(false)
  const [isClassifying, setIsClassifying] = useState(false)
  const [classificationResult, setClassificationResult] = useState(null)
  const [error, setError] = useState(null)
  const [showOptions, setShowOptions] = useState(false)
  const [showWebcam, setShowWebcam] = useState(false)

  // Initialize with data from home page when it's available
  useEffect(() => {
    console.log('🏠 ClassifyUploadSection - Initializing with auth state:', { isAuthenticated, user });
    
    if (initialClassificationData) {
      console.log('🏠 ClassifyUploadSection - Initializing with home page data:', initialClassificationData);
      
      // Set the classification result
      setClassificationResult(initialClassificationData);
      
      // Set the image if available
      if (initialClassificationData.image) {
        setSelectedImage(initialClassificationData.image);
        
        // Create a file object from the image data (for display purposes)
        if (initialClassificationData.imageFileName) {
          // Create a dummy file for UI consistency
          const fileName = initialClassificationData.imageFileName;
          const fileSize = initialClassificationData.imageFileSize || 0;
          
          // We don't need the actual file for display, just metadata
          setSelectedFile({
            name: fileName,
            size: fileSize,
            type: 'image/jpeg'
          })
        }
      }
    }
  }, [initialClassificationData])

  const handleImageSelect = useCallback((file, source = "file") => {
    if (!file || !file.type.startsWith('image/')) {
      setError(language === "id" ? "Silakan pilih file gambar" : "Please select an image file");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError(language === "id" ? "Ukuran file maksimal 10MB" : "Maximum file size is 10MB");
      return;
    }

    setSelectedFile(file);
    setError(null);
    setClassificationResult(null);
    setShowOptions(false);
    if (onClassificationUpdate) {
      onClassificationUpdate(null);
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      console.log('📸 Image loaded successfully');
      setSelectedImage(e.target.result);
    };
    reader.onerror = (e) => {
      console.error('❌ Error reading file:', e);
      setError(language === "id" ? "Gagal membaca gambar" : "Failed to read image");
    };
    reader.readAsDataURL(file);

    console.log(`📁 Image selected from ${source}:`, {
      name: file.name,
      size: file.size,
      type: file.type
    });
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
    if (!selectedFile) {
      console.log('❌ ClassifyWaste - No file selected');
      return;
    }

    console.log('🔍 ClassifyWaste - Starting classification with auth state:', { isAuthenticated, user });
    
    setIsClassifying(true);
    setError(null);

    try {
      console.log('🔍 ClassifyWaste - Processing file:', selectedFile.name);
      
      // Convert file to base64 for API
      const reader = new FileReader();
      reader.onload = async (e) => {
        const imageData = e.target.result;
        
        // Check authentication again before calling API
        if (!isAuthenticated) {
          console.log('❌ ClassifyWaste - User not authenticated');
          setError(language === "id" 
            ? "Anda perlu login untuk mengklasifikasi sampah" 
            : "You need to login to classify waste");
          setIsClassifying(false);
          return;
        }
        
        // Use auth context's classify method which handles API call and usage tracking
        console.log('🔍 ClassifyWaste - Calling classify method from auth context');
        const result = await classify(imageData, null); // We'll add location later if needed
        
        if (result.success) {
          console.log('✅ ClassifyWaste - Classification successful:', result.data);
          setClassificationResult(result.data.classification);
          if (onClassificationUpdate) {
            onClassificationUpdate(result.data.classification);
          }
        } else {
          console.error('❌ ClassifyWaste - Classification failed:', result.error, result.statusCode);
          
          if (result.statusCode === 429) {
            const errorMessage = language === "id" 
              ? "Batas klasifikasi harian tercapai. Upgrade plan Anda untuk lebih banyak klasifikasi."
              : "Daily classification limit reached. Please upgrade your plan for more classifications.";
            setError(errorMessage);
          } else if (result.error === 'Authentication required') {
            const errorMessage = language === "id"
              ? "Anda perlu login untuk mengklasifikasi sampah"
              : "You need to login to classify waste";
            setError(errorMessage);
          } else {
            setError(result.error || 'Classification failed');
          }
          
          // Fallback result in case of error
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
        }
      }
      reader.readAsDataURL(selectedFile)
      
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
  }, [selectedFile, onClassificationUpdate, language, classify])

  const resetUpload = useCallback(() => {
    setSelectedImage(null)
    setSelectedFile(null)
    setClassificationResult(null)
    setError(null)
    setIsClassifying(false)
    setShowOptions(false)
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

          {/* FORM UPLOAD - SAMA PERSIS SEPERTI HOME PAGE */}
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
                                {t("classify.options.title")}
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
                                  {t("classify.camera.title")}
                                </p>
                                <p className="text-sm text-gray-600">
                                  {t("classify.camera.description")}
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
                                  {t("classify.gallery.title")}
                                </p>
                                <p className="text-sm text-gray-600">
                                  {t("classify.gallery.description")}
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
                <div className="mx-6 mb-4 bg-red-50 border border-red-200 rounded-xl p-4">
                  <p className="text-red-800 text-sm font-medium">{error}</p>
                </div>
              )}

              {/* Classify Button - SAME AS HOME PAGE */}
              {selectedImage && (
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
                      onClick={classifyWaste}
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
                        : isClassifying
                          ? (language === "id" ? "Menganalisis..." : "Analyzing...")
                          : (language === "id" ? "Klasifikasi dengan AI" : "Classify with AI")
                      }
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