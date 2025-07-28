const express = require("express")
const cors = require("cors")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const { MongoClient } = require("mongodb")
const serverless = require("serverless-http")

const app = express()

// Configuration CORS
app.use(
  cors({
    origin: ["https://jekle.netlify.app", "http://localhost:3000"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
)

app.use(express.json())

// Variables d'environnement
const MONGODB_URI = process.env.MONGODB_URI
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"

// Cache de connexion MongoDB
let cachedClient = null
let cachedDb = null

async function connectToDatabase() {
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb }
  }

  try {
    const client = new MongoClient(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })

    await client.connect()
    const db = client.db("ezyzip")

    cachedClient = client
    cachedDb = db

    return { client, db }
  } catch (error) {
    console.error("Erreur de connexion MongoDB:", error)
    throw new Error("Impossible de se connecter à la base de données")
  }
}

// Middleware d'authentification
const authenticateToken = async (req, res, next) => {
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
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Accès administrateur requis" })
  }
  next()
}

// Fonction pour générer les tokens
const generateTokens = (user) => {
  const payload = {
    id: user._id,
    username: user.username,
    role: user.role,
  }

  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "1h" })
  const refreshToken = jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" })

  return { token, refreshToken }
}

// Route de test
app.get("/", (req, res) => {
  res.json({
    message: "API EzyZip fonctionnelle",
    timestamp: new Date().toISOString(),
    endpoints: [
      "POST /login",
      "POST /signup",
      "POST /refresh-token",
      "GET /movies",
      "POST /movies (admin)",
      "PUT /movies/:id (admin)",
      "DELETE /movies/:id (admin)",
      "GET /requests",
      "POST /requests",
      "PUT /requests/:id (admin)",
      "GET /users (admin)",
      "PUT /users/:id (admin)",
      "DELETE /users/:id (admin)",
      "GET /stats (admin)",
    ],
  })
})

// Route de connexion
app.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body

    if (!username || !password) {
      return res.status(400).json({ message: "Nom d'utilisateur et mot de passe requis" })
    }

    // Vérifier si c'est l'admin hardcodé
    if (username === "djamalax19" && password === "Tiger19667") {
      const adminUser = {
        _id: "admin",
        username: "djamalax19",
        role: "admin",
      }

      const { token, refreshToken } = generateTokens(adminUser)

      return res.json({
        message: "Connexion admin réussie",
        token,
        refreshToken,
        role: "admin",
        user: {
          id: "admin",
          username: "djamalax19",
          role: "admin",
        },
      })
    }

    // Connexion à la base de données pour les utilisateurs normaux
    const { db } = await connectToDatabase()
    const usersCollection = db.collection("users")

    const user = await usersCollection.findOne({ username })
    if (!user) {
      return res.status(401).json({ message: "Nom d'utilisateur ou mot de passe incorrect" })
    }

    const isValidPassword = await bcrypt.compare(password, user.password)
    if (!isValidPassword) {
      return res.status(401).json({ message: "Nom d'utilisateur ou mot de passe incorrect" })
    }

    const { token, refreshToken } = generateTokens(user)

    res.json({
      message: "Connexion réussie",
      token,
      refreshToken,
      role: user.role || "user",
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role || "user",
      },
    })
  } catch (error) {
    console.error("Erreur de connexion:", error)
    res.status(500).json({ message: "Erreur interne du serveur" })
  }
})

// Route d'inscription
app.post("/signup", async (req, res) => {
  try {
    const { username, email, password } = req.body

    // Validation des données
    if (!username || !email || !password) {
      return res.status(400).json({ message: "Tous les champs sont requis" })
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Le mot de passe doit contenir au moins 6 caractères" })
    }

    // Vérifier que ce n'est pas l'admin hardcodé
    if (username === "djamalax19") {
      return res.status(400).json({ message: "Ce nom d'utilisateur est réservé" })
    }

    const { db } = await connectToDatabase()
    const usersCollection = db.collection("users")

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await usersCollection.findOne({
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

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(password, 12)

    // Créer l'utilisateur
    const newUser = {
      username,
      email,
      password: hashedPassword,
      role: "user",
      createdAt: new Date(),
      isActive: true,
    }

    const result = await usersCollection.insertOne(newUser)
    const createdUser = { ...newUser, _id: result.insertedId }

    const { token, refreshToken } = generateTokens(createdUser)

    res.status(201).json({
      message: "Compte créé avec succès",
      token,
      refreshToken,
      role: "user",
      user: {
        id: result.insertedId,
        username,
        email,
        role: "user",
      },
    })
  } catch (error) {
    console.error("Erreur d'inscription:", error)
    res.status(500).json({ message: "Erreur interne du serveur" })
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

    // Générer de nouveaux tokens
    const newTokens = generateTokens(decoded)

    res.json({
      message: "Token rafraîchi avec succès",
      ...newTokens,
    })
  } catch (error) {
    console.error("Erreur de rafraîchissement:", error)
    res.status(403).json({ message: "Refresh token invalide" })
  }
})

// Routes pour les films
app.get("/movies", async (req, res) => {
  try {
    const { db } = await connectToDatabase()
    const moviesCollection = db.collection("movies")

    const movies = await moviesCollection.find({ isActive: true }).toArray()
    res.json(movies)
  } catch (error) {
    console.error("Erreur récupération films:", error)
    res.status(500).json({ message: "Erreur interne du serveur" })
  }
})

app.post("/movies", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { title, description, genre, year, driveUrl, type, imageUrl } = req.body

    if (!title || !driveUrl) {
      return res.status(400).json({ message: "Titre et URL Google Drive requis" })
    }

    // Transformer l'URL Google Drive
    const transformedUrl = driveUrl.includes("/file/d/")
      ? driveUrl.replace("/file/d/", "/uc?id=").replace("/view?usp=sharing", "")
      : driveUrl

    const { db } = await connectToDatabase()
    const moviesCollection = db.collection("movies")

    const newMovie = {
      title,
      description: description || "",
      genre: genre || "Non spécifié",
      year: year || new Date().getFullYear(),
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
    console.error("Erreur ajout film:", error)
    res.status(500).json({ message: "Erreur interne du serveur" })
  }
})

app.put("/movies/:id", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params
    const updates = req.body

    // Transformer l'URL Google Drive si elle est modifiée
    if (updates.driveUrl && updates.driveUrl.includes("/file/d/")) {
      updates.driveUrl = updates.driveUrl.replace("/file/d/", "/uc?id=").replace("/view?usp=sharing", "")
    }

    const { db } = await connectToDatabase()
    const moviesCollection = db.collection("movies")

    const result = await moviesCollection.updateOne(
      { _id: new require("mongodb").ObjectId(id) },
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
    console.error("Erreur mise à jour film:", error)
    res.status(500).json({ message: "Erreur interne du serveur" })
  }
})

