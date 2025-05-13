import { Skeleton } from "@/components/ui/skeleton"

export default function RootLoading() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-gradient-to-br from-gray-900 to-gray-950">
      <div className="w-full max-w-md p-8 space-y-8 bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 shadow-xl">
        <div className="flex flex-col items-center space-y-2">
          <Skeleton className="w-16 h-16 rounded-full" />
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-4 w-48" />
        </div>

        <div className="space-y-6">
          <Skeleton className="h-10 w-full rounded-md" />
          <div className="space-y-4">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
      </div>
    </main>
  )
}
