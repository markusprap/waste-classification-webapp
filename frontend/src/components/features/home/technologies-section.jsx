"use client"

import Image from "next/image"
import { useLanguage } from "@/models/language-context"

export function TechnologiesSection() {
  const { t } = useLanguage()

  return (
    <section className="py-20 md:py-24">
      <div className="container mx-auto px-6 sm:px-8 md:px-12 lg:px-16">
        <h2 className="mb-16 text-center text-3xl font-bold">{t("tech.title")}</h2>        <div className="flex flex-wrap items-center justify-center gap-10 md:gap-14 lg:gap-16">
          <TechIcon src="/images/tech/python.png" alt="Python" />
          <TechIcon src="/images/icons/atom.png" alt="React" />
          <TechIcon src="/images/tech/nextjs.png" alt="Next.js" />
          <TechIcon src="/images/tech/nodejs.png" alt="Node.js" />
        </div>
      </div>
    </section>
  )
}

function TechIcon({ src, alt }) {
  return (
    <div className="flex h-8 w-8 items-center justify-center md:h-10 md:w-10">
      <Image src={src || "/placeholder.svg"} alt={alt} width={40} height={40} className="h-auto w-full" />
    </div>
  )
}
