"use client"

import type React from "react"

import { forwardRef } from "react"
import { motion } from "framer-motion"
import { useTheme } from "./ThemeProvider"

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost"
  size?: "sm" | "md" | "lg"
  children: React.ReactNode
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", size = "md", className = "", children, ...props }, ref) => {
    const { isDark } = useTheme()

    const baseClasses =
      "inline-flex items-center justify-center font-medium rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden"

    const variantClasses = {
      primary: "bg-blue-600 text-white hover:bg-blue-700",
      secondary: isDark
        ? "bg-red-600 hover:bg-red-700 text-white shadow-md hover:shadow-lg"
        : "bg-gray-700 text-white hover:bg-gray-800",
      outline: isDark
        ? "border-2 border-gray-600 text-gray-300 hover:bg-gray-700 hover:border-gray-500"
        : "border-2 border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400",
      ghost: isDark ? "text-gray-300 hover:bg-gray-700/50" : "text-gray-700 hover:bg-gray-100/50",
    }

    const sizeClasses = {
      sm: "px-4 py-2 text-sm",
      md: "px-6 py-3 text-sm",
      lg: "px-8 py-4 text-base",
    }

    return (
      <motion.button
        ref={ref}
        whileHover={{ scale: 1.02, y: -1 }}
        whileTap={{ scale: 0.98 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
        {...(props as any)}
      >
        <motion.div
          className="relative z-10"
          whileHover={{ scale: 1.05 }}
          transition={{ type: "spring", stiffness: 400 }}
        >
          {children}
        </motion.div>
        {variant === "primary" && (
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-pink-600 to-purple-600 opacity-0"
            whileHover={{ opacity: 0.2 }}
            transition={{ duration: 0.3 }}
          />
        )}
      </motion.button>
    )
  },
)

Button.displayName = "Button"

export default Button
