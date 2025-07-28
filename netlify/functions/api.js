const express = require("express")
const cors = require("cors")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const { MongoClient, ObjectId } = require("mongodb")
const nodemailer = require("nodemailer")
const serverless = require("serverless-http")

const app = express()

// Middleware
app.use(
  cors({
    origin: "*",
    credentials: true,
  }),
)
app.use(express.json())

// Environment variables
const MONGODB_URI = process.env.MONGODB_URI
const JWT_SECRET = process.env.JWT_SECRET || "your-fallback-secret-key"
const EMAIL_USER = process.env.EMAIL_USER
const EMAIL_PASS = process.env.EMAIL_PASS

// Validate environment variables
if (!MONGODB_URI) {
  console.error("MONGODB_URI environment variable is missing")
}
if (!JWT_SECRET || JWT_SECRET === "your-fallback-secret-key") {
  console.warn("JWT_SECRET should be set in environment variables")
}

// Database connection with caching
let cachedDb = null
async function connectToDatabase() {
  if (cachedDb) {
    return cachedDb
  }

  if (!MONGODB_URI) {
    throw new Error("MONGODB_URI environment variable is not set")
  }

  try {
    console.log("Connecting to MongoDB...")
    const client = await MongoClient.connect(MONGODB_URI, {
      connectTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
    })

    const db = client.db("jekledb")
    await db.command({ ping: 1 })
    cachedDb = db
    console.log("MongoDB connection successful")
    return db
  } catch (error) {
    console.error("MongoDB connection error:", error)
    if (error.name === "MongoNetworkError") {
      console.error("Network error connecting to MongoDB. Check your connection and MONGODB_URI.")
    } else if (error.name === "MongoServerSelectionError") {
      console.error("Could not select MongoDB server. The server might be down or the URI might be incorrect.")
    }
    throw error
  }
}

// Email transporter setup
let transporter = null
if (EMAIL_USER && EMAIL_PASS) {
  transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: EMAIL_USER,
      pass: EMAIL_PASS,
    },
  })
}

// Utility function to transform Google Drive URLs
function getEmbedUrl(url) {
  if (!url) return url

  const driveMatch = url.match(/(?:https?:\/\/)?(?:www\.)?drive\.google\.com\/file\/d\/([^/]+)/)
  if (driveMatch) {
    const fileId = driveMatch[1]
    return `https://drive.google.com/file/d/${fileId}/preview`
  }
  return url
}

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"]
  const token = authHeader && authHeader.split(" ")[1]

  if (!token) {
    return res.status(401).json({ message: "Authentication token missing" })
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      console.error("Token verification error:", err)
      return res.status(403).json({ message: "Invalid or expired token" })
    }
    req.user = user
    next()
  })
}

// Admin middleware
const isAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ message: "Admin access required" })
  }
  next()
}

// Test route
app.get("/", (req, res) => {
  res.json({
    message: "Jekle API is working!",
    timestamp: new Date().toISOString(),
    version: "1.0.0",
  })
})

