'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/models/language-context';
import { Button } from '@/components/ui/button';
import { Clock, Home, Mail, RefreshCcw, CheckCircle2, Circle } from 'lucide-react';

export default function PaymentPending() {
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
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Pending Card */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100 relative">
          {/* Decorative top gradient */}
          <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-amber-500 via-yellow-500 to-orange-500"></div>

          {/* Header */}
          <div className="pt-12 pb-6 px-8 text-center">
            {/* Animated Clock Icon */}
            <div className="relative inline-block mb-6">
              <div className="w-24 h-24 bg-gradient-to-br from-amber-400 to-yellow-500 rounded-full flex items-center justify-center shadow-lg shadow-amber-500/30">
                <Clock className="w-12 h-12 text-white animate-pulse" />
              </div>
              {/* Spinning ring */}
              <div className="absolute inset-0 rounded-full border-4 border-amber-200 border-t-amber-500 animate-spin" style={{ animationDuration: '2s' }}></div>
            </div>

            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {language === 'id' ? 'Pembayaran Tertunda' : 'Payment Pending'}
            </h1>

            <p className="text-gray-600 text-lg">
              {language === 'id'
                ? 'Pembayaran Anda sedang diproses.'
                : 'Your payment is being processed.'}
            </p>
          </div>

          {/* Progress Timeline */}
          <div className="mx-8 mb-6">
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
              <h3 className="font-semibold text-amber-800 mb-4">
                {language === 'id' ? 'Status Pembayaran' : 'Payment Status'}
              </h3>

              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">
                      {language === 'id' ? 'Pesanan Diterima' : 'Order Received'}
                    </p>
                    <p className="text-sm text-gray-500">
                      {language === 'id' ? 'Kami menerima pesanan Anda' : 'We received your order'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center animate-pulse">
                    <Clock className="w-5 h-5 text-amber-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">
                      {language === 'id' ? 'Menunggu Pembayaran' : 'Awaiting Payment'}
                    </p>
                    <p className="text-sm text-gray-500">
                      {language === 'id' ? 'Verifikasi sedang berlangsung' : 'Verification in progress'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                    <Circle className="w-5 h-5 text-gray-400" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-400">
                      {language === 'id' ? 'Aktivasi Premium' : 'Premium Activation'}
                    </p>
                    <p className="text-sm text-gray-400">
                      {language === 'id' ? 'Menunggu konfirmasi' : 'Waiting for confirmation'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Info Notice */}
          <div className="mx-8 mb-6">
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
              <Mail className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-blue-700">
                {language === 'id'
                  ? 'Anda akan menerima email konfirmasi setelah pembayaran berhasil diverifikasi.'
                  : 'You will receive a confirmation email once your payment is verified.'}
              </p>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="px-8 pb-8 space-y-3">
            <Button
              onClick={() => window.location.reload()}
              className="w-full h-12 font-semibold bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white rounded-xl shadow-lg shadow-amber-500/30 transition-all duration-300"
            >
              <RefreshCcw className="w-4 h-4 mr-2" />
              {language === 'id' ? 'Periksa Status' : 'Check Status'}
            </Button>

            <Button
              onClick={() => router.push('/')}
              variant="outline"
              className="w-full h-12 font-medium border-2 border-gray-200 text-gray-600 hover:bg-gray-50 rounded-xl"
            >
              <Home className="w-4 h-4 mr-2" />
              {language === 'id'
                ? `Kembali ke Beranda (${countdown}s)`
                : `Back to Home (${countdown}s)`}
            </Button>
          </div>
        </div>

        {/* Footer text */}
        <p className="text-center text-gray-500 text-sm mt-6">
          {language === 'id'
            ? 'Pembayaran biasanya diverifikasi dalam 1-5 menit'
            : 'Payments are usually verified within 1-5 minutes'}
        </p>
      </div>
    </div>
  );
}
