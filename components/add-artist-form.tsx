"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, Plus, Trash2, Music } from "lucide-react"
import { Combobox } from "@/components/ui/combobox"
import { platformOptions } from "@/lib/constants"
import { uploadImage } from "@/lib/image-service"

export default function AddArtistForm({ onAddArtist, usedGenres = [], currentUser, isAddingArtist }) {
  const [name, setName] = useState("")
  const [genre, setGenre] = useState("")
  const [customGenre, setCustomGenre] = useState("")
  const [platforms, setPlatforms] = useState([{ name: "", url: "" }])
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState("")
  const [imageError, setImageError] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)

  // Combine used genres with default options
  const genreOptions = [
    ...new Set([
      ...usedGenres,
      "Rock",
      "Pop",
      "Hip Hop",
      "R&B",
      "Electronic",
      "Jazz",
      "Classical",
      "Folk",
      "Country",
      "Metal",
      "Indie",
      "Alternative",
    ]),
  ].sort()

  // Handle image selection
  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setImageFile(file)
      setImageError(false)

      // Create a preview URL
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      setIsUploading(true)

      // Upload image if provided
      let imageUrl = ""
      if (imageFile) {
        // Simulate upload progress
        const progressInterval = setInterval(() => {
          setUploadProgress((prev) => {
            if (prev >= 90) {
              clearInterval(progressInterval)
              return prev
            }
            return prev + 10
          })
        }, 300)

        try {
          // Upload image to ImgBB or your storage service
          imageUrl = await uploadImage(imageFile)
          clearInterval(progressInterval)
          setUploadProgress(100)
        } catch (error) {
          console.error("Error uploading image:", error)
          clearInterval(progressInterval)
          setUploadProgress(0)
          throw new Error("Failed to upload image")
        }
      }

      // Filter out empty platform entries
      const validPlatforms = platforms.filter((platform) => platform.name && platform.url)

      // Create new artist object
      const newArtist = {
        name,
        genre: genre === "custom" ? customGenre : genre,
        streamingPlatforms: validPlatforms,
        imageUrl,
        createdBy: currentUser?.uid || "anonymous",
        createdAt: new Date().toISOString(),
        savedBy: [currentUser?.uid].filter(Boolean),
      }

      // Call the onAddArtist function passed from parent
      const success = await onAddArtist(newArtist)

      if (success) {
        // Reset form on success
        setName("")
        setGenre("")
        setCustomGenre("")
        setPlatforms([{ name: "", url: "" }])
        setImageFile(null)
        setImagePreview("")
        setUploadProgress(0)
      }

      setIsUploading(false)
    } catch (error) {
      console.error("Error adding artist:", error)
      setIsUploading(false)
    }
  }

  // Add a platform field
  const addPlatform = () => {
    setPlatforms([...platforms, { name: "", url: "" }])
  }

  // Remove a platform field
  const removePlatform = (index) => {
    const updatedPlatforms = [...platforms]
    updatedPlatforms.splice(index, 1)
    setPlatforms(updatedPlatforms.length ? updatedPlatforms : [{ name: "", url: "" }])
  }

  // Update platform field
  const updatePlatform = (index, field, value) => {
    const updatedPlatforms = [...platforms]
    updatedPlatforms[index] = { ...updatedPlatforms[index], [field]: value }
    setPlatforms(updatedPlatforms)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <Label htmlFor="name">Artist Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter artist name"
              required
            />
          </div>

          <div>
            <Label htmlFor="genre">Genre</Label>
            <Combobox
              options={genreOptions.map((g) => ({ label: g, value: g }))}
              value={genre}
              onChange={(value) => {
                setGenre(value)
                if (value !== "custom") {
                  setCustomGenre("")
                }
              }}
              placeholder="Select a genre"
              customOption={{ label: "Add custom genre...", value: "custom" }}
            />
            {genre === "custom" && (
              <Input
                className="mt-2"
                value={customGenre}
                onChange={(e) => setCustomGenre(e.target.value)}
                placeholder="Enter custom genre"
                required
              />
            )}
          </div>

          <div>
            <Label>Streaming Platforms</Label>
            {platforms.map((platform, index) => (
              <div key={index} className="flex gap-2 mt-2">
                <div className="flex-1">
                  <Combobox
                    options={platformOptions}
                    value={platform.name}
                    onChange={(value) => updatePlatform(index, "name", value)}
                    placeholder="Platform"
                  />
                </div>
                <div className="flex-[2]">
                  <Input
                    value={platform.url}
                    onChange={(e) => updatePlatform(index, "url", e.target.value)}
                    placeholder="URL"
                  />
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => removePlatform(index)}
                  disabled={platforms.length === 1}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <Button type="button" variant="outline" size="sm" onClick={addPlatform} className="mt-2">
              <Plus className="h-4 w-4 mr-2" />
              Add Platform
            </Button>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <Label htmlFor="image">Artist Image</Label>
            <div className="mt-2 flex flex-col items-center justify-center">
              <div className="relative w-full aspect-square mb-4 bg-gray-100 rounded-md overflow-hidden">
                {imageError && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-200">
                    <Music className="h-16 w-16 text-gray-400" />
                  </div>
                )}

                {imagePreview ? (
                  <img
                    src={imagePreview || "/placeholder.svg"}
                    alt="Preview"
                    className="w-full h-full object-cover"
                    onError={() => setImageError(true)}
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center h-full">
                    <Music className="h-16 w-16 text-gray-400 mb-2" />
                    <p className="text-sm text-gray-500">No image selected</p>
                  </div>
                )}

                {isUploading && uploadProgress > 0 && (
                  <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs p-1">
                    <div className="bg-white h-1 rounded-full overflow-hidden">
                      <div
                        className="bg-custom-blue h-full transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>

              <Input id="image" type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
              <Label
                htmlFor="image"
                className="cursor-pointer inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2"
              >
                Choose Image
              </Label>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={isAddingArtist || isUploading}>
          {(isAddingArtist || isUploading) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isAddingArtist || isUploading ? "Adding Artist..." : "Add Artist"}
        </Button>
      </div>
    </form>
  )
}
