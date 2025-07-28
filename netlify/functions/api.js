const express = require("express")
const serverless = require("serverless-http")
const cors = require("cors")
const { MongoClient, ObjectId } = require("mongodb")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const nodemailer = require("nodemailer")

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
const JWT_SECRET = process.env.JWT_SECRET
const EMAIL_USER = process.env.EMAIL_USER
const EMAIL_PASS = process.env.EMAIL_PASS

// Validate environment variables
if (!MONGODB_URI || !JWT_SECRET) {
  console.error("Required environment variables are missing")
}

// Database connection
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
    })

    const db = client.db("jekledb")
    await db.command({ ping: 1 })
    cachedDb = db
    console.log("MongoDB connection successful")
    return db
  } catch (error) {
    console.error("MongoDB connection error:", error)
    throw error
  }
}

// Utility function to transform Google Drive URLs
function getEmbedUrl(url) {
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
      return res.status(403).json({ message: "Invalid token" })
    }
    req.user = user
    next()
  })
}

// Admin middleware
const isAdmin = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Admin access required" })
  }
  next()
}

// Test route
app.get("/", (req, res) => {
  res.json({ message: "API is working!" })
})

// User Routes
app.post("/signup", async (req, res) => {
  try {
    const { username, email, password } = req.body

    if (!username || !email || !password) {
      return res.status(400).json({ message: "All fields are required" })
    }

    const db = await connectToDatabase()

    const existingUser = await db.collection("users").findOne({
      $or: [{ username }, { email }],
    })

    if (existingUser) {
      return res.status(400).json({ message: "Username or email already exists" })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const newUser = {
      username,
      email,
      password: hashedPassword,
      role: "user",
      isBanned: false,
      createdAt: new Date(),
    }

    await db.collection("users").insertOne(newUser)
    console.log(`User ${username} created successfully`)

    res.status(201).json({
      message: "Account created successfully. You can now log in.",
    })
  } catch (error) {
    console.error("Signup error:", error)
    res.status(500).json({
      message: "Server error during signup",
      error: error.message,
    })
  }
})

app.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body

    if (!username || !password) {
      return res.status(400).json({ message: "Username and password are required" })
    }

    const db = await connectToDatabase()

    // Admin login hardcoded
    if (username === "djamalax19" && password === "Tiger19667") {
      const token = jwt.sign({ username, role: "admin" }, JWT_SECRET, { expiresIn: "1h" })
      const refreshToken = jwt.sign({ username, role: "admin" }, JWT_SECRET, { expiresIn: "7d" })
      return res.json({ token, refreshToken, role: "admin", username })
    }

    const user = await db.collection("users").findOne({ username })
    if (!user) {
      return res.status(400).json({ message: "User not found" })
    }

    if (user.isBanned) {
      return res.status(403).json({ message: "Account is banned" })
    }

    const validPassword = await bcrypt.compare(password, user.password)
    if (!validPassword) {
      return res.status(400).json({ message: "Invalid password" })
    }

    const token = jwt.sign({ username: user.username, role: user.role, userId: user._id.toString() }, JWT_SECRET, {
      expiresIn: "1h",
    })
    const refreshToken = jwt.sign(
      { username: user.username, role: user.role, userId: user._id.toString() },
      JWT_SECRET,
      { expiresIn: "7d" },
    )

    res.json({ token, refreshToken, role: user.role, username: user.username })
  } catch (error) {
    console.error("Login error:", error)
    res.status(500).json({ message: "Server error during login" })
  }
})

// Movie Routes
app.get("/movies", authenticateToken, async (req, res) => {
  try {
    const { genre, type, search, page = 1, limit = 20 } = req.query
    const skip = (page - 1) * limit

    const db = await connectToDatabase()

    const filter = {}

    if (genre) {
      filter.genre = { $in: [genre] }
    }

    if (type) {
      filter.type = type
    }

    if (search) {
      filter.$or = [{ title: { $regex: search, $options: "i" } }, { description: { $regex: search, $options: "i" } }]
    }

    const total = await db.collection("movies").countDocuments(filter)

    const movies = await db
      .collection("movies")
      .find(filter)
      .sort({ createdAt: -1 })
      .skip(Number.parseInt(skip))
      .limit(Number.parseInt(limit))
      .toArray()

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

    res.json(transformedMovies)
  } catch (error) {
    console.error("Error fetching movies:", error)
    res.status(500).json({ message: "Error fetching movies" })
  }
})

