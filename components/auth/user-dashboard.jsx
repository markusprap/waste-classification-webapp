'use client';

import { useState } from 'react';
import { signOut } from 'next-auth/react';
import { useAuth } from '@/context/auth-context';
import { useLanguage } from '@/context/language-context';
import { Button } from '@/components/ui/button';
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle 
} from '@/components/ui/alert-dialog';
import AnalyticsDashboard from './analytics-dashboard';

export default function UserDashboard({ isOpen, onClose }) {
  const { user, session, upgradePlan } = useAuth();
  const { language } = useLanguage();
  const [upgrading, setUpgrading] = useState(false);
  const [upgradeError, setUpgradeError] = useState('');
  const [upgradeSuccess, setUpgradeSuccess] = useState('');
  const [showAnalytics, setShowAnalytics] = useState(false);  const handleLogout = async () => {
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
      case 'corporate': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getDailyLimit = (plan) => {
    switch (plan) {
      case 'free': return 5;
      case 'premium': return 50;
      case 'corporate': return 'unlimited';
      default: return 5;
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
      <AlertDialogContent className="sm:max-w-lg">
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
              {language === 'id' ? 'Penggunaan Hari Ini' : 'Today\'s Usage'}
            </h4>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">
                {language === 'id' ? 'Klasifikasi' : 'Classifications'}:
              </span>              <span className="font-semibold">
                {user.usageCount || 0} / {getDailyLimit(user.plan)}
              </span>
            </div>
            
            {user.plan === 'free' && (
              <div className="mt-2">
                <div className="bg-gray-200 rounded-full h-2">                  <div 
                    className="bg-green-600 h-2 rounded-full" 
                    style={{ width: `${Math.min((user.usageCount || 0) / 5 * 100, 100)}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {5 - (user.usageCount || 0)} {language === 'id' ? 'klasifikasi tersisa' : 'classifications remaining'}
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
                
                {user.plan === 'corporate' && (
                  <Button
                    onClick={() => window.open('/api/export?format=csv', '_blank')}
                    variant="outline"
                    className="w-full justify-start"
                  >
                    {language === 'id' ? '📄 Export Data' : '📄 Export Data'}
                  </Button>
                )}
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
                  <div className="flex justify-between items-center">
                    <div>
                      <h5 className="font-medium">Premium Plan</h5>
                      <p className="text-sm text-gray-600">
                        {language === 'id' ? '50 klasifikasi/hari' : '50 classifications/day'}
                      </p>
                    </div>
                    <Button
                      onClick={() => handleUpgrade('premium')}
                      disabled={upgrading}
                      size="sm"
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      {language === 'id' ? 'Upgrade' : 'Upgrade'}
                    </Button>
                  </div>
                </div>

                <div className="border rounded-lg p-3 hover:bg-purple-50 transition-colors">
                  <div className="flex justify-between items-center">
                    <div>
                      <h5 className="font-medium">Corporate Plan</h5>
                      <p className="text-sm text-gray-600">
                        {language === 'id' ? 'Klasifikasi unlimited' : 'Unlimited classifications'}
                      </p>
                    </div>
                    <Button
                      onClick={() => handleUpgrade('corporate')}
                      disabled={upgrading}
                      size="sm"
                      className="bg-purple-600 hover:bg-purple-700 text-white"
                    >
                      {language === 'id' ? 'Upgrade' : 'Upgrade'}
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
        </div>        <AlertDialogFooter className="flex flex-col gap-2">
          <Button
            onClick={handleLogout}
            variant="destructive"
            className="w-full"
          >
            {language === 'id' ? 'Keluar' : 'Logout'}
          </Button>
          
          <AlertDialogAction
            onClick={onClose}
            className="bg-gray-100 hover:bg-gray-200 text-gray-800"
          >
            {language === 'id' ? 'Tutup' : 'Close'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
