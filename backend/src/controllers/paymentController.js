/**
 * Midtrans payment controller for Hapi.js
 */
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { verifyMidtransSignature } = require('../utils/midtrans-utils');

// Handle notification from Midtrans
const handlePaymentNotification = async (request, h) => {
  try {
    // Get notification body and signature
    const notificationBody = request.payload;
    const signature = request.headers['x-signature'] || '';
    const serverKey = process.env.MIDTRANS_SERVER_KEY || 'SB-Mid-server-GwUP_WGbJPXsDzsNEBRs8IYA';
    
    console.log('Received notification from Midtrans:', JSON.stringify(notificationBody, null, 2));
    console.log('Notification headers:', JSON.stringify(request.headers, null, 2));
    
    // Skip signature verification in development/sandbox mode for testing
    let isSignatureValid = true;
    
    if (process.env.NODE_ENV === 'production') {
      // Only verify signature in production
      isSignatureValid = verifyMidtransSignature(notificationBody, signature, serverKey);
      
      if (!isSignatureValid) {
        console.error('Invalid signature from Midtrans');
        return h.response({ status: 'error', message: 'Invalid signature' }).code(403);
      }
    }
    
    // Extract important information
    const orderId = notificationBody.order_id;
    const transactionStatus = notificationBody.transaction_status;
    const fraudStatus = notificationBody.fraud_status;
    
    // Extract user email from order ID (assuming order ID format is PREMIUM-timestamp-random-email)
    const orderParts = orderId.split('-');
    // The email is URL encoded, so decode it
    const userEmail = decodeURIComponent(orderParts[orderParts.length - 1]);
    
    console.log(`Processing payment notification for user: ${userEmail}, status: ${transactionStatus}`);
    
    // Handle different transaction status
    if (transactionStatus === 'capture' || transactionStatus === 'settlement') {
      if (fraudStatus === 'accept') {
        // Payment success and not fraud - update user plan to premium
        
        // Find user by email
        const user = await prisma.user.findUnique({
          where: { email: userEmail }
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
              status: 'active',
              startDate: new Date(),
              // Set a 1 year validity for the subscription
              endDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
              amount: parseFloat(notificationBody.gross_amount),
              currency: 'IDR',
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
      // Payment is pending - record this status
      const user = await prisma.user.findUnique({
        where: { email: userEmail }
      });
      
      if (user) {
        // Record pending subscription
        await prisma.subscription.create({
          data: {
            userId: user.id,
            plan: 'premium',
            status: 'pending',
            startDate: new Date(),
            amount: parseFloat(notificationBody.gross_amount),
            currency: 'IDR',
            paymentId: orderId,
            paymentStatus: 'pending'
          }
        });
        
        console.log(`Payment for ${userEmail} is pending`);
      }
    } else if (transactionStatus === 'deny' || 
               transactionStatus === 'cancel' || 
               transactionStatus === 'expire') {
      // Payment failed - record this status
      const user = await prisma.user.findUnique({
        where: { email: userEmail }
      });
      
      if (user) {
        // Record failed subscription
        await prisma.subscription.create({
          data: {
            userId: user.id,
            plan: 'premium',
            status: 'failed',
            startDate: new Date(),
            amount: parseFloat(notificationBody.gross_amount),
            currency: 'IDR',
            paymentId: orderId,
            paymentStatus: transactionStatus
          }
        });
        
        console.log(`Payment for ${userEmail} failed or cancelled`);
      }    }
    
    // Return success response to Midtrans
    return h.response({ status: 'ok' }).code(200);
  } catch (error) {
    console.error('Error handling Midtrans notification:', error);
    return h.response({ status: 'error', message: 'Internal server error' }).code(500);
  }
};

module.exports = {
  handlePaymentNotification
};
