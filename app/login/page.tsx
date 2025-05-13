import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import AuthForm from "@/components/auth-form"
import Image from "next/image"

export const metadata: Metadata = {
  title: "Jekle - Sign In",
  description: "Sign in to your Jekle account to access your favorite movies and series",
}

export default async function LoginPage() {
  try {
    const session = await getServerSession(authOptions)

    if (session) {
      if (session.user.role === "admin") {
        redirect("/admin")
      } else {
        redirect("/dashboard")
      }
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
  } catch (error) {
    console.error("Error in login page:", error)

    // Return the form without checking session
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
}
