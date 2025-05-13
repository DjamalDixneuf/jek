import type React from "react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Jekle - Dashboard",
  description: "Your favorite movies and series in one place",
}

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return <>{children}</>
}
