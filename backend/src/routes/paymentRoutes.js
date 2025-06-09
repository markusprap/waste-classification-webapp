/**
 * Payment API routes for Hapi.js
 */
const { handlePaymentNotification } = require('../controllers/paymentController');

// Define routes for Hapi.js
const paymentRoutes = [
  {
    method: 'POST',
    path: '/api/payment/notification',
    handler: handlePaymentNotification
  }
];

module.exports = paymentRoutes;
