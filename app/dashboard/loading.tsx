import { Skeleton } from "@/components/ui/skeleton"

export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-950">
      {/* Header skeleton */}
      <header className="sticky top-0 z-10 bg-gray-900/80 backdrop-blur-md border-b border-gray-800">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Skeleton className="w-10 h-10 rounded-full" />
              <Skeleton className="h-6 w-40 hidden md:block" />
            </div>

            <div className="hidden md:flex items-center space-x-4 flex-1 max-w-md mx-4">
              <Skeleton className="h-10 w-full rounded-md" />
            </div>

            <div className="flex items-center space-x-2">
              <Skeleton className="h-9 w-32 rounded-md hidden md:block" />
              <Skeleton className="h-9 w-9 rounded-md" />
            </div>
          </div>
        </div>
      </header>

      {/* Main content skeleton */}
      <main className="container mx-auto px-4 py-8">
        <Skeleton className="h-8 w-64 mb-6" />

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
          {[...Array(12)].map((_, i) => (
            <Skeleton key={i} className="aspect-[2/3] rounded-lg" />
          ))}
        </div>
      </main>
    </div>
  )
}
