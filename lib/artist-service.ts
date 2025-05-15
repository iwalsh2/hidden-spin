import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  query,
  where,
  orderBy,
  arrayUnion,
  arrayRemove,
  onSnapshot,
  getDoc,
} from "firebase/firestore"
import { ref, uploadString, getDownloadURL } from "firebase/storage"
import { db, storage } from "./firebase"

// Get all artists
export const getAllArtists = async () => {
  try {
    const artistsQuery = query(collection(db, "artists"), orderBy("name"))
    const snapshot = await getDocs(artistsQuery)
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }))
  } catch (error) {
    console.error("Error getting artists:", error)
    throw error
  }
}

// Get artists by user ID - Modified to avoid index requirement
export const getArtistsByUser = async (userId: string) => {
  try {
    // Query only by createdBy without ordering to avoid requiring a composite index
    const artistsQuery = query(collection(db, "artists"), where("createdBy", "==", userId))
    const snapshot = await getDocs(artistsQuery)

    // Get all artists created by this user
    const userArtists = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }))

    // Sort the results in JavaScript instead of using Firestore's orderBy
    return userArtists.sort((a, b) => {
      const nameA = (a.name || "").toLowerCase()
      const nameB = (b.name || "").toLowerCase()
      return nameA.localeCompare(nameB)
    })
  } catch (error) {
    console.error("Error getting user artists:", error)
    throw error
  }
}

// Get saved artists by user ID - Modified to avoid index requirement
export const getSavedArtistsByUser = async (userId: string) => {
  try {
    // Query only by savedBy array-contains without ordering
    const artistsQuery = query(collection(db, "artists"), where("savedBy", "array-contains", userId))
    const snapshot = await getDocs(artistsQuery)

    // Get all artists saved by this user
    const savedArtists = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }))

    // Sort the results in JavaScript
    return savedArtists.sort((a, b) => {
      const nameA = (a.name || "").toLowerCase()
      const nameB = (b.name || "").toLowerCase()
      return nameA.localeCompare(nameB)
    })
  } catch (error) {
    console.error("Error getting saved artists:", error)
    throw error
  }
}

