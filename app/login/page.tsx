"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [activeTab, setActiveTab] = useState("login")
  const [isLoading, setIsLoading] = useState(false)

  // Login form state
  const [loginData, setLoginData] = useState({
    username: "",
    password: "",
  })

  // Signup form state
  const [signupData, setSignupData] = useState({
    username: "",
    email: "",
    password: "",
  })

  useEffect(() => {
    const tab = searchParams?.get("tab")
    if (tab === "signup") {
      setActiveTab("signup")
    }
  }, [searchParams])

  const handleLoginChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setLoginData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSignupChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setSignupData((prev) => ({ ...prev, [name]: value }))
  }

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Simulate login
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Redirect based on username
      if (loginData.username === "djamalax19") {
        router.push("/admin")
      } else {
        router.push("/dashboard")
      }
    } catch (error) {
      console.error("Login failed:", error)
      alert("Login failed. Please check your credentials.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Simulate signup
      await new Promise((resolve) => setTimeout(resolve, 1000))
      alert("Account created successfully! You can now log in.")
      setActiveTab("login")
    } catch (error) {
      console.error("Signup failed:", error)
      alert("Signup failed. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-background-light p-4">
      <div className="w-full max-w-md">
        <div className="bg-background-card rounded-2xl shadow-xl overflow-hidden border border-white/10">
          <div className="p-8">
            <div className="flex flex-col items-center mb-8">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-xl">J</span>
                </div>
              </div>
              <h1 className="text-2xl font-bold text-white">Jekle Entertainment</h1>
              <p className="text-text-secondary mt-1">Votre plateforme de streaming préférée</p>
            </div>

            <div className="flex border-b border-white/10 mb-6">
              <button
                className={`flex-1 py-3 font-medium text-sm transition-colors ${
                  activeTab === "login"
                    ? "text-primary border-b-2 border-primary"
                    : "text-text-secondary hover:text-white"
                }`}
                onClick={() => setActiveTab("login")}
              >
                Se connecter
              </button>
              <button
                className={`flex-1 py-3 font-medium text-sm transition-colors ${
                  activeTab === "signup"
                    ? "text-primary border-b-2 border-primary"
                    : "text-text-secondary hover:text-white"
                }`}
                onClick={() => setActiveTab("signup")}
              >
                Créer un compte
              </button>
            </div>

            {activeTab === "login" && (
              <form onSubmit={handleLoginSubmit} className="space-y-5">
                <div>
                  <label htmlFor="username" className="block text-sm font-medium text-text-secondary mb-1">
                    Nom d'utilisateur
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg
                        className="h-5 w-5 text-text-muted"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <input
                      id="username"
                      name="username"
                      type="text"
                      required
                      className="block w-full pl-10 pr-3 py-2.5 bg-background border border-white/10 rounded-lg text-white focus:ring-2 focus:ring-primary/50 focus:border-primary/50"
                      value={loginData.username}
                      onChange={handleLoginChange}
                      disabled={isLoading}
                      placeholder="Entrez votre nom d'utilisateur"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-text-secondary mb-1">
                    Mot de passe
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg
                        className="h-5 w-5 text-text-muted"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <input
                      id="password"
                      name="password"
                      type="password"
                      required
                      className="block w-full pl-10 pr-3 py-2.5 bg-background border border-white/10 rounded-lg text-white focus:ring-2 focus:ring-primary/50 focus:border-primary/50"
                      value={loginData.password}
                      onChange={handleLoginChange}
                      disabled={isLoading}
                      placeholder="Entrez votre mot de passe"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 px-4 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center">
                      <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Connexion en cours...
                    </span>
                  ) : (
                    "Se connecter"
                  )}
                </button>
              </form>
            )}

            {activeTab === "signup" && (
              <form onSubmit={handleSignupSubmit} className="space-y-5">
                <div>
                  <label htmlFor="signup-username" className="block text-sm font-medium text-text-secondary mb-1">
                    Nom d'utilisateur
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg
                        className="h-5 w-5 text-text-muted"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <input
                      id="signup-username"
                      name="username"
                      type="text"
                      required
                      className="block w-full pl-10 pr-3 py-2.5 bg-background border border-white/10 rounded-lg text-white focus:ring-2 focus:ring-primary/50 focus:border-primary/50"
                      value={signupData.username}
                      onChange={handleSignupChange}
                      disabled={isLoading}
                      placeholder="Choisissez un nom d'utilisateur"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-text-secondary mb-1">
                    Email
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg
                        className="h-5 w-5 text-text-muted"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                        <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                      </svg>
                    </div>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      required
                      className="block w-full pl-10 pr-3 py-2.5 bg-background border border-white/10 rounded-lg text-white focus:ring-2 focus:ring-primary/50 focus:border-primary/50"
                      value={signupData.email}
                      onChange={handleSignupChange}
                      disabled={isLoading}
                      placeholder="Entrez votre adresse email"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="signup-password" className="block text-sm font-medium text-text-secondary mb-1">
                    Mot de passe
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg
                        className="h-5 w-5 text-text-muted"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <input
                      id="signup-password"
                      name="password"
                      type="password"
                      required
                      className="block w-full pl-10 pr-3 py-2.5 bg-background border border-white/10 rounded-lg text-white focus:ring-2 focus:ring-primary/50 focus:border-primary/50"
                      value={signupData.password}
                      onChange={handleSignupChange}
                      disabled={isLoading}
                      placeholder="Choisissez un mot de passe"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 px-4 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center">
                      <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Création en cours...
                    </span>
                  ) : (
                    "Créer un compte"
                  )}
                </button>
              </form>
            )}
          </div>
        </div>

        <div className="mt-6 text-center">
          <Link href="/" className="text-text-secondary hover:text-white transition-colors text-sm">
            Retour à l'accueil
          </Link>
        </div>
      </div>
    </div>
  )
}
