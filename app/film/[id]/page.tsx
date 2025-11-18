// app/watch/[id]/page.tsx   (ou app/page.tsx si tu veux la racine )

'use client'

import React, { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Image from 'next/image'
import { ArrowLeft, Heart, Play, Star, Clock, Calendar, Film, Tv } from 'lucide-react'

export default function WatchPage() {
  const router = useRouter()
  const { id } = useParams()
  
  const [movie, setMovie] = useState<any>(null)
  const [selectedEpisode, setSelectedEpisode] = useState(0)
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
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })

        if (!res.ok) throw new Error('Film non trouvé ou accès refusé')

        const data = await res.json()
        setMovie(data)
        
        // Vérifier si dans les favoris (localStorage simple)
        const favs = JSON.parse(localStorage.getItem('favorites') || '[]')
        setIsFavorite(favs.includes(data._id))
        
      } catch (err) {
        console.error(err)
        alert('Impossible de charger le film. Vérifie que tu es connecté.')
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
      const newFavs = favs.filter((fid: string) => fid !== movie._id)
      localStorage.setItem('favorites', JSON.stringify(newFavs))
    } else {
      favs.push(movie._id)
      localStorage.setItem('favorites', JSON.stringify(favs))
    }
    setIsFavorite(!isFavorite)
  }

  const getEmbedUrl = () => {
    if (!movie) return ''

    let url = ''

    if (movie.type === 'série' && movie.episodes?.[selectedEpisode]?.videoUrl) {
      url = movie.episodes[selectedEpisode].videoUrl
    } else {
      url = movie.videoUrl
    }

    // Transformation magique Jekle-Embed (comme dans ton API)
    return url
      .replace('https://jeklevid.onrender.com/watch/', 'https://jeklevid.onrender.com/embed/')
      .replace('https://dintezuvio.com/v/', 'https://dintezuvio.com/embed/')
      .replace('https://www.youtube.com/watch?v=', 'https://www.youtube.com/embed/')
      .replace('https://youtu.be/', 'https://www.youtube.com/embed/')
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a0b0f] via-[#0f1220] to-[#0a0b0f] flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 border-4 border-t-transparent border-blue-500 rounded-full animate-spin mx-auto mb-6"></div>
          <p className="text-white text-2xl font-light">Chargement du film...</p>
        </div>
      </div>
    )
  }

  if (!movie) return null

  const embedUrl = getEmbedUrl()

  return (
    <>
      <div className="min-h-screen bg-[#0a0b0f] text-white overflow-hidden relative">

        {/* Fond galactique animé */}
        <div className="fixed inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-transparent to-green-900/20" />
          <div className="absolute top-0 left-0 w-96 h-96 bg-blue-600 rounded-full filter blur-3xl opacity-20 animate-pulse" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-green-600 rounded-full filter blur-3xl opacity-20 animate-pulse delay-1000" />
        </div>

        {/* Header fixe */}
        <header className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-b from-black/80 via-black/40 to-transparent backdrop-blur-md">
          <div className="container mx-auto px-6 py-5 flex justify-between items-center">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-3 text-white hover:text-blue-400 transition-all hover:scale-105"
            >
              <ArrowLeft size={28} />
              <span className="text-lg font-medium">Retour</span>
            </button>

            <button
              onClick={toggleFavorite}
              className={`flex items-center gap-3 px-6 py-3 rounded-full font-bold transition-all transform hover:scale-110 ${
                isFavorite 
                  ? 'bg-red-600 text-white shadow-lg shadow-red-600/50' 
                  : 'bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20'
              }`}
            >
              <Heart size={22} fill={isFavorite ? 'white' : 'none'} />
              {isFavorite ? 'Dans les favoris' : 'Ajouter aux favoris'}
            </button>
          </div>
        </header>

        <main className="container mx-auto px-6 pt-32 pb-20 max-w-7xl">

          {/* Lecteur vidéo */}
          <div className="relative rounded-3xl overflow-hidden shadow-2xl bg-black/50 backdrop-blur border border-white/10 mb-12">
            <div className="aspect-video">
              {embedUrl ? (
                <iframe
                  src={embedUrl}
                  className="w-full h-full"
                  allowFullScreen
                  allow="autoplay; encrypted-media; picture-in-picture"
                  sandbox="allow-scripts allow-same-origin allow-presentation"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-900 to-black">
                  <p className="text-2xl text-gray-500">Vidéo non disponible</p>
                </div>
              )}
            </div>
          </div>

          {/* Sélecteur d'épisodes */}
          {movie.type === 'série' && movie.episodes?.length > 0 && (
            <div className="mb-12">
              <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
                <Tv className="text-blue-400" />
                Épisodes
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {movie.episodes.map((ep: any, i: number) => (
                  <button
                    key={i}
                    onClick={() => setSelectedEpisode(i)}
                    className={`p-6 rounded-2xl font-bold text-lg transition-all transform hover:scale-105 ${
                      selectedEpisode === i
                        ? 'bg-gradient-to-r from-blue-600 to-blue-800 shadow-xl shadow-blue-600/50'
                        : 'bg-white/10 backdrop-blur border border-white/20 hover:bg-white/20'
                    }`}
                  >
                    Épisode {i + 1}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Infos film */}
          <div className="grid lg:grid-cols-[380px_1fr] gap-12">
            {/* Affiche */}
            <div className="relative group">
              <div className="rounded-3xl overflow-hidden shadow-2xl border border-white/10">
                <Image
                  src={movie.thumbnailUrl || '/placeholder.jpg'}
                  alt={movie.title}
                  width={380}
                  height={570}
                  className="w-full object-cover transition-transform group-hover:scale-105 duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
              </div>
            </div>

            {/* Détails */}
            <div className="space-y-8">
              <div>
                <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-white via-blue-200 to-green-200 bg-clip-text text-transparent mb-6">
                  {movie.title}
                </h1>

                <div className="flex flex-wrap items-center gap-6 text-lg">
                  <div className="flex items-center gap-2">
                    <Star className="text-yellow-500" fill="currentColor" />
                    <span>{movie.rating || 'N/A'}/10</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar />
                    {movie.releaseYear || '2025'}
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock />
                    {movie.duration || 'N/A'}
                  </div>
                  <div className={`px-6 py-2 rounded-full font-bold ${movie.type === 'film' ? 'bg-red-600' : 'bg-purple-600'}`}>
                    {movie.type === 'film' ? <Film size={20} /> : <Tv size={20} />}
                    <span className="ml-2">{movie.type === 'film' ? 'Film' : 'Série'}</span>
                  </div>
                </div>
              </div>

              {/* Genres */}
              <div className="flex flex-wrap gap-3">
                {(movie.genre || []).map((g: string, i: number) => (
                  <span key={i} className="px-5 py-2 bg-gradient-to-r from-blue-600/30 to-purple-600/30 border border-blue-500/30 rounded-full backdrop-blur">
                    {g}
                  </span>
                ))}
              </div>

              <div>
                <h2 className="text-3xl font-bold mb-4">Synopsis</h2>
                <p className="text-xl leading-relaxed text-gray-300">
                  {movie.type === 'série' && movie.episodes?.[selectedEpisode]?.description || movie.description || 'Aucune description disponible.'}
                </p>
              </div>

              <button
                onClick={() => window.scrollTo({ top: 400, behavior: 'smooth' })}
                className="flex items-center gap-4 bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-500 hover:to-blue-700 text-white px-10 py-5 rounded-2xl font-bold text-xl shadow-2xl shadow-blue-600/50 transform hover:scale-105 transition-all"
              >
                <Play size={32} fill="white" />
                Regarder {movie.type === 'série' ? `l'épisode ${selectedEpisode + 1}` : 'le film'}
              </button>
            </div>
          </div>
        </main>
      </div>
    </>
  )
}
