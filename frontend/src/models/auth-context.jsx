'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { initMidtrans, openSnapPayment } from '../services/midtransService';

const AuthContext = createContext({
  isAuthenticated: false,
  user: null,
  loading: true,
  classify: null,
  upgradeUser: null
});

export function AuthProvider({ children }) {
  const { data: session, status } = useSession();
  const [user, setUser] = useState(null);
  const loading = status === 'loading';

  // Initialize Midtrans when component mounts
  useEffect(() => {
    initMidtrans();
  }, []);

  useEffect(() => {
    console.log('🔐 Auth context - Session status:', status);
    console.log('🔐 Auth context - Session data:', session);
    
    if (session?.user) {
      console.log('🔐 Auth context - User found in session');
      setUser(session.user);
    } else if (status === 'unauthenticated') {
      console.log('🔐 Auth context - No user in session, setting user to null');
      setUser(null);
    }
  }, [session, status]);

  const classify = async (imageData, location = null) => {
    console.log('Auth context - Classify method called');
    
    if (!session) {
      console.log('Auth context - No session, returning authentication error');
      return { success: false, error: 'Authentication required' };
    }

    try {
      console.log('Auth context - Making classification request...');
      const formData = new FormData();
      formData.append('image', imageData);
      if (location) {
        formData.append('location', JSON.stringify(location));
      }

      const response = await fetch('/api/classify', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();
      console.log('Auth context - Classification result:', result);
      
      if (result.success && result.data) {
        return {
          success: true,
          data: {
            category: result.data.category,
            confidence: result.data.confidence,
            description: result.data.description,
            tips: result.data.tips || [],
            wasteBank: result.data.wasteBank || null
          }
        };
      } else {
        return {
          success: false,
          error: result.error || 'Classification failed'
        };
      }
    } catch (error) {
      console.error('Auth context - Classification error:', error);
      return {
        success: false,
        error: 'Network error during classification'
      };
    }
  };  const upgradeUser = async (plan) => {
    if (!session?.user?.email) {
      console.error('Auth context - No authenticated user found');
      return { success: false, error: 'User not authenticated' };
    }

    try {
      console.log(`Auth context - Initiating plan upgrade to ${plan} for user ${session.user.email}`);
      
      // First, create the payment transaction
      console.log('Auth context - Sending payment request with data:', {
        plan,
        email: session.user.email,
        name: session.user.name || 'User',
      });
      
      const response = await fetch('/api/payment/create-transaction', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          plan,
          email: session.user.email,
          name: session.user.name || 'User',
        }),
      });if (!response.ok) {
        const errorText = await response.text();
        console.error(`Auth context - API error ${response.status}:`, errorText);
        try {
          const errorJson = JSON.parse(errorText);
          // Add helpful information for common errors
          if (errorJson.error && errorJson.error.includes('User verification failed')) {
            return {
              success: false,
              error: 'Account verification failed. Please try logging out and logging in again.'
            };
          }
          return {
            success: false,
            error: errorJson.error || `API error (${response.status})`
          };
        } catch (e) {
          return {
            success: false,
            error: `API error (${response.status}): ${errorText.substring(0, 100)}`
          };
        }
      }
      
      const result = await response.json();
      console.log('Auth context - Payment transaction result:', result);
      
      if (!result.success || !result.token) {
        console.error('Auth context - Invalid transaction result:', result);
        return {
          success: false,
          error: result.error || 'Failed to create payment transaction'
        };
      }

      // Ensure Midtrans is initialized
      try {
        if (typeof window !== 'undefined' && !window.snap) {
          console.log('Auth context - Initializing Midtrans before payment');
          await initMidtrans();
          // Give time for initialization
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
        
        console.log('Auth context - Opening Snap payment with token:', result.token);
        const paymentResult = await openSnapPayment(result.token);
        console.log('Auth context - Payment result:', paymentResult);
        
        if (paymentResult && paymentResult.success) {
          // Refresh user data after successful payment
          try {
            await refreshUser();
            // Double check that the plan was actually updated
            const userResponse = await fetch('/api/auth/profile');
            if (userResponse.ok) {
              const userData = await userResponse.json();
              if (userData.user?.plan !== plan) {
                console.error('Plan update verification failed');
                return {
                  success: false,
                  error: 'Plan update failed. Please contact support.'
                };
              }
            }
          } catch (refreshError) {
            console.error('Auth context - Error verifying plan update:', refreshError);
            return {
              success: false,
              error: 'Could not verify plan update. Please check your account status.'
            };
          }
          
          return {
            success: true,
            status: paymentResult.status || 'success',
            message: paymentResult.message || 'Payment completed successfully! Your account has been upgraded.',
          };
        } else {
          console.error('Auth context - Payment failed:', paymentResult);
          return {
            success: false,
            error: (paymentResult && paymentResult.error) || 'Payment failed'
          };
        }
      } catch (snapError) {
        console.error('Auth context - Midtrans Snap error:', snapError);
        if (snapError.message?.includes('closed') || snapError.message?.includes('cancel')) {
          return {
            success: false,
            error: 'Payment cancelled'
          };
        }
        return {
          success: false,
          error: 'Payment processing failed. Please try again.'
        };
      }
    } catch (error) {
      console.error('Auth context - Error upgrading user:', error);
      return {
        success: false,
        error: 'Network error during payment processing'
      };
    }
  };  const refreshUser = async () => {
    try {
      console.log('Auth context - Refreshing user data...');
      
      if (!session?.user?.id) {
        console.warn('Auth context - No user ID available for refresh');
        return null;
      }
      
      // First update the session to ensure we have latest token
      if (session?.update) {
        try {
          await session.update();
          console.log('Auth context - Session update successful');
        } catch (updateError) {
          console.warn('Auth context - Session update failed:', updateError);
          // Continue with refresh even if session update fails
        }
      }
      
      // Fetch latest user data with retries
      const maxRetries = 3;
      const retryDelay = 1000; // 1 second between retries
      
      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
          // Add cache-busting parameter
          const timestamp = new Date().getTime();
          const userResponse = await fetch(
            `/api/auth/user/${session.user.id}?t=${timestamp}`,
            { headers: { 'Cache-Control': 'no-cache' } }
          );
          
          if (userResponse.ok) {
            const userData = await userResponse.json();
            if (userData.success && userData.user) {
              console.log('Auth context - Updated user data:', userData.user);
              setUser(userData.user);
              return userData.user;
            }
          }
          
          // If we get here, the response wasn't good - wait before retry
          if (attempt < maxRetries) {
            console.log(`Auth context - Refresh attempt ${attempt} failed, retrying in ${retryDelay/1000}s...`);
            await new Promise(resolve => setTimeout(resolve, retryDelay));
          }
        } catch (fetchError) {
          console.error(`Auth context - Error on refresh attempt ${attempt}:`, fetchError);
          if (attempt < maxRetries) {
            await new Promise(resolve => setTimeout(resolve, retryDelay));
          }
        }
      }
      
      console.error('Auth context - All refresh attempts failed');
      return null;
    } catch (error) {
      console.error('Auth context - Unhandled error during refresh:', error);
      return null;
    }
  };

  const value = {
    isAuthenticated: !!session?.user,
    user: user,
    loading: loading,
    classify,
    upgradeUser,
    refreshUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
