"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"

export default function Component() {
  const [isLoading, setIsLoading] = useState(true)
  const [progress, setProgress] = useState(0)
  
useEffect(() => {
  const timer = setInterval(() => {
    setProgress((prev) => {
      if (prev >= 100) {
        clearInterval(timer)
        setTimeout(() => setIsLoading(false), 1000) // ~10s after reaching 100%
        return 100
      }
      return prev + 4 // 100 / 4 = 25 steps
    })
  }, 120) // 25 steps * 120ms = 3000ms

  return () => clearInterval(timer)
}, [])


  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-blue-500 via-blue-600 to-blue-800"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.7 }}
        >
          {/* Background animated particles */}
          <div className="absolute inset-0 overflow-hidden">
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 bg-orange-400 rounded-full opacity-30"
                initial={{
                  x: typeof window !== 'undefined' ? Math.random() * window.innerWidth : Math.random() * 1000,
                  y: typeof window !== 'undefined' ? Math.random() * window.innerHeight : Math.random() * 1000,
                }}
                animate={{
                  x: typeof window !== 'undefined' ? Math.random() * window.innerWidth : Math.random() * 1000,
                  y: typeof window !== 'undefined' ? Math.random() * window.innerHeight : Math.random() * 1000,
                }}
                transition={{
                  duration: Math.random() * 4 + 2,
                  repeat: Number.POSITIVE_INFINITY,
                  repeatType: "reverse",
                }}
              />
            ))}
          </div>

          <div className="relative flex flex-col items-center space-y-8">
            {/* Main Skills Matrix Sphere */}
            <motion.div
              className="relative"
              initial={{ scale: 0, rotate: 0 }}
              animate={{ scale: 1, rotate: 360 }}
              transition={{ duration: 1.5, ease: "easeOut" }}
            >
              {/* Outer ring */}
              <motion.div
                className="w-48 h-48 rounded-full border-2 border-orange-400 border-dashed"
                animate={{ rotate: 360 }}
                transition={{ duration: 4, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
              />

              {/* Inner sphere */}
              <motion.div
                className="absolute inset-4 rounded-full bg-gradient-to-br from-blue-500 via-blue-600 to-blue-800 shadow-2xl flex items-center justify-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.7 }}
              >
                <Image src="/images/dawlance-logo.png" alt="Skills Matrix" width={100} height={100} />
              </motion.div>
            </motion.div>

            {/* Progress bar */}
            <div className="w-64 h-3 bg-white/20 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-orange-400"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>

            {/* Progress percentage */}
            <motion.div
              className="text-white text-sm font-medium"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 2.2, duration: 0.4 }}
            >
              {progress}%
            </motion.div>

            {/* Loading dots */}
            <motion.div
              className="flex space-x-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 2.4, duration: 0.4 }}
            >
              {[...Array(3)].map((_, i) => (
                <motion.div
                  key={i}
                  className="w-2 h-2 bg-orange-400 rounded-full"
                  animate={{ scale: [1, 1.5, 1] }}
                  transition={{
                    duration: 0.8,
                    repeat: Number.POSITIVE_INFINITY,
                    delay: i * 0.15,
                  }}
                />
              ))}
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}