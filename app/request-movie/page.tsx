"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Logo from "@/components/logo" // Correction de l'importation
import "../styles/stylesA.css"
import "../styles/mobile-nav.css"

export default function RequestMoviePage() {
  const router = useRouter()
  const [requests, setRequests] = useState<any[]>([])
  const [availableMovies, setAvailableMovies] = useState<any[]>([])
  const [formData, setFormData] = useState({
    title: "",
    imdbLink: "",
    comment: "",
  })
  const [isLoading, setIsLoading] = useState({
    requests: true,
    movies: true,
    submit: false,
  })
  const [menuOpen, setMenuOpen] = useState(false)
  const [profileModalOpen, setProfileModalOpen] = useState(false)
  const [searchActive, setSearchActive] = useState(false)
  const [userName, setUserName] = useState("Utilisateur")
  const [scrolled, setScrolled] = useState(false)

  // Vérifier l'authentification et gérer le défilement
  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) {
      router.push("/")
      return
    }

    // Récupérer les informations utilisateur
    const fetchUserInfo = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "/.netlify/functions/api"}/check-auth`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (!response.ok) {
          throw new Error(`Error: ${response.status}`)
        }

        const userData = await response.json()

        if (userData.username) {
          setUserName(userData.username)
        }
      } catch (error) {
        console.error("Erreur lors du chargement des informations utilisateur:", error)
      }
    }

    fetchUserInfo()

    // Gérer le défilement pour l'en-tête
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setScrolled(true)
      } else {
        setScrolled(false)
      }
    }

    window.addEventListener("scroll", handleScroll)

    // Charger les données
    loadRequests()
    loadAvailableMovies()

    return () => {
      window.removeEventListener("scroll", handleScroll)
    }
  }, [router])

  const loadRequests = async () => {
    setIsLoading((prev) => ({ ...prev, requests: true }))
    try {
      const token = localStorage.getItem("token")
      if (!token) throw new Error("No authentication token")

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "/.netlify/functions/api"}/movie-requests`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`)
      }

      const data = await response.json()
      setRequests(data)
    } catch (error) {
      console.error("Erreur lors du chargement des demandes:", error)
    } finally {
      setIsLoading((prev) => ({ ...prev, requests: false }))
    }
  }

  const loadAvailableMovies = async () => {
    setIsLoading((prev) => ({ ...prev, movies: true }))
    try {
      const token = localStorage.getItem("token")
      if (!token) throw new Error("No authentication token")

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "/.netlify/functions/api"}/movies`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`)
      }

      const data = await response.json()
      setAvailableMovies(data.movies || [])
    } catch (error) {
      console.error("Erreur lors du chargement des films disponibles:", error)
    } finally {
      setIsLoading((prev) => ({ ...prev, movies: false }))
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading((prev) => ({ ...prev, submit: true }))

    try {
      // Validation
      if (!formData.title || !formData.imdbLink) {
        throw new Error("Le titre et le lien IMDB sont requis")
      }

      if (!formData.imdbLink.includes("imdb.com")) {
        throw new Error("Veuillez fournir un lien IMDB valide")
      }

      const token = localStorage.getItem("token")
      if (!token) throw new Error("No authentication token")

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "/.netlify/functions/api"}/movie-requests`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Erreur lors de l'enregistrement de la demande")
      }

      // Réinitialiser le formulaire
      setFormData({
        title: "",
        imdbLink: "",
        comment: "",
      })

      // Recharger les demandes pour afficher la nouvelle
      loadRequests()

      alert("Votre demande a été enregistrée avec succès!")
    } catch (error: any) {
      alert(error.message || "Erreur lors de l'enregistrement de la demande. Veuillez réessayer.")
    } finally {
      setIsLoading((prev) => ({ ...prev, submit: false }))
    }
  }

  const toggleMenu = () => {
    setMenuOpen(!menuOpen)
  }

  const toggleProfileModal = () => {
    setProfileModalOpen(!profileModalOpen)
    setMenuOpen(false)
  }

  const toggleSearch = () => {
    setSearchActive(!searchActive)
  }

  const handleLogout = () => {
    localStorage.removeItem("token")
    router.push("/")
  }

  const handleProfileSave = (e: React.FormEvent) => {
    e.preventDefault()
    localStorage.setItem("userName", userName)
    setProfileModalOpen(false)
  }

  return (
    <div className="netflix-container">
      {/* En-tête Netflix */}
      <header className={`netflix-header ${scrolled ? "scrolled" : ""}`}>
        <div className="netflix-header-left">
          <div className="netflix-logo">
            <Logo page="user" />
          </div>
          <nav className="netflix-nav">
            <ul>
              <li className="active" onClick={() => router.push("/user-page")}>
                Accueil
              </li>
              <li>Séries</li>
              <li>Films</li>
              <li>Nouveautés</li>
              <li>Ma liste</li>
            </ul>
          </nav>
        </div>

        <div className="netflix-header-right">
          <div className={`netflix-search ${searchActive ? "active" : ""}`}>
            <button className="netflix-search-toggle" onClick={toggleSearch} aria-label="Rechercher">
              <i className="fas fa-search">🔍</i>
            </button>
            {searchActive && <input type="text" placeholder="Titres, personnes, genres..." />}
          </div>

          <button className="netflix-menu-toggle" onClick={toggleMenu} aria-label="Menu">
            <div className={`hamburger-icon ${menuOpen ? "open" : ""}`}>
              <span></span>
              <span></span>
              <span></span>
            </div>
          </button>

          <div className={`netflix-dropdown-menu ${menuOpen ? "open" : ""}`}>
            <div className="netflix-profile-menu-item" onClick={toggleProfileModal}>
              <div className="netflix-avatar">{userName.charAt(0).toUpperCase()}</div>
              <span>Profil</span>
            </div>
            <div className="netflix-menu-item" onClick={() => router.push("/request-movie")}>
              <span>Demandes</span>
            </div>
            <div className="netflix-menu-item" onClick={handleLogout}>
              <span>Déconnexion</span>
            </div>
          </div>
        </div>
      </header>

      {/* Modal de profil */}
      {profileModalOpen && (
        <div className="netflix-profile-modal">
          <div className="netflix-profile-modal-content">
            <div className="netflix-modal-close" onClick={toggleProfileModal}>
              &times;
            </div>
            <div className="netflix-profile-avatar-large">{userName.charAt(0).toUpperCase()}</div>
            <h2 style={{ textAlign: "center", marginBottom: "20px" }}>Modifier votre profil</h2>
            <form onSubmit={handleProfileSave}>
              <div className="netflix-form-group">
                <label htmlFor="userName">Nom d'utilisateur</label>
                <input
                  type="text"
                  id="userName"
                  className="netflix-input"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                />
              </div>
              <button type="submit" className="netflix-button">
                Enregistrer
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Contenu principal */}
      <main className="netflix-main" style={{ paddingTop: "120px" }}>
        <div
          className="netflix-card"
          style={{ backgroundColor: "#181818", padding: "30px", borderRadius: "8px", marginBottom: "30px" }}
        >
          <div style={{ width: "100%" }}>
            <h1 style={{ fontSize: "24px", fontWeight: "bold", marginBottom: "20px", color: "#1a73e8" }}>
              Demander un film ou une série
            </h1>

            <div
              className="alert"
              style={{
                backgroundColor: "#1a73e8",
                color: "white",
                padding: "10px",
                textAlign: "center",
                fontWeight: "bold",
                marginBottom: "20px",
                borderRadius: "5px",
              }}
            >
              NB: Il faut un lien qui vient de{" "}
              <a
                href="https://www.imdb.com/"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: "white", textDecoration: "underline" }}
              >
                IMDb
              </a>
            </div>

            <form id="requestForm" onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column" }}>
              <div style={{ marginBottom: "20px" }}>
                <label htmlFor="title" style={{ marginBottom: "5px", color: "#1a73e8", display: "block" }}>
                  Titre du film/série
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                  style={{
                    padding: "15px",
                    border: "none",
                    borderRadius: "5px",
                    backgroundColor: "#1a1d28",
                    color: "white",
                    width: "100%",
                  }}
                  disabled={isLoading.submit}
                />
              </div>

              <div style={{ marginBottom: "20px" }}>
                <label htmlFor="imdbLink" style={{ marginBottom: "5px", color: "#1a73e8", display: "block" }}>
                  Lien IMDB
                </label>
                <input
                  type="url"
                  id="imdbLink"
                  name="imdbLink"
                  value={formData.imdbLink}
                  onChange={handleInputChange}
                  required
                  style={{
                    padding: "15px",
                    border: "none",
                    borderRadius: "5px",
                    backgroundColor: "#1a1d28",
                    color: "white",
                    width: "100%",
                  }}
                  disabled={isLoading.submit}
                />
              </div>

              <div style={{ marginBottom: "20px" }}>
                <label htmlFor="comment" style={{ marginBottom: "5px", color: "#1a73e8", display: "block" }}>
                  Commentaire (optionnel)
                </label>
                <textarea
                  id="comment"
                  name="comment"
                  rows={4}
                  value={formData.comment}
                  onChange={handleInputChange}
                  style={{
                    padding: "15px",
                    border: "none",
                    borderRadius: "5px",
                    backgroundColor: "#1a1d28",
                    color: "white",
                    width: "100%",
                    resize: "vertical",
                  }}
                  disabled={isLoading.submit}
                ></textarea>
              </div>

              <button
                type="submit"
                className="netflix-play-button"
                style={{ width: "100%", justifyContent: "center" }}
                disabled={isLoading.submit}
              >
                {isLoading.submit ? "Envoi en cours..." : "Envoyer la demande"}
              </button>
            </form>
          </div>
        </div>

        {/* Demandes en cours */}
        <div className="netflix-row">
          <h2 className="netflix-row-title">Vos demandes en cours</h2>

          {isLoading.requests ? (
            <div className="netflix-loading">
              <div className="netflix-spinner"></div>
            </div>
          ) : requests.length === 0 ? (
            <p style={{ textAlign: "center", color: "#aaa", padding: "20px" }}>Aucune demande en cours.</p>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "20px" }}>
              {requests.map((request) => (
                <div
                  key={request.id}
                  style={{
                    backgroundColor: "#181818",
                    borderRadius: "8px",
                    padding: "20px",
                    transition: "transform 0.3s ease, box-shadow 0.3s ease",
                    cursor: "pointer",
                  }}
                  className="request-card"
                >
                  <h3 style={{ fontWeight: "bold", marginBottom: "10px", fontSize: "18px" }}>{request.title}</h3>
                  <p style={{ marginBottom: "10px", fontSize: "14px" }}>
                    <span style={{ color: "#aaa" }}>IMDB: </span>
                    <a href={request.imdbLink} target="_blank" rel="noopener noreferrer" style={{ color: "#1a73e8" }}>
                      {request.imdbLink.substring(0, 30)}...
                    </a>
                  </p>
                  {request.comment && (
                    <p style={{ marginBottom: "10px", fontSize: "14px" }}>
                      <span style={{ color: "#aaa" }}>Commentaire: </span>
                      {request.comment}
                    </p>
                  )}
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginTop: "15px",
                    }}
                  >
                    <span style={{ fontSize: "12px", color: "#aaa" }}>Demandé le: {request.createdAt}</span>
                    <span
                      style={{
                        padding: "5px 10px",
                        borderRadius: "20px",
                        fontSize: "12px",
                        backgroundColor: request.status === "approved" ? "#4ecca3" : "#1a73e8",
                        color: "white",
                      }}
                    >
                      {request.status === "approved" ? "Approuvé" : "En attente"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Films disponibles */}
        <div className="netflix-row">
          <h2 className="netflix-row-title">Films disponibles</h2>

          {isLoading.movies ? (
            <div className="netflix-loading">
              <div className="netflix-spinner"></div>
            </div>
          ) : (
            <div className="netflix-row-content">
              {availableMovies.map((movie) => (
                <div key={movie.id} className="netflix-item">
                  <Image
                    src={movie.thumbnailUrl || "/placeholder.svg"}
                    alt={movie.title}
                    width={200}
                    height={300}
                    className="netflix-item-img"
                  />
                  <div className="netflix-item-info">
                    <h3>{movie.title}</h3>
                    <div className="netflix-item-meta">
                      <span className="netflix-item-year">{movie.releaseYear}</span>
                      <span className="netflix-item-rating">{movie.duration}</span>
                    </div>
                    <p>{movie.genre}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
