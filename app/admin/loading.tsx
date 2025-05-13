import { Skeleton } from "../../components/ui/skeleton"

export default function AdminLoading() {
  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header skeleton */}
      <header className="bg-gray-800 p-4 border-b border-gray-700">
        <div className="container mx-auto flex justify-between items-center">
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-10 w-20" />
        </div>
      </header>

      {/* Main content skeleton */}
      <main className="container mx-auto p-4">
        <Skeleton className="h-10 w-full mb-6" />

        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-16 rounded-lg" />
          ))}
        </div>
      </main>
    </div>
  )
}
