import type React from "react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Jekle - Login",
  description: "Login to your Jekle account",
}

export default function LoginLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return <>{children}</>
}
