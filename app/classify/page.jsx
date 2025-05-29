"use client"

import { Suspense } from "react"
import { ClassifyPageContent } from "@/components/classify/classify-page-content"

export default function ClassifyPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ClassifyPageContent />
    </Suspense>
  )
}
