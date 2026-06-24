"use client"

import type React from "react"
import { useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Menu, X, LogOut, Users, Map, BarChart3 } from "lucide-react"

import { useTheme } from "./ThemeProvider"
import { getRoleColor } from "../utils/roleColor"
import Button from "./Button"
import useUserPermissions from "../../hooks/useUserPermissions"

interface LayoutProps {
  children: React.ReactNode
}

export default function Layout({ children }: LayoutProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  const { isDark } = useTheme()
  const { userSession, logout } = useUserPermissions()

  const navigation = [
    { name: "Employees", href: "/employees", icon: Users },
    { name: "Skills Mapping", href: "/skills-mapping", icon: Map },
     { name: "Skill Matrix", href: "/skills_matrix_maker", icon: BarChart3 },
  ]

  const handleLogout = () => {
    logout()
  }

  const hideNavbar = pathname === "/login"

  // If it's the login page, return children without any wrapper
  if (pathname === "/login") {
    return <>{children}</>
  }

  return (
    <div
      className="min-h-screen bg-white"
    >
      {!hideNavbar && (
        <nav className="bg-white border-b sticky top-0 z-40">
          <div className="w-full px-4 sm:px-6 lg:px-8">
            <div className="relative grid grid-cols-[auto_1fr_auto] items-center gap-4 h-20">
              {/* Left: Logo and Title */}
              <Link href="/landing" className="flex items-center cursor-pointer">
                <div className="flex items-center hover:scale-105 transition-transform">
                  <div className="w-8 h-8 rounded-lg mr-3 flex items-center justify-center overflow-hidden border-2 border-[#1d7fd7]">
                    <Image src="/dawlance-d.svg" alt="D" width={20} height={20} className="object-contain" />
                  </div>
                  <h1 className="text-2xl font-bold text-gray-900">Skills Portal</h1>
                </div>
              </Link>

              {/* Center: Navigation */}
              <div className="hidden sm:flex items-center justify-center gap-6 px-4 min-w-0">
                {navigation.map((item) => {
                  const Icon = item.icon
                  const isActive = pathname === item.href
                  return (
                    <Link key={item.name} href={item.href} prefetch={true} className="inline-block">
                      <div
                        className={`inline-flex items-center px-4 py-2 rounded-xl text-lg font-semibold transition-all duration-200 hover:scale-105 hover:-translate-y-0.5 ${
                          isActive
                            ? "bg-[#1d7fd7] text-white"
                            : "text-gray-700 hover:text-gray-900 hover:bg-gray-100"
                        }`}
                      >
                        <Icon className="h-5 w-5 mr-2" />
                        {item.name}
                      </div>
                    </Link>
                  )
                })}
              </div>

              {/* Right: User Info + Logout */}
              <div className="hidden sm:flex items-center space-x-4 ml-4">
                {userSession && (
                  <div className="flex items-center space-x-2 mr-2 px-4 py-2 rounded-xl transition-all duration-300 hover:shadow-lg bg-blue-50/80 border border-blue-200/50">
                    <div className={`flex items-center space-x-2 px-3 py-1 rounded-full border text-xs font-medium ${getRoleColor(userSession.role, false)}`}>
                      <span className="capitalize">{userSession.role}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium leading-5 transition-colors duration-300 cursor-default text-gray-700 hover:text-gray-900">
                        {userSession.name || userSession.email || "Unknown User"}
                      </span>
                      {userSession.department && (
                        <>
                          <span className="text-gray-400">|</span>
                          <span className="text-xs transition-colors duration-300 text-gray-500 hover:text-gray-600">
                            {userSession.department}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                )}

                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLogout}
                  className="flex items-center bg-transparent"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </div>

              {/* Mobile: Menu toggle */}
              <div className="sm:hidden flex items-center">
                <button
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="p-2 rounded-xl transition-all hover:scale-110 text-gray-700 hover:bg-gray-100"
                >
                  {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                </button>
              </div>
            </div>

            {/* Mobile Menu */}
            {isMobileMenuOpen && (
              <div className="sm:hidden pt-2 pb-3 space-y-1 bg-white">
                {navigation.map((item) => {
                  const Icon = item.icon
                  const isActive = pathname === item.href
                  return (
                    <Link key={item.name} href={item.href} prefetch={true} className="block">
                      <div
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={`w-full text-left flex items-center px-3 py-3 mx-2 rounded-xl text-lg font-medium transition-all duration-200 ${
                          isActive
                            ? "bg-[#1d7fd7] text-white"
                            : "text-gray-700 hover:text-gray-900 hover:bg-gray-100"
                        }`}
                      >
                        <Icon className="h-5 w-5 mr-3" />
                        {item.name}
                      </div>
                    </Link>
                  )
                })}

                <div className="border-t border-gray-200 pt-4 pb-3 mx-2">
                  {userSession && (
                    <div className="flex items-center px-3 mb-3 py-2 rounded-xl transition-all duration-300 bg-blue-50/80 hover:bg-blue-100/80 border border-blue-200/50">
                      <div
                        className={`flex items-center space-x-2 px-3 py-1 rounded-full border text-xs font-medium ${
                          userSession.role === "admin"
                            ? "bg-red-100 text-red-800 border-red-200"
                            : userSession.role === "manager"
                            ? "bg-[#1d7fd7]/10 text-[#1d7fd7] border-[#1d7fd7]/20"
                            : "bg-green-100 text-green-800 border-green-200"
                        }`}
                      >
                        <span className="capitalize">{userSession.role}</span>
                      </div>
                      <div className="ml-3">
                        <span className="text-sm font-medium leading-5 cursor-default block text-gray-700 hover:text-gray-900">
                          {userSession.name || userSession.email}
                        </span>
                        {userSession.department && (
                          <div className="mt-0.5 text-xs text-gray-500">
                            {userSession.department}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="flex items-center px-3 space-x-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleLogout}
                      className="flex items-center bg-transparent"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Logout
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </nav>
      )}


      {/* Main Content */}
      <main className="w-full px-4 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {children}
        </div>
      </main>
    </div>
  )
}
