"use client"

import { useTheme } from "./ThemeProvider"

interface LoadingSkeletonProps {
  type?: "card" | "table" | "list" | "chart"
  count?: number
  className?: string
}

export default function LoadingSkeleton({ 
  type = "card", 
  count = 3, 
  className = "" 
}: LoadingSkeletonProps) {
  const { isDark } = useTheme()

  const baseClass = `animate-pulse ${
    isDark ? "bg-gray-700/50" : "bg-gray-200/50"
  }`

  const CardSkeleton = () => (
    <div className={`${baseClass} rounded-xl p-6 space-y-4`}>
      <div className={`${baseClass} h-4 w-3/4 rounded`}></div>
      <div className={`${baseClass} h-3 w-1/2 rounded`}></div>
      <div className="space-y-2">
        <div className={`${baseClass} h-3 w-full rounded`}></div>
        <div className={`${baseClass} h-3 w-5/6 rounded`}></div>
      </div>
    </div>
  )

  const TableSkeleton = () => (
    <div className={`${baseClass} rounded-xl p-6 space-y-4`}>
      <div className={`${baseClass} h-6 w-1/3 rounded mb-4`}></div>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex space-x-4">
          <div className={`${baseClass} h-4 w-1/6 rounded`}></div>
          <div className={`${baseClass} h-4 w-1/4 rounded`}></div>
          <div className={`${baseClass} h-4 w-1/5 rounded`}></div>
          <div className={`${baseClass} h-4 w-1/6 rounded`}></div>
        </div>
      ))}
    </div>
  )

  const ListSkeleton = () => (
    <div className={`${baseClass} rounded-xl p-4 space-y-3`}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-center space-x-3">
          <div className={`${baseClass} h-10 w-10 rounded-full`}></div>
          <div className="space-y-2 flex-1">
            <div className={`${baseClass} h-4 w-3/4 rounded`}></div>
            <div className={`${baseClass} h-3 w-1/2 rounded`}></div>
          </div>
        </div>
      ))}
    </div>
  )

  const ChartSkeleton = () => (
    <div className={`${baseClass} rounded-xl p-6 space-y-4`}>
      <div className={`${baseClass} h-6 w-1/3 rounded mb-6`}></div>
      <div className="h-64 flex items-end space-x-2">
        {Array.from({ length: 8 }).map((_, i) => (
          <div 
            key={i} 
            className={`${baseClass} w-8 rounded-t`}
            style={{ height: `${Math.random() * 200 + 50}px` }}
          ></div>
        ))}
      </div>
    </div>
  )

  const renderSkeleton = () => {
    switch (type) {
      case "table":
        return <TableSkeleton />
      case "list":
        return <ListSkeleton />
      case "chart":
        return <ChartSkeleton />
      default:
        return Array.from({ length: count }).map((_, i) => <CardSkeleton key={i} />)
    }
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {renderSkeleton()}
    </div>
  )
}

// Quick loading spinner component
export function LoadingSpinner({ 
  size = "md", 
  className = "" 
}: { 
  size?: "sm" | "md" | "lg"
  className?: string 
}) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-6 h-6", 
    lg: "w-8 h-8"
  }

  return (
    <div className={`animate-spin rounded-full border-2 border-gray-300 border-t-blue-600 ${sizeClasses[size]} ${className}`}></div>
  )
}
