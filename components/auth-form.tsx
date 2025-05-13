"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"

export default function AuthForm() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("login")
  const [isLoading, setIsLoading] = useState(false)

  // Login form state
  const [loginData, setLoginData] = useState({
    username: "",
    password: "",
  })

  // Signup form state
  const [signupData, setSignupData] = useState({
    username: "",
    email: "",
    password: "",
  })

  const handleLoginChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setLoginData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSignupChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setSignupData((prev) => ({ ...prev, [name]: value }))
  }

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Simulate login
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Redirect based on username
      if (loginData.username === "djamalax19") {
        router.push("/admin")
      } else {
        router.push("/dashboard")
      }
    } catch (error) {
      console.error("Login failed:", error)
      alert("Login failed. Please check your credentials.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Simulate signup
      await new Promise((resolve) => setTimeout(resolve, 1000))
      alert("Account created successfully! You can now log in.")
      setActiveTab("login")
    } catch (error) {
      console.error("Signup failed:", error)
      alert("Signup failed. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full">
      <div className="flex border-b border-gray-700 mb-6">
        <button
          className={`px-4 py-2 flex-1 ${activeTab === "login" ? "border-b-2 border-blue-500 text-blue-500" : "text-gray-400"}`}
          onClick={() => setActiveTab("login")}
        >
          Login
        </button>
        <button
          className={`px-4 py-2 flex-1 ${activeTab === "signup" ? "border-b-2 border-blue-500 text-blue-500" : "text-gray-400"}`}
          onClick={() => setActiveTab("signup")}
        >
          Sign Up
        </button>
      </div>

      {activeTab === "login" && (
        <form onSubmit={handleLoginSubmit} className="space-y-4">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-400 mb-1">
              Username
            </label>
            <input
              id="username"
              name="username"
              type="text"
              required
              className="w-full p-2 bg-gray-800 border border-gray-700 rounded-md text-white"
              value={loginData.username}
              onChange={handleLoginChange}
              disabled={isLoading}
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-400 mb-1">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              className="w-full p-2 bg-gray-800 border border-gray-700 rounded-md text-white"
              value={loginData.password}
              onChange={handleLoginChange}
              disabled={isLoading}
            />
          </div>

          <button
            type="submit"
            className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            disabled={isLoading}
          >
            {isLoading ? "Logging in..." : "Login"}
          </button>
        </form>
      )}

      {activeTab === "signup" && (
        <form onSubmit={handleSignupSubmit} className="space-y-4">
          <div>
            <label htmlFor="signup-username" className="block text-sm font-medium text-gray-400 mb-1">
              Username
            </label>
            <input
              id="signup-username"
              name="username"
              type="text"
              required
              className="w-full p-2 bg-gray-800 border border-gray-700 rounded-md text-white"
              value={signupData.username}
              onChange={handleSignupChange}
              disabled={isLoading}
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-400 mb-1">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="w-full p-2 bg-gray-800 border border-gray-700 rounded-md text-white"
              value={signupData.email}
              onChange={handleSignupChange}
              disabled={isLoading}
            />
          </div>

          <div>
            <label htmlFor="signup-password" className="block text-sm font-medium text-gray-400 mb-1">
              Password
            </label>
            <input
              id="signup-password"
              name="password"
              type="password"
              required
              className="w-full p-2 bg-gray-800 border border-gray-700 rounded-md text-white"
              value={signupData.password}
              onChange={handleSignupChange}
              disabled={isLoading}
            />
          </div>

          <button
            type="submit"
            className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            disabled={isLoading}
          >
            {isLoading ? "Creating account..." : "Create Account"}
          </button>
        </form>
      )}
    </div>
  )
}
