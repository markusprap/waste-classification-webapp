"use client"

import Image from "next/image"
import { useLanguage } from "@/models/language-context"

export function BenefitsSection() {
  const { t } = useLanguage()

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 py-20 md:py-28">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-gradient-to-br from-emerald-200/30 to-teal-200/30 blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-gradient-to-br from-cyan-200/30 to-blue-200/30 blur-3xl"></div>
      </div>
      
      <div className="container relative mx-auto px-6 sm:px-8 md:px-12 lg:px-16">
        {/* Header */}
        <div className="mb-16 text-center">
          <div className="mb-4 inline-flex items-center rounded-full bg-emerald-100 px-6 py-3 text-sm font-medium text-emerald-700">
            ✨ Join 10,000+ Eco Warriors Worldwide
          </div>
          <h2 className="mb-6 text-4xl font-bold text-gray-900 md:text-5xl">
            {t("benefits.title")}
          </h2>
          <p className="mx-auto max-w-3xl text-xl text-gray-600 leading-relaxed">
            Experience the future of waste management. Our AI doesn't just classify - it educates, 
            inspires, and connects you to a global community fighting for a cleaner planet.
          </p>
          <div className="mt-6 flex justify-center items-center space-x-8 text-sm text-gray-500">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span>99.2% Accuracy</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              <span>Lightning Fast</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
              <span>24/7 Available</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-3 lg:gap-10">
          <BenefitCard
            icon={<Image src="/images/education.png" alt="Education icon" width={32} height={32} className="h-8 w-8" />}
            title={t("benefits.educational.title")}
            description={t("benefits.educational.description")}
            color="emerald"
          />

          <BenefitCard
            icon={<Image src="/images/leaf.png" alt="Eco-friendly icon" width={32} height={32} className="h-8 w-8" />}
            title={t("benefits.eco.title")}
            description={t("benefits.eco.description")}
            color="teal"
          />

          <BenefitCard
            icon={<Image src="/images/robot.png" alt="AI icon" width={32} height={32} className="h-8 w-8" />}
            title={t("benefits.ai.title")}
            description={t("benefits.ai.description")}
            color="cyan"
          />
        </div>
      </div>
    </section>
  )
}

function BenefitCard({ icon, title, description, color }) {
  const colorClasses = {
    emerald: {
      gradient: "from-emerald-500 to-teal-500",
      iconBg: "bg-emerald-100 border-emerald-200",
      iconHover: "group-hover:bg-emerald-500",
      titleGradient: "from-emerald-600 to-teal-600",
      hoverShadow: "group-hover:shadow-emerald-500/25"
    },
    teal: {
      gradient: "from-teal-500 to-cyan-500",
      iconBg: "bg-teal-100 border-teal-200",
      iconHover: "group-hover:bg-teal-500",
      titleGradient: "from-teal-600 to-cyan-600",
      hoverShadow: "group-hover:shadow-teal-500/25"
    },
    cyan: {
      gradient: "from-cyan-500 to-blue-500",
      iconBg: "bg-cyan-100 border-cyan-200",
      iconHover: "group-hover:bg-cyan-500",
      titleGradient: "from-cyan-600 to-blue-600",
      hoverShadow: "group-hover:shadow-cyan-500/25"
    }
  }

  const colors = colorClasses[color]

  return (
    <div className="group relative">
      {/* Card */}
      <div className={`relative h-full transform rounded-2xl bg-white/80 backdrop-blur-sm border border-white/50 p-8 text-center shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl ${colors.hoverShadow}`}>
        {/* Gradient border effect */}
        <div className={`absolute inset-0 rounded-2xl bg-gradient-to-r ${colors.gradient} p-[1px] opacity-0 transition-opacity duration-300 group-hover:opacity-100`}>
          <div className="h-full w-full rounded-2xl bg-white"></div>
        </div>
        
        {/* Content */}
        <div className="relative z-10">
          {/* Icon */}
          <div className={`mx-auto mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl border-2 ${colors.iconBg} transition-all duration-300 ${colors.iconHover} group-hover:scale-110 group-hover:border-transparent`}>
            <div className="transition-all duration-300 group-hover:brightness-0 group-hover:invert">
              {icon}
            </div>
          </div>
          
          {/* Title */}
          <h3 className={`mb-4 text-xl font-bold bg-gradient-to-r ${colors.titleGradient} bg-clip-text text-transparent`}>
            {title}
          </h3>
          
          {/* Description */}
          <p className="text-gray-600 leading-relaxed">
            {description}
          </p>
        </div>

        {/* Floating particles effect */}
        <div className="absolute top-4 right-4 h-2 w-2 rounded-full bg-gradient-to-r from-emerald-400 to-teal-400 opacity-50 animate-ping"></div>
        <div className="absolute bottom-6 left-6 h-1.5 w-1.5 rounded-full bg-gradient-to-r from-teal-400 to-cyan-400 opacity-40 animate-pulse delay-150"></div>
      </div>
    </div>
  )
}
