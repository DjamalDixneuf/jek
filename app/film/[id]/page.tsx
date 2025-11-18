'use client'

import React, { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Image from 'next/image'
import { ArrowLeft, Heart, Play, Star, Clock, Calendar } from 'lucide-react'

export default function WatchPage() {
  const router = useRouter()
  const { id } = useParams()

  const [movie, setMovie] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isFavorite, setIsFavorite] = useState(false)
  const [debugInfo, setDebugInfo] = useState('') // DEBUG : pour voir ce qui se passe

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

        // DEBUG : Afficher le champ URL
        const rawUrl = data["URL de la vidéo"] || 'VIDE !'
        console.log('=== DEBUG URL BRUTE ===', rawUrl) // Dans la console
        setDebugInfo(`URL brute : ${rawUrl}`)

        // Favoris
        const favs = JSON.parse(localStorage.getItem('favorites') || '[]')
        setIsFavorite(favs.includes(data._id))

      } catch (err) {
        console.error(err)
        alert('Film introuvable ou tu n\'es pas connecté')
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

  // EXTRACTION MAGIQUE (avec debug)
  const extractVideoId = () => {
    if (!movie || !movie["URL de la vidéo"]) {
      const id = 'CHAMP VIDE OU MANQUANT'
      console.log('=== DEBUG EXTRACTION ===', id) // Console
      setDebugInfo(prev => `${prev} | ID extrait : ${id}`)
      return id
    }
    
    const url = movie["URL de la vidéo"].trim()
    const match = url.match(/\/(watch|v|embed)\/([a-zA-Z0-9_-]+)/i)
    const videoId = match ? match[2] : 'PAS TROUVÉ DANS L\'URL'
    
    console.log('=== DEBUG MATCH ===', { url, videoId }) // Console
    setDebugInfo(prev => `${prev} | ID extrait : ${videoId}`)
    
    return videoId
  }

  // URL EMBED
  const videoId = extractVideoId()
  const embedUrl = videoId && videoId !== 'CHAMP VIDE OU MANQUANT' && videoId !== 'PAS TROUVÉ DANS L\'URL' 
    ? `https://dintezuvio.com/embed/${videoId}` 
    : ''

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a0b0f] flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 border-4 border-t-transparent border-blue-500 rounded-full animate-spin mx-auto mb-6"></div>
          <p className="text-2xl text-white">Chargement du film...</p>
        </div>
      </div>
    )
  }

  if (!movie) return null

  return (
    <>
      <div className="min-h-screen bg-[#0a0b0f] text-white relative overflow-hidden">

        {/* Fond galactique */}
        <div className="fixed inset-0 pointer-events-none opacity-70">
          <div className="absolute top-0 left-0 w-96 h-96 bg-blue-600 rounded-full filter blur-3xl animate-pulse" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-green-600 rounded-full filter blur-3xl animate-pulse delay-1000" />
        </div>

        {/* Header */}
        <header className="fixed top-0 inset-x-0 z-50 bg-black/80 backdrop-blur-lg border-b border-white/10">
          <div className="container mx-auto px-6 py-5 flex justify-between items-center">
            <button onClick={() => router.back()} className="flex items-center gap-3 hover:text-blue-400 transition">
              <ArrowLeft size={28} />
              <span className="text-lg font-medium">Retour</span>
            </button>

            <button
              onClick={toggleFavorite}
              className={`flex items-center gap-3 px-6 py-3 rounded-full font-bold transition-all hover:scale-105 ${
                isFavorite ? 'bg-red-600 text-white shadow-lg shadow-red-600/50' : 'bg-white/10 backdrop-blur hover:bg-white/20'
              }`}
            >
              <Heart size={22} fill={isFavorite ? 'white' : 'none'} />
              {isFavorite ? 'Dans les favoris' : 'Ajouter aux favoris'}
            </button>
          </div>
        </header>

        <main className="container mx-auto px-6 pt-32 pb-20 max-w-7xl">

          {/* DEBUG PANEL (à enlever après) */}
          <div className="bg-yellow-900/50 border border-yellow-500 p-4 rounded-xl mb-6 text-sm">
            <p><strong>DEBUG :</strong> {debugInfo}</p>
            <p><strong>URL finale :</strong> {embedUrl || 'VIDÉO NON DISPONIBLE'}</p>
            <p><strong>Conseil :</strong> Ouvre la console (F12) pour plus de détails</p>
          </div>

          {/* Lecteur vidéo */}
          <div className="relative rounded-3xl overflow-hidden shadow-2xl bg-black mb-12 border border-white/10">
            <div className="aspect-video">
              {embedUrl ? (
                <iframe
                  src={embedUrl}
                  className="w-full h-full"
                  allowFullScreen
                  allow="autoplay; encrypted-media; picture-in-picture"
                  sandbox="allow-scripts allow-same-origin allow-presentation allow-popups"
                  title={movie.titre}
                  onLoad={() => console.log('=== IFRAME CHARGÉE ===', embedUrl)} // Debug load
                  onError={(e) => console.error('=== ERREUR IFRAME ===', e)} // Debug erreur
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-900 to-black">
                  <p className="text-2xl text-gray-400">Vidéo non disponible</p>
                </div>
              )}
            </div>
          </div>

          {/* Infos du film */}
          <div className="grid lg:grid-cols-[380px_1fr] gap-12">
            {/* Affiche */}
            <div>
              <Image
                src={movie["vignetteURL"] || '/placeholder.jpg'}
                alt={movie.titre}
                width={380}
                height={570}
                className="w-full rounded-3xl shadow-2xl border border-white/10 object-cover"
              />
            </div>

            {/* Détails */}
            <div className="space-y-8">
              <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-white via-blue-200 to-green-200 bg-clip-text text-transparent">
                {movie.titre}
              </h1>

              <div className="flex flex-wrap items-center gap-6 text-lg">
                <div className="flex items-center gap-2">
                  <Star className="text-yellow-500" fill="currentColor" />
                  <span>8.1/10</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar />
                  <span>{movie["année de sortie"]}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock />
                  <span>{movie.durée}</span>
                </div>
              </div>

              {/* Genres */}
              <div className="flex flex-wrap gap-3">
                {(movie.genre || []).map((g: string, i: number) => (
                  <span key={i} className="px-5 py-2 bg-blue-600/30 border border-blue-500/50 rounded-full backdrop-blur">
                    {g}
                  </span>
                ))}
              </div>

              <div>
                <h2 className="text-3xl font-bold mb-4">Synopsis</h2>
                <p className="text-xl leading-relaxed text-gray-300">
                  {movie.description}
                </p>
              </div>

              <button
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="flex items-center gap-4 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white px-10 py-5 rounded-2xl font-bold text-xl shadow-2xl shadow-blue-600/50 transform hover:scale-105 transition-all"
              >
                <Play size={32} fill="white" />
                Regarder le film
              </button>
            </div>
          </div>
        </main>
      </div>
    </>
  )
}
