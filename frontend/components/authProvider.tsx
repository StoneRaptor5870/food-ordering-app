"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

interface User {
  id: number
  email: string
  name: string
  role: "admin" | "manager" | "member"
  country: "india" | "america"
  paymentMethod?: string
}

interface SignupData {
  name: string
  email: string
  password: string
  role: "admin" | "manager" | "member"
  country: "india" | "america"
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<void>
  signup: (userData: SignupData) => Promise<void>
  fetchUser: () => Promise<void>
  logout: () => void
  loading: boolean
  updatePaymentMethod: (method: string) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode}) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem("access_token")
    if (token) {
      verifyToken(token)
    } else {
      setLoading(false)
    }
  }, [])

  const verifyToken = async (token: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/auth/verify-token`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          setUser({
            id: result.data.userId,
            email: result.data.email,
            name: result.data.email,
            role: result.data.role,
            country: result.data.country,
          })
        } else {
          localStorage.removeItem("access_token")
        }
      } else {
        localStorage.removeItem("access_token")
      }
    } catch (error) {
      console.error("Token verification failed:", error)
      localStorage.removeItem("access_token")
    } finally {
      setLoading(false)
    }
  }

  const fetchUser = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/users/profile`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      })
      if (response.ok) {
        const userData = await response.json()
        setUser(userData)
      } else {
        localStorage.removeItem("access_token")
      }
    } catch (error) {
      console.error("User wasnt fetched:", error)
      localStorage.removeItem("access_token")
    } finally {
      setLoading(false)
    }
  }

  const login = async (email: string, password: string) => {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    })

    const result = await response.json()

    if (!result.success) {
      throw new Error(result.message || "Login failed")
    }

    const { access_token, user: userData } = result.data
    localStorage.setItem("access_token", access_token)
    setUser(userData)
  }

  const signup = async (userData: SignupData) => {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/auth/signup`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    })

    const result = await response.json()

    if (!result.success) {
      throw new Error(result.message || "Signup failed")
    }

    const { access_token, user: newUser } = result.data
    localStorage.setItem("access_token", access_token)
    setUser(newUser)
  }

  const logout = () => {
    localStorage.removeItem("access_token")
    setUser(null)
  }

  const updatePaymentMethod = async (method: string) => {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/payments/paymentMethod`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("access_token")}`,
      },
      body: JSON.stringify({ paymentMethod: method }),
    })

    if (!response.ok) {
      throw new Error("Failed to update payment method")
    }

    setUser((prev) => (prev ? { ...prev, paymentMethod: method } : null))
  }

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, fetchUser, loading, updatePaymentMethod }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}