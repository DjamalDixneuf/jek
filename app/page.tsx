"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import "./styles/index.css"
import Logo from "../components/logo"

export default function Home() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("login")
  const [loginData, setLoginData] = useState({
    username: "",
    password: "",
  })
  const [signupData, setSignupData] = useState({
    username: "",
    email: "",
    password: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const particlesRef = useRef<HTMLDivElement>(null)

  // Créer des particules flottantes
  useEffect(() => {
    if (!particlesRef.current) return

    const particlesContainer = particlesRef.current
    const particleCount = 20

    // Supprimer les particules existantes
    while (particlesContainer.firstChild) {
      particlesContainer.removeChild(particlesContainer.firstChild)
    }

    // Créer de nouvelles particules
    for (let i = 0; i < particleCount; i++) {
      const particle = document.createElement("div")
      particle.classList.add("particle")

      // Position aléatoire
      particle.style.left = `${Math.random() * 100}%`
      particle.style.top = `${Math.random() * 100}%`

      // Taille aléatoire
      const size = Math.random() * 5 + 2
      particle.style.width = `${size}px`
      particle.style.height = `${size}px`

      // Opacité aléatoire
      particle.style.opacity = `${Math.random() * 0.5 + 0.1}`

      // Animation aléatoire
      const duration = Math.random() * 20 + 10
      const delay = Math.random() * 5

      particle.style.animation = `float ${duration}s ease-in-out ${delay}s infinite`
      particle.style.animationDirection = Math.random() > 0.5 ? "alternate" : "alternate-reverse"

      particlesContainer.appendChild(particle)
    }

    // Ajouter une animation CSS pour les particules
    const style = document.createElement("style")
    style.textContent = `
      @keyframes float {
        0% {
          transform: translateY(0) translateX(0);
        }
        50% {
          transform: translateY(-${Math.random() * 100 + 50}px) translateX(${Math.random() * 50 - 25}px);
        }
        100% {
          transform: translateY(0) translateX(0);
        }
      }
    `
    document.head.appendChild(style)

    return () => {
      document.head.removeChild(style)
    }
  }, [])

  const showTab = (tabId: string) => {
    setActiveTab(tabId)
    setError("")
  }

  const handleLoginChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target
    setLoginData({
      ...loginData,
      [id.replace("username-login", "username").replace("password-login", "password")]: value,
    })
  }

  const handleSignupChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target
    setSignupData({
      ...signupData,
      [id
        .replace("username-signup", "username")
        .replace("password-signup", "password")
        .replace("email-signup", "email")]: value,
    })
  }

  // Modifier la fonction handleSignupSubmit pour ne plus stocker le nom d'utilisateur dans localStorage
  // et s'assurer que la validation d'unicité est effectuée côté serveur

  // Remplacer la fonction handleSignupSubmit par celle-ci:
  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      // Validation
      if (signupData.password.length < 6) {
        throw new Error("Le mot de passe doit contenir au moins 6 caractères")
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "/.netlify/functions/api"}/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(signupData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Erreur d'inscription")
      }

      // Compte créé avec succès, connecter automatiquement l'utilisateur
      const loginResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "/.netlify/functions/api"}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: signupData.username,
          password: signupData.password,
        }),
      })

      if (!loginResponse.ok) {
        // Si la connexion échoue, rediriger vers la page de connexion
        alert("Compte créé avec succès! Veuillez vous connecter.")
        showTab("login")
        return
      }

      const loginData = await loginResponse.json()

      // Stocker uniquement le token et le rôle dans localStorage
      localStorage.setItem("token", loginData.token)
      localStorage.setItem("refreshToken", loginData.refreshToken)
      localStorage.setItem("role", loginData.role)

      // Rediriger vers la page utilisateur
      router.push("/user-page")
    } catch (error: any) {
      setError(error.message || "Erreur d'inscription. Veuillez réessayer.")
    } finally {
      setIsLoading(false)
    }
  }

  // Modifier la fonction handleLoginSubmit pour ne plus stocker le nom d'utilisateur dans localStorage
  // Remplacer la fonction handleLoginSubmit par celle-ci:
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "/.netlify/functions/api"}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(loginData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Erreur de connexion")
      }

      const data = await response.json()

      // Stocker uniquement le token et le rôle
      localStorage.setItem("token", data.token)
      localStorage.setItem("refreshToken", data.refreshToken)
      localStorage.setItem("role", data.role)

      // Rediriger en fonction du rôle
      if (data.role === "admin") {
        router.push("/admin-dashboard")
      } else {
        router.push("/user-page")
      }
    } catch (error: any) {
      setError(error.message || "Erreur de connexion. Veuillez réessayer.")
    } finally {
      setIsLoading(false)
    }
  }

  // Vérifier si l'utilisateur est déjà connecté
  useEffect(() => {
    const token = localStorage.getItem("token")
    const role = localStorage.getItem("role")

    if (token) {
      if (role === "admin") {
        router.push("/admin-dashboard")
      } else {
        router.push("/user-page")
      }
    }
  }, [router])

  return (
    <div className="container">
      <div className="particles" ref={particlesRef}></div>
      <div className="card">
        <div className="card-header">
          <div className="icon-container">
            <Logo />
          </div>
          <h2 className="title">Jekle</h2>
          <p className="description">Votre plateforme de streaming préférée</p>
        </div>

        <div className="tabs">
          <button className={`tab-button ${activeTab === "login" ? "active" : ""}`} onClick={() => showTab("login")}>
            Se connecter
          </button>
          <button className={`tab-button ${activeTab === "signup" ? "active" : ""}`} onClick={() => showTab("signup")}>
            Créer un compte
          </button>
        </div>

        {error && <div className="error-message">{error}</div>}

        <div id="login" className={`tab-content ${activeTab === "login" ? "active" : ""}`}>
          <form className="form" id="login-form" onSubmit={handleLoginSubmit}>
            <label htmlFor="username-login">Nom d'utilisateur</label>
            <div className="input-group">
              <span className="icon">&#128100;</span>
              <input
                type="text"
                id="username-login"
                placeholder="Entrez votre nom d'utilisateur"
                required
                value={loginData.username}
                onChange={handleLoginChange}
                disabled={isLoading}
              />
            </div>

            <label htmlFor="password-login">Mot de passe</label>
            <div className="input-group">
              <span className="icon">&#128274;</span>
              <input
                type="password"
                id="password-login"
                placeholder="Entrez votre mot de passe"
                required
                value={loginData.password}
                onChange={handleLoginChange}
                disabled={isLoading}
              />
            </div>

            <button type="submit" className="button" disabled={isLoading}>
              {isLoading ? "Connexion en cours..." : "Se connecter"}
            </button>
          </form>
        </div>

        <div id="signup" className={`tab-content ${activeTab === "signup" ? "active" : ""}`}>
          <form className="form" id="signup-form" onSubmit={handleSignupSubmit}>
            <label htmlFor="username-signup">Nom d'utilisateur</label>
            <div className="input-group">
              <span className="icon">&#128100;</span>
              <input
                type="text"
                id="username-signup"
                placeholder="Choisissez un nom d'utilisateur"
                required
                value={signupData.username}
                onChange={handleSignupChange}
                disabled={isLoading}
              />
            </div>

            <label htmlFor="email-signup">Email</label>
            <div className="input-group">
              <span className="icon">&#9993;</span>
              <input
                type="email"
                id="email-signup"
                placeholder="Entrez votre adresse email"
                required
                value={signupData.email}
                onChange={handleSignupChange}
                disabled={isLoading}
              />
            </div>

            <label htmlFor="password-signup">Mot de passe</label>
            <div className="input-group">
              <span className="icon">&#128274;</span>
              <input
                type="password"
                id="password-signup"
                placeholder="Choisissez un mot de passe"
                required
                value={signupData.password}
                onChange={handleSignupChange}
                disabled={isLoading}
              />
            </div>

            <button type="submit" className="button" disabled={isLoading}>
              {isLoading ? "Création en cours..." : "Créer un compte"}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
