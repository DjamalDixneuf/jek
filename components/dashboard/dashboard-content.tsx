"use client"

import type React from "react"

import { useState } from "react"
import { Search, Film, Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import MovieCard from "@/components/dashboard/movie-card"
import VideoModal from "@/components/dashboard/video-modal"
import LogoutButton from "@/components/logout-button"
import { useToast } from "@/hooks/use-toast"
import type { Movie } from "@/types/movie"
import Image from "next/image"
import Link from "next/link"

// Mock data for movies
const mockMovies: Movie[] = [
  {
    _id: "1",
    title: "The Matrix",
    type: "film",
    duration: "2h 16m",
    description:
      "A computer hacker learns about the true nature of reality and his role in the war against its controllers.",
    genre: "Sci-Fi",
    releaseYear: "1999",
    thumbnailUrl: "/placeholder.svg?height=300&width=200",
    videoUrl: "https://example.com/matrix.mp4",
    createdAt: "2023-01-01",
    updatedAt: "2023-01-01",
  },
  {
    _id: "2",
    title: "Inception",
    type: "film",
    duration: "2h 28m",
    description:
      "A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O.",
    genre: "Sci-Fi",
    releaseYear: "2010",
    thumbnailUrl: "/placeholder.svg?height=300&width=200",
    videoUrl: "https://example.com/inception.mp4",
    createdAt: "2023-01-02",
    updatedAt: "2023-01-02",
  },
  {
    _id: "3",
    title: "Stranger Things",
    type: "série",
    duration: "50m",
    description:
      "When a young boy disappears, his mother, a police chief, and his friends must confront terrifying supernatural forces in order to get him back.",
    genre: "Sci-Fi",
    releaseYear: "2016",
    thumbnailUrl: "/placeholder.svg?height=300&width=200",
    episodes: [
      {
        url: "https://example.com/stranger-things-s01e01.mp4",
        description: "Chapter One: The Vanishing of Will Byers",
      },
      {
        url: "https://example.com/stranger-things-s01e02.mp4",
        description: "Chapter Two: The Weirdo on Maple Street",
      },
    ],
    createdAt: "2023-01-03",
    updatedAt: "2023-01-03",
  },
]

export default function DashboardContent() {
  const { toast } = useToast()

  const [movies] = useState<Movie[]>(mockMovies)
  const [filteredMovies, setFilteredMovies] = useState<Movie[]>(mockMovies)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null)
  const [selectedEpisode, setSelectedEpisode] = useState(0)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value.toLowerCase()
    setSearchTerm(term)

    if (term.trim() === "") {
      setFilteredMovies(movies)
    } else {
      const filtered = movies.filter(
        (movie) => movie.title.toLowerCase().includes(term) || movie.genre.toLowerCase().includes(term),
      )
      setFilteredMovies(filtered)
    }
  }

  const handleWatchMovie = (movie: Movie) => {
    setSelectedMovie(movie)
    setSelectedEpisode(0)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedMovie(null)
  }

  const handleEpisodeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedEpisode(Number.parseInt(e.target.value))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-950">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-gray-900/80 backdrop-blur-md border-b border-gray-800">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative w-10 h-10 bg-black rounded-full flex items-center justify-center overflow-hidden">
                <Image src="/logo.png" alt="Jekle Logo" width={40} height={30} className="object-contain" />
              </div>
              <h1 className="text-xl font-bold text-white hidden md:block">Jekle Entertainment</h1>
            </div>

            <div className="hidden md:flex items-center space-x-4 flex-1 max-w-md mx-4">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  type="search"
                  placeholder="Search movies and series..."
                  className="pl-10 bg-gray-800 border-gray-700"
                  value={searchTerm}
                  onChange={handleSearch}
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Link href="/requests">
                <Button variant="outline" size="sm" className="hidden md:flex">
                  <Film className="mr-2 h-4 w-4" />
                  Request Movie
                </Button>
              </Link>

              <LogoutButton showIcon={true} showText={false} className="hidden md:flex" />

              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </div>
          </div>

          {/* Mobile search */}
          <div className={`md:hidden mt-4 ${isMobileMenuOpen ? "block" : "hidden"}`}>
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                type="search"
                placeholder="Search movies and series..."
                className="pl-10 bg-gray-800 border-gray-700"
                value={searchTerm}
                onChange={handleSearch}
              />
            </div>

            <div className="mt-4 flex flex-col space-y-2">
              <Link href="/requests" className="w-full">
                <Button variant="outline" size="sm" className="w-full">
                  <Film className="mr-2 h-4 w-4" />
                  Request Movie
                </Button>
              </Link>

              <LogoutButton variant="ghost" size="sm" showIcon={true} showText={true} />
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="container mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold mb-6 text-white">Available Movies & Series</h2>

        {filteredMovies.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
            {filteredMovies.map((movie) => (
              <MovieCard key={movie._id} movie={movie} onWatch={() => handleWatchMovie(movie)} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-400">No movies or series found matching your search.</p>
          </div>
        )}
      </main>

      {/* Video modal */}
      {isModalOpen && selectedMovie && (
        <VideoModal
          movie={selectedMovie}
          selectedEpisode={selectedEpisode}
          onEpisodeChange={handleEpisodeChange}
          onClose={handleCloseModal}
        />
      )}
    </div>
  )
}
