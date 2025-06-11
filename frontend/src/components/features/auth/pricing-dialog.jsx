'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/models/auth-context';
import { useLanguage } from '@/models/language-context';
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
import { Check, Crown, Building, Zap, Users, BarChart3, Shield, Headphones } from 'lucide-react';

export default function PricingDialog({ isOpen, onClose, highlightPlan = null }) {
  const { user } = useAuth();
  const { language } = useLanguage();
  const router = useRouter();  const handleUpgrade = (plan) => {
    if (plan !== 'free') {
      onClose();
      router.push('/payment/confirm');
    }
  };

  const plans = [
    {
      id: 'free',
      name: language === 'id' ? 'Gratis' : 'Free',
      price: language === 'id' ? 'Gratis' : 'Free',
      icon: <Zap className="w-6 h-6" />,
      color: 'bg-gray-100 text-gray-800',
      buttonColor: 'bg-gray-600 hover:bg-gray-700',
      popular: false,
      features: [
        language === 'id' ? '5 klasifikasi per hari' : '5 classifications per day',
        language === 'id' ? 'Akses peta dasar' : 'Basic map access',
        language === 'id' ? 'Panduan daur ulang' : 'Recycling guidance',
        language === 'id' ? 'Dukungan komunitas' : 'Community support'      ],
      limitations: [
        language === 'id' ? 'Terbatas 100 klasifikasi/hari' : 'Limited to 100 classifications/day',
        language === 'id' ? 'Tidak ada export data' : 'No data export',
        language === 'id' ? 'Tidak ada analytics' : 'No analytics'
      ]
    },
    {
      id: 'premium',
      name: 'Premium',
      price: language === 'id' ? 'Rp 49,000/bulan' : '$9.99/month',
      icon: <Crown className="w-6 h-6" />,
      color: 'bg-blue-100 text-blue-800',
      buttonColor: 'bg-black hover:bg-gray-800',
      popular: true,      features: [
        language === 'id' ? 'Klasifikasi sampah tanpa batas' : 'Unlimited waste classifications',
        language === 'id' ? 'Analytics detail' : 'Detailed analytics',
        language === 'id' ? 'Export data CSV/PDF' : 'CSV/PDF data export',
        language === 'id' ? 'Dukungan prioritas' : 'Priority support',
        language === 'id' ? 'Peta lanjutan' : 'Advanced mapping',
        language === 'id' ? 'Riwayat unlimited' : 'Unlimited history'
      ],
      limitations: []
    },
    {
      id: 'corporate',
      name: 'Corporate',
      price: language === 'id' ? 'Rp 199,000/bulan' : '$39.99/month',
      icon: <Building className="w-6 h-6" />,
      color: 'bg-purple-100 text-purple-800',
      buttonColor: 'bg-purple-600 hover:bg-purple-700',
      popular: false,
      features: [
        language === 'id' ? 'Klasifikasi unlimited' : 'Unlimited classifications',
        language === 'id' ? 'API akses penuh' : 'Full API access',
        language === 'id' ? 'White-label solution' : 'White-label solution',
        language === 'id' ? 'Bulk upload' : 'Bulk upload',
        language === 'id' ? 'Manajemen tim' : 'Team management',
        language === 'id' ? 'Custom integrations' : 'Custom integrations',
        language === 'id' ? 'Dedicated support' : 'Dedicated support'
      ],
      limitations: []
    }
  ];

  if (!isOpen) return null;

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-2xl font-bold text-center">
            {language === 'id' ? '🚀 Pilih Plan yang Tepat untuk Anda' : '🚀 Choose the Right Plan for You'}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-center text-base">
            {language === 'id' 
              ? 'Tingkatkan experience klasifikasi sampah Anda dengan fitur premium yang powerful'
              : 'Upgrade your waste classification experience with powerful premium features'
            }
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-6">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`relative border-2 rounded-xl p-6 transition-all duration-200 ${
                highlightPlan === plan.id 
                  ? 'border-green-500 shadow-lg scale-105' 
                  : plan.popular
                    ? 'border-blue-500 shadow-md'
                    : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="bg-gradient-to-r from-blue-600 to-purple-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                    {language === 'id' ? 'PALING POPULER' : 'MOST POPULAR'}
                  </span>
                </div>
              )}

              <div className="text-center mb-4">
                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full ${plan.color} mb-3`}>
                  {plan.icon}
                </div>
                <h3 className="text-xl font-bold mb-1">{plan.name}</h3>
                <div className="text-2xl font-bold text-gray-900 mb-2">{plan.price}</div>
                {user?.plan === plan.id && (
                  <span className="inline-block bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded-full">
                    {language === 'id' ? 'Plan Aktif' : 'Current Plan'}
                  </span>
                )}
              </div>

              <div className="space-y-3 mb-6">
                {plan.features.map((feature, index) => (
                  <div key={index} className="flex items-start space-x-2">
                    <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-gray-700">{feature}</span>
                  </div>
                ))}
              </div>

              {plan.limitations.length > 0 && (
                <div className="mb-6">
                  <p className="text-xs font-semibold text-gray-500 mb-2">
                    {language === 'id' ? 'Batasan:' : 'Limitations:'}
                  </p>
                  {plan.limitations.map((limitation, index) => (
                    <p key={index} className="text-xs text-gray-500 mb-1">• {limitation}</p>
                  ))}
                </div>
              )}              <Button
                onClick={() => plan.id !== 'free' && handleUpgrade(plan.id)}
                disabled={user?.plan === plan.id || plan.id === 'free'}
                className={`w-full ${plan.buttonColor} text-white`}
              >
                {user?.plan === plan.id
                  ? (language === 'id' ? 'Plan Aktif' : 'Current Plan')
                  : plan.id === 'free'
                    ? (language === 'id' ? 'Plan Dasar' : 'Basic Plan')
                    : (language === 'id' ? 'Upgrade Sekarang' : 'Upgrade Now')
                }
              </Button>
            </div>
          ))}
        </div>

        {/* Feature Comparison */}
        <div className="mt-8 bg-gray-50 rounded-lg p-6">
          <h4 className="font-bold text-lg mb-4 text-center">
            {language === 'id' ? '📊 Perbandingan Fitur Detail' : '📊 Detailed Feature Comparison'}
          </h4>
          
          <div className="grid grid-cols-4 gap-4 text-sm">
            <div className="font-semibold">{language === 'id' ? 'Fitur' : 'Feature'}</div>
            <div className="font-semibold text-center">Free</div>
            <div className="font-semibold text-center">Premium</div>
            <div className="font-semibold text-center">Corporate</div>
            
            <div className="py-2 border-t">{language === 'id' ? 'Klasifikasi Harian' : 'Daily Classifications'}</div>
            <div className="py-2 border-t text-center">5</div>
            <div className="py-2 border-t text-center">50</div>
            <div className="py-2 border-t text-center">∞</div>
            
            <div className="py-2">{language === 'id' ? 'Analytics' : 'Analytics'}</div>
            <div className="py-2 text-center">❌</div>
            <div className="py-2 text-center">✅</div>
            <div className="py-2 text-center">✅</div>
            
            <div className="py-2">{language === 'id' ? 'Export Data' : 'Data Export'}</div>
            <div className="py-2 text-center">❌</div>
            <div className="py-2 text-center">✅</div>
            <div className="py-2 text-center">✅</div>
            
            <div className="py-2">{language === 'id' ? 'API Access' : 'API Access'}</div>
            <div className="py-2 text-center">❌</div>
            <div className="py-2 text-center">❌</div>
            <div className="py-2 text-center">✅</div>
          </div>        </div>

        <AlertDialogFooter>
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
