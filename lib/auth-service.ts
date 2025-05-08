import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup,
  type User,
  type UserCredential,
} from "firebase/auth"
import { doc, setDoc, getDoc, updateDoc } from "firebase/firestore"
import { getFirebaseAuth, db } from "./firebase"

// Default profile image path
const DEFAULT_PROFILE_IMAGE = "/images/default-avatar.png"

// Sign up with email and password
export const signUpWithEmail = async (
  email: string,
  password: string,
  displayName: string,
): Promise<UserCredential> => {
  try {
    // Get auth instance
    const auth = await getFirebaseAuth()
    if (!auth) {
      throw new Error("Firebase auth is not initialized")
    }

    const userCredential = await createUserWithEmailAndPassword(auth, email, password)

    // Update profile with display name and default avatar
    if (userCredential.user) {
      await updateProfile(userCredential.user, {
        displayName,
        photoURL: DEFAULT_PROFILE_IMAGE,
      })

      // Create user document in Firestore
      await setDoc(doc(db, "users", userCredential.user.uid), {
        uid: userCredential.user.uid,
        email,
        displayName,
        photoURL: DEFAULT_PROFILE_IMAGE,
        createdAt: new Date().toISOString(),
      })
    }

    return userCredential
  } catch (error) {
    console.error("Error signing up:", error)
    throw error
  }
}

// Sign in with email and password
export const signInWithEmail = async (email: string, password: string): Promise<UserCredential> => {
  try {
    // Get auth instance
    const auth = await getFirebaseAuth()
    if (!auth) {
      throw new Error("Firebase auth is not initialized")
    }

    return await signInWithEmailAndPassword(auth, email, password)
  } catch (error) {
    console.error("Error signing in:", error)
    throw error
  }
}

// Sign in with Google
export const signInWithGoogle = async (): Promise<UserCredential> => {
  try {
    // Get auth instance
    const auth = await getFirebaseAuth()
    if (!auth) {
      throw new Error("Firebase auth is not initialized")
    }

    const provider = new GoogleAuthProvider()
    const userCredential = await signInWithPopup(auth, provider)

    // Check if user document exists, if not create it
    const userDoc = await getDoc(doc(db, "users", userCredential.user.uid))

    if (!userDoc.exists()) {
      // If user doesn't have a photoURL from Google, use our default
      const photoURL = userCredential.user.photoURL || DEFAULT_PROFILE_IMAGE

      await setDoc(doc(db, "users", userCredential.user.uid), {
        uid: userCredential.user.uid,
        email: userCredential.user.email,
        displayName: userCredential.user.displayName,
        photoURL: photoURL,
        createdAt: new Date().toISOString(),
      })
    }

    return userCredential
  } catch (error) {
    console.error("Error signing in with Google:", error)
    throw error
  }
}

// Sign out
export const signOut = async (): Promise<void> => {
  try {
    // Get auth instance
    const auth = await getFirebaseAuth()
    if (!auth) {
      throw new Error("Firebase auth is not initialized")
    }

    return await firebaseSignOut(auth)
  } catch (error) {
    console.error("Error signing out:", error)
    throw error
  }
}

// Update user profile
export const updateUserProfile = async (
  user: User,
  data: { displayName?: string; photoURL?: string },
): Promise<void> => {
  try {
    // Update Firebase Auth profile
    await updateProfile(user, data)

    // Update Firestore user document
    await updateDoc(doc(db, "users", user.uid), {
      ...data,
      updatedAt: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Error updating profile:", error)
    throw error
  }
}
