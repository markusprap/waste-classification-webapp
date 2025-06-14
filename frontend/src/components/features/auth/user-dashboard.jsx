'use client';

import { useState, useRef, useEffect } from 'react';
import { signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/models/auth-context';
import { useLanguage } from '@/models/language-context';
import { Button } from '@/components/ui/button';
import { 
  AlertDialog,   AlertDialogContent, 
  AlertDialogHeader, 
  AlertDialogTitle 
} from '@/components/ui/alert-dialog';
import { useSession } from 'next-auth/react';

export default function UserDashboard({ isOpen, onClose }) {
  const { user, refreshUser, refreshUserSession } = useAuth();
  const { language } = useLanguage();
  const router = useRouter();
  const dialogRef = useRef(null);
  const { update } = useSession();
  const lastRefreshTime = useRef(0);
  const [localUsageCount, setLocalUsageCount] = useState(0);
  
  useEffect(() => {
    if (user && typeof user.usageCount === 'number') {
      setLocalUsageCount(user.usageCount);
    }
  }, [user]);

  const refreshIfNeeded = async () => {
    const now = Date.now();
    if (now - lastRefreshTime.current > 5000) {
      console.log('User dashboard - Refreshing data...');
      const updatedUser = await refreshUser();
      if (updatedUser && typeof updatedUser.usageCount === 'number') {
        setLocalUsageCount(updatedUser.usageCount);
      }
      lastRefreshTime.current = now;
    }
  };

  useEffect(() => {
    if (isOpen) {
      refreshIfNeeded();
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      lastRefreshTime.current = 0;
      refreshIfNeeded();
    }
  }, [isOpen]);

  const handleManualRefresh = async () => {
    console.log('Manual refresh requested');
    lastRefreshTime.current = 0;
    await refreshIfNeeded();
  };

  useEffect(() => {
    function handleClickOutside(event) {
      if (dialogRef.current && !dialogRef.current.contains(event.target)) {
        onClose();
      }
    }
    
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  const handleLogout = async () => {
    onClose();
    
    try {
      await signOut({ redirect: false });
      window.location.href = '/';
    } catch (error) {
      console.error('Logout error:', error);
      window.location.href = '/';
    }
  };

  const handleUpgrade = () => {
    onClose();
    router.push('/payment/confirm');
  };  const getPlanBadgeColor = (plan) => {
    if (!plan) return 'bg-gray-100 text-gray-800 border border-gray-300';
    
    switch (plan) {
      case 'free': return 'bg-gray-100 text-gray-800 border border-gray-300';
      case 'premium': return 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-sm';
      default: return 'bg-gray-100 text-gray-800 border border-gray-300';
    }
  };
  const getMonthlyLimit = (plan) => {
    if (!plan) return 30;
    
    switch (plan) {
      case 'free': return 30;
      case 'premium': return 10000;
      default: return 30;
    }
  };
  const getProgressBarWidth = (count, limit) => {
    if (limit >= 10000 && count < 100) {
      return Math.max(1, (count / limit) * 100);
    }
    return Math.min((count / limit) * 100, 100);
  };

  if (!isOpen || !user) return null;

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="sm:max-w-lg" ref={dialogRef}>
        <AlertDialogHeader>
          <AlertDialogTitle className="text-xl font-bold text-center">
            {language === 'id' ? 'Dashboard Pengguna' : 'User Dashboard'}
          </AlertDialogTitle>
        </AlertDialogHeader>

        <div className="space-y-6">
          <div className="bg-gray-50 rounded-lg p-4">            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-lg">{user.name}</h3>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPlanBadgeColor(user.plan)}`}>
                {user.plan ? user.plan.toUpperCase() : 'FREE'}
              </span>
            </div>
            <p className="text-gray-600 text-sm">{user.email}</p>
          </div>          
          <div className="bg-green-50 rounded-lg p-4">            <h4 className="font-semibold mb-3 flex items-center justify-between">
              <span>{language === 'id' ? 'Penggunaan Bulan Ini' : "This Month's Usage"}</span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                (localUsageCount / getMonthlyLimit(user.plan) > 0.9) 
                ? 'bg-red-100 text-red-800 border border-red-300' 
                : (localUsageCount / getMonthlyLimit(user.plan) > 0.7)
                  ? 'bg-amber-100 text-amber-800 border border-amber-300'
                  : 'bg-green-100 text-green-800 border border-green-300'
              }`}>
                {language === 'id' ? 'Batas Klasifikasi' : 'Classification Limit'}
              </span>
            </h4>
            
            <div className="mb-4 text-center">
              <div className="flex items-center justify-center text-3xl font-bold">
                <span className="text-gray-800">{localUsageCount.toLocaleString()}</span>
                <span className="text-gray-400 mx-2">/</span>
                <span className="text-gray-600">{getMonthlyLimit(user.plan).toLocaleString()}</span>
              </div>
              <p className="text-sm text-gray-600 mt-1">
                {language === 'id' ? 'Klasifikasi digunakan' : 'Classifications used'}
              </p>
            </div>

                        <div className="space-y-2">
              <div className="bg-gray-200 rounded-full h-4 p-0.5">
                <div
                  className={`h-3 rounded-full transition-all duration-300 ${
                    (localUsageCount / getMonthlyLimit(user.plan) > 0.9)
                    ? 'bg-gradient-to-r from-red-500 to-red-600'
                    : (localUsageCount / getMonthlyLimit(user.plan) > 0.7)
                      ? 'bg-gradient-to-r from-amber-500 to-amber-600'
                      : 'bg-gradient-to-r from-green-500 to-green-600'
                  }`}
                  style={{ width: `${getProgressBarWidth(localUsageCount, getMonthlyLimit(user.plan))}%` }}
                />
              </div>
              <div className="flex justify-between items-center text-xs text-gray-500">
                <span>
                  <strong className="text-gray-700">
                    {(getMonthlyLimit(user.plan) - localUsageCount).toLocaleString()}
                  </strong>
                  {language === 'id' ? ' tersisa' : ' remaining'}
                </span>
                <span>
                  <strong className="text-gray-700">
                    {Math.round(localUsageCount / getMonthlyLimit(user.plan) * 100)}%
                  </strong>
                  {language === 'id' ? ' terpakai' : ' used'}
                </span>
              </div>
            </div>
          </div>
          {(!user.plan || user.plan === 'free') && (
            <div className="space-y-3">
              <h4 className="font-semibold">
                {language === 'id' ? 'Upgrade Plan Anda' : 'Upgrade Your Plan'}
              </h4>
              <div className="grid grid-cols-1 gap-3">
                <div className="border rounded-lg p-3 hover:bg-blue-50 transition-colors">
                  <div className="flex justify-between items-start">
                    <div>
                      <h5 className="font-medium">Premium Plan</h5>
                      <p className="text-sm text-gray-600 mb-1">
                        {language === 'id' ? '10,000 klasifikasi per bulan' : '10,000 classifications per month'}
                      </p>
                      <p className="text-xs font-medium text-green-600">
                        Rp 99.000 {language === 'id' ? 'per bulan' : 'per month'}
                      </p>
                    </div>
                    <Button
                      onClick={handleUpgrade}
                      size="sm"
                      className="bg-black hover:bg-gray-800 text-white"
                    >
                      {language === 'id' ? 'Upgrade' : 'Upgrade'}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          <Button
            onClick={handleLogout}
            variant="destructive"
            className="w-full"
          >
            {language === 'id' ? 'Keluar' : 'Logout'}
          </Button>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}
