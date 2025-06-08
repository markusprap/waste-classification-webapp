'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const { data: session, status } = useSession();
  const [user, setUser] = useState(null);
  const loading = status === 'loading';

  useEffect(() => {
    console.log('🔐 Auth context - Session status:', status);
    console.log('🔐 Auth context - Session data:', session);
    
    if (session?.user) {
      console.log('🔐 Auth context - User found in session, fetching profile...');
      // Fetch full user profile from database
      fetchUserProfile();
    } else {
      console.log('🔐 Auth context - No user in session, setting user to null');
      setUser(null);
    }
  }, [session]);
  const fetchUserProfile = async () => {
    try {
      console.log('🔐 Auth context - Fetching user profile...');
      const response = await fetch('/api/auth/profile');
      
      if (response.ok) {
        const data = await response.json();
        console.log('🔐 Auth context - User profile fetched:', data.user);
        setUser(data.user);
      } else {
        console.error('🔐 Auth context - Failed to fetch user profile:', response.status, response.statusText);
        // Don't set user to null here, as the session still exists
      }
    } catch (error) {
      console.error('🔐 Auth context - Error fetching user profile:', error);
      // Don't set user to null here, as the session still exists
    }
  };
  const classify = async (imageData, location = null) => {
    console.log('🔍 Auth context - Classify method called');
    
    if (!session) {
      console.log('🔍 Auth context - No session, returning authentication error');
      return { success: false, error: 'Authentication required' };
    }

    try {
      console.log('🔍 Auth context - Sending classification request...');
      const response = await fetch('/api/classify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ imageData, location }),
      });

      const data = await response.json();
      console.log('🔍 Auth context - Classification response status:', response.status);

      if (response.ok) {
        console.log('🔍 Auth context - Classification successful, updating user data');
        // Update user data to reflect new usage
        await fetchUserProfile();
        return { success: true, data };
      } else {
        console.error('🔍 Auth context - Classification failed:', data.error);
        return { success: false, error: data.error || 'Unknown error', statusCode: response.status };
      }
    } catch (error) {
      console.error('🔍 Auth context - Classification network error:', error);
      return { success: false, error: error.message || 'Network error' };
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
