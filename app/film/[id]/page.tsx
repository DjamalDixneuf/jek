'use client'

import React, { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Image from 'next/image'
import { ArrowLeft, Heart, PlayCircle } from 'lucide-react'

export default function WatchPage() {
  const router = useRouter()
  const { id } = useParams()

  const [movie, setMovie] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isFavorite, setIsFavorite] = useState(false)

  useEffect(() => {
    if (!id) return

    const fetchMovie = async () => {
      const token = localStorage.getItem('token')
      if (!token) {
        router.push('/login')
        return
      }

      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/.netlify/functions/api/movies/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        if (!res.ok) throw new Error('Film non trouvé')
        const data = await res.json()
        setMovie(data)

        const favs = JSON.parse(localStorage.getItem('favorites') || '[]')
        setIsFavorite(favs.includes(data._id))

      } catch (err) {
        alert('Film introuvable')
        router.push('/user')
      } finally {
        setIsLoading(false)
      }
    }

    fetchMovie()
  }, [id, router])

  const toggleFavorite = () => {
    const favs = JSON.parse(localStorage.getItem('favorites') || '[]')
    if (isFavorite) {
      localStorage.setItem('favorites', JSON.stringify(favs.filter((fid: string) => fid !== movie._id)))
    } else {
      favs.push(movie._id)
      localStorage.setItem('favorites', JSON.stringify(favs))
    }
    setIsFavorite(!isFavorite)
  }

  const videoId = movie?.videoId || movie?.videoUrl?.split('/watch/')[1] || ''
  const embedUrl = videoId ? `https://dintezuvio.com/embed/${videoId}` : ''

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-3xl">Chargement...</div>
      </div>
    )
  }

  if (!movie) return null

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">

      {/* FOND AVEC CAPTURES D'ÉCRAN DU FILM */}
      <div className="fixed inset-0 opacity-30">
        <div className="grid grid-cols-4 md:grid-cols-6 gap-4 p-10">
          {[...Array(24)].map((_, i) => (
            <div key={i} className="relative aspect-video rounded-lg overflow-hidden shadow-2xl">
              <Image
                src={movie.thumbnailUrl || '/placeholder.jpg'}
                alt=""
                fill
                className="object-cover blur-sm scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
              <PlayCircle className="absolute inset-0 m-auto text-white/60" size={40} />
            </div>
          ))}
        </div>
      </div>

      {/* CONTENU PRINCIPAL */}
      <div className="relative z-10 min-h-screen flex flex-col justify-between">

        {/* HEADER */}
        <div className="flex justify-between items-center p-6">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-3 bg-white/20 hover:bg-white/30 backdrop-blur px-6 py-3 rounded-full transition"
          >
            <ArrowLeft size={24} />
            Retour
          </button>

          <button
            onClick={toggleFavorite}
            className={`flex items-center gap-3 px-6 py-3 rounded-full font-bold transition ${
              isFavorite ? 'bg-red-600' : 'bg-white/20 hover:bg-white/30 backdrop-blur'
            }`}
          >
            <Heart size={22} fill={isFavorite ? 'white' : 'none'} />
            {isFavorite ? 'Ajouté !' : 'Ajouter aux favoris'}
          </button>
        </div>

        {/* LECTEUR VIDÉO CENTRÉ */}
        <div className="flex-1 flex items-center justify-center px-10">
          <div className="w-full max-w-5xl">
            <div className="relative bg-black rounded-3xl overflow-hidden shadow-2xl">
              <div className="aspect-video">
                <iframe
                  src={embedUrl}
                  className="w-full h-full"
                  allowFullScreen
                  allow="autoplay; encrypted-media; fullscreen"
                />
              </div>
            </div>
          </div>
        </div>

        {/* INFOS EN BAS */}
        <div className="bg-gradient-to-t from-black via-black/90 to-transparent pt-20 pb-10 px-10">
          <div className="max-w-5xl mx-auto">
            <h1 className="text-5xl md:text-6xl font-bold mb-4">
              {movie.title} <span className="text-3xl text-gray-400">({movie.releaseYear})</span>
            </h1>
            <p className="text-gray-400 mb-4">Durée : {movie.duration}</p>

            <div className="flex flex-wrap gap-3 mb-6">
              {(movie.genre || []).map((g: string) => (
                <span key={g} className="px-4 py-2 bg-blue-600 rounded-full text-sm font-medium">
                  {g}
                </span>
              ))}
            </div>

            <p className="text-lg leading-relaxed text-gray-300 max-w-4xl">
              {movie.description}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
