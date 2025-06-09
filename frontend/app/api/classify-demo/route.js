import { NextResponse } from 'next/server';
import { classifyWasteImage } from '@/lib/tensorflow-model';

// Demo classification route WITHOUT authentication for pure login development
export async function POST(request) {
  try {
    console.log('Demo classification route - Processing request without auth');
    
    const { imageData, location } = await request.json();

    if (!imageData) {
      return NextResponse.json(
        { error: 'Image data is required' },
        { status: 400 }
      );
    }

    // Convert base64 to file-like object for classification
    const base64Data = imageData.split(',')[1];
    const buffer = Buffer.from(base64Data, 'base64');
    
    // Create a mock file object for the TensorFlow model
    const mockFile = {
      buffer,
      type: 'image/jpeg',
      size: buffer.length,
      arrayBuffer: () => Promise.resolve(buffer),
      stream: () => new ReadableStream({
        start(controller) {
          controller.enqueue(buffer);
          controller.close();
        }
      })
    };

    // Perform classification using existing TensorFlow model
    let classificationResult;
    try {
      console.log('Demo classification - Using TensorFlow model');
      classificationResult = await classifyWasteImage(mockFile, 'en');
      console.log('Demo classification - Model result:', classificationResult);
    } catch (modelError) {
      console.error('Demo classification - Model error:', modelError);
      
      // Fallback result if model fails
      classificationResult = {
        type: "Unknown Waste",
        typeId: "Sampah Tidak Dikenal", 
        category: "General Waste",
        categoryId: "Sampah Umum",
        confidence: 50,
        description: "Unable to classify this waste accurately due to model error",
        descriptionId: "Tidak dapat mengklasifikasi sampah ini dengan akurat karena error model",
        disposal: "Place in general waste bin",
        disposalId: "Masukkan ke tempat sampah umum",
        recommendation: "Consider manual sorting or ask waste management professionals",
        recommendationId: "Pertimbangkan pemisahan manual atau tanya profesional pengelolaan sampah",
        method: "reduce",
      };
      console.log('Demo classification - Using fallback classification due to model error');
    }

    return NextResponse.json({
      success: true,
      classification: {
        ...classificationResult,
        timestamp: new Date().toISOString()
      },
      demo: true,
      message: 'This is a demo classification without authentication'
    });

  } catch (error) {
    console.error('Demo classification error:', error);
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
