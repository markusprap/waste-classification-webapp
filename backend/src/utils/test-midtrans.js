// Test Midtrans integration
require('dotenv').config();
const midtransClient = require('midtrans-client');

console.log('TEST: Checking Midtrans environment setup');
console.log('----------------------------------------');
console.log('MIDTRANS_SERVER_KEY present:', !!process.env.MIDTRANS_SERVER_KEY);
console.log('MIDTRANS_CLIENT_KEY present:', !!process.env.MIDTRANS_CLIENT_KEY);
console.log('MIDTRANS_ENV:', process.env.MIDTRANS_ENV || '(not set)');
console.log('FRONTEND_URL:', process.env.FRONTEND_URL || '(not set)');
console.log('----------------------------------------');

try {
  console.log('Creating Snap instance...');
  const snap = new midtransClient.Snap({
    isProduction: process.env.MIDTRANS_ENV === 'production',
    serverKey: process.env.MIDTRANS_SERVER_KEY,
    clientKey: process.env.MIDTRANS_CLIENT_KEY
  });
  console.log('Snap instance created successfully!');
  
  // Test a minimal transaction creation to validate the client
  const orderId = `TEST-${new Date().getTime()}`;
  console.log('Creating test transaction with order ID:', orderId);
  
  const transaction = {
    transaction_details: {
      order_id: orderId,
      gross_amount: 10000
    },
    customer_details: {
      first_name: 'Test User',
      email: 'test@example.com'
    }
  };
  
  snap.createTransaction(transaction)
    .then(result => {
      console.log('Test transaction created successfully!');
      console.log('Token:', result.token);
      console.log('Redirect URL:', result.redirect_url);
    })
    .catch(error => {
      console.error('Error creating test transaction:', error.message);
      if (error.apiResponse) {
        console.error('API Response:', JSON.stringify(error.apiResponse, null, 2));
      }
    });
} catch (error) {
  console.error('Error creating Snap instance:', error);
}
