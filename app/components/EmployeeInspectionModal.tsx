"use client"

import { motion, AnimatePresence } from "framer-motion"
import { useRouter } from "next/navigation"
import { useEffect, useState, useMemo } from "react"
import { 
  X, User, Award, TrendingUp, Calendar, Building2, 
  Star, Target, Zap, Activity, Briefcase, BookOpen, 
  ArrowRight, ShieldCheck, Sparkles, HeartHandshake
} from "lucide-react"
import { useTheme } from "./ThemeProvider"
import Button from "./Button"
import Chip from "./Chip"
import SkillIndicator from "./SkillIndicator"

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from "recharts"

interface workHistory {
  displayId: number
  name: string
  gender: string
  departmentId: number
  skills: string
}

interface workHistoryResponse {
  data: workHistory[]
}

interface workHistoryInspectionModalProps {
  employee: any
  workHistory: workHistoryResponse | null
  isOpen: boolean
  onClose: () => void
}

export default function WorkHistoryInspectionModal({ employee, workHistory, isOpen, onClose }: workHistoryInspectionModalProps) {
  const router = useRouter()
  const { isDark } = useTheme()
  const [selectedSkill, setSelectedSkill] = useState<string | null>(null)

  const employeeData = workHistory?.data?.[0]
  
  const parsedSkills = useMemo(() => {
    let skills: Record<string, string> = {}
    if (!employeeData) return skills
    try {
      if (typeof employeeData.skills === 'string') {
        const skillsArray = JSON.parse(employeeData.skills)
        skills = skillsArray.reduce((acc: any, skill: any) => {
          acc[skill.skillName] = skill.skillLevel
          return acc
        }, {})
      } else if (typeof employeeData.skills === 'object' && employeeData.skills !== null) {
        skills = employeeData.skills as Record<string, string>
      }
    } catch (error) {
      console.error("Error parsing skills:", error)
    }
    return skills
  }, [employeeData?.skills, employeeData])

  const skillsKeys = useMemo(() => Object.keys(parsedSkills), [parsedSkills])

  // Select the first skill by default
  useEffect(() => {
    if (skillsKeys.length > 0 && !selectedSkill) {
      setSelectedSkill(skillsKeys[0])
    }
  }, [skillsKeys, selectedSkill])

  // Helper to map skill level to display label
  const getDisplayLabel = (level: string) => {
    return level === "None" ? "None" : level
  }

  // Helper to get color for skill level
  const getSkillColor = (level: string) => {
    switch (level) {
      case "Expert":
        return "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900/50"
      case "High":
        return "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-900/50"
      case "Medium":
        return "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-900/50"
      case "Low":
        return "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/30 dark:text-red-400 dark:border-red-900/50"
      default:
        return "bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-950/30 dark:text-gray-400 dark:border-gray-900/50"
    }
  }

  // Get specific details, capabilities, and training recommendations for selected skill
  const skillDetails = useMemo(() => {
    if (!selectedSkill) return null
    const level = parsedSkills[selectedSkill] || "None"
    const cleanLevel = level.trim().toUpperCase()

    switch (cleanLevel) {
      case "EXPERT":
      case "ADVANCED":
        return {
          desc: "Demonstrates mastery of this skill. Can perform complex operations independently, troubleshoot equipment issues, and guide others.",
          icon: ShieldCheck,
          iconColor: "text-emerald-500",
          recs: [
            "Act as a peer mentor or coach for junior operators",
            "Assign to lead critical production tasks and high-precision lines",
            "Involve in standard operating procedure (SOP) design and review"
          ]
        }
      case "HIGH":
        return {
          desc: "Shows high proficiency. Performs tasks independently with high quality and speed, requiring minimal supervision.",
          icon: Award,
          iconColor: "text-blue-500",
          recs: [
            "Provide opportunities to handle advanced line processes",
            "Encourage participation in minor equipment troubleshooting",
            "Involve in training preparations for Expert level certification"
          ]
        }
      case "MEDIUM":
        return {
          desc: "Possesses working knowledge. Performs standard operations with general supervision, capable of resolving routine issues.",
          icon: Activity,
          iconColor: "text-amber-500",
          recs: [
            "Schedule regular practice on the line to build confidence and speed",
            "Pair with High/Expert operators for on-the-job guidance",
            "Enroll in advanced technical modules"
          ]
        }
      case "LOW":
        return {
          desc: "Has basic understanding. Performs simple tasks under direct supervision, currently learning core concepts.",
          icon: Target,
          iconColor: "text-red-500",
          recs: [
            "Enroll in foundational hands-on training sessions",
            "Assign structured, low-risk practice tasks under direct supervision",
            "Perform weekly performance and progress check-ins"
          ]
        }
      default:
        return {
          desc: "No active proficiency recorded in this skill. Training is recommended to build foundational capability.",
          icon: BookOpen,
          iconColor: "text-gray-500",
          recs: [
            "Enroll in introductory training program",
            "Review safety protocols and basic equipment controls",
            "Schedule a post-training baseline assessment"
          ]
        }
    }
  }, [selectedSkill, parsedSkills])

  // Calculation helpers
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

  const totalSkills = skillsKeys.length
  const totalScore = calculateScore(parsedSkills)
  const averageLevel = calculateAverageSkillLevel(parsedSkills)
  const advancedSkillsCount = Object.values(parsedSkills).filter(
    (level) => getDisplayLabel(typeof level === 'string' ? level : '') === 'Expert'
  ).length

  // Enhanced bar chart data with better colors
  type SkillBarData = {
    skill: string
    fullSkill: string
    level: number
    levelLabel: string
    color: string
  }
  const skillData: SkillBarData[] = Object.entries(parsedSkills)
    .map(([skill, level]) => {
      const levelStr = typeof level === 'string' ? level : ''
      const displayLevel = getDisplayLabel(levelStr)
      return {
        skill: skill.length > 15 ? skill.substring(0, 15) + "..." : skill,
        fullSkill: skill,
        level: displayLevel === "Expert" ? 4 : displayLevel === "High" ? 3 : displayLevel === "Medium" ? 2 : 1,
        levelLabel: displayLevel,
        color:
          displayLevel === "Expert" ? "#10b981" : displayLevel === "High" ? "#3b82f6" : displayLevel === "Medium" ? "#f59e0b" : "#ef4444",
      }
    })
    .sort((a, b) => b.level - a.level)

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

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div
          className={`p-3 rounded-xl shadow-xl border backdrop-blur-md ${
            isDark ? "bg-gray-900/90 border-gray-700 text-white" : "bg-white/95 border-gray-200 text-gray-900"
          }`}
        >
          <div className="flex items-center gap-2 mb-1">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: data.color }} />
            <p className="font-semibold text-sm">{data.fullSkill}</p>
          </div>
          <p className="text-xs text-muted-foreground">
            Level: <span className="font-semibold" style={{ color: data.color }}>{data.levelLabel}</span> ({data.level}/4)
          </p>
        </div>
      )
    }
    return null
  }

  if (!workHistory || !workHistory.data || !workHistory.data[0] || !employeeData) return null

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", duration: 0.4 }}
            className={`w-full max-w-6xl max-h-[90vh] flex flex-col overflow-hidden rounded-2xl shadow-2xl border ${
              isDark ? "bg-gray-900 border-gray-800 text-white" : "bg-slate-50 border-gray-200 text-gray-900"
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header: Profile Card */}
            <div
              className={`px-6 py-4 border-b flex items-center justify-between ${
                isDark ? "border-gray-800 bg-gray-900/90" : "border-gray-200 bg-white"
              }`}
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center shadow-md">
                  <span className="text-white font-bold text-lg">
                    {employeeData.name
                      .split(" ")
                      .map((n: string) => n[0])
                      .slice(0, 2)
                      .join("")}
                  </span>
                </div>
                <div>
                  <h2 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">
                    {employeeData.name}
                  </h2>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                      {employee?.position || "Employee"}
                    </span>
                    <span className="text-gray-300 dark:text-gray-700">•</span>
                    <span className="text-xs text-blue-600 dark:text-blue-400 font-semibold uppercase tracking-wider">
                      {employee?.department || "N/A"}
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={onClose}
                className={`p-2 rounded-lg transition-colors ${
                  isDark ? "hover:bg-gray-800 text-gray-400 hover:text-white" : "hover:bg-gray-100 text-gray-500 hover:text-gray-900"
                }`}
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Left Column (lg:col-span-7): Charts, Stats, and Active Skill Detail */}
                <div className="lg:col-span-7 space-y-6">
                  
                  {/* Performance stats row */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[
                      { label: "Total Skills", value: totalSkills, icon: Award, color: "text-blue-600 bg-blue-50 dark:bg-blue-950/20 dark:text-blue-400" },
                      { label: "Total Score", value: totalScore, icon: Zap, color: "text-purple-600 bg-purple-50 dark:bg-purple-950/20 dark:text-purple-400" },
                      { label: "Avg Level", value: averageLevel, icon: TrendingUp, color: "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/20 dark:text-emerald-400" },
                      { label: "Advanced Skills", value: advancedSkillsCount, icon: Star, color: "text-amber-600 bg-amber-50 dark:bg-amber-950/20 dark:text-amber-400" },
                    ].map((stat) => (
                      <div
                        key={stat.label}
                        className={`p-3 rounded-xl border flex flex-col justify-between transition-all ${
                          isDark ? "bg-gray-800/40 border-gray-800/80" : "bg-white border-gray-200/60"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{stat.label}</span>
                          <div className={`p-1.5 rounded-lg ${stat.color}`}>
                            <stat.icon className="h-3.5 w-3.5" />
                          </div>
                        </div>
                        <h4 className="text-xl font-bold mt-2 text-gray-900 dark:text-white leading-tight">
                          {stat.value}
                        </h4>
                      </div>
                    ))}
                  </div>

                  {/* Skills Performance Chart */}
                  <div className={`p-5 rounded-xl border ${isDark ? "bg-gray-900 border-gray-800" : "bg-white border-gray-200"}`}>
                    <h3 className="text-sm font-semibold mb-4 text-gray-900 dark:text-white flex items-center gap-2">
                      <Activity className="h-4 w-4 text-blue-500" />
                      Skills Proficiency Distribution
                    </h3>
                    <div className="h-[250px] w-full">
                      {totalSkills === 0 ? (
                        <div className="h-full flex items-center justify-center text-xs text-gray-400">
                          No chart data available
                        </div>
                      ) : (
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={skillData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
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
                            <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "#374151" : "#e2e8f0"} opacity={0.15} vertical={false} />
                            <XAxis
                              dataKey="skill"
                              stroke={isDark ? "#4b5563" : "#94a3b8"}
                              fontSize={9}
                              tickLine={false}
                              angle={-25}
                              textAnchor="end"
                              height={45}
                            />
                            <YAxis
                              stroke={isDark ? "#4b5563" : "#94a3b8"}
                              fontSize={10}
                              tickLine={false}
                              domain={[0, 4]}
                              ticks={[1, 2, 3, 4]}
                              tickFormatter={(val) => {
                                const labels = { 1: "L", 2: "M", 3: "H", 4: "E" }
                                return labels[val as keyof typeof labels] || val
                              }}
                            />
                            <Tooltip content={<CustomTooltip />} cursor={{ fill: isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)" }} />
                            <Bar dataKey="level" radius={[4, 4, 0, 0]} maxBarSize={32}>
                              {skillData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={getBarGradient(entry.level)} />
                              ))}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      )}
                    </div>
                  </div>

                  {/* Active Selected Skill Detail Panel */}
                  <AnimatePresence mode="wait">
                    {selectedSkill && skillDetails && (
                      <motion.div
                        key={selectedSkill}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className={`p-5 rounded-xl border shadow-sm ${
                          isDark ? "bg-gray-900 border-gray-800" : "bg-white border-gray-200"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-4 flex-wrap">
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-xl bg-slate-100 dark:bg-gray-800`}>
                              <skillDetails.icon className={`h-5 w-5 ${skillDetails.iconColor}`} />
                            </div>
                            <div>
                              <h4 className="text-base font-bold text-gray-900 dark:text-white">
                                {selectedSkill}
                              </h4>
                              <p className="text-[11px] text-gray-400 mt-0.5">Skill Assessment Detail</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-500 font-medium">Operator Proficiency:</span>
                            <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold border ${getSkillColor(parsedSkills[selectedSkill])}`}>
                              {getDisplayLabel(parsedSkills[selectedSkill])}
                            </span>
                          </div>
                        </div>

                        <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800/60">
                          <h5 className="text-xs font-semibold text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                            <BookOpen className="h-3.5 w-3.5" />
                            Capability Profile
                          </h5>
                          <p className="text-xs text-gray-600 dark:text-gray-300 mt-2 leading-relaxed">
                            {skillDetails.desc}
                          </p>

                          <h5 className="text-xs font-semibold text-gray-500 dark:text-gray-400 mt-4 flex items-center gap-1.5">
                            <HeartHandshake className="h-3.5 w-3.5" />
                            Training & Action Plan
                          </h5>
                          <ul className="mt-2.5 space-y-2">
                            {skillDetails.recs.map((rec, i) => (
                              <li key={i} className="flex items-start gap-2 text-xs text-gray-600 dark:text-gray-300">
                                <ArrowRight className="h-3 w-3 mt-0.5 text-blue-500 flex-shrink-0" />
                                <span>{rec}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                </div>

                {/* Right Column (lg:col-span-5): Skill Selector list */}
                <div className="lg:col-span-5 flex flex-col h-full space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                      <Briefcase className="h-4 w-4 text-indigo-500" />
                      Recorded Skills ({totalSkills})
                    </h3>
                    <span className="text-[10px] text-muted-foreground bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-full font-medium">
                      Select for details
                    </span>
                  </div>

                  {totalSkills === 0 ? (
                    <div className={`text-center py-12 px-6 rounded-xl border-2 border-dashed ${
                      isDark ? "border-gray-850 bg-gray-950/20" : "border-gray-200 bg-white"
                    }`}>
                      <Briefcase className="h-8 w-8 text-gray-400 mx-auto mb-3" />
                      <h4 className="text-sm font-bold text-gray-700 dark:text-gray-300">No Skills Recorded</h4>
                      <p className="text-xs text-gray-500 mt-1 max-w-[200px] mx-auto">
                        Add operator skills using the skill matrix manager.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-[460px] overflow-y-auto pr-1 custom-scrollbar">
                      {skillsKeys.map((skill) => {
                        const level = parsedSkills[skill]
                        const isSelected = selectedSkill === skill
                        return (
                          <motion.div
                            key={skill}
                            onClick={() => setSelectedSkill(skill)}
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.99 }}
                            className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                              isSelected
                                ? isDark
                                  ? "bg-slate-800/90 border-blue-500/50 shadow-md shadow-blue-950/20"
                                  : "bg-blue-50/50 border-blue-200 shadow-sm"
                                : isDark
                                ? "bg-gray-900/60 border-gray-800/80 hover:bg-gray-800/50 hover:border-gray-700"
                                : "bg-white border-gray-200/70 hover:bg-gray-50 hover:border-gray-300"
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <SkillIndicator level={getDisplayLabel(level)} size={28} showTooltip={false} />
                              <span className={`text-xs font-semibold ${
                                isSelected 
                                  ? "text-blue-600 dark:text-blue-400" 
                                  : "text-gray-700 dark:text-gray-300"
                              }`}>
                                {skill}
                              </span>
                            </div>
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${getSkillColor(level)}`}>
                              {getDisplayLabel(level)}
                            </span>
                          </motion.div>
                        )
                      })}
                    </div>
                  )}

                  {/* Footer Tip */}
                  <div className={`p-4 rounded-xl border ${
                    isDark ? "bg-gray-800/20 border-gray-800/50 text-gray-400" : "bg-slate-100/60 border-gray-200/50 text-gray-500"
                  } text-[11px] leading-relaxed flex gap-2.5 items-start`}>
                    <Sparkles className="h-4 w-4 text-amber-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold text-gray-700 dark:text-gray-300">Skills Explorer tip:</span> Click on individual skill cards on the right to examine capability details, checklists, and professional operator development recommendations.
                    </div>
                  </div>

                </div>

              </div>
            </div>

            {/* Modal Footer */}
            <div
              className={`px-6 py-3 border-t flex items-center justify-end ${
                isDark ? "border-gray-800 bg-gray-900/90" : "border-gray-200 bg-white"
              }`}
            >
              <Button onClick={onClose} variant="outline" size="sm" className="text-xs">
                Close Inspector
              </Button>
            </div>

          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
