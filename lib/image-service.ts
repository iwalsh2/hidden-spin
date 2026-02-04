import { getFirebaseStorage } from "@/components/auth-provider"
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage"

/**
 * Image service for handling image uploads
 */

// Function to upload an image to Firebase Storage or ImgBB
export async function uploadImage(file) {
  try {
    // Check if we have the ImgBB API key
    const imgbbApiKey = process.env.IMGBB_API_KEY

    if (imgbbApiKey) {
      // Use ImgBB for image hosting
      console.log("Uploading image to ImgBB:", file.name)

      const formData = new FormData()
      formData.append("image", file)
      formData.append("key", imgbbApiKey)

      const response = await fetch("https://api.imgbb.com/1/upload", {
        method: "POST",
        body: formData,
      })

      const data = await response.json()
      if (data.success) {
        return data.data.url
      } else {
        throw new Error(data.error?.message || "Failed to upload image to ImgBB")
      }
    } else {
      // Fallback to Firebase Storage if available
      try {
        const storage = getFirebaseStorage()
        if (!storage) {
          throw new Error("Firebase Storage is not initialized")
        }

        const storageRef = ref(storage, `images/${Date.now()}_${file.name}`)
        const snapshot = await uploadBytes(storageRef, file)
        return await getDownloadURL(snapshot.ref)
      } catch (firebaseError) {
        console.error("Firebase Storage error:", firebaseError)
        // If Firebase fails, use a placeholder
        return `/placeholder.svg?height=300&width=300&text=${encodeURIComponent(file.name)}`
      }
    }
  } catch (error) {
    console.error("Error uploading image:", error)
    // Return a fallback image URL
    return `/placeholder.svg?height=300&width=300`
  }
}

// Function to delete an image
export async function deleteImage(imageUrl) {
  try {
    // Check if this is a Firebase Storage URL
    if (imageUrl.includes("firebasestorage.googleapis.com")) {
      const storage = getFirebaseStorage()
      if (!storage) {
        throw new Error("Firebase Storage is not initialized")
      }

      // Extract the path from the URL
      const imageRef = ref(storage, imageUrl)
      await deleteObject(imageRef)
      return true
    } else if (imageUrl.includes("i.ibb.co")) {
      // ImgBB doesn't provide a direct API for deletion
      console.log("ImgBB image deletion not supported:", imageUrl)
      return true
    }

    // For other URLs or placeholders, just return success
    return true
  } catch (error) {
    console.error("Error deleting image:", error)
    return false
  }
}
