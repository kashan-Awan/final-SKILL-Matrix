"use client"

import type React from "react"
import { useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Menu, X, LogOut, Users, Map, BarChart3, Settings } from "lucide-react"

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

  const isEmployee = userSession?.role === 'employee' || userSession?.role === 'user';
  const isAdmin = userSession?.role === 'admin';
  const visibleNavigation = userSession
    ? [
        ...navigation.filter(item => !isEmployee || item.name === 'Employees'),
        ...(isAdmin ? [{ name: "Settings", href: "/settings", icon: Settings }] : [])
      ]
    : [];

  const handleLogout = () => {
    logout()
  }

  const publicPages = ['/login', '/forgot-password'];
  const hideNavbar = publicPages.includes(pathname);

  // Public auth pages — render without any navbar, but still keep common styling and footer
  if (hideNavbar) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900 transition-colors duration-250">
        <main className="flex-grow flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
          {children}
        </main>
        <footer className="bg-white dark:bg-gray-950 border-t border-slate-200 dark:border-slate-800 transition-colors duration-250 py-8 w-full mt-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 border-b border-slate-100 dark:border-slate-800 pb-6 mb-6">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center overflow-hidden border border-blue-500/20 bg-blue-50/50 dark:bg-blue-950/30">
                  <Image src="/dawlance-d.svg" alt="D" width={18} height={18} className="object-contain" />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-extrabold text-gray-950 dark:text-white tracking-tight leading-none">
                    Dawlance
                  </span>
                  <span className="text-[10px] text-blue-600 dark:text-blue-400 font-bold uppercase tracking-wider mt-0.5">
                    Skills Portal
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-6 text-sm font-medium text-gray-500 dark:text-gray-400">
                <Link href="#" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Privacy Policy</Link>
                <Link href="#" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Terms of Service</Link>
                <Link href="#" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Support Helpline</Link>
              </div>
            </div>

            <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-gray-400 dark:text-gray-500">
              <p>© {new Date().getFullYear()} Dawlance. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900 transition-colors duration-250">
      {!hideNavbar && (
        <nav className="bg-white/85 dark:bg-gray-900/85 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80 sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              
              {/* Left: Brand logo */}
              <Link href="/landing" className="flex items-center cursor-pointer group flex-shrink-0">
                <div className="flex items-center gap-2.5 transition-transform duration-200 group-hover:scale-[1.02]">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center overflow-hidden border border-blue-500/20 bg-blue-50/50 dark:bg-blue-950/30">
                    <Image src="/dawlance-d.svg" alt="D" width={22} height={22} className="object-contain" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-extrabold text-gray-950 dark:text-white tracking-tight leading-none">
                      Dawlance
                    </span>
                    <span className="text-[10px] text-blue-600 dark:text-blue-400 font-bold uppercase tracking-wider mt-0.5">
                      Skills Portal
                    </span>
                  </div>
                </div>
              </Link>
              
              {/* Center: Navigation Links */}
              <div className="hidden md:flex items-center gap-1">
                {visibleNavigation.map((item) => {
                  const Icon = item.icon
                  const isActive = pathname === item.href
                  return (
                    <Link key={item.name} href={item.href} prefetch={true}>
                      <div
                        className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-semibold tracking-wide transition-all duration-200 cursor-pointer ${
                          isActive
                            ? "bg-blue-50 text-blue-600 border border-blue-100 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-900/30"
                            : "text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 hover:bg-blue-50/30 dark:hover:bg-blue-950/10 border border-transparent"
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                        {item.name}
                      </div>
                    </Link>
                  )
                })}
              </div>

              {/* Right: User Section */}
              <div className="hidden md:flex items-center gap-4">
                {userSession && (
                  <div className="flex items-center gap-3 pl-3 border-l border-slate-200 dark:border-slate-800">
                    <div className="flex flex-col text-right">
                      <span className="text-sm font-semibold text-gray-800 dark:text-gray-250 leading-tight">
                        {userSession.name || "Unknown Operator"}
                      </span>
                      <span className="text-xs text-gray-450 font-medium capitalize">
                        {userSession.role}{userSession.department ? ` • ${userSession.department}` : ""}
                      </span>
                    </div>
                  </div>
                )}

                <button
                  onClick={handleLogout}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-250 hover:border-red-200 hover:bg-red-50 text-slate-650 hover:text-red-600 dark:border-slate-800 dark:hover:border-red-950 dark:hover:bg-red-950/20 dark:text-slate-400 dark:hover:text-red-400 text-xs font-bold uppercase tracking-wider transition-colors"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  Logout
                </button>
              </div>

              {/* Mobile Trigger */}
              <div className="md:hidden flex items-center">
                <button
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="p-2 rounded-xl transition-all text-gray-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                </button>
              </div>
            </div>
          </div>

          {/* Mobile Navigation Panel */}
          {isMobileMenuOpen && (
            <div className="md:hidden border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-gray-900 p-4 space-y-3">
               {visibleNavigation.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href
                return (
                  <Link key={item.name} href={item.href} prefetch={true} className="block">
                    <div
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold uppercase tracking-wider transition-all ${
                        isActive
                          ? "bg-blue-600 text-white"
                          : "text-gray-655 hover:bg-slate-50 dark:text-gray-300 dark:hover:bg-slate-800/40"
                      }`}
                    >
                      <Icon className="h-4.5 w-4.5" />
                      {item.name}
                    </div>
                  </Link>
                )
              })}

              <div className="border-t border-slate-100 dark:border-slate-800 pt-4 mt-2">
                {userSession && (
                  <div className="p-3 bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 rounded-xl mb-4">
                    <div>
                      <span className="text-sm font-bold text-gray-900 dark:text-white block">
                        {userSession.name || userSession.email}
                      </span>
                      <span className="text-xs text-gray-400 font-semibold block capitalize">
                        {userSession.role} • {userSession.department || "No Department"}
                      </span>
                    </div>
                  </div>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLogout}
                  className="w-full h-10 border border-slate-200 dark:border-slate-800 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 bg-transparent"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </Button>
              </div>
            </div>
          )}
        </nav>
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-grow w-full">
        {children}
      </main>

      {/* Common Footer */}
      <footer className="bg-white dark:bg-gray-950 border-t border-slate-200 dark:border-slate-800 transition-colors duration-250 py-8 w-full mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 border-b border-slate-100 dark:border-slate-800 pb-6 mb-6">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center overflow-hidden border border-blue-500/20 bg-blue-50/50 dark:bg-blue-950/30">
                <Image src="/dawlance-d.svg" alt="D" width={18} height={18} className="object-contain" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-extrabold text-gray-950 dark:text-white tracking-tight leading-none">
                  Dawlance
                </span>
                <span className="text-[10px] text-blue-600 dark:text-blue-400 font-bold uppercase tracking-wider mt-0.5">
                  Skills Portal
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-6 text-sm font-medium text-gray-500 dark:text-gray-400">
              <Link href="#" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Privacy Policy</Link>
              <Link href="#" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Terms of Service</Link>
              <Link href="#" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Support Helpline</Link>
              <Link href="#" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Documentation</Link>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-gray-400 dark:text-gray-500">
            <p>© {new Date().getFullYear()} Dawlance. All rights reserved.</p>
            <p className="flex items-center gap-1">
              Empowering workforce capability and line compliance.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
