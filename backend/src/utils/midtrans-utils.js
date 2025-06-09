/**
 * Midtrans payment utilities for server-side processing
 */
const crypto = require('crypto');

/**
 * Generate Midtrans server key hash for notification verification
 * @param {Object} params - Request body from Midtrans notification
 * @param {string} serverKey - Midtrans server key
 * @returns {string} Generated signature hash
 */
const generateMidtransSignature = (params, serverKey) => {
  const orderId = params.order_id;
  const statusCode = params.status_code;
  const grossAmount = params.gross_amount;
  const serverKeyBase64 = Buffer.from(serverKey).toString('base64');
  
  // Generate signature according to Midtrans documentation
  const signatureKey = `${orderId}${statusCode}${grossAmount}${serverKeyBase64}`;
  
  return crypto.createHash('sha512').update(signatureKey).digest('hex');
};

/**
 * Verify Midtrans notification signature
 * @param {Object} notificationBody - Notification body from Midtrans
 * @param {string} signature - Signature from Midtrans notification header
 * @param {string} serverKey - Midtrans server key
 * @returns {boolean} Whether the signature is valid
 */
const verifyMidtransSignature = (notificationBody, signature, serverKey) => {
  const generatedSignature = generateMidtransSignature(notificationBody, serverKey);
  return generatedSignature === signature;
};

module.exports = {
  generateMidtransSignature,
  verifyMidtransSignature
};
