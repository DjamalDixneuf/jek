"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

export default function AdminDashboard() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("users")

  const handleLogout = () => {
    router.push("/")
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <header className="bg-gray-800 p-4 border-b border-gray-700">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold text-white">Admin Dashboard</h1>
          <button onClick={handleLogout} className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">
            Logout
          </button>
        </div>
      </header>

      <main className="container mx-auto p-4">
        <div className="mb-6">
          <div className="flex border-b border-gray-700">
            <button
              className={`px-4 py-2 ${activeTab === "users" ? "border-b-2 border-blue-500 text-blue-500" : "text-gray-400"}`}
              onClick={() => setActiveTab("users")}
            >
              Users
            </button>
            <button
              className={`px-4 py-2 ${activeTab === "movies" ? "border-b-2 border-blue-500 text-blue-500" : "text-gray-400"}`}
              onClick={() => setActiveTab("movies")}
            >
              Movies & Series
            </button>
            <button
              className={`px-4 py-2 ${activeTab === "requests" ? "border-b-2 border-blue-500 text-blue-500" : "text-gray-400"}`}
              onClick={() => setActiveTab("requests")}
            >
              Requests
            </button>
          </div>
        </div>

        {activeTab === "users" && (
          <div className="bg-gray-800 p-4 rounded">
            <h2 className="text-xl font-bold mb-4">User Management</h2>
            <p className="text-gray-400">User management interface will be displayed here.</p>
          </div>
        )}

        {activeTab === "movies" && (
          <div className="bg-gray-800 p-4 rounded">
            <h2 className="text-xl font-bold mb-4">Movies & Series Management</h2>
            <p className="text-gray-400">Movies and series management interface will be displayed here.</p>
          </div>
        )}

        {activeTab === "requests" && (
          <div className="bg-gray-800 p-4 rounded">
            <h2 className="text-xl font-bold mb-4">Movie Requests</h2>
            <p className="text-gray-400">Movie requests interface will be displayed here.</p>
          </div>
        )}
      </main>
    </div>
  )
}
