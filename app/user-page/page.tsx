"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { useRouter } from 'next/navigation'
import Image from "next/image"
import "../styles/stylesA.css"
import Logo from "../../components/logo"

export default function UserPage() {
  const router = useRouter()
  const [movies, setMovies] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(true)
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

  // États pour le filtrage par genre et type
  const [contentType, setContentType] = useState("all")
  const [selectedGenre, setSelectedGenre] = useState("all")
  const [availableGenres, setAvailableGenres] = useState<string[]>([])
  const [isGenreMenuOpen, setIsGenreMenuOpen] = useState(false)

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

      if (userData.username) {
        setUserName(userData.username)
        setUserAvatar(userData.username.charAt(0))
      }
    } catch (error) {
      console.error("Erreur lors du chargement des informations utilisateur:", error)
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

      const moviesArray = Array.isArray(data) ? data : data.movies && Array.isArray(data.movies) ? data.movies : []

      if (moviesArray.length > 0) {
        setMovies(moviesArray)

        const genres = new Set<string>()
        moviesArray.forEach((movie) => {
          if (movie.genre) {
            if (Array.isArray(movie.genre)) {
              movie.genre.forEach((g: string) => genres.add(g))
            } else if (typeof movie.genre === "string") {
              genres.add(movie.genre)
            }
          }
        })
        setAvailableGenres(Array.from(genres))

        const randomIndex = Math.floor(Math.random() * moviesArray.length)
        setFeaturedMovie(moviesArray[randomIndex])
      } else {
        setMovies([])
        setFeaturedMovie(null)
        setAvailableGenres([])
      }
    } catch (error) {
      console.error("Erreur lors du chargement des films:", error)
      setMovies([])
      setFeaturedMovie(null)
      setAvailableGenres([])
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

  const handleContentTypeChange = (type: string) => {
    setContentType(type)
    setSelectedGenre("all")
    setIsGenreMenuOpen(false)
  }

  const handleGenreChange = (genre: string) => {
    setSelectedGenre(genre)
    setIsGenreMenuOpen(false)
  }

  const toggleGenreMenu = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsGenreMenuOpen(!isGenreMenuOpen)
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

    const matchesType = contentType === "all" || movie.type === contentType

    const matchesGenre =
      selectedGenre === "all" ||
      (movie.genre && typeof movie.genre === "string" && movie.genre.toLowerCase() === selectedGenre.toLowerCase()) ||
      (movie.genre &&
        Array.isArray(movie.genre) &&
        movie.genre.some((g: string) => g.toLowerCase() === selectedGenre.toLowerCase()))

    return matchesSearch && matchesType && matchesGenre
  })

  const getMoviesByCategory = (category: string) => {
    return movies.filter((movie) => movie.categories && movie.categories.includes(category))
  }

  const getMoviesByGenre = (genre: string) => {
    return movies.filter((movie) => {
      if (movie.genre) {
        if (Array.isArray(movie.genre)) {
          return movie.genre.some((g: string) => g.toLowerCase() === genre.toLowerCase())
        } else if (typeof movie.genre === "string") {
          return movie.genre.toLowerCase() === genre.toLowerCase()
        }
      }
      return false
    })
  }

  const popularMovies = getMoviesByCategory("populaire")
  const actionMovies = getMoviesByCategory("action")
  const dramaMovies = getMoviesByCategory("drame")
  const scifiMovies = getMoviesByCategory("sci-fi")
  const allMovies = movies.slice(0, 10)

  const handleLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("role")
    localStorage.removeItem("userName")
    router.push("/")
  }

  const handleUserButton = () => {
    router.push("/request-movie")
  }

  // NOUVELLE FONCTION : Rediriger vers la page film
  const openMovieDetail = (movie: any) => {
    router.push(`/film/${movie._id}`)
  }

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  const toggleProfileModal = () => {
    setIsProfileModalOpen(!isProfileModalOpen)
  }

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

        setUserName(newName)
        setUserAvatar(newName.charAt(0))
        setIsProfileModalOpen(false)
      } catch (error) {
        console.error("Erreur lors de la mise à jour du profil:", error)
        alert("Erreur lors de la mise à jour du profil. Veuillez réessayer.")
      }
    }
  }

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      if (isMenuOpen && !target.closest(".netflix-dropdown-menu") && !target.closest(".netflix-menu-toggle")) {
        setIsMenuOpen(false)
      }

      if (isGenreMenuOpen && !target.closest(".netflix-genre-menu") && !target.closest(".netflix-nav-item")) {
        setIsGenreMenuOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isMenuOpen, isGenreMenuOpen])

  return (
    <div className="netflix-container">
      {/* Header */}
      <header ref={headerRef} className={`netflix-header ${isHeaderScrolled ? "scrolled" : ""}`}>
        <div className="netflix-header-left">
          <div className="netflix-logo">
            <Logo className="iconf-svg" />
          </div>
          <nav className="netflix-nav">
            <ul className="netflix-desktop-nav">
              <li
                className={`netflix-nav-item ${contentType === "all" && selectedGenre === "all" ? "active" : ""}`}
                onClick={() => handleContentTypeChange("all")}
              >
                Accueil
              </li>
              <li
                className={`netflix-nav-item ${contentType === "série" ? "active" : ""}`}
                onClick={() => handleContentTypeChange("série")}
              >
                Séries
                {contentType === "série" && <div className="netflix-nav-indicator"></div>}
              </li>
              <li
                className={`netflix-nav-item ${contentType === "film" ? "active" : ""}`}
                onClick={() => handleContentTypeChange("film")}
              >
                Films
                {contentType === "film" && <div className="netflix-nav-indicator"></div>}
              </li>
              <li className="netflix-nav-item">Nouveautés</li>
              <li className="netflix-nav-item">Ma liste</li>
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

          <button className="netflix-menu-toggle" onClick={toggleMenu} aria-label="Menu">
            <div className={`hamburger-icon ${isMenuOpen ? "open" : ""}`}>
              <span></span>
              <span></span>
              <span></span>
            </div>
          </button>

          <div className={`netflix-dropdown-menu ${isMenuOpen ? "open" : ""}`}>
            <div className="netflix-profile-menu-item" onClick={toggleProfileModal}>
              <div className="netflix-avatar">{userAvatar}</div>
              <span>Profil</span>
            </div>

            <div className="netflix-mobile-nav">
              <div
                className={`netflix-menu-item ${contentType === "all" && selectedGenre === "all" ? "active" : ""}`}
                onClick={() => {
                  handleContentTypeChange("all")
                  setIsMenuOpen(false)
                }}
              >
                <span>Accueil</span>
              </div>
              <div
                className={`netflix-menu-item ${contentType === "série" ? "active" : ""}`}
                onClick={() => {
                  handleContentTypeChange("série")
                  setIsMenuOpen(false)
                }}
              >
                <span>Séries</span>
              </div>
              <div
                className={`netflix-menu-item ${contentType === "film" ? "active" : ""}`}
                onClick={() => {
                  handleContentTypeChange("film")
                  setIsMenuOpen(false)
                }}
              >
                <span>Films</span>
              </div>
              <div className="netflix-menu-item">
                <span>Nouveautés</span>
              </div>
              <div className="netflix-menu-item">
                <span>Ma liste</span>
              </div>
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

      {/* Menu des genres */}
      {(contentType === "film" || contentType === "série") && (
        <div className="netflix-genre-bar">
          <div className="netflix-genre-container">
            <div className={`netflix-genre-selector ${isGenreMenuOpen ? "active" : ""}`} onClick={toggleGenreMenu}>
              <span>{selectedGenre === "all" ? "Tous les genres" : selectedGenre}</span>
              <span className="netflix-genre-arrow">▼</span>

              {isGenreMenuOpen && (
                <div className="netflix-genre-dropdown">
                  <div
                    className={`netflix-genre-dropdown-item ${selectedGenre === "all" ? "active" : ""}`}
                    onClick={(e) => {
                      e.stopPropagation()
                      handleGenreChange("all")
                    }}
                  >
                    Tous les genres
                  </div>
                  {availableGenres.map((genre) => (
                    <div
                      key={genre}
                      className={`netflix-genre-dropdown-item ${selectedGenre === genre ? "active" : ""}`}
                      onClick={(e) => {
                        e.stopPropagation()
                        handleGenreChange(genre)
                      }}
                    >
                      {genre}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Featured Content */}
      {featuredMovie && !isLoading && (contentType === "all" || selectedGenre === "all") && (
        <div className="netflix-featured">
          <div className="netflix-featured-content">
            <h1 className="netflix-featured-title">{featuredMovie.title}</h1>
            <div className="netflix-featured-meta">
              <span className="netflix-year">{featuredMovie.releaseYear}</span>
              <span className="netflix-duration">{featuredMovie.duration}</span>
              <span className="netflix-rating">★ {featuredMovie.rating || "N/A"}</span>
            </div>
            <p className="netflix-featured-desc">{featuredMovie.description}</p>
            <div className="netflix-featured-buttons">
              <button className="netflix-play-button" onClick={() => openMovieDetail(featuredMovie)}>
                ▶ Lecture
              </button>
              <button className="netflix-more-button" onClick={() => openMovieDetail(featuredMovie)}>
                ℹ️ Plus d'infos
              </button>
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
        ) : filteredMovies.length === 0 ? (
          <div className="netflix-empty-state">
            <div className="netflix-empty-content">
              <h2>Aucun contenu ne correspond à votre recherche</h2>
              <p>Essayez de modifier vos critères de recherche ou de sélectionner un autre genre.</p>
              <button
                className="netflix-reset-btn"
                onClick={() => {
                  setContentType("all")
                  setSelectedGenre("all")
                  setSearchTerm("")
                }}
              >
                Réinitialiser les filtres
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Affichage des films filtrés */}
            {(contentType !== "all" || selectedGenre !== "all") && (
              <div className="netflix-filtered-content">
                <h2 className="netflix-section-title">
                  {contentType === "all" ? "Tous les contenus" : contentType === "film" ? "Films" : "Séries"}
                  {selectedGenre !== "all" && ` - ${selectedGenre}`}
                </h2>
                <div className="netflix-grid-view">
                  {filteredMovies.map((movie) => (
                    <div
                      key={movie._id || movie.id}
                      className="netflix-grid-item"
                      onClick={() => openMovieDetail(movie)}
                    >
                      <div className="netflix-grid-img">
                        <Image
                          src={movie.thumbnailUrl || "/placeholder.svg?height=300&width=200"}
                          alt={movie.title}
                          width={200}
                          height={300}
                          className="netflix-grid-thumbnail"
                        />
                        <div className="netflix-grid-overlay">
                          <div className="netflix-grid-info">
                            <h3>{movie.title}</h3>
                            <div className="netflix-grid-meta">
                              <span>{movie.releaseYear}</span>
                              <span>{movie.duration}</span>
                            </div>
                            <p>
                              {movie.description ? movie.description.substring(0, 80) + "..." : "Aucune description"}
                            </p>
                          </div>
                          <button className="netflix-grid-play">▶ Lecture</button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Affichage par catégories */}
            {contentType === "all" && selectedGenre === "all" && (
              <>
                {allMovies.length > 0 && (
                  <div className="netflix-row">
                    <h2 className="netflix-row-title">Tous les films et séries</h2>
                    <div className="netflix-row-content">
                      {allMovies.map((movie) => (
                        <div key={movie._id || movie.id} className="netflix-item" onClick={() => openMovieDetail(movie)}>
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

                {popularMovies.length > 0 && (
                  <div className="netflix-row">
                    <h2 className="netflix-row-title">Populaires sur Jekle</h2>
                    <div className="netflix-row-content">
                      {popularMovies.map((movie) => (
                        <div key={movie._id || movie.id} className="netflix-item" onClick={() => openMovieDetail(movie)}>
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

                {actionMovies.length > 0 && (
                  <div className="netflix-row">
                    <h2 className="netflix-row-title">Action</h2>
                    <div className="netflix-row-content">
                      {actionMovies.map((movie) => (
                        <div key={movie._id || movie.id} className="netflix-item" onClick={() => openMovieDetail(movie)}>
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

                {dramaMovies.length > 0 && (
                  <div className="netflix-row">
                    <h2 className="netflix-row-title">Drame</h2>
                    <div className="netflix-row-content">
                      {dramaMovies.map((movie) => (
                        <div key={movie._id || movie.id} className="netflix-item" onClick={() => openMovieDetail(movie)}>
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

                {scifiMovies.length > 0 && (
                  <div className="netflix-row">
                    <h2 className="netflix-row-title">Science Fiction</h2>
                    <div className="netflix-row-content">
                      {scifiMovies.map((movie) => (
                        <div key={movie._id || movie.id} className="netflix-item" onClick={() => openMovieDetail(movie)}>
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

                {availableGenres.map((genre) => {
                  const genreMovies = getMoviesByGenre(genre)
                  if (genreMovies.length > 0) {
                    return (
                      <div key={genre} className="netflix-row">
                        <h2 className="netflix-row-title">{genre}</h2>
                        <div className="netflix-row-content">
                          {genreMovies.map((movie) => (
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
                    )
                  }
                  return null
                })}
              </>
            )}
          </>
        )}
      </main>

      {/* Modal de profil */}
      {isProfileModalOpen && (
        <div className="netflix-profile-modal">
          <div className="netflix-profile-modal-content">
            <span className="netflix-modal-close" onClick={toggleProfileModal}>
              &times;
            </span>
            <div className="netflix-profile-avatar-large">{userAvatar}</div>
            <h2 style={{ textAlign: "center", marginBottom: "20px" }}>Modifier votre profil</h2>
            <form onSubmit={updateProfile}>
              <div className="netflix-form-group">
                <label htmlFor="name">Nom d'utilisateur</label>
                <input type="text" id="name" name="name" className="netflix-input" defaultValue={userName} required />
              </div>
              <button type="submit" className="netflix-button">
                Enregistrer
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
