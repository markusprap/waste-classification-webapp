'use client';

import { useState, useRef, useEffect } from 'react';
import { signOut } from 'next-auth/react';
import { useAuth } from '@/models/auth-context';
import { useLanguage } from '@/models/language-context';
import { Button } from '@/components/ui/button';
import { 
  AlertDialog, 
  AlertDialogContent, 
  AlertDialogHeader, 
  AlertDialogTitle 
} from '@/components/ui/alert-dialog';
import AnalyticsDashboard from './analytics-dashboard';

export default function UserDashboard({ isOpen, onClose }) {
  const { user, upgradePlan } = useAuth();
  const { language } = useLanguage();
  const [upgrading, setUpgrading] = useState(false);
  const [upgradeError, setUpgradeError] = useState('');
  const [upgradeSuccess, setUpgradeSuccess] = useState('');
  const [showAnalytics, setShowAnalytics] = useState(false);
  const dialogRef = useRef(null);
  
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
      await signOut({ 
        redirect: false
      });
      // After signOut completes, manually redirect to homepage
      window.location.href = '/';
    } catch (error) {
      console.error('Logout error:', error);
      window.location.href = '/';
    }
  };

  const handleUpgrade = async (plan) => {
    setUpgrading(true);
    setUpgradeError('');
    setUpgradeSuccess('');

    const result = await upgradePlan(plan);
    
    if (result.success) {
      setUpgradeSuccess(
        language === 'id' 
          ? `Berhasil upgrade ke plan ${plan}!` 
          : `Successfully upgraded to ${plan} plan!`
      );
    } else {
      setUpgradeError(result.error);
    }
    
    setUpgrading(false);
  };

  const getPlanBadgeColor = (plan) => {
    switch (plan) {
      case 'free': return 'bg-gray-100 text-gray-800';
      case 'premium': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getMonthlyLimit = (plan) => {
    switch (plan) {
      case 'free': return 30;
      case 'premium': return 'unlimited';
      default: return 30;
    }
  };

  if (!isOpen || !user) return null;

  // Show analytics dashboard if requested
  if (showAnalytics) {
    return (
      <AlertDialog open={showAnalytics} onOpenChange={setShowAnalytics}>
        <AlertDialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <AlertDialogHeader>
            <AlertDialogTitle>
              <Button
                onClick={() => setShowAnalytics(false)}
                variant="outline"
                size="sm"
                className="mb-4"
              >
                ← {language === 'id' ? 'Kembali' : 'Back'}
              </Button>
            </AlertDialogTitle>
          </AlertDialogHeader>
          <AnalyticsDashboard />
        </AlertDialogContent>
      </AlertDialog>
    );
  }

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
            <h4 className="font-semibold mb-2">
              {language === 'id' ? 'Penggunaan Bulan Ini' : 'This Month\'s Usage'}
            </h4>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">
                {language === 'id' ? 'Klasifikasi' : 'Classifications'}:
              </span>
              <span className="font-semibold">
                {user.usageCount || 0} / {getMonthlyLimit(user.plan)}
              </span>
            </div>
            
            {user.plan === 'free' && (
              <div className="mt-2">
                <div className="bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-600 h-2 rounded-full" 
                    style={{ width: `${Math.min((user.usageCount || 0) / 30 * 100, 100)}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {30 - (user.usageCount || 0)} {language === 'id' ? 'klasifikasi tersisa' : 'classifications remaining'}
                </p>
              </div>
            )}
          </div>

          {/* Premium Features */}
          {user.plan !== 'free' && (
            <div className="space-y-3">
              <h4 className="font-semibold">
                {language === 'id' ? 'Fitur Premium' : 'Premium Features'}
              </h4>
              
              <div className="grid grid-cols-1 gap-2">
                <Button
                  onClick={() => setShowAnalytics(true)}
                  variant="outline"
                  className="w-full justify-start"
                >
                  {language === 'id' ? '📊 Analytics Dashboard' : '📊 Analytics Dashboard'}
                </Button>
                  <Button
                  onClick={() => window.open('/api/export?format=csv', '_blank')}
                  variant="outline"
                  className="w-full justify-start"
                >
                  {language === 'id' ? '📄 Export Data' : '📄 Export Data'}
                </Button>
                
                <Button
                  onClick={() => window.open('/payment/dashboard', '_blank')}
                  variant="outline"
                  className="w-full justify-start"
                >
                  {language === 'id' ? '💳 Riwayat Pembayaran' : '💳 Payment History'}
                </Button>
              </div>
            </div>
          )}

          {/* Upgrade Options */}
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
                        {language === 'id' ? 'Klasifikasi unlimited per bulan' : 'Unlimited classifications per month'}
                      </p>
                      <p className="text-xs font-medium text-green-600">
                        Rp 10.000 {language === 'id' ? 'per bulan' : 'per month'}
                      </p>
                    </div>
                    <Button
                      onClick={() => handleUpgrade('premium')}
                      disabled={upgrading}
                      size="sm"
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      {upgrading ? (
                        <span className="flex items-center">
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          {language === 'id' ? 'Memproses...' : 'Processing...'}
                        </span>
                      ) : (
                        language === 'id' ? 'Upgrade' : 'Upgrade'
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {upgradeError && (
            <div className="text-red-600 text-sm text-center bg-red-50 p-2 rounded">
              {upgradeError}
            </div>
          )}

          {upgradeSuccess && (
            <div className="text-green-600 text-sm text-center bg-green-50 p-2 rounded">
              {upgradeSuccess}
            </div>
          )}
        </div>
        
        <div className="mt-6">
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
