import { doc, setDoc, getDoc, updateDoc } from "firebase/firestore"
import { db } from "./firebase"
import { uploadImage } from "./image-service"

/**
 * Create or update a user profile in Firestore
 * @param user Firebase Auth user object
 * @returns Promise with the user profile data
 */
export const createOrUpdateUserProfile = async (user: any): Promise<any> => {
  if (!user || !user.uid) {
    throw new Error("Invalid user data")
  }

  try {
    const userRef = doc(db, "users", user.uid)
    const userDoc = await getDoc(userRef)

    // If user exists, update last login
    if (userDoc.exists()) {
      await updateDoc(userRef, {
        lastLogin: new Date().toISOString(),
      })

      return {
        id: user.uid,
        ...userDoc.data(),
      }
    }

    // Create new user profile
    const userData = {
      uid: user.uid,
      email: user.email || null,
      displayName: user.displayName || "Anonymous User",
      photoURL: user.photoURL || "/images/default-avatar.png",
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
    }

    await setDoc(userRef, userData)

    return {
      id: user.uid,
      ...userData,
    }
  } catch (error) {
    console.error("Error creating/updating user profile:", error)
    throw error
  }
}

/**
 * Get a user profile by ID
 * @param userId User ID
 * @returns Promise with the user profile data
 */
export const getUserProfile = async (userId: string): Promise<any> => {
  try {
    const userDoc = await getDoc(doc(db, "users", userId))

    if (userDoc.exists()) {
      return {
        id: userId,
        ...userDoc.data(),
      }
    }

    return null
  } catch (error) {
    console.error("Error getting user profile:", error)
    throw error
  }
}

/**
 * Update user profile data
 * @param userId User ID
 * @param profileData Profile data to update
 * @returns Promise with the updated profile
 */
export const updateUserProfile = async (userId: string, profileData: any): Promise<any> => {
  try {
    // Handle profile image upload if it's a base64 string
    let photoURL = profileData.photoURL

    if (photoURL && typeof photoURL === "string" && photoURL.startsWith("data:")) {
      // Upload to ImgBB and store in Firebase
      const imageData = await uploadImage(photoURL, userId)
      photoURL = imageData.displayUrl
    }

    const updatedData = {
      ...profileData,
      photoURL,
      updatedAt: new Date().toISOString(),
    }

    // Update in Firestore
    await updateDoc(doc(db, "users", userId), updatedData)

    // Update in Firebase Auth if needed
    if (profileData.displayName || photoURL) {
      const auth = await import("firebase/auth").then((module) => module.getAuth())
      const currentUser = auth.currentUser

      if (currentUser) {
        await import("firebase/auth").then((module) =>
          module.updateProfile(currentUser, {
            displayName: profileData.displayName || currentUser.displayName,
            photoURL: photoURL || currentUser.photoURL,
          }),
        )
      }
    }

    return {
      id: userId,
      ...updatedData,
    }
  } catch (error) {
    console.error("Error updating user profile:", error)
    throw error
  }
}
