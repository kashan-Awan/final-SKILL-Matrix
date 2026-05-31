"use client"

import { motion } from "framer-motion"
import { User, Award, Star, AlertCircle } from "lucide-react"
import { useTheme } from "./ThemeProvider"
import SkillIndicator from "./SkillIndicator"
import type { StaffingEmployee } from "../types/staffing"

interface EmployeeMatchCardProps {
  employee: StaffingEmployee
  requiredSkills: string[]
  isSelected: boolean
  onClick: () => void
  index: number
}

export default function EmployeeMatchCard({
  employee,
  requiredSkills,
  isSelected,
  onClick,
  index,
}: EmployeeMatchCardProps) {
  const { isDark } = useTheme()

  const getSkillMatch = () => {
    const matchedSkills = requiredSkills.filter((skill) => {
      const employeeSkill = employee.skills[skill]
      return employeeSkill && employeeSkill !== "None"
    })
    return {
      matched: matchedSkills.length,
      total: requiredSkills.length,
      percentage: Math.round((matchedSkills.length / requiredSkills.length) * 100),
    }
  }

  const skillMatch = getSkillMatch()

  const getMatchColor = () => {
    if (skillMatch.percentage >= 80) return "text-green-600 bg-green-50 dark:bg-green-900/20"
    if (skillMatch.percentage >= 50) return "text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20"
    return "text-red-600 bg-red-50 dark:bg-red-900/20"
  }

  const getGenderIcon = () => {
    return employee.gender === "female" ? (
      <div className="w-6 h-6 bg-pink-500 rounded-full flex items-center justify-center">
        <span className="text-white text-xs font-bold">♀</span>
      </div>
    ) : (
      <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
        <span className="text-white text-xs font-bold">♂</span>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`relative p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
        isSelected
          ? "border-blue-500 bg-blue-50 dark:bg-blue-900/30 shadow-lg"
          : isDark
            ? "border-gray-600 bg-gray-700/50 hover:bg-gray-700"
            : "border-gray-200 bg-white hover:bg-gray-50"
      }`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
            <User className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className={`font-semibold text-sm ${isDark ? "text-white" : "text-gray-900"}`}>{employee.name}</h3>
            <p className={`text-xs ${isDark ? "text-gray-400" : "text-gray-600"}`}>Card: {employee.cardNumber}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {getGenderIcon()}
          {employee.isHighlySkilled && (
            <div className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center" title="Highly Skilled">
              <Star className="h-3 w-3 text-white" />
            </div>
          )}
        </div>
      </div>

      {/* Skill Match Indicator */}
      <div className={`p-2 rounded-lg mb-3 ${getMatchColor()}`}>
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium">
            Skill Match: {skillMatch.matched}/{skillMatch.total}
          </span>
          <span className="text-xs font-bold">{skillMatch.percentage}%</span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-1.5 mt-1">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${skillMatch.percentage}%` }}
            transition={{ delay: 0.5 + index * 0.05, duration: 0.8 }}
            className={`h-1.5 rounded-full ${
              skillMatch.percentage >= 80
                ? "bg-green-600"
                : skillMatch.percentage >= 50
                  ? "bg-yellow-600"
                  : "bg-red-600"
            }`}
          />
        </div>
      </div>

      {/* Required Skills */}
      <div className="space-y-2">
        <p className={`text-xs font-medium ${isDark ? "text-gray-400" : "text-gray-600"}`}>Required Skills:</p>
        <div className="grid grid-cols-2 gap-2">
          {requiredSkills.map((skill) => {
            const employeeSkillLevel = employee.skills[skill] || "None"
            const hasSkill = employeeSkillLevel !== "None"
            return (
              <div key={skill} className="flex items-center gap-2">
                <SkillIndicator level={employeeSkillLevel} size={24} showTooltip={false} />
                <div className="flex-1 min-w-0">
                  <p
                    className={`text-xs truncate ${
                      hasSkill
                        ? isDark
                          ? "text-green-400"
                          : "text-green-600"
                        : isDark
                          ? "text-red-400"
                          : "text-red-600"
                    }`}
                  >
                    {skill}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Employee Stats */}
      <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-1">
            <Award className="h-3 w-3 text-blue-600" />
            <span className={isDark ? "text-gray-400" : "text-gray-600"}>{employee.totalSkills} Total Skills</span>
          </div>
          {skillMatch.percentage < 50 && (
            <div className="flex items-center gap-1 text-red-600">
              <AlertCircle className="h-3 w-3" />
              <span className="text-xs">Low Match</span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}
