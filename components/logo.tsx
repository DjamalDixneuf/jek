"use client"

import Image from "next/image"
import { useState } from "react"

interface LogoProps {
  className?: string
  width?: number
  height?: number
  page?: "login" | "user"
}

export default function Logo({ className = "", width = 60, height = 60, page = "login" }: LogoProps) {
  const [error, setError] = useState(false)
  const [loading, setLoading] = useState(true)

  // Si une erreur s'est produite, afficher le logo de secours
  if (error) {
    return <FallbackLogo className={className} />
  }

  // Ajuster la taille en fonction de la page
  const adjustedWidth = page === "login" ? 90 : width
  const adjustedHeight = page === "login" ? 90 : height

  return (
    <>
      {loading && (
        <div
          className="animate-pulse bg-gray-300 rounded-full"
          style={{ width: adjustedWidth, height: adjustedHeight }}
        />
      )}
      <Image
        src="/logo-inter.png"
        alt="Logo"
        width={adjustedWidth}
        height={adjustedHeight}
        className={`${className} ${loading ? "hidden" : ""}`}
        style={{ maxWidth: "100%", height: "auto" }}
        onLoad={() => setLoading(false)}
        onError={() => {
          setLoading(false)
          setError(true)
        }}
      />
    </>
  )
}
