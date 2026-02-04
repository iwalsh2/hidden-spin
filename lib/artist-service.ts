import { db } from "@/lib/firebase"
import { collection, addDoc, updateDoc, deleteDoc, doc, getDocs, query, where, onSnapshot } from "firebase/firestore"

const ARTISTS_COLLECTION = "artists"

// Get all artists
export async function getAllArtists() {
  try {
    const artistsCollection = collection(db, ARTISTS_COLLECTION)
    const snapshot = await getDocs(artistsCollection)
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }))
  } catch (error) {
    console.error("Error getting artists:", error)
    return [] // Return empty array instead of throwing to prevent app crashes
  }
}

// Get artists by user ID
export async function getArtistsByUser(userId) {
  try {
    const artistsCollection = collection(db, ARTISTS_COLLECTION)
    const q = query(artistsCollection, where("savedBy", "array-contains", userId))
    const snapshot = await getDocs(q)
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }))
  } catch (error) {
    console.error("Error getting user artists:", error)
    return [] // Return empty array instead of throwing
  }
}

// Add a new artist
export async function addArtist(artistData) {
  try {
    const artistsCollection = collection(db, ARTISTS_COLLECTION)
    const docRef = await addDoc(artistsCollection, artistData)
    return {
      id: docRef.id,
      ...artistData,
    }
  } catch (error) {
    console.error("Error adding artist:", error)
    throw error
  }
}

// Update an artist
export async function updateArtist(artistId, artistData) {
  try {
    const artistRef = doc(db, ARTISTS_COLLECTION, artistId)
    await updateDoc(artistRef, artistData)
    return {
      id: artistId,
      ...artistData,
    }
  } catch (error) {
    console.error("Error updating artist:", error)
    throw error
  }
}

// Delete an artist
export async function deleteArtist(artistId) {
  try {
    const artistRef = doc(db, ARTISTS_COLLECTION, artistId)
    await deleteDoc(artistRef)
    return artistId
  } catch (error) {
    console.error("Error deleting artist:", error)
    throw error
  }
}

// Subscribe to artists (real-time updates)
export function subscribeToArtists(callback) {
  try {
    const artistsCollection = collection(db, ARTISTS_COLLECTION)
    const unsubscribe = onSnapshot(
      artistsCollection,
      (snapshot) => {
        const artists = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
        callback(artists)
      },
      (error) => {
        console.error("Error in artists subscription:", error)
        callback([]) // Call with empty array on error
      },
    )

    return unsubscribe
  } catch (error) {
    console.error("Error setting up artists subscription:", error)
    // Return a no-op function so calling code doesn't break
    return () => {}
  }
}
