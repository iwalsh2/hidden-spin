"use client"

import { useState } from "react"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Bookmark, ExternalLink, MoreHorizontal, Pencil, Trash2, X, Music } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog"
import ArtistEditForm from "./artist-edit-form"
import { useToast } from "@/components/ui/use-toast"

export default function ArtistCard({ artist, currentUser, onGenreClick, onUpdate, onDelete }) {
  const { toast } = useToast()
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [imageError, setImageError] = useState(false)

  // Check if the current user has saved this artist
  const isSaved = artist.savedBy?.includes(currentUser?.uid)

  // Handle toggling save status
  const handleToggleSave = async () => {
    try {
      setIsUpdating(true)
      const updatedSavedBy = isSaved
        ? artist.savedBy.filter((uid) => uid !== currentUser?.uid)
        : [...(artist.savedBy || []), currentUser?.uid]

      const updatedArtist = {
        ...artist,
        savedBy: updatedSavedBy,
      }

      await onUpdate(updatedArtist)
      setIsUpdating(false)

      // Success toast removed as requested
    } catch (error) {
      console.error("Error toggling save status:", error)
      setIsUpdating(false)
      toast({
        title: "Error",
        description: "Failed to update save status. Please try again.",
        variant: "destructive",
      })
    }
  }

  // Handle artist update
  const handleArtistUpdate = async (updatedArtist) => {
    try {
      setIsUpdating(true)
      await onUpdate(updatedArtist)
      setIsUpdating(false)
      setIsEditDialogOpen(false)

      // Success toast removed as requested
    } catch (error) {
      console.error("Error updating artist:", error)
      setIsUpdating(false)
      toast({
        title: "Error",
        description: "Failed to update artist. Please try again.",
        variant: "destructive",
      })
    }
  }

  // Handle artist delete
  const handleArtistDelete = async () => {
    try {
      setIsUpdating(true)
      await onDelete(artist.id)
      setIsUpdating(false)
      setIsDeleteDialogOpen(false)
    } catch (error) {
      console.error("Error deleting artist:", error)
      setIsUpdating(false)
      toast({
        title: "Error",
        description: "Failed to delete artist. Please try again.",
        variant: "destructive",
      })
    }
  }

  // Get the first streaming platform URL
  const firstPlatformUrl = artist.streamingPlatforms?.[0]?.url || artist.link || "#"

  return (
    <Card className="overflow-hidden transition-all hover:shadow-md">
      <div className="relative aspect-square overflow-hidden bg-gray-100">
        {/* Fallback for image loading errors */}
        {imageError && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-200">
            <Music className="h-16 w-16 text-gray-400" />
          </div>
        )}

        {/* Use regular img tag with error handling instead of Next.js Image */}
        <img
          src={artist.imageUrl || "/placeholder.svg?height=300&width=300"}
          alt={artist.name || "Artist"}
          className="h-full w-full object-cover transition-all hover:scale-105"
          onError={() => setImageError(true)}
        />

        <Button
          variant="outline"
          size="icon"
          className={`absolute right-2 top-2 h-8 w-8 rounded-full bg-white/80 backdrop-blur-sm ${
            isSaved ? "text-custom-blue" : "text-gray-500"
          }`}
          onClick={handleToggleSave}
          disabled={isUpdating || !currentUser}
          title={isSaved ? "Remove from saved" : "Save artist"}
        >
          <Bookmark className={`h-4 w-4 ${isSaved ? "fill-current" : ""}`} />
          <span className="sr-only">{isSaved ? "Unsave" : "Save"}</span>
        </Button>
      </div>
      <CardContent className="p-4">
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">{artist.name}</h3>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreHorizontal className="h-4 w-4" />
                  <span className="sr-only">More options</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <a href={firstPlatformUrl} target="_blank" rel="noopener noreferrer" className="flex items-center">
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Listen
                  </a>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setIsEditDialogOpen(true)}>
                  <Pencil className="mr-2 h-4 w-4" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setIsDeleteDialogOpen(true)} className="text-red-600">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          {artist.genre && (
            <Badge
              variant="secondary"
              className="cursor-pointer hover:bg-secondary/80"
              onClick={() => onGenreClick(artist.genre)}
            >
              {artist.genre}
            </Badge>
          )}
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <a
          href={firstPlatformUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center text-sm text-gray-500 hover:text-gray-900"
        >
          <ExternalLink className="mr-1 h-3 w-3" />
          {artist.streamingPlatforms?.[0]?.name || "Listen"}
        </a>
      </CardFooter>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          {/* FIX: Wrap DialogClose content in a single span element */}
          <DialogClose className="absolute right-4 top-4 z-10">
            <span>
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </span>
          </DialogClose>
          <DialogHeader>
            <DialogTitle>Edit Artist</DialogTitle>
          </DialogHeader>
          <ArtistEditForm
            artist={artist}
            onUpdateArtist={handleArtistUpdate}
            isUpdating={isUpdating}
            currentUser={currentUser}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          {/* FIX: Wrap DialogClose content in a single span element */}
          <DialogClose className="absolute right-4 top-4 z-10">
            <span>
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </span>
          </DialogClose>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p>
              Are you sure you want to delete <strong>{artist.name}</strong>? This action cannot be undone.
            </p>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleArtistDelete} disabled={isUpdating}>
              {isUpdating ? "Deleting..." : "Delete"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
