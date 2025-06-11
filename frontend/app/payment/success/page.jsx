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
  const [countdown, setCountdown] = useState(5);  useEffect(() => {
    // Add delay before refreshing user data to ensure backend has processed the payment
    const refreshUserData = async () => {
      try {
        console.log('Payment success - Waiting for backend to process payment...');
        // Initial delay to allow webhook processing
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        console.log('Payment success - Starting refresh cycle...');
        // Refresh user data up to 5 times with increasing delays
        let attempts = 0;
        let userData = null;
        const delays = [2000, 3000, 5000, 8000, 13000]; // Fibonacci-like delays
        
        while (attempts < delays.length && (!userData || userData.plan !== 'premium')) {
          attempts++;
          console.log(`Payment success - Refresh attempt ${attempts}/${delays.length}...`);
          
          userData = await refreshUser();
          
          if (userData && userData.plan === 'premium') {
            console.log('Payment success - User data updated to premium!');
            break;
          } else {
            console.log(`Payment success - User plan not updated yet (${userData?.plan || 'unknown'}), waiting...`);            // Wait with increasing delay before next attempt
            if (attempts < delays.length) {
              console.log(`Payment success - Waiting ${delays[attempts]/1000}s before next attempt...`);
              await new Promise(resolve => setTimeout(resolve, delays[attempts]));
            }
          }
        }
        
        if (!userData || userData.plan !== 'premium') {
          console.warn('Payment success - User plan still not updated after multiple attempts');
        }
      } catch (err) {
        console.error('Error refreshing user data:', err);
      }
    };
    
    refreshUserData();
    
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
          <p className="mb-4 text-gray-600">
            {language === 'id' 
              ? 'Terima kasih! Akun Anda telah diupgrade ke Premium.' 
              : 'Thank you! Your account has been upgraded to Premium.'}
          </p>
          
          <div className="mb-6 w-full rounded-lg bg-green-50 p-4 text-left">
            <h3 className="font-medium text-green-800">
              {language === 'id' ? 'Manfaat Premium Anda:' : 'Your Premium Benefits:'}
            </h3>            <ul className="mt-2 list-inside list-disc text-sm text-green-700">
              <li>{language === 'id' ? 'Klasifikasi sampah tanpa batas' : 'Unlimited waste classifications'}</li>
              <li>{language === 'id' ? 'Panduan pembuangan sampah terperinci' : 'Detailed waste disposal guides'}</li>
              <li>{language === 'id' ? 'Akses prioritas ke fitur baru' : 'Priority access to new features'}</li>
            </ul>
          </div>
            <Button 
            onClick={() => router.push('/')}
            className="w-full bg-black hover:bg-gray-800 text-white"
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
