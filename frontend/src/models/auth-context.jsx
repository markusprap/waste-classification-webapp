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
  const { data: session, status, update } = useSession();
  const [user, setUser] = useState(null);
  const loading = status === 'loading';

  useEffect(() => {
    initMidtrans();
  }, []);

  useEffect(() => {
    if (session?.user) {
      setUser(session.user);
    } else if (status === 'unauthenticated') {
      setUser(null);
    }
  }, [session, status]);

  const classify = async (imageData, location = null) => {
    if (!session) {
      return { success: false, error: 'Authentication required' };
    }

    try {
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
      return {
        success: false,
        error: 'Network error during classification'
      };
    }
  };

  const upgradeUser = async (plan) => {
    if (!session?.user?.email) {
      return { success: false, error: 'User not authenticated' };
    }

    try {
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
      });

      if (!response.ok) {
        const errorText = await response.text();
        try {
          const errorJson = JSON.parse(errorText);
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
      
      if (!result.success || !result.token) {
        return {
          success: false,
          error: result.error || 'Failed to create payment transaction'
        };
      }

      try {
        if (typeof window !== 'undefined' && !window.snap) {
          await initMidtrans();
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
        
        const paymentResult = await openSnapPayment(result.token);
        
        if (paymentResult && paymentResult.success) {
          try {
            await refreshUser();
            const userResponse = await fetch('/api/auth/profile');
            if (userResponse.ok) {
              const userData = await userResponse.json();
              if (userData.user?.plan !== plan) {
                return {
                  success: false,
                  error: 'Plan update failed. Please contact support.'
                };
              }
            }
          } catch (refreshError) {
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
          return {
            success: false,
            error: (paymentResult && paymentResult.error) || 'Payment failed'
          };
        }
      } catch (snapError) {
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
      return {
        success: false,
        error: 'Network error during payment processing'
      };
    }
  };

  const refreshUser = async () => {
    try {
      if (!session?.user?.id) {
        return null;
      }
      
      if (typeof update === 'function') {
        try {
          await update();
        } catch (updateError) {
        }
      }
      
      const maxRetries = 3;
      const retryDelay = 1000;
      
      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
          const timestamp = new Date().getTime();
          const userResponse = await fetch(
            `/api/auth/user/${session.user.id}?t=${timestamp}`,
            { 
              headers: { 
                'Cache-Control': 'no-cache, no-store, must-revalidate',
                'Pragma': 'no-cache',
                'Expires': '0',
                'Content-Type': 'application/json'
              },
              credentials: 'same-origin',
              cache: 'no-store'
            }
          );
          const responseText = await userResponse.text();
          let userData;
          try {
            userData = JSON.parse(responseText);
          } catch (e) {
            throw new Error('Invalid JSON response');
          }

          if (!userResponse.ok) {
            throw new Error(userData.error || `HTTP ${userResponse.status}`);
          }

          if (userData.success && userData.user) {
            setUser(userData.user);
            return userData.user;
          } else {
            throw new Error('Invalid response structure');
          }
        } catch (fetchError) {
          if (attempt < maxRetries) {
            await new Promise(resolve => setTimeout(resolve, retryDelay));
          }
        }
      }
      
      return null;
    } catch (error) {
      return null;
    }
  };

  const refreshUserSession = async () => {
    if (typeof update === 'function') {
      await update();
    }
  };

  const value = {
    isAuthenticated: !!session?.user,
    user: user,
    loading: loading,
    classify,
    upgradeUser,
    refreshUserSession,
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
