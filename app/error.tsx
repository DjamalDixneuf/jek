"use client"

import { useEffect } from "react"
import Link from "next/link"
import { Button } from "../components/ui/button"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 bg-gray-900">
      <div className="w-full max-w-md p-8 space-y-8 bg-gray-800 rounded-xl border border-gray-700 shadow-xl text-center">
        <h1 className="text-4xl font-bold text-white">Something went wrong</h1>
        <p className="text-gray-400">
          An error occurred while loading this page. Please try again or return to the home page.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4 mt-6">
          <button onClick={reset} className="py-2 px-4 bg-gray-700 text-white rounded-md hover:bg-gray-600">
            Try Again
          </button>
          <Link href="/">
            <Button>Back to Home</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
