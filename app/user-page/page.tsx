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

  // Vérifier l'authentification
  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) {
      router.push("/")
      return
    }

    // Récupérer le nom d'utilisateur du localStorage s'il existe
    const savedUserName = localStorage.getItem("userName")
    if (savedUserName) {
      setUserName(savedUserName)
      setUserAvatar(savedUserName.charAt(0))
    }

    // Charger les films (simulé)
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
      // Simuler le chargement des films depuis une API
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Données fictives pour la démo
      const mockMovies = [
        {
          id: 1,
          title: "Inception",
          type: "film",
          duration: "2h 28min",
          genre: "Science Fiction, Action",
          releaseYear: "2010",
          thumbnailUrl: "/placeholder.svg?height=260&width=180",
          description:
            "Un voleur qui s'infiltre dans les rêves des autres pour voler leurs secrets se voit offrir une chance de retrouver sa vie normale.",
          videoUrl: "https://example.com/inception.mp4",
          rating: 4.8,
          categories: ["populaire", "action", "sci-fi"],
        },
        {
          id: 2,
          title: "Breaking Bad",
          type: "série",
          duration: "5 saisons",
          genre: "Drame, Crime",
          releaseYear: "2008",
          thumbnailUrl: "/placeholder.svg?height=260&width=180",
          description: "Un professeur de chimie atteint d'un cancer devient fabricant et vendeur de méthamphétamine.",
          episodes: [
            {
              title: "Épisode 1",
              description: "Le début de l'histoire de Walter White",
              url: "https://example.com/bb-s01e01.mp4",
            },
            {
              title: "Épisode 2",
              description: "Walter et Jesse commencent leur partenariat",
              url: "https://example.com/bb-s01e02.mp4",
            },
          ],
          rating: 4.9,
          categories: ["populaire", "drame", "crime"],
        },
        {
          id: 3,
          title: "The Dark Knight",
          type: "film",
          duration: "2h 32min",
          genre: "Action, Crime, Drame",
          releaseYear: "2008",
          thumbnailUrl: "/placeholder.svg?height=260&width=180",
          description:
            "Batman s'allie au procureur Harvey Dent pour démanteler le crime organisé à Gotham, mais ils se retrouvent bientôt face au Joker.",
          videoUrl: "https://example.com/dark-knight.mp4",
          rating: 4.9,
          categories: ["populaire", "action", "drame"],
        },
        {
          id: 4,
          title: "Stranger Things",
          type: "série",
          duration: "4 saisons",
          genre: "Drame, Fantastique, Horreur",
          releaseYear: "2016",
          thumbnailUrl: "/placeholder.svg?height=260&width=180",
          description:
            "Des enfants font face à des forces surnaturelles et à des expériences gouvernementales secrètes.",
          episodes: [
            {
              title: "Épisode 1",
              description: "La disparition de Will Byers",
              url: "https://example.com/st-s01e01.mp4",
            },
            { title: "Épisode 2", description: "La recherche commence", url: "https://example.com/st-s01e02.mp4" },
          ],
          rating: 4.7,
          categories: ["populaire", "fantastique", "horreur"],
        },
        {
          id: 5,
          title: "Interstellar",
          type: "film",
          duration: "2h 49min",
          genre: "Aventure, Drame, Science Fiction",
          releaseYear: "2014",
          thumbnailUrl: "/placeholder.svg?height=260&width=180",
          description:
            "Une équipe d'explorateurs voyage à travers un trou de ver dans l'espace pour assurer la survie de l'humanité.",
          videoUrl: "https://example.com/interstellar.mp4",
          rating: 4.8,
          categories: ["sci-fi", "drame", "aventure"],
        },
        {
          id: 6,
          title: "Game of Thrones",
          type: "série",
          duration: "8 saisons",
          genre: "Action, Aventure, Drame",
          releaseYear: "2011",
          thumbnailUrl: "/placeholder.svg?height=260&width=180",
          description: "Neuf familles nobles luttent pour le contrôle des terres de Westeros.",
          episodes: [
            { title: "Épisode 1", description: "L'hiver vient", url: "https://example.com/got-s01e01.mp4" },
            { title: "Épisode 2", description: "La route royale", url: "https://example.com/got-s01e02.mp4" },
          ],
          rating: 4.7,
          categories: ["populaire", "aventure", "drame"],
        },
        {
          id: 7,
          title: "The Witcher",
          type: "série",
          duration: "2 saisons",
          genre: "Action, Aventure, Fantastique",
          releaseYear: "2019",
          thumbnailUrl: "/placeholder.svg?height=260&width=180",
          description: "Le sorceleur Geralt, un chasseur de monstres, lutte pour trouver sa place dans un monde.",
          episodes: [
            { title: "Épisode 1", description: "Le début", url: "https://example.com/witcher-s01e01.mp4" },
            { title: "Épisode 2", description: "La suite", url: "https://example.com/witcher-s01e02.mp4" },
          ],
          rating: 4.5,
          categories: ["fantastique", "action", "aventure"],
        },
        {
          id: 8,
          title: "Joker",
          type: "film",
          duration: "2h 2min",
          genre: "Crime, Drame, Thriller",
          releaseYear: "2019",
          thumbnailUrl: "/placeholder.svg?height=260&width=180",
          description: "L'histoire de l'origine du Joker, l'ennemi juré de Batman.",
          videoUrl: "https://example.com/joker.mp4",
          rating: 4.6,
          categories: ["crime", "drame", "thriller"],
        },
        {
          id: 9,
          title: "The Mandalorian",
          type: "série",
          duration: "2 saisons",
          genre: "Action, Aventure, Science Fiction",
          releaseYear: "2019",
          thumbnailUrl: "/placeholder.svg?height=260&width=180",
          description: "Les aventures d'un chasseur de primes mandalorien dans les confins de la galaxie.",
          episodes: [
            { title: "Épisode 1", description: "Le Mandalorien", url: "https://example.com/mando-s01e01.mp4" },
            { title: "Épisode 2", description: "L'Enfant", url: "https://example.com/mando-s01e02.mp4" },
          ],
          rating: 4.8,
          categories: ["sci-fi", "action", "aventure"],
        },
        {
          id: 10,
          title: "Black Mirror",
          type: "série",
          duration: "5 saisons",
          genre: "Drame, Science Fiction, Thriller",
          releaseYear: "2011",
          thumbnailUrl: "/placeholder.svg?height=260&width=180",
          description:
            "Une série d'anthologie explorant un futur proche où les innovations technologiques entrent en collision avec nos instincts les plus sombres.",
          episodes: [
            { title: "Épisode 1", description: "L'Hymne national", url: "https://example.com/bm-s01e01.mp4" },
            { title: "Épisode 2", description: "15 millions de mérites", url: "https://example.com/bm-s01e02.mp4" },
          ],
          rating: 4.7,
          categories: ["sci-fi", "drame", "thriller"],
        },
        {
          id: 11,
          title: "Dune",
          type: "film",
          duration: "2h 35min",
          genre: "Action, Aventure, Science Fiction",
          releaseYear: "2021",
          thumbnailUrl: "/placeholder.svg?height=260&width=180",
          description:
            "L'histoire du fils d'une famille noble chargé de protéger la ressource la plus précieuse de la galaxie.",
          videoUrl: "https://example.com/dune.mp4",
          rating: 4.7,
          categories: ["sci-fi", "action", "aventure"],
        },
        {
          id: 12,
          title: "The Queen's Gambit",
          type: "série",
          duration: "1 saison",
          genre: "Drame",
          releaseYear: "2020",
          thumbnailUrl: "/placeholder.svg?height=260&width=180",
          description:
            "L'histoire d'une prodige des échecs qui lutte contre la dépendance tout en essayant de devenir la meilleure joueuse d'échecs du monde.",
          episodes: [
            { title: "Épisode 1", description: "Ouvertures", url: "https://example.com/qg-s01e01.mp4" },
            { title: "Épisode 2", description: "Échanges", url: "https://example.com/qg-s01e02.mp4" },
          ],
          rating: 4.8,
          categories: ["drame"],
        },
      ]

      // Sélectionner un film aléatoire pour la mise en avant
      const randomIndex = Math.floor(Math.random() * mockMovies.length)
      setFeaturedMovie(mockMovies[randomIndex])

      setMovies(mockMovies)
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
      movie.genre.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesCategory = activeCategory === "all" || movie.categories.includes(activeCategory)

    return matchesSearch && matchesCategory
  })

  const popularMovies = movies.filter((movie) => movie.categories.includes("populaire"))
  const actionMovies = movies.filter((movie) => movie.categories.includes("action"))
  const dramaMovies = movies.filter((movie) => movie.categories.includes("drame"))
  const scifiMovies = movies.filter((movie) => movie.categories.includes("sci-fi"))

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
            <div class="movie-detail-value">${movie.genre}</div>
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
            <div class="movie-detail-value">${movie.genre}</div>
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
    <div key={movie.id} className="netflix-card" onClick={() => openMovieModal(movie)}>
      <div className="netflix-card-img">
        <Image
          src={movie.thumbnailUrl || "/placeholder.svg"}
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
          <span className="netflix-card-rating">★ {movie.rating}</span>
          <span className="netflix-card-duration">{movie.duration}</span>
        </div>
        <p className="netflix-card-desc">{movie.description.substring(0, 100)}...</p>
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

  const updateProfile = (e: React.FormEvent) => {
    e.preventDefault()
    const formData = new FormData(e.target as HTMLFormElement)
    const newName = formData.get("name") as string
    if (newName) {
      setUserName(newName)
      setUserAvatar(newName.charAt(0))
      localStorage.setItem("userName", newName)
    }
    setIsProfileModalOpen(false)
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
      {/* Modifier la section de l'en-tête pour afficher la navigation sur mobile et rapprocher l'icône de recherche du menu hamburger */}

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
              <span className="netflix-rating">★ {featuredMovie.rating}</span>
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
              src={featuredMovie.thumbnailUrl || "/placeholder.svg"}
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
        ) : (
          <>
            {/* Populaires */}
            {popularMovies.length > 0 && (
              <div className="netflix-row">
                <h2 className="netflix-row-title">Populaires sur Jekle</h2>
                <div className="netflix-row-content">
                  {popularMovies.map((movie) => (
                    <div key={movie.id} className="netflix-item" onClick={() => openMovieModal(movie)}>
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
                          <span className="netflix-item-rating">★ {movie.rating}</span>
                          <span className="netflix-item-year">{movie.releaseYear}</span>
                        </div>
                        <p>{movie.description.substring(0, 80)}...</p>
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
                    <div key={movie.id} className="netflix-item" onClick={() => openMovieModal(movie)}>
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
                          <span className="netflix-item-rating">★ {movie.rating}</span>
                          <span className="netflix-item-year">{movie.releaseYear}</span>
                        </div>
                        <p>{movie.description.substring(0, 80)}...</p>
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
                    <div key={movie.id} className="netflix-item" onClick={() => openMovieModal(movie)}>
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
                          <span className="netflix-item-rating">★ {movie.rating}</span>
                          <span className="netflix-item-year">{movie.releaseYear}</span>
                        </div>
                        <p>{movie.description.substring(0, 80)}...</p>
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
                    <div key={movie.id} className="netflix-item" onClick={() => openMovieModal(movie)}>
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
                          <span className="netflix-item-rating">★ {movie.rating}</span>
                          <span className="netflix-item-year">{movie.releaseYear}</span>
                        </div>
                        <p>{movie.description.substring(0, 80)}...</p>
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
