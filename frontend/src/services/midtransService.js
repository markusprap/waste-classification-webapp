/**
 * Midtrans service for handling payment integration
 */

// Initialize Midtrans Snap
export const initMidtrans = () => {
  if (typeof window === 'undefined') return; // Only run on client side
  
  // For development, use sandbox
  const isProduction = process.env.NODE_ENV === 'production';
  const clientKey = process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || 'SB-Mid-client-61XuGAwQ8Bj8LxSS';
  
  // Load Midtrans script
  const script = document.createElement('script');
  script.src = isProduction
    ? 'https://app.midtrans.com/snap/snap.js'
    : 'https://app.sandbox.midtrans.com/snap/snap.js';
  script.setAttribute('data-client-key', clientKey);
  script.async = true;
  
  document.body.appendChild(script);
  
  return script;
};

// Get Snap token from backend
export const getSnapToken = async (orderId, amount, customerDetails) => {
  try {
    const response = await fetch('/api/payment/create-transaction', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        orderId,
        amount,
        customerDetails
      }),
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Failed to get payment token');
    }
    
    return data.token;
  } catch (error) {
    console.error('Error getting Midtrans token:', error);
    throw error;
  }
};

// Open Midtrans Snap payment popup
export const openSnapPayment = async (token) => {
  if (typeof window === 'undefined') {
    console.error('Window is not defined');
    return Promise.reject(new Error('Window is not defined'));
  }

  if (!window.snap) {
    console.error('Snap is not initialized yet');
    return Promise.reject(new Error('Snap is not initialized'));
  }
  
  return new Promise((resolve, reject) => {
    window.snap.embed(token, {
      embedId: 'snap-container',
      onSuccess: function(result) {
        console.log('Payment success:', result);
        resolve({ success: true, data: result });
      },
      onPending: function(result) {
        console.log('Payment pending:', result);
        resolve({ success: true, status: 'pending', data: result });
      },
      onError: function(result) {
        console.error('Payment error:', result);
        reject({ success: false, error: result });
      },
      onClose: function() {
        console.log('Customer closed the payment popup without finishing payment');
        reject({ success: false, error: 'Payment popup closed' });
      }
    });
  });
};

// Process payment for premium plan upgrade
export const processPremiumUpgrade = async (user) => {
  try {
    if (!user || !user.email) {
      throw new Error('User information is required');
    }
    
    // Generate unique order ID with email as identifier
    const userEmailEncoded = encodeURIComponent(user.email);
    const orderId = `PREMIUM-${Date.now()}-${Math.floor(Math.random() * 1000)}-${userEmailEncoded}`;
    
    // Set fixed amount for premium upgrade
    const amount = 10000; // Rp 10.000
    
    // Customer details from user info
    const customerDetails = {
      first_name: user.name?.split(' ')[0] || 'User',
      last_name: user.name?.split(' ').slice(1).join(' ') || '',
      email: user.email,
    };
    
    // Get Snap token from backend
    const token = await getSnapToken(orderId, amount, customerDetails);
    
    // Open Snap payment popup
    return await openSnapPayment(token);
  } catch (error) {
    console.error('Error processing payment:', error);
    throw error;
  }
};
