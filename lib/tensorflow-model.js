import * as tf from "@tensorflow/tfjs"

// Class labels untuk 12 kategori sampah (sesuai urutan output model)
const CLASS_LABELS = [
  "battery", // 0: Baterai
  "biological", // 1: Biologis
  "brown-glass", // 2: Kaca Coklat
  "cardboard", // 3: Kardus
  "clothes", // 4: Pakaian
  "green-glass", // 5: Kaca Hijau
  "metal", // 6: Logam
  "paper", // 7: Kertas
  "plastic", // 8: Plastik
  "shoes", // 9: Sepatu
  "trash", // 10: Residu
  "white-glass", // 11: Kaca Putih
]

// Mapping class names (Indonesian)
const IMAGE_CLASSES = {
  0: "Baterai",
  1: "Biologis",
  2: "Kaca Coklat",
  3: "Kardus",
  4: "Pakaian",
  5: "Kaca Hijau",
  6: "Logam",
  7: "Kertas",
  8: "Plastik",
  9: "Sepatu",
  10: "Residu",
  11: "Kaca Putih",
}

// English class names
const IMAGE_CLASSES_EN = {
  0: "Battery",
  1: "Biological",
  2: "Brown Glass",
  3: "Cardboard",
  4: "Clothes",
  5: "Green Glass",
  6: "Metal",
  7: "Paper",
  8: "Plastic",
  9: "Shoes",
  10: "Trash",
  11: "White Glass",
}

