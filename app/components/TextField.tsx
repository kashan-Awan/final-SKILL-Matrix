"use client"

import type React from "react"

import { forwardRef, useState } from "react"
import { motion } from "framer-motion"
import { useTheme } from "./ThemeProvider"

interface TextFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  icon?: React.ReactNode
}

const TextField = forwardRef<HTMLInputElement, TextFieldProps>(
  ({ label, error, icon, className = "", ...props }, ref) => {
    const { isDark } = useTheme()
    const [isFocused, setIsFocused] = useState(false)

    return (
      <div className="w-full">
        {label && (
          <motion.label
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`block text-sm font-medium mb-2 ${isDark ? "text-gray-200" : "text-gray-700"} transition-colors`}
          >
            {label}
          </motion.label>
        )}
        <div className="relative">
          <motion.input
            ref={ref}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            whileFocus={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300 }}
            className={`
              w-full px-4 py-3 border-2 rounded-xl shadow-sm placeholder-gray-400 
              focus:outline-none focus:ring-0 transition-all duration-200
              ${
                isFocused
                  ? isDark
                    ? "border-purple-500 bg-gray-700/50"
                    : "border-purple-500 bg-white"
                  : isDark
                    ? "border-gray-600 bg-gray-700/30 hover:bg-gray-700/50"
                    : "border-gray-300 bg-white hover:border-gray-400"
              }
              ${isDark ? "text-white" : "text-gray-900"}
              ${error ? "border-red-500" : ""}
              ${icon ? "pr-12" : ""}
              ${className}
            `}
            {...(props as any)}
          />
          {icon && (
            <div
              className={`absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none ${
                isDark ? "text-gray-400" : "text-gray-500"
              }`}
            >
              {icon}
            </div>
          )}
          {isFocused && (
            <motion.div
              layoutId="textfield-focus"
              className="absolute inset-0 rounded-xl border-2 border-purple-500 pointer-events-none"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />
          )}
        </div>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-1 text-sm text-red-500"
          >
            {error}
          </motion.p>
        )}
      </div>
    )
  },
)

TextField.displayName = "TextField"

export default TextField
