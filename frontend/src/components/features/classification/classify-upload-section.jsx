"use client"

import { useState, useCallback, useRef, useEffect } from "react"
import { Upload, Camera, X, Loader2, CameraIcon, Image, RefreshCcw, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useLanguage } from "@/models/language-context"
import { useAuth } from '@/models/auth-context';
import { ClassificationResultCard } from "./classification-result-card"
import { LimitReachedModal } from "./limit-reached-modal"
import { LoadingOverlay } from "@/components/ui/loading-overlay"
import dynamic from "next/dynamic"
import { useLoadingState } from "@/hooks/use-loading-state"

const Webcam = dynamic(() => import("react-webcam"), { ssr: false })

export function ClassifyUploadSection({ initialClassificationData, onClassificationUpdate }) {
  const { t, language } = useLanguage()
  const fileInputRef = useRef(null)
  const cameraInputRef = useRef(null)
  const webcamRef = useRef(null)
  const { withLoading, isLoading } = useLoadingState()
  const { refreshUserSession, refreshUser } = useAuth();

  const [selectedImage, setSelectedImage] = useState(null)
  const [selectedFile, setSelectedFile] = useState(null)
  const [isDragOver, setIsDragOver] = useState(false)
  const [classificationResult, setClassificationResult] = useState(null)
  const [error, setError] = useState(null)
  const [showOptions, setShowOptions] = useState(false)
  const [showWebcam, setShowWebcam] = useState(false)
  const [showLimitModal, setShowLimitModal] = useState(false)
  const [limitInfo, setLimitInfo] = useState(null)
  useEffect(() => {
    if (initialClassificationData) {
      setClassificationResult(initialClassificationData);
      if (initialClassificationData.image) {
        setSelectedImage(initialClassificationData.image);
        if (initialClassificationData.imageFileName) {
          const fileName = initialClassificationData.imageFileName;
          const fileSize = initialClassificationData.imageFileSize || 0;
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
      setSelectedImage(e.target.result);
    };
    reader.onerror = (e) => {
      setError(language === "id" ? "Gagal membaca gambar" : "Failed to read image");
    };
    reader.readAsDataURL(file);
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
      return;
    }

    setError(null);

    try {
      await withLoading(async () => {
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = async (e) => {
            try {
              const imageData = e.target.result;
              const apiEndpoint = '/api/classify';
              const response = await fetch(apiEndpoint, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  imageData,
                  location: null
                }),
              });

              const data = await response.json();

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
                setClassificationResult(data.classification);
                if (onClassificationUpdate) {
                  onClassificationUpdate(data.classification);
                }
                try {
                  if (refreshUserSession) {
                    await refreshUserSession();
                  }
                  if (refreshUser) {
                    const updatedUser = await refreshUser();
                  }
                } catch (refreshError) {
                }
                resolve();
              } else {
                setError(data.error || 'Classification failed');
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
                };
                setClassificationResult(fallbackResult);
                if (onClassificationUpdate) {
                  onClassificationUpdate(fallbackResult);
                }
                resolve();
              }
            } catch (error) {
              reject(error);
            }
          };

          reader.onerror = (error) => {
            reject(error);
          };

          reader.readAsDataURL(selectedFile);
        });
      });
    } catch (error) {
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
    }
  }, [selectedFile, onClassificationUpdate, language, withLoading, refreshUserSession, refreshUser])

  const resetUpload = useCallback(() => {
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
    } if (onClassificationUpdate) {
      onClassificationUpdate(null)
    }
  }, [onClassificationUpdate])
  return (
    <>
      <section className="bg-[#fafafa] py-16 md:py-24">
        <div className="container mx-auto px-6 sm:px-8 md:px-12 lg:px-16">
          <div className="mx-auto max-w-2xl">

            {showWebcam && (
              <div className="fixed inset-0 bg-black/90 backdrop-blur-xl z-[100] flex flex-col items-center justify-center p-4">
                <div className="bg-white rounded-[2.5rem] p-6 w-full max-w-lg shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-emerald-500 to-teal-500"></div>
                  <Webcam
                    audio={false}
                    ref={webcamRef}
                    screenshotFormat="image/jpeg"
                    videoConstraints={{
                      facingMode: "environment"
                    }}
                    className="rounded-[1.5rem] w-full aspect-video object-cover mb-6 shadow-md border-4 border-gray-50"
                  />
                  <div className="flex gap-4">
                    <button
                      onClick={captureFromWebcam}
                      className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white h-14 rounded-2xl font-bold transition-all duration-300 transform hover:scale-[1.02] shadow-lg flex items-center justify-center gap-2"
                    >
                      <CameraIcon className="w-5 h-5" />
                      {language === "id" ? "Ambil Foto" : "Capture"}
                    </button>
                    <button
                      onClick={cancelWebcam}
                      className="px-8 bg-gray-100 text-gray-700 h-14 rounded-2xl font-bold hover:bg-gray-200 transition-all duration-300"
                    >
                      {language === "id" ? "Batal" : "Cancel"}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {!classificationResult && (
              <div className="bg-white rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 overflow-hidden my-10 animate-fade-in relative">

                {/* Header Decoration */}
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500"></div>

                {selectedImage && (
                  <div className="p-8 border-b border-gray-50">
                    <div className="relative group">
                      <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors rounded-3xl z-10"></div>
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
                  <div className="relative group/upload p-8">
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
                        cursor-pointer overflow-hidden relative
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
                        <div className="mb-8 p-6 bg-white rounded-3xl shadow-xl shadow-emerald-500/10 group-hover/upload:scale-110 group-hover/upload:rotate-3 transition-transform duration-500">
                          <div className="flex gap-4">
                            <Upload className="w-8 h-8 text-emerald-500" />
                            <Camera className="w-8 h-8 text-teal-500" />
                          </div>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold text-gray-900 mb-3">
                            {language === "id" ? "Klasifikasi Sekarang" : "Classify Now"}
                          </p>
                          <p className="text-gray-500 font-medium max-w-[280px] leading-relaxed">
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
                      <div className="absolute inset-0 z-50 flex items-center justify-center p-8">
                        <div className="absolute inset-0 bg-white/60 backdrop-blur-md animate-fade-in" onClick={() => setShowOptions(false)}></div>
                        <div className="relative w-full max-w-sm bg-white rounded-[2rem] shadow-2xl overflow-hidden border border-gray-100 animate-slide-up">
                          <div className="p-6 border-b border-gray-50 flex justify-between items-center">
                            <h3 className="font-bold text-gray-900">
                              {language === "id" ? "Pilih Sumber Gambar" : "Choose Source"}
                            </h3>
                            <button onClick={() => setShowOptions(false)} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
                              <X className="w-5 h-5 text-gray-400" />
                            </button>
                          </div>
                          <div className="p-6 space-y-4">
                            <button
                              onClick={openCamera}
                              className="group w-full flex items-center gap-5 p-5 rounded-3xl bg-emerald-50 hover:bg-emerald-100 transition-all border border-emerald-100/50 hover:border-emerald-200 text-left"
                            >
                              <div className="w-16 h-16 bg-emerald-500 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:scale-110 transition-transform duration-500 shrink-0">
                                <CameraIcon className="w-8 h-8 text-white" />
                              </div>
                              <div className="flex-1">
                                <h4 className="font-black text-emerald-900 text-lg mb-1 leading-none">
                                  {language === "id" ? "Ambil Foto" : "Take Photo"}
                                </h4>
                                <p className="text-emerald-700/60 text-xs font-bold leading-tight">
                                  {language === "id" ? "Gunakan kamera untuk foto langsung" : "Use camera for instant capture"}
                                </p>
                              </div>
                              <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity">
                                <span className="text-xl font-black">→</span>
                              </div>
                            </button>

                            <button
                              onClick={openGallery}
                              className="group w-full flex items-center gap-5 p-5 rounded-3xl bg-teal-50 hover:bg-teal-100 transition-all border border-teal-100/50 hover:border-teal-200 text-left"
                            >
                              <div className="w-16 h-16 bg-teal-500 rounded-2xl flex items-center justify-center shadow-lg shadow-teal-500/20 group-hover:scale-110 transition-transform duration-500 shrink-0">
                                <Image className="w-8 h-8 text-white" />
                              </div>
                              <div className="flex-1">
                                <h4 className="font-black text-teal-900 text-lg mb-1 leading-none">
                                  {language === "id" ? "Pilih dari Galeri" : "Choose Gallery"}
                                </h4>
                                <p className="text-teal-700/60 text-xs font-bold leading-tight">
                                  {language === "id" ? "Pilih foto dari penyimpanan" : "Select image from your device"}
                                </p>
                              </div>
                              <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-teal-500 opacity-0 group-hover:opacity-100 transition-opacity">
                                <span className="text-xl font-black">→</span>
                              </div>
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {error && (
                  <div className="px-8 pb-8">
                    <div className="bg-red-50 border border-red-100 rounded-2xl p-4 flex items-center gap-3">
                      <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                      <p className="text-red-700 text-sm font-bold">{error}</p>
                    </div>
                  </div>
                )}

                {selectedImage && (
                  <div className="p-8 pt-0">
                    <button
                      onClick={classifyWaste}
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
            )}

            {classificationResult && (
              <div className="space-y-8 my-10 animate-fade-in">
                {selectedImage && (
                  <div className="relative rounded-[2.5rem] overflow-hidden shadow-2xl group border-[6px] border-white">
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent z-10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <img
                      src={selectedImage}
                      alt="Classified waste"
                      className="w-full h-80 object-cover transform transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute top-6 right-6 z-20">
                      <button
                        onClick={resetUpload}
                        className="bg-white/90 backdrop-blur-md text-gray-900 rounded-2xl p-4 shadow-xl hover:bg-emerald-500 hover:text-white transition-all flex items-center gap-2 font-bold text-sm"
                      >
                        <RefreshCcw className="w-4 h-4" />
                        New Analysis
                      </button>
                    </div>
                  </div>
                )}
                <div className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
                  <ClassificationResultCard
                    result={classificationResult}
                    language={language}
                    onClassifyAgain={resetUpload}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
      <LimitReachedModal
        isOpen={showLimitModal}
        onClose={() => setShowLimitModal(false)}
        limitInfo={limitInfo}
      />
    </>
  )
}
