export interface Movie {
  _id: string
  title: string
  type: "film" | "série"
  duration: string
  description: string
  genre: string
  releaseYear: string
  thumbnailUrl: string
  videoUrl?: string
  episodes?: {
    url: string
    description: string
  }[]
  createdAt: string
  updatedAt: string
}
