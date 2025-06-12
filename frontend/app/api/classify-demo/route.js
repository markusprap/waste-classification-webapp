import { NextResponse } from 'next/server';

// Demo classification route WITHOUT authentication for home page - using real ML API
export async function POST(request) {
  try {
    console.log('🔍 Demo classify endpoint called for home page - using real ML API');
    
    const { imageData, location } = await request.json();

    if (!imageData) {
      return NextResponse.json(
        { error: 'Image data is required' },
        { status: 400 }
      );
    }

    // Convert base64 to FormData for ML service (sama seperti API classify asli)
    const base64Data = imageData.split(',')[1];
    const buffer = Buffer.from(base64Data, 'base64');
    
    // Create FormData for ML service API
    const formData = new FormData();
    const blob = new Blob([buffer], { type: 'image/jpeg' });
    formData.append('image', blob, 'image.jpg');

    // Call ML service (sama seperti API classify asli)
    const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:5000';
    let classificationResult;
    
    try {
      console.log('🔍 Demo classification - Calling ML service at:', `${ML_SERVICE_URL}/api/classify`);
      
      const mlResponse = await fetch(`${ML_SERVICE_URL}/api/classify`, {
        method: 'POST',
        body: formData,
      });

      if (!mlResponse.ok) {
        throw new Error(`ML service error: ${mlResponse.status} ${mlResponse.statusText}`);
      }

      const mlResult = await mlResponse.json();
      console.log('✅ Demo classification - ML service response:', mlResult);

      if (mlResult.success && mlResult.data) {
        // Import the waste management service
        const { getWasteManagementMethod } = await import('@/services/wasteManagementService');
        
        // Get main category
        const mainCategory = mlResult.data.main_category;
        
        // Get waste management method
        const wasteMethod = getWasteManagementMethod({
          mainCategory: mainCategory,
          type: mlResult.data.subcategory
        });
        
        // Transform ML service response to frontend format (sama seperti classify page)
        classificationResult = {
          type: mlResult.data.subcategory, // subkategori asli
          typeId: mlResult.data.subcategory, // bisa tambahkan terjemahan jika perlu
          category: mlResult.data.subcategory,
          categoryId: mlResult.data.subcategory,
          mainCategory: mlResult.data.main_category, // kategori utama
          confidence: Math.round(mlResult.data.confidence * 100),
          description: `This item is classified as ${mlResult.data.subcategory} (${mlResult.data.main_category})`,
          descriptionId: `Item ini diklasifikasikan sebagai ${mlResult.data.subcategory} (${mlResult.data.main_category})`,
          disposal: "Please dispose of this item appropriately based on its category",
          disposalId: "Silakan buang item ini dengan tepat berdasarkan kategorinya",
          recommendation: "Follow local waste management guidelines",
          recommendationId: "Ikuti panduan pengelolaan sampah setempat",
          method: wasteMethod,
        };
      } else {
        throw new Error('Invalid ML service response');
      }
      
    } catch (mlError) {
      console.error('Demo classification - ML service error:', mlError);
      
      // Import the waste management service for fallback
      const { getWasteManagementMethod } = await import('@/services/wasteManagementService');
      
      // Fallback classification if ML service fails (sama seperti API classify asli)
      classificationResult = {
        type: "Unknown Waste",
        typeId: "Sampah Tidak Dikenal",
        category: "General Waste",
        categoryId: "Sampah Umum",
        mainCategory: "Mixed/Other",
        confidence: 50,
        description: "Unable to classify this waste accurately - ML service unavailable",
        descriptionId: "Tidak dapat mengklasifikasi sampah ini dengan akurat - layanan ML tidak tersedia",
        disposal: "Place in general waste bin",
        disposalId: "Masukkan ke tempat sampah umum",
        recommendation: "Consider manual sorting or ask waste management professionals",
        recommendationId: "Pertimbangkan pemisahan manual atau tanya profesional pengelolaan sampah",
        method: getWasteManagementMethod({ mainCategory: "Mixed/Other" }),
      };
      console.log('⚠️ Demo classification - Using fallback classification due to ML service error');
    }    // Return response tanpa save ke database (ini yang membedakan dengan API classify asli)
    return NextResponse.json({
      success: true,
      classification: {
        ...classificationResult,
        timestamp: new Date().toISOString()
      },
      demo: true,
      message: 'This is a demo classification without authentication and database saving'
    });

  } catch (error) {
    console.error('Demo classification error:', error);
    
    // Handle specific TensorFlow/model errors (sama seperti API classify asli)
    if (error.message.includes('model') || error.message.includes('tensor')) {
      return NextResponse.json(
        { error: 'AI model error. Please try again or contact support.' },
        { status: 503 }
      );
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
