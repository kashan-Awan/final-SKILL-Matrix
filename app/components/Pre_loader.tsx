"use client"

import { useEffect, useState } from "react"

export default function Component() {
  const [isLoading, setIsLoading] = useState(true)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        const next = Math.min(100, prev + 4)
        if (next >= 100) {
          clearInterval(timer)
          setTimeout(() => setIsLoading(false), 500)
        }
        return next
      })
    }, 120)

    return () => clearInterval(timer)
  }, [])

  if (!isLoading) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white">
      <div className="w-[360px] max-w-[90vw] rounded-lg border border-gray-200 bg-white p-6">
        <div className="flex items-center justify-between">
          <div className="text-sm font-medium text-gray-900">Loading...</div>
          <div className="text-sm font-medium text-gray-700">{progress}%</div>
        </div>

        <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-gray-100">
          <div
            className="h-full bg-[#1d7fd7] transition-[width]"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="mt-4 flex items-center gap-2 text-xs text-gray-600">
          <div className="h-2 w-2 rounded-full bg-[#1d7fd7] animate-pulse" />
          <span>Please wait while we fetch your data</span>
        </div>
      </div>
    </div>
  )
}
