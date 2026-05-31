"use client"

import { motion, AnimatePresence } from "framer-motion"
import { X, Calendar, MapPin, Wrench, TrendingUp, Building2 } from "lucide-react"
import { useTheme } from "./ThemeProvider"
import Button from "./Button"
import Chip from "./Chip"
import type { EmployeeHistory } from "../types"

interface EmployeeHistoryModalProps {
  employee: EmployeeHistory | null
  isOpen: boolean
  onClose: () => void
}

export default function EmployeeHistoryModal({ employee, isOpen, onClose }: EmployeeHistoryModalProps) {
  const { isDark } = useTheme()

  if (!employee) return null

  const getSkillColor = (level: string) => {
    switch (level) {
      case "Advanced":
        return "bg-blue-800 text-white dark:bg-blue-600"
      case "High":
        return "bg-blue-500 text-white dark:bg-blue-400"
      case "Medium":
        return "bg-yellow-500 text-white dark:bg-yellow-400 dark:text-gray-900"
      case "Low":
        return "bg-gray-500 text-white dark:bg-gray-400"
      default:
        return "bg-gray-200 text-gray-800 dark:bg-gray-600 dark:text-gray-200"
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className={`w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-2xl shadow-2xl ${
              isDark ? "bg-gray-800 border border-gray-700" : "bg-white border border-gray-200"
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div
              className={`px-6 py-4 border-b ${isDark ? "border-gray-700 bg-gray-750" : "border-gray-200 bg-gray-50"}`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h2 className={`text-xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
                    {employee.employeeName} - History
                  </h2>
                  <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                    Employee ID: {employee.employeeId}
                  </p>
                </div>
                <Button onClick={onClose} variant="ghost" size="sm" className="p-2">
                  <X className="h-5 w-5" />
                </Button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              <div className="space-y-8">
                {/* Current Status */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className={`p-6 rounded-xl border-2 ${
                    isDark
                      ? "bg-gradient-to-r from-blue-900/20 to-purple-900/20 border-blue-500/30"
                      : "bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200"
                  }`}
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                      <TrendingUp className="h-5 w-5 text-white" />
                    </div>
                    <h3 className={`text-lg font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>
                      Current Status
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className={`text-sm font-medium ${isDark ? "text-gray-300" : "text-gray-700"} mb-2`}>
                        Current Department
                      </p>
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-blue-600" />
                        <span className={`font-medium ${isDark ? "text-white" : "text-gray-900"}`}>
                          {employee.currentDepartment}
                        </span>
                      </div>
                    </div>

                    <div>
                      <p className={`text-sm font-medium ${isDark ? "text-gray-300" : "text-gray-700"} mb-2`}>
                        Active Since
                      </p>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-green-600" />
                        <span className={`font-medium ${isDark ? "text-white" : "text-gray-900"}`}>
                          {formatDate(employee.currentStartDate ?? '')}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4">
                    <p className={`text-sm font-medium ${isDark ? "text-gray-300" : "text-gray-700"} mb-3`}>
                      Current Skills
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(employee.currentSkills ?? {}).map(([skill, level]) => (
                        <Chip key={skill} label={`${skill}: ${level as string}`} className={getSkillColor(level as string)} />
                      ))}
                    </div>
                  </div>
                </motion.div>

                {/* Department History */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 bg-gradient-to-br from-green-600 to-emerald-600 rounded-lg flex items-center justify-center">
                      <MapPin className="h-4 w-4 text-white" />
                    </div>
                    <h3 className={`text-lg font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>
                      Department History
                    </h3>
                  </div>

                  <div className="space-y-3">
                    {employee.departmentHistory.map((dept: any, index: number) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 + index * 0.1 }}
                        className={`p-4 rounded-lg border ${
                          isDark ? "bg-gray-700/50 border-gray-600" : "bg-gray-50 border-gray-200"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className={`font-medium ${isDark ? "text-white" : "text-gray-900"}`}>
                              {dept.departmentName}
                            </h4>
                            <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                              {formatDate(dept.startDate)} - {dept.endDate ? formatDate(dept.endDate) : "Present"}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className={`text-sm font-medium ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                              Duration: {dept.duration}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>

                {/* Skill History */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
                      <Wrench className="h-4 w-4 text-white" />
                    </div>
                    <h3 className={`text-lg font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>
                      Skill Development History
                    </h3>
                  </div>

                  <div className="space-y-4">
                    {employee.skillHistory.map((skillRecord: any, index: number) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5 + index * 0.1 }}
                        className={`p-4 rounded-lg border ${
                          isDark ? "bg-gray-700/50 border-gray-600" : "bg-gray-50 border-gray-200"
                        }`}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h4 className={`font-medium ${isDark ? "text-white" : "text-gray-900"}`}>
                              {skillRecord.machineName}
                            </h4>
                            <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                              {formatDate(skillRecord.acquiredDate)}
                              {skillRecord.lastUpdated && ` • Updated: ${formatDate(skillRecord.lastUpdated)}`}
                            </p>
                          </div>
                          <Chip label={skillRecord.currentLevel} className={getSkillColor(skillRecord.currentLevel)} />
                        </div>

                        {skillRecord.levelProgression && skillRecord.levelProgression.length > 0 && (
                          <div>
                            <p className={`text-xs font-medium ${isDark ? "text-gray-400" : "text-gray-600"} mb-2`}>
                              Skill Progression:
                            </p>
                            <div className="flex flex-wrap gap-1">
                              {skillRecord.levelProgression.map((level: any, levelIndex: number) => (
                                <span
                                  key={levelIndex}
                                  className={`text-xs px-2 py-1 rounded ${
                                    isDark ? "bg-gray-600 text-gray-300" : "bg-gray-200 text-gray-700"
                                  }`}
                                >
                                  {level.level} ({formatDate(level.date)})
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
