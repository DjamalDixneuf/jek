'use client'

import React, { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Image from 'next/image'
import { ArrowLeft, Heart, Play } from 'lucide-react'

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
      const match = movie.videoUrl.match(/\/watch\/([a-zA-Z0-9_-]+)/i)
      return match ? match[1] : ''
    }
    return ''
  }

  const videoId = getVideoId()
  const embedUrl = videoId ? `https://dintezuvio.com/embed/${videoId}` : ''

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a0b0f] flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 border-4 border-t-transparent border-blue-500 rounded-full animate-spin mx-auto mb-6"></div>
          <p className="text-2xl text-white">Chargement du film...</p>
        </div>
      </div>
    )

  if (!movie) return null

  return (
    <>
      {/* On applique exactement le style de ton index.css (galactique + glassmorphism) */}
      <div className="min-h-screen bg-[#0a0b0f] text-white font-['Poppins'] relative overflow-hidden">
        {/* Fond galactique exact de ton index.css */}
        <div className="fixed inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-900/10 via-transparent to-green-900/10" />
          <div className="absolute top-0 left-0 w-96 h-96 bg-blue-600 rounded-full filter blur-3xl opacity-10 animate-pulse" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-green-600 rounded-full filter blur-3xl opacity-10 animate-pulse delay-1000" />
        </div>

        {/* Particules flottantes comme dans ton index.css */}
        <div className="fixed inset-z-10 fixed inset-0 overflow-hidden">
          {[...Array(30)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-blue-400 rounded-full opacity-40 animate-float"
              style={{
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 10}s`,
                animationDuration: `${15 + Math.random() * 15}s`
              }}
            />
          ))}
        </div>

        <div className="relative z-10 min-h-screen flex flex-col">

          {/* Header premium comme ton login */}
          <header className="fixed top-0 inset-x-0 z-50 bg-black/40 backdrop-blur-xl border-b border-white/5">
            <div className="container mx-auto px-6 py-5 flex justify-between items-center">
              <button onClick={() => router.back()} className="flex items-center gap-3 text-white hover:text-blue-400 transition">
                <ArrowLeft size={28} />
                <span className="text-lg font-medium">Retour</span>
              </button>

              <button
                onClick={toggleFavorite}
                className={`flex items-center gap-3 px-8 py-3 rounded-full font-bold transition-all hover:scale-105 ${
                  isFavorite 
                    ? 'bg-gradient-to-r from-red-600 to-pink-600 shadow-lg shadow-red-600/50' 
                    : 'bg-white/10 backdrop-blur border border-white/20 hover:bg-white/20'
                }`}
              >
                <Heart size={24} fill={isFavorite ? 'white' : 'none'} />
                {isFavorite ? 'Dans les favoris' : 'Ajouter aux favoris'}
              </button>
            </div>
          </header>

          {/* Conteneur principal avec glassmorphism comme ton login card */}
          <main className="flex-1 container mx-auto px-6 pt-32 pb-20 max-w-7xl">
            <div className="bg-black/50 backdrop-blur-2xl border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
              {/* Barre bleue en haut comme ton login card */}
              <div className="h-2 bg-gradient-to-r from-blue-600 to-cyan-500" />

              {/* Lecteur vidéo */}
              <div className="relative aspect-video bg-black">
                {embedUrl ? (
                  <iframe
                    src={embedUrl}
                    className="w-full h-full"
                    allowFullScreen
                    allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
                    sandbox="allow-scripts allow-same-origin allow-presentation allow-popups"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <p className="text-2xl text-gray-500">Vidéo non disponible</p>
                  </div>
                )}
              </div>

              {/* Infos film en glassmorphism */}
              <div className="p-10">
                <div className="grid lg:grid-cols-[400px_1fr] gap-12">
                  <div className="relative group">
                    <Image
                      src={movie.thumbnailUrl || '/placeholder.jpg'}
                      alt={movie.title}
                      width={400}
                      height={600}
                      className="w-full rounded-2xl shadow-2xl border border-white/10 object-cover group-hover:scale-105 transition"
                    />
                  </div>

                  <div className="space-y-8">
                    <h1 className="text-6xl font-bold bg-gradient-to-r from-white via-blue-200 to-green-200 bg-clip-text text-transparent">
                      {movie.title}
                    </h1>

                    <div className="flex items-center gap-8 text-lg text-gray-300">
                      <span>{movie.releaseYear}</span>
                      <span>{movie.duration}</span>
                      <span className="px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-full font-medium">
                        {movie.type === 'film' ? 'Film' : 'Série'}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-3">
                      {(movie.genre || []).map((g: string) => (
                        <span key={g} className="px-6 py-3 bg-gradient-to-r from-blue-600/30 to-cyan-600/30 border border-blue-500/30 rounded-full backdrop-blur">
                          {g}
                        </span>
                      ))}
                    </div>

                    <p className="text-xl leading-relaxed text-gray-200 max-w-4xl">
                      {movie.description}
                    </p>

                    <button
                      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                      className="flex items-center gap-4 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 px-10 py-5 rounded-2xl font-bold text-xl shadow-2xl shadow-blue-600/50 transform hover:scale-105 transition-all"
                    >
                      <Play size={32} fill="white" />
                      Regarder maintenant
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>

        <style jsx global>{`
          @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');
          
          body {
            font-family: 'Poppins', sans-serif;
          }
          
          @keyframes float {
            0% { transform: translateY(100vh); opacity: 0; }
            10% { opacity: 0.6; }
            90% { opacity: 0.6; }
            100% { transform: translateY(-100px); opacity: 0; }
          }
          
          .animate-float {
            animation: float linear infinite;
          }
        `}</style>
      </div>
    </>
  )
}
