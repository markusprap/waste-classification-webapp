'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/models/auth-context';
import { useLanguage } from '@/models/language-context';
import { Button } from '@/components/ui/button';

export default function PaymentSuccess() {
  const router = useRouter();
  const { refreshUser } = useAuth();
  const { language } = useLanguage();
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    // Refresh user data to get updated plan
    refreshUser();
    
    // Redirect to homepage after 5 seconds
    const timer = setInterval(() => {
      setCountdown((prevCount) => {
        if (prevCount <= 1) {
          clearInterval(timer);
          router.push('/');
          return 0;
        }
        return prevCount - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [router, refreshUser]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="w-full max-w-md rounded-lg border border-green-200 bg-white p-6 shadow-lg">
        <div className="flex flex-col items-center text-center">
          <div className="mb-4 rounded-full bg-green-100 p-3">
            <svg 
              className="h-8 w-8 text-green-600" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth="2" 
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h1 className="mb-2 text-2xl font-bold text-gray-900">
            {language === 'id' ? 'Pembayaran Berhasil!' : 'Payment Successful!'}
          </h1>
          <p className="mb-6 text-gray-600">
            {language === 'id' 
              ? 'Terima kasih! Akun Anda telah diupgrade ke Premium.' 
              : 'Thank you! Your account has been upgraded to Premium.'}
          </p>
          
          <Button 
            onClick={() => router.push('/')}
            className="w-full"
          >
            {language === 'id' 
              ? `Kembali ke Beranda (${countdown})` 
              : `Return to Home (${countdown})`}
          </Button>
        </div>
      </div>
    </div>
  );
}
