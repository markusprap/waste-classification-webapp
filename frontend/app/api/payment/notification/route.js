import { NextResponse } from 'next/server';
import midtransClient from 'midtrans-client';
import { prisma } from '@/lib/prisma';

// Initialize Midtrans Core API
const initMidtransCore = () => {
  return new midtransClient.CoreApi({
    isProduction: process.env.NODE_ENV === 'production',
    serverKey: process.env.MIDTRANS_SERVER_KEY || 'SB-Mid-server-GwUP_WGbJPXsDzsNEBRs8IYA',
    clientKey: process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || 'SB-Mid-client-61XuGAwQ8Bj8LxSS'
  });
};

// Handle notification from Midtrans
export async function POST(request) {
  try {
    // Get notification body
    const notificationBody = await request.json();
    console.log('Received notification from Midtrans:', notificationBody);
    
    // Initialize Midtrans Core API
    const core = initMidtransCore();
    
    // Verify notification signature
    const verificationResult = await core.transaction.notification(notificationBody);
    console.log('Verification result:', verificationResult);
    
    // Extract important information
    const orderId = verificationResult.order_id;
    const transactionStatus = verificationResult.transaction_status;
    const fraudStatus = verificationResult.fraud_status;
    
    // Extract user email from order ID (assuming order ID format is PREMIUM-timestamp-random-email)
    const orderParts = orderId.split('-');
    const userEmail = orderParts[orderParts.length - 1];
    
    // Handle different transaction status
    if (transactionStatus === 'capture' || transactionStatus === 'settlement') {
      if (fraudStatus === 'accept') {
        // Payment success and not fraud - update user plan to premium
        
        // Find user by email or order ID (depending on your implementation)
        const user = await prisma.user.findFirst({
          where: {
            email: userEmail
          }
        });
        
        if (user) {
          // Update user plan to premium
          await prisma.user.update({
            where: { id: user.id },
            data: {
              plan: 'premium',
              usageLimit: 1000, // Very high limit for premium
              // Reset usage count
              usageCount: 0,
              lastUsageReset: new Date()
            }
          });
          
          // Record subscription
          await prisma.subscription.create({
            data: {
              userId: user.id,
              plan: 'premium',
              startDate: new Date(),
              // Set a 1 year validity for the subscription
              endDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
              paymentId: orderId,
              paymentStatus: 'success'
            }
          });
          
          console.log(`User ${userEmail} upgraded to premium plan`);
        } else {
          console.error(`User with email ${userEmail} not found`);
        }
      }
    } else if (transactionStatus === 'pending') {
      // Payment is pending - you can record this status
      console.log(`Payment for ${orderId} is pending`);
    } else if (transactionStatus === 'deny' || 
               transactionStatus === 'cancel' || 
               transactionStatus === 'expire') {
      // Payment failed - you can record this status
      console.log(`Payment for ${orderId} failed or cancelled`);
    }
    
    // Return success response to Midtrans
    return NextResponse.json({ status: 'ok' });
  } catch (error) {
    console.error('Error handling Midtrans notification:', error);
    return NextResponse.json(
      { error: 'Failed to process payment notification' },
      { status: 500 }
    );
  }
}
