"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ResponsiveContainer, PieChart, Pie, Cell, Legend, Tooltip as RechartsTooltip } from "recharts"
import type { Employee } from "../types"

interface DepartmentOverviewProps {
  data: Employee[]
}

export default function DepartmentOverview({ data }: DepartmentOverviewProps) {
  // Group employees by department
  const departments = [...new Set(data.map((employee) => employee.department))]

  const departmentData = departments.map((department) => {
    const employees = data.filter((e) => e.department === department)
    const expertCount = employees.filter((e) => e.skillLevel === "Expert").length
    const highCount = employees.filter((e) => e.skillLevel === "High").length
    const mediumCount = employees.filter((e) => e.skillLevel === "Medium").length
    const lowCount = employees.filter((e) => e.skillLevel === "Low").length

    return {
      name: department,
      total: employees.length,
      expert: expertCount,
      high: highCount,
      medium: mediumCount,
      low: lowCount,
      expertPercentage: Math.round((expertCount / employees.length) * 100),
      highPercentage: Math.round((highCount / employees.length) * 100),
      mediumPercentage: Math.round((mediumCount / employees.length) * 100),
      lowPercentage: Math.round((lowCount / employees.length) * 100),
    }
  })

  // Overall skill distribution
  const skillDistribution = [
    { name: "Expert", value: data.filter((e) => e.skillLevel === "Expert").length, color: "#AF52DE" },
    { name: "High", value: data.filter((e) => e.skillLevel === "High").length, color: "#007AFF" },
    { name: "Medium", value: data.filter((e) => e.skillLevel === "Medium").length, color: "#FFCC00" },
    { name: "Low", value: data.filter((e) => e.skillLevel === "Low").length, color: "#FF3B30" },
  ]

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-2 gap-6">
      <Card className="w-full overflow-hidden col-span-1 lg:col-span-2 xl:col-span-1">
        <CardHeader>
          <CardTitle>Skill Distribution</CardTitle>
          <CardDescription>Overall skill level distribution across all departments</CardDescription>
        </CardHeader>
        <CardContent className="h-[450px] lg:h-[500px] xl:h-[450px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart margin={{ top: 30, right: 100, bottom: 40, left: 100 }}>
              <Pie
                data={skillDistribution}
                cx="50%"
                cy="42%"
                innerRadius={80}
                outerRadius={140}
                paddingAngle={4}
                dataKey="value"
                label={({ name, percent, value }) => 
                  value > 0 ? `${name}\n${(percent * 100).toFixed(0)}%` : ''
                }
                labelLine={false}
                fontSize={14}
                fontWeight="600"
              >
                {skillDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Legend 
                verticalAlign="bottom" 
                height={50}
                iconType="circle"
                wrapperStyle={{ fontSize: '16px', fontWeight: '500', paddingTop: '20px' }}
              />
              <RechartsTooltip 
                formatter={(value, name) => [`${value} employees`, `${name} Level`]}
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                  fontSize: '14px'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="w-full overflow-hidden col-span-1">
        <CardHeader>
          <CardTitle>Department Skill Saturation</CardTitle>
          <CardDescription>Percentage of employees above medium skill level</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {departmentData.map((dept) => (
              <div key={dept.name} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span>{dept.name}</span>
                  <span className="font-medium">{dept.expertPercentage + dept.highPercentage}% Advanced</span>
                </div>
                <div className="h-2 rounded-full bg-gray-200 overflow-hidden">
                    <div
                      className="h-full bg-blue-600"
                    style={{ width: `${dept.expertPercentage + dept.highPercentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {departmentData.map((dept) => (
        <Card key={dept.name} className="w-full overflow-hidden col-span-1">
          <CardHeader>
            <CardTitle>{dept.name}</CardTitle>
            <CardDescription>{dept.total} employees</CardDescription>
          </CardHeader>
          <CardContent className="h-[350px] lg:h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart margin={{ top: 20, right: 60, bottom: 30, left: 60 }}>
                <Pie
                  data={[
                    { name: "Expert", value: dept.expert, color: "#AF52DE" },
                    { name: "High", value: dept.high, color: "#007AFF" },
                    { name: "Medium", value: dept.medium, color: "#FFCC00" },
                    { name: "Low", value: dept.low, color: "#FF3B30" },
                  ].filter(item => item.value > 0)}
                  cx="50%"
                  cy="40%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={3}
                  dataKey="value"
                  label={({ name, value }) => 
                    value > 0 ? `${name}\n${value}` : ''
                  }
                  labelLine={false}
                  fontSize={12}
                  fontWeight="600"
                >
                  {skillDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Legend 
                  verticalAlign="bottom" 
                  height={40}
                  iconType="circle"
                  wrapperStyle={{ fontSize: '13px', fontWeight: '500' }}
                />
                <RechartsTooltip
                  formatter={(value, name) => [
                    `${value} employees (${Math.round((Number(value) / dept.total) * 100)}%)`,
                    `${name} Level`,
                  ]}
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '6px',
                    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                    fontSize: '13px'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
