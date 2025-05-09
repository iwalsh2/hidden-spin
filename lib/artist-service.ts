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
import { db } from "./firebase"
import { uploadImage, deleteImageMetadata } from "./image-service"

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

// Add a new artist - improved with better error handling and ImgBB integration
export const addArtist = async (artistData) => {
  console.log("Starting to add artist:", artistData.name)

  try {
    // If there's an image, upload it to ImgBB
    let imageUrl = artistData.imageUrl
    let imageId = null

    if (imageUrl && imageUrl.startsWith("data:")) {
      console.log("Uploading image to ImgBB")
      try {
        // Upload to ImgBB and store metadata in Firebase
        const imageData = await uploadImage(imageUrl, artistData.createdBy, null) // We'll update entityId after artist creation
        imageUrl = imageData.displayUrl
        imageId = imageData.id
        console.log("Image uploaded successfully:", imageUrl)
      } catch (uploadError) {
        console.error("Error uploading image to ImgBB:", uploadError)
        // Continue with null image rather than failing the whole operation
        imageUrl = null
        imageId = null
      }
    }

    // Ensure all fields are properly formatted
    const artistForFirestore = {
      name: artistData.name || "Unknown Artist",
      genre: artistData.genre || "Unspecified",
      imageUrl,
      imageId,
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

    // If we uploaded an image, update its entityId
    if (imageId) {
      try {
        await updateDoc(doc(db, "images", imageId), {
          entityId: docRef.id,
        })
      } catch (error) {
        console.error("Error updating image entityId:", error)
        // Non-critical error, continue
      }
    }

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

// Update an artist with ImgBB integration
export const updateArtist = async (id: string, artistData) => {
  try {
    console.log("Starting artist update for ID:", id)

    if (!id || !artistData) {
      throw new Error("Invalid artist data or ID")
    }

    // Get the current artist data to check if we need to delete an old image
    const currentArtistDoc = await getDoc(doc(db, "artists", id))
    const currentArtist = currentArtistDoc.exists() ? currentArtistDoc.data() : null
    const oldImageId = currentArtist?.imageId || null

    // If there's a new image that's a data URL, upload it to ImgBB
    let imageUrl = artistData.imageUrl
    let imageId = artistData.imageId || null

    // Check if imageUrl is defined and is a data URL (new image upload)
    if (imageUrl && typeof imageUrl === "string" && imageUrl.startsWith("data:")) {
      try {
        // Upload to ImgBB and store metadata in Firebase
        const imageData = await uploadImage(imageUrl, artistData.createdBy, id)
        imageUrl = imageData.displayUrl
        imageId = imageData.id

        // If we had an old image and we're replacing it, delete the old one
        if (oldImageId && oldImageId !== imageId) {
          try {
            await deleteImageMetadata(oldImageId)
          } catch (deleteError) {
            console.error("Error deleting old image:", deleteError)
            // Non-critical error, continue
          }
        }
      } catch (error) {
        console.error("Error uploading image:", error)
        // If image upload fails, keep the existing image URL and ID
        imageUrl = currentArtist?.imageUrl || null
        imageId = oldImageId
      }
    } else if (imageUrl === null && oldImageId) {
      // If imageUrl is explicitly set to null, delete the old image
      try {
        await deleteImageMetadata(oldImageId)
        imageId = null
      } catch (deleteError) {
        console.error("Error deleting old image:", deleteError)
        // Non-critical error, continue
      }
    } else if (currentArtist?.imageUrl && !imageUrl) {
      // If no new image and we had an old one, keep the old one
      imageUrl = currentArtist.imageUrl
      imageId = oldImageId
    }

    // Ensure all fields are properly formatted and handle undefined values
    const artistForFirestore = {
      name: artistData.name || "Unknown Artist",
      genre: artistData.genre || "Unspecified",
      imageUrl: imageUrl || null,
      imageId: imageId || null,
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

// Delete an artist and its associated images
export const deleteArtist = async (id: string) => {
  try {
    // Get the artist to check for associated images
    const artistDoc = await getDoc(doc(db, "artists", id))
    if (artistDoc.exists()) {
      const artist = artistDoc.data()

      // If the artist has an image, delete it
      if (artist.imageId) {
        try {
          await deleteImageMetadata(artist.imageId)
        } catch (error) {
          console.error("Error deleting artist image:", error)
          // Non-critical error, continue with artist deletion
        }
      }
    }

    // Delete the artist document
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
