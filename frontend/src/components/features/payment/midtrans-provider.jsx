'use client';

import { useEffect } from 'react';

export function MidtransProvider({ children }) {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // For development, use sandbox
    const isProduction = process.env.NODE_ENV === 'production';
    const clientKey = process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || 'SB-Mid-client-61XuGAwQ8Bj8LxSS';
    
    // Create script element
    const script = document.createElement('script');
    script.src = isProduction
      ? 'https://app.midtrans.com/snap/snap.js'
      : 'https://app.sandbox.midtrans.com/snap/snap.js';
    script.setAttribute('data-client-key', clientKey);
    script.async = true;
    
    // Add script to document
    document.body.appendChild(script);
    
    // Create container for Snap
    const container = document.createElement('div');
    container.id = 'snap-container';
    container.style.display = 'none';
    document.body.appendChild(container);
    
    return () => {
      // Clean up
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
      if (document.body.contains(container)) {
        document.body.removeChild(container);
      }
    };
  }, []);

  return <>{children}</>;
}
