"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Filter, RefreshCw, Target } from "lucide-react"
import DashboardOverview from "../components/dashboard-overview"
import SkillLevelBreakdown from "../components/skill-level-breakdown"
import GenderDiversityOverview from "../components/gender-diversity-overview"
import TopEmployeesList from "../components/top-employees-list"
import EnhancedSkillComparisonMatrix from "../components/enhanced-skill-comparison-matrix"
import AIChatbot from "../components/ai-chatbot"
import FullscreenChart from "../components/FullscreenChart"
import DatabaseLoading from "../components/DatabaseLoading"
import DatabaseError from "../components/DatabaseError"
import { useEmployees } from "@/hooks/useEmployees"

export default function FridgeManufacturingDashboard() {
  const { employees, loading, error, refetch } = useEmployees()
  const [selectedDepartment, setSelectedDepartment] = useState<string>("all")
  const [selectedSkillLevel, setSelectedSkillLevel] = useState<string>("all")
  const [selectedGender, setSelectedGender] = useState<string>("all")
  const [selectedFactory, setSelectedFactory] = useState<string>("all")

  // Debug log when filters change

  // Also create a handler function to test
  const handleDepartmentChange = (value: string) => {
    setSelectedDepartment(value)
  }

  // Show loading state
  if (loading) {
    return <DatabaseLoading message="Loading your Data..." />
  }

  // Show error state
  if (error) {
    return <DatabaseError error={error} onRetry={refetch} />
  }

  // Get unique departments from actual employee data
  const departments = [...new Set(employees.map(emp => emp.department).filter(Boolean))].sort();
  
  // Get unique factories from actual employee data
  const factories = [...new Set(employees.map(emp => emp.factory).filter(Boolean))].sort();

  // Get unique skill levels from actual employee data
  const skillLevels = [...new Set(employees.map(emp => emp.skillLevel).filter(Boolean))].sort();

  const filteredData = employees.filter((employee) => {
    if (selectedFactory !== "all" && employee.factory !== selectedFactory) return false
    if (selectedDepartment !== "all" && employee.department !== selectedDepartment) return false
    if (selectedSkillLevel !== "all") {
      // Normalize skill level comparison - treat Expert as Advanced
      const empSkillLevel = employee.skillLevel?.toLowerCase();
      const filterLevel = selectedSkillLevel.toLowerCase();
      
      // Handle Advanced level (includes Expert)
      if (filterLevel === "advanced") {
        if (empSkillLevel !== "advanced" && empSkillLevel !== "expert") return false;
      } else {
        // Handle other levels
        if (filterLevel === "high" && empSkillLevel !== "high") return false;
        if (filterLevel === "medium" && empSkillLevel !== "medium") return false;
        if (filterLevel === "low" && empSkillLevel !== "low") return false;
      }
    }
    if (selectedGender !== "all" && employee.gender !== selectedGender) return false
    return true
  })
  
  const clearFilters = () => {
    setSelectedDepartment("all")
    setSelectedSkillLevel("all")
    setSelectedGender("all")
    setSelectedFactory("all")
  }

  const totalEmployees = employees.length

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-500 via-purple-300 to-slate-500">

      <div className="container mx-auto py-2 space-y-5">
      {/* Header */}
      <div className="flex flex-col space-y-2">


        {/* Filters Section */}
        <Card className="bg-white shadow-sm border border-gray-200">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-600" />
              <CardTitle className="text-base">Filters</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              {/* Factory Filter */}
              <div className="space-y-1">
                <Label htmlFor="factory-select" className="text-xs font-medium text-gray-600">
                  Factory
                </Label>
                <Select value={selectedFactory} onValueChange={setSelectedFactory}>
                  <SelectTrigger id="factory-select" className="w-full border-gray-300 h-8 text-sm">
                    <SelectValue placeholder="Factory" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Factories</SelectItem>
                    {factories.map((factory) => (
                      <SelectItem key={factory || 'unknown'} value={factory || ''}>
                        {factory?.toUpperCase() || 'Unknown'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Department Filter */}
              <div className="space-y-1">
                <Label htmlFor="department-select" className="text-xs font-medium text-gray-600">
                  Department
                </Label>
                <Select value={selectedDepartment} onValueChange={handleDepartmentChange}>
                  <SelectTrigger id="department-select" className="w-full border-gray-300 h-8 text-sm">
                    <SelectValue placeholder="Department" />
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
              </div>

              {/* Skill Level Filter */}
              <div className="space-y-1">
                <Label htmlFor="skill-select" className="text-xs font-medium text-gray-600">
                  Skill Level
                </Label>
                <Select value={selectedSkillLevel} onValueChange={setSelectedSkillLevel}>
                  <SelectTrigger id="skill-select" className="w-full border-gray-300 h-8 text-sm">
                    <SelectValue placeholder="Skill Level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Levels</SelectItem>
                    <SelectItem value="Advanced">
                      <div className="flex items-center gap-2">
                        <span className="h-3 w-3 rounded-full bg-purple-600"></span>
                        Highly Skilled / Advanced
                      </div>
                    </SelectItem>
                    <SelectItem value="high">
                      <div className="flex items-center gap-2">
                        <span className="h-3 w-3 rounded-full bg-blue-500"></span>
                        Skilled
                      </div>
                    </SelectItem>
                    <SelectItem value="medium">
                      <div className="flex items-center gap-2">
                        <span className="h-3 w-3 rounded-full bg-yellow-400"></span>
                        Semi-Skilled
                      </div>
                    </SelectItem>
                    <SelectItem value="low">
                      <div className="flex items-center gap-2">
                        <span className="h-3 w-3 rounded-full bg-red-500"></span>
                        Low Skilled
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Gender Filter */}
              <div className="space-y-1">
                <Label htmlFor="gender-select" className="text-xs font-medium text-gray-600">
                  Gender
                </Label>
                <Select value={selectedGender} onValueChange={setSelectedGender}>
                  <SelectTrigger id="gender-select" className="w-full border-gray-300 h-8 text-sm">
                    <SelectValue placeholder="Gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Genders</SelectItem>
                    <SelectItem value="Male">Male</SelectItem>
                    <SelectItem value="Female">Female</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Clear Filters Button */}
              <div className="space-y-1">
                <Label className="text-xs font-medium text-gray-600">Actions</Label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearFilters}
                  className="w-full bg-gray-100 border-gray-300 hover:bg-gray-200 text-gray-700 h-8 text-xs"
                >
                  Clear Filters
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Active Filters Display */}
      {(selectedDepartment !== "all" ||
        selectedSkillLevel !== "all" ||
        selectedGender !== "all" ||
        selectedFactory !== "all") && (
        <Card className="bg-gradient-to-r from-blue-50 to-purple-50 shadow-sm border border-blue-200">
          <CardContent className="py-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-medium text-gray-700">Active Filters:</span>
              {selectedFactory !== "all" && (
                <Badge variant="secondary" className="bg-green-100 text-green-800 border border-green-200">
                  Factory: {selectedFactory.toUpperCase()}
                </Badge>
              )}
              {selectedDepartment !== "all" && (
                <Badge variant="secondary" className="bg-blue-100 text-blue-800 border border-blue-200">
                  Department: {selectedDepartment}
                </Badge>
              )}
              {selectedSkillLevel !== "all" && (
                <Badge variant="secondary" className="bg-purple-100 text-purple-800 border border-purple-200">
                  Skill: {selectedSkillLevel}
                </Badge>
              )}
              {selectedGender !== "all" && (
                <Badge variant="secondary" className="bg-pink-100 text-pink-800 border border-pink-200">
                  Gender: {selectedGender}
                </Badge>
              )}
              <span className="text-xs text-muted-foreground ml-2 font-medium">
                Showing {filteredData.length} of {totalEmployees} employees
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Comprehensive Dashboard Overview - TOP SECTION */}
      <Card className="bg-gray-50 shadow-lg border border-gray-200">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-xl">Manufacturing Overview Dashboard</CardTitle>
            <CardDescription>Comprehensive performance and analytics overview</CardDescription>
          </div>
          <FullscreenChart
            title="Manufacturing Overview Dashboard"
            description="Comprehensive performance and analytics overview"
          >
            <DashboardOverview data={filteredData} />
          </FullscreenChart>
        </CardHeader>
        <CardContent>
          <DashboardOverview data={filteredData} />
        </CardContent>
      </Card>

      {/* Detailed Analysis Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* Skill Level Breakdown */}
        <Card className="bg-gray-50 shadow-lg border border-gray-200">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Detailed Skill Level Analysis</CardTitle>
              <CardDescription>Employee skill levels by department and gender</CardDescription>
            </div>
            <FullscreenChart
              title="Detailed Skill Level Analysis"
              description="Employee skill levels by department and gender"
            >
              <SkillLevelBreakdown data={filteredData} />
            </FullscreenChart>
          </CardHeader>
          <CardContent>
            
            <SkillLevelBreakdown data={filteredData} />
          </CardContent>
        </Card>

        {/* Gender Diversity Overview */}
        <Card className="bg-gray-50 shadow-lg border border-gray-200">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Gender Diversity Deep Dive</CardTitle>
              <CardDescription>Gender distribution across departments and skill levels</CardDescription>
            </div>
            <FullscreenChart
              title="Gender Diversity Deep Dive"
              description="Gender distribution across departments and skill levels"
            >
              <GenderDiversityOverview data={filteredData as any} />
            </FullscreenChart>
          </CardHeader>
          <CardContent>
            <GenderDiversityOverview data={filteredData as any} />
          </CardContent>
        </Card>
      </div>

      
       {/* Enhanced Skill Comparison Matrix */}
      <Card className="bg-gray-50 shadow-lg border border-gray-200">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
              <div className="flex items-center gap-2">
                <Target className="h-5 w-5 text-purple-600" />
                <CardTitle>Skills Comparison Matrix</CardTitle>
              </div>
            <CardDescription>
              Skill density and distribution across departments - hover for detailed insights
            </CardDescription>
          </div>
          <FullscreenChart
            title="Skills Comparison Matrix"
            description="Skill density and distribution across departments - hover for detailed insights"
          >
            <EnhancedSkillComparisonMatrix data={filteredData as any} />
          </FullscreenChart>
        </CardHeader>
        <CardContent>
          <EnhancedSkillComparisonMatrix data={filteredData as any} />
        </CardContent>
      </Card>
      {/* Top Employees List */}
      <div className="relative">
        <div className="absolute top-4 right-4 z-10">
          <FullscreenChart title="Top Performing Employees" description="Ranked by skill level and years of experience">
            <TopEmployeesList data={filteredData as any} />
          </FullscreenChart>
        </div>
        <TopEmployeesList data={filteredData as any} />
      </div>

     

      {/* AI Chatbot */}
      <AIChatbot data={filteredData as any} />
      </div>
    </div>
  )
}
