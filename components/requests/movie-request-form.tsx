"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { signOut } from "next-auth/react"
import { ArrowLeft, Send, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { API_URL } from "@/lib/constants"
import type { MovieRequest } from "@/types/movie-request"
import type { Movie } from "@/types/movie"
import Link from "next/link"
import Image from "next/image"

export default function MovieRequestForm() {
  const { data: session } = useSession()
  const router = useRouter()
  const { toast } = useToast()

  const [requests, setRequests] = useState<MovieRequest[]>([])
  const [movies, setMovies] = useState<Movie[]>([])
  const [isLoading, setIsLoading] = useState({
    requests: true,
    movies: true,
    submit: false,
  })

  const [formData, setFormData] = useState({
    title: "",
    imdbLink: "",
    comment: "",
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = session?.user.token

        if (!token) {
          throw new Error("Authentication token missing")
        }

        // Fetch user's requests
        setIsLoading((prev) => ({ ...prev, requests: true }))
        const requestsResponse = await fetch(`${API_URL}/movie-requests`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (!requestsResponse.ok) {
          if (requestsResponse.status === 401) {
            signOut()
            throw new Error("Session expired. Please log in again.")
          }
          throw new Error(`HTTP error! status: ${requestsResponse.status}`)
        }

        const requestsData = await requestsResponse.json()
        setRequests(requestsData)
        setIsLoading((prev) => ({ ...prev, requests: false }))

        // Fetch available movies
        setIsLoading((prev) => ({ ...prev, movies: true }))
        const moviesResponse = await fetch(`${API_URL}/movies`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (!moviesResponse.ok) {
          throw new Error(`HTTP error! status: ${moviesResponse.status}`)
        }

        const moviesData = await moviesResponse.json()
        setMovies(moviesData)
        setIsLoading((prev) => ({ ...prev, movies: false }))
      } catch (error) {
        toast({
          title: "Error loading data",
          description: error instanceof Error ? error.message : "An unexpected error occurred",
          variant: "destructive",
        })
      }
    }

    fetchData()
  }, [session, toast])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading((prev) => ({ ...prev, submit: true }))

    try {
      const token = session?.user.token

      if (!token) {
        throw new Error("Authentication token missing")
      }

      // Validate IMDB link
      if (!formData.imdbLink.includes("imdb.com")) {
        throw new Error("Please provide a valid IMDB link")
      }

      const response = await fetch(`${API_URL}/movie-requests`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const newRequest = await response.json()

      // Add new request to list
      setRequests((prev) => [newRequest, ...prev])

      // Reset form
      setFormData({
        title: "",
        imdbLink: "",
        comment: "",
      })

      toast({
        title: "Request submitted successfully",
        description: "We'll review your request as soon as possible.",
      })
    } catch (error) {
      toast({
        title: "Error submitting request",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setIsLoading((prev) => ({ ...prev, submit: false }))
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-950">
      <header className="bg-gray-900/80 backdrop-blur-md border-b border-gray-800">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm" className="flex items-center">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Dashboard
              </Button>
            </Link>

            <div className="flex items-center space-x-4">
              <div className="relative w-10 h-10 bg-black rounded-full flex items-center justify-center overflow-hidden">
                <Image src="/logo.png" alt="Jekle Logo" width={40} height={30} className="object-contain" />
              </div>
              <h1 className="text-xl font-bold text-white">Request Movies</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 p-6">
              <h2 className="text-xl font-bold mb-4">Request a Movie or Series</h2>

              <div className="bg-blue-900/20 border border-blue-800/30 rounded-lg p-4 mb-6">
                <p className="text-sm text-blue-300 flex items-center">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Please provide a link from{" "}
                  <a href="https://www.imdb.com/" target="_blank" rel="noopener noreferrer" className="underline ml-1">
                    IMDb
                  </a>
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    name="title"
                    placeholder="Enter movie or series title"
                    value={formData.title}
                    onChange={handleInputChange}
                    required
                    disabled={isLoading.submit}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="imdbLink">IMDB Link</Label>
                  <Input
                    id="imdbLink"
                    name="imdbLink"
                    type="url"
                    placeholder="https://www.imdb.com/title/..."
                    value={formData.imdbLink}
                    onChange={handleInputChange}
                    required
                    disabled={isLoading.submit}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="comment">Comment (Optional)</Label>
                  <Textarea
                    id="comment"
                    name="comment"
                    placeholder="Any additional information or comments"
                    value={formData.comment}
                    onChange={handleInputChange}
                    rows={4}
                    disabled={isLoading.submit}
                  />
                </div>

                <Button type="submit" className="w-full" disabled={isLoading.submit}>
                  <Send className="mr-2 h-4 w-4" />
                  Submit Request
                </Button>
              </form>
            </div>

            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 p-6">
              <h2 className="text-xl font-bold mb-4">Your Requests</h2>

              {isLoading.requests ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-20 bg-gray-700/50 rounded-lg animate-pulse" />
                  ))}
                </div>
              ) : requests.length > 0 ? (
                <div className="space-y-4">
                  {requests.map((request) => (
                    <div key={request._id} className="bg-gray-700/30 rounded-lg p-4 border border-gray-700">
                      <div className="flex justify-between items-start">
                        <h3 className="font-medium">{request.title}</h3>
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            request.status === "approved"
                              ? "bg-green-900/30 text-green-300"
                              : request.status === "rejected"
                                ? "bg-red-900/30 text-red-300"
                                : "bg-yellow-900/30 text-yellow-300"
                          }`}
                        >
                          {request.status || "pending"}
                        </span>
                      </div>

                      <a
                        href={request.imdbLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-400 hover:text-blue-300 flex items-center mt-1"
                      >
                        IMDB Link
                        <ExternalLink className="ml-1 h-3 w-3" />
                      </a>

                      {request.comment && <p className="text-sm text-gray-400 mt-2">{request.comment}</p>}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400 text-center py-6">You haven't made any requests yet.</p>
              )}
            </div>
          </div>

          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 p-6">
            <h2 className="text-xl font-bold mb-4">Available Movies & Series</h2>

            {isLoading.movies ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-16 bg-gray-700/50 rounded-lg animate-pulse" />
                ))}
              </div>
            ) : movies.length > 0 ? (
              <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                {movies.map((movie) => (
                  <div
                    key={movie._id}
                    className="flex items-center space-x-4 bg-gray-700/30 rounded-lg p-3 border border-gray-700"
                  >
                    <div className="relative w-16 h-24 flex-shrink-0">
                      <Image
                        src={movie.thumbnailUrl || "/placeholder.svg"}
                        alt={movie.title}
                        fill
                        className="object-cover rounded"
                        sizes="64px"
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium truncate">{movie.title}</h3>
                      <p className="text-sm text-gray-400">{movie.genre}</p>
                      <div className="flex items-center text-sm text-gray-500 mt-1">
                        <span>{movie.duration}</span>
                        <span className="mx-2">•</span>
                        <span>{movie.releaseYear}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-400 text-center py-6">No movies or series available yet.</p>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
