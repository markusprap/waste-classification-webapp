/**
 * Test Midtrans webhook handler manually
 * This script simulates a Midtrans notification to test the webhook handler
 */
const fetch = require('node-fetch');
const crypto = require('crypto');

// Configuration
const BACKEND_URL = 'http://localhost:3001';
const TEST_SERVER_KEY = process.env.MIDTRANS_SERVER_KEY || 'your-server-key';

// Generate signature for test
function generateSignature(orderId, statusCode, grossAmount, serverKey) {
  const signatureKey = `${orderId}${statusCode}${grossAmount}${serverKey}`;
  return crypto.createHash('sha512').update(signatureKey).digest('hex');
}

// Test notification payload
const testNotification = {
  order_id: 'PREMIUM-1734567890-test-user-test%40example.com',
  transaction_status: 'settlement', // This should trigger activation
  fraud_status: 'accept',
  status_code: '200',
  gross_amount: '99000.00',
  payment_type: 'credit_card',
  transaction_id: 'test-transaction-123',
  transaction_time: new Date().toISOString()
};

async function testWebhook() {
  try {
    console.log('🧪 Testing Midtrans webhook handler...');
    console.log('📦 Test payload:', JSON.stringify(testNotification, null, 2));
    
    // Generate signature
    const signature = generateSignature(
      testNotification.order_id,
      testNotification.status_code,
      testNotification.gross_amount,
      TEST_SERVER_KEY
    );
    
    console.log('🔐 Generated signature:', signature);
    
    // Send test notification
    const response = await fetch(`${BACKEND_URL}/api/payment/notification`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Signature': signature
      },
      body: JSON.stringify(testNotification)
    });
    
    const result = await response.text();
    
    console.log('📡 Response status:', response.status);
    console.log('📡 Response body:', result);
    
    if (response.status === 200) {
      console.log('✅ Webhook test PASSED!');
      console.log('💡 Check your database to see if subscription was activated');
    } else {
      console.log('❌ Webhook test FAILED!');
      console.log('💡 Check backend logs for error details');
    }
    
  } catch (error) {
    console.error('💥 Test error:', error.message);
  }
}

// Run test
if (require.main === module) {
  testWebhook();
}

module.exports = { testWebhook };
