"use client"
import { createContext, useContext, useState, useEffect } from "react"
import { onAuthStateChanged, type User } from "firebase/auth"
import { getFirebaseAuth } from "@/lib/firebase"
import { signInWithEmail, signInWithGoogle, signOut, signUpWithEmail } from "@/lib/auth-service"
import { updateUserProfile as updateProfile } from "@/lib/user-service"
import { createOrUpdateUserProfile } from "@/lib/user-service"

interface AuthContextType {
  user: User | null
  loading: boolean
  isAuthenticated: boolean
  signInWithEmail: (email: string, password: string) => Promise<any>
  signInWithGoogle: () => Promise<any>
  signUp: (email: string, password: string, name: string) => Promise<any>
  signOut: () => Promise<void>
  updateUserProfile: (data: { displayName?: string; photoURL?: string }) => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  // Listen for auth state changes
  useEffect(() => {
    // Only run on client side
    if (typeof window === "undefined") {
      setLoading(false)
      return
    }

    let unsubscribe = () => {}

    // Initialize auth and set up listener
    const initAuth = async () => {
      try {
        const auth = await getFirebaseAuth()
        if (auth) {
          unsubscribe = onAuthStateChanged(auth, async (user) => {
            setUser(user)

            // Create or update user profile in Firestore when user signs in
            if (user) {
              try {
                await createOrUpdateUserProfile(user)
              } catch (error) {
                console.error("Error creating/updating user profile:", error)
              }
            }

            setLoading(false)
          })
        } else {
          // If auth is not available, set loading to false
          setLoading(false)
        }
      } catch (error) {
        console.error("Error initializing auth:", error)
        setLoading(false)
      }
    }

    initAuth()

    // Clean up subscription
    return () => unsubscribe()
  }, [])

  // Sign up with email/password
  const signUp = async (email: string, password: string, name: string) => {
    try {
      const result = await signUpWithEmail(email, password, name)
      return result.user
    } catch (error) {
      console.error("Error in sign up:", error)
      throw error
    }
  }

  // Update profile
  const handleUpdateProfile = async (data: { displayName?: string; photoURL?: string }) => {
    if (!user) {
      throw new Error("No user is signed in")
    }

    try {
      await updateProfile(user.uid, data)
    } catch (error) {
      console.error("Error updating profile:", error)
      throw error
    }
  }

  const value = {
    user,
    loading,
    isAuthenticated: !!user,
    signInWithEmail,
    signInWithGoogle,
    signUp,
    signOut,
    updateUserProfile: handleUpdateProfile,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === null) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
