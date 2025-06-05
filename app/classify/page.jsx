"use client"

import { Suspense } from "react"
import dynamicImport from "next/dynamic"

export const runtime = 'edge'
export const dynamic = 'force-dynamic'

// Dynamically import the ClassifyPageContent to avoid SSR issues
const ClassifyPageContent = dynamicImport(
  () => import("@/components/classify/classify-page-content").then(mod => ({ default: mod.ClassifyPageContent })),
  { 
    ssr: false,
    loading: () => (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading classification tools...</p>
          <p className="text-sm text-gray-400 mt-2">Initializing AI model...</p>
        </div>
      </div>
    )
  }
)

export default function ClassifyPage() {
  console.log('🔍 ClassifyPage component rendering...');
  
  return (
    <div className="min-h-screen">
      <Suspense fallback={
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading...</p>
            <p className="text-sm text-gray-400 mt-2">Please wait...</p>
          </div>
        </div>
      }>
        <ClassifyPageContent />
      </Suspense>
    </div>
  )
}