// Health check route
app.get("/health", async (req, res) => {
  try {
    const db = await connectToDatabase()
    await db.command({ ping: 1 })
    res.json({
      status: "healthy",
      database: "connected",
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    res.status(500).json({
      status: "unhealthy",
      database: "disconnected",
      error: error.message,
      timestamp: new Date().toISOString(),
    })
  }
})

// ==================== USER AUTHENTICATION ROUTES ====================

// Signup route
app.post("/signup", async (req, res) => {
  try {
    const { username, email, password } = req.body

    // Validation
    if (!username || !email || !password) {
      return res.status(400).json({ message: "Tous les champs sont requis" })
    }

    if (username.length < 3) {
      return res.status(400).json({ message: "Le nom d'utilisateur doit contenir au moins 3 caractères" })
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Le mot de passe doit contenir au moins 6 caractères" })
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Format d'email invalide" })
    }

    const db = await connectToDatabase()

    // Check if user already exists
    const existingUser = await db.collection("users").findOne({
      $or: [{ username }, { email }],
    })

    if (existingUser) {
      if (existingUser.username === username) {
        return res.status(400).json({ message: "Ce nom d'utilisateur est déjà pris" })
      }
      if (existingUser.email === email) {
        return res.status(400).json({ message: "Cette adresse email est déjà utilisée" })
      }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Create user
    const newUser = {
      username,
      email,
      password: hashedPassword,
      role: "user",
      isBanned: false,
      isVerified: true, // Auto-verify for now
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const result = await db.collection("users").insertOne(newUser)
    console.log(`User ${username} created successfully with ID: ${result.insertedId}`)

    // Generate tokens
    const token = jwt.sign(
      {
        userId: result.insertedId.toString(),
        username,
        role: "user",
      },
      JWT_SECRET,
      { expiresIn: "24h" },
    )

    const refreshToken = jwt.sign(
      {
        userId: result.insertedId.toString(),
        username,
      },
      JWT_SECRET,
      { expiresIn: "7d" },
    )

    res.status(201).json({
      message: "Compte créé avec succès",
      token,
      refreshToken,
      username,
      role: "user",
    })
  } catch (error) {
    console.error("Signup error:", error)
    res.status(500).json({
      message: "Erreur serveur lors de la création du compte",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    })
  }
})

// Login route
app.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body

    // Validation
    if (!username || !password) {
      return res.status(400).json({ message: "Nom d'utilisateur et mot de passe requis" })
    }

    // Admin login hardcoded
    if (username === "djamalax19" && password === "Tiger19667") {
      const token = jwt.sign(
        {
          userId: "admin",
          username: "djamalax19",
          role: "admin",
        },
        JWT_SECRET,
        { expiresIn: "24h" },
      )
      const refreshToken = jwt.sign(
        {
          userId: "admin",
          username: "djamalax19",
          role: "admin",
        },
        JWT_SECRET,
        { expiresIn: "7d" },
      )

      console.log("Admin login successful")
      return res.json({
        token,
        refreshToken,
        role: "admin",
        username: "djamalax19",
        message: "Connexion admin réussie",
      })
    }

    const db = await connectToDatabase()

    // Find user
    const user = await db.collection("users").findOne({ username })
    if (!user) {
      return res.status(401).json({ message: "Nom d'utilisateur ou mot de passe incorrect" })
    }

    // Check if user is banned
    if (user.isBanned) {
      return res.status(403).json({ message: "Votre compte a été suspendu. Contactez l'administrateur." })
    }

    // Verify password
    const validPassword = await bcrypt.compare(password, user.password)
    if (!validPassword) {
      return res.status(401).json({ message: "Nom d'utilisateur ou mot de passe incorrect" })
    }

    // Generate tokens
    const token = jwt.sign(
      {
        userId: user._id.toString(),
        username: user.username,
        role: user.role,
      },
      JWT_SECRET,
      { expiresIn: "24h" },
    )

    const refreshToken = jwt.sign(
      {
        userId: user._id.toString(),
        username: user.username,
        role: user.role,
      },
      JWT_SECRET,
      { expiresIn: "7d" },
    )

    // Update last login
    await db.collection("users").updateOne({ _id: user._id }, { $set: { lastLogin: new Date() } })

    console.log(`User ${username} logged in successfully`)
    res.json({
      token,
      refreshToken,
      role: user.role,
      username: user.username,
      message: "Connexion réussie",
    })
  } catch (error) {
    console.error("Login error:", error)
    res.status(500).json({
      message: "Erreur serveur lors de la connexion",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    })
  }
})

// Token refresh route
app.post("/refresh-token", async (req, res) => {
  const { refreshToken } = req.body

  if (!refreshToken) {
    return res.status(401).json({ message: "Token de rafraîchissement manquant" })
  }

  try {
    const decoded = jwt.verify(refreshToken, JWT_SECRET)
    const newToken = jwt.sign(
      {
        userId: decoded.userId,
        username: decoded.username,
        role: decoded.role,
      },
      JWT_SECRET,
      { expiresIn: "24h" },
    )

    res.json({ token: newToken })
  } catch (error) {
    console.error("Token refresh error:", error)
    res.status(403).json({ message: "Token de rafraîchissement invalide" })
  }
})

// Auth check route
app.get("/check-auth", authenticateToken, async (req, res) => {
  try {
    if (req.user.userId === "admin") {
      return res.json({
        username: "djamalax19",
        role: "admin",
        isAdmin: true,
      })
    }

    const db = await connectToDatabase()
    const user = await db
      .collection("users")
      .findOne({ _id: new ObjectId(req.user.userId) }, { projection: { password: 0 } })

    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé" })
    }

    if (user.isBanned) {
      return res.status(403).json({ message: "Compte suspendu" })
    }

    res.json({
      username: user.username,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
      isAdmin: user.role === "admin",
    })
  } catch (error) {
    console.error("Error fetching user info:", error)
    res.status(500).json({ message: "Erreur lors de la récupération des informations utilisateur" })
  }
})

