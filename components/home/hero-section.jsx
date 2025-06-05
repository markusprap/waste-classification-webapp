"use client"

import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useLanguage } from "@/context/language-context"

export function HeroSection() {
  const { t } = useLanguage()

  return (
    <section className="bg-white py-24 md:py-32">
      <div className="container mx-auto px-6 sm:px-8 md:px-12 lg:px-16">
        <div className="flex flex-col items-center justify-between gap-16 lg:gap-20 md:flex-row">
          <div className="max-w-xl">
            <h1 className="text-4xl font-bold leading-tight md:text-5xl lg:text-6xl">{t("hero.title")}</h1>
            <p className="mt-6 text-gray-600">{t("hero.description")}</p>
            <div className="mt-10 flex space-x-4">
              <Link href="/classify">
                <Button className="bg-black text-white hover:bg-gray-800">{t("hero.getStarted")}</Button>
              </Link>
              <Button 
                variant="outline" 
                className="border-gray-300"
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

          <div className="w-full max-w-lg">
            <Image
              src="/images/recycling-illustration.jpeg"
              alt="People recycling waste into different colored bins"
              width={600}
              height={400}
              className="h-auto w-full"
              priority
            />
          </div>
        </div>
      </div>
    </section>
  )
}
