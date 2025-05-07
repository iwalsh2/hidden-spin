"use client"
import { useState, useRef, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AlertCircle, Upload, Trash, PlusCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { centerCrop, makeAspectCrop } from "react-image-crop"
import "react-image-crop/dist/ReactCrop.css"
import { STREAMING_PLATFORMS, detectPlatformFromUrl } from "@/lib/platform-utils"
import { saveDraft } from "@/lib/draft-service"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useToast } from "@/components/ui/use-toast"

// Sample genres for suggestions
const SAMPLE_GENRES = ["Rock", "Pop", "Country", "Jazz", "Pop Punk", "Rap"]

export default function AddArtistForm({
  onAddArtist,
  onSaveDraft,
  usedGenres,
  currentUser,
  isAddingArtist,
  initialData = null,
}) {
  const [artistName, setArtistName] = useState(initialData?.name || "")
  const [genre, setGenre] = useState(initialData?.genre || "")
  const [customGenre, setCustomGenre] = useState("")
  const [isOwnMusic, setIsOwnMusic] = useState(
    initialData?.isOwnMusic !== undefined ? (initialData.isOwnMusic ? "yes" : "no") : undefined,
  )
  const [error, setError] = useState("")
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(initialData?.imageUrl || null)
  const [isDragging, setIsDragging] = useState(false)
  const [streamingPlatforms, setStreamingPlatforms] = useState(
    initialData?.streamingPlatforms || [{ name: "Other", url: "" }],
  )
  const [newPlatformName, setNewPlatformName] = useState("Other")
  const [newPlatformUrl, setNewPlatformUrl] = useState("")
  const [socialLinks, setSocialLinks] = useState({
    youtube: initialData?.youtube || "",
    instagram: initialData?.instagram || "",
    facebook: initialData?.facebook || "",
    x: initialData?.x || "",
    tiktok: initialData?.tiktok || "",
    website: initialData?.website || "",
  })
  const [showExitDialog, setShowExitDialog] = useState(false)
  const [savingDraft, setSavingDraft] = useState(false)

  const [crop, setCrop] = useState({ unit: "%", width: 100, aspect: 1 })
  const [completedCrop, setCompletedCrop] = useState(null)
  const imgRef = useRef(null)
  const previewCanvasRef = useRef(null)

  const nameInputRef = useRef(null)
  const customGenreInputRef = useRef(null)
  const newPlatformUrlRef = useRef(null)
  const { toast } = useToast()

  // If exiting form is clicked
  const handleExitClick = () => {
    // Only show exit dialog if any field has data
    const hasData =
      artistName ||
      genre ||
      imagePreview ||
      streamingPlatforms.some((p) => p.url) ||
      Object.values(socialLinks).some((link) => link)

    if (hasData && !initialData) {
      setShowExitDialog(true)
    } else {
      // If no data, just exit
      window.history.back()
    }
  }

  // Auto-focus on artist name input when component mounts
  useEffect(() => {
    if (nameInputRef.current) {
      nameInputRef.current.focus()
    }

    // Set up beforeunload event to prompt user before leaving page
    const handleBeforeUnload = (e) => {
      const hasData =
        artistName ||
        genre ||
        imagePreview ||
        streamingPlatforms.some((p) => p.url) ||
        Object.values(socialLinks).some((link) => link)

      if (hasData && !initialData) {
        e.preventDefault()
        e.returnValue = ""
        return ""
      }
    }

    window.addEventListener("beforeunload", handleBeforeUnload)

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload)
    }
  }, [artistName, genre, imagePreview, streamingPlatforms, socialLinks, initialData])

  // Auto-focus on custom genre input when "custom" is selected
  useEffect(() => {
    if (genre === "custom" && customGenreInputRef.current) {
      customGenreInputRef.current.focus()
    }
  }, [genre])

  // Handle image drop
  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragging(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0]
      handleImageFile(file)
    }
  }

  // Handle image file selection
  const handleImageFile = (file) => {
    if (file.type.startsWith("image/")) {
      setImageFile(file)

      // Create preview for the cropper
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const img = new Image()
          img.src = e.target.result
          img.onload = () => {
            try {
              const canvas = document.createElement("canvas")
              const ctx = canvas.getContext("2d")
              canvas.width = img.width
              canvas.height = img.height
              ctx.drawImage(img, 0, 0)
              setImagePreview(canvas.toDataURL())
            } catch (error) {
              console.error("Error creating image preview:", error)
              setError("Failed to process image. Please try another one.")
            }
          }
          img.onerror = () => {
            setError("Failed to load image. Please try another one.")
          }
        } catch (error) {
          console.error("Error setting up image preview:", error)
          setError("Failed to process image. Please try another one.")
        }
      }
      reader.onerror = () => {
        setError("Failed to read image file. Please try another one.")
      }
      reader.readAsDataURL(file)
    } else {
      setError("Please select an image file")
    }
  }

  // Handle file input change
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleImageFile(e.target.files[0])
    }
  }

  // Handle genre change
  const handleGenreChange = (value) => {
    if (value === "custom") {
      setGenre("custom")
      // Focus on the custom genre input after a short delay to ensure it's rendered
      setTimeout(() => {
        if (customGenreInputRef.current) {
          customGenreInputRef.current.focus()
        }
      }, 10)
    } else {
      setGenre(value)
      setCustomGenre("")
    }
  }

  // Capitalize first letter of each word
  const capitalizeGenre = (text) => {
    return text
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ")
  }

  // Handle streaming platform URL change
  const handleStreamingUrlChange = (e, index) => {
    const url = e.target.value
    const updated = [...streamingPlatforms]

    // Update the URL
    updated[index].url = url

    // Auto-detect platform if URL is not empty
    if (url.trim()) {
      const platformInfo = detectPlatformFromUrl(url)

      // Only update if it's a streaming platform
      if (platformInfo.type === "streaming") {
        updated[index].name = platformInfo.name
      }
    }

    setStreamingPlatforms(updated)
  }

  // Handle social media URL change
  const handleSocialUrlChange = (e, platform) => {
    const url = e.target.value

    // Update the social link
    setSocialLinks({
      ...socialLinks,
      [platform]: url,
    })

    // If it's a YouTube URL and there's no streaming platform with YouTube, add it to streaming
    if (platform === "youtube" && url.trim() && !streamingPlatforms.some((p) => p.name === "YouTube")) {
      const platformInfo = detectPlatformFromUrl(url)
      if (platformInfo.name === "YouTube") {
        // Don't add to streaming platforms since YouTube is now in social
      }
    }
  }

  // Function to add streaming platform
  const addStreamingPlatform = () => {
    if (newPlatformUrl) {
      // Auto-detect platform
      const platformInfo = detectPlatformFromUrl(newPlatformUrl)

      // If it's a social platform, add to social links instead
      if (platformInfo.type === "social") {
        if (platformInfo.name === "YouTube") {
          setSocialLinks({
            ...socialLinks,
            youtube: newPlatformUrl,
          })
        } else if (platformInfo.name === "Instagram") {
          setSocialLinks({
            ...socialLinks,
            instagram: newPlatformUrl,
          })
        } else if (platformInfo.name === "Facebook") {
          setSocialLinks({
            ...socialLinks,
            facebook: newPlatformUrl,
          })
        } else if (platformInfo.name === "X") {
          setSocialLinks({
            ...socialLinks,
            x: newPlatformUrl,
          })
        } else if (platformInfo.name === "TikTok") {
          setSocialLinks({
            ...socialLinks,
            tiktok: newPlatformUrl,
          })
        } else if (platformInfo.name === "Website") {
          setSocialLinks({
            ...socialLinks,
            website: newPlatformUrl,
          })
        }
      } else {
        // Add to streaming platforms
        setStreamingPlatforms([
          ...streamingPlatforms,
          {
            name: platformInfo.name,
            url: newPlatformUrl,
          },
        ])
      }

      setNewPlatformName("Other")
      setNewPlatformUrl("")

      // Focus back on the URL input for quick addition of multiple platforms
      if (newPlatformUrlRef.current) {
        newPlatformUrlRef.current.focus()
      }
    }
  }

  // Function to remove streaming platform
  const removeStreamingPlatform = (index) => {
    const updated = [...streamingPlatforms]
    updated.splice(index, 1)
    setStreamingPlatforms(updated)
  }

  // Add function to handle cropping
  const onImageLoad = (e) => {
    const { width, height } = e.currentTarget
    const crop = centerCrop(
      makeAspectCrop(
        {
          unit: "%",
          width: 90,
        },
        1,
        width,
        height,
      ),
      width,
      height,
    )
    setCrop(crop)
  }

  // Function to complete the crop
  const completeCrop = () => {
    if (!completedCrop || !previewCanvasRef.current || !imgRef.current) {
      return
    }

    const image = imgRef.current
    const canvas = previewCanvasRef.current
    const crop = completedCrop

    const scaleX = image.naturalWidth / image.width
    const scaleY = image.naturalHeight / image.height
    const ctx = canvas.getContext("2d")

    canvas.width = crop.width
    canvas.height = crop.height

    ctx.drawImage(
      image,
      crop.x * scaleX,
      crop.y * scaleY,
      crop.width * scaleX,
      crop.height * scaleY,
      0,
      0,
      crop.width,
      crop.height,
    )

    canvas.toBlob((blob) => {
      if (!blob) return
      const reader = new FileReader()
      reader.onload = () => {
        setImagePreview(reader.result)
      }
      reader.readAsDataURL(blob)
    })
  }

  // Handle saving draft when user exits
  const handleSaveDraft = async () => {
    try {
      setSavingDraft(true)

      const finalGenre = genre === "custom" ? capitalizeGenre(customGenre) : genre

      const draftData = {
        name: artistName.trim() || "Untitled Artist",
        genre: finalGenre || "",
        imageUrl: imagePreview,
        streamingPlatforms: streamingPlatforms.filter((p) => p.url.trim()),
        link: streamingPlatforms[0]?.url || "",
        platform: streamingPlatforms[0]?.name || "Other",
        createdBy: currentUser?.uid || "anonymous",
        creatorName: currentUser?.displayName || "Anonymous User",
        isOwnMusic: isOwnMusic === "yes",
        ...socialLinks,
      }

      await saveDraft(draftData)

      toast({
        title: "Draft saved",
        description: "Your artist draft has been saved. You can continue editing it later.",
      })

      setSavingDraft(false)
      setShowExitDialog(false)

      // Go back
      window.history.back()
    } catch (error) {
      console.error("Error saving draft:", error)
      toast({
        title: "Error",
        description: "Failed to save draft. Please try again.",
        variant: "destructive",
      })
      setSavingDraft(false)
    }
  }

  // Handle form submission
  const handleSubmit = async () => {
    if (streamingPlatforms.length === 0 || !streamingPlatforms[0].url.trim()) {
      setError("Please enter at least one streaming platform URL")
      return
    }

    try {
      // Validate at least one streaming platform URL
      if (streamingPlatforms.length === 0 || !streamingPlatforms[0].url) {
        setError("Please enter at least one streaming platform URL")
        return
      }

      // Validate URL format for all platforms
      for (const platform of streamingPlatforms) {
        try {
          new URL(platform.url)
        } catch (e) {
          setError(`Please enter a valid URL for ${platform.name}`)
          return
        }
      }

      const finalGenre = genre === "custom" ? capitalizeGenre(customGenre) : genre

      const newArtist = {
        link: streamingPlatforms[0].url,
        streamingPlatforms: streamingPlatforms,
        name: artistName.trim() || "Unknown Artist",
        genre: finalGenre || "Unspecified",
        platform: streamingPlatforms[0].name,
        imageUrl: imagePreview, // Use the cropped image
        createdBy: currentUser?.uid || "anonymous",
        creatorName: currentUser?.displayName || "Anonymous User",
        isOwnMusic: isOwnMusic === "yes",
        instagram: socialLinks.instagram || "",
        x: socialLinks.x || "",
        facebook: socialLinks.facebook || "",
        tiktok: socialLinks.tiktok || "",
        website: socialLinks.website || "",
        youtube: socialLinks.youtube || "",
        savedBy: [],
      }

      const success = await onAddArtist(newArtist)

      if (success) {
        // Reset form
        setStreamingPlatforms([{ name: "Other", url: "" }])
        setArtistName("")
        setGenre("")
        setCustomGenre("")
        setImageFile(null)
        setImagePreview(null)
        setError("")
        setIsOwnMusic(undefined)
        setSocialLinks({
          youtube: "",
          instagram: "",
          facebook: "",
          x: "",
          tiktok: "",
          website: "",
        })
      }
    } catch (e) {
      console.error("Error submitting form:", e)
      setError("Please enter valid URLs")
    }
  }

  // Handle key press in platform URL input
  const handleKeyPress = (e) => {
    if (e.key === "Enter" && newPlatformUrl) {
      e.preventDefault()
      addStreamingPlatform()
    }
  }

  // All available genres (sample + used)
  const allGenres = [...new Set([...SAMPLE_GENRES, ...usedGenres])].sort()

  return (
    <Card className="max-w-2xl mx-auto">
      <CardContent className="p-6">
        <h2 className="text-xl font-semibold mb-4 text-center">
          {initialData ? "Edit Draft Artist" : "Add a Hidden Gem"}
        </h2>

        <Alert className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Note</AlertTitle>
          <AlertDescription>
            After adding an artist, you can edit their details and add social media links.
          </AlertDescription>
        </Alert>

        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-4">
          <div>
            <Label htmlFor="artistName" className="block text-sm font-medium mb-1">
              Artist Name
            </Label>
            <Input
              id="artistName"
              ref={nameInputRef}
              placeholder="Enter artist name"
              value={artistName}
              onChange={(e) => setArtistName(e.target.value)}
              className="w-full"
            />
          </div>

          <div>
            <Label htmlFor="genre" className="block text-sm font-medium mb-1">
              Genre
            </Label>
            <Select value={genre} onValueChange={handleGenreChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select a genre" />
              </SelectTrigger>
              <SelectContent>
                {allGenres.map((g) => (
                  <SelectItem key={g} value={g}>
                    {g}
                  </SelectItem>
                ))}
                <SelectItem value="custom">Custom genre...</SelectItem>
              </SelectContent>
            </Select>

            {genre === "custom" && (
              <Input
                placeholder="Enter custom genre"
                value={customGenre}
                onChange={(e) => setCustomGenre(e.target.value)}
                className="w-full mt-2"
                ref={customGenreInputRef}
              />
            )}
          </div>

          <div>
            <Label className="block text-sm font-medium mb-1">Streaming Platforms (required)</Label>
            {streamingPlatforms.map((platform, index) => (
              <div key={index} className="flex items-center gap-2 mb-2">
                <Select
                  value={platform.name}
                  onValueChange={(value) => {
                    const updated = [...streamingPlatforms]
                    updated[index].name = value
                    setStreamingPlatforms(updated)
                  }}
                >
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Platform" />
                  </SelectTrigger>
                  <SelectContent position="popper" sideOffset={5}>
                    {STREAMING_PLATFORMS.map((platform) => (
                      <SelectItem key={platform} value={platform}>
                        {platform}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  placeholder="Paste Link to Artist"
                  value={platform.url}
                  onChange={(e) => handleStreamingUrlChange(e, index)}
                  className="flex-1"
                />
                {index > 0 && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeStreamingPlatform(index)}
                    className="h-8 w-8"
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}

            <div className="flex items-center gap-2 mt-2">
              <Select value={newPlatformName} onValueChange={setNewPlatformName}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Platform" />
                </SelectTrigger>
                <SelectContent position="popper" sideOffset={5}>
                  {STREAMING_PLATFORMS.map((platform) => (
                    <SelectItem key={platform} value={platform}>
                      {platform}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                placeholder="Enter URL"
                value={newPlatformUrl}
                onChange={(e) => setNewPlatformUrl(e.target.value)}
                onKeyPress={handleKeyPress}
                ref={newPlatformUrlRef}
                className="flex-1"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={addStreamingPlatform}
                disabled={!newPlatformUrl}
                className="h-10 w-10"
              >
                <PlusCircle className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div>
            <Label className="block text-sm font-medium mb-1">Social Media</Label>

            {/* YouTube */}
            <div className="flex items-center gap-2 mb-2">
              <div className="w-[150px] text-sm font-medium">YouTube:</div>
              <Input
                placeholder="YouTube URL"
                value={socialLinks.youtube}
                onChange={(e) => handleSocialUrlChange(e, "youtube")}
                className="flex-1"
              />
            </div>

            {/* Instagram */}
            <div className="flex items-center gap-2 mb-2">
              <div className="w-[150px] text-sm font-medium">Instagram:</div>
              <Input
                placeholder="Instagram URL"
                value={socialLinks.instagram}
                onChange={(e) => handleSocialUrlChange(e, "instagram")}
                className="flex-1"
              />
            </div>

            {/* Facebook */}
            <div className="flex items-center gap-2 mb-2">
              <div className="w-[150px] text-sm font-medium">Facebook:</div>
              <Input
                placeholder="Facebook URL"
                value={socialLinks.facebook}
                onChange={(e) => handleSocialUrlChange(e, "facebook")}
                className="flex-1"
              />
            </div>

            {/* X (Twitter) */}
            <div className="flex items-center gap-2 mb-2">
              <div className="w-[150px] text-sm font-medium">X:</div>
              <Input
                placeholder="X URL"
                value={socialLinks.x}
                onChange={(e) => handleSocialUrlChange(e, "x")}
                className="flex-1"
              />
            </div>

            {/* TikTok */}
            <div className="flex items-center gap-2 mb-2">
              <div className="w-[150px] text-sm font-medium">TikTok:</div>
              <Input
                placeholder="TikTok URL"
                value={socialLinks.tiktok}
                onChange={(e) => handleSocialUrlChange(e, "tiktok")}
                className="flex-1"
              />
            </div>

            {/* Website */}
            <div className="flex items-center gap-2 mb-2">
              <div className="w-[150px] text-sm font-medium">Website:</div>
              <Input
                placeholder="Website URL"
                value={socialLinks.website}
                onChange={(e) => handleSocialUrlChange(e, "website")}
                className="flex-1"
              />
            </div>
          </div>

          <div>
            <Label className="block text-sm font-medium mb-1">Artist Image</Label>
            <div
              className={`border-2 border-dashed rounded-md p-6 text-center ${
                isDragging ? "border-primary bg-primary/10" : "border-muted-foreground/25"
              }`}
              onDragOver={(e) => {
                e.preventDefault()
                setIsDragging(true)
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
            >
              {imagePreview ? (
                <div className="relative w-full max-w-[200px] mx-auto">
                  <div className="aspect-square relative overflow-hidden rounded-md">
                    {/* Vinyl sleeve styling - removed the center circle */}
                    <div className="absolute inset-0 border-8 border-gray-200 dark:border-gray-800 rounded-md z-10"></div>
                    <img
                      src={imagePreview || "/placeholder.png"}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-2"
                    onClick={() => {
                      setImageFile(null)
                      setImagePreview(null)
                    }}
                  >
                    Remove
                  </Button>
                </div>
              ) : (
                <>
                  <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground mb-2">Drag and drop an image here, or click to select</p>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                    id="image-upload"
                  />
                  <Button variant="outline" onClick={() => document.getElementById("image-upload").click()}>
                    Select Image
                  </Button>
                </>
              )}
            </div>
          </div>

          <div>
            <Label className="block text-sm font-medium mb-2">Is this your music?</Label>
            <RadioGroup value={isOwnMusic} onValueChange={setIsOwnMusic} className="flex gap-4">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="yes" id="own-yes" />
                <Label htmlFor="own-yes">Yes, this is my music</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="no" id="own-no" />
                <Label htmlFor="own-no">No, sharing another artist</Label>
              </div>
            </RadioGroup>
          </div>

          <div className="flex items-center justify-between pt-4">
            <Button variant="outline" onClick={handleExitClick} disabled={isAddingArtist || savingDraft}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={
                streamingPlatforms.length === 0 || !streamingPlatforms[0].url.trim() || isAddingArtist || savingDraft
              }
              className="ml-auto"
            >
              {isAddingArtist ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Adding Artist...
                </>
              ) : (
                "Add to Library"
              )}
            </Button>
          </div>
        </div>
      </CardContent>

      {/* Exit confirmation dialog */}
      <AlertDialog open={showExitDialog} onOpenChange={setShowExitDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Save your draft?</AlertDialogTitle>
            <AlertDialogDescription>
              You've started adding an artist. Would you like to save your progress as a draft for later?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={savingDraft}>Exit without saving</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleSaveDraft}
              disabled={savingDraft}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {savingDraft ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Saving...
                </>
              ) : (
                "Save as draft"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  )
}
