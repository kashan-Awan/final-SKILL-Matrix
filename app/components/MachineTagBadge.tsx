"use client"

import { motion } from "framer-motion"
import { AlertTriangle } from "lucide-react"

interface MachineTagBadgeProps {
  isCritical?: boolean
  femaleEligible?: boolean
  size?: "sm" | "md" | "lg"
}

export default function MachineTagBadge({ isCritical, femaleEligible, size = "md" }: MachineTagBadgeProps) {
  const sizeClasses = {
    sm: "text-xs px-1.5 py-0.5 gap-1",
    md: "text-xs px-2 py-1 gap-1.5",
    lg: "text-sm px-2.5 py-1.5 gap-2",
  }

  const iconSizes = {
    sm: "h-2.5 w-2.5",
    md: "h-3 w-3",
    lg: "h-3.5 w-3.5",
  }

  if (!isCritical && !femaleEligible) return null

  return (
    <div className="flex gap-1 flex-wrap">
      {isCritical && (
        <motion.span
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 300 }}
          className={`inline-flex items-center rounded-full bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400 font-medium ${sizeClasses[size]}`}
        >
          <AlertTriangle className={iconSizes[size]} />
          Critical Station
        </motion.span>
      )}
      {femaleEligible && (
        <motion.span
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 300, delay: 0.1 }}
          className={`inline-flex items-center rounded-full bg-pink-100 text-pink-800 dark:bg-pink-900/20 dark:text-pink-400 font-medium ${sizeClasses[size]}`}
        >
          <span className="font-bold">♀</span>
          Female Eligible
        </motion.span>
      )}
    </div>
  )
}
