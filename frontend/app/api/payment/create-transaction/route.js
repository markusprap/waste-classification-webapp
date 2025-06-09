import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';

// Helper function to create basic auth header
const createBasicAuthHeader = (serverKey) => {
  const auth = Buffer.from(serverKey + ':').toString('base64');
  return `Basic ${auth}`;
};

// Create Midtrans transaction
export async function POST(request) {
  try {
    // Ensure user is authenticated
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    // Get transaction details from request
    const { orderId, amount, customerDetails } = await request.json();
    
    // Validate required fields
    if (!orderId || !amount || !customerDetails) {
      return NextResponse.json(
        { error: 'Missing required transaction details' },
        { status: 400 }
      );
    }
    
        // Prepare transaction parameters
    const parameter = {
      transaction_details: {
        order_id: orderId,
        gross_amount: amount
      },
      customer_details: {
        first_name: customerDetails.first_name,
        last_name: customerDetails.last_name,
        email: customerDetails.email
      },
      item_details: [
        {
          id: 'premium-plan',
          name: 'WasteWise AI Premium Plan',
          price: amount,
          quantity: 1
        }
      ],
      callbacks: {
        finish: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/payment/success`,
        error: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/payment/error`,
        pending: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/payment/pending`
      }
    };
    
    // Set up request to Midtrans API
    const isProduction = process.env.NODE_ENV === 'production';
    const serverKey = process.env.MIDTRANS_SERVER_KEY || 'SB-Mid-server-GwUP_WGbJPXsDzsNEBRs8IYA';
    const baseUrl = isProduction
      ? 'https://app.midtrans.com/snap/v1'
      : 'https://app.sandbox.midtrans.com/snap/v1';
      
    // Create transaction
    const response = await fetch(`${baseUrl}/transactions`, {
      method: 'POST',
      headers: {
        'Authorization': createBasicAuthHeader(serverKey),
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(parameter)
    });
    
    if (!response.ok) {
      const error = await response.text();
      console.error('Midtrans API error:', error);
      throw new Error('Failed to create transaction');
    }
    
    const transaction = await response.json();
    
    // Return token for Snap
    return NextResponse.json({
      success: true,
      token: transaction.token,
      redirect_url: transaction.redirect_url
    });
  } catch (error) {
    console.error('Create transaction error:', error);
    return NextResponse.json(
      { error: 'Failed to create payment transaction' },
      { status: 500 }
    );
  }
}
