"use client"

import { createContext, useContext, useState, useEffect } from "react"
import { usePathname, useSearchParams } from "next/navigation"

// Create the context
const LoadingContext = createContext({
  isLoading: false,
  setIsLoading: () => {},
})

// Custom hook to use the loading context
export const useLoading = () => useContext(LoadingContext)

export function LoadingProvider({ children }) {
  const [isLoading, setIsLoading] = useState(false)
  const [isInitialLoad, setIsInitialLoad] = useState(true)
  const pathname = usePathname()
  const searchParams = useSearchParams()

  // Effect to handle route changes
  useEffect(() => {
    // Initial load state
    if (isInitialLoad) {
      setIsInitialLoad(false)
      return
    }

    // Start loading when route changes
    setIsLoading(true)

    // Simulate a minimum loading time
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 800) // Minimum loading time of 800ms

    return () => clearTimeout(timer)
  }, [pathname, searchParams, isInitialLoad])

  return (
    <LoadingContext.Provider value={{ isLoading, setIsLoading }}>
      {children}
    </LoadingContext.Provider>
  )
}
