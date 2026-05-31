"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Target, TrendingUp, Users, Award, Filter, RotateCcw, Factory, Cog, RefreshCw, AlertTriangle } from "lucide-react"
import { useSkillsMatrixScores } from "@/hooks/useSkillsMatrixScores"

// Use a flexible interface that matches the actual employee data structure
interface FlexibleEmployee {
  id?: string
  name?: string
  gender?: string
  department?: string  // department name, not ID
  title?: string
  position?: string
  skillLevel?: string
  skills?: string[] | Record<string, string>
  yearsExperience?: number
  certifications?: string[]
  factory?: string
}

interface EnhancedSkillComparisonMatrixProps {
  data: FlexibleEmployee[]
}

export default function EnhancedSkillComparisonMatrix({ data }: EnhancedSkillComparisonMatrixProps) {
  const [selectedDepartment, setSelectedDepartment] = useState<string>("all")
  const [viewMode, setViewMode] = useState<"departments" | "machines">("departments")
  
  // Only use API when no department filter is applied (since API expects department IDs, not names)
  // When department filter is applied, we'll use employee data directly
  const { data: skillsData, loading, error, refetch } = useSkillsMatrixScores(
    selectedDepartment === "all" ? undefined : undefined // Always undefined since we have department names, not IDs
  );

  // Get unique departments from employee data for filter
  const departments = [...new Set(
    data
      .map((employee) => employee.department)
      .filter(Boolean) // Remove undefined/null values
  )] as string[];

  // Helper function to normalize skill levels (treat Expert as Advanced)
  const normalizeSkillLevel = (skillLevel: string | undefined) => {
    if (!skillLevel) return '';
    const lowerSkill = skillLevel.toLowerCase();
    if (lowerSkill === 'expert' || lowerSkill === 'advanced') return 'Advanced';
    return skillLevel;
  };

  // Calculate skills grouped by department for machines/skills view
  const calculateSkillsByDepartment = () => {
    
    // Filter data by selected department
    const filteredData = selectedDepartment === "all" 
      ? data.filter(emp => emp.department && emp.skills) 
      : data.filter(emp => emp.department === selectedDepartment && emp.skills);
    

    const departmentSkillsMap = new Map();
    
    filteredData.forEach(employee => {
      const dept = employee.department;
      if (!departmentSkillsMap.has(dept)) {
        departmentSkillsMap.set(dept, new Map());
      }
      
      const departmentSkills = departmentSkillsMap.get(dept);
      
      if (employee.skills) {
        Object.entries(employee.skills).forEach(([skillName, skillLevel]) => {
          if (!departmentSkills.has(skillName)) {
            departmentSkills.set(skillName, {
              name: skillName,
              totalEmployees: 0,
              skillLevels: {
                Low: 0,
                Medium: 0,
                High: 0,
                Advanced: 0  // Expert and Advanced are now the same
              },
              employees: [],
              // Determine if this appears to be a machine-related skill
              isMachineRelated: skillName.includes('-') || 
                              skillName.includes('PB-') || 
                              skillName.includes('LX-') || 
                              skillName.toLowerCase().includes('machine') ||
                              skillName.toLowerCase().includes('cutter') ||
                              skillName.toLowerCase().includes('brake') ||
                              skillName.toLowerCase().includes('press')
            });
          }
          
          const skillData = departmentSkills.get(skillName);
          skillData.totalEmployees += 1;
          
          // Normalize skill level for consistent counting (Expert and Advanced are the same)
          const normalizedLevel = skillLevel === 'Expert' || skillLevel === 'Advanced' ? 'Advanced' : 
                                skillLevel === 'High' ? 'High' :
                                skillLevel === 'Medium' ? 'Medium' : 'Low';
          
          skillData.skillLevels[normalizedLevel] = (skillData.skillLevels[normalizedLevel] || 0) + 1;
          skillData.employees.push({
            name: employee.name,
            department: employee.department,
            level: skillLevel
          });
        });
      }
    });

    // Convert to structured format grouped by department
    const departmentSkillsArray = Array.from(departmentSkillsMap.entries()).map(([deptName, skillsMap]) => {
      const skillsArray = Array.from(skillsMap.values()).map((skill: any) => {
        // Calculate weighted average score (Advanced=4, High=3, Medium=2, Low=1)
        const levelWeights = { Advanced: 4, High: 3, Medium: 2, Low: 1 };
        let totalWeightedScore = 0;
        let totalCount = 0;
        
        Object.entries(skill.skillLevels).forEach(([level, count]) => {
          const numCount = Number(count) || 0;
          totalWeightedScore += (levelWeights[level as keyof typeof levelWeights] || 0) * numCount;
          totalCount += numCount;
        });
        
        const averageScore = totalCount > 0 ? (totalWeightedScore / totalCount).toFixed(2) : 0;
        
        return {
          ...skill,
          averageScore: parseFloat(averageScore as string),
          averagePercentage: Math.round((parseFloat(averageScore as string) / 4) * 100) // Changed from /5 to /4 since max is now 4
        };
      });

      // Sort skills by total employees (most skilled employees first), then by average score
      skillsArray.sort((a, b) => {
        if (b.totalEmployees !== a.totalEmployees) {
          return b.totalEmployees - a.totalEmployees;
        }
        return b.averageScore - a.averageScore;
      });

      return {
        departmentName: deptName,
        skills: skillsArray,
        totalSkills: skillsArray.length,
        totalEmployeesWithSkills: [...new Set(skillsArray.flatMap(skill => skill.employees.map((emp: any) => emp.name)))].length
      };
    });

    // Sort departments by total skills count
    departmentSkillsArray.sort((a, b) => b.totalSkills - a.totalSkills);
    
    if (departmentSkillsArray.length > 0) {
    }
    
    return departmentSkillsArray;
  };

  // Calculate department data from employee data directly (as fallback/alternative)
  const calculateDepartmentDataFromEmployees = () => {
    
    // Filter data by selected department using department name
    const filteredData = selectedDepartment === "all" 
      ? data.filter(emp => emp.department) // Only include employees with department
      : data.filter(emp => emp.department === selectedDepartment);
    

    const departmentGroups = departments.map(dept => {
      const deptEmployees = filteredData.filter(emp => emp.department === dept);
      
      if (deptEmployees.length === 0) return null;

      // Calculate skill breakdown from employee skillLevel (treating Expert as Advanced)
      const skillBreakdown = {
        Low: deptEmployees.filter(emp => emp.skillLevel === 'Low').length,
        Medium: deptEmployees.filter(emp => emp.skillLevel === 'Medium').length,
        High: deptEmployees.filter(emp => emp.skillLevel === 'High').length,
        Advanced: deptEmployees.filter(emp => emp.skillLevel === 'Advanced' || emp.skillLevel === 'Expert').length
      };

      // Calculate average score (treating Expert and Advanced as same level = 4)
      const skillLevelMap = { Low: 1, Medium: 2, High: 3, Advanced: 4, Expert: 4 };
      const totalScore = deptEmployees.reduce((sum, emp) => {
        return sum + (skillLevelMap[emp.skillLevel as keyof typeof skillLevelMap] || 1);
      }, 0);
      const averageScore = Math.round((totalScore / deptEmployees.length) * 25); // 25% per level since max is 4

      return {
        department: {
          id: dept,
          name: dept,
          employeeCount: deptEmployees.length,
          averageScore: averageScore,
          skillBreakdown: skillBreakdown
        },
        machines: [] // We don't have machine data from employee records
      };
    }).filter(item => item !== null);

    return departmentGroups;
  };

  // Use employee-based calculation always since API expects department IDs but we have names
  // If we had a mapping from department names to IDs, we could use the API
  const displayData = calculateDepartmentDataFromEmployees();

  // Get score color based on percentage
  const getScoreColor = (score: number) => {
    if (score >= 90) return "bg-gradient-to-br from-green-500 to-green-600 text-white font-semibold"
    if (score >= 80) return "bg-gradient-to-br from-blue-500 to-blue-600 text-white font-semibold"
    if (score >= 70) return "bg-gradient-to-br from-yellow-400 to-yellow-500 text-black font-semibold"
    if (score >= 60) return "bg-gradient-to-br from-orange-400 to-orange-500 text-white font-semibold"
    return "bg-gradient-to-br from-red-400 to-red-500 text-white font-semibold"
  }

  // Get skill level distribution color (Expert and Advanced are treated the same)
  const getSkillDistributionColor = (level: string) => {
    switch (level) {
      case "Expert":
      case "Advanced":
        return "bg-purple-100 text-purple-800 border-purple-200"
      case "High":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "Medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "Low":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const resetFilters = () => {
    setSelectedDepartment("all")
    setViewMode("departments")
  }

  // Shared filter controls component
  const FilterControls = () => (
    <div className="flex flex-wrap items-center gap-3">
      <div className="flex items-center gap-2">
        <Filter className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-medium">Department:</span>
        <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select department" />
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

      <div className="flex items-center gap-2">
        <span className="text-sm font-medium">View:</span>
        <Button
          variant={viewMode === "departments" ? "default" : "outline"}
          size="sm"
          onClick={() => setViewMode(viewMode === "departments" ? "machines" : "departments")}
          className="gap-2"
        >
          {viewMode === "departments" ? (
            <>
              <Factory className="h-4 w-4" />
              Departments
            </>
          ) : (
            <>
              <Cog className="h-4 w-4" />
              Skills/Machines
            </>
          )}
        </Button>
      </div>

      <Button onClick={resetFilters} variant="outline" size="sm" className="gap-2">
        <RotateCcw className="h-4 w-4" />
        Reset
      </Button>
    </div>
  )

  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
           
            <FilterControls />
          </div>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-64">
          <div className="flex items-center gap-2">
            <RefreshCw className="h-6 w-6 animate-spin text-gray-400" />
            <span className="text-gray-600">Loading employee data...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Removed error handling since we're using employee data directly

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
          
            <CardDescription>
              Department and employee skills overview from employee data
            </CardDescription>
          </div>
          <FilterControls />
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Department View */}
        {viewMode === "departments" && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {displayData.map((item) => (
                <Card key={item.department.id} className="border-2 hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <Factory className="h-5 w-5 text-blue-600" />
                        {item.department.name}
                      </CardTitle>
                      <Badge className={getScoreColor(item.department.averageScore)}>
                        {item.department.averageScore}%
                      </Badge>
                    </div>
                    <CardDescription className="flex items-center gap-4">
                      <span className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        {item.department.employeeCount} employees
                      </span>
                      <span className="flex items-center gap-1">
                        <Cog className="h-4 w-4" />
                        {item.machines.length} machines
                      </span>
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm font-medium mb-2">Skill Level Breakdown:</p>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          {Object.entries(item.department.skillBreakdown || {})
                            .filter(([level, count]) => level && level !== 'undefined' && count > 0)
                            .map(([level, count]) => (
                            <div key={level} className="flex justify-between items-center">
                              <Badge 
                                variant="outline" 
                                className={`${getSkillDistributionColor(level)} text-xs`}
                              >
                                {level}
                              </Badge>
                              <span className="font-medium">{count}</span>
                            </div>
                          ))}
                          {Object.entries(item.department.skillBreakdown || {})
                            .filter(([level, count]) => level && level !== 'undefined' && count > 0).length === 0 && (
                            <p className="text-xs text-gray-500 italic col-span-2">No skill data available</p>
                          )}
                        </div>
                      </div>
                      <div className="pt-2 border-t">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => {
                            setSelectedDepartment(item.department.name);
                            setViewMode("machines");
                          }}
                          className="w-full"
                        >
                          View Skills/Machines
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Skills/Machines View - Grouped by Department */}
        {viewMode === "machines" && (
          <div className="space-y-6">
            {calculateSkillsByDepartment().map((department, deptIndex) => (
              <Card key={`dept-${deptIndex}`} className="border-2 border-blue-200">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Factory className="h-6 w-6 text-blue-600" />
                      <div>
                        <CardTitle className="text-xl">{department.departmentName}</CardTitle>
                        <CardDescription>
                          {department.totalSkills} skills/machines • {department.totalEmployeesWithSkills} skilled employees
                        </CardDescription>
                      </div>
                    </div>
                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                      {department.totalSkills} Skills
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-3">
                    {department.skills.map((skill: any, skillIndex: number) => (
                      <Card key={`skill-${skillIndex}`} className="bg-gray-50 border border-gray-200">
                        <CardContent className="p-4">
                          <div className="flex flex-col space-y-3">
                            {/* Skill Header */}
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-lg ${skill.isMachineRelated ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>
                                  {skill.isMachineRelated ? (
                                    <Cog className="h-4 w-4" />
                                  ) : (
                                    <Target className="h-4 w-4" />
                                  )}
                                </div>
                                <div>
                                  <h4 className="font-semibold text-base">{skill.name}</h4>
                                  <p className="text-sm text-muted-foreground">
                                    {skill.isMachineRelated ? 'Machine/Equipment Skill' : 'General Skill'}
                                  </p>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="text-xl font-bold text-blue-600">{skill.totalEmployees}</div>
                                <div className="text-xs text-muted-foreground">Skilled Employees</div>
                              </div>
                            </div>

                            {/* Average Score */}
                            <div className="flex items-center gap-4">
                              <div className="flex-1">
                                <div className="flex items-center justify-between mb-1">
                                  <span className="text-sm font-medium">Average Skill Level</span>
                                  <span className={`text-sm font-semibold px-2 py-1 rounded ${
                                    skill.averagePercentage >= 80 ? 'bg-green-100 text-green-800' :
                                    skill.averagePercentage >= 60 ? 'bg-blue-100 text-blue-800' :
                                    skill.averagePercentage >= 40 ? 'bg-yellow-100 text-yellow-800' :
                                    'bg-red-100 text-red-800'
                                  }`}>
                                    {skill.averageScore}/4 ({skill.averagePercentage}%)
                                  </span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                  <div 
                                    className={`h-2 rounded-full transition-all duration-300 ${
                                      skill.averagePercentage >= 80 ? 'bg-green-500' :
                                      skill.averagePercentage >= 60 ? 'bg-blue-500' :
                                      skill.averagePercentage >= 40 ? 'bg-yellow-500' :
                                      'bg-red-500'
                                    }`}
                                    style={{ width: `${skill.averagePercentage}%` }}
                                  ></div>
                                </div>
                              </div>
                            </div>

                            {/* Skill Level Breakdown */}
                            <div className="space-y-2">
                              <h5 className="text-sm font-medium text-muted-foreground">Skill Level Distribution</h5>
                              <div className="grid grid-cols-4 gap-2">
                                {Object.entries(skill.skillLevels).map(([level, count]) => (
                                  <div key={level} className="text-center">
                                    <div className={`p-2 rounded-lg border-2 ${getSkillDistributionColor(level)}`}>
                                      <div className="font-bold text-sm">{count as number}</div>
                                      <div className="text-xs font-medium">{level}</div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Employee Details (Collapsible) */}
                            <details className="group">
                              <summary className="cursor-pointer text-sm font-medium text-blue-600 hover:text-blue-800 flex items-center gap-1">
                                <TrendingUp className="h-4 w-4 transition-transform group-open:rotate-180" />
                                View {skill.totalEmployees} Skilled Employee{skill.totalEmployees !== 1 ? 's' : ''}
                              </summary>
                              <div className="mt-2 space-y-1 pl-5">
                                {skill.employees.map((emp: any, empIndex: number) => (
                                  <div key={empIndex} className="flex items-center justify-between text-sm p-2 bg-white rounded border">
                                    <span className="font-medium">{emp.name}</span>
                                    <span className={`px-2 py-1 rounded text-xs font-medium ${getSkillDistributionColor(emp.level)}`}>
                                      {emp.level}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </details>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
            
            {calculateSkillsByDepartment().length === 0 && (
              <div className="text-center py-8">
                <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Skills Data Available</h3>
                <p className="text-gray-500">No employees with skills found for the selected department.</p>
                <Button 
                  onClick={() => setSelectedDepartment("all")} 
                  variant="outline" 
                  className="mt-4"
                >
                  View All Departments
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Summary Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4">
          {viewMode === "departments" ? (
            // Department view statistics
            <>
              <Card className="bg-gradient-to-br from-blue-50 to-blue-100">
                <CardContent className="p-3">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-blue-600" />
                    <div>
                      <p className="text-xs font-medium text-gray-700">Highest Department Score</p>
                      <p className="text-base font-bold text-blue-600">
                        {displayData.length > 0 && 
                          Math.max(...displayData.map(item => item.department.averageScore))}%
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-green-50 to-green-100">
                <CardContent className="p-3">
                  <div className="flex items-center gap-2">
                    <Award className="h-4 w-4 text-green-600" />
                    <div>
                      <p className="text-xs font-medium text-gray-700">Total Machines</p>
                      <p className="text-base font-bold text-green-600">
                        {displayData.reduce((total, item) => total + item.machines.length, 0)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-50 to-purple-100">
                <CardContent className="p-3">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-purple-600" />
                    <div>
                      <p className="text-xs font-medium text-gray-700">Total Employees</p>
                      <p className="text-base font-bold text-purple-600">
                        {displayData.reduce((total, item) => total + item.department.employeeCount, 0)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            // Machine/Skills view statistics
            <>
              <Card className="bg-gradient-to-br from-blue-50 to-blue-100">
                <CardContent className="p-3">
                  <div className="flex items-center gap-2">
                    <Cog className="h-4 w-4 text-blue-600" />
                    <div>
                      <p className="text-xs font-medium text-gray-700">Total Skills/Machines</p>
                      <p className="text-base font-bold text-blue-600">
                        {calculateSkillsByDepartment().reduce((total, dept) => total + dept.totalSkills, 0)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-green-50 to-green-100">
                <CardContent className="p-3">
                  <div className="flex items-center gap-2">
                    <Award className="h-4 w-4 text-green-600" />
                    <div>
                      <p className="text-xs font-medium text-gray-700">Highest Skill Average</p>
                      <p className="text-base font-bold text-green-600">
                        {calculateSkillsByDepartment().length > 0 ? 
                          `${Math.max(...calculateSkillsByDepartment().flatMap(dept => dept.skills.map((skill: any) => skill.averagePercentage)))}%` 
                          : '0%'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-50 to-purple-100">
                <CardContent className="p-3">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-purple-600" />
                    <div>
                      <p className="text-xs font-medium text-gray-700">Total Skilled Employees</p>
                      <p className="text-base font-bold text-purple-600">
                        {calculateSkillsByDepartment().reduce((total, dept) => total + dept.totalEmployeesWithSkills, 0)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

// Helper functions for styling
function getScoreColor(score: number): string {
  if (score >= 80) return "bg-green-100 text-green-800 border-green-200"
  if (score >= 60) return "bg-blue-100 text-blue-800 border-blue-200"
  if (score >= 40) return "bg-orange-100 text-orange-800 border-orange-200"
  return "bg-red-100 text-red-800 border-red-200"
}

function getSkillDistributionColor(level: string): string {
  switch (level.toLowerCase()) {
    case "low":
      return "bg-red-50 text-red-700 border-red-200"
    case "medium":
      return "bg-yellow-50 text-yellow-700 border-yellow-200"
    case "high":
      return "bg-blue-50 text-blue-700 border-blue-200"
    case "advanced":
    case "expert":
      return "bg-green-50 text-green-700 border-green-200"
    default:
      return "bg-gray-50 text-gray-700 border-gray-200"
  }
}
