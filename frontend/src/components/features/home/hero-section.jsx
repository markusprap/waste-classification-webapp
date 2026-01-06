"use client"

import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useLanguage } from "@/models/language-context"
import { Sparkles, ArrowRight, Leaf, Recycle, Trash2 } from "lucide-react"

export function HeroSection() {
  const { t } = useLanguage()

  return (
    <section className="relative bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 py-24 md:py-32 overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Floating circles */}
        <div className="absolute top-20 left-10 w-64 h-64 bg-emerald-200/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-80 h-80 bg-teal-200/30 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-cyan-200/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>

        {/* Floating icons */}
        <div className="absolute top-32 right-[20%] animate-float">
          <div className="w-12 h-12 bg-white rounded-2xl shadow-lg flex items-center justify-center">
            <Leaf className="w-6 h-6 text-emerald-500" />
          </div>
        </div>
        <div className="absolute bottom-32 left-[15%] animate-float" style={{ animationDelay: '1s' }}>
          <div className="w-10 h-10 bg-white rounded-xl shadow-lg flex items-center justify-center">
            <Recycle className="w-5 h-5 text-teal-500" />
          </div>
        </div>
        <div className="absolute top-1/2 right-[10%] animate-float" style={{ animationDelay: '2s' }}>
          <div className="w-14 h-14 bg-white rounded-2xl shadow-lg flex items-center justify-center">
            <Trash2 className="w-7 h-7 text-cyan-500" />
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 sm:px-8 md:px-12 lg:px-16 relative z-10">
        <div className="flex flex-col items-center justify-between gap-16 lg:gap-20 md:flex-row">
          {/* Text Content */}
          <div className="max-w-xl">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm text-emerald-700 px-4 py-2 rounded-full text-sm font-medium shadow-sm mb-6 animate-fade-in">
              <Sparkles className="w-4 h-4 text-amber-500" />
              AI-Powered Waste Classification
            </div>

            {/* Title with gradient */}
            <h1 className="text-4xl font-bold leading-tight md:text-5xl lg:text-6xl animate-slide-up">
              <span className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent">
                {t("hero.title")}
              </span>
            </h1>

            <p className="mt-6 text-gray-600 text-lg leading-relaxed animate-slide-up" style={{ animationDelay: '0.2s' }}>
              {t("hero.description")}
            </p>

            {/* Stats */}
            <div className="mt-8 flex items-center gap-8 animate-slide-up" style={{ animationDelay: '0.4s' }}>
              <div className="text-center">
                <div className="text-3xl font-bold text-emerald-600">15+</div>
                <div className="text-sm text-gray-500">Waste Types</div>
              </div>
              <div className="w-px h-12 bg-gray-200"></div>
              <div className="text-center">
                <div className="text-3xl font-bold text-teal-600">99%</div>
                <div className="text-sm text-gray-500">Accuracy</div>
              </div>
              <div className="w-px h-12 bg-gray-200"></div>
              <div className="text-center">
                <div className="text-3xl font-bold text-cyan-600">1s</div>
                <div className="text-sm text-gray-500">Detection</div>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="mt-10 flex flex-col sm:flex-row gap-4 animate-slide-up" style={{ animationDelay: '0.6s' }}>
              <Link href="/classify">
                <Button className="h-14 px-8 text-lg bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white transition-all duration-300 transform hover:scale-105 shadow-lg shadow-emerald-500/30 rounded-xl">
                  {t("hero.getStarted")}
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Button
                variant="outline"
                className="h-14 px-8 text-lg border-2 border-gray-200 hover:bg-white/80 hover:border-gray-300 rounded-xl transition-all duration-300"
                onClick={() => {
                  const benefitsSection = document.querySelector('section[class*="bg-gradient-to-br from-emerald-50"]')
                  if (benefitsSection) {
                    benefitsSection.scrollIntoView({ behavior: 'smooth' })
                  }
                }}
              >
                {t("hero.learnMore")}
              </Button>
            </div>
          </div>

          {/* Image with decorative frame */}
          <div className="w-full max-w-lg relative animate-slide-in-right">
            {/* Decorative elements */}
            <div className="absolute -top-4 -left-4 w-24 h-24 bg-gradient-to-br from-emerald-400 to-teal-400 rounded-2xl opacity-20 blur-xl"></div>
            <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-gradient-to-br from-teal-400 to-cyan-400 rounded-2xl opacity-20 blur-xl"></div>

            {/* Main image container */}
            <div className="relative bg-white rounded-3xl shadow-2xl p-4 transform hover:scale-[1.02] transition-transform duration-500">
              <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 rounded-t-3xl"></div>
              <Image
                src="/images/illustrations/recycling-illustration.jpeg"
                alt="People recycling waste into different colored bins"
                width={600}
                height={400}
                className="h-auto w-full rounded-2xl"
                priority
              />
            </div>
          </div>
        </div>
      </div>

      {/* CSS Animations */}
      <style jsx global>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        .animate-float {
          animation: float 4s ease-in-out infinite;
        }
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fade-in {
          animation: fade-in 0.8s ease-out forwards;
        }
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-slide-up {
          animation: slide-up 0.8s ease-out forwards;
        }
        @keyframes slide-in-right {
          from { opacity: 0; transform: translateX(50px); }
          to { opacity: 1; transform: translateX(0); }
        }
        .animate-slide-in-right {
          animation: slide-in-right 0.8s ease-out 0.4s forwards;
          opacity: 0;
        }
      `}</style>
    </section>
  )
}
