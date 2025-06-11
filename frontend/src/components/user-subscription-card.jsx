'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function UserSubscriptionCard() {
  const { data: session } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
  const isPremium = session?.user?.plan === 'premium';
  const usageCount = session?.user?.usageCount || 0;
  const usageLimit = session?.user?.usageLimit || 30;
  const usagePercentage = Math.min(100, Math.round((usageCount / usageLimit) * 100));
  
  const handleUpgrade = () => {
    setLoading(true);
    router.push('/payment/process');
  };
  
  return (
    <Card className="shadow-md">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <CardTitle className="text-xl">Your Subscription</CardTitle>
          <Badge variant={isPremium ? 'premium' : 'secondary'}>
            {isPremium ? 'Premium' : 'Free'}
          </Badge>
        </div>
        <CardDescription>
          {isPremium 
            ? 'Enjoy unlimited waste classifications' 
            : 'Upgrade to unlock unlimited classifications'}
        </CardDescription>
      </CardHeader>
      <CardContent className="pb-3">
        <div className="space-y-4">
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-sm font-medium">Usage this month</span>
              <span className="text-sm font-medium">{usageCount} / {isPremium ? '∞' : usageLimit}</span>
            </div>
            {!isPremium && (
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-primary rounded-full h-2" 
                  style={{ width: `${usagePercentage}%` }}
                ></div>
              </div>
            )}
          </div>
          
          {!isPremium && (
            <div className="rounded-md bg-amber-50 p-3 text-sm text-amber-800">
              {usageCount >= usageLimit 
                ? 'You have reached your monthly limit. Upgrade to continue classifying waste.' 
                : `You have ${usageLimit - usageCount} classifications remaining this month.`}
            </div>
          )}
          
          {isPremium && (
            <div className="rounded-md bg-green-50 p-3 text-sm text-green-800">
              You have premium access with unlimited waste classifications.
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter>
        {!isPremium && (
          <Button 
            onClick={handleUpgrade} 
            disabled={loading}
            className="w-full"
            variant="premium"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              'Upgrade to Premium'
            )}
          </Button>
        )}
        
        {isPremium && (
          <div className="w-full text-center text-sm text-gray-500">
            Your premium plan is active
          </div>
        )}
      </CardFooter>
    </Card>
  );
}
