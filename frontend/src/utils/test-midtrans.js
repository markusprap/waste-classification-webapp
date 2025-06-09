// Test script to verify Midtrans payment flow
const testMidtransIntegration = async () => {
  try {
    console.log('Starting Midtrans integration test...');
    
    // 1. Test environment variables
    console.log('Checking environment variables...');
    const clientKey = process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY;
    const serverKey = process.env.MIDTRANS_SERVER_KEY;
    
    if (!clientKey || !serverKey) {
      console.error('❌ Missing Midtrans API keys');
      console.log('Please set NEXT_PUBLIC_MIDTRANS_CLIENT_KEY and MIDTRANS_SERVER_KEY');
      return;
    }
    
    console.log('✅ Environment variables are set');
    
    // 2. Test Midtrans script loading
    console.log('Testing Midtrans script loading...');
    if (typeof window !== 'undefined' && !window.snap) {
      console.warn('⚠️ Midtrans Snap is not loaded. Make sure MidtransProvider is working');
    } else if (typeof window !== 'undefined') {
      console.log('✅ Midtrans Snap is loaded');
    }
    
    // 3. Test token generation (mocked)
    console.log('Testing token generation (mock)...');
    const mockOrderId = `TEST-${Date.now()}`;
    const mockAmount = 10000;
    const mockCustomer = {
      first_name: 'Test',
      last_name: 'User',
      email: 'test@example.com'
    };
    
    console.log('✅ Token generation parameters ready');
    console.log('To test actual token generation, use the following parameters:');
    console.log('Order ID:', mockOrderId);
    console.log('Amount:', mockAmount);
    console.log('Customer:', mockCustomer);
    
    console.log('✅ Midtrans integration test completed');
    console.log('To fully test the payment flow:');
    console.log('1. Login to the application');
    console.log('2. Click "Upgrade" on the user dashboard');
    console.log('3. Complete the payment with Midtrans sandbox');
    console.log('4. Verify the plan is updated in the database');
  } catch (error) {
    console.error('❌ Midtrans integration test failed:', error);
  }
};

// Execute the test when the window loads (in browser only)
if (typeof window !== 'undefined') {
  window.addEventListener('load', testMidtransIntegration);
}

export default testMidtransIntegration;
