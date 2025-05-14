"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import "../styles/stylesA.css"

export default function AdminDashboardPage() {
  const router = useRouter()
  const [activeSection, setActiveSection] = useState("usersSection")
  const [users, setUsers] = useState<any[]>([])
  const [movies, setMovies] = useState<any[]>([])
  const [requests, setRequests] = useState<any[]>([])
  const [userSearchTerm, setUserSearchTerm] = useState("")
  const [movieSearchTerm, setMovieSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(true)
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
  }, [router])

  const loadUsers = async () => {
    setIsLoading(true)
    try {
      // Simuler le chargement des utilisateurs depuis une API
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Données fictives pour la démo
      const mockUsers = [
        {
          id: 1,
          username: "user1",
          email: "user1@example.com",
          isBanned: false,
          createdAt: "2023-01-15",
        },
        {
          id: 2,
          username: "user2",
          email: "user2@example.com",
          isBanned: true,
          createdAt: "2023-02-20",
        },
        {
          id: 3,
          username: "user3",
          email: "user3@example.com",
          isBanned: false,
          createdAt: "2023-03-10",
        },
      ]

      setUsers(mockUsers)
    } catch (error) {
      console.error("Erreur lors du chargement des utilisateurs:", error)
    } finally {
      setIsLoading(false)
    }
  }

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
          episodes: [],
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
            { title: "Épisode 1", description: "Le début de l'histoire de Walter White" },
            { title: "Épisode 2", description: "Walter et Jesse commencent leur partenariat" },
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
          episodes: [],
        },
      ]

      setMovies(mockMovies)
    } catch (error) {
      console.error("Erreur lors du chargement des films:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const loadRequests = async () => {
    setIsLoading(true)
    try {
      // Simuler le chargement des demandes depuis une API
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Données fictives pour la démo
      const mockRequests = [
        {
          id: 1,
          title: "The Mandalorian",
          imdbLink: "https://www.imdb.com/title/tt8111088/",
          comment: "J'aimerais beaucoup voir cette série Star Wars",
          userId: "user1",
          status: "pending",
          createdAt: "2023-05-15",
        },
        {
          id: 2,
          title: "Dune: Part Two",
          imdbLink: "https://www.imdb.com/title/tt15239678/",
          comment: "La suite de Dune qui vient de sortir",
          userId: "user2",
          status: "approved",
          createdAt: "2023-06-20",
        },
      ]

      setRequests(mockRequests)
    } catch (error) {
      console.error("Erreur lors du chargement des demandes:", error)
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
        // Supprimer des épisodes
        return newEpisodes.slice(0, count)
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

  const handleAddMovie = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Validation
      if (!movieFormData.title || !movieFormData.duration || !movieFormData.genre || !movieFormData.thumbnailUrl) {
        throw new Error("Veuillez remplir tous les champs obligatoires")
      }

      if (movieFormData.type === "film" && !movieFormData.videoUrl) {
        throw new Error("Veuillez fournir une URL de vidéo pour le film")
      }

      if (movieFormData.type === "série" && episodes.length === 0) {
        throw new Error("Veuillez ajouter au moins un épisode")
      }

      // Simuler l'ajout du film à une API
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Créer un nouveau film fictif
      const newMovie = {
        id: Date.now(),
        ...movieFormData,
        episodes: movieFormData.type === "série" ? episodes : [],
      }

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

      alert("Film/série ajouté avec succès!")
    } catch (error: any) {
      alert(error.message || "Erreur lors de l'ajout du film/série. Veuillez réessayer.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteMovie = async (id: number) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer ce film/série ?")) {
      setIsLoading(true)
      try {
        // Simuler la suppression du film d'une API
        await new Promise((resolve) => setTimeout(resolve, 1000))

        // Supprimer le film de la liste
        setMovies((prev) => prev.filter((movie) => movie.id !== id))

        alert("Film/série supprimé avec succès!")
      } catch (error) {
        alert("Erreur lors de la suppression du film/série. Veuillez réessayer.")
      } finally {
        setIsLoading(false)
      }
    }
  }

  const handleToggleBanUser = async (id: number, ban: boolean) => {
    setIsLoading(true)
    try {
      // Simuler la mise à jour du statut de l'utilisateur dans une API
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Mettre à jour le statut de l'utilisateur dans la liste
      setUsers((prev) => prev.map((user) => (user.id === id ? { ...user, isBanned: ban } : user)))

      alert(`Utilisateur ${ban ? "banni" : "débanni"} avec succès!`)
    } catch (error) {
      alert("Erreur lors de la mise à jour du statut de l'utilisateur. Veuillez réessayer.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteUser = async (id: number) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer cet utilisateur ?")) {
      setIsLoading(true)
      try {
        // Simuler la suppression de l'utilisateur d'une API
        await new Promise((resolve) => setTimeout(resolve, 1000))

        // Supprimer l'utilisateur de la liste
        setUsers((prev) => prev.filter((user) => user.id !== id))

        alert("Utilisateur supprimé avec succès!")
      } catch (error) {
        alert("Erreur lors de la suppression de l'utilisateur. Veuillez réessayer.")
      } finally {
        setIsLoading(false)
      }
    }
  }

  const handleApproveRequest = async (id: number) => {
    setIsLoading(true)
    try {
      // Simuler l'approbation de la demande dans une API
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Mettre à jour le statut de la demande dans la liste
      setRequests((prev) => prev.map((request) => (request.id === id ? { ...request, status: "approved" } : request)))

      alert("Demande approuvée avec succès!")
    } catch (error) {
      alert("Erreur lors de l'approbation de la demande. Veuillez réessayer.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleRejectRequest = async (id: number) => {
    setIsLoading(true)
    try {
      // Simuler le rejet de la demande dans une API
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Mettre à jour le statut de la demande dans la liste
      setRequests((prev) => prev.map((request) => (request.id === id ? { ...request, status: "rejected" } : request)))

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
      movie.genre.toLowerCase().includes(movieSearchTerm.toLowerCase()),
  )

  return (
    <div className="dashboard">
      <button className="iconL-button" id="logoutButton" onClick={handleLogout}>
        <span className="icon-svg">🚪</span>
      </button>
      <h1>Tableau de Bord Administrateur</h1>

      <div className="nav-buttons">
        <button
          className={`nav-button ${activeSection === "usersSection" ? "active" : ""}`}
          onClick={() => handleSectionChange("usersSection")}
        >
          Utilisateurs
        </button>
        <button
          className={`nav-button ${activeSection === "moviesSection" ? "active" : ""}`}
          onClick={() => handleSectionChange("moviesSection")}
        >
          Films et Séries
        </button>
        <button
          className={`nav-button ${activeSection === "requestsSection" ? "active" : ""}`}
          onClick={() => handleSectionChange("requestsSection")}
        >
          Demandes
        </button>
      </div>

      {/* Section Utilisateurs */}
      <div
        id="usersSection"
        className="section"
        style={{ display: activeSection === "usersSection" ? "block" : "none" }}
      >
        <h2>Gestion des Utilisateurs</h2>
        <input
          type="text"
          id="userSearchInput"
          placeholder="Rechercher un utilisateur..."
          value={userSearchTerm}
          onChange={handleUserSearch}
        />
        <table id="userTable">
          <thead>
            <tr>
              <th>Nom d'utilisateur</th>
              <th>Email</th>
              <th>Statut</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={4}>Chargement des utilisateurs...</td>
              </tr>
            ) : filteredUsers.length > 0 ? (
              filteredUsers.map((user) => (
                <tr key={user.id}>
                  <td>{user.username}</td>
                  <td>{user.email}</td>
                  <td>{user.isBanned ? "Banni" : "Actif"}</td>
                  <td>
                    <button onClick={() => handleToggleBanUser(user.id, !user.isBanned)} className="btn-action">
                      {user.isBanned ? "Débannir" : "Bannir"}
                    </button>
                    <button onClick={() => handleDeleteUser(user.id)} className="btn-action btn-delete">
                      Supprimer
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4}>Aucun utilisateur trouvé</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Section Films et Séries */}
      <div
        id="moviesSection"
        className="section"
        style={{ display: activeSection === "moviesSection" ? "block" : "none" }}
      >
        <h2>Films et Séries</h2>
        <input
          type="text"
          id="movieSearchInput"
          placeholder="Rechercher un film ou une série..."
          value={movieSearchTerm}
          onChange={handleMovieSearch}
        />

        {/* Formulaire pour ajouter un nouveau film ou une nouvelle série */}
        <div className="card">
          <h3>Ajouter un Nouveau Film ou une Nouvelle Série</h3>
          <form id="addMovieForm" onSubmit={handleAddMovie}>
            <label htmlFor="title">Titre</label>
            <input
              type="text"
              id="title"
              name="title"
              value={movieFormData.title}
              onChange={handleMovieInputChange}
              required
            />

            <label htmlFor="type">Type</label>
            <select id="type" name="type" value={movieFormData.type} onChange={handleMovieInputChange}>
              <option value="film">Film</option>
              <option value="série">Série</option>
            </select>

            <label htmlFor="duration">Durée</label>
            <input
              type="text"
              id="duration"
              name="duration"
              value={movieFormData.duration}
              onChange={handleMovieInputChange}
              required
            />

            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={movieFormData.description}
              onChange={handleMovieInputChange}
              required
            ></textarea>

            <label htmlFor="genre">Genre</label>
            <input
              type="text"
              id="genre"
              name="genre"
              value={movieFormData.genre}
              onChange={handleMovieInputChange}
              required
            />

            <label htmlFor="releaseYear">Année de Sortie</label>
            <input
              type="number"
              id="releaseYear"
              name="releaseYear"
              value={movieFormData.releaseYear}
              onChange={handleMovieInputChange}
              required
            />

            <label htmlFor="thumbnailUrl">URL de la Miniature</label>
            <input
              type="url"
              id="thumbnailUrl"
              name="thumbnailUrl"
              value={movieFormData.thumbnailUrl}
              onChange={handleMovieInputChange}
              required
            />

            <div id="filmFields" style={{ display: movieFormData.type === "film" ? "block" : "none" }}>
              <label htmlFor="videoUrl">URL de la Vidéo</label>
              <input
                type="url"
                id="videoUrl"
                name="videoUrl"
                value={movieFormData.videoUrl}
                onChange={handleMovieInputChange}
              />
            </div>

            <div id="serieFields" style={{ display: movieFormData.type === "série" ? "block" : "none" }}>
              <label htmlFor="episodeCount">Nombre d'épisodes</label>
              <input
                type="number"
                id="episodeCount"
                name="episodeCount"
                min="1"
                value={movieFormData.episodeCount}
                onChange={handleMovieInputChange}
              />
              <div id="episodesContainer">
                {episodes.map((episode, index) => (
                  <div key={index} className="episode-fields">
                    <h4>Épisode {index + 1}</h4>
                    <label htmlFor={`episodeUrl${index}`}>URL de l'épisode {index + 1}</label>
                    <input
                      type="url"
                      id={`episodeUrl${index}`}
                      value={episode.url}
                      onChange={(e) => handleEpisodeChange(index, "url", e.target.value)}
                      required
                    />
                    <label htmlFor={`episodeDescription${index}`}>Description de l'épisode {index + 1}</label>
                    <textarea
                      id={`episodeDescription${index}`}
                      value={episode.description}
                      onChange={(e) => handleEpisodeChange(index, "description", e.target.value)}
                      required
                    ></textarea>
                  </div>
                ))}
              </div>
            </div>

            <button type="submit" disabled={isLoading}>
              {isLoading ? "Ajout en cours..." : "Ajouter"}
            </button>
          </form>
        </div>

        {/* Liste de films et séries */}
        <div className="card">
          <h3>Liste des Films et Séries</h3>
          <table id="movieTable">
            <thead>
              <tr>
                <th>Titre</th>
                <th>Type</th>
                <th>Genre</th>
                <th>Durée</th>
                <th>Année de Sortie</th>
                <th>Épisodes</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody id="movieTableBody">
              {isLoading ? (
                <tr>
                  <td colSpan={7}>Chargement des films et séries...</td>
                </tr>
              ) : filteredMovies.length > 0 ? (
                filteredMovies.map((movie) => (
                  <tr key={movie.id}>
                    <td>{movie.title}</td>
                    <td>{movie.type}</td>
                    <td>{movie.genre}</td>
                    <td>{movie.duration}</td>
                    <td>{movie.releaseYear}</td>
                    <td>{movie.type === "série" ? (movie.episodes ? movie.episodes.length : "N/A") : "N/A"}</td>
                    <td>
                      <button onClick={() => handleDeleteMovie(movie.id)} className="delete-btn">
                        Supprimer
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7}>Aucun film ou série trouvé</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Section Demandes */}
      <div
        id="requestsSection"
        className="section"
        style={{ display: activeSection === "requestsSection" ? "block" : "none" }}
      >
        <h2>Demandes de Films</h2>
        <table id="requestTable">
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
          <tbody id="requestTableBody">
            {isLoading ? (
              <tr>
                <td colSpan={6}>Chargement des demandes...</td>
              </tr>
            ) : requests.length > 0 ? (
              requests.map((request) => (
                <tr key={request.id} data-request-id={request.id}>
                  <td>{request.title}</td>
                  <td>
                    <a href={request.imdbLink} target="_blank" rel="noopener noreferrer">
                      {request.imdbLink}
                    </a>
                  </td>
                  <td>{request.userId}</td>
                  <td>{request.comment || "N/A"}</td>
                  <td>{request.status}</td>
                  <td>
                    {request.status === "pending" && (
                      <>
                        <button onClick={() => handleApproveRequest(request.id)} className="approve-btn">
                          Approuver
                        </button>
                        <button onClick={() => handleRejectRequest(request.id)} className="reject-btn">
                          Rejeter
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6}>Aucune demande trouvée</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