// Admin stats
app.get("/admin/stats", authenticateToken, isAdmin, async (req, res) => {
  try {
    const db = await connectToDatabase()

    const userCount = await db.collection("users").countDocuments()
    const movieCount = await db.collection("movies").countDocuments()
    const filmCount = await db.collection("movies").countDocuments({ type: "film" })
    const seriesCount = await db.collection("movies").countDocuments({ type: "série" })
    const pendingRequestCount = await db.collection("movieRequests").countDocuments({ status: "pending" })

    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
    const newUserCount = await db.collection("users").countDocuments({
      createdAt: { $gte: sevenDaysAgo },
    })

    res.json({
      users: {
        total: userCount,
        new: newUserCount,
      },
      content: {
        total: movieCount,
        films: filmCount,
        series: seriesCount,
      },
      requests: {
        pending: pendingRequestCount,
      },
    })
  } catch (error) {
    console.error("Error fetching admin stats:", error)
    res.status(500).json({ message: "Error fetching admin statistics" })
  }
})

// Movie by ID
app.get("/movies/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params
    const db = await connectToDatabase()

    const movie = await db.collection("movies").findOne({ _id: new ObjectId(id) })

    if (!movie) {
      return res.status(404).json({ message: "Movie not found" })
    }

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
    res.status(500).json({ message: "Error fetching movie" })
  }
})

// Add movie
app.post("/movies", authenticateToken, isAdmin, async (req, res) => {
  try {
    const db = await connectToDatabase()

    const { title, type, duration, description, genre, releaseYear, thumbnailUrl } = req.body

    if (!title || !type || !duration || !description || !genre || !releaseYear || !thumbnailUrl) {
      return res.status(400).json({
        message: "Missing required fields",
        required: ["title", "type", "duration", "description", "genre", "releaseYear", "thumbnailUrl"],
      })
    }

    const movieDoc = {
      ...req.body,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const result = await db.collection("movies").insertOne(movieDoc)

    const insertedMovie = await db.collection("movies").findOne({
      _id: result.insertedId,
    })

    res.status(201).json(insertedMovie)
  } catch (error) {
    console.error("Error adding movie:", error)
    res.status(500).json({
      message: "Error adding movie",
      error: error.message,
    })
  }
})

// Delete movie
app.delete("/movies/:id", authenticateToken, isAdmin, async (req, res) => {
  try {
    const db = await connectToDatabase()
    const result = await db.collection("movies").deleteOne({
      _id: new ObjectId(req.params.id),
    })

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: "Movie not found" })
    }

    res.json({ message: "Movie deleted successfully" })
  } catch (error) {
    console.error("Error deleting movie:", error)
    res.status(500).json({ message: "Error deleting movie" })
  }
})

// Movie Request Routes
app.get("/movie-requests", authenticateToken, async (req, res) => {
  try {
    const db = await connectToDatabase()
    let movieRequests

    if (req.user.role === "admin") {
      movieRequests = await db.collection("movieRequests").find({}).toArray()
    } else {
      movieRequests = await db.collection("movieRequests").find({ userId: req.user.username }).toArray()
    }

    res.json(movieRequests)
  } catch (error) {
    console.error("Error fetching movie requests:", error)
    res.status(500).json({ message: "Error fetching movie requests" })
  }
})

app.post("/movie-requests", authenticateToken, async (req, res) => {
  try {
    const db = await connectToDatabase()

    const { title, imdbLink } = req.body
    if (!title || !imdbLink) {
      return res.status(400).json({
        message: "Title and IMDB link are required",
      })
    }

    const newRequest = {
      ...req.body,
      userId: req.user.username,
      status: "pending",
      createdAt: new Date(),
    }

    const result = await db.collection("movieRequests").insertOne(newRequest)
    const insertedRequest = await db.collection("movieRequests").findOne({
      _id: result.insertedId,
    })

    res.status(201).json(insertedRequest)
  } catch (error) {
    console.error("Error adding movie request:", error)
    res.status(500).json({ message: "Error adding movie request" })
  }
})

// Approve request
app.post("/movie-requests/:requestId/approve", authenticateToken, isAdmin, async (req, res) => {
  try {
    const { requestId } = req.params
    const db = await connectToDatabase()

    const result = await db.collection("movieRequests").updateOne(
      { _id: new ObjectId(requestId) },
      {
        $set: {
          status: "approved",
          updatedAt: new Date(),
          approvedBy: req.user.username,
        },
      },
    )

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: "Request not found" })
    }

    res.json({ message: "Movie request approved successfully" })
  } catch (error) {
    console.error("Error approving movie request:", error)
    res.status(500).json({ message: "Error approving movie request" })
  }
})

