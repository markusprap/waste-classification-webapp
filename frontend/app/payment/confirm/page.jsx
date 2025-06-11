'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { processPremiumUpgrade } from '@/services/midtransService';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Check, Shield } from 'lucide-react';

export default function PaymentConfirmPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(true);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session) {
      router.push('/signin');
      return;
    }
    
    setLoading(false);
  }, [session, status, router]);
  
  const handlePayNow = async () => {
    try {
      setProcessingPayment(true);
      setError(null);
      
      // Process payment for premium upgrade directly
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
  
  const handleCancel = () => {
    router.push('/');
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
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Confirm Premium Upgrade
          </CardTitle>
          <CardDescription>
            Review your premium upgrade details before proceeding to payment
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="rounded-lg bg-muted p-4">              <h3 className="text-lg font-medium mb-2">Premium Benefits</h3>
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Unlimited waste classifications</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Detailed waste disposal guides</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Priority access to new features</span>
                </li>
              </ul>
            </div>
              <div className="flex justify-between items-center border-b pb-2">
              <span>Premium Plan (1 Month)</span>
              <span>Rp 99.000</span>
            </div>
              <div className="border-t pt-2 font-medium flex justify-between">
              <span>Total</span>
              <span>Rp 99.000</span>
            </div>
            
            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">
                {error}
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-2">
          <Button 
            className="w-full bg-black hover:bg-gray-800 text-white" 
            onClick={handlePayNow}
            disabled={processingPayment}
          >
            {processingPayment ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing Payment...
              </>
            ) : (
              'Proceed to Payment'
            )}
          </Button>
          <Button 
            className="w-full" 
            variant="outline"
            onClick={handleCancel}
            disabled={processingPayment}
          >
            Cancel
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
