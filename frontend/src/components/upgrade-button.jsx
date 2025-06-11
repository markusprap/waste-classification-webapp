'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

/**
 * Upgrade to Premium button component
 * Displays a button that redirects to the payment process page
 */
export default function UpgradeButton({ className }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
    const handleUpgrade = async () => {
    setLoading(true);
    router.push('/payment/confirm');
  };
  
  return (    <Button 
      onClick={handleUpgrade} 
      disabled={loading}
      className={`${className} bg-black hover:bg-gray-800 text-white`}
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
  );
}
