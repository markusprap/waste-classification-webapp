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
    (async () => {
      try {
        console.log('Refreshing user data...');
        await refreshUser();
      } catch (err) {
        console.error('Error refreshing user data:', err);
      }
    })();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        const newCount = prev - 1;
        if (newCount <= 0) {
          clearInterval(timer);
          setTimeout(() => {
            router.push('/');
          }, 300);
        }
        return newCount;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [router]);

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
          
          <p className="mb-4 text-gray-600">
            {language === 'id' 
              ? 'Terima kasih! Akun Anda telah diupgrade ke Premium.' 
              : 'Thank you! Your account has been upgraded to Premium.'}
          </p>
          
          <div className="mb-6 w-full rounded-lg bg-green-50 p-4 text-left">
            <h3 className="font-medium text-green-800">
              {language === 'id' ? 'Manfaat Premium Anda:' : 'Your Premium Benefits:'}
            </h3>
            <ul className="mt-2 list-inside list-disc text-sm text-green-700">
              {language === 'id' ? (
                <>
                  <li>Tidak ada batasan klasifikasi sampah</li>
                  <li>Akses ke semua fitur premium</li>
                  <li>Dukungan prioritas</li>
                </>
              ) : (
                <>
                  <li>Unlimited waste classifications</li>
                  <li>Access to all premium features</li>
                  <li>Priority support</li>
                </>
              )}
            </ul>
          </div>

          <Button
            onClick={() => router.push('/')}
            className="mt-4 w-full bg-black hover:bg-gray-800 text-white"
          >
            {language === 'id' 
              ? `Kembali ke Beranda (${countdown})` 
              : `Back to Home (${countdown})`}
          </Button>
        </div>
      </div>
    </div>
  );
}
