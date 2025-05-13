"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import AuthForm from "../components/auth-form"

export default function Home() {
  const router = useRouter()
  const [isRedirecting, setIsRedirecting] = useState(false)

  // Simulate session check
  useEffect(() => {
    const token = localStorage.getItem("token")
    if (token) {
      setIsRedirecting(true)
      const role = localStorage.getItem("role")
      if (role === "admin") {
        router.push("/admin")
      } else {
        router.push("/dashboard")
      }
    }
  }, [router])

  if (isRedirecting) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white mx-auto"></div>
          <p className="mt-4 text-white">Redirecting...</p>
        </div>
      </main>
    )
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-gray-900">
      <div className="w-full max-w-md p-8 space-y-8 bg-gray-800 rounded-xl border border-gray-700 shadow-xl">
        <div className="flex flex-col items-center space-y-2">
          <div className="relative w-16 h-16 bg-black rounded-full flex items-center justify-center overflow-hidden">
            {/* Placeholder for logo */}
            <div className="w-10 h-10 bg-blue-500 rounded-full"></div>
          </div>
          <h1 className="text-2xl font-bold text-white">Jekle</h1>
          <p className="text-gray-400 text-sm">Your favorite streaming platform</p>
        </div>

        <AuthForm />
      </div>
    </main>
  )
}