// Data klasifikasi lengkap
const CLASSIFICATION_DATA = {
  battery: {
    type: "Battery",
    typeId: "Baterai",
    category: "Hazardous Waste",
    categoryId: "Limbah Berbahaya",
    description: "Electronic battery that requires special disposal",
    descriptionId: "Baterai elektronik yang memerlukan pembuangan khusus",
    disposal: "Take to designated battery collection point",
    disposalId: "Bawa ke titik pengumpulan baterai yang ditentukan",
    recommendation: "Never throw batteries in regular trash. Take to electronics store or hazardous waste facility.",
    recommendationId: "Jangan pernah membuang baterai ke tempat sampah biasa. Bawa ke toko elektronik atau fasilitas limbah berbahaya.",
    method: "recycle",
  },
  biological: {
    type: "Organic Waste",
    typeId: "Sampah Organik",
    category: "Compostable",
    categoryId: "Dapat Dikompos",
    description: "Biodegradable organic matter",
    descriptionId: "Bahan organik yang dapat terurai",
    disposal: "Place in green organic waste bin",
    disposalId: "Masukkan ke tempat sampah organik hijau",
    recommendation: "Compost this organic waste or use for biogas production. Great for soil enrichment.",
    recommendationId: "Kompos sampah organik ini atau gunakan untuk produksi biogas. Bagus untuk pengayaan tanah.",
    method: "compost",
  },
  "brown-glass": {
    type: "Brown Glass",
    typeId: "Kaca Coklat",
    category: "Recyclable Glass",
    categoryId: "Kaca Daur Ulang",
    description: "Brown colored glass container",
    descriptionId: "Wadah kaca berwarna coklat",
    disposal: "Place in brown glass recycling bin",
    disposalId: "Masukkan ke tempat sampah kaca coklat",
    recommendation: "Clean the glass and remove caps. Brown glass can be recycled indefinitely.",
    recommendationId: "Bersihkan kaca dan lepas tutupnya. Kaca coklat dapat didaur ulang tanpa batas.",
    method: "recycle",
  },
  cardboard: {
    type: "Cardboard",
    typeId: "Kardus",
    category: "Recyclable Paper",
    categoryId: "Kertas Daur Ulang",
    description: "Corrugated cardboard material",
    descriptionId: "Bahan kardus bergelombang",
    disposal: "Flatten and place in paper recycling bin",
    disposalId: "Ratakan dan masukkan ke tempat sampah daur ulang kertas",
    recommendation: "Remove tape and flatten cardboard. One of the most recyclable materials.",
    recommendationId: "Lepas selotip dan ratakan kardus. Salah satu bahan yang paling mudah didaur ulang.",
    method: "recycle",
  },
  clothes: {
    type: "Clothing",
    typeId: "Pakaian",
    category: "Textile Waste",
    categoryId: "Limbah Tekstil",
    description: "Fabric and textile materials",
    descriptionId: "Bahan kain dan tekstil",
    disposal: "Donate or take to textile recycling center",
    disposalId: "Donasikan atau bawa ke pusat daur ulang tekstil",
    recommendation: "Donate if in good condition, or take to textile recycling facility.",
    recommendationId: "Donasikan jika masih bagus, atau bawa ke fasilitas daur ulang tekstil.",
    method: "reuse",
  },
  "green-glass": {
    type: "Green Glass",
    typeId: "Kaca Hijau",
    category: "Recyclable Glass",
    categoryId: "Kaca Daur Ulang",
    description: "Green colored glass container",
    descriptionId: "Wadah kaca berwarna hijau",
    disposal: "Place in green glass recycling bin",
    disposalId: "Masukkan ke tempat sampah kaca hijau",
    recommendation: "Clean the glass and remove caps. Green glass maintains quality through recycling.",
    recommendationId: "Bersihkan kaca dan lepas tutupnya. Kaca hijau mempertahankan kualitas melalui daur ulang.",
    method: "recycle",
  },
  metal: {
    type: "Metal",
    typeId: "Logam",
    category: "Recyclable Metal",
    categoryId: "Logam Daur Ulang",
    description: "Metal cans and containers",
    descriptionId: "Kaleng dan wadah logam",
    disposal: "Place in metal recycling bin",
    disposalId: "Masukkan ke tempat sampah daur ulang logam",
    recommendation: "Rinse containers and remove labels. Metal has high recycling value.",
    recommendationId: "Bilas wadah dan lepas label. Logam memiliki nilai daur ulang tinggi.",
    method: "recycle",
  },
  paper: {
    type: "Paper",
    typeId: "Kertas",
    category: "Recyclable Paper",
    categoryId: "Kertas Daur Ulang",
    description: "Clean paper materials",
    descriptionId: "Bahan kertas bersih",
    disposal: "Place in paper recycling bin",
    disposalId: "Masukkan ke tempat sampah daur ulang kertas",
    recommendation: "Keep paper clean and dry. Remove any plastic coating before recycling.",
    recommendationId: "Jaga kertas tetap bersih dan kering. Lepas lapisan plastik sebelum didaur ulang.",
    method: "recycle",
  },
  plastic: {
    type: "Plastic",
    typeId: "Plastik",
    category: "Recyclable Plastic",
    categoryId: "Plastik Daur Ulang",
    description: "Plastic containers and bottles",
    descriptionId: "Wadah dan botol plastik",
    disposal: "Place in plastic recycling bin",
    disposalId: "Masukkan ke tempat sampah daur ulang plastik",
    recommendation: "Clean containers and check recycling number. Remove caps and labels.",
    recommendationId: "Bersihkan wadah dan periksa nomor daur ulang. Lepas tutup dan label.",
    method: "recycle",
  },
  shoes: {
    type: "Shoes",
    typeId: "Sepatu",
    category: "Textile/Leather Waste",
    categoryId: "Limbah Tekstil/Kulit",
    description: "Footwear and shoe materials",
    descriptionId: "Alas kaki dan bahan sepatu",
    disposal: "Donate or take to shoe recycling program",
    disposalId: "Donasikan atau bawa ke program daur ulang sepatu",
    recommendation: "Donate if wearable, or find specialized shoe recycling programs.",
    recommendationId: "Donasikan jika masih bisa dipakai, atau cari program daur ulang sepatu khusus.",
    method: "reuse",
  },
  trash: {
    type: "General Waste",
    typeId: "Sampah Umum",
    category: "Non-Recyclable",
    categoryId: "Tidak Dapat Didaur Ulang",
    description: "Mixed waste that cannot be recycled",
    descriptionId: "Sampah campuran yang tidak dapat didaur ulang",
    disposal: "Place in general waste bin",
    disposalId: "Masukkan ke tempat sampah umum",
    recommendation: "Try to minimize general waste. Consider if any parts can be separated for recycling.",
    recommendationId: "Coba kurangi sampah umum. Pertimbangkan apakah ada bagian yang bisa dipisah untuk didaur ulang.",
    method: "reduce",
  },
  "white-glass": {
    type: "Clear Glass",
    typeId: "Kaca Bening",
    category: "Recyclable Glass",
    categoryId: "Kaca Daur Ulang",
    description: "Clear/white glass container",
    descriptionId: "Wadah kaca bening/putih",
    disposal: "Place in clear glass recycling bin",
    disposalId: "Masukkan ke tempat sampah kaca bening",
    recommendation: "Clean thoroughly and remove all caps. Clear glass has the highest recycling value.",
    recommendationId: "Bersihkan dengan teliti dan lepas semua tutup. Kaca bening memiliki nilai daur ulang tertinggi.",
    method: "recycle",
  },
}

