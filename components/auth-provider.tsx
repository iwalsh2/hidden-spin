"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  updateProfile,
} from "firebase/auth"
import { auth, db, storage } from "@/lib/firebase"
import { createOrUpdateUserProfile } from "@/lib/user-service"

// Create context with proper types
interface AuthContextType {
  user: any | null
  loading: boolean
  error: Error | null
  signIn: (email: string, password: string) => Promise<any>
  signUp: (email: string, password: string, displayName?: string) => Promise<any>
  signOut: () => Promise<void>
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      async (user) => {
        if (user) {
          // Create or update user profile in Firestore
          try {
            await createOrUpdateUserProfile(user)
          } catch (error) {
            console.error("Error creating/updating user profile:", error)
          }

          // User is signed in
          setUser({
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            photoURL: user.photoURL,
          })
        } else {
          // User is signed out
          setUser(null)
        }
        setLoading(false)
      },
      (error) => {
        console.error("Auth state change error:", error)
        setError(error as Error)
        setLoading(false)
      },
    )

    // Cleanup subscription
    return () => unsubscribe()
  }, [])

  // Sign in with email and password
  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true)
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      return userCredential.user
    } catch (error) {
      console.error("Sign in error:", error)
      setError(error as Error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  // Sign up with email and password
  const signUp = async (email: string, password: string, displayName?: string) => {
    try {
      setLoading(true)
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)

      // Update profile with display name
      if (displayName) {
        await updateProfile(userCredential.user, { displayName })
      }

      return userCredential.user
    } catch (error) {
      console.error("Sign up error:", error)
      setError(error as Error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  // Sign out
  const signOut = async () => {
    try {
      setLoading(true)
      await firebaseSignOut(auth)
    } catch (error) {
      console.error("Sign out error:", error)
      setError(error as Error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  // Check if user is authenticated
  const isAuthenticated = !!user

  // Context value
  const value = {
    user,
    loading,
    error,
    signIn,
    signUp,
    signOut,
    isAuthenticated,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// Custom hook to use auth context
export function useAuth() {
  const context = useContext(AuthContext)
  if (context === null) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

// Export Firebase services for backward compatibility
export const getFirebaseAuth = () => auth
export const getFirebaseDb = () => db
export const getFirebaseStorage = () => storage
