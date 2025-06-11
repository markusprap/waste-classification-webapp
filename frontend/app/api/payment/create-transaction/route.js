import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/services/auth-config';
import { generateOrderId } from '@/services/midtransService';

// Create Midtrans transaction via backend API
export async function POST(request) {
  try {
    // Get and validate session
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Authentication required' 
        },
        { status: 401 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const { plan, email, name } = body;

    if (!plan || !email || !name) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Missing required fields' 
        },
        { status: 400 }
      );
    }    // Validate that email matches session user
    if (email !== session.user.email) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid user email' 
        },
        { status: 403 }
      );
    }

    // Generate order ID and create transaction
    const orderId = generateOrderId();
    const amount = 99000; // 99,000 IDR for premium plan

    // Make call to backend API - let backend handle user verification
    try {
      const backendUrl = process.env.BACKEND_URL || 'http://localhost:3001'; // Reverted back to original port
      const backendResponse = await fetch(`${backendUrl}/api/payment/create-transaction`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
          fullName: name,
          plan: plan,
          amount: amount
        })
      });

      if (!backendResponse.ok) {
        let errorMessage = 'Backend API error';
        try {
          const errorData = await backendResponse.json();
          console.error(`Backend API error ${backendResponse.status}:`, errorData);
          
          if (errorData.message && errorData.message.includes('User verification failed')) {
            // Special handling for user verification errors
            return NextResponse.json(
              {
                success: false,
                error: 'User verification failed. Please log out and log in again.'
              },
              { status: 401 }
            );
          }
          
          errorMessage = errorData.message || `Backend API error (${backendResponse.status})`;
        } catch (e) {
          const errorText = await backendResponse.text();
          console.error(`Backend API error ${backendResponse.status}:`, errorText);
          errorMessage = `Backend API error (${backendResponse.status})`;
        }
        
        throw new Error(errorMessage);
      }      const backendResult = await backendResponse.json();
      
      if (backendResult.status !== 'success' || !backendResult.data?.token) {
        console.error('Invalid backend transaction result:', backendResult);
        throw new Error('Failed to get payment token from backend');
      }      // Backend already handles database operations, just return the token
      return NextResponse.json({
        success: true,
        data: {
          token: backendResult.data.token,
          redirect_url: backendResult.data.redirect_url,
          order_id: backendResult.data.order_id
        }
      });

    } catch (error) {
      console.error('Payment creation error:', error);

      return NextResponse.json(
        { 
          success: false,
          error: 'Failed to create payment transaction' 
        },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Server error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Internal server error' 
      },
      { status: 500 }
    );
  }
}
