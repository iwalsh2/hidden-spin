// components/auth-provider.tsx
"use client"
import { createContext, useContext, useState, useEffect } from "react"
import { onAuthStateChanged, type User } from "firebase/auth"
import { getFirebaseAuth } from "@/lib/firebase"
import {
  signInWithEmail,
  signInWithGoogle,
  signOut,
  signUpWithEmail,
} from "@/lib/auth-service"
import {
  updateUserProfile as updateProfile,
  createOrUpdateUserProfile,
} from "@/lib/user-service"

interface AuthContextType {
  user:           User | null
  loading:        boolean
  isAuthenticated:boolean
  signInWithEmail:(email: string, password: string) => Promise<any>
  signInWithGoogle:() => Promise<any>
  signUp:         (email: string, password: string, name: string) => Promise<any>
  signOut:        () => Promise<void>
  updateUserProfile:(data: { displayName?: string; photoURL?: string }) => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user,    setUser]    = useState<User | null>(null)
  const [loading,setLoading] = useState(true)

  useEffect(() => {
    if (typeof window === "undefined") {
      setLoading(false)
      return
    }

    let unsubscribe = () => {}

    const initAuth = async () => {
      try {
        const auth = await getFirebaseAuth()
        if (auth) {
          unsubscribe = onAuthStateChanged(auth, async (user) => {
            setUser(user)

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
          setLoading(false)
        }
      } catch (error) {
        console.error("Error initializing auth:", error)
        setLoading(false)
      }
    }

    initAuth()
    return () => unsubscribe()
  }, [])

  const signUp = async (email: string, password: string, name: string) => {
    const result = await signUpWithEmail(email, password, name)
    return result.user
  }

  const handleUpdateProfile = async (data: {
    displayName?: string
    photoURL?:    string
  }) => {
    if (!user) throw new Error("No user is signed in")
    await updateProfile(user.uid, data)
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

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === null) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
