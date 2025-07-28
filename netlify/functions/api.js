const express = require("express")
const cors = require("cors")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const { MongoClient, ObjectId } = require("mongodb")
const serverless = require("serverless-http")

const app = express()

// Configuration CORS plus permissive
app.use(
  cors({
    origin: "*",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  }),
)

// Middleware pour parser JSON
app.use(express.json({ limit: "10mb" }))
app.use(express.urlencoded({ extended: true }))

// Variables d'environnement
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/ezyzip"
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production"

console.log("API Starting...")
console.log("MongoDB URI:", MONGODB_URI ? "✓ Configured" : "✗ Missing")
console.log("JWT Secret:", JWT_SECRET ? "✓ Configured" : "✗ Missing")

// Cache de connexion MongoDB
let cachedClient = null
let cachedDb = null

async function connectToDatabase() {
  if (cachedClient && cachedDb) {
    try {
      // Test de la connexion
      await cachedDb.admin().ping()
      return { client: cachedClient, db: cachedDb }
    } catch (error) {
      console.log("Cached connection failed, reconnecting...")
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
    const db = client.db("ezyzip")

    // Test de la connexion
    await db.admin().ping()
    console.log("MongoDB connected successfully")

    cachedClient = client
    cachedDb = db

    return { client, db }
  } catch (error) {
    console.error("MongoDB connection error:", error)
    throw new Error("Impossible de se connecter à la base de données: " + error.message)
  }
}

// Middleware d'authentification
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"]
    const token = authHeader && authHeader.split(" ")[1]

    if (!token) {
      return res.status(401).json({ message: "Token d'accès requis" })
    }

    const decoded = jwt.verify(token, JWT_SECRET)
    req.user = decoded
    next()
  } catch (error) {
    console.error("Token verification error:", error)
    return res.status(403).json({ message: "Token invalide ou expiré" })
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

// Route racine - Test de l'API
app.get("/", (req, res) => {
  console.log("API root endpoint called")
  res.json({
    message: "🎬 API EzyZip fonctionnelle !",
    timestamp: new Date().toISOString(),
    version: "1.0.0",
    status: "active",
    endpoints: {
      auth: [
        "POST /login - Connexion utilisateur",
        "POST /signup - Inscription utilisateur",
        "POST /refresh-token - Rafraîchir le token",
      ],
      movies: [
        "GET /movies - Liste des films",
        "POST /movies - Ajouter un film (admin)",
        "PUT /movies/:id - Modifier un film (admin)",
        "DELETE /movies/:id - Supprimer un film (admin)",
      ],
      requests: [
        "GET /requests - Liste des demandes",
        "POST /requests - Créer une demande",
        "PUT /requests/:id - Traiter une demande (admin)",
      ],
      admin: ["GET /users - Liste des utilisateurs (admin)", "GET /stats - Statistiques (admin)"],
    },
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
      uptime: process.uptime(),
    })
  } catch (error) {
    console.error("Health check failed:", error)
    res.status(500).json({
      status: "unhealthy",
      database: "disconnected",
      error: error.message,
      timestamp: new Date().toISOString(),
    })
  }
})

