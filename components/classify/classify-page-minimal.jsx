"use client"

export function ClassifyPageMinimal() {
  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1 p-8">
        <div className="container mx-auto">
          <h1 className="text-4xl font-bold text-center mb-8">
            Waste Classification
          </h1>
          <p className="text-center text-gray-600 mb-8">
            AI-powered waste classification system
          </p>
          <div className="text-center">
            <p>Classification features will be available in client-side mode.</p>
          </div>
        </div>
      </main>
    </div>
  )
}
