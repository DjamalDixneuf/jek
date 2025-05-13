import { Skeleton } from "@/components/ui/skeleton"

export default function RequestsLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-950">
      {/* Header skeleton */}
      <header className="bg-gray-900/80 backdrop-blur-md border-b border-gray-800">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Skeleton className="h-9 w-32 rounded-md" />

            <div className="flex items-center space-x-4">
              <Skeleton className="w-10 h-10 rounded-full" />
              <Skeleton className="h-6 w-40" />
            </div>
          </div>
        </div>
      </header>

      {/* Main content skeleton */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <Skeleton className="h-[400px] rounded-xl" />
            <Skeleton className="h-[300px] rounded-xl" />
          </div>

          <Skeleton className="h-[600px] rounded-xl" />
        </div>
      </main>
    </div>
  )
}
