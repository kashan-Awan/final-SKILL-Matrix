"use client"
import type React from "react"
import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { User, Mail, Lock, Rocket, Star, Cloud, Sparkles, UserPlus, Briefcase, Eye, EyeOff } from "lucide-react"

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [userRole, setUserRole] = useState("employee")
  const [employeeId, setEmployeeId] = useState("") // Optional employee ID
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")
  const [successMessage, setSuccessMessage] = useState("")
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setErrorMessage("")
    setSuccessMessage("")

    try {
      const response = await fetch('http://localhost:5001/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          password,
          role: userRole.toUpperCase(),
          employeeId: employeeId?.trim() ? employeeId : null,
        }),
      })

      const result = await response.json()

      if (response.status === 201 && result.success) {
        setSuccessMessage(result.message || 'Registration request submitted successfully! Please wait for admin approval.')
        // Optionally redirect to login after a delay
        setTimeout(() => {
          router.push("/login")
        }, 3000)
      } else {
        setErrorMessage(result.message || 'Registration failed. Please try again.')
      }
    } catch (error) {
      console.error("Registration error:", error)
      setErrorMessage('Network error. Please make sure the backend server is running on port 5000.')
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
      {floatingShapes.map((shape) => (
        <motion.div
          key={shape.id}
          className={`absolute ${shape.size} ${shape.position} rounded-3xl bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm pointer-events-none`}
          animate={{ y: [0, -20, 0], rotate: [0, 180, 360], scale: [1, 1.1, 1] }}
          transition={{ duration: 6, delay: shape.delay, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
        />
      ))}

      <div className="flex items-center justify-center w-full h-full p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-4xl bg-white/10 backdrop-blur-md rounded-3xl shadow-2xl overflow-hidden border border-white/20"
        >
          <div className="grid md:grid-cols-2 gap-0">

            {/* Left Side - Hero Section */}
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
                Join Skills Matrix
              </motion.h2>
              <motion.p
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.8 }}
                className="text-white/80 text-lg"
              >
                Create your account and start tracking your skills today!
              </motion.p>
            </motion.div>

            {/* Right Side - Registration Form */}
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
                  Register
                </motion.h1>

                <form onSubmit={handleSubmit} className="space-y-6">

                  {errorMessage && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-red-500/20 border border-red-500/50 rounded-lg p-3 text-center"
                    >
                      <p className="text-red-200 text-sm">{errorMessage}</p>
                    </motion.div>
                  )}

                  {successMessage && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-green-500/20 border border-green-500/50 rounded-lg p-3 text-center"
                    >
                      <p className="text-green-200 text-sm">{successMessage}</p>
                    </motion.div>
                  )}

                  <motion.div className="space-y-2">
                    <Label htmlFor="name" className="text-white/90 text-sm font-medium">
                      Full Name
                    </Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60 w-5 h-5" />
                      <Input
                        id="name"
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Enter your full name"
                        className="pl-12 bg-white/10 border border-white/30 text-white placeholder:text-white/60 focus:border-white/50 focus:ring-white/20 h-12 rounded-xl"
                        required
                      />
                    </div>
                  </motion.div>

                  <motion.div className="space-y-2">
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

                  <motion.div className="space-y-2">
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
                        placeholder="Create a password"
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

                  <motion.div className="space-y-2">
                    <Label htmlFor="employeeId" className="text-white/90 text-sm font-medium">
                      Employee ID (Optional)
                    </Label>
                    <div className="relative">
                      <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60 w-5 h-5" />
                      <Input
                        id="employeeId"
                        type="text"
                        value={employeeId}
                        onChange={(e) => setEmployeeId(e.target.value)}
                        placeholder="Enter your employee ID (if applicable)"
                        className="pl-12 bg-white/10 border border-white/30 text-white placeholder:text-white/60 focus:border-white/50 focus:ring-white/20 h-12 rounded-xl"
                      />
                    </div>
                  </motion.div>

                  <motion.div className="space-y-3">
                    <Label className="text-white/90 text-sm font-medium">
                      Register as
                    </Label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { value: 'employee', label: 'Employee', icon: '👤' },
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

                  <motion.div>
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
                        "Register Account →"
                      )}
                    </Button>
                  </motion.div>

                </form>

                <motion.div
                  className="mt-6 text-center text-xs text-white/40 space-y-1"
                >
                  <p>Already have an account?</p>
                  <Link href="/login" className="text-white/70 hover:text-white transition-colors hover:underline">
                    Sign In here
                  </Link>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}