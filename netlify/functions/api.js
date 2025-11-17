const express = require("express")
const cors = require("cors")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const { MongoClient, ObjectId } = require("mongodb")
const serverless = require("serverless-http")

const app = express()

// Configuration CORS
app.use(
  cors({
    origin: "*",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  }),
)

app.use(express.json({ limit: "10mb" }))
app.use(express.urlencoded({ extended: true }))

// Variables d'environnement
const MONGODB_URI = process.env.MONGODB_URI
const JWT_SECRET = process.env.JWT_SECRET || "fallback-secret-key"

console.log("=== API INITIALIZATION ===")
console.log("MongoDB URI:", MONGODB_URI ? "✓ Set" : "✗ Missing")
console.log("JWT Secret:", JWT_SECRET ? "✓ Set" : "✗ Missing")

// Cache MongoDB
let cachedClient = null
let cachedDb = null

async function connectToDatabase() {
  if (cachedClient && cachedDb) {
    try {
      await cachedDb.admin().ping()
      return { client: cachedClient, db: cachedDb }
    } catch (error) {
      cachedClient = null
      cachedDb = null
    }
  }

  try {
    console.log("Connecting to MongoDB...")
    const client = new MongoClient(MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 10000,
    })

    await client.connect()
    const db = client.db("jekledb")
    await db.admin().ping()

    cachedClient = client
    cachedDb = db

    console.log("MongoDB connected successfully")
    return { client, db }
  } catch (error) {
    console.error("MongoDB connection failed:", error)
    throw new Error("Database connection failed: " + error.message)
  }
}

// Middleware d'authentification
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"]
  const token = authHeader && authHeader.split(" ")[1]

  if (!token) {
    return res.status(401).json({ message: "Token d'accès requis" })
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET)
    req.user = decoded
    next()
  } catch (error) {
    return res.status(403).json({ message: "Token invalide" })
  }
}

// Middleware admin
const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ message: "Accès administrateur requis" })
  }
  next()
}

// Fonction pour générer les tokens
const generateTokens = (user) => {
  const payload = {
    id: user._id || user.id,
    username: user.username,
    role: user.role || "user",
  }

  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "24h" })
  const refreshToken = jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" })

  return { token, refreshToken }
}

// ==================== FONCTION JEKLE-EMBED ====================
/**
 * Transforme un ID ou lien vidéo en URL Jekle-Embed
 * Formats acceptés :
 * - ID seul : z0cbwenpei6k
 * - Lien complet : https://jeklevid.onrender.com/watch/z0cbwenpei6k
 * Retour : https://jeklevid.onrender.com/watch/z0cbwenpei6k
 */
const processJekleEmbedLink = (input) => {
  if (!input) {
    throw new Error("Lien vidéo requis")
  }

  // Si c'est déjà un lien complet jeklevid, le retourner tel quel
  const jeklevidRegex = /^https:\/\/jeklevid\.onrender\.com\/watch\/[a-zA-Z0-9_-]+$/
  if (jeklevidRegex.test(input)) {
    return input
  }

  // Extraire l'ID depuis un lien complet
  const idFromLinkMatch = input.match(/\/watch\/([a-zA-Z0-9_-]+)/)
  if (idFromLinkMatch) {
    return `https://jeklevid.onrender.com/watch/${idFromLinkMatch[1]}`
  }

  // Si c'est juste un ID (sans slashes ni protocole)
  const idRegex = /^[a-zA-Z0-9_-]+$/
  if (idRegex.test(input.trim())) {
    return `https://jeklevid.onrender.com/watch/${input.trim()}`
  }

  throw new Error(
    "Format de lien invalide. Utilisez soit un ID (ex: z0cbwenpei6k) soit un lien complet (https://jeklevid.onrender.com/watch/z0cbwenpei6k)"
  )
}

// ==================== ROUTES ====================

