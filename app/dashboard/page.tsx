"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"

export default function DashboardPage() {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedMovie, setSelectedMovie] = useState<any>(null)
  const [selectedEpisode, setSelectedEpisode] = useState(0)

  // Données fictives pour la démo
  const movies = [
    {
      id: 1,
      title: "Inception",
      type: "film",
      duration: "2h 28min",
      genre: "Science Fiction, Action",
      releaseYear: "2010",
      thumbnailUrl: "/placeholder.svg?height=390&width=260",
      description:
        "Un voleur qui s'infiltre dans les rêves des autres pour voler leurs secrets se voit offrir une chance de retrouver sa vie normale.",
    },
    {
      id: 2,
      title: "Breaking Bad",
      type: "série",
      duration: "5 saisons",
      genre: "Drame, Crime",
      releaseYear: "2008",
      thumbnailUrl: "/placeholder.svg?height=390&width=260",
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
      thumbnailUrl: "/placeholder.svg?height=390&width=260",
      description:
        "Batman s'allie au procureur Harvey Dent pour démanteler le crime organisé à Gotham, mais ils se retrouvent bientôt face au Joker.",
    },
    {
      id: 4,
      title: "Stranger Things",
      type: "série",
      duration: "4 saisons",
      genre: "Drame, Fantastique, Horreur",
      releaseYear: "2016",
      thumbnailUrl: "/placeholder.svg?height=390&width=260",
      episodes: [
        { title: "Épisode 1", description: "La disparition de Will Byers" },
        { title: "Épisode 2", description: "La recherche commence" },
      ],
    },
    {
      id: 5,
      title: "Interstellar",
      type: "film",
      duration: "2h 49min",
      genre: "Aventure, Drame, Science Fiction",
      releaseYear: "2014",
      thumbnailUrl: "/placeholder.svg?height=390&width=260",
      description:
        "Une équipe d'explorateurs voyage à travers un trou de ver dans l'espace pour assurer la survie de l'humanité.",
    },
    {
      id: 6,
      title: "Game of Thrones",
      type: "série",
      duration: "8 saisons",
      genre: "Action, Aventure, Drame",
      releaseYear: "2011",
      thumbnailUrl: "/placeholder.svg?height=390&width=260",
      episodes: [
        { title: "Épisode 1", description: "L'hiver vient" },
        { title: "Épisode 2", description: "La route royale" },
      ],
    },
  ]

  const filteredMovies = searchTerm
    ? movies.filter(
        (movie) =>
          movie.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          movie.genre.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    : movies

  const handleLogout = () => {
    router.push("/")
  }

  const openMovieModal = (movie: any) => {
    setSelectedMovie(movie)
    setSelectedEpisode(0)
  }

  const closeMovieModal = () => {
    setSelectedMovie(null)
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background-light/80 backdrop-blur-md border-b border-white/10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                <span className="text-white font-bold">J</span>
              </div>
              <h1 className="text-xl font-bold text-white hidden md:block">Jekle Entertainment</h1>
            </div>

            <div className="hidden md:flex items-center space-x-4 flex-1 max-w-md mx-4">
              <div className="relative w-full">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg
                    className="h-5 w-5 text-text-muted"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <input
                  type="search"
                  className="block w-full pl-10 pr-3 py-2 bg-background border border-white/10 rounded-lg text-white focus:ring-2 focus:ring-primary/50 focus:border-primary/50"
                  placeholder="Rechercher un film ou une série..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Link
                href="/requests"
                className="px-4 py-2 bg-secondary text-white rounded-lg hover:bg-secondary-dark transition-colors hidden md:block"
              >
                Demander un film
              </Link>
              <button
                onClick={handleLogout}
                className="p-2 text-white rounded-lg hover:bg-white/10 transition-colors"
                title="Déconnexion"
              >
                <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path
                    fillRule="evenodd"
                    d="M3 3a1 1 0 00-1 1v12a1 1 0 001 1h12a1 1 0 001-1V4a1 1 0 00-1-1H3zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Search */}
      <div className="md:hidden container mx-auto px-4 py-4">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg
              className="h-5 w-5 text-text-muted"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <input
            type="search"
            className="block w-full pl-10 pr-3 py-2 bg-background-light border border-white/10 rounded-lg text-white focus:ring-2 focus:ring-primary/50 focus:border-primary/50"
            placeholder="Rechercher un film ou une série..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold text-white mb-6">Films et Séries disponibles</h2>

        {filteredMovies.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
            {filteredMovies.map((movie) => (
              <div key={movie.id} className="movie-card group cursor-pointer" onClick={() => openMovieModal(movie)}>
                <div className="relative aspect-[2/3] rounded-lg overflow-hidden">
                  <Image
                    src={movie.thumbnailUrl || "/placeholder.svg"}
                    alt={movie.title}
                    fill
                    className="object-cover transition-transform group-hover:scale-105"
                    sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 16vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4">
                    <h3 className="text-lg font-bold text-white mb-1">{movie.title}</h3>
                    <p className="text-sm text-gray-300">{movie.duration}</p>
                    <p className="text-sm text-gray-300">
                      {movie.type === "série" ? `${movie.episodes?.length || 0} épisodes` : "Film"}
                    </p>
                  </div>
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-primary/80 text-white rounded-full p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-background-light/30 rounded-lg border border-white/10">
            <svg
              className="h-12 w-12 mx-auto text-text-muted mb-4"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <h3 className="text-xl font-semibold text-white mb-2">Aucun résultat trouvé</h3>
            <p className="text-text-secondary">Aucun film ou série ne correspond à votre recherche.</p>
          </div>
        )}

        {/* Mobile CTA */}
        <div className="md:hidden fixed bottom-6 right-6">
          <Link
            href="/requests"
            className="flex items-center justify-center w-12 h-12 bg-secondary text-white rounded-full shadow-lg hover:bg-secondary-dark transition-colors"
          >
            <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                clipRule="evenodd"
              />
            </svg>
          </Link>
        </div>
      </main>

      {/* Movie Modal */}
      {selectedMovie && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          onClick={closeMovieModal}
        >
          <div
            className="bg-background-card rounded-lg overflow-hidden w-full max-w-4xl shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center p-4 border-b border-white/10">
              <h3 className="text-xl font-bold text-white">
                {selectedMovie.title}
                {selectedMovie.type === "série" &&
                  selectedMovie.episodes &&
                  ` - ${selectedMovie.episodes[selectedEpisode]?.title || `Épisode ${selectedEpisode + 1}`}`}
              </h3>
              <button className="p-1 text-text-secondary hover:text-white transition-colors" onClick={closeMovieModal}>
                <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>

            {selectedMovie.type === "série" && selectedMovie.episodes && selectedMovie.episodes.length > 0 && (
              <div className="px-4 pt-4">
                <select
                  className="w-full p-2 bg-background border border-white/10 rounded text-white mb-4"
                  value={selectedEpisode}
                  onChange={(e) => setSelectedEpisode(Number(e.target.value))}
                >
                  {selectedMovie.episodes.map((_, index: number) => (
                    <option key={index} value={index}>
                      Épisode {index + 1}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="w-full aspect-video bg-black flex items-center justify-center">
              <div className="text-center p-8">
                <svg
                  className="h-16 w-16 mx-auto text-primary mb-4"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                    clipRule="evenodd"
                  />
                </svg>
                <p className="text-text-secondary">Le lecteur vidéo serait affiché ici</p>
              </div>
            </div>

            <div className="p-4 border-t border-white/10">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-text-secondary text-sm">Genre:</span>
                    <p className="text-white">{selectedMovie.genre}</p>
                  </div>
                  <div>
                    <span className="text-text-secondary text-sm">Durée:</span>
                    <p className="text-white">{selectedMovie.duration}</p>
                  </div>
                  <div>
                    <span className="text-text-secondary text-sm">Année de sortie:</span>
                    <p className="text-white">{selectedMovie.releaseYear}</p>
                  </div>
                  <div>
                    <span className="text-text-secondary text-sm">Type:</span>
                    <p className="text-white">{selectedMovie.type === "série" ? "Série" : "Film"}</p>
                  </div>
                </div>

                {selectedMovie.type === "film" && selectedMovie.description && (
                  <div>
                    <span className="text-text-secondary text-sm">Description:</span>
                    <p className="text-white">{selectedMovie.description}</p>
                  </div>
                )}

                {selectedMovie.type === "série" &&
                  selectedMovie.episodes &&
                  selectedMovie.episodes[selectedEpisode]?.description && (
                    <div>
                      <span className="text-text-secondary text-sm">Description de l'épisode:</span>
                      <p className="text-white">{selectedMovie.episodes[selectedEpisode].description}</p>
                    </div>
                  )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