// Update profile
app.post("/update-profile", authenticateToken, async (req, res) => {
  try {
    const { username, email } = req.body
    const userId = req.user.userId

    if (userId === "admin") {
      return res.status(400).json({ message: "Impossible de modifier le profil admin" })
    }

    if (!username && !email) {
      return res.status(400).json({ message: "Au moins un champ doit être fourni" })
    }

    const db = await connectToDatabase()
    const updateFields = {}

    // Check username availability
    if (username) {
      if (username.length < 3) {
        return res.status(400).json({ message: "Le nom d'utilisateur doit contenir au moins 3 caractères" })
      }

      const existingUser = await db.collection("users").findOne({
        username,
        _id: { $ne: new ObjectId(userId) },
      })

      if (existingUser) {
        return res.status(400).json({ message: "Ce nom d'utilisateur est déjà pris" })
      }

      updateFields.username = username
    }

    // Check email availability
    if (email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(email)) {
        return res.status(400).json({ message: "Format d'email invalide" })
      }

      const existingUser = await db.collection("users").findOne({
        email,
        _id: { $ne: new ObjectId(userId) },
      })

      if (existingUser) {
        return res.status(400).json({ message: "Cette adresse email est déjà utilisée" })
      }

      updateFields.email = email
    }

    updateFields.updatedAt = new Date()

    const result = await db.collection("users").updateOne({ _id: new ObjectId(userId) }, { $set: updateFields })

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: "Utilisateur non trouvé" })
    }

    res.json({
      message: "Profil mis à jour avec succès",
      updatedFields: Object.keys(updateFields).filter((key) => key !== "updatedAt"),
    })
  } catch (error) {
    console.error("Error updating profile:", error)
    res.status(500).json({ message: "Erreur lors de la mise à jour du profil" })
  }
})

// ==================== MOVIES ROUTES ====================

// Get movies with filtering and pagination
app.get("/movies", authenticateToken, async (req, res) => {
  try {
    const { genre, type, search, page = 1, limit = 20 } = req.query
    const skip = (Number.parseInt(page) - 1) * Number.parseInt(limit)

    const db = await connectToDatabase()

    // Build filter
    const filter = {}

    if (genre && genre !== "all") {
      filter.genre = { $in: Array.isArray(genre) ? genre : [genre] }
    }

    if (type && type !== "all") {
      filter.type = type
    }

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { genre: { $regex: search, $options: "i" } },
      ]
    }

    // Get total count for pagination
    const total = await db.collection("movies").countDocuments(filter)

    // Get movies
    const movies = await db
      .collection("movies")
      .find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number.parseInt(limit))
      .toArray()

    // Transform Google Drive URLs
    const transformedMovies = movies.map((movie) => {
      if (movie.type === "film" && movie.videoUrl) {
        movie.videoUrl = getEmbedUrl(movie.videoUrl)
      } else if (movie.type === "série" && movie.episodes) {
        movie.episodes = movie.episodes.map((episode) => ({
          ...episode,
          url: getEmbedUrl(episode.url),
        }))
      }
      return movie
    })

    res.json({
      movies: transformedMovies,
      pagination: {
        currentPage: Number.parseInt(page),
        totalPages: Math.ceil(total / Number.parseInt(limit)),
        totalItems: total,
        itemsPerPage: Number.parseInt(limit),
      },
    })
  } catch (error) {
    console.error("Error fetching movies:", error)
    res.status(500).json({ message: "Erreur lors de la récupération des films" })
  }
})

