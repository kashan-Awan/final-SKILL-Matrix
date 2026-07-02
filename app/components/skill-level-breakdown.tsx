"use client";

import React, { useState, useEffect } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

// Use a flexible interface that matches the actual employee data structure
interface FlexibleEmployee {
  id?: string;
  name?: string;
  gender?: string;
  department?: string;
  skillLevel?: string;
  yearsExperience?: number;
}

interface SkillLevelBreakdownProps {
  data: FlexibleEmployee[];
}

export default function SkillLevelBreakdown({
  data,
}: SkillLevelBreakdownProps) {
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

  const getDepartmentAbbr = (deptName: string) => {
    return (
      departmentAbbreviations[deptName] ||
      deptName.substring(0, 3).toUpperCase()
    );
  };

  // Helper function to normalize skill levels (treat Expert as Advanced)
  const normalizeSkillLevel = (skillLevel: string | undefined) => {
    if (!skillLevel) return "";
    const lowerSkill = skillLevel.toLowerCase();
    if (lowerSkill === "expert" || lowerSkill === "advanced") return "Advanced";
    return skillLevel;
  };

  // Filter out employees without department and get unique departments
  const validData = data.filter(
    (emp) => emp.department && emp.skillLevel && emp.gender
  );

  // Group departments and get employee count for sorting
  const deptCounts = validData.reduce((acc, emp) => {
    const dept = emp.department || "";
    acc[dept] = (acc[dept] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const allDepartments = Object.keys(deptCounts);

  // Filter and sort states
  const [sortBy, setSortBy] = useState<"headcount" | "alphabetical">("headcount");
  const [limit, setLimit] = useState<number | "all">(10);

  const sortedDepartments = [...allDepartments].sort((a, b) => {
    if (sortBy === "headcount") {
      return deptCounts[b] - deptCounts[a]; // descending
    } else {
      return a.localeCompare(b);
    }
  });

  const displayedDepartments = limit === "all"
    ? sortedDepartments
    : sortedDepartments.slice(0, limit);

  const skillBreakdownData = displayedDepartments.map((department) => {
    const employees = validData.filter((e) => e.department === department);
    const maleEmployees = employees.filter(
      (e) => e.gender?.toLowerCase() === "male"
    );
    const femaleEmployees = employees.filter(
      (e) => e.gender?.toLowerCase() === "female"
    );
    const othersEmployees = employees.filter(
      (e) => {
        const g = e.gender?.toLowerCase();
        return g !== "male" && g !== "female" && g !== undefined && g !== null && g !== "";
      }
    );

    return {
      name: department.replace(" ", "\n"),
      "Male Advanced": maleEmployees.filter(
        (e) => normalizeSkillLevel(e.skillLevel) === "Advanced"
      ).length,
      "Female Advanced": femaleEmployees.filter(
        (e) => normalizeSkillLevel(e.skillLevel) === "Advanced"
      ).length,
      "Others Advanced": othersEmployees.filter(
        (e) => normalizeSkillLevel(e.skillLevel) === "Advanced"
      ).length,
      "Male High": maleEmployees.filter((e) => e.skillLevel === "High").length,
      "Female High": femaleEmployees.filter((e) => e.skillLevel === "High")
        .length,
      "Others High": othersEmployees.filter((e) => e.skillLevel === "High")
        .length,
      "Male Medium": maleEmployees.filter((e) => e.skillLevel === "Medium")
        .length,
      "Female Medium": femaleEmployees.filter((e) => e.skillLevel === "Medium")
        .length,
      "Others Medium": othersEmployees.filter((e) => e.skillLevel === "Medium")
        .length,
      "Male Low": maleEmployees.filter((e) => e.skillLevel === "Low").length,
      "Female Low": femaleEmployees.filter((e) => e.skillLevel === "Low")
        .length,
      "Others Low": othersEmployees.filter((e) => e.skillLevel === "Low")
        .length,
    };
  });

  // Return early if no valid data
  if (!validData.length || !allDepartments.length) {
    return (
      <div className="h-[400px] flex items-center justify-center">
        <div className="text-center text-gray-500">
          <p className="text-lg font-medium">No Data Available</p>
          <p className="text-sm">
            No valid employee data found for skill level breakdown
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Dynamic filters bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-gray-100/50 dark:bg-gray-800/30 p-2 rounded-lg border border-gray-200/50 dark:border-gray-800 text-xs">
        <div className="flex items-center gap-2">
          <span className="text-gray-500 dark:text-gray-400 font-medium">Show:</span>
          <select
            value={limit}
            onChange={(e) => {
              const val = e.target.value;
              setLimit(val === "all" ? "all" : Number(val));
            }}
            className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
          >
            <option value="5">Top 5 Departments</option>
            <option value="10">Top 10 Departments</option>
            <option value="20">Top 20 Departments</option>
            <option value="all">All ({allDepartments.length})</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-gray-500 dark:text-gray-400 font-medium">Sort By:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
          >
            <option value="headcount">Headcount (Largest First)</option>
            <option value="alphabetical">Alphabetical</option>
          </select>
        </div>
      </div>

      <div className="h-[360px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={skillBreakdownData}
            margin={isMobile ? { top: 10, right: 10, left: -15, bottom: 40 } : { top: 20, right: 30, left: 20, bottom: 60 }}
          >
            <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
            <XAxis
              dataKey="name"
              angle={isMobile ? -30 : -45}
              textAnchor="end"
              height={isMobile ? 50 : 80}
              fontSize={isMobile ? 9 : 11}
              tickFormatter={(value) => isMobile ? getDepartmentAbbr(value.replace("\n", " ")) : value}
            />
            <YAxis fontSize={isMobile ? 9 : 11} width={isMobile ? 20 : 30} />
            <Tooltip
              contentStyle={{
                backgroundColor: "white",
                border: "1px solid #e2e8f0",
                borderRadius: "8px",
                fontSize: "12px",
              }}
            />
            <Legend wrapperStyle={{ fontSize: "11px" }} />

            {/* Advanced Level */}
            <Bar
              dataKey="Male Advanced"
              stackId="Advanced"
              fill="#1e40af"
              name="Advanced - Male"
            />
            <Bar
              dataKey="Female Advanced"
              stackId="Advanced"
              fill="#166534"
              name="Advanced - Female"
            />
            <Bar
              dataKey="Others Advanced"
              stackId="Advanced"
              fill="#6b21a8"
              name="Advanced - Others"
            />

            {/* High Level */}
            <Bar
              dataKey="Male High"
              stackId="High"
              fill="#3b82f6"
              name="High - Male"
            />
            <Bar
              dataKey="Female High"
              stackId="High"
              fill="#16a34a"
              name="High - Female"
            />
            <Bar
              dataKey="Others High"
              stackId="High"
              fill="#8b5cf6"
              name="High - Others"
            />

            {/* Medium Level */}
            <Bar
              dataKey="Male Medium"
              stackId="Medium"
              fill="#eab308"
              name="Medium - Male"
            />
            <Bar
              dataKey="Female Medium"
              stackId="Medium"
              fill="#4ade80"
              name="Medium - Female"
            />
            <Bar
              dataKey="Others Medium"
              stackId="Medium"
              fill="#a78bfa"
              name="Medium - Others"
            />

            {/* Low Level */}
            <Bar
              dataKey="Male Low"
              stackId="Low"
              fill="#fbbf24"
              name="Low - Male"
            />
            <Bar
              dataKey="Female Low"
              stackId="Low"
              fill="#bbf7d0"
              name="Low - Female"
            />
            <Bar
              dataKey="Others Low"
              stackId="Low"
              fill="#c084fc"
              name="Low - Others"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
