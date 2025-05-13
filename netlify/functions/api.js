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
    origin: "*", // Vous pouvez restreindre cela à votre domaine en production
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
if (!MONGODB_URI || !JWT_SECRET || !EMAIL_USER || !EMAIL_PASS) {
  console.error("Required environment variables are missing")
}

// Email configuration
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS,
  },
})

// Database connection
let cachedDb = null
async function connectToDatabase() {
  if (cachedDb) {
    return cachedDb
  }
  try {
    const client = await MongoClient.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    const db = client.db("jekledb")
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

    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString()
    const hashedPassword = await bcrypt.hash(password, 10)

    await transporter.sendMail({
      from: EMAIL_USER,
      to: email,
      subject: "Verify Your Jekle Account",
      text: `Your verification code is: ${verificationCode}`,
    })

    await db.collection("verificationCodes").insertOne({
      username,
      email,
      password: hashedPassword,
      code: verificationCode,
      createdAt: new Date(),
    })

    res.status(200).json({ message: "Verification code sent" })
  } catch (error) {
    console.error("Signup error:", error)
    res.status(500).json({ message: "Server error during signup" })
  }
})

app.post("/verify-signup", async (req, res) => {
  try {
    const { username, code } = req.body
    const db = await connectToDatabase()

    const verificationRecord = await db.collection("verificationCodes").findOne({ username, code })

    if (!verificationRecord) {
      return res.status(400).json({ message: "Invalid verification code" })
    }

    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000)
    if (verificationRecord.createdAt < oneHourAgo) {
      await db.collection("verificationCodes").deleteOne({ username })
      return res.status(400).json({ message: "Verification code expired" })
    }

    const newUser = {
      username: verificationRecord.username,
      email: verificationRecord.email,
      password: verificationRecord.password,
      role: "user",
      isBanned: false,
      createdAt: new Date(),
    }

    await db.collection("users").insertOne(newUser)
    await db.collection("verificationCodes").deleteOne({ username })

    res.status(201).json({ message: "Account created successfully" })
  } catch (error) {
    console.error("Verification error:", error)
    res.status(500).json({ message: "Server error during verification" })
  }
})

app.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body
    const db = await connectToDatabase()

    // Admin login
    if (username === "djamalax19" && password === "Tiger19667") {
      const token = jwt.sign({ username, role: "admin" }, JWT_SECRET, { expiresIn: "1h" })
      const refreshToken = jwt.sign({ username, role: "admin" }, JWT_SECRET, { expiresIn: "7d" })
      return res.json({ token, refreshToken, role: "admin" })
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

    const token = jwt.sign({ username: user.username, role: user.role }, JWT_SECRET, { expiresIn: "1h" })

    const refreshToken = jwt.sign({ username: user.username, role: user.role }, JWT_SECRET, { expiresIn: "7d" })

    res.json({ token, refreshToken, role: user.role })
  } catch (error) {
    console.error("Login error:", error)
    res.status(500).json({ message: "Server error during login" })
  }
})

// Movie Routes
app.get("/movies", authenticateToken, async (req, res) => {
  try {
    const db = await connectToDatabase()
    const movies = await db.collection("movies").find({}).toArray()

    // Transform Google Drive URLs for all movies
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

app.post("/movies", authenticateToken, isAdmin, async (req, res) => {
  try {
    const db = await connectToDatabase()

    const { title, type, duration, description, genre, releaseYear, thumbnailUrl } = req.body

    // Validate required fields
    if (!title || !type || !duration || !description || !genre || !releaseYear || !thumbnailUrl) {
      return res.status(400).json({
        message: "Missing required fields",
        required: ["title", "type", "duration", "description", "genre", "releaseYear", "thumbnailUrl"],
      })
    }

    // Create movie document
    const movieDoc = {
      ...req.body,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    // Insert movie
    const result = await db.collection("movies").insertOne(movieDoc)

    // Get inserted movie
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
app.get("/check-auth", authenticateToken, (req, res) => {
  res.json({
    username: req.user.username,
    role: req.user.role,
  })
})

// Serverless handler
const handler = serverless(app)

exports.handler = async (event, context) => {
  // Préfixer toutes les routes avec /.netlify/functions/api
  if (event.path.startsWith("/.netlify/functions/api")) {
    event.path = event.path.replace("/.netlify/functions/api", "")
  }

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