// Get single movie by ID
app.get("/movies/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ message: "ID de film invalide" })
    }

    const db = await connectToDatabase()
    const movie = await db.collection("movies").findOne({ _id: new ObjectId(id) })

    if (!movie) {
      return res.status(404).json({ message: "Film non trouvé" })
    }

    // Transform Google Drive URLs
    if (movie.type === "film" && movie.videoUrl) {
      movie.videoUrl = getEmbedUrl(movie.videoUrl)
    } else if (movie.type === "série" && movie.episodes) {
      movie.episodes = movie.episodes.map((episode) => ({
        ...episode,
        url: getEmbedUrl(episode.url),
      }))
    }

    res.json(movie)
  } catch (error) {
    console.error("Error fetching movie:", error)
    res.status(500).json({ message: "Erreur lors de la récupération du film" })
  }
})

// Add movie (Admin only)
app.post("/movies", authenticateToken, isAdmin, async (req, res) => {
  try {
    const { title, type, duration, description, genre, releaseYear, thumbnailUrl } = req.body

    // Validation
    const requiredFields = ["title", "type", "duration", "description", "genre", "releaseYear", "thumbnailUrl"]
    const missingFields = requiredFields.filter((field) => !req.body[field])

    if (missingFields.length > 0) {
      return res.status(400).json({
        message: "Champs manquants",
        missingFields,
      })
    }

    if (!["film", "série"].includes(type)) {
      return res.status(400).json({ message: "Le type doit être 'film' ou 'série'" })
    }

    if (type === "film" && !req.body.videoUrl) {
      return res.status(400).json({ message: "URL vidéo requise pour un film" })
    }

    if (type === "série" && (!req.body.episodes || !Array.isArray(req.body.episodes))) {
      return res.status(400).json({ message: "Liste d'épisodes requise pour une série" })
    }

    const db = await connectToDatabase()

    // Check if movie already exists
    const existingMovie = await db.collection("movies").findOne({ title, releaseYear })
    if (existingMovie) {
      return res.status(400).json({ message: "Un film avec ce titre et cette année existe déjà" })
    }

    const movieDoc = {
      ...req.body,
      createdAt: new Date(),
      updatedAt: new Date(),
      addedBy: req.user.username,
    }

    const result = await db.collection("movies").insertOne(movieDoc)
    const insertedMovie = await db.collection("movies").findOne({ _id: result.insertedId })

    console.log(`Movie "${title}" added by ${req.user.username}`)
    res.status(201).json({
      message: "Film ajouté avec succès",
      movie: insertedMovie,
    })
  } catch (error) {
    console.error("Error adding movie:", error)
    res.status(500).json({
      message: "Erreur lors de l'ajout du film",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    })
  }
})

// Update movie (Admin only)
app.put("/movies/:id", authenticateToken, isAdmin, async (req, res) => {
  try {
    const { id } = req.params

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ message: "ID de film invalide" })
    }

    const db = await connectToDatabase()

    const updateDoc = {
      ...req.body,
      updatedAt: new Date(),
      lastModifiedBy: req.user.username,
    }

    const result = await db.collection("movies").updateOne({ _id: new ObjectId(id) }, { $set: updateDoc })

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: "Film non trouvé" })
    }

    const updatedMovie = await db.collection("movies").findOne({ _id: new ObjectId(id) })

    res.json({
      message: "Film mis à jour avec succès",
      movie: updatedMovie,
    })
  } catch (error) {
    console.error("Error updating movie:", error)
    res.status(500).json({ message: "Erreur lors de la mise à jour du film" })
  }
})

