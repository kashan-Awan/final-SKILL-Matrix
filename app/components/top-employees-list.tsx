"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Award, Star, Users } from "lucide-react"
import type { ManufacturingEmployee } from "../types"
import { Button } from "@/components/ui/button"

interface TopEmployeesListProps {
  data: ManufacturingEmployee[]
}

export default function TopEmployeesList({ data }: TopEmployeesListProps) {
  const [selectedDepartment, setSelectedDepartment] = useState<string>("all")
  const [showAll, setShowAll] = useState(false)

  const departments = [...new Set(data.map((employee) => employee.department).filter((d): d is string => d !== undefined))]

  // Filter employees by department if selected
  const filteredEmployees =
    selectedDepartment === "all" ? data : data.filter((employee) => employee.department === selectedDepartment)

  // Get top employees by skill level and years of experience
  const getTopEmployees = (employees: ManufacturingEmployee[], count = showAll ? 10 : 3) => {
    return [...employees]
      .sort((a, b) => {
        // First sort by skill level (treat Expert and Advanced as same level)
        const skillLevelOrder = { Expert: 4, Advanced: 4, High: 3, Medium: 2, Low: 1 }
        const skillDiff =
          skillLevelOrder[b.skillLevel as keyof typeof skillLevelOrder] -
          skillLevelOrder[a.skillLevel as keyof typeof skillLevelOrder]

        if (skillDiff !== 0) return skillDiff

        // Then by years of experience
        return (b.yearsExperience ?? 0) - (a.yearsExperience ?? 0)
      })
      .slice(0, count)
  }

  // Group top employees by department
  const topEmployeesByDepartment =
    selectedDepartment === "all"
      ? departments.reduce(
          (acc, department) => {
            const departmentEmployees = data.filter((e) => e.department === department)
            acc[department] = getTopEmployees(departmentEmployees)
            return acc
          },
          {} as Record<string, ManufacturingEmployee[]>,
        )
      : { [selectedDepartment]: getTopEmployees(filteredEmployees) }

  // Get skill level badge color
  const getSkillLevelColor = (level: string) => {
    switch (level) {
      case "Expert":
        return "bg-purple-600 text-white"
      case "High":
        return "bg-blue-500 text-white"
      case "Medium":
        return "bg-yellow-400 text-black"
      case "Low":
        return "bg-red-500 text-white"
      default:
        return "bg-gray-400"
    }
  }

  // Get initials from name
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-lg font-semibold flex items-center gap-2 text-gray-900 dark:text-white">
            <Award className="h-5 w-5 text-purple-600" />
            Top Performing Employees
          </CardTitle>
          <CardDescription>Ranked by skill level and years of experience</CardDescription>
        </div>
        <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select Department" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Departments</SelectItem>
            {departments.map((dept) => (
              <SelectItem key={dept} value={dept}>
                {dept}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className="space-y-6">
        {(Object.entries(topEmployeesByDepartment) as [string, ManufacturingEmployee[]][]).map(([department, employees]) => (
          <div key={department} className="space-y-3">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-blue-500"></span>
              {department}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {employees.map((employee, index) => (
                <div
                  key={employee.id}
                  className={`flex items-center gap-3 p-3 rounded-lg border ${
                    employee.gender === "Female" ? "border-pink-200" : "border-gray-200"
                  } hover:shadow-md transition-shadow`}
                >
                  <div className="relative">
                    <Avatar className={`h-10 w-10 ${employee.gender === "Female" ? "border-2 border-pink-400" : ""}`}>
                      <AvatarFallback className={getSkillLevelColor(employee.skillLevel ?? '')}>
                        {getInitials(employee.name)}
                      </AvatarFallback>
                    </Avatar>
                    {index < 3 && (
                      <div className="absolute -top-1 -right-1 bg-yellow-400 rounded-full p-0.5">
                        <Star className="h-3 w-3 text-white fill-yellow-400 stroke-yellow-600" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-sm truncate">{employee.name}</p>
                      <Badge className={getSkillLevelColor(employee.skillLevel ?? '')}>{employee.skillLevel}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground truncate">{employee.title}</p>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-xs">{employee.yearsExperience} years</span>
                      <span className="text-xs">
                        {employee.certifications && employee.certifications.length > 0
                          ? `${employee.certifications.length} cert${employee.certifications.length > 1 ? "s" : ""}`
                          : "No certs"}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
        {!showAll && (Object.values(topEmployeesByDepartment) as ManufacturingEmployee[][]).some((employees) => employees.length > 3) && (
          <div className="flex justify-center mt-6">
            <Button variant="outline" onClick={() => setShowAll(true)} className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              View All Top Employees
            </Button>
          </div>
        )}

        {showAll && (
          <div className="flex justify-center mt-6">
            <Button variant="outline" onClick={() => setShowAll(false)} className="flex items-center gap-2">
              Show Less
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
