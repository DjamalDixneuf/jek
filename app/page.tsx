"use client"

import type React from "react"

import { useState, useEffect } from "react"
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
  const [verificationData, setVerificationData] = useState({
    code: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

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

  const handleVerificationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setVerificationData({
      ...verificationData,
      [e.target.id.replace("verification-", "")]: e.target.value,
    })
  }

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      // Simuler une connexion
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Redirection basée sur le nom d'utilisateur
      if (loginData.username === "djamalax19" && loginData.password === "Tiger19667") {
        localStorage.setItem("token", "admin-token")
        localStorage.setItem("role", "admin")
        router.push("/admin-dashboard")
      } else if (loginData.username && loginData.password) {
        localStorage.setItem("token", "user-token")
        localStorage.setItem("role", "user")
        router.push("/user-page")
      } else {
        setError("Nom d'utilisateur ou mot de passe incorrect")
      }
    } catch (error) {
      setError("Erreur de connexion. Veuillez réessayer.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      // Validation
      if (signupData.password.length < 6) {
        throw new Error("Le mot de passe doit contenir au moins 6 caractères")
      }

      // Simuler l'envoi d'un code de vérification
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Stocker temporairement les données d'inscription
      localStorage.setItem("verificationUsername", signupData.username)

      // Passer à l'onglet de vérification
      showTab("verification")
    } catch (error: any) {
      setError(error.message || "Erreur d'inscription. Veuillez réessayer.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleVerificationSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      // Simuler la vérification du code
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Vérifier le code (pour la démo, n'importe quel code fonctionne)
      if (verificationData.code) {
        // Compte créé avec succès
        localStorage.removeItem("verificationUsername")
        showTab("login")
        // Afficher un message de succès
        alert("Compte créé avec succès ! Vous pouvez maintenant vous connecter.")
      } else {
        throw new Error("Veuillez entrer le code de vérification")
      }
    } catch (error: any) {
      setError(error.message || "Erreur de vérification. Veuillez réessayer.")
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

        <div id="verification" className={`tab-content ${activeTab === "verification" ? "active" : ""}`}>
          <form className="form" id="verification-form" onSubmit={handleVerificationSubmit}>
            <p>Un code de vérification a été envoyé à votre adresse email. Veuillez l'entrer ci-dessous.</p>
            <label htmlFor="verification-code">Code de vérification</label>
            <div className="input-group">
              <span className="icon">&#128273;</span>
              <input
                type="text"
                id="verification-code"
                placeholder="Entrez le code de vérification"
                required
                value={verificationData.code}
                onChange={handleVerificationChange}
                disabled={isLoading}
              />
            </div>

            <button type="submit" className="button" disabled={isLoading}>
              {isLoading ? "Vérification en cours..." : "Vérifier"}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
