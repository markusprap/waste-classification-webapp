'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { initMidtrans, processPremiumUpgrade } from '@/services/midtransService';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

export default function PaymentProcessPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [processingPayment, setProcessingPayment] = useState(false);
  
  // Initialize Midtrans when component mounts
  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session) {
      router.push('/signin');
      return;
    }
    
    // Initialize Midtrans
    const script = initMidtrans();
    
    // Cleanup function to remove script when component unmounts
    return () => {
      if (script && script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, [session, status, router]);
  
  useEffect(() => {
    if (status === 'loading') return;
    
    if (session) {
      setLoading(false);
    }
  }, [session, status]);
  
  // Handle payment process
  const handlePayment = async () => {
    try {
      setProcessingPayment(true);
      setError(null);
      
      // Process payment for premium upgrade
      const result = await processPremiumUpgrade(session.user);
      
      // Handle payment result
      if (result.success) {
        if (result.status === 'pending') {
          router.push('/payment/pending');
        } else {
          router.push('/payment/success');
        }
      } else {
        setError(result.error || 'Payment failed. Please try again.');
        setProcessingPayment(false);
      }
    } catch (error) {
      console.error('Payment error:', error);
      setError(error.message || 'Payment failed. Please try again.');
      setProcessingPayment(false);
    }
  };
  
  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  return (
    <div className="container max-w-md mx-auto py-12">
      <Card>
        <CardHeader>
          <CardTitle>Upgrade to Premium</CardTitle>
          <CardDescription>
            Unlock unlimited waste classifications with our premium plan
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">            <div className="flex justify-between items-center border-b pb-2">
              <span>Premium Plan (1 Month)</span>
              <span>Rp 10.000</span>
            </div>
            
            <div className="border-t pt-2 font-medium flex justify-between">
              <span>Total</span>
              <span>Rp 10.000</span>
            </div>
            
            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">
                {error}
              </div>
            )}
          </div>
        </CardContent>        <CardFooter>
          <Button 
            className="w-full bg-black hover:bg-gray-800 text-white" 
            onClick={handlePayment} 
            disabled={processingPayment}
          >
            {processingPayment ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              'Pay Now'
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
