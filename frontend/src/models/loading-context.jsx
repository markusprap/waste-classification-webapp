"use client"

import { createContext, useContext, useState, useEffect, Suspense } from "react"
import { usePathname, useSearchParams } from "next/navigation"

const LoadingContext = createContext({
  isLoading: false,
  setIsLoading: () => {},
})

export const useLoading = () => useContext(LoadingContext)

function LoadingProviderContent({ children, setIsLoading, isInitialLoad, setIsInitialLoad }) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  
  useEffect(() => {
    if (isInitialLoad) {
      setIsInitialLoad(false)
      return
    }

    setIsLoading(true)
    
    const timeout = setTimeout(() => {
      setIsLoading(false)
    }, 500)
    
    return () => clearTimeout(timeout)
  }, [pathname, searchParams, setIsLoading, isInitialLoad, setIsInitialLoad])
  
  return children
}

export function LoadingProvider({ children }) {
  const [isLoading, setIsLoading] = useState(false)
  const [isInitialLoad, setIsInitialLoad] = useState(true)

  return (
    <LoadingContext.Provider value={{ isLoading, setIsLoading }}>
      <Suspense fallback={<div>Loading...</div>}>
        <LoadingProviderContent 
          setIsLoading={setIsLoading} 
          isInitialLoad={isInitialLoad} 
          setIsInitialLoad={setIsInitialLoad}
        >
          {children}
        </LoadingProviderContent>
      </Suspense>
    </LoadingContext.Provider>
  )
}
