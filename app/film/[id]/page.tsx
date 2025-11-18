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
      .catch(() => router.push('/user'))
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

  if (!movie) return (
    <div style={{ minHeight: '100vh', background: '#0a0b0f', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ fontSize: '2rem', color: 'white' }}>Chargement...</div>
    </div>
  )

  const videoId = movie.videoId || movie.videoUrl?.split('/watch/')[1] || ''
  const embedUrl = `https://dintezuvio.com/embed/${videoId}`

  return (
    <>
      {/* TON STYLE DE OUF DIRECT DANS LE JSX (pas besoin de fichier CSS séparé) */}
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');
        
        * { margin: 0; padding: 0; box-sizing: border-box; }
        
        body {
          font-family: "Poppins", sans-serif;
          background: #0a0b0f;
          background-image: radial-gradient(circle at 10% 20%, rgba(26, 115, 232, 0.1) 0%, transparent 20%),
                                    radial-gradient(circle at 90% 80%, rgba(15, 157, 88, 0.1) 0%, transparent 20%);
          color: white;
          min-height: 100vh;
          position: relative;
          overflow-x: hidden;
        }

        body::before, body::after {
          content: ""; position: absolute; width: 350px; height: 350px;
          border-radius: 50%; filter: blur(90px); opacity: 0.12; z-index: -1;
        }
        body::before { background: linear-gradient(45deg, #1a73e8, #4285f4); top: -150px; left: -150px; }
        body::after { background: linear-gradient(45deg, #0f9d58, #1a73e8); bottom: -150px; right: -150px; }

        .particles { position: fixed; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none; z-index: 0; }
        .particle { 
          position: absolute; background: rgba(26, 115, 232, 0.3); width: 4px; height: 4px;
          border-radius: 50%; animation: float 15s infinite linear;
        }
        @keyframes float { 
          0% { transform: translateY(100vh) translateX(0); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translateY(-100px) translateX(100px); opacity: 0; } 
        }

        .container { position: relative; z-index: 1; width: 95%; max-width: 1300px; margin: 30px auto; }

        .watch-card {
          background: rgba(18, 20, 28, 0.9);
          backdrop-filter: blur(16px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 24px;
          overflow: hidden;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5);
          position: relative;
        }

        .watch-card::before {
          content: ""; position: absolute; top: 0; left: 0; width: 100%; height: 7px;
          background: linear-gradient(90deg, #1a73e8, #4285f4, #0f9d58);
          z-index: 2;
        }

        .header-actions {
          padding: 20px 30px 0;
          display: flex; justify-content: space-between; align-items: center;
          z-index: 10;
        }

        .back-btn, .fav-btn {
          padding: 12px 24px;
          border: none;
          border-radius: 50px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex; align-items: center; gap: 10px;
          font-size: 1rem;
        }

        .back-btn {
          background: rgba(255, 255, 255, 0.1);
          color: white;
        }
        .back-btn:hover { background: rgba(255, 255, 255, 0.2); transform: translateX(-5px); }

        .fav-btn {
          background: ${isFavorite ? '#ff6b6b' : 'rgba(229, 62, 62, 0.2)'};
          color: ${isFavorite ? 'white' : '#ff6b6b'};
          border: 1px solid rgba(229, 62, 62, 0.3);
        }
        .fav-btn:hover { background: #ff6b6b; color: white; }

        .video-container {
          position: relative;
          padding-bottom: 56.25%;
          background: #000;
        }
        .video-container iframe {
          position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: none;
        }

        .movie-info { padding: 35px; }
        .movie-title {
          font-size: 2.8rem;
          font-weight: 700;
          background: linear-gradient(90deg, #ffffff, #a0c4ff, #90ee90);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          margin-bottom: 10px;
        }
        .movie-meta { display: flex; gap: 25px; color: #aaa; font-size: 1.1rem; margin: 15px 0; }
        .genres { display: flex; flex-wrap: wrap; gap: 12px; margin: 25px 0; }
        .genre-tag {
          background: linear-gradient(45deg, #1a73e8, #4285f4);
          padding: 10px 20px; border-radius: 30px; font-size: 0.95rem; font-weight: 500;
        }
        .description {
          line-height: 1.8; color: #e0e0e0; font-size: 1.15rem; margin-top: 20px;
        }

        @media (max-width: 768px) {
          .movie-title { font-size: 2.2rem; }
          .header-actions { flex-direction: column; gap: 15px; align-items: stretch; }
          .movie-info { padding: 25px; }
        }
      `}</style>

      {/* Particules flottantes */}
      <div className="particles">
        {[...Array(25)].map((_, i) => (
          <div
            key={i}
            className="particle"
            style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 15}s`,
              animationDuration: `${15 + Math.random() * 10}s`
            }}
          />
        ))}
      </div>

      <div className="container">
        <div className="watch-card">

          <div className="header-actions">
            <button onClick={() => router.back()} className="back-btn">
              <ArrowLeft size={20} /> Retour
            </button>
            <button onClick={toggleFavorite} className="fav-btn">
              <Heart size={20} fill={isFavorite ? 'white' : 'none'} />
              {isFavorite ? 'Ajouté' : 'Ajouter aux favoris'}
            </button>
          </div>

          <div className="video-container">
            <iframe
              src={embedUrl}
              allowFullScreen
              allow="autoplay; encrypted-media; fullscreen"
            />
          </div>

          <div className="movie-info">
            <h1 className="movie-title">
              {movie.title} <span style={{ fontSize: '2rem', color: '#aaa' }}>({movie.releaseYear})</span>
            </h1>

            <div className="movie-meta">
              <span>{movie.duration}</span>
              <span>•</span>
              <span>{movie.type === 'film' ? 'Film' : 'Série'}</span>
            </div>

            <div className="genres">
              {(movie.genre || []).map((g: string) => (
                <span key={g} className="genre-tag">{g}</span>
              ))}
            </div>

            <p className="description">{movie.description}</p>
          </div>
        </div>
      </div>
    </>
  )
}
