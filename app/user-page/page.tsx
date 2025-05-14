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
  const headerRef = useRef<HTMLElement>(null)

  // Vérifier l'authentification
  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) {
      router.push("/")
      return
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
      ]

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

  const handleLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("role")
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
    const closeBtn = document.getElementsByClassName("close")[0] as HTMLElement
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
    <div key={movie.id} className="card">
      <div className="movie-thumbnail" onClick={() => openMovieModal(movie)}>
        <Image
          src={movie.thumbnailUrl || "/placeholder.svg"}
          alt={movie.title}
          width={200}
          height={300}
          className="movie-thumbnail"
        />
        <div className="play-button">▶</div>
      </div>
      <div className="card-content">
        <h3>{movie.title}</h3>
        <p>{movie.duration}</p>
        <p>{movie.type === "série" ? `${movie.episodes?.length || 0} épisodes` : "Film"}</p>
        <div className="badge">★ {movie.rating}</div>
      </div>
    </div>
  )

  return (
    <div className="bg-gray-900 text-white">
      <header ref={headerRef} className={isHeaderScrolled ? "scrolled" : ""}>
        <div className="container">
          <div className="header-container">
            <div className="logo-container">
              <div className="icon-container">
                <Logo className="iconf-svg" />
              </div>
              <h1>Jekle Entertainment</h1>
            </div>

            <div className="search-container">
              <input
                type="search"
                id="searchInput"
                placeholder="Rechercher un film ou une série..."
                className="input"
                value={searchTerm}
                onChange={handleSearch}
              />
              <span className="search-icon">🔍</span>
            </div>

            <div className="actions-container">
              <button className="iconU-button" id="userButton" onClick={handleUserButton}>
                <span className="icon-svg">📋</span>
                <span>Demandes</span>
              </button>
              <button className="iconL-button" id="logoutButton" onClick={handleLogout}>
                <span className="icon-svg">🚪</span>
                <span>Déconnexion</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="container">
        <div className="categories">
          <button
            className={`category-button ${activeCategory === "all" ? "active" : ""}`}
            onClick={() => handleCategoryChange("all")}
          >
            Tous
          </button>
          <button
            className={`category-button ${activeCategory === "populaire" ? "active" : ""}`}
            onClick={() => handleCategoryChange("populaire")}
          >
            Populaires
          </button>
          <button
            className={`category-button ${activeCategory === "action" ? "active" : ""}`}
            onClick={() => handleCategoryChange("action")}
          >
            Action
          </button>
          <button
            className={`category-button ${activeCategory === "drame" ? "active" : ""}`}
            onClick={() => handleCategoryChange("drame")}
          >
            Drame
          </button>
          <button
            className={`category-button ${activeCategory === "sci-fi" ? "active" : ""}`}
            onClick={() => handleCategoryChange("sci-fi")}
          >
            Science Fiction
          </button>
          <button
            className={`category-button ${activeCategory === "aventure" ? "active" : ""}`}
            onClick={() => handleCategoryChange("aventure")}
          >
            Aventure
          </button>
          <button
            className={`category-button ${activeCategory === "fantastique" ? "active" : ""}`}
            onClick={() => handleCategoryChange("fantastique")}
          >
            Fantastique
          </button>
          <button
            className={`category-button ${activeCategory === "crime" ? "active" : ""}`}
            onClick={() => handleCategoryChange("crime")}
          >
            Crime
          </button>
        </div>

        {isLoading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
          </div>
        ) : activeCategory === "all" ? (
          <>
            <h2 className="section-title">Populaires</h2>
            <div className="grid">{popularMovies.map(renderMovieCard)}</div>

            <h2 className="section-title">Action</h2>
            <div className="grid">{actionMovies.map(renderMovieCard)}</div>

            <h2 className="section-title">Drame</h2>
            <div className="grid">{dramaMovies.map(renderMovieCard)}</div>
          </>
        ) : filteredMovies.length > 0 ? (
          <div className="grid">{filteredMovies.map(renderMovieCard)}</div>
        ) : (
          <div className="empty-state">
            <div className="empty-state-icon">🎬</div>
            <p className="empty-state-text">Aucun film ou série ne correspond à votre recherche.</p>
          </div>
        )}
      </main>

      <div id="videoModal" className="modal">
        <div className="modal-content">
          <span className="close">&times;</span>
          {selectedMovie?.type === "série" && selectedMovie?.episodes && (
            <select
              id="episodeSelector"
              className="episode-selector"
              value={selectedEpisode}
              onChange={handleEpisodeChange}
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
          ></iframe>
          <div id="movieDetails"></div>
        </div>
      </div>
    </div>
  )
}
