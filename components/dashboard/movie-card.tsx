"use client"

import { Play } from "lucide-react"
import Image from "next/image"
import type { Movie } from "@/types/movie"

interface MovieCardProps {
  movie: Movie
  onWatch: () => void
}

export default function MovieCard({ movie, onWatch }: MovieCardProps) {
  return (
    <div className="movie-card group" onClick={onWatch}>
      <div className="relative aspect-[2/3] rounded-lg overflow-hidden">
        <Image
          src={movie.thumbnailUrl || "/placeholder.svg"}
          alt={movie.title}
          fill
          className="movie-card-image"
          sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 16vw"
        />

        <div className="movie-card-overlay group-hover:opacity-100">
          <div className="movie-card-title">{movie.title}</div>
          <div className="movie-card-info">{movie.duration}</div>
          <div className="movie-card-info">
            {movie.type === "série" ? `${movie.episodes?.length || 0} episodes` : "Movie"}
          </div>
        </div>

        <button className="movie-card-play group-hover:opacity-100">
          <Play className="h-6 w-6" />
        </button>
      </div>
    </div>
  )
}
