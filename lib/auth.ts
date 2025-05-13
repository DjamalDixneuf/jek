import type { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { API_URL } from "@/lib/constants"

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          return null
        }

        try {
          // Appel à l'API Netlify pour l'authentification
          const response = await fetch(`${API_URL}`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "x-endpoint": "login", // Utiliser un header personnalisé pour indiquer l'endpoint
            },
            body: JSON.stringify({
              username: credentials.username,
              password: credentials.password,
            }),
          })

          if (!response.ok) {
            console.error("Auth API error:", await response.text())
            return null
          }

          const data = await response.json()

          return {
            id: credentials.username,
            name: credentials.username,
            email: `${credentials.username}@example.com`,
            role: data.role || "user",
            token: data.token,
            refreshToken: data.refreshToken,
          }
        } catch (error) {
          console.error("Auth error:", error)
          return null
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role
        token.token = user.token
        token.refreshToken = user.refreshToken
      }
      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.role = token.role as string
        session.user.token = token.token as string
        session.user.refreshToken = token.refreshToken as string
      }
      return session
    },
  },
  pages: {
    signIn: "/",
    error: "/",
  },
  session: {
    strategy: "jwt",
    maxAge: 60 * 60, // 1 heure
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development",
}
