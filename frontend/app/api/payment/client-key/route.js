import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";

/**
 * Route handler for GET /api/payment/client-key
 * Returns the Midtrans client key for frontend initialization
 */
export async function GET() {
  try {
    // Get authenticated session
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    // Get backend URL from environment or default
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:3001';
    console.log(`Attempting to fetch client key from ${backendUrl}/api/payment/client-key`);
    
    try {
      // Fetch client key from backend
      const response = await fetch(`${backendUrl}/api/payment/client-key`);
      
      if (!response.ok) {
        console.error(`Backend API error when fetching client key: ${response.status}`);
        throw new Error(`Backend API error: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Successfully fetched client key from backend');
      
      // Return client key from backend
      return NextResponse.json({
        success: true,
        clientKey: data.clientKey || process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY,
        merchantId: process.env.NEXT_PUBLIC_MIDTRANS_MERCHANT_ID
      });
    } catch (backendError) {
      console.warn('Failed to fetch client key from backend, using local env variable:', backendError);
      
      // Fallback to environment variable
      const clientKey = process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY;
      if (!clientKey) {
        console.error('No client key available in environment variables');
        throw new Error('Payment system is not properly configured');
      }
      
      return NextResponse.json({
        success: true,
        clientKey: clientKey,
        merchantId: process.env.NEXT_PUBLIC_MIDTRANS_MERCHANT_ID,
        source: 'local_env'
      });
    }  } catch (error) {
    console.error('Error fetching Midtrans client key:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch Midtrans client key' },
      { status: 500 }
    );
  }
}
