"use client"

import { Card, CardContent, CardHeader } from "@/components/ui/card"

interface DatabaseLoadingProps {
  message?: string;
}

export default function DatabaseLoading({ message = "Loading employee data..." }: DatabaseLoadingProps) {
  return (
    <div className="container mx-auto py-8 space-y-8">
      {/* Header Skeleton */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div className="space-y-3">
          <div className="h-10 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg animate-pulse w-96"></div>
          <div className="h-6 bg-gray-200 rounded animate-pulse w-80"></div>
        </div>
        <div className="flex gap-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-10 w-32 bg-gray-200 rounded animate-pulse"></div>
          ))}
        </div>
      </div>

      {/* Loading Message */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="py-8">
          <div className="flex items-center justify-center space-x-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="text-lg font-medium text-blue-800">{message}</span>
          </div>
          <p className="text-center text-blue-600 mt-2">
            Retrieving your data...
          </p>
        </CardContent>
      </Card>

      {/* Dashboard Skeleton */}
      <Card className="bg-gray-50 shadow-lg border-0">
        <CardHeader>
          <div className="h-6 bg-gray-200 rounded animate-pulse w-64"></div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="space-y-3">
                <div className="h-32 bg-gray-200 rounded-lg animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded animate-pulse w-24"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Charts Skeleton */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {[...Array(2)].map((_, i) => (
          <Card key={i} className="bg-gray-50 shadow-lg border-0">
            <CardHeader>
              <div className="h-6 bg-gray-200 rounded animate-pulse w-48"></div>
              <div className="h-4 bg-gray-200 rounded animate-pulse w-64"></div>
            </CardHeader>
            <CardContent>
              <div className="h-64 bg-gray-200 rounded-lg animate-pulse"></div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Progress Indicator */}
      <div className="text-center">
        <div className="inline-flex items-center space-x-2 text-sm text-gray-600">
          <div className="flex space-x-1">
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
          <span>Please wait while we fetch your data</span>
        </div>
      </div>
    </div>
  );
}