app.delete("/movies/:id", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params

    const { db } = await connectToDatabase()
    const moviesCollection = db.collection("movies")

    const result = await moviesCollection.updateOne(
      { _id: new require("mongodb").ObjectId(id) },
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
    console.error("Erreur suppression film:", error)
    res.status(500).json({ message: "Erreur interne du serveur" })
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
    console.error("Erreur récupération demandes:", error)
    res.status(500).json({ message: "Erreur interne du serveur" })
  }
})

app.post("/requests", authenticateToken, async (req, res) => {
  try {
    const { title, description, genre, year } = req.body

    if (!title) {
      return res.status(400).json({ message: "Titre requis" })
    }

    const { db } = await connectToDatabase()
    const requestsCollection = db.collection("movieRequests")

    const newRequest = {
      title,
      description: description || "",
      genre: genre || "",
      year: year || null,
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
    console.error("Erreur création demande:", error)
    res.status(500).json({ message: "Erreur interne du serveur" })
  }
})

app.put("/requests/:id", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params
    const { status, adminNote } = req.body

    if (!["pending", "approved", "rejected"].includes(status)) {
      return res.status(400).json({ message: "Statut invalide" })
    }

    const { db } = await connectToDatabase()
    const requestsCollection = db.collection("movieRequests")

    const result = await requestsCollection.updateOne(
      { _id: new require("mongodb").ObjectId(id) },
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
    console.error("Erreur mise à jour demande:", error)
    res.status(500).json({ message: "Erreur interne du serveur" })
  }
})

// Routes admin pour la gestion des utilisateurs
app.get("/users", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { db } = await connectToDatabase()
    const usersCollection = db.collection("users")

    const users = await usersCollection.find({ role: { $ne: "admin" } }, { projection: { password: 0 } }).toArray()

    res.json(users)
  } catch (error) {
    console.error("Erreur récupération utilisateurs:", error)
    res.status(500).json({ message: "Erreur interne du serveur" })
  }
})

app.put("/users/:id", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params
    const { isActive } = req.body

    const { db } = await connectToDatabase()
    const usersCollection = db.collection("users")

    const result = await usersCollection.updateOne(
      { _id: new require("mongodb").ObjectId(id) },
      {
        $set: {
          isActive,
          updatedAt: new Date(),
          updatedBy: req.user.id,
        },
      },
    )

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: "Utilisateur non trouvé" })
    }

    res.json({ message: "Utilisateur mis à jour avec succès" })
  } catch (error) {
    console.error("Erreur mise à jour utilisateur:", error)
    res.status(500).json({ message: "Erreur interne du serveur" })
  }
})

app.delete("/users/:id", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params

    const { db } = await connectToDatabase()
    const usersCollection = db.collection("users")

    const result = await usersCollection.updateOne(
      { _id: new require("mongodb").ObjectId(id) },
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
    console.error("Erreur suppression utilisateur:", error)
    res.status(500).json({ message: "Erreur interne du serveur" })
  }
})

// Route pour les statistiques admin
app.get("/stats", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { db } = await connectToDatabase()

    const [totalUsers, totalMovies, totalRequests, pendingRequests] = await Promise.all([
      db.collection("users").countDocuments({ isActive: true }),
      db.collection("movies").countDocuments({ isActive: true }),
      db.collection("movieRequests").countDocuments(),
      db.collection("movieRequests").countDocuments({ status: "pending" }),
    ])

    res.json({
      totalUsers,
      totalMovies,
      totalRequests,
      pendingRequests,
    })
  } catch (error) {
    console.error("Erreur récupération statistiques:", error)
    res.status(500).json({ message: "Erreur interne du serveur" })
  }
})

// Gestion des erreurs globales
app.use((error, req, res, next) => {
  console.error("Erreur globale:", error)
  res.status(500).json({ message: "Erreur interne du serveur" })
})

// Gestion des routes non trouvées
app.use("*", (req, res) => {
  res.status(404).json({ message: "Route non trouvée" })
})

module.exports.handler = serverless(app)
