'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

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
      className={`${className} bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white transition-all duration-300 transform hover:scale-105 shadow-lg`}
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