// Route de connexion
app.post("/login", async (req, res) => {
  try {
    console.log("Login attempt:", { username: req.body.username })

    const { username, password } = req.body

    if (!username || !password) {
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

    // Connexion à la base de données pour les utilisateurs normaux
    const { db } = await connectToDatabase()
    const usersCollection = db.collection("users")

    const user = await usersCollection.findOne({ username })
    if (!user) {
      console.log("User not found:", username)
      return res.status(401).json({
        message: "Nom d'utilisateur ou mot de passe incorrect",
      })
    }

    if (!user.isActive) {
      return res.status(403).json({
        message: "Compte désactivé. Contactez l'administrateur.",
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
    await usersCollection.updateOne({ _id: user._id }, { $set: { lastLogin: new Date() } })

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
    console.log("Signup attempt:", { username: req.body.username, email: req.body.email })

    const { username, email, password } = req.body

    // Validation des données
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

    // Validation email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        message: "Format d'email invalide",
      })
    }

    // Vérifier que ce n'est pas l'admin hardcodé
    if (username === "djamalax19") {
      return res.status(400).json({
        message: "Ce nom d'utilisateur est réservé",
      })
    }

    const { db } = await connectToDatabase()
    const usersCollection = db.collection("users")

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await usersCollection.findOne({
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
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const result = await usersCollection.insertOne(newUser)
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

// Routes pour les films
app.get("/movies", authenticateToken, async (req, res) => {
  try {
    const { db } = await connectToDatabase()
    const moviesCollection = db.collection("movies")

    const movies = await moviesCollection
      .find({ isActive: { $ne: false } })
      .sort({ createdAt: -1 })
      .toArray()

    res.json(movies)
  } catch (error) {
    console.error("Movies fetch error:", error)
    res.status(500).json({ message: "Erreur lors de la récupération des films" })
  }
})

app.post("/movies", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { title, description, genre, year, driveUrl, type, imageUrl } = req.body

    if (!title || !driveUrl) {
      return res.status(400).json({
        message: "Titre et URL Google Drive requis",
      })
    }

    // Transformer l'URL Google Drive pour l'embed
    let transformedUrl = driveUrl
    if (driveUrl.includes("/file/d/")) {
      const fileId = driveUrl.match(/\/file\/d\/([a-zA-Z0-9-_]+)/)?.[1]
      if (fileId) {
        transformedUrl = `https://drive.google.com/file/d/${fileId}/preview`
      }
    }

    const { db } = await connectToDatabase()
    const moviesCollection = db.collection("movies")

    const newMovie = {
      title,
      description: description || "",
      genre: genre || "Non spécifié",
      year: Number.parseInt(year) || new Date().getFullYear(),
      driveUrl: transformedUrl,
      originalUrl: driveUrl,
      type: type || "movie",
      imageUrl: imageUrl || "/placeholder.svg?height=300&width=200",
      isActive: true,
      createdAt: new Date(),
      createdBy: req.user.id,
    }

    const result = await moviesCollection.insertOne(newMovie)

    res.status(201).json({
      message: "Film ajouté avec succès",
      movie: { ...newMovie, _id: result.insertedId },
    })
  } catch (error) {
    console.error("Movie creation error:", error)
    res.status(500).json({ message: "Erreur lors de l'ajout du film" })
  }
})

app.put("/movies/:id", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params
    const updates = { ...req.body }

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ message: "ID de film invalide" })
    }

    // Transformer l'URL Google Drive si elle est modifiée
    if (updates.driveUrl && updates.driveUrl.includes("/file/d/")) {
      const fileId = updates.driveUrl.match(/\/file\/d\/([a-zA-Z0-9-_]+)/)?.[1]
      if (fileId) {
        updates.driveUrl = `https://drive.google.com/file/d/${fileId}/preview`
      }
    }

    const { db } = await connectToDatabase()
    const moviesCollection = db.collection("movies")

    const result = await moviesCollection.updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          ...updates,
          updatedAt: new Date(),
          updatedBy: req.user.id,
        },
      },
    )

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: "Film non trouvé" })
    }

    res.json({ message: "Film mis à jour avec succès" })
  } catch (error) {
    console.error("Movie update error:", error)
    res.status(500).json({ message: "Erreur lors de la mise à jour du film" })
  }
})

app.delete("/movies/:id", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ message: "ID de film invalide" })
    }

    const { db } = await connectToDatabase()
    const moviesCollection = db.collection("movies")

    const result = await moviesCollection.updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          isActive: false,
          deletedAt: new Date(),
          deletedBy: req.user.id,
        },
      },
    )

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: "Film non trouvé" })
    }

    res.json({ message: "Film supprimé avec succès" })
  } catch (error) {
    console.error("Movie deletion error:", error)
    res.status(500).json({ message: "Erreur lors de la suppression du film" })
  }
})

// Routes pour les demandes de films
app.get("/requests", authenticateToken, async (req, res) => {
  try {
    const { db } = await connectToDatabase()
    const requestsCollection = db.collection("movieRequests")

    const filter = req.user.role === "admin" ? {} : { userId: req.user.id }
    const requests = await requestsCollection.find(filter).sort({ createdAt: -1 }).toArray()

    res.json(requests)
  } catch (error) {
    console.error("Requests fetch error:", error)
    res.status(500).json({ message: "Erreur lors de la récupération des demandes" })
  }
})

app.post("/requests", authenticateToken, async (req, res) => {
  try {
    const { title, description, genre, year, imdbLink } = req.body

    if (!title) {
      return res.status(400).json({ message: "Titre requis" })
    }

    const { db } = await connectToDatabase()
    const requestsCollection = db.collection("movieRequests")

    const newRequest = {
      title,
      description: description || "",
      genre: genre || "",
      year: year ? Number.parseInt(year) : null,
      imdbLink: imdbLink || "",
      userId: req.user.id,
      username: req.user.username,
      status: "pending",
      createdAt: new Date(),
    }

    const result = await requestsCollection.insertOne(newRequest)

    res.status(201).json({
      message: "Demande envoyée avec succès",
      request: { ...newRequest, _id: result.insertedId },
    })
  } catch (error) {
    console.error("Request creation error:", error)
    res.status(500).json({ message: "Erreur lors de la création de la demande" })
  }
})

