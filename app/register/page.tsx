"use client"
import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { User, Mail, Lock, Eye, EyeOff, Briefcase } from "lucide-react"

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
      setErrorMessage('Network error. Please make sure the backend server is running.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-lg dark:bg-gray-800 m-4">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Create an Account
          </h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Join Skills Matrix and start your journey.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {errorMessage && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative dark:bg-red-900/20 dark:border-red-500/50 dark:text-red-300" role="alert">
              <span className="block sm:inline">{errorMessage}</span>
            </div>
          )}
          {successMessage && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg relative dark:bg-green-900/20 dark:border-green-500/50 dark:text-green-300" role="alert">
              <span className="block sm:inline">{successMessage}</span>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Full Name
            </Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                className="pl-10 w-full h-12 rounded-lg border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Email
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="pl-10 w-full h-12 rounded-lg border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Password
            </Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="pl-10 pr-10 w-full h-12 rounded-lg border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="employeeId" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Employee ID <span className="text-gray-500">(Optional)</span>
            </Label>
            <div className="relative">
              <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                id="employeeId"
                type="text"
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value)}
                placeholder="Your employee ID"
                className="pl-10 w-full h-12 rounded-lg border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          
          <div className="space-y-3">
            <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Register as</Label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { value: 'employee', label: 'Employee' },
                { value: 'manager',  label: 'Manager' },
                { value: 'admin',    label: 'Admin' }
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
                  <div className={`py-2 px-3 rounded-lg border text-center transition-colors duration-200 text-sm ${
                    userRole === role.value
                      ? 'bg-blue-600 border-blue-600 text-white'
                      : 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600'
                  }`}>
                    {role.label}
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div>
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 h-12 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 dark:bg-blue-500 dark:hover:bg-blue-600 dark:focus:ring-blue-800 disabled:bg-gray-400 dark:disabled:bg-gray-600"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                "Register"
              )}
            </Button>
          </div>
        </form>

        <div className="text-center text-sm text-gray-600 dark:text-gray-400">
          <p>
            Already have an account?{' '}
            <Link href="/login" className="font-medium text-blue-600 hover:underline dark:text-blue-400">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
