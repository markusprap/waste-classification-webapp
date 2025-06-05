"use client"

import { useEffect, useState } from 'react'
import { preloadModel } from '@/lib/tensorflow-model'

export function ModelPreloader() {
  const [modelStatus, setModelStatus] = useState('idle');

  useEffect(() => {
    // Preload the model in the background when the app starts
    const preload = async () => {
      try {
        setModelStatus('loading');
        console.log('🚀 Starting model preload...');
        await preloadModel();
        console.log('✅ Model preloaded successfully');
        setModelStatus('loaded');
      } catch (error) {
        console.warn('⚠️ Model preload failed:', error.message);
        setModelStatus('error');
        // Don't throw error here, as it's just preloading
      }
    }

    // Delay preloading slightly to avoid blocking initial page render
    const timer = setTimeout(preload, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  // This component doesn't render anything
  return null;
}
