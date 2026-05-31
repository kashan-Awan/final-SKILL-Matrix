"use client"

import { motion } from "framer-motion"
import { useState } from "react"

interface SkillIndicatorProps {
  level: string
  size?: number
  showTooltip?: boolean
  showLabel?: boolean
}

export default function SkillIndicator({
  level,
  size = 32,
  showTooltip = true,
  showLabel = false,
}: SkillIndicatorProps) {
  const [showTooltipState, setShowTooltipState] = useState(false)

  const getSkillData = (skillLevel: string) => {
    switch (skillLevel) {
      case "Expert":
        return {
          percentage: 100,
          color: "#10b981", // Emerald
          shadowColor: "#10b98150",
          bgColor: "#d1fae5",
          label: "Advanced",
          description: "Expert level proficiency",
          icon: "🏆",
        }
      case "High":
        return {
          percentage: 75,
          color: "#3b82f6", // Blue
          shadowColor: "#3b82f650",
          bgColor: "#dbeafe",
          label: "High",
          description: "High level proficiency",
          icon: "⭐",
        }
      case "Medium":
        return {
          percentage: 50,
          color: "#f59e0b", // Amber
          shadowColor: "#f59e0b50",
          bgColor: "#fef3c7",
          label: "Medium",
          description: "Moderate proficiency",
          icon: "📈",
        }
      case "Low":
        return {
          percentage: 25,
          color: "#ef4444", // Red
          shadowColor: "#ef444450",
          bgColor: "#fee2e2",
          label: "Low",
          description: "Basic proficiency",
          icon: "📊",
        }
      case "None":
      default:
        return {
          percentage: 0,
          color: "#6b7280", // Gray
          shadowColor: "#6b728050",
          bgColor: "#f3f4f6",
          label: "No Skill",
          description: "No experience",
          icon: "⚪",
        }
    }
  }

  const skillData = getSkillData(level)
  const radius = (size - 8) / 2
  const circumference = 2 * Math.PI * radius
  const strokeDasharray = circumference
  const strokeDashoffset = circumference - (skillData.percentage / 100) * circumference

  return (
    <div className="flex flex-col items-center gap-2">
      <div
        className="relative inline-flex items-center justify-center"
        role="img"
        aria-label={`Skill level: ${skillData.label} - ${skillData.percentage}% proficiency`}
        tabIndex={0}
      >
        <motion.div
          className="relative"
          onMouseEnter={() => setShowTooltipState(true)}
          onMouseLeave={() => setShowTooltipState(false)}
          onFocus={() => setShowTooltipState(true)}
          onBlur={() => setShowTooltipState(false)}
          whileHover={{ scale: 1.15, rotate: 5 }}
          whileTap={{ scale: 0.95 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          tabIndex={0}
          role="button"
          aria-describedby={showTooltipState ? `tooltip-${level}-${size}` : undefined}
          style={{
            filter: `drop-shadow(0 4px 12px ${skillData.shadowColor})`,
          }}
        >
          {/* Outer glow ring */}
          <motion.div
            className="absolute inset-0 rounded-full"
            style={{
              background: `conic-gradient(from 0deg, ${skillData.color}20, ${skillData.color}10, ${skillData.color}20)`,
            }}
            animate={{ rotate: 360 }}
            transition={{ duration: 8, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
          />

          <svg
            width={size}
            height={size}
            className="relative z-10 transform -rotate-90"
            viewBox={`0 0 ${size} ${size}`}
          >
            {/* Background circle with gradient */}
            <defs>
              <linearGradient id={`bg-gradient-${level}-${size}`} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#f8fafc" />
                <stop offset="100%" stopColor="#e2e8f0" />
              </linearGradient>
              <linearGradient id={`skill-gradient-${level}-${size}`} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor={skillData.color} />
                <stop offset="50%" stopColor={skillData.color} stopOpacity="0.8" />
                <stop offset="100%" stopColor={skillData.color} />
              </linearGradient>
            </defs>

            {/* Background circle */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke={`url(#bg-gradient-${level}-${size})`}
              strokeWidth="4"
              fill="none"
              className="dark:stroke-gray-600"
            />

            {/* Progress circle */}
            {skillData.percentage > 0 && (
              <motion.circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                stroke={`url(#skill-gradient-${level}-${size})`}
                strokeWidth="4"
                fill="none"
                strokeDasharray={strokeDasharray}
                strokeLinecap="round"
                initial={{ strokeDashoffset: circumference }}
                animate={{ strokeDashoffset }}
                transition={{ duration: 1.5, ease: "easeOut", delay: 0.2 }}
                style={{
                  filter: `drop-shadow(0 0 6px ${skillData.color}40)`,
                }}
              />
            )}

            {/* Inner filled circle for visual emphasis */}
            {skillData.percentage > 0 && (
              <motion.circle
                cx={size / 2}
                cy={size / 2}
                r={radius - 8}
                fill={skillData.color}
                initial={{ scale: 0, opacity: 0 }}
                animate={{
                  scale: skillData.percentage / 100,
                  opacity: 0.15 + (skillData.percentage / 100) * 0.25,
                }}
                transition={{ duration: 1, ease: "easeOut", delay: 0.5 }}
              />
            )}
          </svg>

          {/* Center content */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, delay: 0.8 }}
              className="text-lg"
            >
              {skillData.icon}
            </motion.div>
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 1 }}
              className="text-xs font-bold mt-1"
              style={{ color: skillData.color }}
            >
              {skillData.percentage}%
            </motion.span>
          </div>

          {/* Tooltip */}
          {showTooltip && showTooltipState && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.9 }}
              className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-3 z-50"
            >
              <div
                id={`tooltip-${level}-${size}`}
                className="bg-gray-900 dark:bg-gray-700 text-white text-xs rounded-xl px-4 py-3 shadow-2xl border border-gray-700 dark:border-gray-600 min-w-max"
                role="tooltip"
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-base">{skillData.icon}</span>
                  <span className="font-semibold">{skillData.label}</span>
                </div>
                <div className="text-gray-300 dark:text-gray-400 mb-1">{skillData.description}</div>
                <div className="text-center">
                  <span className="font-bold" style={{ color: skillData.color }}>
                    {skillData.percentage}% proficiency
                  </span>
                </div>
                {/* Tooltip arrow */}
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900 dark:border-t-gray-700"></div>
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>

      {/* Optional label below */}
      {showLabel && (
        <motion.div
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 1.2 }}
          className="text-center"
        >
          <div className="text-xs font-medium text-gray-700 dark:text-gray-300">{skillData.label}</div>
        </motion.div>
      )}
    </div>
  )
}
