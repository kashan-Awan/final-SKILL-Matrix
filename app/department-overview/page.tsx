"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Building2, Users, TrendingUp, Award, Star, Target, Trophy } from "lucide-react";
import { useEmployees } from "../../hooks/useEmployees";
import DatabaseLoading from "../components/DatabaseLoading";
import DatabaseError from "../components/DatabaseError";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function DepartmentOverviewPage() {
  const { employees, loading, error, refetch } = useEmployees();
  const [selectedDepartment, setSelectedDepartment] = useState<string>("all");

  if (loading) {
    return <DatabaseLoading message="Loading department data from SQL database..." />;
  }

  if (error) {
    return <DatabaseError error={error} onRetry={refetch} />;
  }

  // Get unique departments
  const departments = [...new Set(employees.map(emp => emp.department))].sort();

  // Calculate department statistics
  const departmentStats = useMemo(() => {
    const stats = departments.map(dept => {
      const deptEmployees = employees.filter(emp => emp.department === dept);
      
      const skillDistribution = deptEmployees.reduce((acc, emp) => {
        acc[emp.skillLevel] = (acc[emp.skillLevel] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const avgPerformance = deptEmployees.length > 0 
        ? Math.round(deptEmployees.reduce((sum, emp) => sum + emp.performanceScore, 0) / deptEmployees.length)
        : 0;

      const avgExperience = deptEmployees.length > 0 
        ? Math.round(deptEmployees.reduce((sum, emp) => sum + emp.yearsExperience, 0) / deptEmployees.length)
        : 0;

      const topPerformer = deptEmployees.reduce((top, emp) => 
        !top || emp.performanceScore > top.performanceScore ? emp : top, 
        null as any
      );

      const genderDistribution = deptEmployees.reduce((acc, emp) => {
        acc[emp.gender] = (acc[emp.gender] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      return {
        name: dept,
        employeeCount: deptEmployees.length,
        skillDistribution,
        avgPerformance,
        avgExperience,
        topPerformer,
        genderDistribution,
        employees: deptEmployees
      };
    }).sort((a, b) => b.employeeCount - a.employeeCount);
    
    return stats;
  }, [employees, departments]);

  const filteredStats = selectedDepartment === "all" 
    ? departmentStats 
    : departmentStats.filter(dept => dept.name === selectedDepartment);

  const getSkillLevelColor = (level: string) => {
    switch (level) {
      case "Expert": return "bg-purple-100 text-purple-800";
      case "High": return "bg-blue-100 text-blue-800";
      case "Medium": return "bg-yellow-100 text-yellow-800";
      case "Low": return "bg-orange-100 text-orange-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="min-h-screen bg-white p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <h1 className="text-4xl font-bold text-blue-900 mb-2">
            Department Overview
          </h1>
          <p className="text-gray-600 text-lg">
            Comprehensive analysis of {employees.length} employees across {departments.length} manufacturing departments
          </p>
        </motion.div>

        {/* Department Filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex justify-center"
        >
          <Card className="w-96">
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <Building2 className="h-5 w-5 text-gray-600" />
                <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Departments</SelectItem>
                    {departments.map((dept) => (
                      <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button variant="outline" size="sm" onClick={refetch}>
                  <TrendingUp className="h-4 w-4 mr-1" />
                  Refresh
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Department Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-6"
        >
          {filteredStats.map((dept, index) => (
            <Card key={dept.name} className="overflow-hidden">
              <CardHeader className="bg-blue-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                      <Building2 className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-xl">{dept.name}</CardTitle>
                      <CardDescription>{dept.employeeCount} employees</CardDescription>
                    </div>
                  </div>
                  <Badge variant="outline" className="bg-white">
                    Rank #{index + 1}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="p-6 space-y-6">
                
                {/* Key Metrics */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <Target className="h-4 w-4 text-blue-600" />
                      <span className="text-2xl font-bold text-blue-600">{dept.avgPerformance}%</span>
                    </div>
                    <p className="text-sm text-gray-600">Avg Performance</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <Star className="h-4 w-4 text-yellow-600" />
                      <span className="text-2xl font-bold text-yellow-600">{dept.avgExperience}</span>
                    </div>
                    <p className="text-sm text-gray-600">Avg Years Exp</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <Users className="h-4 w-4 text-green-600" />
                      <span className="text-2xl font-bold text-green-600">{dept.employeeCount}</span>
                    </div>
                    <p className="text-sm text-gray-600">Total Staff</p>
                  </div>
                </div>

                {/* Skill Distribution */}
                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <Award className="h-4 w-4" />
                    Skill Level Distribution
                  </h4>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(dept.skillDistribution).map(([level, count]) => (
                      <div key={level} className="flex items-center justify-between p-2 rounded-lg bg-gray-50">
                        <Badge className={getSkillLevelColor(level)}>
                          {level}
                        </Badge>
                        <span className="font-semibold">{count}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Top Performer */}
                {dept.topPerformer && (
                  <div>
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                      <Trophy className="h-4 w-4 text-yellow-600" />
                      Top Performer
                    </h4>
                    <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg">
                      <div className="w-10 h-10 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full flex items-center justify-center">
                        <Star className="h-5 w-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold">{dept.topPerformer.name}</p>
                        <p className="text-sm text-gray-600">{dept.topPerformer.position}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-yellow-600">{dept.topPerformer.performanceScore}%</p>
                        <p className="text-xs text-gray-500">{dept.topPerformer.yearsExperience}y exp</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Gender Distribution */}
                <div>
                  <h4 className="font-semibold mb-3">Gender Distribution</h4>
                  <div className="flex gap-4">
                    {Object.entries(dept.genderDistribution).map(([gender, count]) => (
                      <div key={gender} className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${gender === 'Male' ? 'bg-blue-500' : 'bg-pink-500'}`}></div>
                        <span className="text-sm">{gender}: {count}</span>
                      </div>
                    ))}
                  </div>
                </div>

              </CardContent>
            </Card>
          ))}
        </motion.div>

        {/* Summary Statistics */}
        {selectedDepartment === "all" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Overall Company Statistics</CardTitle>
                <CardDescription>Manufacturing company overview</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600 mb-2">{employees.length}</div>
                    <p className="text-gray-600">Total Employees</p>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-purple-600 mb-2">{departments.length}</div>
                    <p className="text-gray-600">Departments</p>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600 mb-2">
                      {Math.round(employees.reduce((sum, emp) => sum + emp.performanceScore, 0) / employees.length)}%
                    </div>
                    <p className="text-gray-600">Avg Performance</p>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-yellow-600 mb-2">
                      {Math.round(employees.reduce((sum, emp) => sum + emp.yearsExperience, 0) / employees.length)}
                    </div>
                    <p className="text-gray-600">Avg Experience</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

      </div>
    </div>
  );
}
