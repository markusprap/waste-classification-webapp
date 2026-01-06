'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/models/auth-context';
import { useLanguage } from '@/models/language-context';
import { Button } from '@/components/ui/button';
import { Crown, Check, Zap, Shield, PartyPopper, Home, Sparkles, Star } from 'lucide-react';

// Confetti component
function Confetti() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-50">
      {[...Array(50)].map((_, i) => (
        <div
          key={i}
          className="absolute animate-confetti"
          style={{
            left: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 3}s`,
            animationDuration: `${3 + Math.random() * 2}s`,
          }}
        >
          <div
            className="w-3 h-3 rotate-45"
            style={{
              backgroundColor: ['#10B981', '#14B8A6', '#06B6D4', '#FBBF24', '#F472B6'][Math.floor(Math.random() * 5)],
            }}
          />
        </div>
      ))}
      <style jsx>{`
        @keyframes confetti {
          0% {
            transform: translateY(-100vh) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
          }
        }
        .animate-confetti {
          animation: confetti linear forwards;
        }
      `}</style>
    </div>
  );
}

export default function PaymentSuccess() {
  const router = useRouter();
  const { refreshUser } = useAuth();
  const { language } = useLanguage();
  const [countdown, setCountdown] = useState(10);
  const [showConfetti, setShowConfetti] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        console.log('Refreshing user data...');
        await refreshUser();
      } catch (err) {
        console.error('Error refreshing user data:', err);
      }
    })();

    // Hide confetti after 5 seconds
    const confettiTimer = setTimeout(() => setShowConfetti(false), 5000);
    return () => clearTimeout(confettiTimer);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        const newCount = prev - 1;
        if (newCount <= 0) {
          clearInterval(timer);
          setTimeout(() => {
            router.push('/');
          }, 300);
        }
        return newCount;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 flex items-center justify-center p-4">
      {showConfetti && <Confetti />}

      <div className="w-full max-w-lg">
        {/* Success Card */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100 relative">
          {/* Decorative top gradient */}
          <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500"></div>

          {/* Header */}
          <div className="pt-12 pb-8 px-8 text-center">
            {/* Animated Success Icon */}
            <div className="relative inline-block mb-6">
              <div className="w-24 h-24 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/30 animate-bounce-slow">
                <Check className="w-12 h-12 text-white" strokeWidth={3} />
              </div>
              {/* Sparkle decorations */}
              <Sparkles className="absolute -top-2 -right-2 w-6 h-6 text-amber-400 animate-pulse" />
              <Star className="absolute -bottom-1 -left-3 w-5 h-5 text-amber-400 animate-pulse" style={{ animationDelay: '0.5s' }} />
            </div>

            <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center justify-center gap-2">
              <PartyPopper className="w-8 h-8 text-amber-500" />
              {language === 'id' ? 'Pembayaran Berhasil!' : 'Payment Successful!'}
            </h1>

            <p className="text-gray-600 text-lg">
              {language === 'id'
                ? 'Selamat! Akun Anda telah diupgrade ke Premium.'
                : 'Congratulations! Your account has been upgraded to Premium.'}
            </p>
          </div>

          {/* Premium Badge */}
          <div className="mx-8 mb-6">
            <div className="bg-gradient-to-r from-amber-50 to-yellow-50 border-2 border-amber-200 rounded-2xl p-6 text-center">
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-yellow-500 text-white px-4 py-2 rounded-full font-bold text-sm mb-3">
                <Crown className="w-4 h-4" />
                PREMIUM MEMBER
              </div>
              <p className="text-amber-800 font-medium">
                {language === 'id'
                  ? 'Anda sekarang memiliki akses penuh ke semua fitur!'
                  : 'You now have full access to all features!'}
              </p>
            </div>
          </div>

          {/* Benefits */}
          <div className="px-8 pb-6">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Zap className="w-5 h-5 text-emerald-600" />
              {language === 'id' ? 'Manfaat Premium Anda:' : 'Your Premium Benefits:'}
            </h3>

            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-emerald-50 rounded-xl">
                <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
                  <Check className="w-4 h-4 text-emerald-600" />
                </div>
                <span className="text-gray-700">
                  {language === 'id' ? 'Klasifikasi sampah tak terbatas' : 'Unlimited waste classifications'}
                </span>
              </div>

              <div className="flex items-center gap-3 p-3 bg-teal-50 rounded-xl">
                <div className="w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center">
                  <Check className="w-4 h-4 text-teal-600" />
                </div>
                <span className="text-gray-700">
                  {language === 'id' ? 'AI prioritas dan lebih akurat' : 'Priority AI with better accuracy'}
                </span>
              </div>

              <div className="flex items-center gap-3 p-3 bg-cyan-50 rounded-xl">
                <div className="w-8 h-8 bg-cyan-100 rounded-full flex items-center justify-center">
                  <Shield className="w-4 h-4 text-cyan-600" />
                </div>
                <span className="text-gray-700">
                  {language === 'id' ? 'Dukungan prioritas 24/7' : 'Priority support 24/7'}
                </span>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="px-8 pb-8 space-y-3">
            <Button
              onClick={() => router.push('/classify')}
              className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-700 hover:via-teal-700 hover:to-cyan-700 text-white rounded-xl shadow-lg shadow-emerald-500/30 transition-all duration-300 transform hover:scale-[1.02]"
            >
              <Zap className="w-5 h-5 mr-2" />
              {language === 'id' ? 'Mulai Klasifikasi Sekarang' : 'Start Classifying Now'}
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
            ? 'Bukti pembayaran telah dikirim ke email Anda'
            : 'Payment receipt has been sent to your email'}
        </p>
      </div>

      {/* Add CSS animation */}
      <style jsx global>{`
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        .animate-bounce-slow {
          animation: bounce-slow 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
