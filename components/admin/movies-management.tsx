"use client"

import type React from "react"

import { useState } from "react"
import type { Movie } from "@/types/movie"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Search, Plus, Trash2, Film, Tv } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface MoviesManagementProps {
  movies: Movie[]
  isLoading: boolean
  onAddMovie: (movieData: Partial<Movie>) => Promise<boolean>
  onDeleteMovie: (movieId: string) => Promise<void>
}

export default function MoviesManagement({ movies, isLoading, onAddMovie, onDeleteMovie }: MoviesManagementProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [movieType, setMovieType] = useState<"film" | "série">("film")
  const [episodeCount, setEpisodeCount] = useState(1)
  const [formData, setFormData] = useState({
    title: "",
    type: "film",
    duration: "",
    description: "",
    genre: "",
    releaseYear: new Date().getFullYear().toString(),
    thumbnailUrl: "",
    videoUrl: "",
    episodes: [] as { url: string; description: string }[],
  })

  const filteredMovies = movies.filter(
    (movie) =>
      movie.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      movie.genre.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleTypeChange = (value: string) => {
    setMovieType(value as "film" | "série")
    setFormData((prev) => ({ ...prev, type: value }))
  }

  const handleEpisodeChange = (index: number, field: string, value: string) => {
    setFormData((prev) => {
      const updatedEpisodes = [...prev.episodes]
      updatedEpisodes[index] = {
        ...updatedEpisodes[index],
        [field]: value,
      }
      return { ...prev, episodes: updatedEpisodes }
    })
  }

  const handleEpisodeCountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const count = Number.parseInt(e.target.value) || 1
    setEpisodeCount(count)

    setFormData((prev) => {
      const currentEpisodes = [...prev.episodes]
      const newEpisodes = Array(count)
        .fill(null)
        .map((_, i) => currentEpisodes[i] || { url: "", description: "" })

      return { ...prev, episodes: newEpisodes }
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const movieData = { ...formData }

    // Validate required fields
    if (
      !movieData.title ||
      !movieData.duration ||
      !movieData.description ||
      !movieData.genre ||
      !movieData.thumbnailUrl
    ) {
      alert("Please fill in all required fields")
      return
    }

    // Validate video URL for films
    if (movieData.type === "film" && !movieData.videoUrl) {
      alert("Please provide a video URL for the film")
      return
    }

    // Validate episodes for series
    if (movieData.type === "série") {
      if (!movieData.episodes.length) {
        alert("Please add at least one episode")
        return
      }

      const invalidEpisode = movieData.episodes.findIndex((ep) => !ep.url || !ep.description)

      if (invalidEpisode !== -1) {
        alert(`Please complete episode ${invalidEpisode + 1} details`)
        return
      }
    }

    const success = await onAddMovie(movieData)

    if (success) {
      // Reset form
      setFormData({
        title: "",
        type: "film",
        duration: "",
        description: "",
        genre: "",
        releaseYear: new Date().getFullYear().toString(),
        thumbnailUrl: "",
        videoUrl: "",
        episodes: [],
      })
      setMovieType("film")
      setEpisodeCount(1)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <h2 className="text-2xl font-bold">Movies & Series Management</h2>
        <span className="bg-gray-700 text-gray-300 text-xs px-2 py-1 rounded-full">{movies.length} items</span>
      </div>

      <Tabs defaultValue="list" className="space-y-6">
        <TabsList>
          <TabsTrigger value="list">Movie List</TabsTrigger>
          <TabsTrigger value="add">Add New</TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              type="search"
              placeholder="Search movies by title or genre..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {isLoading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-12 bg-gray-800/50 rounded animate-pulse" />
              ))}
            </div>
          ) : filteredMovies.length > 0 ? (
            <div className="rounded-md border border-gray-700 overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Genre</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Release Year</TableHead>
                    <TableHead>Episodes</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredMovies.map((movie) => (
                    <TableRow key={movie._id}>
                      <TableCell className="font-medium">{movie.title}</TableCell>
                      <TableCell>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-700 text-gray-200">
                          {movie.type === "série" ? <Tv className="mr-1 h-3 w-3" /> : <Film className="mr-1 h-3 w-3" />}
                          {movie.type}
                        </span>
                      </TableCell>
                      <TableCell>{movie.genre}</TableCell>
                      <TableCell>{movie.duration}</TableCell>
                      <TableCell>{movie.releaseYear}</TableCell>
                      <TableCell>
                        {movie.type === "série" ? (movie.episodes ? movie.episodes.length : "N/A") : "N/A"}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="destructive" size="sm" onClick={() => onDeleteMovie(movie._id)}>
                          <Trash2 className="mr-1 h-4 w-4" />
                          Delete
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-800/30 rounded-lg border border-gray-700">
              <p className="text-gray-400">No movies or series found matching your search.</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="add">
          <Card>
            <CardHeader>
              <CardTitle>Add New Movie or Series</CardTitle>
              <CardDescription>Fill in the details to add a new movie or series to the platform.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="title">Title</Label>
                    <Input id="title" name="title" value={formData.title} onChange={handleInputChange} required />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="type">Type</Label>
                    <Select value={formData.type} onValueChange={handleTypeChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="film">Film</SelectItem>
                        <SelectItem value="série">Series</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="duration">Duration</Label>
                    <Input
                      id="duration"
                      name="duration"
                      value={formData.duration}
                      onChange={handleInputChange}
                      placeholder="e.g. 2h 30min"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="genre">Genre</Label>
                    <Input
                      id="genre"
                      name="genre"
                      value={formData.genre}
                      onChange={handleInputChange}
                      placeholder="e.g. Action, Drama"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="releaseYear">Release Year</Label>
                    <Input
                      id="releaseYear"
                      name="releaseYear"
                      type="number"
                      value={formData.releaseYear}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="thumbnailUrl">Thumbnail URL</Label>
                    <Input
                      id="thumbnailUrl"
                      name="thumbnailUrl"
                      type="url"
                      value={formData.thumbnailUrl}
                      onChange={handleInputChange}
                      placeholder="https://example.com/image.jpg"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={3}
                    required
                  />
                </div>

                {movieType === "film" ? (
                  <div className="space-y-2">
                    <Label htmlFor="videoUrl">Video URL</Label>
                    <Input
                      id="videoUrl"
                      name="videoUrl"
                      type="url"
                      value={formData.videoUrl}
                      onChange={handleInputChange}
                      placeholder="https://example.com/video.mp4"
                      required
                    />
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="episodeCount">Number of Episodes</Label>
                      <Input
                        id="episodeCount"
                        type="number"
                        min="1"
                        value={episodeCount}
                        onChange={handleEpisodeCountChange}
                        required
                      />
                    </div>

                    <div className="space-y-4 border border-gray-700 rounded-lg p-4">
                      <h4 className="font-medium">Episodes</h4>

                      {Array.from({ length: episodeCount }).map((_, index) => (
                        <div key={index} className="space-y-4 p-4 bg-gray-800/30 rounded-lg">
                          <h5 className="font-medium">Episode {index + 1}</h5>

                          <div className="space-y-2">
                            <Label htmlFor={`episodeUrl${index}`}>Episode {index + 1} URL</Label>
                            <Input
                              id={`episodeUrl${index}`}
                              type="url"
                              value={formData.episodes[index]?.url || ""}
                              onChange={(e) => handleEpisodeChange(index, "url", e.target.value)}
                              placeholder="https://example.com/episode.mp4"
                              required
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor={`episodeDescription${index}`}>Episode {index + 1} Description</Label>
                            <Textarea
                              id={`episodeDescription${index}`}
                              value={formData.episodes[index]?.description || ""}
                              onChange={(e) => handleEpisodeChange(index, "description", e.target.value)}
                              rows={2}
                              required
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <Button type="submit" className="w-full">
                  <Plus className="mr-2 h-4 w-4" />
                  Add {movieType === "film" ? "Movie" : "Series"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
