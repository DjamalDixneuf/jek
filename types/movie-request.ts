export interface MovieRequest {
  _id: string
  title: string
  imdbLink: string
  comment?: string
  userId: string
  status: "pending" | "approved" | "rejected"
  createdAt: string
}