// Route racine - Test de l'API
app.get("/", (req, res) => {
  console.log("API root endpoint called")
  res.json({
    message: "🎬 API Jekle fonctionnelle !",
    timestamp: new Date().toISOString(),
    version: "2.0.0",
    status: "active",
    features: ["Jekle-Embed Integration", "Individual Movie Pages", "Auto Link Transform"],
  })
})

// Route de santé
app.get("/health", async (req, res) => {
  try {
    const { db } = await connectToDatabase()
    await db.admin().ping()

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

// ==================== AUTHENTICATION ROUTES ====================

// Route de connexion
app.post("/login", async (req, res) => {
  try {
    console.log("=== LOGIN ATTEMPT ===")
    console.log("Request body:", { username: req.body.username, hasPassword: !!req.body.password })

    const { username, password } = req.body

    if (!username || !password) {
      console.log("Missing credentials")
      return res.status(400).json({
        message: "Nom d'utilisateur et mot de passe requis",
      })
    }

    // Vérifier si c'est l'admin hardcodé
    if (username === "djamalax19" && password === "Tiger19667") {
      console.log("Admin login successful")

      const adminUser = {
        _id: "admin",
        id: "admin",
        username: "djamalax19",
        role: "admin",
      }

      const { token, refreshToken } = generateTokens(adminUser)

      return res.json({
        message: "Connexion admin réussie",
        token,
        refreshToken,
        role: "admin",
        username: "djamalax19",
      })
    }

    // Connexion utilisateur normal
    const { db } = await connectToDatabase()
    const user = await db.collection("users").findOne({ username })

    if (!user) {
      console.log("User not found:", username)
      return res.status(401).json({
        message: "Nom d'utilisateur ou mot de passe incorrect",
      })
    }

    if (user.isBanned) {
      console.log("User is banned:", username)
      return res.status(403).json({
        message: "Votre compte a été suspendu",
      })
    }

    const isValidPassword = await bcrypt.compare(password, user.password)
    if (!isValidPassword) {
      console.log("Invalid password for user:", username)
      return res.status(401).json({
        message: "Nom d'utilisateur ou mot de passe incorrect",
      })
    }

    console.log("User login successful:", username)

    const { token, refreshToken } = generateTokens(user)

    // Mettre à jour la dernière connexion
    await db.collection("users").updateOne({ _id: user._id }, { $set: { lastLogin: new Date() } })

    res.json({
      message: "Connexion réussie",
      token,
      refreshToken,
      role: user.role || "user",
      username: user.username,
    })
  } catch (error) {
    console.error("Login error:", error)
    res.status(500).json({
      message: "Erreur interne du serveur",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    })
  }
})

// Route d'inscription
app.post("/signup", async (req, res) => {
  try {
    console.log("=== SIGNUP ATTEMPT ===")
    console.log("Request body:", {
      username: req.body.username,
      email: req.body.email,
      hasPassword: !!req.body.password,
    })

    const { username, email, password } = req.body

    // Validation
    if (!username || !email || !password) {
      return res.status(400).json({
        message: "Tous les champs sont requis",
      })
    }

    if (username.length < 3) {
      return res.status(400).json({
        message: "Le nom d'utilisateur doit contenir au moins 3 caractères",
      })
    }

    if (password.length < 6) {
      return res.status(400).json({
        message: "Le mot de passe doit contenir au moins 6 caractères",
      })
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        message: "Format d'email invalide",
      })
    }

    if (username === "djamalax19") {
      return res.status(400).json({
        message: "Ce nom d'utilisateur est réservé",
      })
    }

    const { db } = await connectToDatabase()

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await db.collection("users").findOne({
      $or: [{ username }, { email }],
    })

    if (existingUser) {
      if (existingUser.username === username) {
        return res.status(400).json({
          message: "Ce nom d'utilisateur est déjà pris",
        })
      }
      if (existingUser.email === email) {
        return res.status(400).json({
          message: "Cette adresse email est déjà utilisée",
        })
      }
    }

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(password, 12)

    // Créer l'utilisateur
    const newUser = {
      username,
      email,
      password: hashedPassword,
      role: "user",
      isBanned: false,
      isVerified: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const result = await db.collection("users").insertOne(newUser)
    console.log("User created successfully:", username, "ID:", result.insertedId)

    const createdUser = {
      ...newUser,
      _id: result.insertedId,
      id: result.insertedId,
    }

    const { token, refreshToken } = generateTokens(createdUser)

    res.status(201).json({
      message: "Compte créé avec succès",
      token,
      refreshToken,
      role: "user",
      username,
    })
  } catch (error) {
    console.error("Signup error:", error)
    res.status(500).json({
      message: "Erreur interne du serveur",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    })
  }
})

// Route de rafraîchissement du token
app.post("/refresh-token", async (req, res) => {
  try {
    const { refreshToken } = req.body

    if (!refreshToken) {
      return res.status(401).json({ message: "Refresh token requis" })
    }

    const decoded = jwt.verify(refreshToken, JWT_SECRET)
    const newTokens = generateTokens(decoded)

    res.json({
      message: "Token rafraîchi avec succès",
      ...newTokens,
    })
  } catch (error) {
    console.error("Token refresh error:", error)
    res.status(403).json({ message: "Refresh token invalide" })
  }
})

// Vérification de l'authentification
app.get("/check-auth", authenticateToken, async (req, res) => {
  try {
    if (req.user.id === "admin") {
      return res.json({
        username: "djamalax19",
        role: "admin",
        isAdmin: true,
      })
    }

    const { db } = await connectToDatabase()
    const user = await db
      .collection("users")
      .findOne({ _id: new ObjectId(req.user.id) }, { projection: { password: 0 } })

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
      isAdmin: user.role === "admin",
    })
  } catch (error) {
    console.error("Auth check error:", error)
    res.status(500).json({ message: "Erreur lors de la vérification" })
  }
})

