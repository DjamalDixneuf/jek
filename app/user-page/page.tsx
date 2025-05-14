"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import "../styles/stylesA.css"

export default function UserPage() {
  const router = useRouter()
  const [movies, setMovies] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedMovie, setSelectedMovie] = useState<any | null>(null)
  const [selectedEpisode, setSelectedEpisode] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  // Vérifier l'authentification
  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) {
      router.push("/")
      return
    }

    // Charger les films (simulé)
    loadMovies()
  }, [router])

  const loadMovies = async () => {
    setIsLoading(true)
    try {
      // Simuler le chargement des films depuis une API
      await new Promise((resolve) => setTimeout(resolve, 1000))

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
        },
        {
          id: 2,
          title: "Breaking Bad",
          type: "série",
          duration: "5 saisons",
          genre: "Drame, Crime",
          releaseYear: "2008",
          thumbnailUrl: "/placeholder.svg?height=260&width=180",
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
        },
        {
          id: 4,
          title: "Stranger Things",
          type: "série",
          duration: "4 saisons",
          genre: "Drame, Fantastique, Horreur",
          releaseYear: "2016",
          thumbnailUrl: "/placeholder.svg?height=260&width=180",
          episodes: [
            {
              title: "Épisode 1",
              description: "La disparition de Will Byers",
              url: "https://example.com/st-s01e01.mp4",
            },
            { title: "Épisode 2", description: "La recherche commence", url: "https://example.com/st-s01e02.mp4" },
          ],
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
        },
        {
          id: 6,
          title: "Game of Thrones",
          type: "série",
          duration: "8 saisons",
          genre: "Action, Aventure, Drame",
          releaseYear: "2011",
          thumbnailUrl: "/placeholder.svg?height=260&width=180",
          episodes: [
            { title: "Épisode 1", description: "L'hiver vient", url: "https://example.com/got-s01e01.mp4" },
            { title: "Épisode 2", description: "La route royale", url: "https://example.com/got-s01e02.mp4" },
          ],
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

  const filteredMovies = movies.filter(
    (movie) =>
      movie.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      movie.genre.toLowerCase().includes(searchTerm.toLowerCase()),
  )

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
    }
  }

  const closeMovieModal = () => {
    const modal = document.getElementById("videoModal")
    if (modal) {
      modal.style.display = "none"
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

  return (
    <div className="bg-gray-900 text-white">
      <header className="bg-gray-800 p-4">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <div className="icon-container">
              <Image
                src="/placeholder.svg?height=50&width=60"
                alt="Film Icon"
                width={60}
                height={50}
                className="iconf-svg"
              />
            </div>
            <h1 className="text-2xl font-bold">Jekle Entertainment</h1>
          </div>
          <div className="flex items-center space-x-4">
            <input
              type="search"
              id="searchInput"
              placeholder="Rechercher un film ou une série..."
              className="w-64 input"
              value={searchTerm}
              onChange={handleSearch}
            />
            <button className="iconU-button" id="userButton" onClick={handleUserButton}>
              <span className="icon-svg">📋</span>
            </button>
            <button className="iconL-button" id="logoutButton" onClick={handleLogout}>
              <span className="icon-svg">🚪</span>
            </button>
          </div>
        </div>
      </header>

      <main className="container mx-auto py-8">
        <h2 className="text-2xl font-semibold mb-4">Films et Séries disponibles</h2>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white mb-4"></div>
              <p>Chargement des films...</p>
            </div>
          </div>
        ) : filteredMovies.length > 0 ? (
          <div id="moviesContainer" className="grid">
            {filteredMovies.map((movie) => (
              <div key={movie.id} className="card">
                <Image
                  src={movie.thumbnailUrl || "/placeholder.svg"}
                  alt={movie.title}
                  width={180}
                  height={260}
                  className="movie-thumbnail"
                  onClick={() => openMovieModal(movie)}
                />
                <div className="card-content">
                  <h3>{movie.title}</h3>
                  <p>{movie.duration}</p>
                  <p>{movie.type === "série" ? `${movie.episodes?.length || 0} épisodes` : "Film"}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p>Aucun film ou série ne correspond à votre recherche.</p>
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
              style={{ display: "block" }}
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
            height="315"
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
