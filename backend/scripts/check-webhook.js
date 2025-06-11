/**
 * Check if webhook endpoint is accessible and working
 */
const fetch = require('node-fetch');

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3001';
const NGROK_URL = 'https://8efa-103-142-255-94.ngrok-free.app'; // Your ngrok URL

async function checkWebhookEndpoint() {
  try {
    console.log('🔍 Checking webhook endpoint accessibility...');
    
    // Test local backend
    console.log('\n1. Testing local backend endpoint...');
    try {
      const localResponse = await fetch(`${BACKEND_URL}/api/payment/server-status`);
      const localData = await localResponse.json();
      
      if (localResponse.ok) {
        console.log('✅ Local backend is running');
        console.log('📋 Backend status:', localData);
      } else {
        console.log('❌ Local backend not responding properly');
      }
    } catch (error) {
      console.log('❌ Local backend not accessible:', error.message);
    }
    
    // Test ngrok endpoint
    console.log('\n2. Testing ngrok endpoint...');
    try {
      const ngrokResponse = await fetch(`${NGROK_URL}/api/payment/server-status`);
      const ngrokData = await ngrokResponse.json();
      
      if (ngrokResponse.ok) {
        console.log('✅ Ngrok endpoint is accessible');
        console.log('📋 Ngrok status:', ngrokData);
        console.log('🎯 Webhook URL for Midtrans:', `${NGROK_URL}/api/payment/notification`);
      } else {
        console.log('❌ Ngrok endpoint not responding properly');
      }
    } catch (error) {
      console.log('❌ Ngrok endpoint not accessible:', error.message);
      console.log('💡 Make sure ngrok is running: ngrok http 3001');
    }
    
    // Test webhook endpoint specifically
    console.log('\n3. Testing webhook endpoint...');
    try {
      const webhookResponse = await fetch(`${NGROK_URL}/api/payment/notification`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ test: 'ping' })
      });
      
      console.log('📡 Webhook endpoint response status:', webhookResponse.status);
      
      if (webhookResponse.status === 403) {
        console.log('🔐 Webhook endpoint is accessible (signature validation working)');
      } else if (webhookResponse.status === 400) {
        console.log('📝 Webhook endpoint is accessible (payload validation working)');
      } else {
        console.log('⚠️ Unexpected response from webhook endpoint');
      }
    } catch (error) {
      console.log('❌ Webhook endpoint test failed:', error.message);
    }
    
    console.log('\n📋 Summary:');
    console.log('- Make sure backend is running on port 3001');
    console.log('- Make sure ngrok is running: ngrok http 3001');
    console.log(`- Set this URL in Midtrans dashboard: ${NGROK_URL}/api/payment/notification`);
    console.log('- Test payment flow and check backend logs for webhook messages');
    
  } catch (error) {
    console.error('💥 Check failed:', error.message);
  }
}

// Run check
checkWebhookEndpoint();
