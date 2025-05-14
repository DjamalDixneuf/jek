"use client"

import { useState } from "react"
import Image from "next/image"

export default function Logo() {
  const [error, setError] = useState(false)

  if (error) {
    return <FallbackLogo />
  }

  return (
    <Image
      src="/logo.png"
      alt="Jekle Logo"
      width={30}
      height={30}
      className="icon-svg"
      onError={() => setError(true)}
      priority
    />
  )
}
