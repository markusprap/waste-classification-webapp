'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/models/language-context';
import { Button } from '@/components/ui/button';
import { XCircle, RefreshCcw, Home, MessageCircle, AlertTriangle, HelpCircle } from 'lucide-react';

export default function PaymentError() {
  const router = useRouter();
  const { language } = useLanguage();
  const [countdown, setCountdown] = useState(15);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prevCount) => {
        if (prevCount <= 1) {
          clearInterval(timer);
          router.push('/');
          return 0;
        }
        return prevCount - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-amber-50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Error Card */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100 relative">
          {/* Decorative top gradient */}
          <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-red-500 via-orange-500 to-amber-500"></div>

          {/* Header */}
          <div className="pt-12 pb-6 px-8 text-center">
            {/* Error Icon */}
            <div className="relative inline-block mb-6">
              <div className="w-24 h-24 bg-gradient-to-br from-red-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg shadow-red-500/30">
                <XCircle className="w-14 h-14 text-white" strokeWidth={2} />
              </div>
              {/* Pulsing ring */}
              <div className="absolute inset-0 rounded-full border-4 border-red-300 animate-ping opacity-20"></div>
            </div>

            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {language === 'id' ? 'Pembayaran Gagal' : 'Payment Failed'}
            </h1>

            <p className="text-gray-600 text-lg">
              {language === 'id'
                ? 'Maaf, pembayaran Anda tidak dapat diproses.'
                : 'Sorry, your payment could not be processed.'}
            </p>
          </div>

          {/* Possible Reasons */}
          <div className="mx-8 mb-6">
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
              <h3 className="font-semibold text-amber-800 mb-3 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                {language === 'id' ? 'Kemungkinan Penyebab:' : 'Possible Reasons:'}
              </h3>
              <ul className="space-y-2 text-sm text-amber-700">
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 bg-amber-500 rounded-full mt-2 flex-shrink-0"></span>
                  {language === 'id' ? 'Saldo tidak mencukupi' : 'Insufficient balance'}
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 bg-amber-500 rounded-full mt-2 flex-shrink-0"></span>
                  {language === 'id' ? 'Transaksi dibatalkan' : 'Transaction was cancelled'}
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 bg-amber-500 rounded-full mt-2 flex-shrink-0"></span>
                  {language === 'id' ? 'Masalah jaringan' : 'Network connection issue'}
                </li>
              </ul>
            </div>
          </div>

          {/* What to do */}
          <div className="mx-8 mb-6">
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5">
              <h3 className="font-semibold text-blue-800 mb-3 flex items-center gap-2">
                <HelpCircle className="w-5 h-5" />
                {language === 'id' ? 'Yang Bisa Anda Lakukan:' : 'What You Can Do:'}
              </h3>
              <ul className="space-y-2 text-sm text-blue-700">
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 font-bold">1.</span>
                  {language === 'id' ? 'Periksa saldo atau limit kartu Anda' : 'Check your balance or card limit'}
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 font-bold">2.</span>
                  {language === 'id' ? 'Coba metode pembayaran lain' : 'Try a different payment method'}
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 font-bold">3.</span>
                  {language === 'id' ? 'Hubungi dukungan jika masalah berlanjut' : 'Contact support if the issue persists'}
                </li>
              </ul>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="px-8 pb-8 space-y-3">
            <Button
              onClick={() => router.push('/payment/confirm')}
              className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-700 hover:via-teal-700 hover:to-cyan-700 text-white rounded-xl shadow-lg shadow-emerald-500/30 transition-all duration-300 transform hover:scale-[1.02]"
            >
              <RefreshCcw className="w-5 h-5 mr-2" />
              {language === 'id' ? 'Coba Lagi' : 'Try Again'}
            </Button>

            <div className="grid grid-cols-2 gap-3">
              <Button
                onClick={() => router.push('/')}
                variant="outline"
                className="h-12 font-medium border-2 border-gray-200 text-gray-600 hover:bg-gray-50 rounded-xl"
              >
                <Home className="w-4 h-4 mr-2" />
                {language === 'id' ? 'Beranda' : 'Home'}
              </Button>

              <Button
                onClick={() => router.push('/contact')}
                variant="outline"
                className="h-12 font-medium border-2 border-blue-200 text-blue-600 hover:bg-blue-50 rounded-xl"
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                {language === 'id' ? 'Bantuan' : 'Support'}
              </Button>
            </div>
          </div>

          {/* Auto redirect notice */}
          <div className="bg-gray-50 px-8 py-4 text-center">
            <p className="text-gray-500 text-sm">
              {language === 'id'
                ? `Anda akan dialihkan ke beranda dalam ${countdown} detik`
                : `You will be redirected to home in ${countdown} seconds`}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
