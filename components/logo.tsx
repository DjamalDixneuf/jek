import Image from "next/image"

interface LogoProps {
  className?: string
  width?: number
  height?: number
}

export default function Logo({ className = "icon-svg", width = 60, height = 50 }: LogoProps) {
  return <Image src="/logo-inter.png" alt="Jekle Logo" width={width} height={height} className={className} priority />
}
