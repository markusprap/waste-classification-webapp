"use client"

import { useLoading } from "@/models/loading-context"
import { useCallback } from "react"

export function useLoadingState() {
  const { isLoading, setIsLoading } = useLoading()

  const withLoading = useCallback(async (asyncFunction) => {
    try {
      setIsLoading(true)
      return await asyncFunction()
    } finally {
      setIsLoading(false)
    }
  }, [setIsLoading])

  return {
    isLoading,
    startLoading: () => setIsLoading(true),
    stopLoading: () => setIsLoading(false),
    withLoading
  }
}
