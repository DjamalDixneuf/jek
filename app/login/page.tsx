"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Eye, EyeOff, Loader2 } from "lucide-react"
import Image from "next/image"

const API_URL = "https://jekle.netlify.app/.netlify/functions/api"

export default function LoginPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const [loginData, setLoginData] = useState({
    username: "",
    password: "",
  })

  const [registerData, setRegisterData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  })

  const handleLoginChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setLoginData((prev) => ({ ...prev, [name]: value }))
    if (error) setError("")
  }

  const handleRegisterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setRegisterData((prev) => ({ ...prev, [name]: value }))
    if (error) setError("")
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      console.log("Attempting login with:", { username: loginData.username })
      console.log("API URL:", `${API_URL}/login`)

      const response = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: loginData.username,
          password: loginData.password,
        }),
      })

      console.log("Response status:", response.status)

      const data = await response.json()
      console.log("Response data:", data)

      if (!response.ok) {
        throw new Error(data.message || "Erreur de connexion")
      }

      // Stocker les informations d'authentification
      localStorage.setItem("token", data.token)
      localStorage.setItem("refreshToken", data.refreshToken)
      localStorage.setItem("userRole", data.role)
      localStorage.setItem("username", data.username)

      // Rediriger selon le rôle
      if (data.role === "admin") {
        router.push("/admin-dashboard")
      } else {
        router.push("/dashboard")
      }
    } catch (error) {
      console.error("Login error:", error)
      setError(error instanceof Error ? error.message : "Erreur de connexion")
    } finally {
      setIsLoading(false)
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")
    setSuccess("")

    // Validation côté client
    if (registerData.password !== registerData.confirmPassword) {
      setError("Les mots de passe ne correspondent pas")
      setIsLoading(false)
      return
    }

    if (registerData.password.length < 6) {
      setError("Le mot de passe doit contenir au moins 6 caractères")
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch(`${API_URL}/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: registerData.username,
          email: registerData.email,
          password: registerData.password,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Erreur lors de l'inscription")
      }

      setSuccess("Compte créé avec succès ! Vous pouvez maintenant vous connecter.")
      setRegisterData({
        username: "",
        email: "",
        password: "",
        confirmPassword: "",
      })
    } catch (error) {
      console.error("Register error:", error)
      setError(error instanceof Error ? error.message : "Erreur lors de l'inscription")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-950 p-4">
      <Card className="w-full max-w-md bg-gray-800/50 backdrop-blur-sm border-gray-700">
        <Tabs defaultValue="login" className="w-full">
          <CardHeader className="space-y-1">
            <div className="flex justify-center mb-4">
              <div className="relative w-16 h-16 bg-black rounded-lg flex items-center justify-center overflow-hidden">
                <Image src="/logo inter.png" alt="Jekle Logo" width={64} height={64} className="object-contain" />
              </div>
            </div>
            <CardTitle className="text-2xl text-center text-white">Jekle</CardTitle>
            <CardDescription className="text-center text-gray-400">
              Votre plateforme de streaming préférée
            </CardDescription>
          </CardHeader>

          <CardContent>
            <TabsList className="grid w-full grid-cols-2 bg-gray-700/50">
              <TabsTrigger value="login" className="data-[state=active]:bg-red-600">
                Connexion
              </TabsTrigger>
              <TabsTrigger value="register" className="data-[state=active]:bg-red-600">
                Inscription
              </TabsTrigger>
            </TabsList>

            {error && (
              <Alert className="mt-4 border-red-500/50 bg-red-500/10">
                <AlertDescription className="text-red-400">{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert className="mt-4 border-green-500/50 bg-green-500/10">
                <AlertDescription className="text-green-400">{success}</AlertDescription>
              </Alert>
            )}

            <TabsContent value="login" className="space-y-4 mt-4">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username" className="text-gray-300">
                    Nom d'utilisateur
                  </Label>
                  <Input
                    id="username"
                    name="username"
                    type="text"
                    placeholder="votre_nom"
                    value={loginData.username}
                    onChange={handleLoginChange}
                    required
                    disabled={isLoading}
                    className="bg-gray-700/50 border-gray-600 text-white placeholder-gray-400"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-gray-300">
                    Mot de passe
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={loginData.password}
                      onChange={handleLoginChange}
                      required
                      disabled={isLoading}
                      className="bg-gray-700/50 border-gray-600 text-white placeholder-gray-400 pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={isLoading}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-gray-400" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-400" />
                      )}
                    </Button>
                  </div>
                </div>
                <Button type="submit" className="w-full bg-red-600 hover:bg-red-700" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Connexion...
                    </>
                  ) : (
                    "Se connecter"
                  )}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="register" className="space-y-4 mt-4">
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="register-username" className="text-gray-300">
                    Nom d'utilisateur
                  </Label>
                  <Input
                    id="register-username"
                    name="username"
                    type="text"
                    placeholder="votre_nom"
                    value={registerData.username}
                    onChange={handleRegisterChange}
                    required
                    disabled={isLoading}
                    className="bg-gray-700/50 border-gray-600 text-white placeholder-gray-400"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="register-email" className="text-gray-300">
                    Email
                  </Label>
                  <Input
                    id="register-email"
                    name="email"
                    type="email"
                    placeholder="votre@email.com"
                    value={registerData.email}
                    onChange={handleRegisterChange}
                    required
                    disabled={isLoading}
                    className="bg-gray-700/50 border-gray-600 text-white placeholder-gray-400"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="register-password" className="text-gray-300">
                    Mot de passe
                  </Label>
                  <div className="relative">
                    <Input
                      id="register-password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={registerData.password}
                      onChange={handleRegisterChange}
                      required
                      disabled={isLoading}
                      className="bg-gray-700/50 border-gray-600 text-white placeholder-gray-400 pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={isLoading}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-gray-400" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-400" />
                      )}
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password" className="text-gray-300">
                    Confirmer le mot de passe
                  </Label>
                  <Input
                    id="confirm-password"
                    name="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    value={registerData.confirmPassword}
                    onChange={handleRegisterChange}
                    required
                    disabled={isLoading}
                    className="bg-gray-700/50 border-gray-600 text-white placeholder-gray-400"
                  />
                </div>
                <Button type="submit" className="w-full bg-red-600 hover:bg-red-700" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Inscription...
                    </>
                  ) : (
                    "S'inscrire"
                  )}
                </Button>
              </form>
            </TabsContent>
          </CardContent>
        </Tabs>

        <div className="p-6 pt-0">
          <div className="text-center">
            <Button variant="link" className="text-gray-400 hover:text-white" onClick={() => router.push("/")}>
              Retour à l'accueil
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}
