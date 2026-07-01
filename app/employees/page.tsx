"use client";

import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { Search, User, Award, Plus, X, Building2, Trophy, Briefcase, Filter, CalendarDays, MoreHorizontal, Mail, Phone, MapPin, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import Table from "../components/Table";
import type { Department, Employee } from "../types";
import EmployeeInspectionModal from "../components/EmployeeInspectionModal";
import { employeesService } from "@/services/employees.service";
import { departmentsService } from "@/services/departments.service";
import { employeeSkillsService } from "@/services/employee-skills.service";
import { skillsService } from "@/services/skills.service";

import useUserPermissions from "../../hooks/useUserPermissions";

export default function EmployeesPage() {
  const { permissions, userRole } = useUserPermissions();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchEmployeeId, setSearchEmployeeId] = useState("");
  const [selectedDepartmentFilter, setSelectedDepartmentFilter] = useState<string>("all");
  const [isSearching, setIsSearching] = useState(false);
  const [selectedEmployeeForInspection, setSelectedEmployeeForInspection] =
    useState<Employee | null>(null);
  const [employeeWorkHistory, setEmployeeWorkHistory] = useState<any>(null);
  const [isLoadingWorkHistory, setIsLoadingWorkHistory] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  type SkillInput = { name: string; level: string };
  type EmployeeFormData = {
    name: string;
    displayId: string;
    gender: string;
    departmentId: string;
    skills: SkillInput[];
  };
  const [formData, setFormData] = useState<EmployeeFormData>({
    name: "",
    displayId: "",
    gender: "MALE",
    departmentId: "",
    skills: [],
  });
  const [skillInput, setSkillInput] = useState<SkillInput>({ name: "", level: "" });
  const [formError, setFormError] = useState<string | null>(null);

  // State for department metrics
  const [departmentMetrics, setDepartmentMetrics] = useState<
    {
      departmentId: string;
      departmentName: string;
      employeeCount: number;
      topPerformer: Employee | null;
    }[]
  >([]);

  const [allSkills, setAllSkills] = useState<any[]>([]);

  useEffect(() => {
    // Simulate API call
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [empResult, deptResult, skillsResult] = await Promise.all([
            employeesService.getAll(),
            departmentsService.getAll(),
            skillsService.getAll(),
        ]);

        const empData = empResult;
        const deptData = deptResult;
        const allSkillsData = skillsResult;

        if (deptData.success && empResult.success && allSkillsData.success) {
          const departmentsList = (deptData.data ?? []) as any;
          setDepartments(departmentsList);
          setAllSkills(allSkillsData.data ?? []);
          
          const employeesWithSkills = await Promise.all(
            (empData.data ?? []).map(async (emp: any) => {
              const skillsResult = await employeeSkillsService.getByEmployee(emp.id);
              const skills = skillsResult.success ? skillsResult.data : [];
              return {
                  ...emp,
                  skills: skills || [],
                  totalSkills: skills?.length || 0,
                  department: getDepartmentNameFromList(
                    emp.departmentId,
                    departmentsList
                  ),
              };
            })
          );

          setEmployees(employeesWithSkills);

          // Calculate department metrics after both employees and departments are set
          const metrics = calculateDepartmentMetricsFromData(
            employeesWithSkills,
            departmentsList
          );
          setDepartmentMetrics(metrics);
        }
      } catch (err) {
        console.error("Error fetching data:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Function to refresh employee data
  const refreshEmployeeData = async () => {
    try {
      const empResult = await employeesService.getAll();

      if (empResult.success) {
        const employees = (empResult.data || []).map((emp: any) => ({
          ...emp,
          skills: emp.skills || {},
          totalSkills: Object.keys(emp.skills || {}).length,
          department: getDepartmentNameFromList(
            emp.departmentId,
            departments
          ),
        }));
        
        setEmployees(employees);

        // Update department metrics
        const metrics = calculateDepartmentMetricsFromData(employees, departments);
        setDepartmentMetrics(metrics);
        
      }
    } catch (err) {
      console.error("Error refreshing employee data:", err);
    }
  };

  const getDepartmentNameFromList = (
    departmentId: string | number,
    departmentsList: Department[]
  ) => {
    if (!departmentId) return "Unknown Department";
    const department = departmentsList.find((dept) => 
      (dept.id?.toString() ?? "") === departmentId.toString()
    );
    return department ? department.name : "Unknown Department";
  };

  // Helper function to calculate department metrics from data
  const calculateDepartmentMetricsFromData = (
    employeesList: Employee[],
    departmentsList: Department[]
  ) => {

    return departmentsList.map((dept) => {
      const deptIdStr = (dept.id?.toString() ?? "");
      const deptEmployees = employeesList.filter(
        (emp) => (emp.departmentId?.toString() ?? "") === deptIdStr
      );
      const topPerformer = deptEmployees.reduce(
        (top: Employee | null, emp: Employee) =>
          !top || (emp.totalSkills || 0) > (top.totalSkills || 0) ? emp : top,
        null as Employee | null
      );
      return {
        departmentId: deptIdStr,
        departmentName: dept.name,
        employeeCount: deptEmployees.length,
        topPerformer,
      };
    });
  };

  // Helper function to get department name for display
  const getDepartmentName = (departmentId: string | number) => {
    if (!departmentId) return "Unknown Department";
    const department = departments.find((dept) => 
      (dept.id?.toString() ?? "") === departmentId.toString()
    );
    return department ? department.name : "Unknown Department";
  };

  // Enhanced search filter logic using useMemo for performance optimization
  const filteredEmployees = useMemo(() => {
    let result = employees;

    // Apply department filter first
    if (selectedDepartmentFilter && selectedDepartmentFilter !== "all") {
      
      result = result.filter((employee) => {
        // Try multiple possible department ID fields and convert to string for comparison
        const empDeptId = (employee.departmentId || "").toString();
        return empDeptId === selectedDepartmentFilter;
      });
      
    }

    // Apply search filter
    if (!searchEmployeeId.trim()) {
      return result;
    }

    const searchTerm = searchEmployeeId.toLowerCase().trim();

    return result.filter((employee) => {
      // Safe field extraction with fallbacks
      const name = employee.name?.toLowerCase() || "";
      const displayId = employee.displayId?.toLowerCase() || "";
      const departmentName = getDepartmentName(employee.departmentId || "").toLowerCase() || "";

      // Basic field matching
      if (
        name.includes(searchTerm) ||
        displayId.includes(searchTerm) ||
        departmentName.includes(searchTerm)
      ) {
        return true;
      }

      // Advanced skill-based matching
      const skills = employee.skills;
      if (skills) {
        // Check skill names
        const skillNames = Object.keys(skills).map((skill) =>
          skill.toLowerCase()
        );
        if (skillNames.some((skillName) => skillName.includes(searchTerm))) {
          return true;
        }

        // Check skill levels
        const skillLevels = Object.values(skills).map((level) =>
          String(level).toLowerCase()
        );
        if (skillLevels.some((level) => level.includes(searchTerm))) {
          return true;
        }

        // Check combined skill+level combinations (e.g., "cnc skilled")
        const skillCombinations = Object.entries(skills).map(
          ([skill, level]) => `${skill.toLowerCase()} ${String(level).toLowerCase()}`
        );
        if (skillCombinations.some((combo) => combo.includes(searchTerm))) {
          return true;
        }
      }

      return false;
    });
  }, [employees, searchEmployeeId, selectedDepartmentFilter, departments]);

  // Get the first matching employee for single employee display
  const searchedEmployee = useMemo(() => {
    if (!searchEmployeeId.trim()) {
      return null;
    }

    return filteredEmployees.length > 0 ? filteredEmployees[0] : null;
  }, [filteredEmployees, searchEmployeeId]);

  // Check if we should show the search results section
  const shouldShowSearchResults = searchEmployeeId.trim() || selectedDepartmentFilter !== "all";
  
  // Check if we have results to show (either from search or filter)
  const hasResults = filteredEmployees.length > 0;

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchEmployeeId, selectedDepartmentFilter]);

  const itemsPerPage = 10;
  const totalPages = Math.ceil(filteredEmployees.length / itemsPerPage);
  const paginatedEmployees = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredEmployees.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredEmployees, currentPage, itemsPerPage]);

  const getSkillColor = (level: string) => {
    switch (level) {
      case "Expert":
        return "bg-green-100 text-green-800 border-green-200 dark:bg-green-900 dark:text-green-300 dark:border-green-800";
      case "High":
        return "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900 dark:text-blue-300 dark:border-blue-800";
      case "Medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900 dark:text-yellow-300 dark:border-yellow-800";
      case "Low":
        return "bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900 dark:text-orange-300 dark:border-orange-800";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900 dark:text-gray-300 dark:border-gray-800";
    }
  };


  const columns = [
    { 
      key: "employeeId", 
      label: "Employee ID",
      render: (value: any, row: any) => (
        <span className="font-mono text-blue-700 dark:text-blue-300 font-medium">
          {value}
        </span>
      )
    },
    { 
      key: "name", 
      label: "Name",
      render: (value: any, row: any) => (
        <span className="font-semibold text-gray-900 dark:text-gray-100">
          {value}
        </span>
      )
    },
    { 
      key: "department", 
      label: "Department",
      render: (value: any, row: any) => (
        <Badge variant="outline" className="bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 font-medium">
          {value}
        </Badge>
      )
    },
    { 
      key: "gender", 
      label: "Gender",
      render: (value: any, row: any) => (
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
          value === "MALE"
            ? "bg-blue-100 text-blue-800 border border-blue-200"
            : "bg-purple-100 text-purple-800 border border-purple-200"
        }`}>
          {value}
        </span>
      )
    },
    { 
      key: "skills", 
      label: "Skills",
      render: (value: any, row: any) => (
        <div className="flex flex-wrap gap-1 max-w-xs">
          {Array.isArray(value) && value.length > 0 ? (
            value.slice(0, 3).map((skill: any, index: number) => {
              const foundSkill = allSkills.find(s => s._id === skill.skillId || s.id === skill.skillId);
              const skillName = foundSkill ? foundSkill.name : 'Unknown';
              return (
                <Badge
                  key={`${skill.skillId || skill.id || 'skill'}-${index}`}
                  variant="outline"
                  className={`text-sm px-2 py-1 border ${
                    skill.level === "Beginner"
                      ? "bg-yellow-50 text-yellow-800 border-yellow-200"
                      : skill.level === "Intermediate"
                      ? "bg-orange-50 text-orange-800 border-orange-200"
                      : skill.level === "Advanced"
                      ? "bg-green-50 text-green-800 border-green-200"
                      : skill.level === "Expert"
                      ? "bg-blue-50 text-blue-800 border-blue-200"
                      : "bg-gray-50 text-gray-800 border-gray-200"
                  }`}
                >
                  {skillName}
                </Badge>
              );
            })
          ) : (
            <span className="text-sm text-gray-500 italic">No skills</span>
          )}
          {Array.isArray(value) && value.length > 3 && (
            <span className="text-sm text-gray-500">+{value.length - 3} more</span>
          )}
        </div>
      )
    },
    { 
      key: "totalSkills", 
      label: "Total Skills",
      render: (value: any, row: any) => (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium bg-green-100 text-green-800 border border-green-200">
          {value || 0}
        </span>
      )
    },
  ];

  // Employee inspection with API call
  const handleEmployeeInspection = async (employee: any) => {
    const targetId =
      employee?.id?.toString() ||
      employee?.employeeId?.toString() ||
      employee?.displayId?.toString() ||
      "";

    try {
      // Try to fetch the latest employee data from the API
      const apiResult = targetId
        ? await employeesService.getById(targetId)
        : { success: false };

      let employeeData = employee;
      if (apiResult.success && Array.isArray(apiResult.data) && apiResult.data.length > 0) {
        const matchedEmployee = apiResult.data.find((item: any) => {
          const itemId = item?.id?.toString() || "";
          const itemEmployeeId = item?.employeeId?.toString() || "";
          const itemDisplayId = item?.displayId?.toString() || "";
          return (
            (targetId && itemId === targetId) ||
            (targetId && itemEmployeeId === targetId) ||
            (targetId && itemDisplayId === targetId)
          );
        });

        employeeData = matchedEmployee || employee;
      }

      // Fetch skills using the employee-skills endpoints (manager/admin route)
      // Backend: GET /api/users/manager/employees/:employeeId/skills
      let skillsMap: Record<string, string> = (employeeData.skills as any) || {};
      if (targetId) {
        try {
          const result = await employeeSkillsService.getByEmployee(targetId);
          if (result?.success && Array.isArray(result.data)) {
            // Convert array records into the map shape expected by EmployeeInspectionModal
            // UI expects: { [skillNameOrId]: level }
            skillsMap = result.data.reduce((acc: Record<string, string>, s: any) => {
              const key =
                s?.skillId?.toString() ||
                s?.skill?.toString() ||
                s?.skillName?.toString() ||
                "";
              if (!key) return acc;
              acc[key] = s?.level?.toString() || "None";
              return acc;
            }, {});
          }
        } catch (e) {
          console.error("Error fetching employee skills:", e);
          // keep fallback skillsMap
        }
      }

      // Create the work history format that the modal expects
      const workHistoryData = {
        success: true,
        data: [
          {
            displayId: employeeData.displayId || employeeData.employeeId,
            name: employeeData.name,
            gender: employeeData.gender,
            departmentId: employeeData.departmentId,
            skills: skillsMap || {},
          },
        ],
      };

      setEmployeeWorkHistory(workHistoryData);
      setSelectedEmployeeForInspection(employeeData);
    } catch (error) {

      console.error("Error fetching employee data:", error);
      
      // Fall back to original behavior if API call fails
      const workHistoryData = {
        success: true,
        data: [{
          displayId: employee.displayId || employee.employeeId,
          name: employee.name,
          gender: employee.gender,
          departmentId: employee.departmentId,
          skills: employee.skills || {}, // Pass skills directly as object
        }]
      };
      
      setEmployeeWorkHistory(workHistoryData);
      setSelectedEmployeeForInspection(employee);
    }
  };

  // Add a new employee
  const handleNewEmployee = async (data: EmployeeFormData) => {
    const skillsObj: Record<string, string> = {};
    if (Array.isArray(data.skills)) {
      data.skills.forEach(skill => {
        skillsObj[skill.name] = skill.level;
      });
    }

    const newEmployee = {
      name: data.name?.trim() || "",
      displayId: data.displayId?.trim() || "",
      gender: data.gender || "MALE",
      departmentId: data.departmentId || "",
      skills: data.skills || [],
    };


    try {
      const result = await employeesService.create(newEmployee);

      if (!result.success) {
        setFormError(result.error || result.message || 'Failed to add employee');
        return;
      }

      const savedEmployee = result.data as any;

      // Create updated employee object for the UI
      const updatedEmployee: Employee = {
        id: savedEmployee.id,
        name: savedEmployee.name ?? '',
        email: savedEmployee.email ?? '',
        position: savedEmployee.position ?? '',
        skillLevel: savedEmployee.skillLevel ?? '',
        shift: savedEmployee.shift ?? '',
        employmentType: savedEmployee.employmentType ?? '',
        salary: savedEmployee.salary ?? 0,
        hireDate: savedEmployee.hireDate ?? '',
        manager: savedEmployee.manager ?? '',
        isActive: savedEmployee.isActive ?? true,
        skillCount: Object.keys(skillsObj).length,
        yearsExperience: savedEmployee.yearsExperience ?? 0,
        gender: savedEmployee.gender ?? '',
        title: savedEmployee.title ?? '',
        performanceScore: savedEmployee.performanceScore ?? 0,
        displayId: savedEmployee.displayId,
        departmentId: savedEmployee.departmentId,
        skills: skillsObj,
        totalSkills: Object.keys(skillsObj).length,
        department: getDepartmentName(savedEmployee.departmentId || ""),
      };
      
      // Add to employees list
      setEmployees((prev) => [...prev, updatedEmployee]);
      setFormError(null);

      // Refresh employee data to get the latest information
      await refreshEmployeeData();

      // Update department metrics
      setDepartmentMetrics((prev) =>
        prev.map((metric) => {
          if (metric.departmentId === savedEmployee.departmentId) {
            const updatedCount = metric.employeeCount + 1;
            const deptEmployees = [
              ...employees.filter(
                (emp) => emp.departmentId === savedEmployee.departmentId
              ),
              updatedEmployee,
            ];
            const topPerformer = deptEmployees.reduce(
              (top, emp) =>
                !top || (emp.totalSkills || 0) > (top.totalSkills || 0) ? emp : top,
              null as Employee | null
            );
            return {
              ...metric,
              employeeCount: updatedCount,
              topPerformer,
            };
          }
          return metric;
        })
      );

      // Reset form and close modal
      setIsModalOpen(false);
      setFormData({
        name: "",
        displayId: "",
        gender: "MALE",
        departmentId: "",
        skills: [],
      });
      setSkillInput({ name: "", level: "" });
      
    } catch (error) {
      console.error("Error adding employee:", error);
      setFormError("Error adding employee. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">

      <div className="p-6">
        <div className="w-full space-y-8">
        
        {/* Page Title & Actions */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-gray-950 to-gray-700 dark:from-white dark:to-slate-400 bg-clip-text text-transparent">
              Workforce Directory
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Monitor department operator density, analyze top performance, and inspect individual skill matrix levels.
            </p>
          </div>
          {permissions.canAddEmployee && (
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="hidden md:block">
              <Button
                onClick={() => setIsModalOpen(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-md flex items-center gap-2 px-4 py-2.5 h-auto text-sm border-0"
              >
                <Plus className="h-4 w-4" />
                Add New Employee
              </Button>
            </motion.div>
          )}
        </div>

        {/* Department Metrics Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="shadow-lg border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
            <CardHeader className="border-b border-gray-100 dark:border-gray-700/50 pb-4">
              <CardTitle className="flex items-center gap-3 text-xl font-bold text-gray-900 dark:text-white">
                <div className="p-2.5 bg-indigo-50 dark:bg-indigo-950/40 rounded-xl text-indigo-600 dark:text-indigo-400">
                  <Building2 className="h-5 w-5" />
                </div>
                Department Performance &amp; Metrics
              </CardTitle>
              <CardDescription className="text-sm text-gray-500 dark:text-gray-400">
                Live operational metrics, department operator counts, and top performers by facility department.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {departmentMetrics.map((metric, idx) => {
                  const percent = employees.length > 0 
                    ? Math.round((metric.employeeCount / employees.length) * 100) 
                    : 0;

                  const borderColors = [
                    "border-l-blue-500",
                    "border-l-indigo-500",
                    "border-l-emerald-500",
                    "border-l-purple-500",
                    "border-l-orange-500",
                    "border-l-pink-500"
                  ];

                  return (
                    <Card
                      key={metric.departmentId}
                      className={`border border-gray-200/80 dark:border-gray-800 bg-white/95 dark:bg-gray-950/95 shadow-sm hover:shadow-xl hover:scale-[1.01] hover:-translate-y-0.5 transition-all duration-300 flex flex-col justify-between border-l-4 ${borderColors[idx % borderColors.length]} rounded-2xl`}
                    >
                      <CardHeader className="pb-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-base font-bold text-gray-900 dark:text-white">
                              {metric.departmentName}
                            </CardTitle>
                            <span className="text-[10px] text-gray-400 font-semibold tracking-wider uppercase">
                              FACILITY LINE
                            </span>
                          </div>
                          <Badge className="bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-900/50 text-xs px-2.5 py-0.5 rounded-full font-bold">
                            {metric.employeeCount} {metric.employeeCount === 1 ? 'Operator' : 'Operators'}
                          </Badge>
                        </div>
                        
                        {/* Progress visual of department workforce share */}
                        <div className="mt-3.5 space-y-1">
                          <div className="flex justify-between text-[10px] text-muted-foreground font-medium">
                            <span>Workforce Share</span>
                            <span>{percent}%</span>
                          </div>
                          <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
                            <div className="bg-gradient-to-r from-blue-500 to-indigo-600 h-full rounded-full" style={{ width: `${percent}%` }} />
                          </div>
                        </div>
                      </CardHeader>

                      <CardContent className="pt-3 border-t border-gray-100 dark:border-gray-800/80 flex-1 flex flex-col justify-between">
                        {metric.topPerformer ? (
                          <div className="space-y-4">
                            <div className="flex items-center gap-1.5">
                              <Trophy className="h-4 w-4 text-amber-500 fill-amber-500/20" />
                              <span className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Top Performer</span>
                            </div>
                            
                            <div className="flex items-center justify-between gap-3 p-3 rounded-xl bg-amber-50/30 dark:bg-amber-950/10 border border-amber-100/50 dark:border-amber-900/20 shadow-sm">
                              <div className="flex items-center gap-3">
                                <div className="w-9 h-9 bg-gradient-to-tr from-amber-500 to-orange-500 rounded-full flex items-center justify-center shadow text-white font-bold text-xs uppercase flex-shrink-0">
                                  {metric.topPerformer.name.split(" ").map((n: string) => n[0]).slice(0, 2).join("")}
                                </div>
                                <div className="min-w-0">
                                  <h4 className="font-bold text-xs text-gray-900 dark:text-white truncate">
                                    {metric.topPerformer.name}
                                  </h4>
                                  <p className="text-[10px] text-muted-foreground mt-0.5">
                                    ID: {metric.topPerformer.displayId || metric.topPerformer.employeeId} • {metric.topPerformer.totalSkills || 0} Skills
                                  </p>
                                </div>
                              </div>

                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  if (metric.topPerformer) {
                                    refreshEmployeeData().then(() => {
                                      handleEmployeeInspection(metric.topPerformer);
                                    });
                                  }
                                }}
                                disabled={isLoadingWorkHistory}
                                className="h-8 text-xs font-semibold px-2.5 py-1 border border-blue-200 text-blue-600 hover:bg-blue-50 dark:border-blue-900/50 dark:text-blue-400 dark:hover:bg-blue-950/20 shadow-sm transition-all flex-shrink-0"
                              >
                                {isLoadingWorkHistory ? "Loading..." : "Inspect"}
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div className="h-24 flex flex-col items-center justify-center text-center p-3 border border-dashed border-gray-200 dark:border-gray-800 rounded-xl bg-gray-50/50 dark:bg-gray-900/50">
                            <Briefcase className="h-5 w-5 text-gray-400 mb-1.5" />
                            <p className="text-xs text-gray-500 font-medium">
                              No active employees assigned
                            </p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center space-y-4"
        ></motion.div>

        {/* Employee Search Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
        >
          <Card className="shadow-lg border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3 text-xl">
                <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                  <Search className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                Search
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 space-y-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                      id="search-input"
                      placeholder="Search by name, ID, department, or skills..."
                      value={searchEmployeeId}
                      onChange={(e) => setSearchEmployeeId(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter"}
                      className="pl-11 h-12 text-base border-2 border-gray-200 dark:border-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800 transition-all duration-200 bg-white dark:bg-gray-800 shadow-sm hover:shadow-md"
                    />
                  </div>
                </div>
                <div className="w-full sm:w-64 space-y-2">
                  <Select
                    value={selectedDepartmentFilter}
                    onValueChange={setSelectedDepartmentFilter}
                  >
                    <SelectTrigger className="h-12 border-2 border-gray-200 dark:border-gray-700 focus:border-gray-500 focus:ring-2 focus:ring-gray-200 dark:focus:ring-gray-800 transition-all duration-200 bg-white dark:bg-gray-800 shadow-sm hover:shadow-md">
                      <SelectValue placeholder="Filter by Department" />
                    </SelectTrigger>
                    <SelectContent className="border-2 border-gray-200 dark:border-gray-700 shadow-lg">
                      <SelectItem value="all" className="hover:bg-gray-50 dark:hover:bg-gray-900/20">All Departments</SelectItem>
                      {departments.map((dept) => (
                        <SelectItem 
                          key={dept.id} 
                          value={dept.id?.toString() || ""}
                          className="hover:bg-gray-50 dark:hover:bg-gray-900/20"
                        >
                          {dept.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Search Results */}
              {shouldShowSearchResults && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="pt-4"
                >
                  <Separator className="mb-6" />
                  
                  {/* Filter Summary */}
                  <div className="mb-4 flex flex-wrap gap-2 items-center">
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Active Filters:
                    </span>
                    {searchEmployeeId && (
                      <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900 dark:text-blue-300 dark:border-blue-800 shadow-sm hover:shadow-md transition-all duration-200">
                        Search: "{searchEmployeeId}"
                        <Button
                          variant="ghost"
                          size="sm"
                          className="ml-2 p-0 h-4 w-4 hover:bg-blue-200 rounded-full transition-colors duration-200"
                          onClick={() => setSearchEmployeeId("")}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </Badge>
                    )}
                    {selectedDepartmentFilter !== "all" && (
                      <Badge variant="outline" className="bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 shadow-sm hover:shadow-md transition-all duration-200">
                        Department: {getDepartmentName(selectedDepartmentFilter)}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="ml-2 p-0 h-4 w-4 hover:bg-gray-200 rounded-full transition-colors duration-200"
                          onClick={() => setSelectedDepartmentFilter("all")}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </Badge>
                    )}
                    {shouldShowSearchResults && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSearchEmployeeId("");
                          setSelectedDepartmentFilter("all");
                        }}
                        className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-800 border-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-200 dark:border-gray-600 shadow-sm hover:shadow-md transition-all duration-200"
                      >
                        Clear All
                      </Button>
                    )}
                  </div>

                  <div className="mb-4">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Showing {filteredEmployees.length} of {employees.length} employees
                    </span>
                  </div>

                  {/* Show individual employee card only if there's a search term AND results */}
                  {searchedEmployee && searchEmployeeId.trim() ? (
                    <Card className="border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                      <CardContent className="p-6">
                        <div className="flex items-start gap-6">
                          <div className="flex-shrink-0">
                            <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-xl flex items-center justify-center">
                              <User className="h-8 w-8 text-white" />
                            </div>
                          </div>
                          <div className="flex-1 space-y-4">
                            <div className="flex items-start justify-between">
                              <div className="space-y-1">
                                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                                  {searchedEmployee.name}
                                </h3>
                                <p className="text-muted-foreground font-medium">
                                  Employee ID: {(searchedEmployee as any).displayId || (searchedEmployee as any).employeeId} •
                                  Department:{" "}
                                  {getDepartmentName(
                                    (searchedEmployee as any).departmentId
                                  )}
                                </p>
                              </div>
                              <Button
                                onClick={() => {
                                  refreshEmployeeData().then(() => {
                                    handleEmployeeInspection(searchedEmployee);
                                  });
                                }}
                                disabled={isLoadingWorkHistory}
                                className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white shadow-lg"
                              >
                                <Award className="h-4 w-4 mr-2" />
                                {isLoadingWorkHistory ? "Loading..." : "Inspect Skills"}
                              </Button>
                            </div>
                            <div className="space-y-3">
                              <div className="flex items-center gap-2">
                                <Award className="h-5 w-5 text-blue-600" />
                                <span className="font-semibold text-gray-700 dark:text-gray-300">
                                  Machine Skills (
                                  {Object.keys(searchedEmployee.skills || {}).length}{" "}
                                  total)
                                </span>
                              </div>
                              <div className="flex flex-wrap gap-2">
                                {Object.entries(searchedEmployee.skills || {}).map(([skill, level]) => (
                                  <Badge
                                    key={skill}
                                    variant="outline"
                                    className={`${getSkillColor(
                                      String(level || "")
                                    )} font-medium px-3 py-1`}
                                  >
                                    {`${skill || ""}: ${String(level || "")}`}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ) : !hasResults ? (
                    <Card className="border-2 border-red-200 dark:border-red-800 bg-red-50/50 dark:bg-red-950/50">
                      <CardContent className="p-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center">
                            <X className="h-5 w-5 text-red-600 dark:text-red-400" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-red-800 dark:text-red-300">
                              No employees found matching the current filters
                            </h4>
                            <p className="text-sm text-red-600 dark:text-red-400">
                              Try adjusting your search criteria or department filter
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ) : null}
                </motion.div>
              )}
            </CardContent>
          </Card>

          {/* All Employees Table */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <Card className="shadow-lg border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm overflow-hidden">
              <CardHeader className="border-b border-gray-100 dark:border-gray-700/50 pb-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div>
                    <CardTitle className="text-lg font-bold text-gray-900 dark:text-white">
                      Active Workforce Registry
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Filtered results showing active line operators and their certifications.
                    </CardDescription>
                  </div>
                  <Badge variant="secondary" className="w-fit font-bold text-xs bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200">
                    {filteredEmployees.length} Operators Total
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-6 space-y-6">
                <Table
                  columns={columns}
                  data={paginatedEmployees}
                  isLoading={isLoading}
                  emptyMessage="No employees found"
                  startIndex={(currentPage - 1) * itemsPerPage}
                  onInspect={(employee) => {
                    refreshEmployeeData().then(() => {
                      handleEmployeeInspection(employee);
                    });
                  }}
                />

                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-gray-100 dark:border-gray-800/80">
                    <span className="text-xs text-muted-foreground font-medium">
                      Showing <span className="font-semibold text-foreground">{(currentPage - 1) * itemsPerPage + 1}</span> to{" "}
                      <span className="font-semibold text-foreground">
                        {Math.min(currentPage * itemsPerPage, filteredEmployees.length)}
                      </span>{" "}
                      of <span className="font-semibold text-foreground">{filteredEmployees.length}</span> operators
                    </span>

                    <div className="flex items-center gap-1.5">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className="h-8 w-8 p-0 border border-gray-200 dark:border-gray-800 hover:bg-slate-50 dark:hover:bg-slate-900"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>

                      {/* Dynamic page numbers */}
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => {
                        // Show first, last, current, and adjacent pages
                        if (
                          pageNum === 1 ||
                          pageNum === totalPages ||
                          Math.abs(pageNum - currentPage) <= 1
                        ) {
                          return (
                            <Button
                              key={pageNum}
                              variant={currentPage === pageNum ? "default" : "outline"}
                              size="sm"
                              onClick={() => setCurrentPage(pageNum)}
                              className={`h-8 w-8 p-0 text-xs font-semibold ${
                                currentPage === pageNum
                                  ? "bg-blue-600 hover:bg-blue-700 text-white shadow-sm border-0"
                                  : "border border-gray-200 dark:border-gray-800 hover:bg-slate-50 dark:hover:bg-slate-900"
                              }`}
                            >
                              {pageNum}
                            </Button>
                          );
                        }
                        
                        // Render ellipsis for skipped ranges
                        if (
                          pageNum === 2 ||
                          pageNum === totalPages - 1
                        ) {
                          return (
                            <span key={`ellipsis-${pageNum}`} className="text-xs text-muted-foreground px-1.5 font-medium select-none">
                              ...
                            </span>
                          );
                        }

                        return null;
                      })}

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className="h-8 w-8 p-0 border border-gray-200 dark:border-gray-800 hover:bg-slate-50 dark:hover:bg-slate-900"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </div>

      {/* Employee Inspection Modal */}
      <EmployeeInspectionModal
        employee={selectedEmployeeForInspection}
        workHistory={employeeWorkHistory}
        isOpen={!!selectedEmployeeForInspection}
        onClose={() => {
          setSelectedEmployeeForInspection(null);
          setEmployeeWorkHistory(null);
        }}
      />

      {/* Add New Employee Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">
              Add New Employee
            </DialogTitle>
            <DialogDescription>
              Enter the employee details to add them to the system.
            </DialogDescription>
          </DialogHeader>
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              await handleNewEmployee(formData);
              // Only reset form and close modal if there's no error
              if (!formError) {
                setIsModalOpen(false);
                setFormData({
                  name: "",
                  displayId: "",
                  gender: "MALE",
                  departmentId: "",
                  skills: [],
                });
                setSkillInput({ name: "", level: "" });
                setFormError(null);
              }
            }}
            className="space-y-6"
          >
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium">
                  Full Name *
                </Label>
                <Input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="Enter full name"
                  className="h-11"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="displayId" className="text-sm font-medium">
                  Card Number (Display ID) *
                </Label>
                <Input
                  id="displayId"
                  type="text"
                  value={formData.displayId}
                  onChange={(e) =>
                    setFormData({ ...formData, displayId: e.target.value })
                  }
                  placeholder="Enter card number"
                  className="h-11"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="gender" className="text-sm font-medium">
                  Gender
                </Label>
                <Select
                  value={formData.gender}
                  onValueChange={(value) =>
                    setFormData({
                      ...formData,
                      gender: value as "MALE" | "FEMALE",
                    })
                  }
                >
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MALE">Male</SelectItem>
                    <SelectItem value="FEMALE">Female</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="departmentId" className="text-sm font-medium">
                  Department *
                </Label>
                <Select
                  value={formData.departmentId || ""}
                  onValueChange={(value) =>
                    setFormData({ ...formData, departmentId: value || "" })
                  }
                >
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map((dept) => (
                      <SelectItem key={dept.id} value={dept.id?.toString() || ""}>
                        {dept.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {/* Skills Input Section */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Skills</Label>
                <div className="flex gap-2">
                  <Input
                    type="text"
                    placeholder="Skill name"
                    value={skillInput.name || ""}
                    onChange={(e) => setSkillInput({ ...skillInput, name: e.target.value || "" })}
                    className="h-11"
                  />
                  <Select
                    value={skillInput.level || ""}
                    onValueChange={(value) => setSkillInput({ ...skillInput, level: value || "" })}
                  >
                    <SelectTrigger className="h-11 w-32">
                      <SelectValue placeholder={"Level"} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Low">Low</SelectItem>
                      <SelectItem value="Medium">Medium</SelectItem>
                      <SelectItem value="High">High</SelectItem>
                      <SelectItem value="Expert">Expert</SelectItem>
                      {/* <SelectItem value="Advanced">Advanced</SelectItem> */}
                    </SelectContent>
                  </Select>
                  <Button
                    type="button"
                    onClick={() => {
                      if (skillInput.name && skillInput.level) {
                        setFormData((prev) => ({
                          ...prev,
                          skills: [...(prev.skills || []), { name: skillInput.name, level: skillInput.level }],
                        }));
                        setSkillInput({ name: "", level: "" });
                      }
                    }}
                    className="h-11"
                  >
                    Add Skill
                  </Button>
                </div>
                {/* List of added skills */}
                {Array.isArray(formData.skills) && formData.skills.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {Array.isArray(formData.skills) && formData.skills.map((skill: SkillInput, idx: number) => (
                      <Badge key={idx} variant="outline" className="px-3 py-1">
                        {`${String(skill.name) || ""}: ${String(skill.level) || ""}`}
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          className="ml-2 p-0 h-4 w-4"
                          onClick={() => {
                            setFormData((prev) => ({
                              ...prev,
                              skills: prev.skills.filter((_, i) => i !== idx),
                            }));
                          }}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <DialogFooter className="gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsModalOpen(false);
                  setFormData({
                    name: "",
                    displayId: "",
                    gender: "MALE",
                    departmentId: "",
                    skills: [],
                  });
                  setSkillInput({ name: "", level: "" });
                  setFormError(null); // Reset error when canceling
                }}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={
                  !formData.name.trim() ||
                  !formData.displayId.trim() ||
                  !formData.departmentId ||
                  formData.skills.length === 0
                }
                className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Save Employee
              </Button>
            </DialogFooter>
            {formError && (
              <div className="text-red-600 text-sm font-medium mt-2">{formError}</div>
            )}
          </form>
        </DialogContent>
      </Dialog>

      {/* Floating Action Button - Only for Managers and Admins */}
      {permissions.canAddEmployee && (
        <motion.div
          className="fixed bottom-8 right-8 z-50"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          <Button
            onClick={() => setIsModalOpen(true)}
            size="lg"
            className="h-14 w-14 rounded-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 shadow-2xl border-0"
            title="Add New Employee"
          >
            <Plus className="h-6 w-6" />
          </Button>
        </motion.div>
      )}
      </div>
    </div>
  );
}
