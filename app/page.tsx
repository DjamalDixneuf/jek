"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import AuthForm from "@/components/auth-form"
import Image from "next/image"

export default function Home() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [isRedirecting, setIsRedirecting] = useState(false)

  useEffect(() => {
    if (status === "authenticated") {
      setIsRedirecting(true)
      if (session.user.role === "admin") {
        router.push("/admin")
      } else {
        router.push("/dashboard")
      }
    }
  }, [session, status, router])

  if (isRedirecting) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-gradient-to-br from-gray-900 to-gray-950">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white mx-auto"></div>
          <p className="mt-4 text-white">Redirecting...</p>
        </div>
      </main>
    )
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-gradient-to-br from-gray-900 to-gray-950">
      <div className="w-full max-w-md p-8 space-y-8 bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 shadow-xl">
        <div className="flex flex-col items-center space-y-2">
          <div className="relative w-16 h-16 bg-black rounded-full flex items-center justify-center overflow-hidden">
            <Image src="/logo.png" alt="Jekle Logo" width={60} height={50} className="object-contain" priority />
          </div>
          <h1 className="text-2xl font-bold text-white">Jekle</h1>
          <p className="text-gray-400 text-sm">Your favorite streaming platform</p>
        </div>

        <AuthForm />
      </div>
    </main>
  )
}