// Delete movie (Admin only)
app.delete("/movies/:id", authenticateToken, isAdmin, async (req, res) => {
  try {
    const { id } = req.params

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ message: "ID de film invalide" })
    }

    const db = await connectToDatabase()

    const movie = await db.collection("movies").findOne({ _id: new ObjectId(id) })
    if (!movie) {
      return res.status(404).json({ message: "Film non trouvé" })
    }

    const result = await db.collection("movies").deleteOne({ _id: new ObjectId(id) })

    console.log(`Movie "${movie.title}" deleted by ${req.user.username}`)
    res.json({ message: "Film supprimé avec succès" })
  } catch (error) {
    console.error("Error deleting movie:", error)
    res.status(500).json({ message: "Erreur lors de la suppression du film" })
  }
})

// ==================== MOVIE REQUESTS ROUTES ====================

// Get movie requests
app.get("/movie-requests", authenticateToken, async (req, res) => {
  try {
    const db = await connectToDatabase()
    let movieRequests

    if (req.user.role === "admin") {
      // Admin can see all requests
      movieRequests = await db.collection("movieRequests").find({}).sort({ createdAt: -1 }).toArray()
    } else {
      // Users can only see their own requests
      movieRequests = await db
        .collection("movieRequests")
        .find({ userId: req.user.username })
        .sort({ createdAt: -1 })
        .toArray()
    }

    res.json(movieRequests)
  } catch (error) {
    console.error("Error fetching movie requests:", error)
    res.status(500).json({ message: "Erreur lors de la récupération des demandes" })
  }
})

// Create movie request
app.post("/movie-requests", authenticateToken, async (req, res) => {
  try {
    const { title, imdbLink, description } = req.body

    if (!title || !imdbLink) {
      return res.status(400).json({
        message: "Titre et lien IMDB sont requis",
      })
    }

    // Validate IMDB link
    const imdbRegex = /^https?:\/\/(www\.)?imdb\.com\/title\/tt\d+/
    if (!imdbRegex.test(imdbLink)) {
      return res.status(400).json({
        message: "Lien IMDB invalide. Format attendu: https://www.imdb.com/title/ttXXXXXXX",
      })
    }

    const db = await connectToDatabase()

    // Check if user already requested this movie
    const existingRequest = await db.collection("movieRequests").findOne({
      userId: req.user.username,
      title,
      status: { $in: ["pending", "approved"] },
    })

    if (existingRequest) {
      return res.status(400).json({
        message: "Vous avez déjà fait une demande pour ce film",
      })
    }

    const newRequest = {
      title,
      imdbLink,
      description: description || "",
      userId: req.user.username,
      status: "pending",
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const result = await db.collection("movieRequests").insertOne(newRequest)
    const insertedRequest = await db.collection("movieRequests").findOne({ _id: result.insertedId })

    console.log(`Movie request "${title}" created by ${req.user.username}`)
    res.status(201).json({
      message: "Demande créée avec succès",
      request: insertedRequest,
    })
  } catch (error) {
    console.error("Error adding movie request:", error)
    res.status(500).json({ message: "Erreur lors de la création de la demande" })
  }
})

// Approve movie request (Admin only)
app.post("/movie-requests/:requestId/approve", authenticateToken, isAdmin, async (req, res) => {
  try {
    const { requestId } = req.params

    if (!ObjectId.isValid(requestId)) {
      return res.status(400).json({ message: "ID de demande invalide" })
    }

    const db = await connectToDatabase()

    const result = await db.collection("movieRequests").updateOne(
      { _id: new ObjectId(requestId) },
      {
        $set: {
          status: "approved",
          updatedAt: new Date(),
          approvedBy: req.user.username,
          approvedAt: new Date(),
        },
      },
    )

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: "Demande non trouvée" })
    }

    console.log(`Movie request ${requestId} approved by ${req.user.username}`)
    res.json({ message: "Demande approuvée avec succès" })
  } catch (error) {
    console.error("Error approving movie request:", error)
    res.status(500).json({ message: "Erreur lors de l'approbation de la demande" })
  }
})

