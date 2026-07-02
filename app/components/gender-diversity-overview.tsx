"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { Employee } from "../types"

interface GenderDiversityOverviewProps {
  data: Employee[]
}

export default function GenderDiversityOverview({ data }: GenderDiversityOverviewProps) {
  const male = data.filter((e) => e.gender?.toLowerCase() === "male").length
  const female = data.filter((e) => e.gender?.toLowerCase() === "female").length
  const others = data.filter((e) => {
    const g = e.gender?.toLowerCase();
    return g !== "male" && g !== "female" && g !== undefined && g !== null && g !== "";
  }).length
  const total = data.length

  const malePercent = total > 0 ? Math.round((male / total) * 100) : 0
  const femalePercent = total > 0 ? Math.round((female / total) * 100) : 0
  const othersPercent = total > 0 ? Math.round((others / total) * 100) : 0

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-semibold">Gender Diversity</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex justify-between text-sm">
          <span>Male</span>
          <span className="font-medium">{male} ({malePercent}%)</span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
          <div className="bg-blue-500 h-3 rounded-full" style={{ width: `${malePercent}%` }} />
        </div>
        <div className="flex justify-between text-sm">
          <span>Female</span>
          <span className="font-medium">{female} ({femalePercent}%)</span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
          <div className="bg-pink-500 h-3 rounded-full" style={{ width: `${femalePercent}%` }} />
        </div>
        <div className="flex justify-between text-sm">
          <span>Others</span>
          <span className="font-medium">{others} ({othersPercent}%)</span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
          <div className="bg-purple-500 h-3 rounded-full" style={{ width: `${othersPercent}%` }} />
        </div>
        <p className="text-xs text-muted-foreground pt-1">Total: {total} employees</p>
      </CardContent>
    </Card>
  )
}
