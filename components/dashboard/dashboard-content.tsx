"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function DashboardContent() {
  const router = useRouter()
  const [movies] = useState([
    {
      id: "1",
      title: "The Matrix",
      type: "film",
      duration: "2h 16m",
      description: "A computer hacker learns about the true nature of reality.",
      thumbnailUrl: "/placeholder.svg?height=300&width=200",
    },
    {
      id: "2",
      title: "Inception",
      type: "film",
      duration: "2h 28m",
      description: "A thief who steals corporate secrets through dream-sharing technology.",
      thumbnailUrl: "/placeholder.svg?height=300&width=200",
    },
  ])

  const handleLogout = () => {
    router.push("/")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-950">
      <header className="bg-gray-900/80 backdrop-blur-md border-b border-gray-800">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold text-white">Jekle Entertainment</h1>
            <div className="flex items-center space-x-2">
              <Link href="/requests">
                <Button variant="outline" size="sm">
                  Request Movie
                </Button>
              </Link>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold mb-6 text-white">Available Movies & Series</h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {movies.map((movie) => (
            <div key={movie.id} className="bg-gray-800 rounded-lg overflow-hidden">
              <div className="aspect-[2/3] relative">
                <div
                  className="w-full h-full bg-gray-700"
                  style={{
                    backgroundImage: `url(${movie.thumbnailUrl})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }}
                ></div>
              </div>
              <div className="p-4">
                <h3 className="font-bold">{movie.title}</h3>
                <p className="text-sm text-gray-400">{movie.duration}</p>
                <p className="text-sm text-gray-400">{movie.type}</p>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}
