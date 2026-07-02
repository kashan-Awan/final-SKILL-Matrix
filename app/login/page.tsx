"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Eye, EyeOff, Mail, Lock, UserPlus } from "lucide-react"

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [userRole, setUserRole] = useState("employee")
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setErrorMessage("")

    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, role: userRole })
      })

      const result = await response.json()

      if (!result.success) {
        setErrorMessage(result.message || 'Invalid email or password')
        return
      }
      
      const token = result.token || result.data?.token
      const user = result.user || result.data?.user || result.data

      if (result.success && user && typeof user === 'object') {
        const normalizedRole = (user.role || "").toLowerCase()

        const sessionData = {
          id: user.id || user._id,
          name: user.name || '',
          email: user.email || '',
          employeeId: user.employeeId || '',
          role: normalizedRole,
          department: user.department || '',
          loginTime: new Date().toISOString(),
          token: token
        }
        if (token) {
          localStorage.setItem('token', token)
          localStorage.setItem('adminToken', token)
          localStorage.setItem('adminUser', JSON.stringify({
            id: user.id,
            name: user.name,
            email: user.email,
            role: normalizedRole
          }))
        }

        localStorage.setItem('userSession', JSON.stringify(sessionData))
        window.dispatchEvent(new Event('session-update'))

        if (normalizedRole === 'admin') {
          router.push('/admin')
        } else if (normalizedRole === 'manager') {
          router.push('/landing')
        } else {
          router.push('/employee-dashboard')
        }

      } else {
        setErrorMessage(result.message || 'Login failed')
      }

    } catch (error) {
      console.error('Login error:', error)
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
            Sign In
          </h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Welcome back to Skills Matrix
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {errorMessage && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative dark:bg-red-900/20 dark:border-red-500/50 dark:text-red-300" role="alert">
              <span className="block sm:inline">{errorMessage}</span>
            </div>
          )}

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
          
          <div className="space-y-3">
            <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Login as</Label>
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

          <div className="flex items-center justify-end">
            <Link
              href="/forgot-password"
              className="text-sm text-blue-600 hover:underline dark:text-blue-400"
            >
              Forgot Password?
            </Link>
          </div>

          <div>
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 dark:bg-blue-500 dark:hover:bg-blue-600 dark:focus:ring-blue-800 disabled:bg-gray-400 dark:disabled:bg-gray-600"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                "Sign In"
              )}
            </Button>
          </div>
        </form>

        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="px-2 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">
              New to Skills Matrix?
            </span>
          </div>
        </div>

        <div>
          <Link href="/register">
            <Button
              variant="outline"
              className="w-full h-12 rounded-lg border-gray-300 bg-transparent text-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700"
            >
              <UserPlus className="w-4 h-4 mr-2" />
              Create New Account
            </Button>
          </Link>
        </div>
        
        <div className="mt-6 text-center text-xs text-gray-500 dark:text-gray-400 space-y-1">
            <p>Log in as <b>Admin</b> to access the Admin Dashboard.</p>
            <p>Log in as <b>Manager</b> to access the Manager Dashboard.</p>
            <p>Log in as <b>Employee</b> to access your personal dashboard.</p>
        </div>
      </div>
    </div>
  )
}
