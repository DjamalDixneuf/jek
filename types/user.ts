export interface User {
  _id: string
  username: string
  email: string
  role: "user" | "admin"
  isBanned: boolean
  createdAt: string
}
