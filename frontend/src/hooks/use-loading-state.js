"use client"

import { useLoading } from "@/models/loading-context"
import { useCallback } from "react"

export function useLoadingState() {
  const { setIsLoading } = useLoading()

  // Wrap the async function with loading state
  const withLoading = useCallback(async (asyncFunction) => {
    try {
      setIsLoading(true)
      return await asyncFunction()
    } finally {
      setIsLoading(false)
    }
  }, [setIsLoading])

  return {
    startLoading: () => setIsLoading(true),
    stopLoading: () => setIsLoading(false),
    withLoading
  }
}
