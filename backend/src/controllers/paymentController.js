/**
 * Midtrans payment controller for Hapi.js
 */
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { verifyMidtransSignature, createSnapTransaction, getTransactionStatus } = require('../utils/midtrans-utils');

// Debug: Check if environment variables are loaded
console.log('PaymentController initialized');
console.log('MIDTRANS_SERVER_KEY available:', !!process.env.MIDTRANS_SERVER_KEY);
console.log('MIDTRANS_CLIENT_KEY available:', !!process.env.MIDTRANS_CLIENT_KEY);
console.log('MIDTRANS_ENV:', process.env.MIDTRANS_ENV || 'not set');

/**
 * Create payment transaction for upgrading to premium
 * @param {Object} request - Hapi request object
 * @param {Object} h - Hapi response toolkit
 * @returns {Object} Response with transaction token
 */
const createPaymentTransaction = async (request, h) => {
  try {
    console.log('----------------------------------------');
    console.log('Creating payment transaction with payload:', JSON.stringify(request.payload, null, 2));
    console.log('Headers:', JSON.stringify(request.headers, null, 2));
    console.log('----------------------------------------');
    
    const { userId, email, fullName, plan, amount: requestAmount, currency = 'IDR' } = request.payload;
    
    // Only allow premium plan upgrades
    if (plan !== 'premium') {
      return h.response({
        status: 'error',
        message: 'Only premium plan upgrades are supported'
      }).code(400);
    }

    // Fixed amount for premium plan
    const amount = 99000;

    // Validate that frontend amount matches the fixed premium amount
    if (requestAmount && requestAmount !== amount) {
      console.error(`Amount mismatch: expected ${amount}, got ${requestAmount}`);
      return h.response({
        status: 'error',
        message: 'Invalid amount for premium plan'
      }).code(400);
    }
      if (!email) {
      console.error('Missing required email');
      return h.response({
        status: 'error',
        message: 'Email is required'
      }).code(400);
    }
    
    // Try to find user by email first, then by userId if provided
    let user = await prisma.user.findUnique({
      where: { email }
    });
    
    // If user doesn't exist, create them (this handles NextAuth users)
    if (!user) {
      console.log(`User not found for email: ${email}, creating new user`);
      try {
        user = await prisma.user.create({
          data: {            email: email,
            name: fullName || 'User',
            plan: 'free',
            usageCount: 0,
            usageLimit: 30
          }
        });
        console.log(`Created new user with id: ${user.id}`);
      } catch (createError) {
        console.error('Error creating user:', createError);
        return h.response({
          status: 'error',
          message: 'Failed to create user account'
        }).code(500);      }
    }
    
    // Check if user is already on the requested plan
    if (user.plan === plan) {
      return h.response({
        status: 'error',
        message: `User is already on the ${plan} plan`
      }).code(400);
    }
    
    // Check if user already has an active premium subscription
    const activeSubscription = await prisma.subscription.findFirst({
      where: {
        userId: user.id,
        plan: 'premium',
        status: 'active',
        endDate: {
          gt: new Date()
        }
      }
    });

    if (activeSubscription) {
      return h.response({
        status: 'error',
        message: 'User already has an active premium subscription'
      }).code(400);
    }
      // Generate unique order ID (keep it short for Midtrans API)
    const timestamp = new Date().getTime();
    const random = Math.floor(Math.random() * 1000);
    const orderId = `${plan.toUpperCase()}-${timestamp}-${random}`;
    
    // Prepare transaction data according to Midtrans format
    const transactionData = {
      transaction_details: {
        order_id: orderId,
        gross_amount: amount
      },
      credit_card: {
        secure: true
      },
      customer_details: {
        first_name: fullName || user.name || 'User',
        email: email,
        phone: user.phone || '',
        billing_address: {
          first_name: fullName || user.name || 'User',
          email: email,
          phone: user.phone || ''
        }
      },
      item_details: [{
        id: `${plan.toUpperCase()}-PLAN`,
        price: amount,
        quantity: 1,
        name: `WasteWise AI ${plan.charAt(0).toUpperCase() + plan.slice(1)} Plan`,
        brand: 'WasteWise AI',
        category: 'Subscription',
        merchant_name: 'WasteWise AI',
        description: plan === 'premium' 
          ? '50 klasifikasi per hari, Analytics detail, Export data CSV/PDF'
          : 'Klasifikasi unlimited, API akses penuh, White-label solution'
      }],
      callbacks: {
        finish: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/payment/success`,
        error: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/payment/error`,
        pending: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/payment/pending`
      }
    };

    try {
      // Create transaction with Midtrans
      const transaction = await createSnapTransaction(transactionData);
      
      if (!transaction || !transaction.token) {
        throw new Error('Failed to get transaction token from Midtrans');
      }
      
      // Record pending subscription
      await prisma.subscription.create({
        data: {
          userId: user.id,
          plan: 'premium',
          status: 'pending',
          startDate: new Date(),
          amount,
          currency,
          paymentId: orderId,
          paymentStatus: 'pending'
        }
      });
      
      return h.response({
        status: 'success',
        message: 'Transaction created successfully',
        data: {
          token: transaction.token,
          redirect_url: transaction.redirect_url,
          order_id: orderId
        }
      }).code(200);
      
    } catch (midtransError) {
      console.error('Midtrans transaction error:', midtransError);
      return h.response({
        status: 'error',
        message: 'Failed to create Midtrans transaction',
        error: midtransError.message
      }).code(502);
    }
  } catch (error) {
    console.error('Error creating payment transaction:', error);
    return h.response({
      status: 'error',
      message: 'Failed to create payment transaction',
      error: error.message
    }).code(500);
  }
};

/**
 * Get transaction status from Midtrans
 * @param {Object} request - Hapi request object
 * @param {Object} h - Hapi response toolkit
 * @returns {Object} Transaction status
 */
const getPaymentStatus = async (request, h) => {
  try {
    const { orderId } = request.params;
    
    if (!orderId) {
      return h.response({
        status: 'error',
        message: 'Order ID is required'
      }).code(400);
    }
    
    // Get transaction status from Midtrans
    const transaction = await getTransactionStatus(orderId);
    
    return h.response({
      status: 'success',
      data: transaction
    }).code(200);
  } catch (error) {
    console.error('Error getting transaction status:', error);
    return h.response({
      status: 'error',
      message: 'Failed to get transaction status',
      error: error.message
    }).code(500);
  }
};

/**
 * Handle notification from Midtrans
 * @param {Object} request - Hapi request object
 * @param {Object} h - Hapi response toolkit
 * @returns {Object} Response with status
 */
const handlePaymentNotification = async (request, h) => {
  try {
    console.log('🔔 === MIDTRANS WEBHOOK RECEIVED ===');
    
    // Get notification body and signature
    const notificationBody = request.payload;
    const signature = request.headers['x-signature'] || '';
    const serverKey = process.env.MIDTRANS_SERVER_KEY;
    
    console.log('📦 Notification payload:', JSON.stringify(notificationBody, null, 2));
    
    let isSignatureValid = false;
    
    // Always verify signature with production keys
    isSignatureValid = verifyMidtransSignature(notificationBody, signature, serverKey);
      
    if (!isSignatureValid) {
      console.error('❌ Invalid signature from Midtrans');
      return h.response({ status: 'error', message: 'Invalid signature' }).code(403);
    }
    
    console.log('✅ Signature verification passed');
    
    // Extract important information
    const orderId = notificationBody.order_id;
    const transactionStatus = notificationBody.transaction_status;
    const fraudStatus = notificationBody.fraud_status;
    
    console.log(`📋 Processing: OrderID=${orderId}, Status=${transactionStatus}, Fraud=${fraudStatus}`);
      try {
      // Extract user email from order ID (assuming order ID format is PREMIUM-timestamp-userId-email)
      const orderParts = orderId.split('-');
      // The email is URL encoded, so decode it
      const userEmail = decodeURIComponent(orderParts[orderParts.length - 1]);
      const userId = orderParts[orderParts.length - 2]; // Get userId from order ID
      
      console.log(`👤 User info: Email=${userEmail}, UserID=${userId}`);

      // Find user by email first
      let user = await prisma.user.findUnique({
        where: { email: userEmail }
      });

      // If user not found by email, try by userId
      if (!user && userId) {
        user = await prisma.user.findUnique({
          where: { id: userId }
        });
      }

      if (!user) {
        console.error(`❌ User verification failed for email: ${userEmail} and id: ${userId}`);
        return h.response({ 
          status: 'error', 
          message: 'User verification failed' 
        }).code(404);
      }

      console.log(`✅ User found: ${user.email} (Current plan: ${user.plan})`);

      // Find existing subscription for this payment
      const existingSubscription = await prisma.subscription.findFirst({
        where: { 
          userId: user.id,
          paymentId: orderId 
        }
      });

      console.log(`📝 Existing subscription: ${existingSubscription ? `ID=${existingSubscription.id}, Status=${existingSubscription.status}` : 'None'}`);

      // Handle payment success (settlement or capture with accepted fraud status)
      if ((transactionStatus === 'settlement') || 
          (transactionStatus === 'capture' && fraudStatus === 'accept')) {
        
        console.log('💰 Payment SUCCESS detected - Activating premium subscription');
        
        try {
          // Use transaction to ensure atomicity
          await prisma.$transaction(async (tx) => {
            // 1. Update user plan to premium
            await tx.user.update({
              where: { id: user.id },
              data: {
                plan: 'premium',
                usageLimit: 10000,
                usageCount: 0,
                lastUsageReset: new Date()
              }
            });

            // 2. Update or create subscription
            if (existingSubscription) {
              // Update existing subscription to active
              await tx.subscription.update({
                where: { id: existingSubscription.id },
                data: {
                  status: 'active',
                  paymentStatus: 'settlement',
                  endDate: new Date(new Date().setMonth(new Date().getMonth() + 1))
                }
              });
              console.log(`✅ Updated subscription ${existingSubscription.id} to ACTIVE`);
            } else {
              // Create new active subscription
              const newSub = await tx.subscription.create({
                data: {
                  userId: user.id,
                  plan: 'premium',
                  status: 'active',
                  startDate: new Date(),
                  endDate: new Date(new Date().setMonth(new Date().getMonth() + 1)),
                  amount: parseFloat(notificationBody.gross_amount),
                  currency: 'IDR',
                  paymentId: orderId,
                  paymentStatus: 'settlement'
                }
              });
              console.log(`✅ Created new ACTIVE subscription ${newSub.id}`);
            }
          });

          console.log(`🎉 User ${userEmail} successfully upgraded to PREMIUM!`);
          
        } catch (updateError) {
          console.error('❌ Error updating user plan:', updateError);
          return h.response({ 
            status: 'error', 
            message: 'Error updating user plan' 
          }).code(500);
        }
        
      } else if (transactionStatus === 'pending') {
        console.log('⏳ Payment PENDING - Maintaining pending status');
        
        try {
          if (existingSubscription) {
            await prisma.subscription.update({
              where: { id: existingSubscription.id },
              data: {
                status: 'pending',
                paymentStatus: 'pending'
              }
            });
            console.log(`📝 Updated subscription to PENDING`);
          } else {
            const newSub = await prisma.subscription.create({
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
            console.log(`📝 Created new PENDING subscription ${newSub.id}`);
          }
        } catch (pendingError) {
          console.error('❌ Error handling pending payment:', pendingError);
        }
        
      } else if (['deny', 'cancel', 'expire', 'failure'].includes(transactionStatus)) {
        console.log(`❌ Payment FAILED (${transactionStatus}) - Setting failed status`);
        
        try {
          if (existingSubscription) {
            await prisma.subscription.update({
              where: { id: existingSubscription.id },
              data: {
                status: 'failed',
                paymentStatus: transactionStatus
              }
            });
            console.log(`❌ Updated subscription to FAILED`);
          } else {
            const newSub = await prisma.subscription.create({
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
            console.log(`❌ Created new FAILED subscription ${newSub.id}`);
          }
        } catch (failedError) {
          console.error('❌ Error recording failed payment:', failedError);
        }
      } else {
        console.log(`⚠️ Unhandled transaction status: ${transactionStatus}`);
      }
      
      console.log('✅ === WEBHOOK PROCESSING COMPLETED ===');
      
      // Return success response to Midtrans
      return h.response({ status: 'ok' }).code(200);
      
    } catch (parsingError) {
      console.error('❌ Error parsing notification data:', parsingError);
      return h.response({ status: 'error', message: 'Error parsing notification data' }).code(400);
    }
  } catch (error) {
    console.error('Error handling Midtrans notification:', error);
    return h.response({ status: 'error', message: 'Internal server error' }).code(500);
  }
};

module.exports = {
  createPaymentTransaction,
  getPaymentStatus,
  handlePaymentNotification
};