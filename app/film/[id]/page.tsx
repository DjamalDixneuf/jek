'use client'

import React, { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Image from 'next/image'
import { ArrowLeft, Heart } from 'lucide-react'

export default function WatchPage() {
  const router = useRouter()
  const { id } = useParams() // ← c'est l'ObjectId MongoDB

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

        // Favoris local
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

  // ON FAIT EXACTEMENT COMME TON EJS → dintezuvio.com/embed/ID_VIDÉO
  const videoId = movie?.videoId || movie?.videoUrl?.split('/watch/')[1] || ''
  const embedUrl = videoId ? `https://dintezuvio.com/embed/${videoId}` : ''

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a0b0f] flex items-center justify-center">
        <div className="text-white text-2xl">Chargement...</div>
      </div>
    )
  }

  if (!movie) return null

  return (
    <div className="min-h-screen bg-[#0a0b0f] text-white">

      {/* Particules flottantes (comme ton EJS) */}
      <div className="fixed inset-0 pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-blue-500 rounded-full opacity-30 animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 15}s`,
              animationDuration: `${15 + Math.random() * 10}s`
            }}
          />
        ))}
      </div>

      <div className="container max-w-6xl mx-auto px-4 pt-8 pb-20">

        {/* Header comme ton EJS */}
        <div className="flex justify-between items-center mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-3 bg-white/10 hover:bg-white/20 backdrop-blur px-6 py-3 rounded-full transition"
          >
            <ArrowLeft size={24} />
            Retour
          </button>

          <button
            onClick={toggleFavorite}
            className={`flex items-center gap-3 px-6 py-3 rounded-full font-bold transition ${
              isFavorite 
                ? 'bg-red-600 text-white' 
                : 'bg-white/10 hover:bg-white/20 backdrop-blur'
            }`}
          >
            <Heart size={22} fill={isFavorite ? 'white' : 'none'} />
            {isFavorite ? 'Ajouté !' : 'Ajouter aux favoris'}
          </button>
        </div>

        {/* Lecteur vidéo → EXACTEMENT COMME TON EJS */}
        <div className="relative bg-black rounded-3xl overflow-hidden shadow-2xl mb-10 border border-white/10">
          <div className="aspect-video">
            <iframe
              src={embedUrl}
              className="w-full h-full"
              allowFullScreen
              allow="autoplay; encrypted-media; fullscreen"
              // ON ENLÈVE LE SANDBOX → comme ton EJS qui marchait
            />
          </div>
        </div>

        {/* Infos film → style EJS */}
        <div className="grid md:grid-cols-[300px_1fr] gap-10">
          <div>
            <Image
              src={movie.thumbnailUrl || '/placeholder.jpg'}
              alt={movie.title}
              width={300}
              height={450}
              className="rounded-2xl shadow-2xl border border-white/10"
            />
          </div>

          <div className="space-y-6">
            <h1 className="text-5xl font-bold bg-gradient-to-r from-white to-blue-300 bg-clip-text text-transparent">
              {movie.title} <span className="text-3xl text-gray-400">({movie.releaseYear})</span>
            </h1>

            <div className="flex items-center gap-8 text-lg">
              <span>Durée : {movie.duration}</span>
              <span className="text-yellow-500">8.1/10</span>
            </div>

            <div className="flex flex-wrap gap-3">
              {(movie.genre || []).map((g: string) => (
                <span key={g} className="px-5 py-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full text-sm font-medium">
                  {g}
                </span>
              ))}
            </div>

            <p className="text-xl leading-relaxed text-gray-300">
              {movie.description}
            </p>
          </div>
        </div>
      </div>

      {/* Animation particules */}
      <style jsx>{`
        @keyframes float {
          0% { transform: translateY(100vh) rotate(0deg); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translateY(-100px) rotate(360deg); opacity: 0; }
        }
        .animate-float {
          animation: float linear infinite;
        }
      `}</style>
    </div>
  )
}
