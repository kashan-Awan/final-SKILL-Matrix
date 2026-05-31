"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronDown, X, Check } from "lucide-react"
import { useTheme } from "./ThemeProvider"

interface MultiSelectOption {
  value: string
  label: string
}

interface MultiSelectProps {
  label?: string
  options: MultiSelectOption[]
  value: string[]
  onChange: (value: string[]) => void
  placeholder?: string
  error?: string
}

export default function MultiSelect({ label, options, value, onChange, placeholder, error }: MultiSelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const { isDark } = useTheme()
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleToggleOption = (optionValue: string) => {
    if (value.includes(optionValue)) {
      onChange(value.filter((v) => v !== optionValue))
    } else {
      onChange([...value, optionValue])
    }
  }

  const handleRemoveOption = (optionValue: string, e: React.MouseEvent) => {
    e.stopPropagation()
    onChange(value.filter((v) => v !== optionValue))
  }

  const selectedOptions = options.filter((option) => value.includes(option.value))

  return (
    <div className="w-full" ref={dropdownRef}>
      {label && (
        <label className={`block text-sm font-medium mb-2 ${isDark ? "text-gray-200" : "text-gray-700"}`}>
          {label}
        </label>
      )}

      <div className="relative">
        <motion.button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          whileTap={{ scale: 0.98 }}
          className={`
            w-full px-4 py-3 text-left border-2 rounded-xl shadow-sm focus:outline-none focus:ring-0 transition-all duration-200 min-h-[48px]
            ${
              isOpen
                ? isDark
                  ? "border-purple-500 bg-gray-700/50"
                  : "border-purple-500 bg-white"
                : isDark
                  ? "border-gray-600 bg-gray-700/30 hover:bg-gray-700/50"
                  : "border-gray-300 bg-white hover:border-gray-400"
            }
            ${isDark ? "text-white" : "text-gray-900"}
            ${error ? "border-red-500" : ""}
          `}
        >
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              {selectedOptions.length === 0 ? (
                <span className="text-gray-400">{placeholder}</span>
              ) : (
                <div className="flex flex-wrap gap-1">
                  {selectedOptions.map((option) => (
                    <motion.span
                      key={option.value}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium ${
                        isDark ? "bg-blue-600 text-white" : "bg-blue-100 text-blue-800 border border-blue-200"
                      }`}
                    >
                      {option.label}
                      <button
                        onClick={(e) => handleRemoveOption(option.value, e)}
                        className="hover:bg-blue-700 dark:hover:bg-blue-500 rounded-full p-0.5 transition-colors"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </motion.span>
                  ))}
                </div>
              )}
            </div>
            <ChevronDown
              className={`h-5 w-5 transition-transform duration-200 ${
                isOpen ? "rotate-180" : ""
              } ${isDark ? "text-gray-400" : "text-gray-500"}`}
            />
          </div>
        </motion.button>

        <AnimatePresence>
          {isOpen && (
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
                {options.length === 0 ? (
                  <div className={`px-4 py-3 text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                    No options available
                  </div>
                ) : (
                  options.map((option) => {
                    const isSelected = value.includes(option.value)
                    return (
                      <motion.button
                        key={option.value}
                        type="button"
                        onClick={() => handleToggleOption(option.value)}
                        whileHover={{ backgroundColor: isDark ? "#374151" : "#f3f4f6" }}
                        className={`w-full text-left px-4 py-3 text-sm flex items-center justify-between transition-colors ${
                          isSelected
                            ? isDark
                              ? "bg-blue-600 text-white"
                              : "bg-blue-50 text-blue-600"
                            : isDark
                              ? "text-gray-200 hover:bg-gray-600"
                              : "text-gray-900 hover:bg-gray-100"
                        }`}
                      >
                        <span>{option.label}</span>
                        {isSelected && <Check className="h-4 w-4" />}
                      </motion.button>
                    )
                  })
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {error && (
        <motion.p initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mt-1 text-sm text-red-500">
          {error}
        </motion.p>
      )}

      {selectedOptions.length > 0 && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className={`mt-1 text-xs ${isDark ? "text-gray-400" : "text-gray-500"}`}
        >
          {selectedOptions.length} machine{selectedOptions.length !== 1 ? "s" : ""} selected
        </motion.p>
      )}
    </div>
  )
}
