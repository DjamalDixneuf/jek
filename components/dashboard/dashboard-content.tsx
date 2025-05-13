"use client"

import { useRouter } from "next/navigation"

export default function DashboardContent() {
  const router = useRouter()

  const handleLogout = () => {
    router.push("/")
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <header className="bg-gray-800 p-4 border-b border-gray-700">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold text-white">Jekle Entertainment</h1>
          <div className="flex space-x-2">
            <button
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              onClick={() => router.push("/requests")}
            >
              Request Movie
            </button>
            <button className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="container mx-auto p-4">
        <h2 className="text-2xl font-bold mb-6 text-white">Available Movies & Series</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6].map((item) => (
            <div key={item} className="bg-gray-800 rounded-lg overflow-hidden">
              <div className="aspect-[2/3] bg-gray-700"></div>
              <div className="p-4">
                <h3 className="font-bold">Movie Title {item}</h3>
                <p className="text-sm text-gray-400">2h 30m</p>
                <p className="text-sm text-gray-400">Action, Adventure</p>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}
