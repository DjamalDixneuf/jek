// app/watch/[id]/page.tsx
'use client'

import React, { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { ArrowLeft, Heart } from 'lucide-react'

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

  if (!movie) return <div className="min-h-screen bg-[#0a0b0f] flex items-center justify-center text-3xl text-white">Chargement...</div>

  const videoId = movie.videoId || movie.videoUrl?.split('/watch/')[1] || ''
  // PROXY QUI CONTOURNE X-Frame-Options
  const embedUrl = videoId 
    ? `/.netlify/functions/proxy?url=${encodeURIComponent(`https://dintezuvio.com/embed/${videoId}`)}`
    : ''

  return (
    <>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: "Poppins", sans-serif; background: #0a0b0f; min-height: 100vh; color: white; overflow-x: hidden; }
        body::before { content: ""; position: absolute; width: 350px; height: 350px; background: linear-gradient(45deg, #1a73e8, #4285f4); border-radius: 50%; filter: blur(90px); opacity: 0.12; top: -150px; left: -150px; z-index: -1; }
        body::after { content: ""; position: absolute; width: 350px; height: 350px; background: linear-gradient(45deg, #0f9d58, #1a73e8); border-radius: 50%; filter: blur(90px); opacity: 0.12; bottom: -150px; right: -150px; z-index: -1; }

        .particles { position: fixed; inset: 0; pointer-events: none; }
        .particle { position: absolute; width: 4px; height: 4px; background: rgba(26, 115, 232, 0.3); border-radius: 50%; animation: float 15s infinite linear; }
        @keyframes float { 0%, 100% { opacity: 0; transform: translateY(100vh); } 10%, 90% { opacity: 1; } }

        .container { max-width: 1300px; margin: 30px auto; padding: 0 20px; position: relative; z-index: 1; }
        .watch-card { background: rgba(18,20,28,0.9); backdrop-filter: blur(16px); border: 1px solid rgba(255,255,255,0.1); border-radius: 24px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.5); position: relative; }
        .watch-card::before { content: ""; position: absolute; top: 0; left: 0; width: 100%; height: 7px; background: linear-gradient(90deg, #1a73e8, #4285f4, #0f9d58); }
        .header-actions { padding: 20px 30px 0; display: flex; justify-content: space-between; }
        .btn { padding: 12px 24px; border: none; border-radius: 50px; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 10px; transition: 0.3s; }
        .back-btn { background: rgba(255,255,255,0.1); color: white; }
        .back-btn:hover { background: rgba(255,255,255,0.2); }
        .fav-btn { background: ${isFavorite ? '#ff6b6b' : 'rgba(229,62,62,0.2)'}; color: ${isFavorite ? 'white' : '#ff6b6b'}; border: 1px solid rgba(229,62,62,0.3); }
        .fav-btn:hover { background: #ff6b6b; color: white; }
        .video-container { position: relative; padding-bottom: 56.25%; background: #000; }
        .video-container iframe { position: absolute; inset: 0; width: 100%; height: 100%; border: none; }
        .movie-info { padding: 35px; }
        .movie-title { font-size: 2.8rem; font-weight: 700; background: linear-gradient(90deg, #fff, #a0c4ff, #90ee90); -webkit-background-clip: text; color: transparent; }
        .genres { display: flex; flex-wrap: wrap; gap: 12px; margin: 25px 0; }
        .genre-tag { background: linear-gradient(45deg, #1a73e8, #4285f4); padding: 10px 20px; border-radius: 30px; }
      `}</style>

      <div className="particles">
        {[...Array(25)].map((_, i) => (
          <div key={i} className="particle" style={{ left: `${Math.random()*100}%`, animationDelay: `${Math.random()*15}s` }} />
        ))}
      </div>

      <div className="container">
        <div className="watch-card">
          <div className="header-actions">
            <button onClick={() => router.back()} className="btn back-btn">
              <ArrowLeft size={20} /> Retour
            </button>
            <button onClick={toggleFavorite} className="btn fav-btn">
              <Heart size={20} fill={isFavorite ? 'white' : 'none'} />
              {isFavorite ? 'Ajouté' : 'Ajouter aux favoris'}
            </button>
          </div>

          <div className="video-container">
            <iframe src={embedUrl} allowFullScreen allow="autoplay; fullscreen" />
          </div>

          <div className="movie-info">
            <h1 className="movie-title">{movie.title} <span style={{fontSize:'2rem',color:'#aaa'}}>({movie.releaseYear})</span></h1>
            <div style={{color:'#aaa',margin:'15px 0'}}>{movie.duration}</div>
            <div className="genres">
              {(movie.genre || []).map((g: string) => <span key={g} className="genre-tag">{g}</span>)}
            </div>
            <p style={{lineHeight:'1.8',color:'#e0e0e0',fontSize:'1.15rem'}}>{movie.description}</p>
          </div>
        </div>
      </div>
    </>
  )
}
