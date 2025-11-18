'use client'

import React, { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import './styles/id.css'

export default function WatchPage() {
  const router = useRouter()
  const { id } = useParams()
  const [movie, setMovie] = useState<any>(null)
  const [isFavorite, setIsFavorite] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) return router.push('/login')

    fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/.netlify/functions/api/movies/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => r.json())
      .then(data => {
        setMovie(data)
        const favs = JSON.parse(localStorage.getItem('favorites') || '[]')
        setIsFavorite(favs.includes(data._id))
      })
  }, [id, router])

  const toggleFavorite = () => {
    const favs = JSON.parse(localStorage.getItem('favorites') || '[]')
    if (isFavorite) {
      localStorage.setItem('favorites', JSON.stringify(favs.filter((f: string) => f !== movie._id)))
    } else {
      favs.push(movie._id)
      localStorage.setItem('favorites', JSON.stringify(favs))
    }
    setIsFavorite(!isFavorite)
  }

  if (!movie) return <div className="min-h-screen bg-black flex items-center justify-center text-3xl">Chargement...</div>

  const videoId = movie.videoId || movie.videoUrl?.split('/watch/')[1] || ''
  const embedUrl = `https://dintezuvio.com/embed/${videoId}`

  return (
    <div className="watch-container">
      {/* Header */}
      <div className="watch-header">
        <button onClick={() => router.back()} className="btn-back">
          ← Retour
        </button>
        <button onClick={toggleFavorite} className={`btn-fav ${isFavorite ? 'added' : ''}`}>
          {isFavorite ? '❤️ Ajouté' : '♡ Ajouter aux favoris'}
        </button>
      </div>

      {/* Lecteur vidéo */}
      <div className="video-wrapper">
        <iframe
          src={embedUrl}
          allowFullScreen
          allow="autoplay; encrypted-media; fullscreen"
        />
      </div>

      {/* Infos film */}
      <div className="movie-info">
        <h1 className="movie-title">
          {movie.title} <span>({movie.releaseYear})</span>
        </h1>
        <p className="movie-duration">Durée : {movie.duration}</p>
        <div className="movie-genres">
          {(movie.genre || []).map((g: string) => (
            <span key={g} className="genre-tag">{g}</span>
          ))}
        </div>
        <p className="movie-synopsis">{movie.description}</p>
      </div>
    </div>
  )
}
