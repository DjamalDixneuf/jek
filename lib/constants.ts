export const API_URL = "https://jekle.netlify.app/.netlify/functions/api"

export const ROUTES = {
  HOME: "/",
  LOGIN: "/login",
  DASHBOARD: "/dashboard",
  ADMIN_DASHBOARD: "/admin-dashboard",
  REQUESTS: "/requests",
  REQUEST_MOVIE: "/request-movie",
  USER_PAGE: "/user-page",
} as const

export const API_ENDPOINTS = {
  LOGIN: "/login",
  SIGNUP: "/signup",
  REFRESH_TOKEN: "/refresh-token",
  CHECK_AUTH: "/check-auth",
  UPDATE_PROFILE: "/update-profile",
  MOVIES: "/movies",
  MOVIE_REQUESTS: "/movie-requests",
  ADMIN_STATS: "/admin/stats",
  ADMIN_USERS: "/admin/users",
} as const

export const USER_ROLES = {
  ADMIN: "admin",
  USER: "user",
} as const

export const REQUEST_STATUS = {
  PENDING: "pending",
  APPROVED: "approved",
  REJECTED: "rejected",
} as const

export const MOVIE_TYPES = {
  FILM: "film",
  SERIE: "série",
} as const

export const GENRES = [
  "Action",
  "Aventure",
  "Animation",
  "Comédie",
  "Crime",
  "Documentaire",
  "Drame",
  "Familial",
  "Fantastique",
  "Histoire",
  "Horreur",
  "Musique",
  "Mystère",
  "Romance",
  "Science-Fiction",
  "Thriller",
  "Guerre",
  "Western",
] as const
