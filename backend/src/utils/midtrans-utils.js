/**
 * Midtrans payment utilities for server-side processing
 */
const crypto = require('crypto');
const midtransClient = require('midtrans-client');

// Debug: Log environment variables
console.log('Midtrans utils loaded');
console.log('MIDTRANS_SERVER_KEY available:', !!process.env.MIDTRANS_SERVER_KEY);
console.log('MIDTRANS_CLIENT_KEY available:', !!process.env.MIDTRANS_CLIENT_KEY);
console.log('MIDTRANS_ENV:', process.env.MIDTRANS_ENV || 'not set');

// Create Core API instance for server-side operations
const createCoreApiInstance = () => {
  return new midtransClient.CoreApi({
    isProduction: process.env.MIDTRANS_ENV === 'production',
    serverKey: process.env.MIDTRANS_SERVER_KEY,
    clientKey: process.env.MIDTRANS_CLIENT_KEY
  });
};

// Create Snap API instance for client-side payment page
const createSnapInstance = () => {
  try {
    // Log environment state for debugging
    console.log('Creating Snap instance with:');
    console.log('- isProduction:', process.env.MIDTRANS_ENV === 'production');
    console.log('- serverKey available:', !!process.env.MIDTRANS_SERVER_KEY);
    console.log('- clientKey available:', !!process.env.MIDTRANS_CLIENT_KEY);
    
    const snap = new midtransClient.Snap({
      isProduction: process.env.MIDTRANS_ENV === 'production',
      serverKey: process.env.MIDTRANS_SERVER_KEY,
      clientKey: process.env.MIDTRANS_CLIENT_KEY
    });

    // Add custom headers for notification URL override
    snap.httpClient.http_client.interceptors.request.use((config) => {
      config.headers['X-Override-Notification'] = process.env.FRONTEND_URL + '/api/payment/notification';
      return config;
    });

    return snap;
  } catch (error) {
    console.error('Error creating Snap instance:', error);
    throw error;
  }
};

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

/**
 * Create a new Snap transaction
 * @param {Object} params - Transaction parameters
 * @returns {Promise<Object>} Response from Midtrans Snap API
 */
const createSnapTransaction = async (params) => {
  try {
    console.log('Creating Snap transaction with params:', JSON.stringify(params, null, 2));
    console.log('Creating Snap instance with environment:', process.env.MIDTRANS_ENV || 'not set');
    
    const snap = createSnapInstance();
    console.log('Snap instance created, calling createTransaction method');
    
    const response = await snap.createTransaction(params);
    console.log('Snap transaction created with response:', JSON.stringify(response, null, 2));

    if (!response || !response.token) {
      console.error('No token in response');
      throw new Error('Failed to create Snap transaction');
    }

    return {
      token: response.token,
      redirect_url: response.redirect_url
    };
  } catch (error) {
    console.error('Error creating Snap transaction:', error);
    if (error.apiResponse) {
      console.error('Midtrans API Response:', JSON.stringify(error.apiResponse, null, 2));
    }
    throw error;
  }
};

/**
 * Get transaction status from Midtrans
 * @param {string} orderId - Transaction order ID
 * @returns {Promise<Object>} Transaction status
 */
const getTransactionStatus = async (orderId) => {
  try {
    const core = createCoreApiInstance();
    const response = await core.transaction.status(orderId);

    if (!response) {
      throw new Error('Failed to get transaction status');
    }

    return response;
  } catch (error) {
    console.error('Error getting transaction status:', error);
    throw error;
  }
};

module.exports = {
  generateMidtransSignature,
  verifyMidtransSignature,
  createSnapTransaction,
  getTransactionStatus,
  createCoreApiInstance,
  createSnapInstance
};
