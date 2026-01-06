'use client';

import { useState, useRef, useEffect } from 'react';
import { signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/models/auth-context';
import { useLanguage } from '@/models/language-context';
import { Button } from '@/components/ui/button';
import {
  AlertDialog, AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog';
import { useSession } from 'next-auth/react';
import {
  User, Mail, ArrowRight, Zap,
  ShieldCheck, LogOut, RefreshCw,
  Trophy, Flame, Target, Sparkles,
  ChevronRight
} from 'lucide-react';

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
  }; const getPlanBadgeColor = (plan) => {
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
      <AlertDialogContent className="sm:max-w-xl p-0 overflow-hidden bg-white/80 backdrop-blur-xl border border-white/20 rounded-[2.5rem] shadow-2xl animate-in zoom-in-95 duration-300">
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500"></div>

        <div className="p-10 space-y-8">
          {/* Header Section */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-2xl flex items-center justify-center border border-emerald-50">
                <User className="w-8 h-8 text-emerald-600" />
              </div>
              <div>
                <h3 className="text-2xl font-black text-gray-900 leading-tight">{user.name}</h3>
                <div className="flex items-center gap-2 text-gray-500 font-bold text-xs uppercase tracking-widest mt-1">
                  <Mail className="w-3.5 h-3.5 text-emerald-500" />
                  {user.email}
                </div>
              </div>
            </div>
            <span className={`px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border shadow-sm transition-all duration-500 ${getPlanBadgeColor(user.plan)}`}>
              {user.plan === 'premium' ? <Sparkles className="w-3 h-3 inline mr-1.5 mb-0.5" /> : null}
              {user.plan ? user.plan : 'FREE'} PLAN
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Usage Stats Card */}
            <div className="relative group overflow-hidden bg-gradient-to-br from-gray-50 to-white p-6 rounded-[2rem] border border-gray-100/50 shadow-sm">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 blur-3xl rounded-full translate-x-12 -translate-y-12"></div>

              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center border border-emerald-100">
                    <Target className="w-5 h-5 text-emerald-600" />
                  </div>
                  <button
                    onClick={handleManualRefresh}
                    className="p-2 hover:bg-white rounded-lg transition-colors text-gray-400 hover:text-emerald-500"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                </div>

                <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">
                  {language === 'id' ? 'Total Klasifikasi' : 'Total Requests'}
                </h4>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black text-gray-900 tracking-tight">
                    {localUsageCount.toLocaleString()}
                  </span>
                  <span className="text-gray-400 font-bold text-sm">/ {getMonthlyLimit(user.plan).toLocaleString()}</span>
                </div>

                <div className="mt-6 space-y-2">
                  <div className="flex justify-between items-end text-[10px] font-black uppercase tracking-widest">
                    <span className="text-emerald-600">{Math.round(localUsageCount / getMonthlyLimit(user.plan) * 100)}% Used</span>
                    <span className="text-gray-400">{getMonthlyLimit(user.plan) - localUsageCount} Left</span>
                  </div>
                  <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden p-0.5 border border-gray-200/50">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ease-out ${(localUsageCount / getMonthlyLimit(user.plan) > 0.9)
                          ? 'bg-gradient-to-r from-red-500 to-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.3)]'
                          : (localUsageCount / getMonthlyLimit(user.plan) > 0.7)
                            ? 'bg-gradient-to-r from-amber-500 to-orange-500 shadow-[0_0_10px_rgba(245,158,11,0.3)]'
                            : 'bg-gradient-to-r from-emerald-500 to-teal-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]'
                        }`}
                      style={{ width: `${getProgressBarWidth(localUsageCount, getMonthlyLimit(user.plan))}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions / Achievements Preview */}
            <div className="bg-gradient-to-br from-emerald-600 to-teal-600 p-6 rounded-[2rem] text-white shadow-xl shadow-emerald-600/20 flex flex-col justify-between relative overflow-hidden group">
              <div className="absolute bottom-0 right-0 w-40 h-40 bg-white/10 blur-3xl rounded-full translate-x-20 translate-y-20 transition-transform duration-700 group-hover:scale-150"></div>

              <div className="relative z-10">
                <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center mb-4">
                  <Trophy className="w-5 h-5 text-emerald-50" />
                </div>
                <h4 className="font-black text-emerald-50/70 text-[10px] uppercase tracking-widest mb-1">Impact Level</h4>
                <p className="text-2xl font-black">Eco Warrior</p>
                <p className="text-emerald-100/70 text-xs font-bold mt-2 leading-tight">
                  {language === 'id'
                    ? 'Terus klasifikasi sampah untuk meningkatkan levelmu!'
                    : 'Keep classifying to level up your environmental impact!'}
                </p>
              </div>
            </div>
          </div>

          {/* Upgrade Section */}
          {(!user.plan || user.plan === 'free') && (
            <div className="bg-emerald-50/50 rounded-[2.5rem] p-8 border border-emerald-100/50 relative group cursor-pointer hover:bg-emerald-50 transition-colors" onClick={handleUpgrade}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-5">
                  <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/10 group-hover:rotate-6 transition-transform">
                    <Zap className="w-7 h-7 text-emerald-500 fill-emerald-500" />
                  </div>
                  <div>
                    <h5 className="font-black text-gray-900 text-lg leading-tight">Go Premium</h5>
                    <p className="text-emerald-700 text-xs font-bold tracking-tight mt-1">
                      10,000 requests & priority support
                    </p>
                  </div>
                </div>
                <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20 group-hover:translate-x-1 transition-transform">
                  <ChevronRight className="w-6 h-6" />
                </div>
              </div>
            </div>
          )}

          {/* Footer Actions */}
          <div className="pt-2 flex items-center gap-4">
            <button
              onClick={onClose}
              className="flex-1 py-4 bg-gray-50 hover:bg-gray-100 text-gray-500 font-black text-xs uppercase tracking-widest rounded-2xl transition-all border border-gray-100"
            >
              {language === 'id' ? 'Tutup' : 'Close Dashboard'}
            </button>
            <button
              onClick={handleLogout}
              className="px-6 py-4 bg-rose-50 hover:bg-rose-100 text-rose-600 font-black text-xs uppercase tracking-widest rounded-2xl transition-all border border-rose-100 flex items-center gap-2 group"
            >
              <LogOut className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              {language === 'id' ? 'Logout' : 'Logout'}
            </button>
          </div>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}