// Reject movie request (Admin only)
app.post("/movie-requests/:requestId/reject", authenticateToken, isAdmin, async (req, res) => {
  try {
    const { requestId } = req.params
    const { reason } = req.body

    if (!ObjectId.isValid(requestId)) {
      return res.status(400).json({ message: "ID de demande invalide" })
    }

    const db = await connectToDatabase()

    const result = await db.collection("movieRequests").updateOne(
      { _id: new ObjectId(requestId) },
      {
        $set: {
          status: "rejected",
          updatedAt: new Date(),
          rejectedBy: req.user.username,
          rejectedAt: new Date(),
          rejectionReason: reason || "Aucune raison fournie",
        },
      },
    )

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: "Demande non trouvée" })
    }

    console.log(`Movie request ${requestId} rejected by ${req.user.username}`)
    res.json({ message: "Demande rejetée avec succès" })
  } catch (error) {
    console.error("Error rejecting movie request:", error)
    res.status(500).json({ message: "Erreur lors du rejet de la demande" })
  }
})

// Delete movie request
app.delete("/movie-requests/:requestId", authenticateToken, async (req, res) => {
  try {
    const { requestId } = req.params

    if (!ObjectId.isValid(requestId)) {
      return res.status(400).json({ message: "ID de demande invalide" })
    }

    const db = await connectToDatabase()

    // Check if user owns the request or is admin
    const filter = { _id: new ObjectId(requestId) }
    if (req.user.role !== "admin") {
      filter.userId = req.user.username
    }

    const result = await db.collection("movieRequests").deleteOne(filter)

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: "Demande non trouvée ou non autorisée" })
    }

    res.json({ message: "Demande supprimée avec succès" })
  } catch (error) {
    console.error("Error deleting movie request:", error)
    res.status(500).json({ message: "Erreur lors de la suppression de la demande" })
  }
})

// ==================== ADMIN ROUTES ====================

// Get admin statistics
app.get("/admin/stats", authenticateToken, isAdmin, async (req, res) => {
  try {
    const db = await connectToDatabase()

    // Get user statistics
    const totalUsers = await db.collection("users").countDocuments()
    const bannedUsers = await db.collection("users").countDocuments({ isBanned: true })

    // Get new users in last 7 days
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
    const newUsers = await db.collection("users").countDocuments({
      createdAt: { $gte: sevenDaysAgo },
    })

    // Get content statistics
    const totalMovies = await db.collection("movies").countDocuments()
    const totalFilms = await db.collection("movies").countDocuments({ type: "film" })
    const totalSeries = await db.collection("movies").countDocuments({ type: "série" })

    // Get request statistics
    const totalRequests = await db.collection("movieRequests").countDocuments()
    const pendingRequests = await db.collection("movieRequests").countDocuments({ status: "pending" })
    const approvedRequests = await db.collection("movieRequests").countDocuments({ status: "approved" })
    const rejectedRequests = await db.collection("movieRequests").countDocuments({ status: "rejected" })

    // Get recent activity
    const recentUsers = await db
      .collection("users")
      .find({}, { projection: { password: 0 } })
      .sort({ createdAt: -1 })
      .limit(5)
      .toArray()

    const recentRequests = await db.collection("movieRequests").find({}).sort({ createdAt: -1 }).limit(5).toArray()

    res.json({
      users: {
        total: totalUsers,
        new: newUsers,
        banned: bannedUsers,
        active: totalUsers - bannedUsers,
      },
      content: {
        total: totalMovies,
        films: totalFilms,
        series: totalSeries,
      },
      requests: {
        total: totalRequests,
        pending: pendingRequests,
        approved: approvedRequests,
        rejected: rejectedRequests,
      },
      recent: {
        users: recentUsers,
        requests: recentRequests,
      },
    })
  } catch (error) {
    console.error("Error fetching admin stats:", error)
    res.status(500).json({ message: "Erreur lors de la récupération des statistiques" })
  }
})

