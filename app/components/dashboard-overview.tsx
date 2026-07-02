"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ScatterChart,
  Scatter,
  Treemap,
  Area,
  AreaChart,
  LineChart,
  Line,
  RadialBarChart,
  RadialBar,
  ReferenceArea,
  ComposedChart,
} from "recharts";
import {
  TrendingUp,
  Users,
  Award,
  Factory,
  Target,
  BookOpen,
  AlertTriangle,
  CheckCircle,
  Clock,
  RefreshCw,
} from "lucide-react";
import FullscreenChart from "./FullscreenChart";
import { useDepartmentPerformance } from "@/hooks/useDepartmentPerformance";

// Use a flexible interface that can handle different Employee types
interface FlexibleEmployee {
  department?: string;
  skillLevel?: string;
  gender?: string;
  name?: string;
  yearsExperience?: number;
  skills?: Record<string, string>; // Add skills property
}

interface DepartmentOverviewProps {
  data: FlexibleEmployee[];
}

export default function DepartmentOverview({ data }: DepartmentOverviewProps) {
  // Fetch real department performance data
  const {
    performanceData,
    loading: perfLoading,
    error: perfError,
    calculateAndRefetch,
  } = useDepartmentPerformance();

  // State for mobile view detection
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // State for fullscreen functionality
  const [isFullScreen, setIsFullScreen] = useState(false);

  // State for interactive filtering
  const [selectedDepartments, setSelectedDepartments] = useState<string[]>([]);
  const [hoveredDepartment, setHoveredDepartment] = useState<string | null>(
    null
  );

  const toggleFullScreen = () => {
    setIsFullScreen(!isFullScreen);
  };

  // Department abbreviations mapping
  const departmentAbbreviations: { [key: string]: string } = {
    "Sheet Metal": "SM",
    "Sheet Molding": "SM",
    "Assembly Line": "AL",
    "Cooling Systems": "CS",
    "Quality Control": "QC",
    "Injection Molding": "IM",
    Manufacturing: "MFG",
    Engineering: "ENG",
    "Research and Development": "R&D",
    Production: "PROD",
    Maintenance: "MAINT",
    Logistics: "LOG",
    "Human Resources": "HR",
    Finance: "FIN",
    "Information Technology": "IT",
    Sales: "SALES",
    Marketing: "MKT",
  };

  // Get abbreviation for department
  const getDepartmentAbbr = (deptName: string) => {
    return (
      departmentAbbreviations[deptName] ||
      deptName.substring(0, 3).toUpperCase()
    );
  };

  // Format legend labels with abbreviations
  const formatLegend = (value: string | number) => {
    const stringValue = String(value);
    const abbr = getDepartmentAbbr(stringValue);
    return `${abbr} - ${stringValue}`;
  };

  // Toggle department visibility
  const toggleDepartment = (deptName: string) => {
    setSelectedDepartments((prev) =>
      prev.includes(deptName)
        ? prev.filter((d) => d !== deptName)
        : [...prev, deptName]
    );
  };

  // Calculate performance if data exists but performance data is empty
  useEffect(() => {
    if (data.length > 0 && performanceData.length === 0 && !perfLoading) {
      calculateAndRefetch();
    }
  }, [data, performanceData, perfLoading, calculateAndRefetch]);

  // Initialize selected departments when data changes
  useEffect(() => {
    const departments = [
      ...new Set(data.map((employee) => employee.department).filter(Boolean)),
    ] as string[];
    setSelectedDepartments(departments);
  }, [data]);

  // Get current month for chart description
  const currentDate = new Date();
  const currentMonthName = currentDate.toLocaleDateString("en-US", {
    month: "short",
  });
  const currentYear = currentDate.getFullYear();
  const chartDescription = `${currentYear} department performance scores (Jan-${currentMonthName})`;

  // Helper function to normalize skill levels (treat Expert as Advanced)
  const normalizeSkillLevel = (skillLevel: string | undefined) => {
    if (!skillLevel) return "";
    if (skillLevel === "Expert" || skillLevel === "Advanced") return "Advanced";
    return skillLevel;
  };

  // Handle empty data state
  if (data.length === 0) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="border-0 shadow-lg bg-blue-600 text-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium flex items-center gap-2">
                <Users className="h-6 w-6" />
                Total Employees
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold mb-1">0</div>
              <p className="text-blue-100 text-sm">
                No employees match filters
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-yellow-500 text-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium flex items-center gap-2">
                <Clock className="h-6 w-6" />
                Avg Experience
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold mb-1">0</div>
              <p className="text-amber-100 text-sm">years average</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-green-600 text-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium flex items-center gap-2">
                <Award className="h-6 w-6" />
                Highly Skilled / Advanced
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold mb-1">0</div>
              <p className="text-emerald-100 text-sm">0% of workforce</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-blue-600 text-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium flex items-center gap-2">
                <Users className="h-6 w-6" />
                Gender Inclusion
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <div className="text-center">
                    <div className="text-2xl font-bold">0</div>
                    <p className="text-blue-100 text-xs">Men</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">0</div>
                    <p className="text-green-100 text-xs">Women</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div
                    className="flex-1 bg-blue-400 h-2 rounded-l-full"
                    style={{ width: "50%" }}
                  ></div>
                  <div
                    className="flex-1 bg-green-400 h-2 rounded-r-full"
                    style={{ width: "50%" }}
                  ></div>
                </div>
                <div className="flex justify-between text-xs text-blue-100">
                  <span>0% Men</span>
                  <span>0% Women</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="text-center py-12">
          <AlertTriangle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No Data Found
          </h3>
          <p className="text-gray-500">
            No employees match the current filter criteria. Try adjusting your
            filters.
          </p>
        </div>
      </div>
    );
  }

  // Calculate meaningful metrics with safe guards for empty data
  const totalEmployees = data.length;

  // Count employees who have at least one Expert level skill
  const expertEmployees = data.filter((e) => {
    if (!e.skills || typeof e.skills !== "object") return false;
    return Object.values(e.skills).some(
      (skillLevel) => skillLevel === "Expert"
    );
  }).length;


  const femaleEmployees = data.filter(
    (e) =>
      e.gender?.toLowerCase() === "female" ||
      e.gender === "Female" ||
      e.gender === "FEMALE"
  ).length;
  const maleEmployees = data.filter(
    (e) =>
      e.gender?.toLowerCase() === "male" ||
      e.gender === "Male" ||
      e.gender === "MALE"
  ).length;
  const othersEmployees = data.filter(
    (e) => {
      const g = e.gender?.toLowerCase();
      return g !== "male" && g !== "female" && g !== undefined && g !== null && g !== "";
    }
  ).length;

  const avgExperience =
    data.length > 0
      ? data.reduce((sum, e) => sum + (e.yearsExperience || 0), 0) / data.length
      : 0;

  // Enhanced skill distribution with better colors and safe percentage calculation
  const skillDistribution = [
    {
      name: "Highly Skilled",
      value: expertEmployees,
      color: "#10B981",
      percentage:
        totalEmployees > 0
          ? Math.round((expertEmployees / totalEmployees) * 100)
          : 0,
    },
    {
      name: "Skilled",
      value: data.filter((e) => e.skillLevel === "High").length,
      color: "#3B82F6",
      percentage:
        totalEmployees > 0
          ? Math.round(
              (data.filter((e) => e.skillLevel === "High").length /
                totalEmployees) *
                100
            )
          : 0,
    },
    {
      name: "Semi-Skilled",
      value: data.filter((e) => e.skillLevel === "Medium").length,
      color: "#F59E0B",
      percentage:
        totalEmployees > 0
          ? Math.round(
              (data.filter((e) => e.skillLevel === "Medium").length /
                totalEmployees) *
                100
            )
          : 0,
    },
    {
      name: "Low Skilled",
      value: data.filter((e) => e.skillLevel === "Low").length,
      color: "#EF4444",
      percentage:
        totalEmployees > 0
          ? Math.round(
              (data.filter((e) => e.skillLevel === "Low").length /
                totalEmployees) *
                100
            )
          : 0,
    },
  ];

  // Department workforce with efficiency metrics
  const departments = [
    ...new Set(data.map((employee) => employee.department).filter(Boolean)),
  ] as string[];
  const departmentSizes = departments.map((dept, index) => {
    const employees = data.filter((e) => e.department === dept && e.skillLevel);
    const avgSkillLevel =
      employees.length > 0
        ? employees.reduce((sum, e) => {
            const skillMap = {
              Advanced: 4,
              Expert: 4,
              High: 3,
              Medium: 2,
              Low: 1,
            };
            return sum + (skillMap[e.skillLevel as keyof typeof skillMap] || 1);
          }, 0) / employees.length
        : 0;

    const colors = [
      "#EF4444",
      "#F59E0B",
      "#10B981",
      "#3B82F6",
      "#8B5CF6",
      "#EC4899",
      "#F97316",
    ];
    return {
      name: dept,
      avgSkill: Math.round(avgSkillLevel * 25), // Convert to percentage
      color: colors[index % colors.length],
      abbr: getDepartmentAbbr(dept),
    };
  });

  // Filter department data based on selection
  const filteredDepartmentSizes = departmentSizes.filter(
    (dept) =>
      selectedDepartments.length === 0 ||
      selectedDepartments.includes(dept.name)
  );

  // Filter performance data based on selection
  const filteredPerformanceData = performanceData.map((monthData) => {
    const filtered: any = { month: monthData.month };
    Object.keys(monthData).forEach((key) => {
      if (
        key !== "month" &&
        (selectedDepartments.length === 0 || selectedDepartments.includes(key))
      ) {
        filtered[key] = monthData[key];
      }
    });
    return filtered;
  });

  // Department Filter Controls Component
  const DepartmentFilters = () => {
    const validDepartments = [
      ...new Set(data.map((employee) => employee.department).filter(Boolean)),
    ] as string[];

    return (
      <div className="mb-4 p-4 bg-gray-50 rounded-lg border">
        <h4 className="text-sm font-medium text-gray-700 mb-3">
          Filter Departments:
        </h4>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedDepartments(validDepartments)}
            className="px-3 py-1 text-xs bg-blue-100 text-blue-800 rounded-full hover:bg-blue-200 transition-colors"
          >
            Select All
          </button>
          <button
            onClick={() => setSelectedDepartments([])}
            className="px-3 py-1 text-xs bg-gray-100 text-gray-800 rounded-full hover:bg-gray-200 transition-colors"
          >
            Clear All
          </button>
          {validDepartments.map((dept) => (
            <button
              key={dept}
              onClick={() => toggleDepartment(dept)}
              className={`px-3 py-1 text-xs rounded-full transition-colors ${
                selectedDepartments.includes(dept)
                  ? "bg-green-100 text-green-800 border border-green-300"
                  : "bg-gray-100 text-gray-600 border border-gray-300"
              }`}
            >
              <span className="font-medium">{getDepartmentAbbr(dept)}</span> -{" "}
              {dept}
            </button>
          ))}
        </div>
      </div>
    );
  };

  // Gender distribution with more insights - updated labels
  const genderSkillData = [
    {
      skillLevel: "High Skilled",
      Men: data.filter(
        (e) =>
          e.skills &&
          typeof e.skills === "object" &&
          Object.values(e.skills).some(
            (skillLevel) => skillLevel === "Expert"
          ) &&
          (e.gender?.toLowerCase() === "male" ||
            e.gender === "Male" ||
            e.gender === "MALE")
      ).length,
      Women: data.filter(
        (e) =>
          e.skills &&
          typeof e.skills === "object" &&
          Object.values(e.skills).some(
            (skillLevel) => skillLevel === "Expert"
          ) &&
          (e.gender?.toLowerCase() === "female" ||
            e.gender === "Female" ||
            e.gender === "FEMALE")
      ).length,
      Others: data.filter(
        (e) =>
          e.skills &&
          typeof e.skills === "object" &&
          Object.values(e.skills).some(
            (skillLevel) => skillLevel === "Expert"
          ) &&
          (e.gender?.toLowerCase() !== "male" &&
            e.gender?.toLowerCase() !== "female" &&
            e.gender !== undefined &&
            e.gender !== null &&
            e.gender !== "")
      ).length,
    },
    {
      skillLevel: "Skilled",
      Men: data.filter(
        (e) =>
          e.skillLevel === "High" &&
          (e.gender?.toLowerCase() === "male" ||
            e.gender === "Male" ||
            e.gender === "MALE")
      ).length,
      Women: data.filter(
        (e) =>
          e.skillLevel === "High" &&
          (e.gender?.toLowerCase() === "female" ||
            e.gender === "Female" ||
            e.gender === "FEMALE")
      ).length,
      Others: data.filter(
        (e) =>
          e.skillLevel === "High" &&
          (e.gender?.toLowerCase() !== "male" &&
            e.gender?.toLowerCase() !== "female" &&
            e.gender !== undefined &&
            e.gender !== null &&
            e.gender !== "")
      ).length,
    },
    {
      skillLevel: "Semi-Skilled",
      Men: data.filter(
        (e) =>
          e.skillLevel === "Medium" &&
          (e.gender?.toLowerCase() === "male" ||
            e.gender === "Male" ||
            e.gender === "MALE")
      ).length,
      Women: data.filter(
        (e) =>
          e.skillLevel === "Medium" &&
          (e.gender?.toLowerCase() === "female" ||
            e.gender === "Female" ||
            e.gender === "FEMALE")
      ).length,
      Others: data.filter(
        (e) =>
          e.skillLevel === "Medium" &&
          (e.gender?.toLowerCase() !== "male" &&
            e.gender?.toLowerCase() !== "female" &&
            e.gender !== undefined &&
            e.gender !== null &&
            e.gender !== "")
      ).length,
    },
    {
      skillLevel: "Low-Skilled",
      Men: data.filter(
        (e) =>
          e.skillLevel === "Low" &&
          (e.gender?.toLowerCase() === "male" ||
            e.gender === "Male" ||
            e.gender === "MALE")
      ).length,
      Women: data.filter(
        (e) =>
          e.skillLevel === "Low" &&
          (e.gender?.toLowerCase() === "female" ||
            e.gender === "Female" ||
            e.gender === "FEMALE")
      ).length,
      Others: data.filter(
        (e) =>
          e.skillLevel === "Low" &&
          (e.gender?.toLowerCase() !== "male" &&
            e.gender?.toLowerCase() !== "female" &&
            e.gender !== undefined &&
            e.gender !== null &&
            e.gender !== "")
      ).length,
    },
  ];
  // Enhanced experience vs skill with gender-based colors
  const experienceSkillData = data.map((employee) => {
    const skillLevelMap = {
      Advanced: 4,
      Expert: 4,
      High: 3,
      Medium: 2,
      Low: 1,
    };

    return {
      experience: employee.yearsExperience,
      skillLevel:
        skillLevelMap[employee.skillLevel as keyof typeof skillLevelMap],
      name: employee.name,
      department: employee.department,
      gender: employee.gender,
      color: employee.gender?.toLowerCase() === "female" ? "#4ADE80" : (employee.gender?.toLowerCase() === "male" ? "#3B82F6" : "#A855F7"), // Green for women, blue for men, purple for others
    };
  });

  // Years of experience distribution analysis
  const experienceRanges = [
    { range: "0-2 years", min: 0, max: 2, color: "#EF4444" },
    { range: "3-5 years", min: 3, max: 5, color: "#F59E0B" },
    { range: "6-10 years", min: 6, max: 10, color: "#10B981" },
    { range: "11-15 years", min: 11, max: 15, color: "#3B82F6" },
    { range: "16+ years", min: 16, max: 100, color: "#8B5CF6" },
  ];

  const experienceDistribution = experienceRanges.map((range) => {
    const count = data.filter(
      (emp) =>
        (emp.yearsExperience || 0) >= range.min &&
        (emp.yearsExperience || 0) <= range.max
    ).length;
    return {
      range: range.range,
      count: count,
      percentage:
        totalEmployees > 0 ? Math.round((count / totalEmployees) * 100) : 0,
      color: range.color,
    };
  });

  // Workforce composition treemap with better colors
  const treemapData = departments.map((dept, index) => {
    const employees = data.filter((e) => e.department === dept);
    const colors = [
      "#EF4444",
      "#F59E0B",
      "#10B981",
      "#3B82F6",
      "#8B5CF6",
      "#EC4899",
      "#F97316",
      "#14B8A6",
      "#F472B6",
      "#A855F7",
    ];
    return {
      name: dept,
      size: employees.length,
      fill: colors[index % colors.length],
    };
  });

  return (
    <div className="space-y-8 p-6 bg-[#F8FAFC] min-h-screen">
      {/* Enhanced Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 ">
        <Card className="border-0 shadow-lg bg-blue-600 text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium flex items-center gap-2">
              <Users className="h-6 w-6" />
              Total Workforce
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold mb-1">{totalEmployees}</div>
            <p className="text-blue-100 text-sm">
              Avg. {avgExperience.toFixed(1)} years experience
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-green-600 text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium flex items-center gap-2">
              <Award className="h-6 w-6" />
              Highly Skilled / Expert
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold mb-1">{expertEmployees}</div>
            <p className="text-emerald-100 text-sm">
              {totalEmployees > 0
                ? Math.round((expertEmployees / totalEmployees) * 100)
                : 0}
              % have Expert skills
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-blue-600 text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium flex items-center gap-2">
              <Users className="h-6 w-6" />
              Gender Inclusion
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <div className="text-center">
                  <div className="text-2xl font-bold">{maleEmployees}</div>
                  <p className="text-blue-100 text-xs">Men</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{femaleEmployees}</div>
                  <p className="text-green-100 text-xs">Women</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{othersEmployees}</div>
                  <p className="text-purple-100 text-xs">Others</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <div
                  className="bg-blue-400 h-2 rounded-l-full"
                  style={{
                    flexGrow: maleEmployees || 1,
                    width: `${
                      totalEmployees > 0
                        ? (maleEmployees / totalEmployees) * 100
                        : 33
                    }%`,
                  }}
                ></div>
                <div
                  className="bg-green-400 h-2"
                  style={{
                    flexGrow: femaleEmployees || 1,
                    width: `${
                      totalEmployees > 0
                        ? (femaleEmployees / totalEmployees) * 100
                        : 33
                    }%`,
                  }}
                ></div>
                <div
                  className="bg-purple-400 h-2 rounded-r-full"
                  style={{
                    flexGrow: othersEmployees || 1,
                    width: `${
                      totalEmployees > 0
                        ? (othersEmployees / totalEmployees) * 100
                        : 33
                    }%`,
                  }}
                ></div>
              </div>
              <div className="flex justify-between text-xs text-blue-100">
                <span>
                  {totalEmployees > 0
                    ? Math.round((maleEmployees / totalEmployees) * 100)
                    : 0}
                  % Men
                </span>
                <span>
                  {totalEmployees > 0
                    ? Math.round((femaleEmployees / totalEmployees) * 100)
                    : 0}
                  % Women
                </span>
                <span>
                  {totalEmployees > 0
                    ? Math.round((othersEmployees / totalEmployees) * 100)
                    : 0}
                  % Others
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Overview Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Enhanced Skill Distribution */}
        <Card className="w-full overflow-hidden border-0 shadow-lg">
          <CardHeader className="bg-gray-100 dark:bg-gray-800 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg font-semibold flex items-center gap-2 text-gray-900 dark:text-white">
                <Target className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                Skill Level Distribution
              </CardTitle>
              <CardDescription>
                Current workforce capability breakdown
              </CardDescription>
            </div>
            <FullscreenChart
              title="Skill Level Distribution"
              description="Current workforce capability breakdown"
            >
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={skillDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={3}
                    dataKey="value"
                    label={({ name, percentage }) => `${name}: ${percentage}%`}
                  >
                    {skillDistribution.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.color}
                        stroke="#fff"
                        strokeWidth={2}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value, name, props) => [
                      `${value} employees (${props.payload.percentage}%)`,
                      "Count",
                    ]}
                    contentStyle={{
                      backgroundColor: "#F8FAFC",
                      border: "1px solid #E2E8F0",
                      borderRadius: "8px",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </FullscreenChart>
          </CardHeader>
          <CardContent className="h-[420px] pt-6">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={skillDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={isMobile ? 35 : 50}
                  outerRadius={isMobile ? 60 : 80}
                  paddingAngle={3}
                  dataKey="value"
                  label={isMobile ? false : ({ name, percentage }) => `${name}: ${percentage}%`}
                >
                  {skillDistribution.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.color}
                      stroke="#fff"
                      strokeWidth={2}
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value, name, props) => [
                    `${value} employees (${props.payload.percentage}%)`,
                    "Count",
                  ]}
                  contentStyle={{
                    backgroundColor: "#f8fafc",
                    border: "1px solid #e2e8f0",
                    borderRadius: "8px",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Enhanced Gender Distribution */}
        <Card className="w-full overflow-hidden border-0 shadow-lg">
          <CardHeader className="bg-gray-100 dark:bg-gray-800 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg font-semibold flex items-center gap-2 text-gray-900 dark:text-white">
                <Users className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                Gender by Skill Level
              </CardTitle>
              <CardDescription>Diversity across skill levels</CardDescription>
            </div>
            <FullscreenChart
              title="Gender by Skill Level"
              description="Diversity across skill levels"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={genderSkillData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="skillLevel" fontSize={12} />
                  <YAxis fontSize={11} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#f8fafc",
                      border: "1px solid #e2e8f0",
                      borderRadius: "8px",
                    }}
                  />
                  <Legend />
                  <Bar
                    dataKey="Men"
                    stackId="a"
                    fill="#3B82F6"
                    name="Men"
                    radius={[0, 0, 4, 4]}
                  />
                  <Bar
                    dataKey="Women"
                    stackId="a"
                    fill="#4ADE80"
                    name="Women"
                  />
                  <Bar
                    dataKey="Others"
                    stackId="a"
                    fill="#A855F7"
                    name="Others"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </FullscreenChart>
          </CardHeader>
          <CardContent className="h-[420px] pt-6">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={genderSkillData}
                margin={isMobile ? { top: 10, right: 10, left: -20, bottom: 5 } : { top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="skillLevel" fontSize={isMobile ? 10 : 12} />
                <YAxis fontSize={isMobile ? 9 : 11} width={isMobile ? 20 : 30} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#F8FAFC",
                    border: "1px solid #E2E8F0",
                    borderRadius: "8px",
                  }}
                />
                <Legend />
                <Bar
                  dataKey="Men"
                  stackId="a"
                  fill="#3B82F6"
                  name="Men"
                  radius={[0, 0, 4, 4]}
                />
                <Bar
                  dataKey="Women"
                  stackId="a"
                  fill="#EC4899"
                  name="Women"
                />
                <Bar
                  dataKey="Others"
                  stackId="a"
                  fill="#A855F7"
                  name="Others"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Second Row - Experience and Performance */}
      <div className="grid grid-cols-1 gap-6">
        {/* Department Efficiency */}
        <Card className="w-full overflow-hidden border-0 shadow-lg">
          <CardHeader className="bg-gray-100 dark:bg-gray-800 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg font-semibold flex items-center gap-2 text-gray-900 dark:text-white">
                <Factory className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                Department Overview
              </CardTitle>
              <CardDescription>Size and average skill level</CardDescription>
            </div>
            <FullscreenChart
              title="Department Overview"
              description="Size and average skill level"
            >
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart
                  data={departmentSizes}
                  margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis
                    dataKey="name"
                    angle={-45}
                    textAnchor="end"
                    height={80}
                    fontSize={10}
                  />
                  <YAxis yAxisId="left" fontSize={11} />
                  <YAxis yAxisId="right" orientation="right" fontSize={11} />
                  <Tooltip
                    formatter={(value, name) => [
                      name === "size"
                        ? `${value} employees`
                        : `${value}% avg skill`,
                      name === "size" ? "Workforce" : "Skill Level",
                    ]}
                    contentStyle={{
                      backgroundColor: "#f8fafc",
                      border: "1px solid #e2e8f0",
                      borderRadius: "8px",
                    }}
                  />
                  <Bar
                    yAxisId="left"
                    dataKey="size"
                    fill="#8B5CF6"
                    radius={[4, 4, 0, 0]}
                  />
                  <Line
                    yAxisId="right"
                    dataKey="avgSkill"
                    stroke="#F59E0B"
                    strokeWidth={3}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </FullscreenChart>
          </CardHeader>
          <CardContent className="h-[500px] pt-6">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart
                data={departmentSizes}
                margin={isMobile ? { top: 10, right: 10, left: -10, bottom: 40 } : { top: 20, right: 30, left: 20, bottom: 60 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis
                  dataKey="name"
                  angle={isMobile ? -30 : -45}
                  textAnchor="end"
                  height={isMobile ? 50 : 80}
                  fontSize={isMobile ? 9 : 10}
                  tickFormatter={(value) => isMobile ? getDepartmentAbbr(value) : value}
                />
                <YAxis yAxisId="left" fontSize={isMobile ? 9 : 11} width={isMobile ? 20 : 30} />
                <YAxis yAxisId="right" orientation="right" fontSize={isMobile ? 9 : 11} width={isMobile ? 20 : 30} />
                <Tooltip
                  formatter={(value, name) => [
                    name === "size"
                      ? `${value} employees`
                      : `${value}% avg skill`,
                    name === "size" ? "Workforce" : "Skill Level",
                  ]}
                  contentStyle={{
                    backgroundColor: "#F8FAFC",
                    border: "1px solid #E2E8F0",
                    borderRadius: "8px",
                  }}
                />
                <Bar
                  yAxisId="left"
                  dataKey="size"
                  fill="#8B5CF6"
                  radius={[4, 4, 0, 0]}
                />
                <Line
                  yAxisId="right"
                  dataKey="avgSkill"
                  stroke="#F59E0B"
                  strokeWidth={3}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Enhanced Department Performance */}
        <Card className="w-full overflow-hidden border-0 shadow-lg">
          <CardHeader className="bg-gray-100 dark:bg-gray-800 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg font-semibold flex items-center gap-2 text-gray-900 dark:text-white">
                <Award className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                Department Performance Trends
              </CardTitle>
              <CardDescription>{chartDescription}</CardDescription>
            </div>
            <FullscreenChart
              title="Department Performance Trends"
              description={chartDescription}
            >
              <ResponsiveContainer width="100%" height="100%">
                {perfLoading ? (
                  <div className="flex items-center justify-center h-full">
                    <RefreshCw className="h-8 w-8 animate-spin text-gray-400" />
                  </div>
                ) : perfError ? (
                  <div className="flex items-center justify-center h-full text-red-500">
                    <AlertTriangle className="h-6 w-6 mr-2" />
                    Error loading performance data
                  </div>
                ) : (
                  <LineChart
                    data={performanceData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="month" fontSize={11} />
                    <YAxis domain={[0, 100]} fontSize={11} />
                    <Tooltip
                      formatter={(value, name) => [
                        `${value}%`,
                        `${formatLegend(name)} Performance`,
                      ]}
                      labelFormatter={(label) => `Month: ${label}`}
                      contentStyle={{
                        backgroundColor: "#f8fafc",
                        border: "1px solid #e2e8f0",
                        borderRadius: "8px",
                      }}
                    />
                    <Legend formatter={formatLegend} />
                    {performanceData.length > 0 &&
                      Object.keys(performanceData[0])
                        .filter((key) => key !== "month")
                        .map((dept, index) => {
                          const colors = ["#60A5FA", "#4ADE80", "#F87171"];
                          return (
                            <Line
                              key={dept}
                              type="monotone"
                              dataKey={dept}
                              stroke={colors[index % colors.length]}
                              strokeWidth={3}
                              name={dept}
                            />
                          );
                        })}
                  </LineChart>
                )}
              </ResponsiveContainer>
            </FullscreenChart>
          </CardHeader>
          <CardContent className="h-[480px] pt-6">
            <ResponsiveContainer width="100%" height="100%">
              {perfLoading ? (
                <div className="flex items-center justify-center h-full">
                  <RefreshCw className="h-8 w-8 animate-spin text-gray-400" />
                </div>
              ) : perfError ? (
                <div className="flex items-center justify-center h-full text-red-500">
                  <AlertTriangle className="h-6 w-6 mr-2" />
                  Error loading performance data
                </div>
              ) : (
                <LineChart
                  data={performanceData}
                  margin={isMobile ? { top: 10, right: 10, left: -20, bottom: 5 } : { top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="month" fontSize={isMobile ? 10 : 11} />
                  <YAxis domain={[0, 100]} fontSize={isMobile ? 9 : 11} width={isMobile ? 20 : 30} />
                  <Tooltip
                    formatter={(value, name) => [
                      `${value}%`,
                      `${formatLegend(name)} Performance`,
                    ]}
                    labelFormatter={(label) => `Month: ${label}`}
                    contentStyle={{
                      backgroundColor: "#F8FAFC",
                      border: "1px solid #E2E8F0",
                      borderRadius: "8px",
                    }}
                  />
                  <Legend formatter={formatLegend} />
                  {performanceData.length > 0 &&
                    Object.keys(performanceData[0])
                      .filter((key) => key !== "month")
                      .map((dept, index) => {
                        const colors = ["#60A5FA", "#4ADE80", "#F87171"];
                        return (
                          <Line
                            key={dept}
                            type="monotone"
                            dataKey={dept}
                            stroke={colors[index % colors.length]}
                            strokeWidth={3}
                            name={dept}
                          />
                        );
                      })}
                </LineChart>
              )}
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Third Row - Experience Analysis and Composition */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Years of Experience Distribution */}
        <Card className="w-full overflow-hidden border-0 shadow-lg">
          <CardHeader className="bg-gray-100 dark:bg-gray-800 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg font-semibold flex items-center gap-2 text-gray-900 dark:text-white">
                <Clock className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                Years of Experience Distribution
              </CardTitle>
              <CardDescription>
                Workforce experience level breakdown
              </CardDescription>
            </div>
            <FullscreenChart
              title="Years of Experience Distribution"
              description="Workforce experience level breakdown"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={experienceDistribution}
                  margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis
                    dataKey="range"
                    angle={-45}
                    textAnchor="end"
                    height={80}
                    fontSize={10}
                  />
                  <YAxis tickFormatter={(value) => `${value}`} fontSize={11} />
                  <Tooltip
                    formatter={(value, name) => {
                      if (name === "count")
                        return [`${value} employees`, "Count"];
                      return [value, name];
                    }}
                    labelFormatter={(label) => {
                      const range = experienceDistribution.find(
                        (d) => d.range === label
                      );
                      return range
                        ? `${label} (${range.percentage}% of workforce)`
                        : label;
                    }}
                    contentStyle={{
                      backgroundColor: "#f8fafc",
                      border: "1px solid #e2e8f0",
                      borderRadius: "8px",
                    }}
                  />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]} name="Employees">
                    {experienceDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </FullscreenChart>
          </CardHeader>
          <CardContent className="h-[350px] pt-6">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={experienceDistribution}
                margin={isMobile ? { top: 10, right: 10, left: -20, bottom: 40 } : { top: 20, right: 30, left: 20, bottom: 60 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis
                  dataKey="range"
                  angle={isMobile ? -30 : -45}
                  textAnchor="end"
                  height={isMobile ? 50 : 80}
                  fontSize={isMobile ? 9 : 10}
                />
                <YAxis tickFormatter={(value) => `${value}`} fontSize={isMobile ? 9 : 11} width={isMobile ? 20 : 30} />
                <Tooltip
                  formatter={(value, name) => {
                    if (name === "count")
                      return [`${value} employees`, "Count"];
                    return [value, name];
                  }}
                  labelFormatter={(label) => {
                    const range = experienceDistribution.find(
                      (d) => d.range === label
                    );
                    return range
                      ? `${label} (${range.percentage}% of workforce)`
                      : label;
                  }}
                  contentStyle={{
                    backgroundColor: "#F8FAFC",
                    border: "1px solid #E2E8F0",
                    borderRadius: "8px",
                  }}
                />
                <Bar dataKey="count" radius={[4, 4, 0, 0]} name="Employees">
                  {experienceDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* add here */}
        {/* Enhanced Experience vs Skill with Bands and Gender Colors */}
        <Card className="w-full overflow-hidden border-0 shadow-lg bg-transparent">
          <CardHeader className="bg-gray-100 dark:bg-gray-800 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg font-semibold flex items-center gap-2 text-gray-900 dark:text-white">
                <TrendingUp className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                Experience vs Skill Correlation
              </CardTitle>
              <CardDescription>
                Employee experience and skill level by gender
              </CardDescription>
            </div>
            <FullscreenChart
              title="Experience vs Skill Correlation"
              description="Employee experience and skill level by gender"
            >
              <div className="h-full">
                {/* Skill Band Labels */}
                <div className="grid grid-cols-4 text-center text-sm text-[#1E293B] pb-2 relative z-50">
                  <div className="bg-red-200 py-1 rounded relative z-50">
                    Low
                  </div>
                  <div className="bg-[#D0C569] py-1 rounded relative z-50">
                    Medium
                  </div>
                  <div className="bg-blue-200 py-1 rounded relative z-50">
                    High
                  </div>
                  <div className="bg-[#79c87a] py-1 rounded relative z-50">
                    Advanced/Expert
                  </div>
                </div>
                {/* Set fixed height for chart container and remove background from CardHeader if present */}
                <div className="relative h-[400px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <ScatterChart
                      margin={isMobile ? { top: 10, right: 10, bottom: 10, left: -25 } : { top: 20, right: 20, bottom: 20, left: 20 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis
                        type="number"
                        dataKey="experience"
                        name="Experience"
                        unit={isMobile ? "y" : " years"}
                        domain={[0, "dataMax + 2"]}
                        fontSize={isMobile ? 9 : 11}
                      />
                      <YAxis
                        type="number"
                        dataKey="skillLevel"
                        name="Skill Level"
                        domain={[0.5, 4.5]}
                        fontSize={isMobile ? 9 : 11}
                        width={isMobile ? 55 : 85}
                        tickFormatter={(value) => {
                          const levels = [
                            "",
                            "Low",
                            "Medium",
                            "High",
                            "Advanced",
                          ];
                          return levels[Math.round(value)] || "";
                        }}
                      />
                      {/* Skill Level Bands - Consistent, visible colors for both fullscreen and normal view */}
                      <ReferenceArea
                        y1={0.5}
                        y2={1.5}
                        fill="#FCA5A5"
                        fillOpacity={0.65}
                        ifOverflow="extendDomain"
                      />{" "}
                      {/* Red for Low */}
                      <ReferenceArea
                        y1={1.5}
                        y2={2.5}
                        fill="#D0C569"
                        fillOpacity={0.65}
                        ifOverflow="extendDomain"
                      />{" "}
                      {/* Yellow for Medium */}
                      <ReferenceArea
                        y1={2.5}
                        y2={3.5}
                        fill="#94BFA4"
                        fillOpacity={0.65}
                        ifOverflow="extendDomain"
                      />{" "}
                      {/* Blue for High */}
                      <ReferenceArea
                        y1={3.5}
                        y2={4.5}
                        fill="#55CE57"
                        fillOpacity={0.65}
                        ifOverflow="extendDomain"
                      />{" "}
                      {/* Green for Advanced/Expert */}
                      <Tooltip
                        cursor={{ strokeDasharray: "3 3" }}
                        formatter={(value, name, props) => {
                          if (name === "skillLevel") {
                            const levels = [
                              "",
                              "Low",
                              "Medium",
                              "High",
                              "Advanced",
                            ];
                            const numValue = Number(value);
                            return [levels[numValue] || value, "Skill Level"];
                          }
                          return [value, name];
                        }}
                        labelFormatter={() => ""}
                        content={({ active, payload }) => {
                          if (active && payload && payload.length > 0) {
                            const data = payload[0].payload;
                            return (
                              <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
                                <p className="font-semibold">{data.name}</p>
                                <p className="text-sm text-gray-600">
                                  {data.department}
                                </p>
                                <p className="text-sm">
                                  Experience: {data.experience} years
                                </p>
                                <p className="text-sm">
                                  Skill Level:{" "}
                                  {
                                    ["", "Low", "Medium", "High", "Advanced"][
                                      data.skillLevel
                                    ]
                                  }
                                </p>
                                <p className="text-sm">Gender: {data.gender}</p>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Legend
                        content={() => (
                          <div className="flex justify-center gap-6 mt-4">
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 rounded-full bg-[#3B82F6]"></div>
                              <span className="text-sm text-gray-600">Men</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 rounded-full bg-[#4ADE80]"></div>
                              <span className="text-sm text-gray-600">
                                Women
                              </span>
                            </div>
                          </div>
                        )}
                      />
                      <Scatter
                        name="Employees"
                        data={experienceSkillData}
                        fill="#8884d8"
                      >
                        {experienceSkillData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Scatter>
                    </ScatterChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </FullscreenChart>
          </CardHeader>

          <CardContent className="h-[460px] pt-4 bg-white">
            {/* Skill Band Labels */}
            <div className="grid grid-cols-4 text-center text-sm text-[#1E293B] pb-2">
              <div className="bg-[#FCA5A5] py-1 rounded">Low</div>
              <div className="bg-[#D0C569] py-1 rounded">Medium</div>
              <div className="bg-[#94BFA4] py-1 rounded">High</div>
              <div className="bg-[#79c87a] py-1 rounded">Advanced/Expert</div>
            </div>
            <div className="relative h-full w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart
                  margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis
                    type="number"
                    dataKey="experience"
                    name="Experience"
                    unit=" years"
                    domain={[0, "dataMax + 2"]}
                  />
                  <YAxis
                    type="number"
                    dataKey="skillLevel"
                    name="Skill Level"
                    domain={[0.5, 4.5]}
                    tickFormatter={(value) => {
                      const levels = ["", "Low", "Medium", "High", "Advanced"];
                      return levels[Math.round(value)] || "";
                    }}
                  />
                  {/* Skill Level Bands - place after axis so they're not covered */}
                  {/* Darker Skill Level Bands rendered first for background visibility */}
                  <ReferenceArea
                    y1={0.5}
                    y2={1.5}
                    fill="#FCA5A5"
                    fillOpacity={0.65}
                    ifOverflow="extendDomain"
                  />{" "}
                  {/* Red for Low */}
                  <ReferenceArea
                    y1={1.5}
                    y2={2.5}
                    fill="#D0C569"
                    fillOpacity={0.65}
                    ifOverflow="extendDomain"
                  />{" "}
                  {/* Yellow for Medium */}
                  <ReferenceArea
                    y1={2.5}
                    y2={3.5}
                    fill="#94BFA4"
                    fillOpacity={0.65}
                    ifOverflow="extendDomain"
                  />{" "}
                  {/* Blue for High */}
                  <ReferenceArea
                    y1={3.5}
                    y2={4.5}
                    fill="#55CE57"
                    fillOpacity={0.65}
                    ifOverflow="extendDomain"
                  />{" "}
                  {/* Green for Advanced */}
                  <Tooltip
                    cursor={{ strokeDasharray: "3 3" }}
                    formatter={(value, name) => {
                      if (name === "skillLevel") {
                        const levels = [
                          "",
                          "Low",
                          "Medium",
                          "High",
                          "Advanced/Expert",
                        ];
                        return [levels[value as number], "Skill Level"];
                      }
                      return [value, name];
                    }}
                    labelFormatter={(value, payload) => {
                      if (payload && payload.length > 0) {
                        const data = payload[0].payload;
                        const genderLabel = data.gender?.toLowerCase() === "female" ? "Woman" : (data.gender?.toLowerCase() === "male" ? "Man" : "Other");
                        return `${data.name} - ${value} years experience (${genderLabel})`;
                      }
                      return `${value} years experience`;
                    }}
                    contentStyle={{
                      backgroundColor: "#F8FAFC",
                      border: "1px solid #E2E8F0",
                      borderRadius: "8px",
                    }}
                  />
                  <Legend
                    content={() => (
                      <div className="flex justify-center gap-6 mt-4">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-[#3B82F6]"></div>
                          <span className="text-sm text-gray-600">Men</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-[#EC4899]"></div>
                          <span className="text-sm text-gray-600">Women</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-[#A855F7]"></div>
                          <span className="text-sm text-gray-600">Others</span>
                        </div>
                      </div>
                    )}
                  />
                  <Scatter
                    name="Employees"
                    data={experienceSkillData}
                    fill="#8884d8"
                  >
                    {experienceSkillData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Scatter>
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
