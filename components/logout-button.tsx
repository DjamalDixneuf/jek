"use client"

import { signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { LogOut } from "lucide-react"

interface LogoutButtonProps {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
  size?: "default" | "sm" | "lg" | "icon"
  showIcon?: boolean
  showText?: boolean
  className?: string
}

export default function LogoutButton({
  variant = "ghost",
  size = "icon",
  showIcon = true,
  showText = false,
  className,
}: LogoutButtonProps) {
  const handleLogout = () => {
    signOut({ callbackUrl: "/" })
  }

  return (
    <Button variant={variant} size={size} onClick={handleLogout} className={className}>
      {showIcon && <LogOut className={showText ? "mr-2 h-4 w-4" : "h-5 w-5"} />}
      {showText && "Logout"}
    </Button>
  )
}
