'use client'

import React, { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Image from 'next/image'
import { ArrowLeft, Heart } from 'lucide-react'

export default function WatchPage() {
  const router = useRouter()
  const { id } = useParams()

  const [movie, setMovie] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isFavorite, setIsFavorite] = useState(false)

  useEffect(() => {
    if (!id) return

    const fetchMovie = async () => {
      setIsLoading(true)
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

  const getVideoId = () => {
    if (movie?.videoId) return movie.videoId
    if (movie?.videoUrl) {
      const match = movie.videoUrl.match(/\/watch\/([a-zA-Z0-9_-]+)/)
      return match ? match[1] : ''
    }
    return ''
  }

  const videoId = getVideoId()
  const embedUrl = videoId ? `https://dintezuvio.com/embed/${videoId}` : ''

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-3xl font-light">Chargement...</div>
      </div>
    )
  }

  if (!movie) return null

  return (
    <div className="min-h-screen bg-black text-white">

      {/* Header exact comme ton EJS local */}
      <div className="flex justify-between items-center p-6 absolute top-0 left-0 right-0 z-50">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-3 bg-black/70 hover:bg-black/80 backdrop-blur px-6 py-3 rounded-full transition"
        >
          <ArrowLeft size={24} />
          Retour
        </button>

        <button
          onClick={toggleFavorite}
          className={`px-6 py-3 rounded-full font-bold transition ${isFavorite ? 'bg-red-600' : 'bg-white/20 hover:bg-white/30 backdrop-blur'}`}
        >
          <Heart size={22} fill={isFavorite ? 'white' : 'none'} className="inline mr-2" />
          {isFavorite ? 'Ajouté aux favoris' : 'Ajouter aux favoris'}
        </button>
      </div>

      {/* Lecteur vidéo centré (exactement comme localhost) */}
      <div className="flex items-center justify-center min-h-screen px-4 pt-20 pb-32">
        <div className="w-full max-w-5xl">
          <div className="aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl">
            <iframe
              src={embedUrl}
              className="w-full h-full"
              allowFullScreen
              allow="autoplay; encrypted-media; fullscreen"
              // PAS DE SANDBOX → contrôles visibles + vidéo marche nickel
            />
          </div>
        </div>
      </div>

      {/* Infos en bas (exactement comme ton EJS local) */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/90 to-transparent pt-20 pb-10 px-6">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-bold mb-2">
            {movie.title} <span className="text-3xl md:text-4xl text-gray-500">({movie.releaseYear})</span>
          </h1>
          <p className="text-xl text-gray-400 mb-6">
            Durée : {movie.duration}
          </p>

          <div className="flex flex-wrap gap-3 mb-8">
            {(movie.genre || []).map((g: string) => (
              <span key={g} className="px-5 py-2 bg-blue-600 rounded-full text-sm font-medium">
                {g}
              </span>
            ))}
          </div>

          <p className="text-lg text-gray-300 max-w-4xl leading-relaxed">
            {movie.description}
          </p>
        </div>
      </div>
    </div>
  )
}
