"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function AdminDashboard() {
  const router = useRouter()
  const [users] = useState([
    { id: "1", username: "user1", email: "user1@example.com", isBanned: false },
    { id: "2", username: "user2", email: "user2@example.com", isBanned: true },
  ])
  const [movies] = useState([
    { id: "1", title: "The Matrix", type: "film", genre: "Sci-Fi", duration: "2h 16m", releaseYear: "1999" },
    { id: "2", title: "Inception", type: "film", genre: "Sci-Fi", duration: "2h 28m", releaseYear: "2010" },
  ])
  const [requests] = useState([
    { id: "1", title: "The Godfather", imdbLink: "https://www.imdb.com/title/tt0068646/", status: "pending" },
    { id: "2", title: "Pulp Fiction", imdbLink: "https://www.imdb.com/title/tt0110912/", status: "approved" },
  ])

  const handleLogout = () => {
    router.push("/")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-950">
      <header className="bg-gray-900/80 backdrop-blur-md border-b border-gray-800">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold text-white">Admin Dashboard</h1>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="users" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="movies">Movies & Series</TabsTrigger>
            <TabsTrigger value="requests">Requests</TabsTrigger>
          </TabsList>

          <TabsContent value="users" className="space-y-4">
            <h2 className="text-2xl font-bold">User Management</h2>
            <div className="bg-gray-800 rounded-lg p-4">
              <table className="w-full">
                <thead>
                  <tr>
                    <th className="text-left p-2">Username</th>
                    <th className="text-left p-2">Email</th>
                    <th className="text-left p-2">Status</th>
                    <th className="text-right p-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id}>
                      <td className="p-2">{user.username}</td>
                      <td className="p-2">{user.email}</td>
                      <td className="p-2">{user.isBanned ? "Banned" : "Active"}</td>
                      <td className="p-2 text-right">
                        <Button variant="outline" size="sm" className="mr-2">
                          {user.isBanned ? "Unban" : "Ban"}
                        </Button>
                        <Button variant="destructive" size="sm">
                          Delete
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </TabsContent>

          <TabsContent value="movies" className="space-y-4">
            <h2 className="text-2xl font-bold">Movies & Series Management</h2>
            <div className="bg-gray-800 rounded-lg p-4">
              <table className="w-full">
                <thead>
                  <tr>
                    <th className="text-left p-2">Title</th>
                    <th className="text-left p-2">Type</th>
                    <th className="text-left p-2">Genre</th>
                    <th className="text-left p-2">Duration</th>
                    <th className="text-left p-2">Year</th>
                    <th className="text-right p-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {movies.map((movie) => (
                    <tr key={movie.id}>
                      <td className="p-2">{movie.title}</td>
                      <td className="p-2">{movie.type}</td>
                      <td className="p-2">{movie.genre}</td>
                      <td className="p-2">{movie.duration}</td>
                      <td className="p-2">{movie.releaseYear}</td>
                      <td className="p-2 text-right">
                        <Button variant="destructive" size="sm">
                          Delete
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </TabsContent>

          <TabsContent value="requests" className="space-y-4">
            <h2 className="text-2xl font-bold">Movie Requests</h2>
            <div className="bg-gray-800 rounded-lg p-4">
              <table className="w-full">
                <thead>
                  <tr>
                    <th className="text-left p-2">Title</th>
                    <th className="text-left p-2">IMDB Link</th>
                    <th className="text-left p-2">Status</th>
                    <th className="text-right p-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {requests.map((request) => (
                    <tr key={request.id}>
                      <td className="p-2">{request.title}</td>
                      <td className="p-2">
                        <a
                          href={request.imdbLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-400 hover:underline"
                        >
                          IMDB Link
                        </a>
                      </td>
                      <td className="p-2">{request.status}</td>
                      <td className="p-2 text-right">
                        {request.status === "pending" && (
                          <>
                            <Button variant="outline" size="sm" className="mr-2">
                              Approve
                            </Button>
                            <Button variant="destructive" size="sm">
                              Reject
                            </Button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
