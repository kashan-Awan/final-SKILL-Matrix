"use client"

import type React from "react"
import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Eye, EyeOff, Mail, Lock, Rocket, Star, Cloud, Sparkles } from "lucide-react"

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [userRole, setUserRole] = useState("user")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, role: userRole })
      })

      const data = await response.json()

      if (data.success) {
  const user = data.data.user  // ✅ add .data here
  const sessionData = {
    id: user.id,
    name: user.name,
    email: user.email,
    employeeId: user.employeeId,
    role: user.role,
    department: user.department,
    loginTime: user.loginTime
  }
  localStorage.setItem('userSession', JSON.stringify(sessionData))
  router.push("/landing")
} else {
        alert(data.message || 'Login failed')
      }
    } catch (error) {
      console.error("Login error:", error)
      alert('An error occurred during login. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const floatingShapes = [
    { id: 1, size: "w-20 h-20", position: "top-20 left-20", delay: 0 },
    { id: 2, size: "w-16 h-16", position: "top-40 right-32", delay: 0.5 },
    { id: 3, size: "w-24 h-24", position: "bottom-32 left-16", delay: 1 },
    { id: 4, size: "w-12 h-12", position: "bottom-20 right-20", delay: 1.5 },
    { id: 5, size: "w-8 h-8", position: "top-60 left-1/3", delay: 2 },
  ]

  return (
    <div className="h-screen w-screen fixed top-0 left-0 m-0 p-0 overflow-hidden bg-gradient-to-br from-[#3B82F6] via-[#8B5CF6] to-[#1E40AF]">
      {/* Animated Background Shapes */}
      {floatingShapes.map((shape) => (
        <motion.div
          key={shape.id}
          className={`absolute ${shape.size} ${shape.position} rounded-3xl bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm`}
          animate={{ y: [0, -20, 0], rotate: [0, 180, 360], scale: [1, 1.1, 1] }}
          transition={{ duration: 6, delay: shape.delay, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
        />
      ))}

      {/* Main Container */}
      <div className="flex items-center justify-center w-full h-full p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-4xl bg-white/10 backdrop-blur-md rounded-3xl shadow-2xl overflow-hidden border border-white/20"
        >
          <div className="grid md:grid-cols-2 gap-0">

            {/* Left Side - Illustration */}
            <motion.div
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="p-12 flex flex-col items-center justify-center text-center text-white relative"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                className="absolute top-8 left-8"
              >
                <Star className="w-6 h-6 text-yellow-300" />
              </motion.div>

              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY }}
                className="absolute top-12 right-12"
              >
                <Cloud className="w-8 h-8 text-white/60" />
              </motion.div>

              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
                className="absolute bottom-16 left-16"
              >
                <Sparkles className="w-5 h-5 text-purple-300" />
              </motion.div>

              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="relative mb-8"
              >
                <div className="w-32 h-32 bg-gradient-to-br from-[#3B82F6] to-[#8B5CF6] rounded-2xl flex items-center justify-center shadow-2xl">
                  <motion.div
                    animate={{ y: [0, -5, 0] }}
                    transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
                  >
                    <Rocket className="w-16 h-16 text-white" />
                  </motion.div>
                </div>
                <motion.div
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 15, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                  className="absolute -top-4 -right-4 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center"
                >
                  <div className="w-2 h-2 bg-white rounded-full" />
                </motion.div>
              </motion.div>

              <motion.h2
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.6 }}
                className="text-2xl font-bold mb-4"
              >
                You Are Few Minutes Away To Boost
              </motion.h2>
              <motion.p
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.8 }}
                className="text-white/80 text-lg"
              >
                Your Skills With Our Platform
              </motion.p>
            </motion.div>

            {/* Right Side - Login Form */}
            <motion.div
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="p-12 bg-white/5 backdrop-blur-sm"
            >
              <div className="max-w-sm mx-auto">
                <motion.h1
                  initial={{ y: -20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.6, delay: 0.6 }}
                  className="text-3xl font-bold text-white mb-8 text-center"
                >
                  Sign In
                </motion.h1>

                <form onSubmit={handleSubmit} className="space-y-6">

                  {/* Email */}
                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.6, delay: 0.8 }}
                    className="space-y-2"
                  >
                    <Label htmlFor="email" className="text-white/90 text-sm font-medium">
                      Email
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60 w-5 h-5" />
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter your email"
                        className="pl-12 bg-white/10 border border-white/30 text-white placeholder:text-white/60 focus:border-white/50 focus:ring-white/20 h-12 rounded-xl"
                        required
                      />
                    </div>
                  </motion.div>

                  {/* Password */}
                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.6, delay: 1 }}
                    className="space-y-2"
                  >
                    <Label htmlFor="password" className="text-white/90 text-sm font-medium">
                      Password
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60 w-5 h-5" />
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter your password"
                        className="pl-12 pr-12 bg-white/10 border border-white/30 text-white placeholder:text-white/60 focus:border-white/50 focus:ring-white/20 h-12 rounded-xl"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/60 hover:text-white transition-colors"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </motion.div>



                  {/* Role Selector */}
                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.6, delay: 1.2 }}
                    className="space-y-3"
                  >
                    <Label className="text-white/90 text-sm font-medium">
                      Login as
                    </Label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { value: 'user', label: 'User', icon: '👤' },
                        { value: 'manager', label: 'Manager', icon: '👔' },
                        { value: 'admin', label: 'Admin', icon: '⚡' }
                      ].map((role) => (
                        <label key={role.value} className="cursor-pointer">
                          <input
                            type="radio"
                            name="userRole"
                            value={role.value}
                            checked={userRole === role.value}
                            onChange={(e) => setUserRole(e.target.value)}
                            className="sr-only"
                          />
                          <div className={`p-3 rounded-lg border text-center transition-all duration-200 ${
                            userRole === role.value
                              ? 'bg-white/20 border-white/50 text-white'
                              : 'bg-white/5 border-white/20 text-white/70 hover:bg-white/10'
                          }`}>
                            <div className="text-lg mb-1">{role.icon}</div>
                            <div className="text-xs font-medium">{role.label}</div>
                          </div>
                        </label>
                      ))}
                    </div>
                  </motion.div>
                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.6, delay: 1.3 }}
                    className="flex justify-end items-center"
                  >
                    <Link
                      href="/forgot-password"
                      className="text-white/70 hover:text-white text-sm transition-colors hover:underline"
                    >
                      Forgot Password?
                    </Link>
                  </motion.div>

                  {/* Submit Button */}
                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.6, delay: 1.4 }}
                  >
                    <Button
                      type="submit"
                      disabled={isLoading}
                      className="w-full bg-gradient-to-r from-[#3B82F6] to-[#8B5CF6] hover:from-[#1D4ED8] hover:to-[#7C3AED] text-white font-semibold h-12 rounded-xl transition-all duration-300 transform hover:scale-105 disabled:scale-100"
                    >
                      {isLoading ? (
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                          className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                        />
                      ) : (
                        "Sign In →"
                      )}
                    </Button>
                  </motion.div>

                </form>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>

    </div>
  )
}