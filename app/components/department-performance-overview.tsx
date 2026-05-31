"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Badge } from "@/components/ui/badge"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, LabelList, ResponsiveContainer, Cell } from "recharts"
import { Info } from "lucide-react"
import type { ManufacturingEmployee } from "../types"

interface DepartmentPerformanceOverviewProps {
  data: ManufacturingEmployee[]
}

export default function DepartmentPerformanceOverview({ data }: DepartmentPerformanceOverviewProps) {
  const departments = [...new Set(data.map((employee) => employee.department))]

  const departmentData = departments
    .map((department, index) => {
      const employees = data.filter((e) => e.department === department)
      const expertCount = employees.filter((e) => e.skillLevel === "Expert").length
      const highCount = employees.filter((e) => e.skillLevel === "High").length
      const mediumCount = employees.filter((e) => e.skillLevel === "Medium").length
      const lowCount = employees.filter((e) => e.skillLevel === "Low").length

      const advancedCount = expertCount + highCount
      const skillSaturation = employees.length > 0 ? (advancedCount / employees.length) * 100 : 0
      const avgExperience =
        employees.length > 0 ? employees.reduce((sum, emp) => sum + (emp.yearsExperience ?? 0), 0) / employees.length : 0

      // Calculate a performance score based on skill levels and experience
      const performanceScore =
        employees.length > 0
          ? ((expertCount * 4 + highCount * 3 + mediumCount * 2 + lowCount * 1) / employees.length) * 25
          : 0

      // Color mapping for departments
      const colors = [
        "#FF3B30", // Red
        "#FF9500", // Orange
        "#FFCC00", // Yellow
        "#34C759", // Green
        "#007AFF", // Blue
        "#5856D6", // Indigo
        "#AF52DE", // Purple
      ]

      return {
        name: department,
        skillSaturation: Math.round(skillSaturation),
        performanceScore: Math.round(performanceScore),
        totalEmployees: employees.length,
        expertCount,
        highCount,
        mediumCount,
        lowCount,
        advancedCount,
        avgExperience: Math.round(avgExperience * 10) / 10,
        fill: colors[index % colors.length],
      }
    })
    .sort((a, b) => b.performanceScore - a.performanceScore)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Department Performance Overview</h3>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center text-sm text-muted-foreground cursor-help">
                <Info className="h-4 w-4 mr-1" />
                How is performance calculated?
              </div>
            </TooltipTrigger>
            <TooltipContent className="max-w-xs">
              <p>Performance score is calculated based on:</p>
              <ul className="list-disc pl-4 mt-1 text-xs">
                <li>Skill levels (Expert, High, Medium, Low)</li>
                <li>Percentage of advanced employees</li>
                <li>Average years of experience</li>
                <li>Maximum score is 100</li>
              </ul>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      <div className="h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={departmentData} layout="vertical" margin={{ top: 20, right: 50, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
            <XAxis type="number" domain={[0, 100]} tickCount={6} />
            <YAxis dataKey="name" type="category" width={120} tick={{ fontSize: 12 }} />
            <Bar dataKey="performanceScore" radius={[0, 4, 4, 0]} barSize={30}>
              {departmentData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} fillOpacity={0.9} />
              ))}
              <LabelList
                dataKey="performanceScore"
                position="right"
                formatter={(value: number) => `${value}/100`}
                style={{ fontWeight: "bold", fill: "#333" }}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {departmentData.map((dept) => (
          <Card key={dept.name} className="overflow-hidden">
            <div
              className="h-2"
                style={{
                  background: dept.fill,
                }}
            ></div>
            <CardContent className="p-4">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-semibold">{dept.name}</h4>
                  <p className="text-sm text-muted-foreground">{dept.totalEmployees} employees</p>
                </div>
                <Badge className="text-white" style={{ backgroundColor: dept.fill }}>
                  {dept.performanceScore}/100
                </Badge>
              </div>

              <div className="mt-3 space-y-2">
                <div className="flex justify-between text-xs">
                  <span>Advanced employees:</span>
                  <span className="font-medium">
                    {dept.advancedCount}/{dept.totalEmployees} ({dept.skillSaturation}%)
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span>Avg. experience:</span>
                  <span className="font-medium">{dept.avgExperience} years</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span>Expert level:</span>
                  <span className="font-medium">{dept.expertCount} employees</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
