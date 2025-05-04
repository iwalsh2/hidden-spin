"use client"
import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Music2, Plus, X, Trash, PlusCircle } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { STREAMING_PLATFORMS, detectPlatformFromUrl } from "@/lib/platform-utils"
import { db } from "@/lib/firebase"
import { doc, deleteDoc } from "firebase/firestore"

export default function ArtistEditForm({ artist, onSave, onCancel }) {
  const [editedArtist, setEditedArtist] = useState({
    ...artist,
    streamingPlatforms:
      artist.streamingPlatforms || [{ name: artist.platform || "Other", url: artist.link || "" }],
    youtube: artist.youtube || "",
  })
  const [newSocialType, setNewSocialType] = useState("")
  const [newSocialUrl, setNewSocialUrl] = useState("")
  const [newPlatformName, setNewPlatformName] = useState("Other")
  const [newPlatformUrl, setNewPlatformUrl] = useState("")
  const newPlatformUrlRef = useRef(null)

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      if (file.type.startsWith("image/")) {
        const reader = new FileReader()
        reader.onload = (ev) => {
          if (ev.target && ev.target.result) {
            setEditedArtist((prev) => ({ ...prev, imageUrl: ev.target.result.toString() }))
          }
        }
        reader.readAsDataURL(file)
      }
    }
  }

  const addSocialLink = () => {
    if (newSocialType && newSocialUrl) {
      setEditedArtist((prev) => ({ ...prev, [newSocialType]: newSocialUrl }))
      setNewSocialType("")
      setNewSocialUrl("")
    }
  }

  const removeSocialLink = (type) => {
    setEditedArtist((prev) => ({ ...prev, [type]: "" }))
  }

  const handleStreamingUrlChange = (e, index) => {
    const url = e.target.value
    setEditedArtist((prev) => {
      const platforms = [...prev.streamingPlatforms]
      platforms[index] = { ...platforms[index], url }
      if (url.trim()) {
        try {
          const info = detectPlatformFromUrl(url)
          if (info.type === "streaming") platforms[index].name = info.name
        } catch {}
      }
      return { ...prev, streamingPlatforms: platforms }
    })
  }

  const addStreamingPlatform = () => {
    if (!newPlatformUrl) return
    const info = detectPlatformFromUrl(newPlatformUrl)
    setEditedArtist((prev) => {
      if (info.type === "social") {
        const key = info.name.toLowerCase()
        return { ...prev, [key]: newPlatformUrl }
      }
      return {
        ...prev,
        streamingPlatforms: [...prev.streamingPlatforms, { name: info.name, url: newPlatformUrl }],
      }
    })
    setNewPlatformUrl("")
    newPlatformUrlRef.current?.focus()
  }

  const removeStreamingPlatform = (i) => {
    setEditedArtist((prev) => {
      const list = [...prev.streamingPlatforms]
      list.splice(i, 1)
      return { ...prev, streamingPlatforms: list }
    })
  }

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      e.preventDefault()
      addStreamingPlatform()
    }
  }

  const handleDelete = async () => {
    if (!confirm(`Delete artist "${artist.name}"? This cannot be undone.`)) return
    try {
      await deleteDoc(doc(db, "artists", artist.id))
      onCancel()
    } catch (err) {
      console.error(err)
      alert("Error deleting artist.")
    }
  }

  return (
    <div className="grid gap-4 py-4">
      {/* Profile Image */}
      <div className="grid gap-2">
        <Label htmlFor="artistImage">Profile Image</Label>
        <div className="flex items-center gap-4">
          <div className="relative w-20 h-20 overflow-hidden rounded-md bg-black dark:bg-zinc-900 flex items-center justify-center">
            {editedArtist.imageUrl ? (
              <img
                src={editedArtist.imageUrl}
                alt={`${editedArtist.name} profile image`}
                className="w-full h-full object-cover"
              />
            ) : (
              <Music2 className="h-8 w-8 text-white" />
            )}
          </div>
          <Input
            id="artistImage"
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="mb-2"
          />
        </div>
      </div>

      {/* Name & Genre */}
      <div className="grid gap-2">
        <Label htmlFor="artistName">Artist Name</Label>
        <Input
          id="artistName"
          value={editedArtist.name}
          onChange={(e) =>
            setEditedArtist((prev) => ({ ...prev, name: e.target.value }))
          }
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="genre">Genre</Label>
        <Input
          id="genre"
          value={editedArtist.genre}
          onChange={(e) =>
            setEditedArtist((prev) => ({ ...prev, genre: e.target.value }))
          }
        />
      </div>

      {/* Streaming Platforms */}
      <div className="grid gap-2">
        <Label>Streaming Platforms</Label>
        {editedArtist.streamingPlatforms.map((plat, idx) => (
          <div key={idx} className="flex items-center gap-2 mb-2">
            <Select
              value={plat.name}
              onValueChange={(val) => {
                setEditedArtist((prev) => {
                  const arr = [...prev.streamingPlatforms]
                  arr[idx].name = val
                  return { ...prev, streamingPlatforms: arr }
                })
              }}
            >
              <SelectTrigger className="w-[150px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STREAMING_PLATFORMS.map((p) => (
                  <SelectItem key={p} value={p}>
                    {p}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              value={plat.url}
              onChange={(e) => handleStreamingUrlChange(e, idx)}
              placeholder="URL"
              className="flex-1"
            />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => removeStreamingPlatform(idx)}
              className="h-8 w-8 text-muted-foreground hover:text-destructive"
            >
              <Trash className="h-4 w-4" />
            </Button>
          </div>
        ))}
        <div className="flex items-center gap-2">
          <Select
            value={newPlatformName}
            onValueChange={setNewPlatformName}
          >
            <SelectTrigger className="w-[150px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STREAMING_PLATFORMS.map((p) => (
                <SelectItem key={p} value={p}>
                  {p}
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

      {/* Social Media Links */}
      <div className="border-t pt-4">
        <Label className="mb-2 block">Social Media Links</Label>
        {['youtube', 'website', 'instagram', 'facebook', 'x', 'tiktok'].map((type) => (
          <div key={type} className="flex items-center gap-2 mb-2">
            <span className="text-sm font-medium min-w-[80px]">{type.charAt(0).toUpperCase() + type.slice(1)}:</span>
            <Input
              value={editedArtist[type] || ''}
              onChange={(e) => setEditedArtist((prev) => ({ ...prev, [type]: e.target.value }))}
              placeholder={`${type.charAt(0).toUpperCase() + type.slice(1)} URL`}
              className="flex-1"
            />
            {editedArtist[type] && (
              <Button variant="ghost" size="icon" onClick={() => removeSocialLink(type)}>
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        ))}
        <div className="flex items-center gap-2 mt-4">
          <Select value={newSocialType} onValueChange={setNewSocialType}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Platform" />
            </SelectTrigger>
            <SelectContent>
              {['youtube', 'website', 'instagram', 'facebook', 'x', 'tiktok']
                .filter((p) => !editedArtist[p])
                .map((p) => (
                  <SelectItem key={p} value={p}>
                    {p.charAt(0).toUpperCase() + p.slice(1)}
                  </SelectItem>
                ))}
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
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex justify-between mt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="button" variant="destructive" onClick={handleDelete}>
          <Trash className="h-4 w-4" />
        </Button>
        <Button type="button" onClick={() => onSave(editedArtist)}>
          Save Changes
        </Button>
      </div>
    </div>
  )
}
