import { NextResponse } from 'next/server';

/**
 * Handle Midtrans payment notifications
 * This endpoint receives notifications from Midtrans and forwards them to the backend
 */
export async function POST(request) {
  try {
    // Get notification data from request body
    const notificationData = await request.json();
    console.log('Received Midtrans notification:', JSON.stringify(notificationData, null, 2));
    console.log('Notification headers:', JSON.stringify(Object.fromEntries([...request.headers.entries()]), null, 2));
    
    // Forward notification to backend
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:3001';
    console.log(`Forwarding notification to ${backendUrl}/api/payment/notification`);
    
    const backendResponse = await fetch(`${backendUrl}/api/payment/notification`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Signature': request.headers.get('x-signature') || ''
      },
      body: JSON.stringify(notificationData)
    });

    if (!backendResponse.ok) {
      console.error(`Backend returned error status: ${backendResponse.status}`);
      let errorText = '';
      try {
        errorText = await backendResponse.text();
        console.error('Backend error details:', errorText);
      } catch (e) {
        console.error('Could not read backend error response');
      }
      throw new Error(`Backend error: ${backendResponse.status} - ${errorText}`);
    }

    console.log('Successfully processed notification');
    
    // Return success response as expected by Midtrans
    return NextResponse.json({ status: 'ok' });
  } catch (error) {
    console.error('Error handling payment notification:', error);
    
    // Return error response in Midtrans expected format
    return NextResponse.json(
      { 
        status: 'error',
        message: 'Failed to process payment notification'
      },
      { status: 500 }
    );
  }
}