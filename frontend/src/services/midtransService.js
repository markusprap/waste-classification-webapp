/**
 * Midtrans service for handling payment integration
 */

// Generate unique order ID
export const generateOrderId = () => {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000);
  return `ORDER-${timestamp}-${random}`;
};

// Initialize Midtrans Snap
export const initMidtrans = () => {
  if (typeof window === 'undefined') return Promise.resolve(); // Only run on client side
  
  return new Promise((resolve, reject) => {
    if (window.snap) {
      console.log('Midtrans Snap already initialized, skipping');
      resolve();
      return;
    }
    
    const clientKey = process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY;
    if (!clientKey) {
      console.error('NEXT_PUBLIC_MIDTRANS_CLIENT_KEY not found');
      reject(new Error('Midtrans client key not configured'));
      return;
    }
    
    const isSandbox = !process.env.NEXT_PUBLIC_MIDTRANS_ENV || process.env.NEXT_PUBLIC_MIDTRANS_ENV === 'sandbox';
    
    console.log('Initializing Midtrans Snap...');
    console.log('- Environment:', isSandbox ? 'sandbox' : 'production');
    console.log('- Client Key:', clientKey ? 'SET' : 'NOT SET');
    
    // Remove existing script if any
    const existingScript = document.querySelector('script[src*="snap.js"]');
    if (existingScript) {
      existingScript.remove();
    }
      // Load Midtrans script
    const script = document.createElement('script');
    script.src = isSandbox 
      ? 'https://app.sandbox.midtrans.com/snap/snap.js' 
      : 'https://app.midtrans.com/snap/snap.js';
    script.setAttribute('data-client-key', clientKey);
    script.async = true;
    script.defer = true;
    script.crossOrigin = "anonymous"; // Add this line for better compatibility
    
    let timeoutId;
    
    // Add onload handler
    script.onload = () => {
      console.log('Midtrans Snap script loaded successfully');
      clearTimeout(timeoutId);
      
      // Wait a bit for snap to be available
      setTimeout(() => {
        if (window.snap) {
          console.log('window.snap is now available');
          resolve();
        } else {
          console.error('window.snap not available after script load');
          reject(new Error('Midtrans Snap initialization failed'));
        }
      }, 1000); // Increased timeout to give more time for snap to initialize
    };
    
    // Improved error handling
    script.onerror = () => {
      console.error('Error loading Midtrans Snap script');
      clearTimeout(timeoutId);
      
      // Try one more time with a different approach
      console.log('Retrying script load with alternative method...');
      
      // Remove the failed script
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
      
      // Create a new script with slightly different attributes
      const retryScript = document.createElement('script');
      retryScript.src = isSandbox 
        ? 'https://app.sandbox.midtrans.com/snap/snap.js' 
        : 'https://app.midtrans.com/snap/snap.js';
      retryScript.setAttribute('data-client-key', clientKey);
      retryScript.async = true;
      retryScript.type = 'text/javascript';
      
      retryScript.onload = () => {
        console.log('Midtrans Snap script loaded successfully on retry');
        clearTimeout(timeoutId);
        
        setTimeout(() => {
          if (window.snap) {
            console.log('window.snap is now available after retry');
            resolve();
          } else {
            console.error('window.snap not available after retry');
            reject(new Error('Midtrans Snap initialization failed after retry'));
          }
        }, 1500);
      };
      
      retryScript.onerror = () => {
        console.error('Error loading Midtrans Snap script on retry');
        clearTimeout(timeoutId);
        reject(new Error('Failed to load Midtrans script after retry'));
      };
      
      document.head.appendChild(retryScript);
    };
    
    // Set timeout for script loading
    timeoutId = setTimeout(() => {
      console.error('Midtrans script loading timeout');
      reject(new Error('Midtrans script loading timeout'));
    }, 10000);
    
    document.head.appendChild(script);
    
    // Add global callback function
    window.handleMidtransResponse = function(result) {
      console.log('Transaction status:', result.status_code);
      console.log('Transaction ID:', result.transaction_id);
    };
  });
};

// Get Midtrans client key from backend
export const getMidtransClientKey = async () => {
  try {
    const response = await fetch('/api/payment/client-key');
    
    if (!response.ok) {
      throw new Error('Failed to get Midtrans client key');
    }
    
    const data = await response.json();
    return data.clientKey;
  } catch (error) {
    console.error('Error getting Midtrans client key:', error);
    throw error;
  }
};

// Create payment transaction
export const createPaymentTransaction = async (customerDetails) => {
  try {
    console.log('Creating payment transaction with details:', customerDetails);
    
    const response = await fetch('/api/payment/create-transaction', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        ...customerDetails,
        plan: 'premium',
        amount: 99000, // Premium plan price
        currency: 'IDR'
      })
    });
    
    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('Payment transaction creation failed:', errorData);
      throw new Error(errorData.error || 'Failed to create payment transaction');
    }
    
    const data = await response.json();
    console.log('Raw response data:', data);
    console.log('Data structure check - data:', !!data);
    console.log('Data structure check - data.data:', !!data.data);
    console.log('Data structure check - data.data.token:', !!data?.data?.token);
    console.log('Data structure check - data.token:', !!data?.token);
    console.log('Payment transaction created successfully:', data);
    
    return data;
  } catch (error) {
    console.error('Error creating payment transaction:', error);
    throw error;
  }
};

