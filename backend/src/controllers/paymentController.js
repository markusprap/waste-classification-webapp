const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { verifyMidtransSignature, createSnapTransaction, getTransactionStatus } = require('../utils/midtrans-utils');

if (!process.env.MIDTRANS_SERVER_KEY || !process.env.MIDTRANS_CLIENT_KEY) {
  console.warn('Warning: Midtrans keys not properly configured. Payment processing may not work correctly.');
}

const createPaymentTransaction = async (request, h) => {
  try {
    const { userId, email, fullName, plan, amount: requestAmount, currency = 'IDR' } = request.payload;
    
    if (plan !== 'premium') {
      return h.response({
        status: 'error',
        message: 'Only premium plan upgrades are supported'
      }).code(400);
    }

    const amount = 99000;

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
    
    let user = await prisma.user.findUnique({
      where: { email }
    });
    
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
    
    if (user.plan === plan) {
      return h.response({
        status: 'error',
        message: `User is already on the ${plan} plan`
      }).code(400);
    }
    
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
    }    const timestamp = new Date().getTime();
    const random = Math.floor(Math.random() * 1000);
    const orderId = `${plan.toUpperCase()}-${timestamp}-${random}-${user.id}`;
    
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
          ? 'Unlimited classifications, Detailed analytics, Priority support'
          : 'Free plan with basic features'
      }],
      callbacks: {
        finish: process.env.MIDTRANS_ENV === 'production'
          ? `${process.env.FRONTEND_URL}/payment/success`
          : 'http://localhost:3000/payment/success',
        error: process.env.MIDTRANS_ENV === 'production'
          ? `${process.env.FRONTEND_URL}/payment/error`
          : 'http://localhost:3000/payment/error',
        pending: process.env.MIDTRANS_ENV === 'production'
          ? `${process.env.FRONTEND_URL}/payment/pending`
          : 'http://localhost:3000/payment/pending'
      }
    };

    try {
      const transaction = await createSnapTransaction(transactionData);
      
      if (!transaction || !transaction.token) {
        throw new Error('Failed to get transaction token from Midtrans');
      }
      
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

const getPaymentStatus = async (request, h) => {
  try {
    const { orderId } = request.params;
    
    if (!orderId) {
      return h.response({
        status: 'error',
        message: 'Order ID is required'
      }).code(400);
    }
    
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

const handlePaymentNotification = async (request, h) => {
  try {
    const notificationBody = request.payload;
    const signature = request.headers['x-signature'] || request.headers['X-Signature'] || '';
    const serverKey = process.env.MIDTRANS_SERVER_KEY;
    
    if (signature && process.env.MIDTRANS_ENV === 'production') {
      const isSignatureValid = verifyMidtransSignature(notificationBody, signature, serverKey);
      if (!isSignatureValid) {
        console.error('Invalid signature from Midtrans');
        return h.response({ 
          status: 'error', 
          message: 'Invalid signature' 
        }).code(403);
      }
    }

    const orderId = notificationBody.order_id;
    const transactionStatus = notificationBody.transaction_status;
    const fraudStatus = notificationBody.fraud_status;    if (!orderId || !transactionStatus) {
      return h.response({
        status: 'error',
        message: 'Missing required fields'
      }).code(400);
    }
    
    const orderParts = orderId.split('-');
    const userId = orderParts[orderParts.length - 1];
    
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      console.error(`User not found: ${userId}`);
      return h.response({ 
        status: 'error', 
        message: 'User not found' 
      }).code(404);
    }

    const existingSubscription = await prisma.subscription.findFirst({
      where: { 
        userId: user.id,
        paymentId: orderId 
      }
    });    if ((transactionStatus === 'settlement') || 
        (transactionStatus === 'capture' && fraudStatus === 'accept')) {
      
      await prisma.$transaction(async (tx) => {
        await tx.user.update({
          where: { id: user.id },
          data: {
            plan: 'premium',
            usageLimit: 10000,
            usageCount: 0
          }
        });

        if (existingSubscription) {
          await tx.subscription.update({
            where: { id: existingSubscription.id },
            data: {
              status: 'active',
              paymentStatus: transactionStatus,
              endDate: new Date(new Date().setMonth(new Date().getMonth() + 1))
            }
          });
        } else {
          await tx.subscription.create({
            data: {
              userId: user.id,
              plan: 'premium',
              status: 'active',
              startDate: new Date(),
              endDate: new Date(new Date().setMonth(new Date().getMonth() + 1)),
              amount: parseFloat(notificationBody.gross_amount),
              currency: 'IDR',
              paymentId: orderId,
              paymentStatus: transactionStatus
            }
          });        }
      });
      
    } else if (transactionStatus === 'pending') {
      if (existingSubscription) {
        await prisma.subscription.update({
          where: { id: existingSubscription.id },
          data: {
            status: 'pending',
            paymentStatus: 'pending'
          }
        });
      } else {
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
        });      }
    } else {
      if (existingSubscription) {
        await prisma.subscription.update({
          where: { id: existingSubscription.id },
          data: {
            status: 'failed',
            paymentStatus: transactionStatus
          }
        });
      }
    }
    
    return h.response({ status: 'success', message: 'Notification processed' }).code(200);

  } catch (error) {
    console.error('Error processing Midtrans notification:', error);
    return h.response({
      status: 'error',
      message: 'Error processing notification',
      error: error.message
    }).code(500);
  }
};

module.exports = {
  createPaymentTransaction,
  getPaymentStatus,
  handlePaymentNotification
};
