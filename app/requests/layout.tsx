import type React from "react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Jekle - Movie Requests",
  description: "Request your favorite movies and series",
}

export default function RequestsLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return <>{children}</>
}
