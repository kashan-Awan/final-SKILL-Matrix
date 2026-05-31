"use client"

import { motion } from "framer-motion"
import { AlertTriangle, Users, Wrench, CheckCircle } from "lucide-react"
import { useTheme } from "./ThemeProvider"
import type { StaffingMachine } from "../types/staffing"

interface MachineCardProps {
  machine: StaffingMachine
  isSelected: boolean
  onClick: () => void
  index: number
}

export default function MachineCard({ machine, isSelected, onClick, index }: MachineCardProps) {
  const { isDark } = useTheme()

  const getStatusColor = () => {
    if (machine.currentWorkers === 0) return "border-red-500 bg-red-50 dark:bg-red-900/20"
    if (machine.currentWorkers < machine.maxWorkers) return "border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20"
    return "border-green-500 bg-green-50 dark:bg-green-900/20"
  }

  const getStatusIcon = () => {
    if (machine.currentWorkers === 0) return <AlertTriangle className="h-4 w-4 text-red-600" />
    if (machine.currentWorkers < machine.maxWorkers) return <Users className="h-4 w-4 text-yellow-600" />
    return <CheckCircle className="h-4 w-4 text-green-600" />
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.3 }}
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`relative p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
        isSelected
          ? "border-blue-500 bg-blue-50 dark:bg-blue-900/30 shadow-lg"
          : isDark
            ? "border-gray-600 bg-gray-700/50 hover:bg-gray-700"
            : "border-gray-200 bg-white hover:bg-gray-50"
      } ${getStatusColor()}`}
    >
      {/* Status Indicators */}
      <div className="absolute top-2 right-2 flex gap-1">
        {machine.isCritical && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3 + index * 0.1 }}
            className="w-6 h-6 bg-red-600 rounded-full flex items-center justify-center"
            title="Critical Station"
          >
            <AlertTriangle className="h-3 w-3 text-white" />
          </motion.div>
        )}
        {machine.femaleEligible && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.4 + index * 0.1 }}
            className="w-6 h-6 bg-pink-500 rounded-full flex items-center justify-center"
            title="Female Eligible"
          >
            <span className="text-white text-xs font-bold">♀</span>
          </motion.div>
        )}
      </div>

      {/* Machine Info */}
      <div className="pr-16">
        <div className="flex items-start gap-3 mb-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
            <Wrench className="h-5 w-5 text-white" />
          </div>
          <div className="flex-1">
            <h3 className={`font-semibold text-sm ${isDark ? "text-white" : "text-gray-900"}`}>{machine.name}</h3>
            <p className={`text-xs ${isDark ? "text-gray-400" : "text-gray-600"}`}>ID: {machine.id}</p>
          </div>
        </div>

        {/* Worker Status */}
        <div className="flex items-center gap-2 mb-3">
          {getStatusIcon()}
          <span className={`text-xs font-medium ${isDark ? "text-gray-300" : "text-gray-700"}`}>
            {machine.currentWorkers}/{machine.maxWorkers} Workers
          </span>
        </div>

        {/* Required Skills */}
        <div className="space-y-1">
          <p className={`text-xs font-medium ${isDark ? "text-gray-400" : "text-gray-600"}`}>Required Skills:</p>
          <div className="flex flex-wrap gap-1">
            {machine.requiredSkills.slice(0, 2).map((skill) => (
              <span
                key={skill}
                className={`px-2 py-1 rounded-md text-xs ${
                  isDark ? "bg-gray-600 text-gray-300" : "bg-gray-100 text-gray-700"
                }`}
              >
                {skill}
              </span>
            ))}
            {machine.requiredSkills.length > 2 && (
              <span className={`text-xs ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                +{machine.requiredSkills.length - 2} more
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Selection Indicator */}
      {isSelected && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute bottom-2 right-2 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center"
        >
          <CheckCircle className="h-4 w-4 text-white" />
        </motion.div>
      )}
    </motion.div>
  )
}