app.put("/requests/:id", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params
    const { status, adminNote } = req.body

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ message: "ID de demande invalide" })
    }

    if (!["pending", "approved", "rejected"].includes(status)) {
      return res.status(400).json({ message: "Statut invalide" })
    }

    const { db } = await connectToDatabase()
    const requestsCollection = db.collection("movieRequests")

    const result = await requestsCollection.updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          status,
          adminNote: adminNote || "",
          processedAt: new Date(),
          processedBy: req.user.id,
        },
      },
    )

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: "Demande non trouvée" })
    }

    res.json({ message: "Demande mise à jour avec succès" })
  } catch (error) {
    console.error("Request update error:", error)
    res.status(500).json({ message: "Erreur lors de la mise à jour de la demande" })
  }
})

// Routes admin pour la gestion des utilisateurs
app.get("/users", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { db } = await connectToDatabase()
    const usersCollection = db.collection("users")

    const users = await usersCollection
      .find({ role: { $ne: "admin" } }, { projection: { password: 0 } })
      .sort({ createdAt: -1 })
      .toArray()

    res.json(users)
  } catch (error) {
    console.error("Users fetch error:", error)
    res.status(500).json({ message: "Erreur lors de la récupération des utilisateurs" })
  }
})

app.put("/users/:id", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params
    const { isActive } = req.body

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ message: "ID utilisateur invalide" })
    }

    const { db } = await connectToDatabase()
    const usersCollection = db.collection("users")

    const result = await usersCollection.updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          isActive: Boolean(isActive),
          updatedAt: new Date(),
          updatedBy: req.user.id,
        },
      },
    )

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: "Utilisateur non trouvé" })
    }

    const action = isActive ? "activé" : "désactivé"
    res.json({ message: `Utilisateur ${action} avec succès` })
  } catch (error) {
    console.error("User update error:", error)
    res.status(500).json({ message: "Erreur lors de la mise à jour de l'utilisateur" })
  }
})

app.delete("/users/:id", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ message: "ID utilisateur invalide" })
    }

    const { db } = await connectToDatabase()
    const usersCollection = db.collection("users")

    const result = await usersCollection.updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          isActive: false,
          deletedAt: new Date(),
          deletedBy: req.user.id,
        },
      },
    )

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: "Utilisateur non trouvé" })
    }

    res.json({ message: "Utilisateur supprimé avec succès" })
  } catch (error) {
    console.error("User deletion error:", error)
    res.status(500).json({ message: "Erreur lors de la suppression de l'utilisateur" })
  }
})

// Route pour les statistiques admin
app.get("/stats", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { db } = await connectToDatabase()

    const [totalUsers, activeUsers, totalMovies, totalRequests, pendingRequests] = await Promise.all([
      db.collection("users").countDocuments(),
      db.collection("users").countDocuments({ isActive: true }),
      db.collection("movies").countDocuments({ isActive: { $ne: false } }),
      db.collection("movieRequests").countDocuments(),
      db.collection("movieRequests").countDocuments({ status: "pending" }),
    ])

    res.json({
      users: {
        total: totalUsers,
        active: activeUsers,
        inactive: totalUsers - activeUsers,
      },
      movies: {
        total: totalMovies,
      },
      requests: {
        total: totalRequests,
        pending: pendingRequests,
        processed: totalRequests - pendingRequests,
      },
    })
  } catch (error) {
    console.error("Stats fetch error:", error)
    res.status(500).json({ message: "Erreur lors de la récupération des statistiques" })
  }
})

// Gestion des erreurs globales
app.use((error, req, res, next) => {
  console.error("Global error:", error)
  res.status(500).json({
    message: "Erreur interne du serveur",
    error: process.env.NODE_ENV === "development" ? error.message : undefined,
  })
})

// Gestion des routes non trouvées
app.use("*", (req, res) => {
  console.log("Route not found:", req.method, req.originalUrl)
  res.status(404).json({
    message: "Route non trouvée",
    path: req.originalUrl,
    method: req.method,
  })
})

// Export pour Netlify Functions
const handler = serverless(app)

exports.handler = async (event, context) => {
  // Éviter que la fonction attende la boucle d'événements vide
  context.callbackWaitsForEmptyEventLoop = false

  console.log("Function called:", event.httpMethod, event.path)

  try {
    const result = await handler(event, context)
    console.log("Function result:", result.statusCode)
    return result
  } catch (error) {
    console.error("Function error:", error)
    return {
      statusCode: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({
        message: "Erreur de fonction",
        error: error.message,
      }),
    }
  }
}