// Load model function (EXACTLY like your reference)
async function loadModel() {
  const model = tf.loadGraphModel('/model/waste-classifier/model.json')

  // Cek model
  try {
    await model
  } catch (error) {
    throw new Error('Model tidak ditemukan')
  }

  return model
}

// Image classes function (EXACTLY like your reference)
function imageClasses() {
  const classes = {
    0: 'Baterai', // 'Battery',
    1: 'Biologis', // 'Biological',
    2: 'Kaca Coklat', // 'Brown Glass',
    3: 'Kardus', // 'Cardboard',
    4: 'Pakaian', // 'Clothes',
    5: 'Kaca Hijau', // 'Green Glass',
    6: 'Logam', // 'Metal',
    7: 'Kertas', // 'Paper',
    8: 'Plastik', // 'Plastic',
    9: 'Sepatu', // 'Shoes',
    10: 'Residu', // 'Trash',
    11: 'Kaca Putih', // 'White Glass',
  }

  return classes
}

// Classification function (EXACTLY like your reference)
async function classifyModel(image, setResults, setIsLoading) {
  setIsLoading(true)
  const model = await loadModel()
  const IMAGE_CLASSES = imageClasses()

  const tensorImg = tf.browser
    .fromPixels(image)
    .resizeNearestNeighbor([224, 224])
    .toFloat()
    .expandDims()

  const prediction = await model.predict(tensorImg).data()
  const results = Array.from(prediction)
    .map(function (probability, index) {
      return {
        probability: probability,
        className: IMAGE_CLASSES[index],
        classKey: CLASS_LABELS[index], // Add class key for mapping
        confidence: Math.round(probability * 100), // Add confidence percentage
      }
    })
    .sort(function (a, b) {
      return b.probability - a.probability
    })
    .slice(0, 3)

  setResults(results)
  setIsLoading(false)

  // Clean up tensor
  tensorImg.dispose()

  return results
}

// Enhanced classification function that returns complete data
export async function classifyWasteImage(imageFile, language = 'en') {
  console.log('🚀 Starting waste classification...')
  
  try {
    // Create image element from file
    const imageElement = await createImageFromFile(imageFile)
    
    // Create state management
    let results = []
    let isLoading = false
    
    const setResults = (newResults) => { results = newResults }
    const setIsLoading = (loading) => { isLoading = loading }
    
    // Call the EXACT same function as your reference
    await classifyModel(imageElement, setResults, setIsLoading)
    
    if (results.length === 0) {
      throw new Error('No classification results')
    }
    
    // Get top result
    const topResult = results[0]
    const classificationInfo = CLASSIFICATION_DATA[topResult.classKey]
    
    if (!classificationInfo) {
      throw new Error('Unknown classification result')
    }
    
    // Return complete result
    const finalResult = {
      ...classificationInfo,
      confidence: topResult.confidence,
      predictedClass: topResult.classKey,
      displayName: topResult.className,
      allResults: results, // Include top 3 for debugging
    }
    
    console.log('✅ Classification successful:', finalResult.type)
    return finalResult
    
  } catch (error) {
    console.error('❌ Classification failed:', error)
    throw error
  }
}

// Helper function to create image element from file
function createImageFromFile(imageFile) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    
    img.onload = () => {
      console.log('✅ Image loaded:', img.width, 'x', img.height)
      resolve(img)
    }
    
    img.onerror = (error) => {
      console.error('❌ Image load error:', error)
      reject(new Error('Failed to load image'))
    }
    
    // Create object URL from file
    const reader = new FileReader()
    reader.onload = (e) => {
      img.src = e.target.result
    }
    reader.onerror = () => {
      reject(new Error('Failed to read file'))
    }
    reader.readAsDataURL(imageFile)
  })
}

// Export default function exactly like your reference
export default classifyModel

// Additional exports for convenience
export { loadModel, imageClasses, CLASSIFICATION_DATA, CLASS_LABELS }