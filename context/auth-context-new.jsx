'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const { data: session, status } = useSession();
  const [user, setUser] = useState(null);
  const loading = status === 'loading';

  useEffect(() => {
    if (session?.user) {
      // Fetch full user profile from database
      fetchUserProfile();
    } else {
      setUser(null);
    }
  }, [session]);

  const fetchUserProfile = async () => {
    try {
      const response = await fetch('/api/auth/profile');
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
      }
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
    }
  };

  const classify = async (imageData, location = null) => {
    if (!session) {
      return { success: false, error: 'Authentication required' };
    }

    try {
      const response = await fetch('/api/classify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ imageData, location }),
      });

      const data = await response.json();

      if (response.ok) {
        // Update user data to reflect new usage
        await fetchUserProfile();
        return { success: true, data };
      } else {
        return { success: false, error: data.error, statusCode: response.status };
      }
    } catch (error) {
      return { success: false, error: 'Network error' };
    }
  };

  const upgradePlan = async (plan) => {
    if (!session) {
      return { success: false, error: 'Authentication required' };
    }

    try {
      const response = await fetch('/api/upgrade', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ plan }),
      });

      const data = await response.json();

      if (response.ok) {
        setUser(data.user);
        return { success: true, data };
      } else {
        return { success: false, error: data.error };
      }
    } catch (error) {
      return { success: false, error: 'Network error' };
    }
  };

  const value = {
    user,
    loading,
    session,
    classify,
    upgradePlan,
    isAuthenticated: !!session,
    refreshUser: fetchUserProfile
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
