"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Eye, EyeOff, CheckCircle, AlertTriangle, ArrowLeft } from "lucide-react"

function ResetPasswordForm() {
  const searchParams = useSearchParams()
  const token = searchParams.get("token") || ""
  const role = searchParams.get("role") || "user"

  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    if (!token) {
      setError("Invalid or missing reset link. Please request a new one.")
    }
  }, [token])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!token) {
      setError("Invalid or missing reset link. Please request a new one.")
      return
    }
    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters.")
      return
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.")
      return
    }

    setLoading(true)
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword, role }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.message || "Something went wrong. Please try again.")
      } else {
        setSuccess(true)
      }
    } catch {
      setError("Network error. Please check your connection and try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-lg dark:bg-gray-800 m-4">
        {success ? (
          <div className="text-center">
            <div className="flex justify-center">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6 dark:bg-green-900/50">
                    <CheckCircle className="w-10 h-10 text-green-600 dark:text-green-400" />
                </div>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Password Reset!</h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Your password has been successfully updated.
            </p>
            <Link href="/login" className="mt-6 block">
              <Button className="w-full h-12 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Return to Login
              </Button>
            </Link>
          </div>
        ) : (
          <>
            <div className="text-center">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Set New Password
              </h1>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                Choose a new password for your account.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg flex items-center gap-3 dark:bg-red-900/20 dark:border-red-500/50 dark:text-red-300" role="alert">
                    <AlertTriangle className="w-5 h-5"/>
                    <span>{error}</span>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="newPassword" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  New Password
                </Label>
                <div className="relative">
                  <Input
                    id="newPassword"
                    type={showPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter at least 6 characters"
                    className="w-full h-12 pr-10 rounded-lg border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
                    required
                    minLength={6}
                    disabled={!token || loading}
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
                <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Confirm New Password
                </Label>
                <Input
                  id="confirmPassword"
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat the password"
                  className="w-full h-12 rounded-lg border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
                  required
                  disabled={!token || loading}
                />
              </div>

              <div>
                <Button
                  type="submit"
                  disabled={loading || !token}
                  className="w-full mt-2 h-12 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 disabled:bg-gray-400"
                >
                  {loading ? 'Resetting Password...' : 'Reset Password'}
                </Button>
              </div>
            </form>
            <div className="text-center text-sm">
              <p className="text-gray-600 dark:text-gray-400">
                  Remember your password?{' '}
                  <Link href="/login" className="font-medium text-blue-600 hover:underline dark:text-blue-400">
                  Sign In
                  </Link>
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="text-gray-500 dark:text-gray-400">Loading...</div>
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  )
}