// Open Midtrans Snap payment popup
export const openSnapPayment = async (token) => {
  if (typeof window === 'undefined') {
    console.error('Window is not defined');
    return Promise.reject(new Error('Window is not defined'));
  }

  console.log('Opening Snap payment with token:', token);
  // Ensure Midtrans is initialized
  try {
    await initMidtrans();
    
    // Wait for window.snap to be available
    let attempts = 0;
    const maxAttempts = 15; // Increased attempts
    
    while (!window.snap && attempts < maxAttempts) {
      console.log(`Waiting for window.snap to be available (attempt ${attempts + 1}/${maxAttempts})...`);
      await new Promise(resolve => setTimeout(resolve, 1000)); // Increased wait time
      attempts++;
    }
    
  } catch (error) {
    console.error('Failed to initialize Midtrans:', error);
    return Promise.reject({ success: false, error: 'Payment service initialization failed' });
  }

  // Double check that snap is available
  if (!window.snap) {
    console.error('window.snap is still not available after initialization');
    
    // Last resort: try to reload the script manually
    try {
      console.log('Attempting to reload Midtrans script as last resort...');
      
      // Remove any existing scripts
      const existingScripts = document.querySelectorAll('script[src*="snap.js"]');
      existingScripts.forEach(s => s.remove());
      
      // Force reload the script
      const lastResortScript = document.createElement('script');
      const isSandbox = !process.env.NEXT_PUBLIC_MIDTRANS_ENV || process.env.NEXT_PUBLIC_MIDTRANS_ENV === 'sandbox';
      const clientKey = process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY;
      
      lastResortScript.src = isSandbox 
        ? 'https://app.sandbox.midtrans.com/snap/snap.js' 
        : 'https://app.midtrans.com/snap/snap.js';
      lastResortScript.setAttribute('data-client-key', clientKey);
      lastResortScript.type = 'text/javascript';
      
      document.head.appendChild(lastResortScript);
      
      // Wait for it to load
      await new Promise(resolve => {
        lastResortScript.onload = resolve;
        setTimeout(resolve, 3000); // Timeout after 3 seconds
      });
      
      // Check again
      if (!window.snap) {
        return Promise.reject({ success: false, error: 'Payment service is not ready after multiple attempts' });
      }
    } catch (err) {
      console.error('Last resort loading failed:', err);
      return Promise.reject({ success: false, error: 'Payment service is not ready' });
    }
  }  return new Promise((resolve, reject) => {
    try {
      // Check token validity
      if (!token || typeof token !== 'string' || token.trim() === '') {
        console.error('Invalid token provided:', token);
        reject({ success: false, error: 'Invalid payment token' });
        return;
      }
      
      console.log('Calling window.snap.pay with token:', token);
      
      // Make sure window.snap.pay is a function
      if (typeof window.snap.pay !== 'function') {
        console.error('window.snap.pay is not a function');
        reject({ success: false, error: 'Payment service is not properly initialized' });
        return;
      }
      
      // Add a small delay before calling snap.pay
      setTimeout(() => {
        try {
          // Define callbacks before calling snap.pay
          const onSuccessCallback = function(result) {
            console.log('Payment success:', result);
            resolve({ success: true, data: result });
          };
          
          const onPendingCallback = function(result) {
            console.log('Payment pending:', result);
            // Extract VA number and bank info
            let message = 'Menunggu pembayaran...';
            if (result.va_numbers && result.va_numbers.length > 0) {
              const va = result.va_numbers[0];
              message = `${va.bank.toUpperCase()} Virtual Account: ${va.va_number}\n\n` +
                (document.documentElement.lang === 'id' 
                  ? 'Silakan transfer ke nomor VA tersebut untuk menyelesaikan pembayaran.'
                  : 'Please transfer to this VA number to complete your payment.');
            }
            resolve({ 
              success: true, 
              status: 'pending', 
              data: result,
              message: message
            });
          };
          
          const onErrorCallback = function(result) {
            console.error('Payment error:', result);
            reject({ 
              success: false, 
              error: result.message || 'Payment failed'
            });
          };
          
          const onCloseCallback = function() {
            // Only reject if payment hasn't been initiated
            if (!window.snap.isPaymentProcessing) {
              console.log('Customer closed the payment popup without finishing payment');
              reject({ success: false, error: 'Payment popup closed' });
            }
          };
          
          // Call snap.pay with defined callbacks
          window.snap.pay(token, {
            onSuccess: onSuccessCallback,
            onPending: onPendingCallback,
            onError: onErrorCallback,
            onClose: onCloseCallback,
            language: document.documentElement.lang === 'id' ? 'id' : 'en'
          });
        } catch (innerError) {
          console.error('Error inside snap.pay call:', innerError);
          reject({ success: false, error: 'Error calling payment service: ' + (innerError.message || 'Unknown error') });
        }
      }, 1000); // Increased delay to 1000ms
    } catch (error) {
      console.error('Error when setting up snap.pay:', error);
      reject({ success: false, error: 'Error initiating payment: ' + (error.message || 'Unknown error') });
    }
  });
};

// Process payment for premium plan upgrade
export const processPremiumUpgrade = async (user) => {
  try {
    if (!user || !user.email) {
      throw new Error('User information is required');
    }
    
    console.log('Processing premium upgrade for user:', user.email);
    
    // Create payment transaction
    const transaction = await createPaymentTransaction({
      email: user.email,
      name: user.name || 'User',
      plan: 'premium'
    });
    
    if (!transaction.data || !transaction.data.token) {
      console.error('Invalid transaction response:', transaction);
      throw new Error('Failed to create payment transaction: No token received');
    }
    
    console.log('Transaction created successfully, token received');
    
    // Open Snap payment popup and return the result
    return await openSnapPayment(transaction.data.token);
  } catch (error) {
    console.error('Error processing payment:', error);
    // Properly format the error for the calling code
    return {
      success: false,
      error: error.message || 'An error occurred during payment processing'
    };
  }
};