// Mise à jour du profil
app.post("/update-profile", authenticateToken, async (req, res) => {
  try {
    const { username } = req.body

    if (!username || username.length < 3) {
      return res.status(400).json({ message: "Nom d'utilisateur invalide" })
    }

    if (req.user.id === "admin") {
      return res.status(400).json({ message: "Impossible de modifier le profil admin" })
    }

    const { db } = await connectToDatabase()

    // Vérifier si le nom existe déjà
    const existingUser = await db.collection("users").findOne({ 
      username, 
      _id: { $ne: new ObjectId(req.user.id) } 
    })

    if (existingUser) {
      return res.status(400).json({ message: "Ce nom d'utilisateur est déjà pris" })
    }

    await db.collection("users").updateOne(
      { _id: new ObjectId(req.user.id) },
      { $set: { username, updatedAt: new Date() } }
    )

    res.json({ message: "Profil mis à jour avec succès", username })
  } catch (error) {
    console.error("Profile update error:", error)
    res.status(500).json({ message: "Erreur lors de la mise à jour" })
  }
})

// ==================== MOVIES ROUTES ====================

// Récupérer les films
app.get("/movies", authenticateToken, async (req, res) => {
  try {
    const { genre, type, search, page = 1, limit = 20 } = req.query
    const skip = (Number.parseInt(page) - 1) * Number.parseInt(limit)

    const { db } = await connectToDatabase()

    // Construire le filtre
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

    const total = await db.collection("movies").countDocuments(filter)

    const movies = await db
      .collection("movies")
      .find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number.parseInt(limit))
      .toArray()

    res.json({
      movies,
      pagination: {
        currentPage: Number.parseInt(page),
        totalPages: Math.ceil(total / Number.parseInt(limit)),
        totalItems: total,
        itemsPerPage: Number.parseInt(limit),
      },
    })
  } catch (error) {
    console.error("Movies fetch error:", error)
    res.status(500).json({ message: "Erreur lors de la récupération des films" })
  }
})

