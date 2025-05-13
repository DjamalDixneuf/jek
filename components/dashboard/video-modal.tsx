"use client"

import type React from "react"

import { X } from "lucide-react"
import type { Movie } from "@/types/movie"
import { Button } from "@/components/ui/button"

interface VideoModalProps {
  movie: Movie
  selectedEpisode: number
  onEpisodeChange: (e: React.ChangeEvent<HTMLSelectElement>) => void
  onClose: () => void
}

export default function VideoModal({ movie, selectedEpisode, onEpisodeChange, onClose }: VideoModalProps) {
  // Fonction pour transformer les URL Google Drive
  const getEmbedUrl = (url: string) => {
    const driveMatch = url.match(/(?:https?:\/\/)?(?:www\.)?drive\.google\.com\/file\/d\/([^/]+)/)
    if (driveMatch) {
      const fileId = driveMatch[1]
      return `https://drive.google.com/file/d/${fileId}/preview`
    }
    return url
  }

  const videoUrl =
    movie.type === "série"
      ? movie.episodes && movie.episodes[selectedEpisode]
        ? getEmbedUrl(movie.episodes[selectedEpisode].url)
        : ""
      : getEmbedUrl(movie.videoUrl || "")

  return (
    <div className="video-modal" onClick={onClose}>
      <div className="video-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="video-modal-header">
          <h3 className="text-xl font-bold">
            {movie.title}
            {movie.type === "série" &&
              movie.episodes &&
              movie.episodes[selectedEpisode] &&
              ` - Episode ${selectedEpisode + 1}`}
          </h3>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        {movie.type === "série" && movie.episodes && movie.episodes.length > 0 && (
          <div className="px-4 pt-4">
            <select className="episode-selector" value={selectedEpisode} onChange={onEpisodeChange}>
              {movie.episodes.map((_, index) => (
                <option key={index} value={index}>
                  Episode {index + 1}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="video-modal-body">
          <iframe
            className="video-player"
            src={videoUrl}
            allowFullScreen
            allow="autoplay; encrypted-media"
            sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
          ></iframe>
        </div>

        <div className="video-modal-footer">
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-400">Genre:</span>
              <span>{movie.genre}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Duration:</span>
              <span>{movie.duration}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Release Year:</span>
              <span>{movie.releaseYear}</span>
            </div>
            {movie.description && (
              <div className="mt-4">
                <h4 className="text-gray-400 mb-1">Description:</h4>
                <p className="text-sm">{movie.description}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
