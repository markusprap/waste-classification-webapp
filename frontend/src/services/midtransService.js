export const generateOrderId = () => {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000);
  return `ORDER-${timestamp}-${random}`;
};

export const initMidtrans = () => {
  if (typeof window === 'undefined') return Promise.resolve();
  
  return new Promise((resolve, reject) => {
    if (window.snap) {
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
    
    const existingScript = document.querySelector('script[src*="snap.js"]');
    if (existingScript) {
      existingScript.remove();
    }

    const script = document.createElement('script');
    script.src = isSandbox 
      ? 'https://app.sandbox.midtrans.com/snap/snap.js' 
      : 'https://app.midtrans.com/snap/snap.js';
    script.setAttribute('data-client-key', clientKey);
    script.async = true;
    script.defer = true;
    script.crossOrigin = "anonymous";
    
    let timeoutId;

    script.onload = () => {
      clearTimeout(timeoutId);
      
      setTimeout(() => {
        if (window.snap) {
          resolve();
        } else {
          reject(new Error('Midtrans Snap initialization failed'));
        }
      }, 1000);
    };
    
    script.onerror = () => {
      console.error('Error loading Midtrans Snap script');
      clearTimeout(timeoutId);
      
      console.log('Retrying script load with alternative method...');
      
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
      
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
    
    timeoutId = setTimeout(() => {
      console.error('Midtrans script loading timeout');
      reject(new Error('Midtrans script loading timeout'));
    }, 10000);
    
    document.head.appendChild(script);
    
    window.handleMidtransResponse = function(result) {
      console.log('Transaction status:', result.status_code);
      console.log('Transaction ID:', result.transaction_id);
    };
  });
};

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
        amount: 99000,
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

export const openSnapPayment = async (token) => {
  if (typeof window === 'undefined') {
    console.error('Window is not defined');
    return Promise.reject(new Error('Window is not defined'));
  }

  console.log('Opening Snap payment with token:', token);

  try {
    await initMidtrans();
    
    let attempts = 0;
    const maxAttempts = 15;
    
    while (!window.snap && attempts < maxAttempts) {
      console.log(`Waiting for window.snap to be available (attempt ${attempts + 1}/${maxAttempts})...`);
      await new Promise(resolve => setTimeout(resolve, 1000));
      attempts++;
    }
    
  } catch (error) {
    console.error('Failed to initialize Midtrans:', error);
    return Promise.reject({ success: false, error: 'Payment service initialization failed' });
  }

  if (!window.snap) {
    console.error('window.snap is still not available after initialization');
    
    try {
      console.log('Attempting to reload Midtrans script as last resort...');
      
      const existingScripts = document.querySelectorAll('script[src*="snap.js"]');
      existingScripts.forEach(s => s.remove());
      
      const lastResortScript = document.createElement('script');
      const isSandbox = !process.env.NEXT_PUBLIC_MIDTRANS_ENV || process.env.NEXT_PUBLIC_MIDTRANS_ENV === 'sandbox';
      const clientKey = process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY;
      
      lastResortScript.src = isSandbox 
        ? 'https://app.sandbox.midtrans.com/snap/snap.js' 
        : 'https://app.midtrans.com/snap/snap.js';
      lastResortScript.setAttribute('data-client-key', clientKey);
      lastResortScript.type = 'text/javascript';
      
      document.head.appendChild(lastResortScript);
      
      await new Promise(resolve => {
        lastResortScript.onload = resolve;
        setTimeout(resolve, 3000);
      });
      
      if (!window.snap) {
        return Promise.reject({ success: false, error: 'Payment service is not ready after multiple attempts' });
      }
    } catch (err) {
      console.error('Last resort loading failed:', err);
      return Promise.reject({ success: false, error: 'Payment service is not ready' });
    }
  }

  return new Promise((resolve, reject) => {
    try {
      if (!token || typeof token !== 'string' || token.trim() === '') {
        console.error('Invalid token provided:', token);
        reject({ success: false, error: 'Invalid payment token' });
        return;
      }
      
      console.log('Calling window.snap.pay with token:', token);
      
      if (typeof window.snap.pay !== 'function') {
        console.error('window.snap.pay is not a function');
        reject({ success: false, error: 'Payment service is not properly initialized' });
        return;
      }
      
      setTimeout(() => {
        try {
          const onSuccessCallback = function(result) {
            console.log('Payment success:', result);
            resolve({ success: true, data: result });
          };
          
          const onPendingCallback = function(result) {
            console.log('Payment pending:', result);
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
            if (!window.snap.isPaymentProcessing) {
              console.log('Customer closed the payment popup without finishing payment');
              reject({ success: false, error: 'Payment popup closed' });
            }
          };
          
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
      }, 1000);
    } catch (error) {
      console.error('Error when setting up snap.pay:', error);
      reject({ success: false, error: 'Error initiating payment: ' + (error.message || 'Unknown error') });
    }
  });
};

export const processPremiumUpgrade = async (user) => {
  try {
    if (!user || !user.email) {
      throw new Error('User information is required');
    }
    
    console.log('Processing premium upgrade for user:', user.email);
    
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
    
    return await openSnapPayment(transaction.data.token);
  } catch (error) {
    console.error('Error processing payment:', error);
    return {
      success: false,
      error: error.message || 'An error occurred during payment processing'
    };
  }
};