// Récupérer un film par ID
app.get("/movies/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ message: "ID de film invalide" })
    }

    const { db } = await connectToDatabase()
    const movie = await db.collection("movies").findOne({ _id: new ObjectId(id) })

    if (!movie) {
      return res.status(404).json({ message: "Film non trouvé" })
    }

    res.json(movie)
  } catch (error) {
    console.error("Movie fetch error:", error)
    res.status(500).json({ message: "Erreur lors de la récupération du film" })
  }
})

// Ajouter un film (Admin seulement) - AVEC JEKLE-EMBED
app.post("/movies", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { 
      title, 
      type, 
      duration, 
      description, 
      genre, 
      releaseYear, 
      thumbnailUrl, 
      videoUrl,
      episodes 
    } = req.body

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

    // Validation pour les films
    if (type === "film") {
      if (!videoUrl) {
        return res.status(400).json({ message: "URL vidéo requise pour un film" })
      }
    }

    // Validation pour les séries
    if (type === "série") {
      if (!episodes || !Array.isArray(episodes) || episodes.length === 0) {
        return res.status(400).json({ message: "Liste d'épisodes requise pour une série" })
      }
      
      // Transformer chaque lien d'épisode
      for (let i = 0; i < episodes.length; i++) {
        const episode = episodes[i]
        if (!episode.url) {
          return res.status(400).json({
            message: `Épisode ${i + 1}: URL vidéo requise`,
          })
        }
        try {
          episodes[i].url = processJekleEmbedLink(episode.url)
          console.log(`✅ Episode ${i + 1} URL processed: ${episodes[i].url}`)
        } catch (error) {
          return res.status(400).json({
            message: `Épisode ${i + 1}: ${error.message}`,
          })
        }
      }
    }

    const { db } = await connectToDatabase()

    // Vérifier si le film existe déjà
    const existingMovie = await db.collection("movies").findOne({ title, releaseYear })
    if (existingMovie) {
      return res.status(400).json({ message: "Un film avec ce titre et cette année existe déjà" })
    }

    // Transformer le lien vidéo pour les films
    let processedVideoUrl = videoUrl
    if (type === "film") {
      try {
        processedVideoUrl = processJekleEmbedLink(videoUrl)
        console.log(`✅ Film URL processed: ${processedVideoUrl}`)
      } catch (error) {
        return res.status(400).json({ message: error.message })
      }
    }

    const movieDoc = {
      title,
      type,
      duration,
      description,
      genre,
      releaseYear,
      thumbnailUrl,
      videoUrl: processedVideoUrl,
      episodes: type === "série" ? episodes : [],
      createdAt: new Date(),
      updatedAt: new Date(),
      addedBy: req.user.username,
    }

    const result = await db.collection("movies").insertOne(movieDoc)
    const insertedMovie = await db.collection("movies").findOne({ _id: result.insertedId })

    console.log(`✅ Movie "${title}" added by ${req.user.username}`)
    
    res.status(201).json({
      message: "Film ajouté avec succès",
      movie: insertedMovie,
    })
  } catch (error) {
    console.error("Movie creation error:", error)
    res.status(500).json({
      message: "Erreur lors de l'ajout du film",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    })
  }
})

// Modifier un film (Admin seulement)
app.put("/movies/:id", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ message: "ID de film invalide" })
    }

    const { db } = await connectToDatabase()

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
    console.error("Movie update error:", error)
    res.status(500).json({ message: "Erreur lors de la mise à jour du film" })
  }
})

// Supprimer un film (Admin seulement)
app.delete("/movies/:id", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ message: "ID de film invalide" })
    }

    const { db } = await connectToDatabase()

    const movie = await db.collection("movies").findOne({ _id: new ObjectId(id) })
    if (!movie) {
      return res.status(404).json({ message: "Film non trouvé" })
    }

    await db.collection("movies").deleteOne({ _id: new ObjectId(id) })

    console.log(`Movie "${movie.title}" deleted by ${req.user.username}`)
    res.json({ message: "Film supprimé avec succès" })
  } catch (error) {
    console.error("Movie deletion error:", error)
    res.status(500).json({ message: "Erreur lors de la suppression du film" })
  }
})

