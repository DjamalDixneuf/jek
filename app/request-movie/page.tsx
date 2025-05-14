"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import "../styles/stylesA.css"

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

  // Vérifier l'authentification
  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) {
      router.push("/")
      return
    }

    // Charger les données
    loadRequests()
    loadAvailableMovies()
  }, [router])

  const loadRequests = async () => {
    setIsLoading((prev) => ({ ...prev, requests: true }))
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
          status: "pending",
          createdAt: "2023-05-15",
        },
        {
          id: 2,
          title: "Dune: Part Two",
          imdbLink: "https://www.imdb.com/title/tt15239678/",
          comment: "La suite de Dune qui vient de sortir",
          status: "approved",
          createdAt: "2023-06-20",
        },
      ]

      setRequests(mockRequests)
    } catch (error) {
      console.error("Erreur lors du chargement des demandes:", error)
    } finally {
      setIsLoading((prev) => ({ ...prev, requests: false }))
    }
  }

  const loadAvailableMovies = async () => {
    setIsLoading((prev) => ({ ...prev, movies: true }))
    try {
      // Simuler le chargement des films disponibles depuis une API
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Données fictives pour la démo
      const mockMovies = [
        {
          id: 1,
          title: "Inception",
          genre: "Science Fiction, Action",
          duration: "2h 28min",
          releaseYear: "2010",
          thumbnailUrl: "/placeholder.svg?height=260&width=180",
        },
        {
          id: 3,
          title: "The Dark Knight",
          genre: "Action, Crime, Drame",
          duration: "2h 32min",
          releaseYear: "2008",
          thumbnailUrl: "/placeholder.svg?height=260&width=180",
        },
        {
          id: 5,
          title: "Interstellar",
          genre: "Aventure, Drame, Science Fiction",
          duration: "2h 49min",
          releaseYear: "2014",
          thumbnailUrl: "/placeholder.svg?height=260&width=180",
        },
      ]

      setAvailableMovies(mockMovies)
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

      // Simuler l'envoi de la demande à une API
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Créer une nouvelle demande fictive
      const newRequest = {
        id: Date.now(),
        ...formData,
        status: "pending",
        createdAt: new Date().toISOString().split("T")[0],
      }

      // Ajouter la nouvelle demande à la liste
      setRequests((prev) => [newRequest, ...prev])

      // Réinitialiser le formulaire
      setFormData({
        title: "",
        imdbLink: "",
        comment: "",
      })

      alert("Votre demande a été enregistrée avec succès!")
    } catch (error: any) {
      alert(error.message || "Erreur lors de l'enregistrement de la demande. Veuillez réessayer.")
    } finally {
      setIsLoading((prev) => ({ ...prev, submit: false }))
    }
  }

  return (
    <div className="bg-gray-900 text-white">
      <button
        className="return-button"
        onClick={() => router.push("/user-page")}
        style={{
          position: "absolute",
          top: "20px",
          left: "20px",
          padding: "10px 20px",
          border: "none",
          borderRadius: "4px",
          cursor: "pointer",
          backgroundColor: "#1a73e8",
          color: "white",
          fontWeight: "bold",
        }}
      >
        Retour
      </button>

      <div
        className="container"
        style={{
          maxWidth: "800px",
          margin: "50px auto",
          padding: "30px",
          backgroundColor: "#12141c",
          borderRadius: "10px",
          boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
        }}
      >
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

        <h1
          style={{
            color: "#1a73e8",
            textAlign: "center",
            marginBottom: "30px",
            fontSize: "24px",
            fontWeight: "bold",
          }}
        >
          Demander un film/série
        </h1>

        <form
          id="requestForm"
          onSubmit={handleSubmit}
          style={{
            display: "flex",
            flexDirection: "column",
          }}
        >
          <label
            htmlFor="title"
            style={{
              marginBottom: "5px",
              color: "#1a73e8",
            }}
          >
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
              padding: "10px",
              marginBottom: "20px",
              border: "none",
              borderRadius: "5px",
              backgroundColor: "#1a1d28",
              color: "white",
            }}
            disabled={isLoading.submit}
          />

          <label
            htmlFor="imdbLink"
            style={{
              marginBottom: "5px",
              color: "#1a73e8",
            }}
          >
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
              padding: "10px",
              marginBottom: "20px",
              border: "none",
              borderRadius: "5px",
              backgroundColor: "#1a1d28",
              color: "white",
            }}
            disabled={isLoading.submit}
          />

          <label
            htmlFor="comment"
            style={{
              marginBottom: "5px",
              color: "#1a73e8",
            }}
          >
            Commentaire (optionnel)
          </label>
          <textarea
            id="comment"
            name="comment"
            rows={4}
            value={formData.comment}
            onChange={handleInputChange}
            style={{
              padding: "10px",
              marginBottom: "20px",
              border: "none",
              borderRadius: "5px",
              backgroundColor: "#1a1d28",
              color: "white",
              resize: "vertical",
            }}
            disabled={isLoading.submit}
          ></textarea>

          <button
            type="submit"
            style={{
              padding: "12px",
              backgroundColor: "#1a73e8",
              color: "white",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
              fontSize: "16px",
              fontWeight: "bold",
              transition: "background-color 0.3s ease",
            }}
            disabled={isLoading.submit}
          >
            {isLoading.submit ? "Envoi en cours..." : "Envoyer la demande"}
          </button>
        </form>

        <div
          id="loadingIndicator"
          style={{
            display: isLoading.requests ? "block" : "none",
            textAlign: "center",
            fontSize: "18px",
            color: "#1a73e8",
            marginTop: "20px",
          }}
        >
          Chargement...
        </div>

        <div
          id="requestsList"
          style={{
            marginTop: "30px",
            backgroundColor: "#1a1d28",
            padding: "20px",
            borderRadius: "5px",
          }}
        >
          <h2
            style={{
              color: "#1a73e8",
              marginBottom: "20px",
              fontSize: "20px",
              fontWeight: "bold",
            }}
          >
            Demandes en cours
          </h2>
          {!isLoading.requests && requests.length === 0 ? (
            <p style={{ textAlign: "center", color: "#aaa" }}>Aucune demande en cours.</p>
          ) : (
            <ul
              className="request-list"
              style={{
                listStyle: "none",
                padding: 0,
              }}
            >
              {requests.map((request) => (
                <li
                  key={request.id}
                  style={{
                    marginBottom: "15px",
                    paddingBottom: "15px",
                    borderBottom: "1px solid #1a73e8",
                  }}
                >
                  <h3 style={{ fontWeight: "bold", marginBottom: "5px" }}>{request.title}</h3>
                  <p style={{ marginBottom: "5px" }}>
                    IMDB:{" "}
                    <a href={request.imdbLink} target="_blank" rel="noopener noreferrer" style={{ color: "#1a73e8" }}>
                      {request.imdbLink}
                    </a>
                  </p>
                  {request.comment && <p style={{ marginBottom: "5px" }}>Commentaire: {request.comment}</p>}
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginTop: "10px",
                    }}
                  >
                    <span style={{ fontSize: "0.8rem", color: "#aaa" }}>Demandé le: {request.createdAt}</span>
                    <span
                      style={{
                        padding: "3px 8px",
                        borderRadius: "10px",
                        fontSize: "0.8rem",
                        backgroundColor: request.status === "approved" ? "#4ecca3" : "#1a73e8",
                        color: "white",
                      }}
                    >
                      {request.status === "approved" ? "Approuvé" : "En attente"}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div
          id="moviesList"
          style={{
            marginTop: "30px",
            backgroundColor: "#1a1d28",
            padding: "20px",
            borderRadius: "5px",
          }}
        >
          <h2
            style={{
              color: "#1a73e8",
              marginBottom: "20px",
              fontSize: "20px",
              fontWeight: "bold",
            }}
          >
            Films disponibles
          </h2>
          {isLoading.movies ? (
            <div style={{ textAlign: "center", padding: "20px" }}>Chargement des films...</div>
          ) : availableMovies.length === 0 ? (
            <p style={{ textAlign: "center", color: "#aaa" }}>Aucun film disponible pour le moment.</p>
          ) : (
            <ul
              className="movie-list"
              style={{
                listStyle: "none",
                padding: 0,
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
                gap: "20px",
              }}
            >
              {availableMovies.map((movie) => (
                <li
                  key={movie.id}
                  style={{
                    backgroundColor: "#2d3748",
                    borderRadius: "8px",
                    overflow: "hidden",
                    transition: "transform 0.3s",
                  }}
                  className="movie-item"
                >
                  <div style={{ position: "relative", width: "100%", paddingBottom: "150%" }}>
                    <Image
                      src={movie.thumbnailUrl || "/placeholder.svg"}
                      alt={movie.title}
                      fill
                      style={{ objectFit: "cover" }}
                    />
                  </div>
                  <div style={{ padding: "10px" }}>
                    <h3 style={{ fontWeight: "bold", marginBottom: "5px" }}>{movie.title}</h3>
                    <p style={{ fontSize: "0.8rem", color: "#aaa", marginBottom: "3px" }}>Genre: {movie.genre}</p>
                    <p style={{ fontSize: "0.8rem", color: "#aaa", marginBottom: "3px" }}>Durée: {movie.duration}</p>
                    <p style={{ fontSize: "0.8rem", color: "#aaa" }}>Année: {movie.releaseYear}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}
