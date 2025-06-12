const crypto = require('crypto');
const midtransClient = require('midtrans-client');

if (!process.env.MIDTRANS_SERVER_KEY || !process.env.MIDTRANS_CLIENT_KEY) {
  console.warn('Warning: Midtrans keys not properly configured.');
}

const createCoreApiInstance = () => {
  return new midtransClient.CoreApi({
    isProduction: process.env.MIDTRANS_ENV === 'production',
    serverKey: process.env.MIDTRANS_SERVER_KEY,
    clientKey: process.env.MIDTRANS_CLIENT_KEY
  });
};

const createSnapInstance = () => {
  try {
    const snap = new midtransClient.Snap({
      isProduction: process.env.MIDTRANS_ENV === 'production',
      serverKey: process.env.MIDTRANS_SERVER_KEY,
      clientKey: process.env.MIDTRANS_CLIENT_KEY
    });

    return snap;
  } catch (error) {
    console.error('Error creating Snap instance:', error);
    throw error;
  }
};

const generateMidtransSignature = (params, serverKey) => {
  try {
    const orderId = params.order_id;
    const statusCode = params.status_code;
    const grossAmount = params.gross_amount;
    
    if (!orderId || !statusCode || !grossAmount) {
      console.error('Missing required parameters for signature generation:', params);
      return '';
    }
    
    const stringToSign = `${orderId}${statusCode}${grossAmount}${serverKey}`;
    
    return crypto.createHash('sha512').update(stringToSign).digest('hex');
  } catch (error) {
    console.error('Error generating Midtrans signature:', error);
    return '';
  }
};

const verifyMidtransSignature = (notificationBody, signature, serverKey) => {
  try {
    const generatedSignature = generateMidtransSignature(notificationBody, serverKey);
    return generatedSignature === signature;
  } catch (error) {
    console.error('Error verifying Midtrans signature:', error);
    return false;
  }
};

const createSnapTransaction = async (params) => {
  try {
    const snap = createSnapInstance();
    const response = await snap.createTransaction(params);

    if (!response || !response.token) {
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
