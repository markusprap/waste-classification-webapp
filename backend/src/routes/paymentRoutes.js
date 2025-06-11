/**
 * Payment API routes for Hapi.js
 */
const { 
  handlePaymentNotification, 
  createPaymentTransaction, 
  getPaymentStatus 
} = require('../controllers/paymentController');

// Define routes for Hapi.js
const paymentRoutes = [
  {
    method: 'POST',
    path: '/api/payment/notification',
    handler: handlePaymentNotification,
    options: {
      // Allow requests from Midtrans
      cors: {
        origin: ['*'],
        credentials: false
      },
      // Increase payload size for Midtrans notifications
      payload: {
        maxBytes: 1048576, // 1MB
        parse: true,
        allow: 'application/json'
      },
      // No authentication required for webhook
      auth: false
    }
  },
  {
    method: 'POST',
    path: '/api/payment/create-transaction',
    handler: createPaymentTransaction
  },
  {
    method: 'GET',
    path: '/api/payment/status/{orderId}',
    handler: getPaymentStatus
  },
  {
    method: 'GET',
    path: '/api/payment/client-key',
    handler: (request, h) => {
      return h.response({
        status: 'success',
        clientKey: process.env.MIDTRANS_CLIENT_KEY
      }).code(200);
    }
  },
  {
    method: 'GET',
    path: '/api/payment/server-status',
    handler: (request, h) => {
      return h.response({
        status: 'success',
        message: 'Payment server is running',
        environment: process.env.MIDTRANS_ENV || 'not set',
        serverKeyConfigured: !!process.env.MIDTRANS_SERVER_KEY,
        clientKeyConfigured: !!process.env.MIDTRANS_CLIENT_KEY
      }).code(200);
    }
  }
];

module.exports = paymentRoutes;
