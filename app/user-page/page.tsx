"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { useRouter } from 'next/navigation'
import Image from "next/image"
import "../styles/stylesA.css"
import Logo from "../../components/logo"
import { X, Check } from 'lucide-react'

export default function UserPage() {
  const router = useRouter()
  const [movies, setMovies] = useState<any[]>([])
  const [filteredMovies, setFilteredMovies] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isHeaderScrolled, setIsHeaderScrolled] = useState(false)
  const [isSearchActive, setIsSearchActive] = useState(false)
  const [featuredMovie, setFeaturedMovie] = useState<any | null>(null)
  const headerRef = useRef<HTMLElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)

  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false)
  const [userName, setUserName] = useState("John Doe")
  const [userAvatar, setUserAvatar] = useState("J")

  // NOUVEAU : États pour le modal de catégories
  const [contentType, setContentType] = useState<"all" | "film" | "série">("all")
  const [selectedGenres, setSelectedGenres] = useState<string[]>([])
  const [availableGenres, setAvailableGenres] = useState<string[]>([])
  const [isGenreModalOpen, setIsGenreModalOpen] = useState(false)

  const loadUserInfo = async () => {
    try {
      const token = localStorage.getItem("token")
      if (!token) throw new Error("No authentication token")

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "/.netlify/functions/api"}/check-auth`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (!response.ok) throw new Error(`Error: ${response.status}`)

      const userData = await response.json()
      if (userData.username) {
        setUserName(userData.username)
        setUserAvatar(userData.username.charAt(0).toUpperCase())
      }
    } catch (error) {
      console.error("Erreur chargement utilisateur:", error)
    }
  }

  const loadMovies = async () => {
    setIsLoading(true)
    try {
      const token = localStorage.getItem("token")
      if (!token) throw new Error("No token")

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "/.netflix/functions/api"}/movies`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (!response.ok) throw new Error(`Error: ${response.status}`)

      const data = await response.json()
      const moviesArray = Array.isArray(data) ? data : data.movies || []

      setMovies(moviesArray)
      setFilteredMovies(moviesArray)

      // Extraire tous les genres uniques
      const genres = new Set<string>()
      moviesArray.forEach((m: any) => {
        if (m.genre && Array.isArray(m.genre)) {
          m.genre.forEach((g: string) => genres.add(g))
        }
      })
      setAvailableGenres(Array.from(genres).sort())

      // Film en vedette aléatoire
      if (moviesArray.length > 0) {
        setFeaturedMovie(moviesArray[Math.floor(Math.random() * moviesArray.length)])
      }

    } catch (error) {
      console.error("Erreur chargement films:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) {
      router.push("/")
      return
    }

    loadUserInfo()
    loadMovies()

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [router])

  const handleScroll = () => {
    if (window.scrollY > 50) {
      setIsHeaderScrolled(true)
    } else {
      setIsHeaderScrolled(false)
    }
  }

  // FONCTION DE FILTRAGE
  useEffect(() => {
    let filtered = movies

    // Filtre par type
    if (contentType !== "all") {
      filtered = filtered.filter(m => (m.type || m.taper || '').toLowerCase() === contentType)
    }

    // Filtre par genres sélectionnés
    if (selectedGenres.length > 0) {
      filtered = filtered.filter(m => 
        m.genre && m.genre.some((g: string) => selectedGenres.includes(g))
      )
    }

    // Recherche
    if (searchTerm) {
      filtered = filtered.filter(m => 
        m.title.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    setFilteredMovies(filtered)
  }, [movies, contentType, selectedGenres, searchTerm])

  const toggleGenre = (genre: string) => {
    setSelectedGenres(prev => 
      prev.includes(genre) 
        ? prev.filter(g => g !== genre)
        : [...prev, genre]
    )
  }

  const openMovieDetail = (movie: any) => {
    router.push(`/watch/${movie._id}`)
  }

  const toggleProfileModal = () => setIsProfileModalOpen(!isProfileModalOpen)

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-3xl">Chargement des films...</div>
      </div>
    )
  }

  return (
    <div className="netflix-container">

      {/* HEADER NETFLIX */}
      <header ref={headerRef} className={`netflix-header ${isHeaderScrolled ? 'scrolled' : ''}`}>
        <div className="netflix-header-left">
          <Logo />
          <nav className="netflix-nav">
            <ul>
              <li className="active">Accueil</li>
              <li onClick={() => { setContentType('film'); setIsGenreModalOpen(true) }}>Films</li>
              <li onClick={() => { setContentType('série'); setIsGenreModalOpen(true) }}>Séries</li>
              <li>Nouveautés</li>
              <li>Ma liste</li>
            </ul>
          </nav>
        </div>

        <div className="netflix-header-right">
          <div className="netflix-search">
            <input
              type="text"
              placeholder="Titres, genres..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onFocus={() => setIsSearchActive(true)}
              onBlur={() => setTimeout(() => setIsSearchActive(false), 200)}
            />
          </div>
          <div className="netflix-profile" onClick={toggleProfileModal}>
            <div className="netflix-avatar">{userAvatar}</div>
          </div>
        </div>
      </header>

      {/* MODAL DE SÉLECTION DES GENRES (LE TRUC QUE TU VOULAIS) */}
      {isGenreModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setIsGenreModalOpen(false)}>
          <div className="bg-[#141414] rounded-2xl p-8 max-w-md w-full max-h-[80vh] overflow-y-auto border border-white/10" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-3xl font-bold">
                {contentType === 'film' ? 'Films' : 'Séries'} - Choisis tes genres
              </h2>
              <button onClick={() => setIsGenreModalOpen(false)} className="text-gray-400 hover:text-white">
                <X size={28} />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-6">
              {availableGenres.map((genre) => (
                <button
                  key={genre}
                  onClick={() => toggleGenre(genre)}
                  className={`py-4 px-6 rounded-xl font-medium transition-all transform hover:scale-105 ${
                    selectedGenres.includes(genre)
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                      : 'bg-white/10 hover:bg-white/20 text-gray-300'
                  }`}
                >
                  <span className="flex items-center justify-center gap-3">
                    {selectedGenres.includes(genre) && <Check size={20} />}
                    {genre}
                  </span>
                </button>
              ))}
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => {
                  setSelectedGenres([])
                  setIsGenreModalOpen(false)
                }}
                className="flex-1 py-4 bg-white/10 hover:bg-white/20 rounded-xl font-bold transition"
              >
                Tout voir
              </button>
              <button
                onClick={() => setIsGenreModalOpen(false)}
                className="flex-1 py-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl font-bold hover:from-blue-500 hover:to-purple-500 transition shadow-lg"
              >
                Valider ({selectedGenres.length} sélectionné{selectedGenres.length > 1 ? 's' : ''})
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CONTENU PRINCIPAL */}
      <main className="pt-20">
        {/* Film en vedette */}
        {featuredMovie && !searchTerm && selectedGenres.length === 0 && (
          <div className="netflix-featured">
            <div className="netflix-featured-bg" style={{ backgroundImage: `url(${featuredMovie.thumbnailUrl})` }} />
            <div className="netflix-featured-content">
              <h1 className="netflix-featured-title">{featuredMovie.title}</h1>
              <p className="netflix-featured-description">{featuredMovie.description}</p>
              <div className="netflix-featured-buttons">
                <button className="netflix-btn-primary" onClick={() => openMovieDetail(featuredMovie)}>
                  <Play size={28} /> Lecture
                </button>
                <button className="netflix-btn-secondary">
                  Plus d'infos
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Grille de films */}
        <div className="netflix-content">
          {filteredMovies.length === 0 ? (
            <div className="text-center py-20 text-3xl text-gray-500">
              Aucun résultat trouvé
            </div>
          ) : (
            <div className="space-y-12">
              <div className="netflix-row">
                <h2 className="netflix-row-title">
                  {searchTerm ? `Résultats pour "${searchTerm}"` : 
                   selectedGenres.length > 0 ? `Sélection : ${selectedGenres.join(', ')}` : 
                   contentType === 'film' ? 'Films' : contentType === 'série' ? 'Séries' : 'Tous les contenus'}
                </h2>
                <div className="netflix-row-content">
                  {filteredMovies.map((movie) => (
                    <div
                      key={movie._id || movie.id}
                      className="netflix-item"
                      onClick={() => openMovieDetail(movie)}
                    >
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
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
