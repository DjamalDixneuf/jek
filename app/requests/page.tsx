import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import MovieRequestForm from "@/components/requests/movie-request-form"

export const metadata: Metadata = {
  title: "Jekle - Request Movies",
  description: "Request your favorite movies and series",
}

export default async function RequestsPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/")
  }

  return <MovieRequestForm />
}
