import { NextResponse } from 'next/server';

/**
 * API route handler for GET /api/payment/server-status
 * Checks if the server key is properly configured
 */
export async function GET() {
  try {
    // Check if server key is set in environment variables
    const serverKey = process.env.MIDTRANS_SERVER_KEY;
    
    if (!serverKey) {
      return NextResponse.json(
        { status: 'error', message: 'Server key is not configured' },
        { status: 500 }
      );
    }
    
    // Check connection to backend server
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:3001';
    
    try {
      const response = await fetch(`${backendUrl}/api/payment/server-status`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        return NextResponse.json({
          status: 'success',
          message: 'Payment server is configured correctly',
          environment: data.environment || 'unknown',
          serverKeyConfigured: data.serverKeyConfigured,
          clientKeyConfigured: data.clientKeyConfigured
        });
      } else {
        return NextResponse.json(
          { status: 'error', message: 'Backend server is not responding' },
          { status: 503 }
        );
      }
    } catch (error) {
      return NextResponse.json(
        { status: 'error', message: 'Cannot connect to backend server' },
        { status: 503 }
      );
    }
  } catch (error) {
    console.error('Error checking server status:', error);
    return NextResponse.json(
      { status: 'error', message: 'Internal server error' },
      { status: 500 }
    );
  }
}
