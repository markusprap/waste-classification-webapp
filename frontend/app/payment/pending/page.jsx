'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/models/language-context';
import { Button } from '@/components/ui/button';

export default function PaymentPending() {
  const router = useRouter();
  const { language } = useLanguage();
  const [countdown, setCountdown] = useState(10);

  useEffect(() => {
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
  }, [router]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="w-full max-w-md rounded-lg border border-yellow-200 bg-white p-6 shadow-lg">
        <div className="flex flex-col items-center text-center">
          <div className="mb-4 rounded-full bg-yellow-100 p-3">
            <svg 
              className="h-8 w-8 text-yellow-600" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth="2" 
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h1 className="mb-2 text-2xl font-bold text-gray-900">
            {language === 'id' ? 'Pembayaran Tertunda' : 'Payment Pending'}
          </h1>
          <p className="mb-2 text-gray-600">
            {language === 'id' 
              ? 'Pembayaran Anda sedang diproses.' 
              : 'Your payment is being processed.'}
          </p>
          <p className="mb-6 text-gray-600">
            {language === 'id' 
              ? 'Akun Anda akan diupgrade segera setelah pembayaran selesai.' 
              : 'Your account will be upgraded as soon as the payment is completed.'}
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
