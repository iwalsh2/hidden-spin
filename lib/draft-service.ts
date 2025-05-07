import { collection, addDoc, getDocs, query, where, deleteDoc, doc } from "firebase/firestore"
import { db } from "./firebase"

// Get all drafts for a user
export const getDraftsByUser = async (userId: string) => {
  try {
    // Query only by createdBy without ordering to avoid requiring a composite index
    const draftsQuery = query(collection(db, "artistDrafts"), where("createdBy", "==", userId))
    const snapshot = await getDocs(draftsQuery)

    // Get all drafts created by this user
    const userDrafts = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }))

    // Sort by last modified date
    return userDrafts.sort((a, b) => {
      const dateA = a.updatedAt ? new Date(a.updatedAt).getTime() : 0
      const dateB = b.updatedAt ? new Date(b.updatedAt).getTime() : 0
      return dateB - dateA // Sort by most recently updated first
    })
  } catch (error) {
    console.error("Error getting user drafts:", error)
    throw error
  }
}

// Save a new draft
export const saveDraft = async (draftData) => {
  try {
    // Create a new draft with timestamp
    const draftForFirestore = {
      ...draftData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    // Add the draft to Firestore
    const docRef = await addDoc(collection(db, "artistDrafts"), draftForFirestore)

    return {
      id: docRef.id,
      ...draftForFirestore,
    }
  } catch (error) {
    console.error("Error saving draft:", error)
    throw error
  }
}

// Delete a draft
export const deleteDraft = async (id: string) => {
  try {
    await deleteDoc(doc(db, "artistDrafts", id))
    return id
  } catch (error) {
    console.error("Error deleting draft:", error)
    throw error
  }
}
