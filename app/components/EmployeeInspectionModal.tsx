"use client"

import { motion, AnimatePresence } from "framer-motion"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { X, User, Award, TrendingUp, Calendar, Building2, Star, Target, Zap, Activity, Briefcase } from "lucide-react"
import { useTheme } from "./ThemeProvider"
import Button from "./Button"
import Chip from "./Chip"
import SkillIndicator from "./SkillIndicator"

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from "recharts"

interface workHistory{
        displayId: number,
        name: string,
        gender: string,
        departmentId: number,
        skills: string
}

interface workHistoryResponse {
  data: workHistory[]
}

interface workHistoryInspectionModalProps {
  employee : any
  workHistory: workHistoryResponse | null
  isOpen: boolean
  onClose: () => void
}

export default function workHistoryInspectionModal({ employee, workHistory, isOpen, onClose }: workHistoryInspectionModalProps) {
  const router = useRouter()
  const { isDark } = useTheme()
  const [loading, setLoading] = useState(false)

  // Log the received work history data

  // Early return after all hooks to follow Rules of Hooks
  if (!workHistory || !workHistory.data || !workHistory.data[0]) return null

  // Parse the skills from the work history data
  const employeeData = workHistory.data[0]
  let parsedSkills = {}

  const navigateToSkillsMatrix = async (skill: string) => {
    try {
      setLoading(true)
      
      // Instead of navigating, show detailed skill information in a more user-friendly way
      const skillLevel = parsedSkills[skill as keyof typeof parsedSkills]
      const skillInfo = `
Employee: ${employeeData.name}
Skill: ${skill}
Level: ${skillLevel}
Department: ${employeeData.departmentId}

This skill assessment can be used for:
• Performance reviews
• Training recommendations  
• Task assignments
• Skills gap analysis
      `.trim()
      
      alert(skillInfo)
      
    } catch (error) {
      console.error("Error displaying skill information:", error)
      alert(`Error displaying information for skill "${skill}". Please try again.`)
    } finally {
      setLoading(false)
    }
  }
  
  try {
    if (typeof employeeData.skills === 'string') {
      const skillsArray = JSON.parse(employeeData.skills)
      // Convert array of skill objects to key-value pairs
      parsedSkills = skillsArray.reduce((acc: any, skill: any) => {
        acc[skill.skillName] = skill.skillLevel
        return acc
      }, {})
    } else if (typeof employeeData.skills === 'object' && employeeData.skills !== null) {
      parsedSkills = employeeData.skills
    }
  } catch (error) {
    console.error("Error parsing skills:", error)
    parsedSkills = {}
  }


  // Helper to map skill level to display label
  // const getDisplayLabel = (level: string) => {
  //   return level === "Expert" || level === "Advanced" ? "Expert" : level
  // }
  const getDisplayLabel = (level: string) => {
  return level === "None" ? "None" : level
}


  // Helper to get color for skill level (Advanced/Expert always green)
  const getSkillColor = (level: string) => {
    switch (level) {
      case "Expert":
         return "bg-emerald-600 text-white dark:bg-emerald-500"
      // case "Advanced":
      //   return "bg-emerald-600 text-white dark:bg-emerald-500"
      case "High":
        return "bg-blue-600 text-white dark:bg-blue-500"
      case "Medium":
        return "bg-amber-600 text-white dark:bg-amber-500"
      case "Low":
        return "bg-red-600 text-white dark:bg-red-500"
      default:
        return "bg-gray-500 text-white dark:bg-gray-400"
    }
  }

  const calculateScore = (skills: Record<string, string>) => {
    const scoreMap = { Low: 1, Medium: 2, High: 3, Expert: 4 }
    return Object.values(skills).reduce((total, level) => {
      return total + (scoreMap[level as keyof typeof scoreMap] || 0)
    }, 0)
  }

  const calculateAverageSkillLevel = (skills: Record<string, string>) => {
    const scoreMap = { Low: 1, Medium: 2, High: 3, Expert: 4 }
    const scores = Object.values(skills).map((level) => scoreMap[level as keyof typeof scoreMap] || 0)
    if (scores.length === 0) return 0
    const average = scores.reduce((sum, score) => sum + score, 0) / scores.length
    return Math.round(average * 10) / 10
  }

  const getSkillDistribution = (skills: Record<string, string>) => {
    const distribution = { Expert: 0, High: 0, Medium: 0, Low: 0, None: 0 }
    Object.values(skills).forEach((level) => {
      distribution[level as keyof typeof distribution]++
    })
    return distribution
  }

  // Enhanced bar chart data with better colors and animations
  type SkillBarData = {
    skill: string;
    fullSkill: string;
    level: number;
    levelLabel: string;
    color: string;
  };
  const skillData: SkillBarData[] = Object.entries(parsedSkills)
    .map(([skill, level]) => {
      const levelStr = typeof level === 'string' ? level : '';
      const displayLevel = getDisplayLabel(levelStr);
      return {
        skill: skill.length > 15 ? skill.substring(0, 15) + "..." : skill,
        fullSkill: skill,
        level: displayLevel === "Expert" ? 4 : displayLevel === "High" ? 3 : displayLevel === "Medium" ? 2 : 1,
        levelLabel: displayLevel,
        color:
          displayLevel === "Expert" ? "#10b981" : displayLevel === "High" ? "#3b82f6" : displayLevel === "Medium" ? "#f59e0b" : "#ef4444",
      };
    })
    .sort((a, b) => b.level - a.level);

  const getBarGradient = (level: number) => {
    switch (level) {
      case 4:
        return "url(#advancedGradient)"
      case 3:
        return "url(#highGradient)"
      case 2:
        return "url(#mediumGradient)"
      case 1:
        return "url(#lowGradient)"
      default:
        return "#6b7280"
    }
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className={`p-4 rounded-xl shadow-2xl border backdrop-blur-sm ${
            isDark ? "bg-gray-800/95 border-gray-600 text-white" : "bg-white/95 border-gray-200 text-gray-900"
          }`}
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-4 h-4 rounded-full" style={{ backgroundColor: data.color }} />
            <p className="font-bold text-xl">{data.fullSkill}</p>
          </div>
          <div className="space-y-1">
            <p className={`text-base font-medium ${isDark ? "text-gray-300" : "text-gray-600"}`}>
              Skill Level:{" "}
              <span className="font-bold" style={{ color: data.color }}>
                {getDisplayLabel(data.levelLabel)}
              </span>
            </p>
            <p className={`text-base ${isDark ? "text-gray-400" : "text-gray-500"}`}>
              Score: <span className="font-semibold">{data.level}/4</span>
            </p>
          </div>
        </motion.div>
      )
    }
    return null
  }

  const totalSkills = Object.keys(parsedSkills).length
  const totalScore = calculateScore(parsedSkills)
  const averageLevel = calculateAverageSkillLevel(parsedSkills)
  const skillDistribution = getSkillDistribution(parsedSkills)

  // Calculate advanced (Expert/Expert) skills count
  const advancedSkillsCount = Object.values(parsedSkills).filter(
    (level) => getDisplayLabel(typeof level === 'string' ? level : '') === 'Expert'
  ).length;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.85, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.85, y: 50 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className={`w-full max-w-7xl max-h-[95vh] overflow-hidden rounded-3xl shadow-2xl border-2 ${
              isDark
                ? "bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 border-gray-700/50"
                : "bg-gradient-to-br from-white via-gray-50 to-white border-gray-200/50"
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Enhanced Header with Glassmorphism */}
            <div
              className={`px-8 py-6 border-b backdrop-blur-xl ${
                isDark
                  ? "border-gray-700/50 bg-gradient-to-r from-gray-800/80 to-gray-700/80"
                  : "border-gray-200/50 bg-gradient-to-r from-white/80 to-gray-50/80"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-6">
                  <motion.div
                    className="relative flex-shrink-0"
                    whileHover={{ scale: 1.05 }}
                    transition={{ type: "spring", stiffness: 400 }}
                  >
                    <div className="w-20 h-20 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 rounded-2xl flex items-center justify-center shadow-2xl">
                      <span className="text-white font-bold text-2xl">
                        {employeeData.name
                          .split(" ")
                          .map((n: string) => n[0])
                          .join("")}
                      </span>
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-4 border-white dark:border-gray-800"></div>
                  </motion.div>
                  <div className="flex flex-col justify-center">
                    <motion.h2
                      className={`text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent leading-tight ${
                        isDark ? "text-white" : ""
                      }`}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 }}
                    >
                      {employeeData.name}
                    </motion.h2>
                    <motion.p
                      className={`text-2xl ${isDark ? "text-gray-300" : "text-gray-600"} font-medium mt-1`}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 }}
                    >
                      {employee?.position || "Employee"}
                    </motion.p>
                  </div>
                </div>
                <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} className="flex-shrink-0">
                  <Button
                    onClick={onClose}
                    variant="ghost"
                    size="sm"
                    className={`p-3 rounded-xl ${
                      isDark
                        ? "hover:bg-gray-700/50 text-gray-300 hover:text-white"
                        : "hover:bg-gray-100/50 text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    <X className="h-6 w-6" />
                  </Button>
                </motion.div>
              </div>
            </div>

            {/* Enhanced Content */}
            <div className="p-8 overflow-y-auto max-h-[calc(95vh-140px)] custom-scrollbar">
              <div className="space-y-10">
                {/* Enhanced workHistory Info */}
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className={`p-8 rounded-2xl backdrop-blur-xl border shadow-xl ${
                    isDark ? "bg-gray-800/50 border-gray-700/50" : "bg-white/70 border-gray-200/50"
                  }`}
                >
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
                      <User className="h-6 w-6 text-white" />
                    </div>
                    <h3 className={`text-3xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
                      Employee Information
                    </h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[
                      { icon: Building2, label: "Department", value: employee?.department || "N/A", color: "text-blue-600" },
                      { icon: Calendar, label: "Active Since", value: employee?.hireDate ? new Date(employee.hireDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : "N/A", color: "text-green-600" },
                      { icon: Target, label: "Performance", value: employee?.performanceScore ? (employee.performanceScore >= 80 ? "Excellent" : employee.performanceScore >= 60 ? "Good" : "Average") : "N/A", color: "text-purple-600" },
                    ].map((info, index) => (
                      <motion.div
                        key={info.label}
                        className={`flex items-center gap-3 p-4 rounded-xl ${
                          isDark ? "bg-gray-700/30" : "bg-gray-50/50"
                        }`}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 + index * 0.1 }}
                        whileHover={{ scale: 1.02 }}
                      >
                        <info.icon className={`h-5 w-5 ${info.color} flex-shrink-0`} />
                        <div className="flex flex-col justify-center">
                          <p className={`text-base font-medium ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                            {info.label}
                          </p>
                          <p className={`text-xl font-bold ${isDark ? "text-white" : "text-gray-900"} mt-1`}>
                            {info.value}
                          </p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>

                {/* Enhanced Stats Overview with Glassmorphism Cards */}
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
                >
                  {[
                    {
                      icon: Award,
                      value: totalSkills,
                      label: "Total Skills",
                      gradient: "from-blue-500 to-cyan-500",
                      bgGradient: "from-blue-500/10 to-cyan-500/10",
                      delay: 0.1,
                    },
                    {
                      icon: Zap,
                      value: totalScore,
                      label: "Total Score",
                      gradient: "from-purple-500 to-pink-500",
                      bgGradient: "from-purple-500/10 to-pink-500/10",
                      delay: 0.2,
                    },
                    {
                      icon: TrendingUp,
                      value: averageLevel,
                      label: "Avg Level",
                      gradient: "from-emerald-500 to-teal-500",
                      bgGradient: "from-emerald-500/10 to-teal-500/10",
                      delay: 0.3,
                    },
                    {
                      icon: Star,
                      value: advancedSkillsCount,
                      label: "Advanced Skills",
                      gradient: "from-orange-500 to-red-500",
                      bgGradient: "from-orange-500/10 to-red-500/10",
                      delay: 0.4,
                    },
                  ].map((stat, index) => (
                    <motion.div
                      key={stat.label}
                      initial={{ opacity: 0, y: 20, scale: 0.9 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ delay: stat.delay, type: "spring", stiffness: 300 }}
                      whileHover={{ scale: 1.05, y: -5 }}
                      className={`relative p-6 rounded-2xl backdrop-blur-xl border shadow-xl ${
                        isDark ? "bg-gray-800/50 border-gray-700/50" : "bg-white/70 border-gray-200/50"
                      }`}
                    >
                      <div
                        className={`absolute inset-0 bg-gradient-to-br ${stat.bgGradient} rounded-2xl opacity-50`}
                      ></div>
                      <div className="relative flex items-center gap-4">
                        <div
                          className={`w-14 h-14 bg-gradient-to-br ${stat.gradient} rounded-xl flex items-center justify-center shadow-lg flex-shrink-0`}
                        >
                          <stat.icon className="h-7 w-7 text-white" />
                        </div>
                        <div className="flex flex-col justify-center">
                          <motion.h3
                            className={`text-4xl font-bold ${isDark ? "text-white" : "text-gray-900"} leading-tight`}
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: stat.delay + 0.2, type: "spring", stiffness: 500 }}
                          >
                            {stat.value}
                          </motion.h3>
                          <p className={`text-base font-medium ${isDark ? "text-gray-300" : "text-gray-600"} mt-1`}>
                            {stat.label}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>

                {/* Enhanced Skills Bar Chart */}
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className={`p-8 rounded-2xl backdrop-blur-xl border shadow-xl ${
                    isDark ? "bg-gray-800/50 border-gray-700/50" : "bg-white/70 border-gray-200/50"
                  }`}
                >
                  <div className="flex items-center gap-4 mb-8">
                    <div className="w-10 h-10 bg-gradient-to-br from-cyan-600 to-blue-600 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
                      <Activity className="h-6 w-6 text-white" />
                    </div>
                    <h3 className={`text-3xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
                      Skills Performance
                    </h3>
                  </div>
                  <div className="h-[500px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={skillData}
                        margin={{
                          top: 30,
                          right: 30,
                          left: 20,
                          bottom: 80,
                        }}
                        barCategoryGap="15%"
                      >
                        <defs>
                          <linearGradient id="advancedGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#10b981" stopOpacity={1} />
                            <stop offset="100%" stopColor="#059669" stopOpacity={0.8} />
                          </linearGradient>
                          <linearGradient id="highGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#3b82f6" stopOpacity={1} />
                            <stop offset="100%" stopColor="#2563eb" stopOpacity={0.8} />
                          </linearGradient>
                          <linearGradient id="mediumGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#f59e0b" stopOpacity={1} />
                            <stop offset="100%" stopColor="#d97706" stopOpacity={0.8} />
                          </linearGradient>
                          <linearGradient id="lowGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#ef4444" stopOpacity={1} />
                            <stop offset="100%" stopColor="#dc2626" stopOpacity={0.8} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid
                          strokeDasharray="3 3"
                          stroke={isDark ? "#374151" : "#e5e7eb"}
                          opacity={0.3}
                          vertical={false}
                        />
                        <XAxis
                          dataKey="skill"
                          stroke={isDark ? "#9ca3af" : "#6b7280"}
                          fontSize={15}
                          fontWeight={500}
                          angle={-45}
                          textAnchor="end"
                          height={100}
                          interval={0}
                          tick={{ fill: isDark ? "#d1d5db" : "#374151" }}
                        />
                        <YAxis
                          stroke={isDark ? "#9ca3af" : "#6b7280"}
                          fontSize={15}
                          fontWeight={500}
                          domain={[0, 4]}
                          ticks={[1, 2, 3, 4]}
                          tick={{ fill: isDark ? "#d1d5db" : "#374151" }}
                          tickFormatter={(value) => {
                            const labels = { 1: "Low", 2: "Medium", 3: "High", 4: "Expert" }
                            return labels[value as keyof typeof labels] || value
                          }}
                        />
                        <Tooltip content={<CustomTooltip />} cursor={{ fill: "transparent" }} />
                        <Bar
                          dataKey="level"
                          radius={[8, 8, 0, 0]}
                          stroke={isDark ? "#374151" : "#e5e7eb"}
                          strokeWidth={1}
                        >
                          {skillData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={getBarGradient(entry.level)} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  {/* Enhanced Legend */}
                  <div className="flex justify-center mt-6">
                    <div className="flex flex-wrap justify-center items-center gap-6 p-4 rounded-xl bg-gradient-to-r from-gray-50/50 to-gray-100/50 dark:from-gray-700/30 dark:to-gray-600/30">
                      {[
                        { level: "Expert", color: "#10b981", score: "4" },
                        { level: "High", color: "#3b82f6", score: "3" },
                        { level: "Medium", color: "#f59e0b", score: "2" },
                        { level: "Low", color: "#ef4444", score: "1" },
                      ].map((item) => (
                        <div key={item.level} className="flex items-center gap-2">
                          <div
                            className="w-4 h-4 rounded-full shadow-sm flex-shrink-0"
                            style={{ backgroundColor: item.color }}
                          ></div>
                          <span className={`text-base font-medium ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                            {getDisplayLabel(item.level)} ({item.score})
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>

                {/* Enhanced Individual Skills */}
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className={`p-8 rounded-2xl backdrop-blur-xl border shadow-xl ${
                    isDark ? "bg-gray-800/50 border-gray-700/50" : "bg-white/70 border-gray-200/50"
                  }`}
                >
                  <div className="flex items-center gap-4 mb-8">
                    <div className="w-10 h-10 bg-gradient-to-br from-violet-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
                      <Briefcase className="h-6 w-6 text-white" />
                    </div>
                    <h3 className={`text-3xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
                       Skills ({totalSkills} total)
                    </h3>
                  </div>
                  
                  {totalSkills === 0 ? (
                    // Display message when no skills are recorded
                    <div className={`text-center py-12 px-6 rounded-xl border-2 border-dashed ${
                      isDark ? "border-gray-600 bg-gray-700/20" : "border-gray-300 bg-gray-50/50"
                    }`}>
                      <div className="flex flex-col items-center gap-4">
                        <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
                          isDark ? "bg-gray-700" : "bg-gray-100"
                        }`}>
                          <Briefcase className={`h-8 w-8 ${isDark ? "text-gray-400" : "text-gray-500"}`} />
                        </div>
                        <div>
                          <h4 className={`text-xl font-semibold mb-2 ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                            No Skills Recorded
                          </h4>
                          <p className={`text-base ${isDark ? "text-gray-400" : "text-gray-500"} max-w-md mx-auto leading-relaxed`}>
                            This employee doesn't have any skills recorded in their profile yet. 
                            Skills can be added through the skills management system or during performance reviews.
                          </p>
                        </div>
                        <div className={`mt-4 px-4 py-2 rounded-lg ${
                          isDark ? "bg-blue-900/20 text-blue-400" : "bg-blue-50 text-blue-600"
                        } text-sm font-medium`}>
                          💡 Tip: Regular skill assessments help with career development and task assignments
                        </div>
                      </div>
                    </div>
                  ) : (
                    // Display skills grid when skills exist
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {Object.entries(parsedSkills).map(([skill, level], index) => (
                        <motion.div
                          key={skill}
                          initial={{ opacity: 0, y: 20, scale: 0.9 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          transition={{ delay: 0.6 + index * 0.05, type: "spring", stiffness: 300 }}
                          whileHover={{ scale: 1.03, y: -2 }}
                          onClick={() => navigateToSkillsMatrix(skill)}
                          className={`cursor-pointer p-6 rounded-xl border backdrop-blur-sm transition-all duration-300 ${
                            isDark
                              ? "bg-gray-700/40 border-gray-600/50 hover:bg-gray-700/60 hover:border-gray-500"
                              : "bg-white/60 border-gray-200/50 hover:bg-white/80 hover:border-gray-300"
                          } shadow-lg hover:shadow-xl ${loading ? 'opacity-50 pointer-events-none' : ''}`}
                        >
                          <div className="flex items-center gap-4">
                            <div className="flex-shrink-0">
                              <SkillIndicator level={getDisplayLabel(level as string)} size={64} showTooltip={true} />
                            </div>
                            <div className="flex-1 min-w-0 flex flex-col justify-center">
                              <h4
                                className={`font-bold text-xl ${isDark ? "text-white" : "text-gray-900"} leading-tight`}
                              >
                                {skill}
                              </h4>
                              <div className="mt-2">
                                <Chip label={getDisplayLabel(level as string)} className={`${getSkillColor(level as string)} text-base px-3 py-1`} />
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </motion.div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
