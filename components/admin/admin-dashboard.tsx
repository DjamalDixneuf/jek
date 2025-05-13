"use client"

import { useState } from "react"
import { useToast } from "@/hooks/use-toast"
import type { Movie } from "@/types/movie"
import type { User } from "@/types/user"
import type { MovieRequest } from "@/types/movie-request"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import UsersManagement from "@/components/admin/users-management"
import MoviesManagement from "@/components/admin/movies-management"
import RequestsManagement from "@/components/admin/requests-management"
import LogoutButton from "@/components/logout-button"
import Image from "next/image"

// Mock data
const mockUsers: User[] = [
  {
    _id: "1",
    username: "user1",
    email: "user1@example.com",
    role: "user",
    isBanned: false,
    createdAt: "2023-01-01",
  },
  {
    _id: "2",
    username: "user2",
    email: "user2@example.com",
    role: "user",
    isBanned: true,
    createdAt: "2023-01-02",
  },
]

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
]

const mockRequests: MovieRequest[] = [
  {
    _id: "1",
    title: "The Godfather",
    imdbLink: "https://www.imdb.com/title/tt0068646/",
    userId: "1",
    status: "pending",
    createdAt: "2023-01-01",
  },
  {
    _id: "2",
    title: "Pulp Fiction",
    imdbLink: "https://www.imdb.com/title/tt0110912/",
    comment: "I love Tarantino movies!",
    userId: "2",
    status: "approved",
    createdAt: "2023-01-02",
  },
]

export default function AdminDashboard() {
  const { toast } = useToast()

  const [users, setUsers] = useState<User[]>(mockUsers)
  const [movies, setMovies] = useState<Movie[]>(mockMovies)
  const [requests, setRequests] = useState<MovieRequest[]>(mockRequests)
  const [isLoading, setIsLoading] = useState({
    users: false,
    movies: false,
    requests: false,
  })

  const handleToggleBanUser = async (userId: string, ban: boolean) => {
    try {
      // In a real app, you would call your API here
      setUsers((prevUsers) => prevUsers.map((user) => (user._id === userId ? { ...user, isBanned: ban } : user)))

      toast({
        title: `User ${ban ? "banned" : "unbanned"} successfully`,
      })
    } catch (error) {
      toast({
        title: "Error updating user",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive",
      })
    }
  }

  const handleDeleteUser = async (userId: string) => {
    if (!confirm("Are you sure you want to delete this user? This action is irreversible.")) {
      return
    }

    try {
      // In a real app, you would call your API here
      setUsers((prevUsers) => prevUsers.filter((user) => user._id !== userId))

      toast({
        title: "User deleted successfully",
      })
    } catch (error) {
      toast({
        title: "Error deleting user",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive",
      })
    }
  }

  const handleAddMovie = async (movieData: Partial<Movie>) => {
    try {
      // In a real app, you would call your API here
      const newMovie: Movie = {
        _id: Date.now().toString(),
        title: movieData.title || "Untitled",
        type: movieData.type || "film",
        duration: movieData.duration || "0h 0m",
        description: movieData.description || "",
        genre: movieData.genre || "Unknown",
        releaseYear: movieData.releaseYear || new Date().getFullYear().toString(),
        thumbnailUrl: movieData.thumbnailUrl || "/placeholder.svg?height=300&width=200",
        videoUrl: movieData.videoUrl || "",
        episodes: movieData.episodes || [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      setMovies((prevMovies) => [...prevMovies, newMovie])

      toast({
        title: "Movie added successfully",
      })

      return true
    } catch (error) {
      toast({
        title: "Error adding movie",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive",
      })

      return false
    }
  }

  const handleDeleteMovie = async (movieId: string) => {
    if (!confirm("Are you sure you want to delete this movie?")) {
      return
    }

    try {
      // In a real app, you would call your API here
      setMovies((prevMovies) => prevMovies.filter((movie) => movie._id !== movieId))

      toast({
        title: "Movie deleted successfully",
      })
    } catch (error) {
      toast({
        title: "Error deleting movie",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive",
      })
    }
  }

  const handleApproveRequest = async (requestId: string) => {
    try {
      // In a real app, you would call your API here
      setRequests((prevRequests) =>
        prevRequests.map((request) => (request._id === requestId ? { ...request, status: "approved" } : request)),
      )

      toast({
        title: "Request approved successfully",
      })
    } catch (error) {
      toast({
        title: "Error approving request",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive",
      })
    }
  }

  const handleRejectRequest = async (requestId: string) => {
    try {
      // In a real app, you would call your API here
      setRequests((prevRequests) =>
        prevRequests.map((request) => (request._id === requestId ? { ...request, status: "rejected" } : request)),
      )

      toast({
        title: "Request rejected successfully",
      })
    } catch (error) {
      toast({
        title: "Error rejecting request",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-950">
      <header className="bg-gray-900/80 backdrop-blur-md border-b border-gray-800 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <div className="relative w-10 h-10 bg-black rounded-full flex items-center justify-center overflow-hidden">
              <Image src="/logo.png" alt="Jekle Logo" width={40} height={30} className="object-contain" />
            </div>
            <h1 className="text-xl font-bold text-white">Admin Dashboard</h1>
          </div>

          <LogoutButton />
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="users" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="movies">Movies & Series</TabsTrigger>
            <TabsTrigger value="requests">Requests</TabsTrigger>
          </TabsList>

          <TabsContent value="users">
            <UsersManagement
              users={users}
              isLoading={isLoading.users}
              onToggleBan={handleToggleBanUser}
              onDeleteUser={handleDeleteUser}
            />
          </TabsContent>

          <TabsContent value="movies">
            <MoviesManagement
              movies={movies}
              isLoading={isLoading.movies}
              onAddMovie={handleAddMovie}
              onDeleteMovie={handleDeleteMovie}
            />
          </TabsContent>

          <TabsContent value="requests">
            <RequestsManagement
              requests={requests}
              isLoading={isLoading.requests}
              onApproveRequest={handleApproveRequest}
              onRejectRequest={handleRejectRequest}
            />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
