"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Menu, X, Search, Film, Tv, Plus, Trash2, ChevronDown } from "lucide-react"
import Logo from "@/components/logo"
import "../styles/admin-dashboard.css"

export default function AdminDashboardPage() {
  const router = useRouter()
  const [activeSection, setActiveSection] = useState("usersSection")
  const [users, setUsers] = useState<any[]>([])
  const [movies, setMovies] = useState<any[]>([])
  const [requests, setRequests] = useState<any[]>([])
  const [userSearchTerm, setUserSearchTerm] = useState("")
  const [movieSearchTerm, setMovieSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isHeaderScrolled, setIsHeaderScrolled] = useState(false)
  const [selectedGenres, setSelectedGenres] = useState<string[]>([])
  const [isGenreDropdownOpen, setIsGenreDropdownOpen] = useState(false)

  const availableGenres = [
    "Action",
    "Drame",
    "Science Fiction",
    "Animation",
    "Comédie",
    "Horreur",
    "Thriller",
    "Famille",
    "Aventure",
    "Arts Martiaux",
    "Romance",
    "Fantastique",
  ]

  const [movieFormData, setMovieFormData] = useState({
    title: "",
    type: "film",
    duration: "",
    description: "",
    genre: "",
    releaseYear: new Date().getFullYear().toString(),
    thumbnailUrl: "",
    videoUrl: "",
    episodeCount: "1",
  })
  const [episodes, setEpisodes] = useState<{ url: string; description: string }[]>([])

  // Vérifier l'authentification
  useEffect(() => {
    const token = localStorage.getItem("token")
    const role = localStorage.getItem("role")

    if (!token || role !== "admin") {
      router.push("/")
      return
    }

    // Charger les données initiales
    loadUsers()
    loadMovies()
    loadRequests()

    // Ajouter l'écouteur d'événement pour le défilement
    const handleScroll = () => {
      setIsHeaderScrolled(window.scrollY > 50)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [router])

  // Remplacer les fonctions de chargement de données simulées par des appels API réels
  const loadUsers = async () => {
    setIsLoading(true)
    try {
      const token = localStorage.getItem("token")
      if (!token) throw new Error("No authentication token")

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "/.netlify/functions/api"}/admin/users`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`)
      }

      const data = await response.json()
      setUsers(data)
    } catch (error) {
      console.error("Erreur lors du chargement des utilisateurs:", error)
      alert("Impossible de charger les utilisateurs. Veuillez réessayer.")
    } finally {
      setIsLoading(false)
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
      setMovies(data)
    } catch (error) {
      console.error("Erreur lors du chargement des films:", error)
      alert("Impossible de charger les films et séries. Veuillez réessayer.")
    } finally {
      setIsLoading(false)
    }
  }

  const loadRequests = async () => {
    setIsLoading(true)
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
      alert("Impossible de charger les demandes. Veuillez réessayer.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("role")
    router.push("/")
  }

  const handleSectionChange = (sectionId: string) => {
    setActiveSection(sectionId)
  }

  const handleUserSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUserSearchTerm(e.target.value)
  }

  const handleMovieSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMovieSearchTerm(e.target.value)
  }

  const handleMovieInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setMovieFormData((prev) => ({ ...prev, [name]: value }))

    // Mettre à jour le nombre d'épisodes si le type change
    if (name === "type" && value === "film") {
      setEpisodes([])
    } else if (name === "type" && value === "série") {
      // Initialiser les épisodes si on passe à une série
      const count = Number.parseInt(movieFormData.episodeCount) || 1
      setEpisodes(Array(count).fill({ url: "", description: "" }))
    } else if (name === "episodeCount" && movieFormData.type === "série") {
      const count = Number.parseInt(value) || 1
      setEpisodes((prev) => {
        const newEpisodes = [...prev]
        if (count > prev.length) {
          // Ajouter des épisodes
          for (let i = prev.length; i < count; i++) {
            newEpisodes.push({ url: "", description: "" })
          }
        } else if (count < prev.length) {
          // Supprimer des épisodes
          return newEpisodes.slice(0, count)
        }
        return newEpisodes
      })
    }
  }

  const handleEpisodeChange = (index: number, field: string, value: string) => {
    setEpisodes((prev) => {
      const newEpisodes = [...prev]
      newEpisodes[index] = { ...newEpisodes[index], [field]: value }
      return newEpisodes
    })
  }

  const toggleGenreSelection = (genre: string) => {
    setSelectedGenres((prev) => {
      if (prev.includes(genre)) {
        return prev.filter((g) => g !== genre)
      } else {
        return [...prev, genre]
      }
    })
  }

  // Remplacer la fonction d'ajout de film par un appel API réel
  const handleAddMovie = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Validation
      if (
        !movieFormData.title ||
        !movieFormData.duration ||
        selectedGenres.length === 0 ||
        !movieFormData.thumbnailUrl
      ) {
        throw new Error("Veuillez remplir tous les champs obligatoires")
      }

      if (movieFormData.type === "film" && !movieFormData.videoUrl) {
        throw new Error("Veuillez fournir une URL de vidéo pour le film")
      }

      if (movieFormData.type === "série" && episodes.length === 0) {
        throw new Error("Veuillez ajouter au moins un épisode")
      }

      const token = localStorage.getItem("token")
      if (!token) throw new Error("No authentication token")

      // Préparer les données du film
      const movieData = {
        ...movieFormData,
        genre: selectedGenres,
        episodes: movieFormData.type === "série" ? episodes : [],
      }

      // Envoyer la requête à l'API
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "/.netlify/functions/api"}/movies`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(movieData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Erreur lors de l'ajout du film/série")
      }

      const newMovie = await response.json()

      // Ajouter le nouveau film à la liste
      setMovies((prev) => [newMovie, ...prev])

      // Réinitialiser le formulaire
      setMovieFormData({
        title: "",
        type: "film",
        duration: "",
        description: "",
        genre: "",
        releaseYear: new Date().getFullYear().toString(),
        thumbnailUrl: "",
        videoUrl: "",
        episodeCount: "1",
      })
      setEpisodes([])
      setSelectedGenres([])

      alert("Film/série ajouté avec succès!")
    } catch (error: any) {
      alert(error.message || "Erreur lors de l'ajout du film/série. Veuillez réessayer.")
    } finally {
      setIsLoading(false)
    }
  }

  // Remplacer la fonction de suppression de film par un appel API réel
  const handleDeleteMovie = async (id: string) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer ce film/série ?")) {
      setIsLoading(true)
      try {
        const token = localStorage.getItem("token")
        if (!token) throw new Error("No authentication token")

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "/.netlify/functions/api"}/movies/${id}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (!response.ok) {
          throw new Error("Erreur lors de la suppression")
        }

        // Supprimer le film de la liste
        setMovies((prev) => prev.filter((movie) => movie._id !== id))

        alert("Film/série supprimé avec succès!")
      } catch (error) {
        alert("Erreur lors de la suppression du film/série. Veuillez réessayer.")
      } finally {
        setIsLoading(false)
      }
    }
  }

  // Remplacer la fonction de bannissement d'utilisateur par un appel API réel
  const handleToggleBanUser = async (id: string, ban: boolean) => {
    setIsLoading(true)
    try {
      const token = localStorage.getItem("token")
      if (!token) throw new Error("No authentication token")

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "/.netlify/functions/api"}/admin/users/${id}/ban`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ ban }),
        },
      )

      if (!response.ok) {
        throw new Error("Erreur lors de la mise à jour")
      }

      // Mettre à jour le statut de l'utilisateur dans la liste
      setUsers((prev) => prev.map((user) => (user._id === id ? { ...user, isBanned: ban } : user)))

      alert(`Utilisateur ${ban ? "banni" : "débanni"} avec succès!`)
    } catch (error) {
      alert("Erreur lors de la mise à jour du statut de l'utilisateur. Veuillez réessayer.")
    } finally {
      setIsLoading(false)
    }
  }

  // Remplacer la fonction de suppression d'utilisateur par un appel API réel
  const handleDeleteUser = async (id: string) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer cet utilisateur ?")) {
      setIsLoading(true)
      try {
        const token = localStorage.getItem("token")
        if (!token) throw new Error("No authentication token")

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || "/.netlify/functions/api"}/admin/users/${id}`,
          {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        )

        if (!response.ok) {
          throw new Error("Erreur lors de la suppression")
        }

        // Supprimer l'utilisateur de la liste
        setUsers((prev) => prev.filter((user) => user._id !== id))

        alert("Utilisateur supprimé avec succès!")
      } catch (error) {
        alert("Erreur lors de la suppression de l'utilisateur. Veuillez réessayer.")
      } finally {
        setIsLoading(false)
      }
    }
  }

  // Remplacer les fonctions de gestion des demandes par des appels API réels
  const handleApproveRequest = async (id: string) => {
    setIsLoading(true)
    try {
      const token = localStorage.getItem("token")
      if (!token) throw new Error("No authentication token")

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "/.netlify/functions/api"}/movie-requests/${id}/approve`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      )

      if (!response.ok) {
        throw new Error("Erreur lors de l'approbation")
      }

      // Mettre à jour le statut de la demande dans la liste
      setRequests((prev) => prev.map((request) => (request._id === id ? { ...request, status: "approved" } : request)))

      alert("Demande approuvée avec succès!")
    } catch (error) {
      alert("Erreur lors de l'approbation de la demande. Veuillez réessayer.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleRejectRequest = async (id: string) => {
    setIsLoading(true)
    try {
      const token = localStorage.getItem("token")
      if (!token) throw new Error("No authentication token")

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "/.netlify/functions/api"}/movie-requests/${id}/reject`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ reason: "Rejeté par l'administrateur" }),
        },
      )

      if (!response.ok) {
        throw new Error("Erreur lors du rejet")
      }

      // Mettre à jour le statut de la demande dans la liste
      setRequests((prev) => prev.map((request) => (request._id === id ? { ...request, status: "rejected" } : request)))

      alert("Demande rejetée avec succès!")
    } catch (error) {
      alert("Erreur lors du rejet de la demande. Veuillez réessayer.")
    } finally {
      setIsLoading(false)
    }
  }

  // Filtrer les utilisateurs en fonction du terme de recherche
  const filteredUsers = users.filter(
    (user) =>
      user.username.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(userSearchTerm.toLowerCase()),
  )

  // Filtrer les films en fonction du terme de recherche
  const filteredMovies = movies.filter(
    (movie) =>
      movie.title.toLowerCase().includes(movieSearchTerm.toLowerCase()) ||
      movie.genre.some((g: string) => g.toLowerCase().includes(movieSearchTerm.toLowerCase())),
  )

  return (
    <div className="netflix-container admin-dashboard">
      {/* En-tête Netflix */}
      <header className={`netflix-header ${isHeaderScrolled ? "scrolled" : ""}`}>
        <div className="netflix-header-left">
          <div className="netflix-logo">
            <Logo page="user" width={40} height={40} />
          </div>

          <div className="netflix-nav">
            <ul>
              <li
                className={activeSection === "usersSection" ? "active" : ""}
                onClick={() => handleSectionChange("usersSection")}
              >
                Utilisateurs
              </li>
              <li
                className={activeSection === "moviesSection" ? "active" : ""}
                onClick={() => handleSectionChange("moviesSection")}
              >
                Films et Séries
              </li>
              <li
                className={activeSection === "requestsSection" ? "active" : ""}
                onClick={() => handleSectionChange("requestsSection")}
              >
                Demandes
              </li>
            </ul>
          </div>
        </div>

        <div className="netflix-header-right">
          <div className="netflix-search">
            <input
              type="text"
              placeholder="Rechercher..."
              value={activeSection === "usersSection" ? userSearchTerm : movieSearchTerm}
              onChange={activeSection === "usersSection" ? handleUserSearch : handleMovieSearch}
            />
            <Search size={18} />
          </div>

          <div className="hamburger-menu">
            <button
              className={`hamburger-button ${isMenuOpen ? "active" : ""}`}
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            {isMenuOpen && (
              <div className="dropdown-menu">
                <div className="dropdown-item" onClick={handleLogout}>
                  <span>Déconnexion</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="netflix-main admin-content">
        <h1 className="admin-title">Tableau de Bord Administrateur</h1>

        {/* Section Utilisateurs */}
        <div
          id="usersSection"
          className="admin-section"
          style={{ display: activeSection === "usersSection" ? "block" : "none" }}
        >
          <div className="section-header">
            <h2>Gestion des Utilisateurs</h2>
            <span className="badge">{users.length} utilisateurs</span>
          </div>

          <div className="admin-card">
            {isLoading ? (
              <div className="netflix-loading">
                <div className="netflix-spinner"></div>
              </div>
            ) : filteredUsers.length > 0 ? (
              <div className="admin-table-container">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Nom d'utilisateur</th>
                      <th>Email</th>
                      <th>Statut</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((user) => (
                      <tr key={user.id}>
                        <td>{user.username}</td>
                        <td>{user.email}</td>
                        <td>
                          <span className={`status-badge ${user.isBanned ? "banned" : "active"}`}>
                            {user.isBanned ? "Banni" : "Actif"}
                          </span>
                        </td>
                        <td className="actions-cell">
                          <button
                            onClick={() => handleToggleBanUser(user.id, !user.isBanned)}
                            className={`admin-btn ${user.isBanned ? "btn-success" : "btn-warning"}`}
                          >
                            {user.isBanned ? "Débannir" : "Bannir"}
                          </button>
                          <button onClick={() => handleDeleteUser(user.id)} className="admin-btn btn-danger">
                            <Trash2 size={16} />
                            Supprimer
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="empty-state">
                <p>Aucun utilisateur trouvé</p>
              </div>
            )}
          </div>
        </div>

        {/* Section Films et Séries */}
        <div
          id="moviesSection"
          className="admin-section"
          style={{ display: activeSection === "moviesSection" ? "block" : "none" }}
        >
          <div className="section-header">
            <h2>Films et Séries</h2>
            <span className="badge">{movies.length} contenus</span>
          </div>

          {/* Formulaire pour ajouter un nouveau film ou une nouvelle série */}
          <div className="admin-card">
            <h3 className="card-title">
              <Plus size={18} className="icon" />
              Ajouter un Nouveau Film ou une Nouvelle Série
            </h3>

            <form className="admin-form" onSubmit={handleAddMovie}>
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="title">Titre</label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={movieFormData.title}
                    onChange={handleMovieInputChange}
                    required
                    className="admin-input"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="type">Type</label>
                  <select
                    id="type"
                    name="type"
                    value={movieFormData.type}
                    onChange={handleMovieInputChange}
                    className="admin-select"
                  >
                    <option value="film">Film</option>
                    <option value="série">Série</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="duration">Durée</label>
                  <input
                    type="text"
                    id="duration"
                    name="duration"
                    value={movieFormData.duration}
                    onChange={handleMovieInputChange}
                    placeholder="ex: 2h 30min ou 5 saisons"
                    required
                    className="admin-input"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="releaseYear">Année de Sortie</label>
                  <input
                    type="number"
                    id="releaseYear"
                    name="releaseYear"
                    value={movieFormData.releaseYear}
                    onChange={handleMovieInputChange}
                    required
                    className="admin-input"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Genres (sélectionnez un ou plusieurs)</label>
                <div className="genre-dropdown">
                  <div className="genre-dropdown-header" onClick={() => setIsGenreDropdownOpen(!isGenreDropdownOpen)}>
                    <div className="selected-genres">
                      {selectedGenres.length > 0 ? selectedGenres.join(", ") : "Sélectionnez des genres"}
                    </div>
                    <ChevronDown size={18} className={`dropdown-icon ${isGenreDropdownOpen ? "open" : ""}`} />
                  </div>

                  {isGenreDropdownOpen && (
                    <div className="genre-dropdown-content">
                      {availableGenres.map((genre) => (
                        <div
                          key={genre}
                          className={`genre-option ${selectedGenres.includes(genre) ? "selected" : ""}`}
                          onClick={() => toggleGenreSelection(genre)}
                        >
                          <input
                            type="checkbox"
                            id={`genre-${genre}`}
                            checked={selectedGenres.includes(genre)}
                            onChange={() => {}}
                          />
                          <label htmlFor={`genre-${genre}`}>{genre}</label>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="thumbnailUrl">URL de la Miniature</label>
                <input
                  type="url"
                  id="thumbnailUrl"
                  name="thumbnailUrl"
                  value={movieFormData.thumbnailUrl}
                  onChange={handleMovieInputChange}
                  placeholder="https://example.com/image.jpg"
                  required
                  className="admin-input"
                />
              </div>

              <div className="form-group">
                <label htmlFor="description">Description</label>
                <textarea
                  id="description"
                  name="description"
                  value={movieFormData.description}
                  onChange={handleMovieInputChange}
                  rows={3}
                  required
                  className="admin-textarea"
                ></textarea>
              </div>

              {movieFormData.type === "film" ? (
                <div className="form-group">
                  <label htmlFor="videoUrl">URL de la Vidéo</label>
                  <input
                    type="url"
                    id="videoUrl"
                    name="videoUrl"
                    value={movieFormData.videoUrl}
                    onChange={handleMovieInputChange}
                    placeholder="https://example.com/video.mp4"
                    required
                    className="admin-input"
                  />
                </div>
              ) : (
                <div className="form-group">
                  <label htmlFor="episodeCount">Nombre d'épisodes</label>
                  <input
                    type="number"
                    id="episodeCount"
                    name="episodeCount"
                    min="1"
                    value={movieFormData.episodeCount}
                    onChange={handleMovieInputChange}
                    required
                    className="admin-input"
                  />

                  <div className="episodes-container">
                    {episodes.map((episode, index) => (
                      <div key={index} className="episode-card">
                        <h4>Épisode {index + 1}</h4>

                        <div className="form-group">
                          <label htmlFor={`episodeUrl${index}`}>URL de l'épisode</label>
                          <input
                            type="url"
                            id={`episodeUrl${index}`}
                            value={episode.url}
                            onChange={(e) => handleEpisodeChange(index, "url", e.target.value)}
                            placeholder="https://example.com/episode.mp4"
                            required
                            className="admin-input"
                          />
                        </div>

                        <div className="form-group">
                          <label htmlFor={`episodeDescription${index}`}>Description</label>
                          <textarea
                            id={`episodeDescription${index}`}
                            value={episode.description}
                            onChange={(e) => handleEpisodeChange(index, "description", e.target.value)}
                            rows={2}
                            required
                            className="admin-textarea"
                          ></textarea>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <button type="submit" className="admin-btn btn-primary" disabled={isLoading}>
                <Plus size={18} className="icon" />
                {isLoading ? "Ajout en cours..." : `Ajouter ${movieFormData.type === "film" ? "le Film" : "la Série"}`}
              </button>
            </form>
          </div>

          {/* Liste de films et séries */}
          <div className="admin-card">
            <h3 className="card-title">
              <Film size={18} className="icon" />
              Liste des Films et Séries
            </h3>

            {isLoading ? (
              <div className="netflix-loading">
                <div className="netflix-spinner"></div>
              </div>
            ) : filteredMovies.length > 0 ? (
              <div className="admin-table-container">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Titre</th>
                      <th>Type</th>
                      <th>Genre</th>
                      <th>Durée</th>
                      <th>Année</th>
                      <th>Épisodes</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredMovies.map((movie) => (
                      <tr key={movie.id}>
                        <td>{movie.title}</td>
                        <td>
                          <span className={`type-badge ${movie.type === "film" ? "film" : "serie"}`}>
                            {movie.type === "film" ? <Film size={14} /> : <Tv size={14} />}
                            {movie.type}
                          </span>
                        </td>
                        <td>
                          <div className="genre-tags">
                            {Array.isArray(movie.genre)
                              ? movie.genre.map((genre: string, index: number) => (
                                  <span key={index} className="genre-tag">
                                    {genre}
                                  </span>
                                ))
                              : movie.genre}
                          </div>
                        </td>
                        <td>{movie.duration}</td>
                        <td>{movie.releaseYear}</td>
                        <td>{movie.type === "série" ? (movie.episodes ? movie.episodes.length : "N/A") : "N/A"}</td>
                        <td className="actions-cell">
                          <button onClick={() => handleDeleteMovie(movie.id)} className="admin-btn btn-danger">
                            <Trash2 size={16} />
                            Supprimer
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="empty-state">
                <p>Aucun film ou série trouvé</p>
              </div>
            )}
          </div>
        </div>

        {/* Section Demandes */}
        <div
          id="requestsSection"
          className="admin-section"
          style={{ display: activeSection === "requestsSection" ? "block" : "none" }}
        >
          <div className="section-header">
            <h2>Demandes de Films</h2>
            <span className="badge">{requests.length} demandes</span>
          </div>

          <div className="admin-card">
            {isLoading ? (
              <div className="netflix-loading">
                <div className="netflix-spinner"></div>
              </div>
            ) : requests.length > 0 ? (
              <div className="admin-table-container">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Titre</th>
                      <th>Lien IMDB</th>
                      <th>Utilisateur</th>
                      <th>Commentaire</th>
                      <th>Statut</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {requests.map((request) => (
                      <tr key={request.id} data-request-id={request.id}>
                        <td>{request.title}</td>
                        <td>
                          <a href={request.imdbLink} target="_blank" rel="noopener noreferrer" className="imdb-link">
                            Voir sur IMDB
                          </a>
                        </td>
                        <td>{request.userId}</td>
                        <td>{request.comment || "N/A"}</td>
                        <td>
                          <span className={`status-badge ${request.status}`}>
                            {request.status === "pending"
                              ? "En attente"
                              : request.status === "approved"
                                ? "Approuvé"
                                : "Rejeté"}
                          </span>
                        </td>
                        <td className="actions-cell">
                          {request.status === "pending" && (
                            <>
                              <button
                                onClick={() => handleApproveRequest(request.id)}
                                className="admin-btn btn-success"
                              >
                                Approuver
                              </button>
                              <button onClick={() => handleRejectRequest(request.id)} className="admin-btn btn-danger">
                                Rejeter
                              </button>
                            </>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="empty-state">
                <p>Aucune demande trouvée</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
