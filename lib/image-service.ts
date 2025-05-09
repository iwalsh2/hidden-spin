/**
 * Service for handling image uploads to ImgBB and Firebase storage
 */

import { doc, updateDoc, collection, addDoc, deleteDoc } from "firebase/firestore"
import { db } from "./firebase"

// ImgBB API key
const IMGBB_API_KEY = "f9ee2b7d6556055bf633324f39c75ebd"

/**
 * Upload an image to ImgBB
 * @param imageData Base64 image data
 * @returns Promise with the upload result
 */
export const uploadToImgBB = async (imageData: string): Promise<any> => {
  try {
    // Remove the data:image/jpeg;base64, part if it exists
    const base64Image = imageData.includes("base64,") ? imageData.split("base64,")[1] : imageData

    // Create form data for the API request
    const formData = new FormData()
    formData.append("key", IMGBB_API_KEY)
    formData.append("image", base64Image)

    // Send the request to ImgBB API
    const response = await fetch("https://api.imgbb.com/1/upload", {
      method: "POST",
      body: formData,
    })

    if (!response.ok) {
      throw new Error(`ImgBB upload failed: ${response.statusText}`)
    }

    const result = await response.json()
    console.log("ImgBB upload successful:", result)

    return result.data
  } catch (error) {
    console.error("Error uploading to ImgBB:", error)
    throw error
  }
}

/**
 * Store image metadata in Firebase
 * @param userId User ID who uploaded the image
 * @param imageData ImgBB image data
 * @param entityId Optional ID of the entity (artist) this image belongs to
 * @returns Promise with the stored image record
 */
export const storeImageMetadata = async (userId: string, imageData: any, entityId?: string): Promise<any> => {
  try {
    const imageRecord = {
      userId,
      entityId: entityId || null,
      imgbbId: imageData.id,
      url: imageData.url,
      displayUrl: imageData.display_url,
      deleteUrl: imageData.delete_url,
      thumbUrl: imageData.thumb?.url || null,
      mediumUrl: imageData.medium?.url || null,
      createdAt: new Date().toISOString(),
    }

    // Add to Firestore
    const docRef = await addDoc(collection(db, "images"), imageRecord)

    return {
      id: docRef.id,
      ...imageRecord,
    }
  } catch (error) {
    console.error("Error storing image metadata:", error)
    throw error
  }
}

/**
 * Upload image to ImgBB and store metadata in Firebase
 * @param imageData Base64 image data
 * @param userId User ID who uploaded the image
 * @param entityId Optional ID of the entity this image belongs to
 * @returns Promise with the complete image data
 */
export const uploadImage = async (imageData: string, userId: string, entityId?: string): Promise<any> => {
  try {
    // Upload to ImgBB
    const imgbbData = await uploadToImgBB(imageData)

    // Store metadata in Firebase
    const storedData = await storeImageMetadata(userId, imgbbData, entityId)

    return storedData
  } catch (error) {
    console.error("Error in uploadImage:", error)
    throw error
  }
}

/**
 * Delete image from Firebase (we can't delete from ImgBB with the free API)
 * @param imageId Firebase image document ID
 * @returns Promise indicating success
 */
export const deleteImageMetadata = async (imageId: string): Promise<boolean> => {
  try {
    await deleteDoc(doc(db, "images", imageId))
    return true
  } catch (error) {
    console.error("Error deleting image metadata:", error)
    throw error
  }
}

/**
 * Get images by entity ID (e.g., artist ID)
 * @param entityId Entity ID to get images for
 * @returns Promise with array of image records
 */
export const getImagesByEntity = async (entityId: string): Promise<any[]> => {
  try {
    const querySnapshot = await db.collection("images").where("entityId", "==", entityId).get()

    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }))
  } catch (error) {
    console.error("Error getting images by entity:", error)
    return []
  }
}

/**
 * Update an image's entity ID (for reassigning images)
 * @param imageId Image document ID
 * @param entityId New entity ID
 * @returns Promise indicating success
 */
export const updateImageEntity = async (imageId: string, entityId: string): Promise<boolean> => {
  try {
    await updateDoc(doc(db, "images", imageId), {
      entityId,
      updatedAt: new Date().toISOString(),
    })
    return true
  } catch (error) {
    console.error("Error updating image entity:", error)
    throw error
  }
}