// Get all users (Admin only)
app.get("/admin/users", authenticateToken, isAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 20, search, status } = req.query
    const skip = (Number.parseInt(page) - 1) * Number.parseInt(limit)

    const db = await connectToDatabase()

    // Build filter
    const filter = {}

    if (search) {
      filter.$or = [{ username: { $regex: search, $options: "i" } }, { email: { $regex: search, $options: "i" } }]
    }

    if (status === "banned") {
      filter.isBanned = true
    } else if (status === "active") {
      filter.isBanned = { $ne: true }
    }

    const total = await db.collection("users").countDocuments(filter)

    const users = await db
      .collection("users")
      .find(filter, { projection: { password: 0 } })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number.parseInt(limit))
      .toArray()

    res.json({
      users,
      pagination: {
        currentPage: Number.parseInt(page),
        totalPages: Math.ceil(total / Number.parseInt(limit)),
        totalItems: total,
        itemsPerPage: Number.parseInt(limit),
      },
    })
  } catch (error) {
    console.error("Error fetching users:", error)
    res.status(500).json({ message: "Erreur lors de la récupération des utilisateurs" })
  }
})

// Ban/Unban user (Admin only)
app.post("/admin/users/:userId/ban", authenticateToken, isAdmin, async (req, res) => {
  try {
    const { userId } = req.params
    const { ban, reason } = req.body

    if (!ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "ID utilisateur invalide" })
    }

    if (typeof ban !== "boolean") {
      return res.status(400).json({ message: "Le paramètre 'ban' doit être un booléen" })
    }

    const db = await connectToDatabase()

    const updateDoc = {
      isBanned: ban,
      updatedAt: new Date(),
      lastModifiedBy: req.user.username,
    }

    if (ban && reason) {
      updateDoc.banReason = reason
      updateDoc.bannedAt = new Date()
    } else if (!ban) {
      updateDoc.$unset = { banReason: "", bannedAt: "" }
    }

    const result = await db
      .collection("users")
      .updateOne(
        { _id: new ObjectId(userId) },
        ban ? { $set: updateDoc } : { $set: updateDoc, $unset: updateDoc.$unset },
      )

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: "Utilisateur non trouvé" })
    }

    const action = ban ? "banni" : "débanni"
    console.log(`User ${userId} ${action} by ${req.user.username}`)

    res.json({ message: `Utilisateur ${action} avec succès` })
  } catch (error) {
    console.error("Error updating user ban status:", error)
    res.status(500).json({ message: "Erreur lors de la mise à jour du statut de l'utilisateur" })
  }
})

// Delete user (Admin only)
app.delete("/admin/users/:userId", authenticateToken, isAdmin, async (req, res) => {
  try {
    const { userId } = req.params

    if (!ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "ID utilisateur invalide" })
    }

    const db = await connectToDatabase()

    // Get user info before deletion
    const user = await db.collection("users").findOne({ _id: new ObjectId(userId) })
    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé" })
    }

    // Delete user's movie requests
    await db.collection("movieRequests").deleteMany({ userId: user.username })

    // Delete user
    const result = await db.collection("users").deleteOne({ _id: new ObjectId(userId) })

    console.log(`User ${user.username} deleted by ${req.user.username}`)
    res.json({ message: "Utilisateur supprimé avec succès" })
  } catch (error) {
    console.error("Error deleting user:", error)
    res.status(500).json({ message: "Erreur lors de la suppression de l'utilisateur" })
  }
})

// ==================== ERROR HANDLING ====================

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({
    message: "Route non trouvée",
    path: req.originalUrl,
    method: req.method,
  })
})

// Global error handler
app.use((error, req, res, next) => {
  console.error("Global error handler:", error)
  res.status(500).json({
    message: "Erreur serveur interne",
    error: process.env.NODE_ENV === "development" ? error.message : undefined,
  })
})

// ==================== SERVERLESS HANDLER ====================

const handler = serverless(app)

exports.handler = async (event, context) => {
  // Set context to not wait for empty event loop
  context.callbackWaitsForEmptyEventLoop = false

  // Handle CORS preflight requests
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
        "Access-Control-Max-Age": "86400",
      },
      body: "",
    }
  }

  try {
    return await handler(event, context)
  } catch (error) {
    console.error("Handler error:", error)
    return {
      statusCode: 500,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: "Erreur serveur",
        error: process.env.NODE_ENV === "development" ? error.message : undefined,
      }),
    }
  }
}
