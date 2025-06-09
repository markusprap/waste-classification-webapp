'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/models/language-context';
import { Button } from '@/components/ui/button';

export default function PaymentError() {
  const router = useRouter();
  const { language } = useLanguage();
  const [countdown, setCountdown] = useState(10);

  useEffect(() => {
    // Redirect to homepage after 10 seconds
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
      <div className="w-full max-w-md rounded-lg border border-red-200 bg-white p-6 shadow-lg">
        <div className="flex flex-col items-center text-center">
          <div className="mb-4 rounded-full bg-red-100 p-3">
            <svg 
              className="h-8 w-8 text-red-600" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth="2" 
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </div>
          <h1 className="mb-2 text-2xl font-bold text-gray-900">
            {language === 'id' ? 'Pembayaran Gagal' : 'Payment Failed'}
          </h1>
          <p className="mb-2 text-gray-600">
            {language === 'id' 
              ? 'Maaf, pembayaran Anda tidak dapat diproses.' 
              : 'Sorry, your payment could not be processed.'}
          </p>
          <p className="mb-6 text-gray-600">
            {language === 'id' 
              ? 'Silakan coba lagi atau hubungi dukungan pelanggan kami.' 
              : 'Please try again or contact our customer support.'}
          </p>
          
          <div className="flex w-full flex-col gap-2">
            <Button 
              onClick={() => router.push('/')}
              className="w-full"
            >
              {language === 'id' 
                ? `Kembali ke Beranda (${countdown})` 
                : `Return to Home (${countdown})`}
            </Button>
            
            <Button 
              variant="outline"
              onClick={() => router.push('/contact')}
              className="w-full"
            >
              {language === 'id' ? 'Hubungi Dukungan' : 'Contact Support'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