// Reject request
app.post("/movie-requests/:requestId/reject", authenticateToken, isAdmin, async (req, res) => {
  try {
    const { requestId } = req.params
    const db = await connectToDatabase()

    const result = await db.collection("movieRequests").updateOne(
      { _id: new ObjectId(requestId) },
      {
        $set: {
          status: "rejected",
          updatedAt: new Date(),
          rejectedBy: req.user.username,
          rejectionReason: req.body.reason || "No reason provided",
        },
      },
    )

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: "Request not found" })
    }

    res.json({ message: "Movie request rejected successfully" })
  } catch (error) {
    console.error("Error rejecting movie request:", error)
    res.status(500).json({ message: "Error rejecting movie request" })
  }
})

// Admin User Management Routes
app.get("/admin/users", authenticateToken, isAdmin, async (req, res) => {
  try {
    const db = await connectToDatabase()
    const users = await db
      .collection("users")
      .find({}, { projection: { password: 0 } })
      .toArray()
    res.json(users)
  } catch (error) {
    console.error("Error fetching users:", error)
    res.status(500).json({ message: "Error fetching users" })
  }
})

// Ban/unban user
app.post("/admin/users/:userId/ban", authenticateToken, isAdmin, async (req, res) => {
  try {
    const { userId } = req.params
    const { ban } = req.body
    const db = await connectToDatabase()

    const result = await db.collection("users").updateOne(
      { _id: new ObjectId(userId) },
      {
        $set: {
          isBanned: ban,
          updatedAt: new Date(),
          lastModifiedBy: req.user.username,
        },
      },
    )

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: "User not found" })
    }

    res.json({ message: `User ${ban ? "banned" : "unbanned"} successfully` })
  } catch (error) {
    console.error("Error updating user ban status:", error)
    res.status(500).json({ message: "Error updating user ban status" })
  }
})

// Delete user
app.delete("/admin/users/:userId", authenticateToken, isAdmin, async (req, res) => {
  try {
    const { userId } = req.params
    const db = await connectToDatabase()

    const result = await db.collection("users").deleteOne({
      _id: new ObjectId(userId),
    })

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: "User not found" })
    }

    res.json({ message: "User deleted successfully" })
  } catch (error) {
    console.error("Error deleting user:", error)
    res.status(500).json({ message: "Error deleting user" })
  }
})

// Token refresh route
app.post("/refresh-token", async (req, res) => {
  const { refreshToken } = req.body

  if (!refreshToken) {
    return res.status(401).json({ message: "Refresh token missing" })
  }

  try {
    const user = jwt.verify(refreshToken, JWT_SECRET)
    const newToken = jwt.sign({ username: user.username, role: user.role }, JWT_SECRET, { expiresIn: "1h" })

    res.json({ token: newToken })
  } catch (error) {
    console.error("Token refresh error:", error)
    res.status(403).json({ message: "Invalid refresh token" })
  }
})

// Auth check route
app.get("/check-auth", authenticateToken, async (req, res) => {
  try {
    const db = await connectToDatabase()
    const user = await db
      .collection("users")
      .findOne({ _id: new ObjectId(req.user.userId) }, { projection: { password: 0 } })

    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    res.json({
      username: user.username,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
    })
  } catch (error) {
    console.error("Error fetching user info:", error)
    res.status(500).json({ message: "Error fetching user info" })
  }
})

// Update profile
app.post("/update-profile", authenticateToken, async (req, res) => {
  try {
    const { username } = req.body
    const userId = req.user.userId

    if (!username) {
      return res.status(400).json({ message: "Username is required" })
    }

    const db = await connectToDatabase()

    const existingUser = await db.collection("users").findOne({
      username,
      _id: { $ne: new ObjectId(userId) },
    })

    if (existingUser) {
      return res.status(400).json({ message: "Ce nom d'utilisateur est déjà pris" })
    }

    const result = await db.collection("users").updateOne(
      { _id: new ObjectId(userId) },
      {
        $set: {
          username,
          updatedAt: new Date(),
        },
      },
    )

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: "Utilisateur non trouvé" })
    }

    res.json({ message: "Profil mis à jour avec succès", username })
  } catch (error) {
    console.error("Error updating profile:", error)
    res.status(500).json({ message: "Erreur lors de la mise à jour du profil" })
  }
})

// Serverless handler
const handler = serverless(app)

exports.handler = async (event, context) => {
  // Handle CORS preflight requests
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      },
      body: "",
    }
  }

  return await handler(event, context)
}
