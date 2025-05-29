"use client"

import Image from "next/image"
import { useLanguage } from "@/context/language-context"

export function BenefitsSection() {
  const { t } = useLanguage()

  return (
    <section className="bg-gray-100 py-20 md:py-24">
      <div className="container mx-auto px-6 sm:px-8 md:px-12 lg:px-16">
        <h2 className="mb-16 text-center text-3xl font-bold">{t("benefits.title")}</h2>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-3 lg:gap-12">
          <BenefitCard
            icon={<Image src="/images/education.png" alt="Education icon" width={24} height={24} className="h-6 w-6" />}
            title={t("benefits.educational.title")}
            description={t("benefits.educational.description")}
          />

          <BenefitCard
            icon={<Image src="/images/leaf.png" alt="Eco-friendly icon" width={24} height={24} className="h-6 w-6" />}
            title={t("benefits.eco.title")}
            description={t("benefits.eco.description")}
          />

          <BenefitCard
            icon={<Image src="/images/robot.png" alt="AI icon" width={24} height={24} className="h-6 w-6" />}
            title={t("benefits.ai.title")}
            description={t("benefits.ai.description")}
          />
        </div>
      </div>
    </section>
  )
}

function BenefitCard({ icon, title, description }) {
  return (
    <div className="flex flex-col items-center rounded-lg bg-white p-8 text-center shadow-sm">
      <div className="mb-4 rounded-full bg-gray-100 p-4">{icon}</div>
      <h3 className="mb-2 text-xl font-bold">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  )
}
