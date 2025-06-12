/**
 * Payment API routes for Hapi.js
 */
const { 
  handlePaymentNotification, 
  createPaymentTransaction, 
  getPaymentStatus 
} = require('../controllers/paymentController');

// Define routes for Hapi.js
const paymentRoutes = [  {
    method: 'POST',
    path: '/api/payment/notification',
    handler: handlePaymentNotification,
    options: {
      // Allow requests from Midtrans
      cors: {
        origin: ['*'],
        credentials: false,
        headers: ['Accept', 'Content-Type', 'x-signature']
      },      // Increase payload size for Midtrans notifications
      payload: {
        maxBytes: 1048576, // 1MB
        parse: true,
        allow: 'application/json',
        output: 'data',
        failAction: 'log'
      },
      // No authentication required for webhook
      auth: false,
      // Don't validate the payload
      validate: {
        payload: false,
        failAction: 'log'
      }
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
  },  {
    method: 'GET',
    path: '/api/payment/server-status',
    handler: (request, h) => {
      return h.response({
        status: 'success',
        message: 'Payment server is running',
        environment: process.env.MIDTRANS_ENV || 'sandbox',
        configured: !!process.env.MIDTRANS_SERVER_KEY && !!process.env.MIDTRANS_CLIENT_KEY
      }).code(200);
    }
  }
];

module.exports = paymentRoutes;
