"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Search, User, X, History, Building2, Award, Calendar } from "lucide-react"
import { useTheme } from "./ThemeProvider"
import TextField from "./TextField"
import Button from "./Button"
import Chip from "./Chip"
import EmployeeHistoryModal from "./EmployeeHistoryModal"
import type { Employee, EmployeeHistory } from "../types"

interface EmployeeSearchPanelProps {
  employees: Employee[]
  onEmployeeSelect?: (employee: Employee | null) => void
  selectedEmployee?: Employee | null
}

export default function EmployeeSearchPanel({
  employees,
  onEmployeeSelect,
  selectedEmployee,
}: EmployeeSearchPanelProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [searchResults, setSearchResults] = useState<Employee[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [selectedEmployeeHistory, setSelectedEmployeeHistory] = useState<EmployeeHistory | null>(null)
  const { isDark } = useTheme()

  useEffect(() => {
    if (searchTerm.trim()) {
      setIsSearching(true)
      // Simulate API search delay
      const timer = setTimeout(() => {
        const results = employees.filter(
          (emp) =>
            emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (emp.employeeId ?? "").toLowerCase().includes(searchTerm.toLowerCase()),
        )
        setSearchResults(results)
        setShowResults(true)
        setIsSearching(false)
      }, 300)

      return () => clearTimeout(timer)
    } else {
      setSearchResults([])
      setShowResults(false)
      setIsSearching(false)
    }
  }, [searchTerm, employees])

  const handleEmployeeSelect = (employee: Employee) => {
    onEmployeeSelect?.(employee)
    setShowResults(false)
  }

  const handleClearSearch = () => {
    setSearchTerm("")
    setSearchResults([])
    setShowResults(false)
    onEmployeeSelect?.(null)
  }

  const handleViewHistory = (_employee: Employee) => {
    setSelectedEmployeeHistory(null)
  }

  const getSkillColor = (level: string) => {
    switch (level) {
      case "Advanced":
        return "bg-green-600 text-white dark:bg-green-500"
      case "High":
        return "bg-yellow-600 text-white dark:bg-yellow-500"
      case "Medium":
        return "bg-orange-600 text-white dark:bg-orange-500"
      case "Low":
        return "bg-yellow-700 text-white dark:bg-yellow-600"
      default:
        return "bg-gray-500 text-white dark:bg-gray-400"
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
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border ${
          isDark ? "border-gray-700" : "border-gray-200"
        }`}
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
            <Search className="h-4 w-4 text-white" />
          </div>
          <h3 className={`text-lg font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>
            Employee Search & Filter
          </h3>
        </div>

        <div className="relative">
          <div className="flex gap-3">
            <div className="flex-1">
              <TextField
                placeholder="Search by Employee Name or ID (e.g., 'John' or 'EMP001')"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                icon={
                  isSearching ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                      className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full"
                    />
                  ) : (
                    <Search className="h-5 w-5" />
                  )
                }
              />
            </div>
            {(searchTerm || selectedEmployee) && (
              <Button
                onClick={handleClearSearch}
                variant="outline"
                size="md"
                className="flex items-center gap-2 text-red-600 hover:text-red-700 border-red-300 hover:border-red-400 bg-transparent"
              >
                <X className="h-4 w-4" />
                Clear
              </Button>
            )}
          </div>

          {/* Search Results Dropdown */}
          <AnimatePresence>
            {showResults && searchResults.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className={`absolute z-50 w-full mt-2 border rounded-xl shadow-lg max-h-60 overflow-auto ${
                  isDark ? "bg-gray-700 border-gray-600" : "bg-white border-gray-300"
                }`}
              >
                <div className="py-2">
                  {searchResults.map((employee) => (
                    <motion.button
                      key={employee.employeeId ?? employee.id}
                      onClick={() => handleEmployeeSelect(employee)}
                      whileHover={{ backgroundColor: isDark ? "#374151" : "#f3f4f6" }}
                      className={`w-full text-left px-4 py-3 flex items-center gap-3 transition-colors ${
                        (selectedEmployee?.employeeId ?? selectedEmployee?.id?.toString()) === (employee.employeeId ?? employee.id?.toString())
                          ? isDark
                            ? "bg-blue-600 text-white"
                            : "bg-blue-50 text-blue-600"
                          : isDark
                            ? "text-gray-200 hover:bg-gray-600"
                            : "text-gray-900 hover:bg-gray-100"
                      }`}
                    >
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                        <span className="text-white font-semibold text-xs">
                          {employee.name
                            .split(" ")
                            .map((n: string) => n[0])
                            .join("")}
                        </span>
                      </div>
                      <div className="flex-1">
                        <div className="font-medium">{employee.name}</div>
                        <div className="text-xs opacity-75">ID: {employee.employeeId}</div>
                      </div>
                      <div className="text-xs opacity-75">{Object.keys(employee.skills ?? {}).length} skills</div>
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* No Results Message */}
          {showResults && searchResults.length === 0 && searchTerm && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`mt-3 p-3 rounded-lg ${
                isDark ? "bg-red-900/20 border border-red-800" : "bg-red-50 border border-red-200"
              }`}
            >
              <p className={`text-sm ${isDark ? "text-red-400" : "text-red-700"}`}>
                No employees found matching "{searchTerm}". Try searching by name or employee ID.
              </p>
            </motion.div>
          )}
        </div>

        {/* Selected Employee Details */}
        <AnimatePresence>
          {selectedEmployee && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="mt-6 overflow-hidden"
            >
              <div
                className={`p-4 rounded-lg border ${
                  isDark ? "bg-gray-700/50 border-gray-600" : "bg-gray-50 border-gray-200"
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                      <User className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h4 className={`text-lg font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>
                        {selectedEmployee.name}
                      </h4>
                      <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                        Employee ID: {selectedEmployee.employeeId}
                      </p>
                    </div>
                  </div>
                  <Button
                    onClick={() => handleViewHistory(selectedEmployee)}
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    <History className="h-4 w-4" />
                    View History
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-blue-600" />
                    <span className={`text-sm ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                      Current Department: <strong>Manufacturing</strong>
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-green-600" />
                    <span className={`text-sm ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                      Active Since: <strong>Jan 15, 2023</strong>
                    </span>
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Award className="h-4 w-4 text-purple-600" />
                    <span className={`text-sm font-medium ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                      Current Skills ({Object.keys(selectedEmployee.skills ?? {}).length} total):
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(selectedEmployee.skills ?? {}).map(([skill, level]) => (
                      <Chip key={skill} label={`${skill}: ${level as string}`} className={getSkillColor(level as string)} />
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Employee History Modal */}
      <EmployeeHistoryModal
        employee={selectedEmployeeHistory}
        isOpen={!!selectedEmployeeHistory}
        onClose={() => setSelectedEmployeeHistory(null)}
      />
    </>
  )
}
