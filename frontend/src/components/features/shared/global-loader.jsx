"use client"

import { useLoading } from "@/models/loading-context"
import { useEffect, useState } from "react"

export function GlobalLoader() {
  const { isLoading } = useLoading()
  const [progress, setProgress] = useState(0)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    let interval
    let timeout

    if (isLoading) {
      setVisible(true)
      setProgress(0)
      
      interval = setInterval(() => {
        setProgress((prevProgress) => {
          if (prevProgress < 70) {
            return prevProgress + 5
          } else if (prevProgress < 90) {
            return prevProgress + 0.5
          }
          return prevProgress
        })
      }, 100)
    } else {
      setProgress(100)
      
      timeout = setTimeout(() => {
        setVisible(false)
      }, 500)
    }

    return () => {
      clearInterval(interval)
      clearTimeout(timeout)
    }
  }, [isLoading])

  if (!visible) return null

  return (
    <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-gray-200">
      <div 
        className="h-full bg-green-600 transition-all duration-300 ease-out"
        style={{ 
          width: `${progress}%`,
          boxShadow: "0 0 10px rgba(34, 197, 94, 0.7)"
        }}
      />
    </div>
  )
}
