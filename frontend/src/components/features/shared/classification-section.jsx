"use client"

import { useLanguage } from "@/models/language-context"
import { ImageUpload } from "./image-upload"

export function ClassificationSection() {
  const { t } = useLanguage()

  return (
    <section className="py-20 md:py-24">
      <div className="container mx-auto px-6 sm:px-8 md:px-12 lg:px-16">
        <h2 className="mb-16 text-center text-3xl font-bold">{t("classification.title")}</h2>
        <ImageUpload />
      </div>
    </section>
  )
}
