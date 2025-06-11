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
  const { user, refreshUser } = useAuth();
  const { language } = useLanguage();
  const router = useRouter();
  const dialogRef = useRef(null);
  const { update } = useSession();
  const lastRefreshTime = useRef(0);

  // Only refresh if last refresh was more than 5 seconds ago
  const refreshIfNeeded = async () => {
    const now = Date.now();
    if (now - lastRefreshTime.current > 5000) { // 5 second cooldown
      console.log('User dashboard - Refreshing data...');
      await refreshUser();
      lastRefreshTime.current = now;
    }
  };

  // Initial data load when dashboard opens
  useEffect(() => {
    if (isOpen) {
      refreshIfNeeded();
    }
  }, [isOpen]);

  // Handle click outside to close the dialog 
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
    // First close the dashboard dialog
    onClose();
    
    // Sign out from NextAuth with redirect to the current URL
    try {
      await signOut({ redirect: false });
      window.location.href = '/';
    } catch (error) {
      console.error('Logout error:', error);
      window.location.href = '/';
    }
  };

  const handleUpgrade = () => {
    // Close the dashboard and navigate to confirmation page
    onClose();
    router.push('/payment/confirm');
  };
  const getPlanBadgeColor = (plan) => {
    switch (plan) {
      case 'free': return 'bg-gray-100 text-gray-800 border border-gray-300';
      case 'premium': return 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-sm';
      default: return 'bg-gray-100 text-gray-800 border border-gray-300';
    }
  };

  const getMonthlyLimit = (plan) => {
    switch (plan) {
      case 'free': return 30;
      case 'premium': return 10000;
      default: return 30;
    }
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
          {/* User Info */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-lg">{user.name}</h3>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPlanBadgeColor(user.plan)}`}>
                {user.plan.toUpperCase()}
              </span>
            </div>
            <p className="text-gray-600 text-sm">{user.email}</p>
          </div>

          {/* Usage Statistics */}
          <div className="bg-green-50 rounded-lg p-4">
            <h4 className="font-semibold mb-3">
              {language === 'id' ? 'Penggunaan Bulan Ini' : "This Month's Usage"}
            </h4>
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-gray-600">
                {language === 'id' ? 'Klasifikasi' : 'Classifications'}:
              </span>
              <span className="font-semibold text-lg">
                {(user.usageCount || 0).toLocaleString()} / {getMonthlyLimit(user.plan).toLocaleString()}
              </span>
            </div>

            {/* Usage Progress Bar */}
            <div className="space-y-2">
              <div className="bg-gray-200 rounded-full h-3">
                <div
                  className="h-3 rounded-full bg-gradient-to-r from-green-500 to-green-600 transition-all duration-300"
                  style={{ width: `${Math.min((user.usageCount || 0) / getMonthlyLimit(user.plan) * 100, 100)}%` }}
                />
              </div>
              <div className="flex justify-between items-center text-xs text-gray-500">
                <span>
                  {(getMonthlyLimit(user.plan) - (user.usageCount || 0)).toLocaleString()} 
                  {language === 'id' ? ' tersisa' : ' remaining'}
                </span>
                <span>
                  {Math.round((user.usageCount || 0) / getMonthlyLimit(user.plan) * 100)}%
                  {language === 'id' ? ' terpakai' : ' used'}
                </span>
              </div>
            </div>
          </div>

          {/* Upgrade Option - Only show for free users */}
          {user.plan === 'free' && (
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

          {/* Logout Button */}
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