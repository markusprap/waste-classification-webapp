'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { processPremiumUpgrade } from '@/services/midtransService';

export default function PremiumUpgradeButton({ user }) {
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const handleUpgradeClick = async () => {
    try {
      setIsProcessing(true);
      setError(null);
      
      // Instead of processing payment immediately, redirect to confirmation page
      router.push('/payment/confirm');
    } catch (err) {
      console.error('Upgrade initiation failed:', err);
      setError(err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div>      <button
        onClick={handleUpgradeClick}
        disabled={isProcessing}
        className="rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 px-4 py-2 text-white disabled:opacity-50 transition-all duration-300 transform hover:scale-105 shadow-lg"
      >
        {isProcessing ? 'Processing...' : 'Upgrade to Premium'}
      </button>
      
      {error && (
        <div className="mt-2 rounded-lg bg-red-100 p-2 text-sm text-red-600">
          {error}
        </div>
      )}
    </div>
  );
}
