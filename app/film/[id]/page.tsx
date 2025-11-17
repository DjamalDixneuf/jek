'use client'

import React, { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Image from 'next/image'
import { ArrowLeft, Play, Star, Clock, Calendar } from 'lucide-react'

export default function FilmPage() {
  const router = useRouter()
  const params = useParams()
  const id = params?.id
  
  const [movie, setMovie] = useState<any>(null)
  const [selectedEpisode, setSelectedEpisode] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return
    
    const loadMovie = async () => {
      setIsLoading(true)
      setError(null)
      
      try {
        const token = localStorage.getItem('token')
        if (!token) {
          router.push('/')
          return
        }

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || '/.netlify/functions/api'}/movies/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        )

        if (!response.ok) {
          throw new Error('Film non trouvé')
        }

        const data = await response.json()
        setMovie(data)
      } catch (err: any) {
        console.error('Erreur chargement film:', err)
        setError(err.message)
      } finally {
        setIsLoading(false)
      }
    }

    loadMovie()
  }, [id, router])

  const getCurrentVideoUrl = () => {
    if (!movie) return ''
    
    if (movie.type === 'série' && movie.episodes && movie.episodes.length > 0) {
      return movie.episodes[selectedEpisode]?.url || ''
    }
    
    return movie.videoUrl || ''
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#141414] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-white text-lg">Chargement...</p>
        </div>
      </div>
    )
  }

  if (error || !movie) {
    return (
      <div className="min-h-screen bg-[#141414] flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-white text-2xl font-bold mb-4">Film non trouvé</h2>
          <p className="text-gray-400 mb-6">{error || 'Ce contenu n\'existe pas'}</p>
          <button
            onClick={() => router.push('/user')}
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-md transition-colors"
          >
            Retour à l'accueil
          </button>
        </div>
      </div>
    )
  }

  const videoUrl = getCurrentVideoUrl()

  return (
    <div className="min-h-screen bg-[#141414]">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-b from-black to-transparent">
        <div className="container mx-auto px-4 py-4">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-white hover:text-gray-300 transition-colors"
          >
            <ArrowLeft size={24} />
            <span className="text-lg font-medium">Retour</span>
          </button>
        </div>
      </header>

      {/* Contenu principal */}
      <div className="pt-20 pb-12">
        <div className="container mx-auto px-4 max-w-7xl">
          {/* Lecteur vidéo */}
          <div className="aspect-video w-full bg-black rounded-lg overflow-hidden mb-8 shadow-2xl">
            {videoUrl ? (
              <iframe
                src={videoUrl}
                className="w-full h-full"
                frameBorder="0"
                allowFullScreen
                allow="autoplay; encrypted-media; fullscreen"
                title={movie.title}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-white">
                <p>Aucune vidéo disponible</p>
              </div>
            )}
          </div>

          {/* Sélecteur d'épisodes pour les séries */}
          {movie.type === 'série' && movie.episodes && movie.episodes.length > 0 && (
            <div className="mb-8">
              <h3 className="text-white text-xl font-bold mb-4">Épisodes</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {movie.episodes.map((episode: any, index: number) => (
                  <button
                    key={index}
                    onClick={() => setSelectedEpisode(index)}
                    className={`px-4 py-3 rounded-md font-medium transition-all ${
                      selectedEpisode === index
                        ? 'bg-red-600 text-white shadow-lg scale-105'
                        : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                    }`}
                  >
                    Épisode {index + 1}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Informations du film */}
          <div className="grid md:grid-cols-[300px_1fr] gap-8">
            {/* Affiche */}
            <div className="flex flex-col items-center md:items-start">
              <div className="relative w-full max-w-[300px] aspect-[2/3] rounded-lg overflow-hidden shadow-xl">
                <Image
                  src={movie.thumbnailUrl || '/placeholder.svg'}
                  alt={movie.title}
                  fill
                  className="object-cover"
                />
              </div>
            </div>

            {/* Détails */}
            <div className="space-y-6">
              <div>
                <h1 className="text-white text-4xl md:text-5xl font-bold mb-4">
                  {movie.title}
                </h1>
                
                <div className="flex flex-wrap gap-4 mb-6">
                  <div className="flex items-center gap-2 text-yellow-500">
                    <Star size={20} fill="currentColor" />
                    <span className="text-white text-lg">
                      {movie.rating || 'N/A'}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-gray-400">
                    <Calendar size={20} />
                    <span className="text-white">{movie.releaseYear}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-gray-400">
                    <Clock size={20} />
                    <span className="text-white">{movie.duration}</span>
                  </div>
                  
                  <div className="px-3 py-1 bg-red-600 rounded-full">
                    <span className="text-white text-sm font-medium uppercase">
                      {movie.type}
                    </span>
                  </div>
                </div>

                {/* Genres */}
                <div className="flex flex-wrap gap-2 mb-6">
                  {Array.isArray(movie.genre) ? (
                    movie.genre.map((g: string, idx: number) => (
                      <span
                        key={idx}
                        className="px-4 py-2 bg-gray-800 text-gray-300 rounded-full text-sm"
                      >
                        {g}
                      </span>
                    ))
                  ) : (
                    <span className="px-4 py-2 bg-gray-800 text-gray-300 rounded-full text-sm">
                      {movie.genre}
                    </span>
                  )}
                </div>
              </div>

              {/* Description */}
              <div>
                <h3 className="text-white text-2xl font-bold mb-3">Synopsis</h3>
                <p className="text-gray-300 text-lg leading-relaxed">
                  {movie.description || 'Aucune description disponible'}
                </p>
              </div>

              {/* Description de l'épisode pour les séries */}
              {movie.type === 'série' && 
               movie.episodes && 
               movie.episodes[selectedEpisode]?.description && (
                <div className="mt-6 p-6 bg-gray-900 rounded-lg border border-gray-800">
                  <h3 className="text-white text-xl font-bold mb-3">
                    Épisode {selectedEpisode + 1}
                  </h3>
                  <p className="text-gray-300 leading-relaxed">
                    {movie.episodes[selectedEpisode].description}
                  </p>
                </div>
              )}

              {/* Bouton lecture */}
              <button
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="flex items-center gap-3 bg-white hover:bg-gray-200 text-black px-8 py-4 rounded-md font-bold text-lg transition-all shadow-lg hover:scale-105"
              >
                <Play size={24} fill="currentColor" />
                <span>Regarder maintenant</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
        .animate-spin {
          animation: spin 1s linear infinite;
        }
      `}</style>
    </div>
  )
}