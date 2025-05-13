import "next-auth"
import type { DefaultSession } from "next-auth"

declare module "next-auth" {
  interface User {
    role: string
    token: string
    refreshToken: string
  }

  interface Session {
    user: {
      role: string
      token: string
      refreshToken: string
    } & DefaultSession["user"]
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role: string
    token: string
    refreshToken: string
  }
}
