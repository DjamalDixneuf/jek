"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import "../styles/stylesA.css"
import Logo from "../../components/logo"

export default function UserPage() {
  const router = useRouter()
  const [movies, setMovies] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedMovie, setSelectedMovie] = useState<any | null>(null)
  const [selectedEpisode, setSelectedEpisode] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState("all")
  const [isHeaderScrolled, setIsHeaderScrolled] = useState(false)
  const [isSearchActive, setIsSearchActive] = useState(false)
  const [featuredMovie, setFeaturedMovie] = useState<any | null>(null)
  const headerRef = useRef<HTMLElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)

  // États pour le menu et le profil
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false)
  const [userName, setUserName] = useState("John Doe")
  const [userAvatar, setUserAvatar] = useState("J")

  // Modifier la fonction pour récupérer les informations utilisateur depuis l'API plutôt que localStorage

  // Ajouter une fonction pour charger les informations utilisateur
  const loadUserInfo = async () => {
    try {
      const token = localStorage.getItem("token")
      if (!token) throw new Error("No authentication token")

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "/.netlify/functions/api"}/check-auth`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`)
      }

      const userData = await response.json()

      // Mettre à jour les informations utilisateur
      if (userData.username) {
        setUserName(userData.username)
        setUserAvatar(userData.username.charAt(0))
      }
    } catch (error) {
      console.error("Erreur lors du chargement des informations utilisateur:", error)
    }
  }

  // Modifier le useEffect pour appeler loadUserInfo
  // Remplacer le useEffect existant par celui-ci:
  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) {
      router.push("/")
      return
    }

    // Charger les informations utilisateur depuis l'API
    loadUserInfo()

    // Charger les films depuis l'API
    loadMovies()

    // Ajouter l'écouteur de défilement
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [router])

  const handleScroll = () => {
    if (headerRef.current) {
      if (window.scrollY > 50) {
        setIsHeaderScrolled(true)
      } else {
        setIsHeaderScrolled(false)
      }
    }
  }

  const loadMovies = async () => {
    setIsLoading(true)
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

      if (data.movies && data.movies.length > 0) {
        setMovies(data.movies)

        // Sélectionner un film aléatoire pour la mise en avant
        const randomIndex = Math.floor(Math.random() * data.movies.length)
        setFeaturedMovie(data.movies[randomIndex])
      } else {
        // Aucun film disponible
        setMovies([])
        setFeaturedMovie(null)
      }
    } catch (error) {
      console.error("Erreur lors du chargement des films:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
  }

  const toggleSearch = () => {
    setIsSearchActive(!isSearchActive)
    if (!isSearchActive && searchInputRef.current) {
      setTimeout(() => {
        searchInputRef.current?.focus()
      }, 100)
    }
  }

  const handleCategoryChange = (category: string) => {
    setActiveCategory(category)
  }

  const filteredMovies = movies.filter((movie) => {
    const matchesSearch =
      movie.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (movie.genre &&
        typeof movie.genre === "string" &&
        movie.genre.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (movie.genre &&
        Array.isArray(movie.genre) &&
        movie.genre.some((g: string) => g.toLowerCase().includes(searchTerm.toLowerCase())))

    const matchesCategory = activeCategory === "all" || (movie.categories && movie.categories.includes(activeCategory))

    return matchesSearch && matchesCategory
  })

  // Filtrer les films par catégorie
  const getMoviesByCategory = (category: string) => {
    return movies.filter((movie) => movie.categories && movie.categories.includes(category))
  }

  const popularMovies = getMoviesByCategory("populaire")
  const actionMovies = getMoviesByCategory("action")
  const dramaMovies = getMoviesByCategory("drame")
  const scifiMovies = getMoviesByCategory("sci-fi")

  const handleLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("role")
    localStorage.removeItem("userName")
    router.push("/")
  }

  const handleUserButton = () => {
    router.push("/request-movie")
  }

  const openMovieModal = (movie: any) => {
    setSelectedMovie(movie)
    setSelectedEpisode(0)
    const modal = document.getElementById("videoModal")
    if (modal) {
      modal.style.display = "block"
      document.body.style.overflow = "hidden" // Empêcher le défilement
    }
  }

  const closeMovieModal = () => {
    const modal = document.getElementById("videoModal")
    if (modal) {
      modal.style.display = "none"
      document.body.style.overflow = "" // Réactiver le défilement
    }
    const videoPlayer = document.getElementById("videoPlayer") as HTMLIFrameElement
    if (videoPlayer) {
      videoPlayer.src = ""
    }
  }

  const handleEpisodeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedEpisode(Number(e.target.value))
    updateVideoPlayer(selectedMovie, Number(e.target.value))
  }

  const updateVideoPlayer = (movie: any, episodeIndex = 0) => {
    const videoPlayer = document.getElementById("videoPlayer") as HTMLIFrameElement
    const movieDetails = document.getElementById("movieDetails")

    if (!videoPlayer || !movieDetails || !movie) return

    if (movie.type === "série" && movie.episodes && movie.episodes.length > 0) {
      const episode = movie.episodes[episodeIndex]
      videoPlayer.src = episode.url || ""
      movieDetails.innerHTML = `
        <div class="movie-details-grid">
          <div class="movie-detail-item">
            <div class="movie-detail-label">Titre:</div>
            <div class="movie-detail-value">${movie.title} - ${episode.title || `Épisode ${episodeIndex + 1}`}</div>
          </div>
          <div class="movie-detail-item">
            <div class="movie-detail-label">Genre:</div>
            <div class="movie-detail-value">${Array.isArray(movie.genre) ? movie.genre.join(", ") : movie.genre}</div>
          </div>
          <div class="movie-detail-item">
            <div class="movie-detail-label">Durée:</div>
            <div class="movie-detail-value">${movie.duration}</div>
          </div>
          <div class="movie-detail-item">
            <div class="movie-detail-label">Année:</div>
            <div class="movie-detail-value">${movie.releaseYear}</div>
          </div>
          <div class="movie-detail-item">
            <div class="movie-detail-label">Note:</div>
            <div class="movie-detail-value">★ ${movie.rating || "N/A"}</div>
          </div>
        </div>
        <div class="movie-description">
          <div class="movie-description-label">Description:</div>
          <div class="movie-description-text">${episode.description || "Aucune description disponible"}</div>
        </div>
      `
    } else {
      videoPlayer.src = movie.videoUrl || ""
      movieDetails.innerHTML = `
        <div class="movie-details-grid">
          <div class="movie-detail-item">
            <div class="movie-detail-label">Titre:</div>
            <div class="movie-detail-value">${movie.title}</div>
          </div>
          <div class="movie-detail-item">
            <div class="movie-detail-label">Genre:</div>
            <div class="movie-detail-value">${Array.isArray(movie.genre) ? movie.genre.join(", ") : movie.genre}</div>
          </div>
          <div class="movie-detail-item">
            <div class="movie-detail-label">Durée:</div>
            <div class="movie-detail-value">${movie.duration}</div>
          </div>
          <div class="movie-detail-item">
            <div class="movie-detail-label">Année:</div>
            <div class="movie-detail-value">${movie.releaseYear}</div>
          </div>
          <div class="movie-detail-item">
            <div class="movie-detail-label">Note:</div>
            <div class="movie-detail-value">★ ${movie.rating || "N/A"}</div>
          </div>
        </div>
        <div class="movie-description">
          <div class="movie-description-label">Description:</div>
          <div class="movie-description-text">${movie.description || "Aucune description disponible"}</div>
        </div>
      `
    }
  }

  // Gestionnaires d'événements pour le modal
  useEffect(() => {
    const closeBtn = document.getElementsByClassName("netflix-modal-close")[0] as HTMLElement
    const modal = document.getElementById("videoModal")

    if (closeBtn) {
      closeBtn.onclick = closeMovieModal
    }

    if (modal) {
      window.onclick = (event) => {
        if (event.target === modal) {
          closeMovieModal()
        }
      }
    }

    return () => {
      window.onclick = null
    }
  }, [])

  // Mettre à jour le lecteur vidéo lorsque le film ou l'épisode sélectionné change
  useEffect(() => {
    if (selectedMovie) {
      updateVideoPlayer(selectedMovie, selectedEpisode)
    }
  }, [selectedMovie, selectedEpisode])

  // Fonction pour rendre une carte de film
  const renderMovieCard = (movie: any) => (
    <div key={movie._id || movie.id} className="netflix-card" onClick={() => openMovieModal(movie)}>
      <div className="netflix-card-img">
        <Image
          src={movie.thumbnailUrl || "/placeholder.svg?height=300&width=200"}
          alt={movie.title}
          width={200}
          height={300}
          className="netflix-thumbnail"
        />
      </div>
      <div className="netflix-card-content">
        <h3 className="netflix-card-title">{movie.title}</h3>
        <div className="netflix-card-info">
          <span className="netflix-card-year">{movie.releaseYear}</span>
          <span className="netflix-card-rating">★ {movie.rating || "N/A"}</span>
          <span className="netflix-card-duration">{movie.duration}</span>
        </div>
        <p className="netflix-card-desc">
          {movie.description ? movie.description.substring(0, 100) + "..." : "Aucune description disponible"}
        </p>
        <div className="netflix-card-buttons">
          <button className="netflix-play-btn">▶ Lecture</button>
          <button className="netflix-info-btn">ℹ️ Plus d'infos</button>
        </div>
      </div>
    </div>
  )

  // Fonctions pour le menu et le profil
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  const toggleProfileModal = () => {
    setIsProfileModalOpen(!isProfileModalOpen)
  }

  // Modifier la fonction updateProfile pour mettre à jour le profil via l'API
  // Remplacer la fonction updateProfile par celle-ci:
  const updateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    const formData = new FormData(e.target as HTMLFormElement)
    const newName = formData.get("name") as string

    if (newName) {
      try {
        const token = localStorage.getItem("token")
        if (!token) throw new Error("No authentication token")

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "/.netlify/functions/api"}/update-profile`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ username: newName }),
        })

        if (!response.ok) {
          throw new Error("Erreur lors de la mise à jour du profil")
        }

        // Mettre à jour l'interface utilisateur
        setUserName(newName)
        setUserAvatar(newName.charAt(0))

        // Fermer le modal
        setIsProfileModalOpen(false)
      } catch (error) {
        console.error("Erreur lors de la mise à jour du profil:", error)
        alert("Erreur lors de la mise à jour du profil. Veuillez réessayer.")
      }
    }
  }

  // Fermer le menu lorsqu'on clique en dehors
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      if (isMenuOpen && !target.closest(".netflix-dropdown-menu") && !target.closest(".netflix-menu-toggle")) {
        setIsMenuOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isMenuOpen])

  return (
    <div className="netflix-container">
      {/* Header */}
      <header ref={headerRef} className={`netflix-header ${isHeaderScrolled ? "scrolled" : ""}`}>
        <div className="netflix-header-left">
          <div className="netflix-logo">
            <Logo className="iconf-svg" />
          </div>
          <nav className="netflix-nav">
            <ul>
              <li className="active">Accueil</li>
              <li>Séries</li>
              <li>Films</li>
              <li>Nouveautés</li>
              <li>Ma liste</li>
            </ul>
          </nav>
        </div>
        <div className="netflix-header-right">
          <div className={`netflix-search ${isSearchActive ? "active" : ""}`}>
            <button className="netflix-search-toggle" onClick={toggleSearch} aria-label="Rechercher">
              🔍
            </button>
            <input
              ref={searchInputRef}
              type="search"
              placeholder="Titres, personnes, genres"
              value={searchTerm}
              onChange={handleSearch}
              className={isSearchActive ? "active" : ""}
              aria-label="Rechercher des films et séries"
            />
          </div>

          {/* Menu hamburger */}
          <button className="netflix-menu-toggle" onClick={toggleMenu} aria-label="Menu">
            <div className={`hamburger-icon ${isMenuOpen ? "open" : ""}`}>
              <span></span>
              <span></span>
              <span></span>
            </div>
          </button>

          {/* Menu déroulant */}
          <div className={`netflix-dropdown-menu ${isMenuOpen ? "open" : ""}`}>
            <div className="netflix-profile-menu-item" onClick={toggleProfileModal}>
              <div className="netflix-avatar">{userAvatar}</div>
              <span>Profil</span>
            </div>
            <div className="netflix-menu-item" onClick={handleUserButton}>
              <span>Demandes</span>
            </div>
            <div className="netflix-menu-item" onClick={handleLogout}>
              <span>Déconnexion</span>
            </div>
          </div>
        </div>
      </header>

      {/* Featured Content */}
      {featuredMovie && !isLoading && (
        <div className="netflix-featured">
          <div className="netflix-featured-content">
            <h1 className="netflix-featured-title">{featuredMovie.title}</h1>
            <div className="netflix-featured-meta">
              <span className="netflix-match">Recommandé à 98%</span>
              <span className="netflix-year">{featuredMovie.releaseYear}</span>
              <span className="netflix-duration">{featuredMovie.duration}</span>
              <span className="netflix-rating">★ {featuredMovie.rating || "N/A"}</span>
            </div>
            <p className="netflix-featured-desc">{featuredMovie.description}</p>
            <div className="netflix-featured-buttons">
              <button className="netflix-play-button" onClick={() => openMovieModal(featuredMovie)}>
                ▶ Lecture
              </button>
              <button className="netflix-more-button">ℹ️ Plus d'infos</button>
            </div>
          </div>
          <div className="netflix-featured-gradient"></div>
          <div className="netflix-featured-img">
            <Image
              src={featuredMovie.thumbnailUrl || "/placeholder.svg?height=600&width=1200"}
              alt={featuredMovie.title}
              fill
              style={{ objectFit: "cover" }}
              priority
            />
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="netflix-main">
        {isLoading ? (
          <div className="netflix-loading">
            <div className="netflix-spinner"></div>
          </div>
        ) : movies.length === 0 ? (
          <div className="netflix-empty-state">
            <div className="netflix-empty-content">
              <h2>Aucun contenu disponible pour le moment</h2>
              <p>L'administrateur n'a pas encore ajouté de films ou de séries.</p>
              <p>Vous pouvez demander l'ajout de contenu en cliquant sur "Demandes" dans le menu.</p>
              <button className="netflix-request-btn" onClick={handleUserButton}>
                Faire une demande
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Populaires */}
            {popularMovies.length > 0 && (
              <div className="netflix-row">
                <h2 className="netflix-row-title">Populaires sur Jekle</h2>
                <div className="netflix-row-content">
                  {popularMovies.map((movie) => (
                    <div key={movie._id || movie.id} className="netflix-item" onClick={() => openMovieModal(movie)}>
                      <Image
                        src={movie.thumbnailUrl || "/placeholder.svg?height=300&width=200"}
                        alt={movie.title}
                        width={200}
                        height={300}
                        className="netflix-item-img"
                      />
                      <div className="netflix-item-info">
                        <h3>{movie.title}</h3>
                        <div className="netflix-item-meta">
                          <span className="netflix-item-rating">★ {movie.rating || "N/A"}</span>
                          <span className="netflix-item-year">{movie.releaseYear}</span>
                        </div>
                        <p>
                          {movie.description
                            ? movie.description.substring(0, 80) + "..."
                            : "Aucune description disponible"}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Action */}
            {actionMovies.length > 0 && (
              <div className="netflix-row">
                <h2 className="netflix-row-title">Action</h2>
                <div className="netflix-row-content">
                  {actionMovies.map((movie) => (
                    <div key={movie._id || movie.id} className="netflix-item" onClick={() => openMovieModal(movie)}>
                      <Image
                        src={movie.thumbnailUrl || "/placeholder.svg?height=300&width=200"}
                        alt={movie.title}
                        width={200}
                        height={300}
                        className="netflix-item-img"
                      />
                      <div className="netflix-item-info">
                        <h3>{movie.title}</h3>
                        <div className="netflix-item-meta">
                          <span className="netflix-item-rating">★ {movie.rating || "N/A"}</span>
                          <span className="netflix-item-year">{movie.releaseYear}</span>
                        </div>
                        <p>
                          {movie.description
                            ? movie.description.substring(0, 80) + "..."
                            : "Aucune description disponible"}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Drame */}
            {dramaMovies.length > 0 && (
              <div className="netflix-row">
                <h2 className="netflix-row-title">Drame</h2>
                <div className="netflix-row-content">
                  {dramaMovies.map((movie) => (
                    <div key={movie._id || movie.id} className="netflix-item" onClick={() => openMovieModal(movie)}>
                      <Image
                        src={movie.thumbnailUrl || "/placeholder.svg?height=300&width=200"}
                        alt={movie.title}
                        width={200}
                        height={300}
                        className="netflix-item-img"
                      />
                      <div className="netflix-item-info">
                        <h3>{movie.title}</h3>
                        <div className="netflix-item-meta">
                          <span className="netflix-item-rating">★ {movie.rating || "N/A"}</span>
                          <span className="netflix-item-year">{movie.releaseYear}</span>
                        </div>
                        <p>
                          {movie.description
                            ? movie.description.substring(0, 80) + "..."
                            : "Aucune description disponible"}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Science Fiction */}
            {scifiMovies.length > 0 && (
              <div className="netflix-row">
                <h2 className="netflix-row-title">Science Fiction</h2>
                <div className="netflix-row-content">
                  {scifiMovies.map((movie) => (
                    <div key={movie._id || movie.id} className="netflix-item" onClick={() => openMovieModal(movie)}>
                      <Image
                        src={movie.thumbnailUrl || "/placeholder.svg?height=300&width=200"}
                        alt={movie.title}
                        width={200}
                        height={300}
                        className="netflix-item-img"
                      />
                      <div className="netflix-item-info">
                        <h3>{movie.title}</h3>
                        <div className="netflix-item-meta">
                          <span className="netflix-item-rating">★ {movie.rating || "N/A"}</span>
                          <span className="netflix-item-year">{movie.releaseYear}</span>
                        </div>
                        <p>
                          {movie.description
                            ? movie.description.substring(0, 80) + "..."
                            : "Aucune description disponible"}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </main>

      {/* Modal */}
      <div id="videoModal" className="netflix-modal">
        <div className="netflix-modal-content">
          <span className="netflix-modal-close">&times;</span>
          {selectedMovie?.type === "série" && selectedMovie?.episodes && (
            <select
              id="episodeSelector"
              className="netflix-episode-selector"
              value={selectedEpisode}
              onChange={handleEpisodeChange}
              aria-label="Sélectionner un épisode"
            >
              {selectedMovie.episodes.map((_, index: number) => (
                <option key={index} value={index}>
                  Épisode {index + 1}
                </option>
              ))}
            </select>
          )}
          <iframe
            id="videoPlayer"
            width="100%"
            height="500"
            src=""
            frameBorder="0"
            allowFullScreen
            allow="autoplay; encrypted-media"
            sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
            title="Lecteur vidéo"
          ></iframe>
          <div id="movieDetails" className="netflix-modal-details"></div>
        </div>
      </div>
    </div>
  )
}
