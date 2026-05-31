"use client"

import { motion } from "framer-motion"
import { useState } from "react"

interface EnhancedSkillIndicatorProps {
  level: string
  size?: number
  showTooltip?: boolean
  showLabel?: boolean
}

export default function EnhancedSkillIndicator({
  level,
  size = 32,
  showTooltip = true,
  showLabel = false,
}: EnhancedSkillIndicatorProps) {
  const [showTooltipState, setShowTooltipState] = useState(false)

  const getSkillData = (skillLevel: string) => {
    switch (skillLevel) {
      case "Highly Skilled":
        return {
          percentage: 100,
          color: "#10b981", // Green
          bgColor: "#bbf7d0",
          label: "Highly Skilled",
          description: "Expert level proficiency",
          segments: 4,
        }
      case "Skilled":
        return {
          percentage: 75,
          color: "#3b82f6", // Blue
          bgColor: "#bfdbfe",
          label: "Skilled",
          description: "High level proficiency",
          segments: 3,
        }
      case "Semi Skilled":
        return {
          percentage: 50,
          color: "#f59e0b", // Amber
          bgColor: "#fed7aa",
          label: "Semi Skilled",
          description: "Moderate proficiency",
          segments: 2,
        }
      case "Low Skilled":
        return {
          percentage: 25,
          color: "#ef4444", // Red
          bgColor: "#fef3c7",
          label: "Low Skilled",
          description: "Basic proficiency",
          segments: 1,
        }
      case "None":
      default:
        return {
          percentage: 0,
          color: "#6b7280", // Gray
          bgColor: "#f3f4f6",
          label: "No Skill",
          description: "No experience",
          segments: 0,
        }
    }
  }

  const skillData = getSkillData(level)
  const radius = (size - 8) / 2
  const circumference = 2 * Math.PI * radius

  // Calculate segments for pie chart effect
  const segmentAngle = 90 // Each segment is 90 degrees
  const segments = []

  for (let i = 0; i < 4; i++) {
    const isFilled = i < skillData.segments
    const startAngle = i * segmentAngle - 90 // Start from top
    const endAngle = startAngle + segmentAngle

    // Convert to path coordinates
    const startX = size / 2 + radius * Math.cos((startAngle * Math.PI) / 180)
    const startY = size / 2 + radius * Math.sin((startAngle * Math.PI) / 180)
    const endX = size / 2 + radius * Math.cos((endAngle * Math.PI) / 180)
    const endY = size / 2 + radius * Math.sin((endAngle * Math.PI) / 180)

    const largeArcFlag = segmentAngle > 180 ? 1 : 0

    const pathData = [
      `M ${size / 2} ${size / 2}`,
      `L ${startX} ${startY}`,
      `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${endX} ${endY}`,
      "Z",
    ].join(" ")

    segments.push({
      path: pathData,
      filled: isFilled,
      color: isFilled ? skillData.color : "#e5e7eb",
    })
  }

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
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          tabIndex={0}
          role="button"
          aria-describedby={showTooltipState ? `tooltip-${level}-${size}` : undefined}
        >
          <svg width={size} height={size} className="relative z-10" viewBox={`0 0 ${size} ${size}`}>
            {/* Background circle */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke="#e5e7eb"
              strokeWidth="2"
              fill="white"
              className="dark:fill-gray-800 dark:stroke-gray-600"
            />

            {/* Pie segments */}
            {segments.map((segment, index) => (
              <motion.path
                key={index}
                d={segment.path}
                fill={segment.color}
                stroke="white"
                strokeWidth="1"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: index * 0.1, duration: 0.3 }}
              />
            ))}

            {/* Center circle */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius * 0.3}
              fill="white"
              stroke={skillData.color}
              strokeWidth="2"
              className="dark:fill-gray-800"
            />
          </svg>

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
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: skillData.color }} />
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