// ==================== MOVIE REQUESTS ROUTES ====================

// Récupérer les demandes de films
app.get("/movie-requests", authenticateToken, async (req, res) => {
  try {
    const { db } = await connectToDatabase()
    let movieRequests

    if (req.user.role === "admin") {
      movieRequests = await db.collection("movieRequests").find({}).sort({ createdAt: -1 }).toArray()
    } else {
      movieRequests = await db
        .collection("movieRequests")
        .find({ userId: req.user.username })
        .sort({ createdAt: -1 })
        .toArray()
    }

    res.json(movieRequests)
  } catch (error) {
    console.error("Movie requests fetch error:", error)
    res.status(500).json({ message: "Erreur lors de la récupération des demandes" })
  }
})

// Créer une demande de film
app.post("/movie-requests", authenticateToken, async (req, res) => {
  try {
    const { title, imdbLink, description } = req.body

    if (!title || !imdbLink) {
      return res.status(400).json({
        message: "Titre et lien IMDB sont requis",
      })
    }

    const imdbRegex = /^https?:\/\/(www\.)?imdb\.com(\/[a-z]{2})?\/title\/tt\d+/
    if (!imdbRegex.test(imdbLink)) {
      return res.status(400).json({
        message: "Lien IMDB invalide",
      })
    }

    const { db } = await connectToDatabase()

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
    console.error("Movie request creation error:", error)
    res.status(500).json({ message: "Erreur lors de la création de la demande" })
  }
})

// Approuver une demande
app.post("/movie-requests/:requestId/approve", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { requestId } = req.params

    if (!ObjectId.isValid(requestId)) {
      return res.status(400).json({ message: "ID de demande invalide" })
    }

    const { db } = await connectToDatabase()

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
    console.error("Movie request approval error:", error)
    res.status(500).json({ message: "Erreur lors de l'approbation de la demande" })
  }
})

// Rejeter une demande
app.post("/movie-requests/:requestId/reject", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { requestId } = req.params
    const { reason } = req.body

    if (!ObjectId.isValid(requestId)) {
      return res.status(400).json({ message: "ID de demande invalide" })
    }

    const { db } = await connectToDatabase()

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
    console.error("Movie request rejection error:", error)
    res.status(500).json({ message: "Erreur lors du rejet de la demande" })
  }
})

// Supprimer une demande
app.delete("/movie-requests/:requestId", authenticateToken, async (req, res) => {
  try {
    const { requestId } = req.params

    if (!ObjectId.isValid(requestId)) {
      return res.status(400).json({ message: "ID de demande invalide" })
    }

    const { db } = await connectToDatabase()

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
    console.error("Movie request deletion error:", error)
    res.status(500).json({ message: "Erreur lors de la suppression de la demande" })
  }
})

// ==================== ADMIN ROUTES ====================

// Statistiques admin
app.get("/admin/stats", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { db } = await connectToDatabase()

    const totalUsers = await db.collection("users").countDocuments()
    const bannedUsers = await db.collection("users").countDocuments({ isBanned: true })

    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
    const newUsers = await db.collection("users").countDocuments({
      createdAt: { $gte: sevenDaysAgo },
    })

    const totalMovies = await db.collection("movies").countDocuments()
    const totalFilms = await db.collection("movies").countDocuments({ type: "film" })
    const totalSeries = await db.collection("movies").countDocuments({ type: "série" })

    const totalRequests = await db.collection("movieRequests").countDocuments()
    const pendingRequests = await db.collection("movieRequests").countDocuments({ status: "pending" })
    const approvedRequests = await db.collection("movieRequests").countDocuments({ status: "approved" })
    const rejectedRequests = await db.collection("movieRequests").countDocuments({ status: "rejected" })

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
    console.error("Admin stats error:", error)
    res.status(500).json({ message: "Erreur lors de la récupération des statistiques" })
  }
})

