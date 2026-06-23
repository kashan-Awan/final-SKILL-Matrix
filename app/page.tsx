"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Component from "./components/Pre_loader"

console.log("=== NEXT.JS ENV DEBUG ===");
console.log("DB_HOST:", process.env.DB_HOST);
console.log("DB_PORT:", process.env.DB_PORT);
console.log("DB_INSTANCE:", process.env.DB_INSTANCE);
console.log("=========================");


export default function Home() {
  const [showSplash, setShowSplash] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false)
      setTimeout(() => {
        router.push("/login")
      }, 500)
    }, 4000) // Show splash for 4s

    return () => clearTimeout(timer)
  }, [router])

  return showSplash ? <div className="min-h-screen bg-blue-50"><Component /></div> : null
}
