"use client"

import { motion } from "framer-motion"
import SkillIndicator from "./SkillIndicator"
import { useTheme } from "./ThemeProvider"

export default function SkillLegend() {
  const { isDark } = useTheme()

  const skillLevels = [
    { level: "Advanced", description: "Expert level proficiency (100%)", color: "text-green-600 dark:text-green-400" },
    { level: "High", description: "High level proficiency (75%)", color: "text-yellow-600 dark:text-yellow-400" },
    { level: "Medium", description: "Moderate proficiency (50%)", color: "text-orange-600 dark:text-orange-400" },
    { level: "Low", description: "Basic proficiency (25%)", color: "text-yellow-700 dark:text-yellow-600" },
    { level: "None", description: "No experience (0%)", color: "text-gray-600 dark:text-gray-400" },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`bg-white dark:bg-gray-800 shadow-lg rounded-xl p-6 border ${
        isDark ? "border-gray-700" : "border-gray-200"
      }`}
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
          <span className="text-white text-sm font-bold">📊</span>
        </div>
        <h3 className={`text-lg font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>Skill Level Legend</h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {skillLevels.map((skill, index) => (
          <motion.div
            key={skill.level}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1, duration: 0.4 }}
            className={`flex items-center gap-3 p-3 rounded-lg border transition-all duration-200 hover:shadow-md ${
              isDark
                ? "bg-gray-700/50 border-gray-600 hover:bg-gray-700"
                : "bg-gray-50 border-gray-200 hover:bg-gray-100"
            }`}
          >
            <SkillIndicator level={skill.level} size={40} showTooltip={false} />
            <div className="flex-1 min-w-0">
              <div className={`font-medium text-sm ${skill.color}`}>{skill.level}</div>
              <div className={`text-xs ${isDark ? "text-gray-400" : "text-gray-600"}`}>{skill.description}</div>
            </div>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className={`mt-4 p-3 rounded-lg ${
          isDark ? "bg-blue-900/20 border border-blue-800" : "bg-blue-50 border border-blue-200"
        }`}
      >
        <p className={`text-xs ${isDark ? "text-blue-300" : "text-blue-700"}`}>
          💡 <strong>Tip:</strong> Hover over any skill indicator to see detailed information about the proficiency
          level.
        </p>
      </motion.div>
    </motion.div>
  )
}