// Récupérer tous les utilisateurs
app.get("/admin/users", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 20, search, status } = req.query
    const skip = (Number.parseInt(page) - 1) * Number.parseInt(limit)

    const { db } = await connectToDatabase()

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
    console.error("Users fetch error:", error)
    res.status(500).json({ message: "Erreur lors de la récupération des utilisateurs" })
  }
})

// Bannir/Débannir un utilisateur
app.post("/admin/users/:userId/ban", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { userId } = req.params
    const { ban, reason } = req.body

    if (!ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "ID utilisateur invalide" })
    }

    if (typeof ban !== "boolean") {
      return res.status(400).json({ message: "Le paramètre 'ban' doit être un booléen" })
    }

    const { db } = await connectToDatabase()

    let updateQuery = {}

    if (ban) {
      updateQuery = {
        $set: {
          isBanned: true,
          updatedAt: new Date(),
          lastModifiedBy: req.user.username,
          banReason: reason || "Aucune raison fournie",
          bannedAt: new Date(),
        },
      }
    } else {
      updateQuery = {
        $set: {
          isBanned: false,
          updatedAt: new Date(),
          lastModifiedBy: req.user.username,
        },
        $unset: {
          banReason: "",
          bannedAt: "",
        },
      }
    }

    const result = await db.collection("users").updateOne({ _id: new ObjectId(userId) }, updateQuery)

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: "Utilisateur non trouvé" })
    }

    const action = ban ? "banni" : "débanni"
    console.log(`User ${userId} ${action} by ${req.user.username}`)

    res.json({ message: `Utilisateur ${action} avec succès` })
  } catch (error) {
    console.error("User ban error:", error)
    res.status(500).json({ message: "Erreur lors de la mise à jour du statut de l'utilisateur" })
  }
})

// Supprimer un utilisateur
app.delete("/admin/users/:userId", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { userId } = req.params

    if (!ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "ID utilisateur invalide" })
    }

    const { db } = await connectToDatabase()

    const user = await db.collection("users").findOne({ _id: new ObjectId(userId) })
    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé" })
    }

    await db.collection("movieRequests").deleteMany({ userId: user.username })
    await db.collection("users").deleteOne({ _id: new ObjectId(userId) })

    console.log(`User ${user.username} deleted by ${req.user.username}`)
    res.json({ message: "Utilisateur supprimé avec succès" })
  } catch (error) {
    console.error("User deletion error:", error)
    res.status(500).json({ message: "Erreur lors de la suppression de l'utilisateur" })
  }
})

// ==================== ERROR HANDLING ====================

app.use("*", (req, res) => {
  console.log("Route not found:", req.method, req.originalUrl)
  res.status(404).json({
    message: "Route non trouvée",
    path: req.originalUrl,
    method: req.method,
  })
})

app.use((error, req, res, next) => {
  console.error("Global error:", error)
  res.status(500).json({
    message: "Erreur interne du serveur",
    error: process.env.NODE_ENV === "development" ? error.message : undefined,
  })
})

// ==================== SERVERLESS HANDLER ====================

const handler = serverless(app, {
  basePath: "/.netlify/functions/api",
})

exports.handler = async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false

  console.log("=== NETLIFY FUNCTION CALLED ===")
  console.log("Method:", event.httpMethod)
  console.log("Path:", event.path)

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
    const result = await handler(event, context)
    console.log("Function result status:", result.statusCode)
    return result
  } catch (error) {
    console.error("Function handler error:", error)
    return {
      statusCode: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({
        message: "Erreur de fonction",
        error: error.message,
        timestamp: new Date().toISOString(),
      }),
    }
  }
}