// Add a new artist - improved with better error handling
export const addArtist = async (artistData) => {
  console.log("Starting to add artist:", artistData.name)

  try {
    // If there's an image, upload it to Firebase Storage
    let imageUrl = artistData.imageUrl

    if (imageUrl && imageUrl.startsWith("data:")) {
      console.log("Uploading image to Firebase Storage")
      try {
        const storageRef = ref(storage, `artist-images/${Date.now()}`)
        await uploadString(storageRef, imageUrl, "data_url")
        imageUrl = await getDownloadURL(storageRef)
        console.log("Image uploaded successfully:", imageUrl)
      } catch (uploadError) {
        console.error("Error uploading image to Firebase Storage:", uploadError)
        // Continue with null image rather than failing the whole operation
        imageUrl = null
      }
    }

    // Ensure all fields are properly formatted
    const artistForFirestore = {
      name: artistData.name || "Unknown Artist",
      genre: artistData.genre || "Unspecified",
      imageUrl,
      link: artistData.link || "",
      platform: artistData.platform || "Other",
      streamingPlatforms: artistData.streamingPlatforms || [],
      createdBy: artistData.createdBy || "anonymous",
      creatorName: artistData.creatorName || "Anonymous User",
      isOwnMusic: artistData.isOwnMusic || false,
      instagram: artistData.instagram || "",
      facebook: artistData.facebook || "",
      x: artistData.x || "",
      tiktok: artistData.tiktok || "",
      website: artistData.website || "",
      savedBy: artistData.savedBy || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    console.log("Adding artist to Firestore:", artistForFirestore)

    // Add the artist to Firestore
    const docRef = await addDoc(collection(db, "artists"), artistForFirestore)
    console.log("Artist added successfully with ID:", docRef.id)

    return {
      id: docRef.id,
      ...artistForFirestore,
    }
  } catch (error) {
    console.error("Error adding artist to Firestore:", error)
    // Provide more detailed error information
    if (error.code) {
      console.error("Firebase error code:", error.code)
    }
    throw error
  }
}

// Update the updateArtist function to add proper type checking and null handling

// Update an artist
export const updateArtist = async (id: string, artistData) => {
  try {
    console.log("Starting artist update for ID:", id)

    if (!id || !artistData) {
      throw new Error("Invalid artist data or ID")
    }

    // If there's a new image that's a data URL, upload it to Firebase Storage
    let imageUrl = artistData.imageUrl

    // Check if imageUrl is defined and is a data URL
    if (imageUrl && typeof imageUrl === "string" && imageUrl.startsWith("data:")) {
      try {
        const storageRef = ref(storage, `artist-images/${Date.now()}`)
        await uploadString(storageRef, imageUrl, "data_url")
        imageUrl = await getDownloadURL(storageRef)
      } catch (error) {
        console.error("Error uploading image:", error)
        // If image upload fails, keep the existing image URL
        imageUrl = artistData.imageUrl
      }
    }

    // Ensure all fields are properly formatted and handle undefined values
    const artistForFirestore = {
      name: artistData.name || "Unknown Artist",
      genre: artistData.genre || "Unspecified",
      imageUrl: imageUrl || null,
      link: typeof artistData.link === "string" ? artistData.link : "",
      platform: artistData.platform || "Other",
      streamingPlatforms: Array.isArray(artistData.streamingPlatforms)
        ? artistData.streamingPlatforms.map((platform) => ({
            name: platform.name || "Other",
            url: typeof platform.url === "string" ? platform.url : "",
          }))
        : [],
      createdBy: artistData.createdBy || "anonymous",
      creatorName: artistData.creatorName || "Anonymous User",
      isOwnMusic: Boolean(artistData.isOwnMusic),
      instagram: typeof artistData.instagram === "string" ? artistData.instagram : "",
      facebook: typeof artistData.facebook === "string" ? artistData.facebook : "",
      x: typeof artistData.x === "string" ? artistData.x : "",
      tiktok: typeof artistData.tiktok === "string" ? artistData.tiktok : "",
      website: typeof artistData.website === "string" ? artistData.website : "",
      youtube: typeof artistData.youtube === "string" ? artistData.youtube : "",
      savedBy: Array.isArray(artistData.savedBy) ? artistData.savedBy : [],
      updatedAt: new Date().toISOString(),
    }

    console.log("Updating artist with data:", artistForFirestore)

    // Update the artist in Firestore
    const artistRef = doc(db, "artists", id)
    await updateDoc(artistRef, artistForFirestore)

    return {
      id,
      ...artistForFirestore,
    }
  } catch (error) {
    console.error("Error updating artist:", error)
    throw error
  }
}

// Delete an artist
export const deleteArtist = async (id: string) => {
  try {
    await deleteDoc(doc(db, "artists", id))
    return id
  } catch (error) {
    console.error("Error deleting artist:", error)
    throw error
  }
}

// Toggle save artist
export const toggleSaveArtist = async (artistId: string, userId: string, isSaved: boolean) => {
  try {
    if (!artistId || !userId) {
      throw new Error("Artist ID and User ID are required")
    }

    const artistRef = doc(db, "artists", artistId)

    // First check if the artist document exists
    const artistDoc = await getDoc(artistRef)
    if (!artistDoc.exists()) {
      throw new Error("Artist document not found")
    }

    if (isSaved) {
      // Remove user from savedBy array
      await updateDoc(artistRef, {
        savedBy: arrayRemove(userId),
      })
    } else {
      // Add user to savedBy array
      await updateDoc(artistRef, {
        savedBy: arrayUnion(userId),
      })
    }

    return !isSaved
  } catch (error) {
    console.error("Error toggling save artist:", error)
    throw error
  }
}

// Get artist by ID
export const getArtistById = async (id: string) => {
  try {
    const artistRef = doc(db, "artists", id)
    const artistDoc = await getDoc(artistRef)

    if (artistDoc.exists()) {
      return {
        id: artistDoc.id,
        ...artistDoc.data(),
      }
    }

    return null
  } catch (error) {
    console.error("Error getting artist by ID:", error)
    throw error
  }
}

// Subscribe to artists updates (real-time)
export const subscribeToArtists = (callback) => {
  try {
    // Use a simple query without complex ordering to avoid index requirements
    const artistsQuery = query(collection(db, "artists"))
    return onSnapshot(
      artistsQuery,
      (snapshot) => {
        const artists = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
        // Sort the results in JavaScript
        const sortedArtists = artists.sort((a, b) => {
          const nameA = (a.name || "").toLowerCase()
          const nameB = (b.name || "").toLowerCase()
          return nameA.localeCompare(nameB)
        })
        callback(sortedArtists)
      },
      (error) => {
        console.error("Error in artists subscription:", error)
      },
    )
  } catch (error) {
    console.error("Error setting up artists subscription:", error)
    // Return a dummy unsubscribe function
    return () => {}
  }
}
