'use client';

import { useEffect } from 'react';

export function MidtransProvider({ children }) {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const isProduction = false;
    const clientKey = process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY;
    
    if (!clientKey) {
      console.error('NEXT_PUBLIC_MIDTRANS_CLIENT_KEY not found in environment variables');
      return;
    }
    
    const existingScript = document.querySelector('script[src*="snap.js"]');
    if (existingScript) {
      console.log('Found existing Midtrans script, removing it');
      existingScript.remove();
    }
    
    console.log('Loading Midtrans script with client key:', clientKey);
    
    const script = document.createElement('script');
    script.src = isProduction 
      ? 'https://app.midtrans.com/snap/snap.js'
      : 'https://app.sandbox.midtrans.com/snap/snap.js';
    script.setAttribute('data-client-key', clientKey);
    script.setAttribute('type', 'text/javascript');
    script.async = true;
    
    script.onload = () => {
      console.log('MidtransProvider: Snap script loaded successfully');
    };
    script.onerror = (error) => {
      console.error('MidtransProvider: Failed to load Midtrans script', error);
    };
    
    document.head.appendChild(script);
    
    return () => {
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, []);

  return <>{children}</>;
}
