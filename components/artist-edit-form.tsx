"use client"
import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Music2, Plus, X } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
// Add imports at the top
import { PlusCircle, Trash } from "lucide-react"
import { STREAMING_PLATFORMS, detectPlatformFromUrl } from "@/lib/platform-utils"

export default function ArtistEditForm({ artist, onSave, onCancel }) {
  // Update the useState to include streaming platforms and YouTube
  const [editedArtist, setEditedArtist] = useState({
    ...artist,
    streamingPlatforms: artist.streamingPlatforms || [{ name: artist.platform || "Other", url: artist.link || "" }],
    youtube: artist.youtube || "",
  })
  const [newSocialType, setNewSocialType] = useState("")
  const [newSocialUrl, setNewSocialUrl] = useState("")

  // Add state for new platform inputs
  const [newPlatformName, setNewPlatformName] = useState("Other")
  const [newPlatformUrl, setNewPlatformUrl] = useState("")

  // Add ref for URL input
  const newPlatformUrlRef = useRef(null)

  // Handle image upload
  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]

      if (file.type.startsWith("image/")) {
        const reader = new FileReader()
        reader.onload = (e) => {
          if (e.target && e.target.result) {
            setEditedArtist({
              ...editedArtist,
              imageUrl: e.target.result.toString(),
            })
          }
        }
        reader.readAsDataURL(file)
      }
    }
  }

  // Add new social media link
  const addSocialLink = () => {
    if (newSocialType && newSocialUrl) {
      setEditedArtist({
        ...editedArtist,
        [newSocialType]: newSocialUrl,
      })
      setNewSocialType("")
      setNewSocialUrl("")
    }
  }

  // Remove social media link
  const removeSocialLink = (type) => {
    const updated = { ...editedArtist }
    updated[type] = ""
    setEditedArtist(updated)
  }

  // Update the handleStreamingUrlChange function to add proper type checking

  // Handle streaming URL change with auto-detection
  const handleStreamingUrlChange = (e, index) => {
    const url = e.target.value
    const updatedPlatforms = [...editedArtist.streamingPlatforms]

    // Update the URL
    updatedPlatforms[index] = {
      ...updatedPlatforms[index],
      url,
    }

    // Auto-detect platform if URL is not empty
    if (url && url.trim()) {
      try {
        const platformInfo = detectPlatformFromUrl(url)

        // Only update if it's a streaming platform
        if (platformInfo.type === "streaming") {
          updatedPlatforms[index].name = platformInfo.name
        }
      } catch (error) {
        console.error("Error detecting platform:", error)
        // Keep the existing platform name if detection fails
      }
    }

    setEditedArtist({
      ...editedArtist,
      streamingPlatforms: updatedPlatforms,
    })
  }

  // Add function to handle adding a streaming platform
  const addStreamingPlatform = () => {
    if (newPlatformUrl) {
      // Auto-detect platform
      const platformInfo = detectPlatformFromUrl(newPlatformUrl)

      // If it's a social platform, add to social links instead
      if (platformInfo.type === "social") {
        if (platformInfo.name === "YouTube") {
          setEditedArtist({
            ...editedArtist,
            youtube: newPlatformUrl,
          })
        } else if (platformInfo.name === "Instagram") {
          setEditedArtist({
            ...editedArtist,
            instagram: newPlatformUrl,
          })
        } else if (platformInfo.name === "Facebook") {
          setEditedArtist({
            ...editedArtist,
            facebook: newPlatformUrl,
          })
        } else if (platformInfo.name === "X") {
          setEditedArtist({
            ...editedArtist,
            x: newPlatformUrl,
          })
        } else if (platformInfo.name === "TikTok") {
          setEditedArtist({
            ...editedArtist,
            tiktok: newPlatformUrl,
          })
        } else if (platformInfo.name === "Website") {
          setEditedArtist({
            ...editedArtist,
            website: newPlatformUrl,
          })
        }
      } else {
        // Add to streaming platforms
        setEditedArtist({
          ...editedArtist,
          streamingPlatforms: [...editedArtist.streamingPlatforms, { name: platformInfo.name, url: newPlatformUrl }],
        })
      }

      setNewPlatformName("Other")
      setNewPlatformUrl("")

      // Focus back on the URL input for quick addition of multiple platforms
      if (newPlatformUrlRef.current) {
        newPlatformUrlRef.current.focus()
      }
    }
  }

  // Add function to remove streaming platform
  const removeStreamingPlatform = (index) => {
    const updatedPlatforms = [...editedArtist.streamingPlatforms]
    updatedPlatforms.splice(index, 1)
    setEditedArtist({
      ...editedArtist,
      streamingPlatforms: updatedPlatforms,
    })
  }

  // Handle key press in platform URL input
  const handleKeyPress = (e) => {
    if (e.key === "Enter" && newPlatformUrl) {
      e.preventDefault()
      addStreamingPlatform()
    }
  }

  return (
    <div className="grid gap-4 py-4">
      <div className="grid gap-2">
        <Label htmlFor="artistImage">Profile Image</Label>
        <div className="flex items-center gap-4">
          <div className="relative w-20 h-20 overflow-hidden rounded-md bg-black dark:bg-zinc-900 flex items-center justify-center">
            {editedArtist.imageUrl ? (
              <img
                src={editedArtist.imageUrl || "/placeholder.svg"}
                alt={`${editedArtist.name} profile image`}
                className="w-full h-full object-cover"
              />
            ) : (
              <Music2 className="h-8 w-8 text-white" />
            )}
          </div>
          <div className="flex-1">
            <Input id="image-upload" type="file" accept="image/*" onChange={handleImageChange} className="mb-2" />
          </div>
        </div>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="artistName">Artist Name</Label>
        <Input
          id="artistName"
          value={editedArtist.name}
          onChange={(e) => setEditedArtist({ ...editedArtist, name: e.target.value })}
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="genre">Genre</Label>
        <Input
          id="genre"
          value={editedArtist.genre}
          onChange={(e) => setEditedArtist({ ...editedArtist, genre: e.target.value })}
        />
      </div>

      {/* Replace the streaming link field with this streaming platforms section */}
      <div className="grid gap-2">
        <Label>Streaming Platforms</Label>
        {editedArtist.streamingPlatforms.map((platform, index) => (
          <div key={index} className="flex items-center gap-2 mb-2">
            <Select
              value={platform.name}
              onValueChange={(value) => {
                const updatedPlatforms = [...editedArtist.streamingPlatforms]
                updatedPlatforms[index] = { ...platform, name: value }
                setEditedArtist({
                  ...editedArtist,
                  streamingPlatforms: updatedPlatforms,
                })
              }}
            >
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Platform" />
              </SelectTrigger>
              <SelectContent>
                {STREAMING_PLATFORMS.map((platform) => (
                  <SelectItem key={platform} value={platform}>
                    {platform}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              value={platform.url}
              onChange={(e) => handleStreamingUrlChange(e, index)}
              placeholder="URL"
              className="flex-1"
            />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => removeStreamingPlatform(index)}
              className="h-8 w-8 text-muted-foreground hover:text-destructive"
            >
              <Trash className="h-4 w-4" />
            </Button>
          </div>
        ))}

        <div className="flex items-center gap-2 mt-2">
          <Select value={newPlatformName} onValueChange={setNewPlatformName}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Platform" />
            </SelectTrigger>
            <SelectContent>
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

      {/* Update the social media section to match the specified order */}
      <div className="border-t pt-4 mt-2">
        <Label className="mb-2 block">Social Media Links</Label>

        {/* YouTube */}
        <div className="flex items-center gap-2 mb-2">
          <span className="text-sm font-medium min-w-[80px]">YouTube:</span>
          <Input
            value={editedArtist.youtube || ""}
            onChange={(e) => setEditedArtist({ ...editedArtist, youtube: e.target.value })}
            className="flex-1"
            placeholder="YouTube URL"
          />
          {editedArtist.youtube && (
            <Button variant="ghost" size="icon" onClick={() => removeSocialLink("youtube")} className="h-8 w-8">
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Existing social links in the correct order */}
        {editedArtist.website && (
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm font-medium min-w-[80px]">Website:</span>
            <Input
              value={editedArtist.website}
              onChange={(e) => setEditedArtist({ ...editedArtist, website: e.target.value })}
              className="flex-1"
            />
            <Button variant="ghost" size="icon" onClick={() => removeSocialLink("website")} className="h-8 w-8">
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}

        {editedArtist.instagram && (
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm font-medium min-w-[80px]">Instagram:</span>
            <Input
              value={editedArtist.instagram}
              onChange={(e) => setEditedArtist({ ...editedArtist, instagram: e.target.value })}
              className="flex-1"
            />
            <Button variant="ghost" size="icon" onClick={() => removeSocialLink("instagram")} className="h-8 w-8">
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}

        {editedArtist.facebook && (
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm font-medium min-w-[80px]">Facebook:</span>
            <Input
              value={editedArtist.facebook}
              onChange={(e) => setEditedArtist({ ...editedArtist, facebook: e.target.value })}
              className="flex-1"
            />
            <Button variant="ghost" size="icon" onClick={() => removeSocialLink("facebook")} className="h-8 w-8">
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}

        {editedArtist.x && (
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm font-medium min-w-[80px]">X:</span>
            <Input
              value={editedArtist.x}
              onChange={(e) => setEditedArtist({ ...editedArtist, x: e.target.value })}
              className="flex-1"
            />
            <Button variant="ghost" size="icon" onClick={() => removeSocialLink("x")} className="h-8 w-8">
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}

        {editedArtist.tiktok && (
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm font-medium min-w-[80px]">TikTok:</span>
            <Input
              value={editedArtist.tiktok}
              onChange={(e) => setEditedArtist({ ...editedArtist, tiktok: e.target.value })}
              className="flex-1"
            />
            <Button variant="ghost" size="icon" onClick={() => removeSocialLink("tiktok")} className="h-8 w-8">
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}

        {/* Add new social link - Update the SelectContent to match the order */}
        <div className="flex items-center gap-2 mt-4">
          <Select value={newSocialType} onValueChange={setNewSocialType}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Platform" />
            </SelectTrigger>
            <SelectContent position="popper" sideOffset={5}>
              {!editedArtist.youtube && <SelectItem value="youtube">YouTube</SelectItem>}
              {!editedArtist.website && <SelectItem value="website">Website</SelectItem>}
              {!editedArtist.instagram && <SelectItem value="instagram">Instagram</SelectItem>}
              {!editedArtist.facebook && <SelectItem value="facebook">Facebook</SelectItem>}
              {!editedArtist.x && <SelectItem value="x">X</SelectItem>}
              {!editedArtist.tiktok && <SelectItem value="tiktok">TikTok</SelectItem>}
            </SelectContent>
          </Select>

          <Input
            placeholder="Enter URL"
            value={newSocialUrl}
            onChange={(e) => setNewSocialUrl(e.target.value)}
            className="flex-1"
          />

          <Button
            variant="outline"
            size="icon"
            onClick={addSocialLink}
            disabled={!newSocialType || !newSocialUrl}
            className="h-10 w-10"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="flex justify-between mt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="button" onClick={() => onSave(editedArtist)}>
          Save Changes
        </Button>
      </div>
    </div>
  )
}
