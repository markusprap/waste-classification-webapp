"use client"

import Image from "next/image"
import { useLanguage } from "@/models/language-context"
import { Sparkles } from "lucide-react"

export function BenefitsSection() {
  const { t } = useLanguage()

  return (
    <section className="relative overflow-hidden bg-[#fafafa] py-24 md:py-32">
      {/* Dynamic Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -right-[5%] w-[40%] h-[40%] bg-emerald-100/40 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute top-[20%] -left-[10%] w-[50%] h-[50%] bg-teal-100/30 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute -bottom-[10%] right-[10%] w-[35%] h-[35%] bg-cyan-100/40 rounded-full blur-[80px] animate-pulse" style={{ animationDelay: '4s' }}></div>
      </div>

      <div className="container relative mx-auto px-6 sm:px-8 md:px-12 lg:px-16 z-10">
        {/* Header */}
        <div className="mb-20 text-center max-w-4xl mx-auto">
          <div className="mb-6 inline-flex items-center gap-2 bg-emerald-50 border border-emerald-100 rounded-full px-5 py-2 text-sm font-semibold text-emerald-700 shadow-sm animate-fade-in">
            <Sparkles className="w-4 h-4 text-amber-500" />
            Join the Green Revolution
          </div>
          <h2 className="mb-8 text-4xl font-extrabold text-gray-900 md:text-5xl lg:text-6xl tracking-tight animate-slide-up">
            {t("benefits.title")}
          </h2>
          <p className="text-xl text-gray-500 leading-relaxed animate-slide-up" style={{ animationDelay: '0.2s' }}>
            Experience the future of waste management. Our AI doesn't just classify - it educates,
            inspires, and connects you to a global community fighting for a cleaner planet.
          </p>

          <div className="mt-10 flex flex-wrap justify-center items-center gap-6 text-sm font-medium text-gray-400 animate-slide-up" style={{ animationDelay: '0.4s' }}>
            <div className="flex items-center gap-2 group">
              <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full group-hover:scale-150 transition-transform shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
              <span className="group-hover:text-emerald-600 transition-colors">99.2% Prediction Accuracy</span>
            </div>
            <div className="w-1.5 h-1.5 bg-gray-300 rounded-full overflow-hidden"></div>
            <div className="flex items-center gap-2 group">
              <div className="w-2.5 h-2.5 bg-teal-500 rounded-full group-hover:scale-150 transition-transform shadow-[0_0_10px_rgba(20,184,166,0.5)]"></div>
              <span className="group-hover:text-teal-600 transition-colors">Under 1s Processing</span>
            </div>
            <div className="w-1.5 h-1.5 bg-gray-300 rounded-full overflow-hidden"></div>
            <div className="flex items-center gap-2 group">
              <div className="w-2.5 h-2.5 bg-cyan-500 rounded-full group-hover:scale-150 transition-transform shadow-[0_0_10px_rgba(6,182,212,0.5)]"></div>
              <span className="group-hover:text-cyan-600 transition-colors">24/7 Global Availability</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-3 lg:gap-12">
          <BenefitCard
            icon={<Image src="/images/icons/education.png" alt="Education icon" width={48} height={48} className="h-10 w-10" />}
            title={t("benefits.educational.title")}
            description={t("benefits.educational.description")}
            color="emerald"
            delay="0s"
          />

          <BenefitCard
            icon={<Image src="/images/icons/leaf.png" alt="Eco-friendly icon" width={48} height={48} className="h-10 w-10" />}
            title={t("benefits.eco.title")}
            description={t("benefits.eco.description")}
            color="teal"
            delay="0.2s"
          />

          <BenefitCard
            icon={<Image src="/images/icons/robot.png" alt="AI icon" width={48} height={48} className="h-10 w-10" />}
            title={t("benefits.ai.title")}
            description={t("benefits.ai.description")}
            color="cyan"
            delay="0.4s"
          />
        </div>
      </div>
      <style jsx global>{`
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
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-15px); }
        }
        .animate-float {
          animation: float 5s ease-in-out infinite;
        }
      `}</style>
    </section>
  )
}

function BenefitCard({ icon, title, description, color, delay }) {
  const colorClasses = {
    emerald: {
      gradient: "from-emerald-500 to-teal-500",
      lightBg: "bg-emerald-50",
      accent: "text-emerald-600",
      shadow: "shadow-emerald-200"
    },
    teal: {
      gradient: "from-teal-500 to-cyan-500",
      lightBg: "bg-teal-50",
      accent: "text-teal-600",
      shadow: "shadow-teal-200"
    },
    cyan: {
      gradient: "from-cyan-500 to-blue-500",
      lightBg: "bg-cyan-50",
      accent: "text-cyan-600",
      shadow: "shadow-cyan-200"
    }
  }

  const colors = colorClasses[color]

  return (
    <div
      className="group relative animate-slide-up opacity-0"
      style={{ animationDelay: delay, animationFillMode: 'forwards' }}
    >
      {/* Main Card */}
      <div className={`
        relative h-full p-10 rounded-[2.5rem] bg-white border border-gray-100 
        shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all duration-500
        hover:shadow-[0_20px_50px_rgba(0,0,0,0.08)] hover:-translate-y-3
        overflow-hidden
      `}>
        {/* Hover Gradient Overlay */}
        <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${colors.gradient} opacity-0 group-hover:opacity-5 blur-2xl transition-opacity duration-500`}></div>

        <div className="relative z-10 flex flex-col h-full">
          {/* Icon Container */}
          <div className={`
            mb-8 w-20 h-20 rounded-3xl ${colors.lightBg} 
            flex items-center justify-center transition-all duration-500
            group-hover:scale-110 group-hover:rotate-3
            relative
          `}>
            {/* Inner Glow */}
            <div className={`absolute inset-0 rounded-3xl bg-gradient-to-br ${colors.gradient} opacity-0 group-hover:opacity-10 transition-opacity`}></div>

            <div className="relative z-10 grayscale group-hover:grayscale-0 transition-all duration-500 scale-110">
              {icon}
            </div>
          </div>

          {/* Title */}
          <h3 className={`text-2xl font-bold text-gray-900 mb-4 transition-colors duration-300 group-hover:${colors.accent}`}>
            {title}
          </h3>

          {/* Description */}
          <p className="text-gray-500 text-lg leading-relaxed mb-8 flex-grow">
            {description}
          </p>

          {/* Action indicator */}
          <div className="flex items-center gap-2 text-sm font-bold text-gray-300 group-hover:text-gray-400 transition-colors">
            <span>DISCOVER</span>
            <div className={`h-[2px] w-8 rounded-full bg-gray-100 group-hover:w-16 group-hover:bg-gradient-to-r ${colors.gradient} transition-all duration-500`}></div>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-8 right-8 w-1.5 h-1.5 rounded-full bg-gray-100 group-hover:bg-emerald-300 transition-colors"></div>
        <div className="absolute bottom-12 right-12 w-1 h-1 rounded-full bg-gray-100 group-hover:bg-teal-300 transition-colors delay-100"></div>
      </div>
    </div>
  )
}
