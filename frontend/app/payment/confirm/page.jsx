'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { processPremiumUpgrade } from '@/services/midtransService';
import { Button } from '@/components/ui/button';
import { Loader2, Check, Shield, Crown, Zap, Star, ArrowRight, Sparkles, Clock, CreditCard } from 'lucide-react';

export default function PaymentConfirmPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(true);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (status === 'loading') return;

    if (!session) {
      router.push('/signin');
      return;
    }

    setLoading(false);
  }, [session, status, router]);

  const handlePayNow = async () => {
    try {
      setProcessingPayment(true);
      setError(null);

      const result = await processPremiumUpgrade(session.user);

      if (result.success) {
        if (result.status === 'pending') {
          router.push('/payment/pending');
        } else {
          router.push('/payment/success');
        }
      } else {
        setError(result.error || 'Payment failed. Please try again.');
        setProcessingPayment(false);
      }
    } catch (error) {
      console.error('Payment error:', error);
      setError(error.message || 'Payment failed. Please try again.');
      setProcessingPayment(false);
    }
  };

  const handleCancel = () => {
    router.push('/');
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
        <div className="text-center">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin mx-auto"></div>
            <Crown className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 text-emerald-600" />
          </div>
          <p className="mt-4 text-gray-600 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 py-8 px-4">
      <div className="max-w-lg mx-auto">
        {/* Header Badge */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-100 to-yellow-100 text-amber-800 px-4 py-2 rounded-full text-sm font-medium shadow-sm">
            <Sparkles className="w-4 h-4" />
            Special Offer - Limited Time
          </div>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100">
          {/* Premium Header */}
          <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 p-8 text-center relative overflow-hidden">
            {/* Decorative Elements */}
            <div className="absolute top-0 left-0 w-full h-full opacity-10">
              <div className="absolute top-4 left-8 w-20 h-20 border-2 border-white rounded-full"></div>
              <div className="absolute bottom-4 right-8 w-32 h-32 border-2 border-white rounded-full"></div>
              <div className="absolute top-1/2 left-1/4 w-8 h-8 bg-white rounded-full"></div>
            </div>

            <div className="relative">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl mb-4 shadow-lg">
                <Crown className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-white mb-2">Upgrade to Premium</h1>
              <p className="text-emerald-100">Unlock the full power of WasteWise AI</p>
            </div>
          </div>

          {/* Price Section */}
          <div className="p-8 border-b border-gray-100">
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <span className="text-gray-400 line-through text-lg">Rp 149.000</span>
                <span className="bg-red-100 text-red-600 text-xs font-bold px-2 py-1 rounded-full">SAVE 33%</span>
              </div>
              <div className="flex items-baseline justify-center gap-1">
                <span className="text-5xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">Rp 99.000</span>
                <span className="text-gray-500">/month</span>
              </div>
              <p className="text-gray-500 text-sm mt-2 flex items-center justify-center gap-1">
                <Clock className="w-4 h-4" />
                First month special price
              </p>
            </div>
          </div>

          {/* Benefits Section */}
          <div className="p-8">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Star className="w-5 h-5 text-amber-500" />
              Premium Benefits
            </h3>

            <div className="space-y-4">
              <div className="flex items-start gap-4 p-4 bg-gradient-to-r from-emerald-50 to-transparent rounded-xl">
                <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Zap className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Unlimited Classifications</h4>
                  <p className="text-sm text-gray-600">Classify waste without any daily limits</p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 bg-gradient-to-r from-teal-50 to-transparent rounded-xl">
                <div className="w-10 h-10 bg-teal-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Shield className="w-5 h-5 text-teal-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Priority AI Processing</h4>
                  <p className="text-sm text-gray-600">Faster and more accurate AI classifications</p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 bg-gradient-to-r from-cyan-50 to-transparent rounded-xl">
                <div className="w-10 h-10 bg-cyan-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Crown className="w-5 h-5 text-cyan-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Exclusive Features</h4>
                  <p className="text-sm text-gray-600">Early access to new features & updates</p>
                </div>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="mx-8 mb-6 p-4 bg-gray-50 rounded-xl">
            <h4 className="font-semibold text-gray-700 mb-3 text-sm uppercase tracking-wide">Order Summary</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Premium Plan (1 Month)</span>
                <span className="text-gray-900">Rp 99.000</span>
              </div>
              <div className="flex justify-between text-emerald-600">
                <span>Discount Applied</span>
                <span>-Rp 50.000</span>
              </div>
              <div className="border-t pt-2 mt-2 flex justify-between font-bold text-base">
                <span>Total</span>
                <span className="text-emerald-600">Rp 99.000</span>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mx-8 mb-4 p-4 bg-red-50 border border-red-200 rounded-xl">
              <p className="text-red-600 text-sm flex items-center gap-2">
                <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                {error}
              </p>
            </div>
          )}

          {/* CTA Buttons */}
          <div className="p-8 pt-2 space-y-3">
            <Button
              className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-700 hover:via-teal-700 hover:to-cyan-700 text-white rounded-xl shadow-lg shadow-emerald-500/30 transition-all duration-300 transform hover:scale-[1.02]"
              onClick={handlePayNow}
              disabled={processingPayment}
            >
              {processingPayment ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Processing...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  Proceed to Payment
                  <ArrowRight className="w-5 h-5" />
                </span>
              )}
            </Button>

            <Button
              className="w-full h-12 font-medium border-2 border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300 rounded-xl transition-all duration-300"
              variant="outline"
              onClick={handleCancel}
              disabled={processingPayment}
            >
              Maybe Later
            </Button>
          </div>

          {/* Trust Badges */}
          <div className="px-8 pb-8">
            <div className="flex items-center justify-center gap-4 text-xs text-gray-500">
              <div className="flex items-center gap-1">
                <Shield className="w-4 h-4 text-green-500" />
                <span>Secure Payment</span>
              </div>
              <span className="text-gray-300">|</span>
              <div className="flex items-center gap-1">
                <Check className="w-4 h-4 text-green-500" />
                <span>Cancel Anytime</span>
              </div>
              <span className="text-gray-300">|</span>
              <div className="flex items-center gap-1">
                <Zap className="w-4 h-4 text-green-500" />
                <span>Instant Access</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Note */}
        <p className="text-center text-gray-500 text-sm mt-6">
          By continuing, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  );
}
