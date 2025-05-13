import type React from "react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Jekle - Admin Dashboard",
  description: "Administration panel for Jekle streaming platform",
}

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return <>{children}</>
}
