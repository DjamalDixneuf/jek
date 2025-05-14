import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./styles/index.css"
import "./styles/stylesA.css"
import "./styles/admin-dashboard.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Jekle - Plateforme de Streaming",
  description:
    "Découvrez, regardez et demandez les films et séries que vous aimez, le tout en un clic, où que vous soyez !",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr">
      <body className={inter.className}>{children}</body>
    </html>
  )
}
