import { NextResponse } from 'next/server';

/**
 * API route to proxy requests to the ML service
 * This route handles authentication and forwards the request to the backend
 */
export async function POST(request) {
  try {
    console.log('🔍 Frontend API: Processing classification request');
    
    // Get request body
    const { imageData } = await request.json();
    
    if (!imageData) {
      return NextResponse.json(
        { success: false, error: 'Image data is required' },
        { status: 400 }
      );
    }
    
    // Get environment variables
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:3001';
    
    // Forward request to backend
    console.log(`🔗 Frontend API: Forwarding to backend at ${backendUrl}/api/classify`);
    
    // Convert base64 image data
    const base64Data = imageData.split(',')[1];
    
    // Make API call to backend
    const response = await fetch(`${backendUrl}/api/classify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ image: base64Data }),
    });
      // Handle response
    if (!response.ok) {
      let errorText;
      try {
        const errorData = await response.json();
        errorText = errorData.error || errorData.details || response.statusText;
      } catch {
        errorText = await response.text();
      }
      console.error('❌ Frontend API: Backend error:', response.status, errorText);
      
      return NextResponse.json(
        { 
          success: false, 
          error: `Backend error: ${response.status} ${errorText}`
        },
        { status: response.status }
      );
    }
    
    // Parse response from backend
    const backendResponse = await response.json();
    console.log('✅ Frontend API: Received backend response:', backendResponse);
    
    // Handle ML service response
    if (backendResponse.success) {
      // Get raw classification result
      const rawClassification = backendResponse.data;
      
      // Create enriched classification result for frontend UI
      // This combines the raw ML result with friendly descriptions for the UI
      return NextResponse.json({
        success: true,
        classification: {
          // Raw ML service data
          category: rawClassification.category,
          confidence: Math.round(rawClassification.confidence * 100), // Convert to percentage
        },
        timestamp: new Date().toISOString()
      });
    } else {
      return NextResponse.json(
        { 
          success: false, 
          error: backendResponse.error || 'Classification failed' 
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('❌ Frontend API: Classification error:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error',
        details: error.message
      },
      { status: 500 }
    );
  }
}
