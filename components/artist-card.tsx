"use client"
import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Music2, ExternalLink, User } from "lucide-react"
import { useRouter } from "next/navigation"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog"
import ArtistEditForm from "./artist-edit-form"
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
import { Badge } from "@/components/ui/badge"
import { toggleSaveArtist } from "@/lib/artist-service"
import { useToast } from "@/components/ui/use-toast"

export default function ArtistCard({ artist, currentUser, onGenreClick, onUpdate, onDelete }) {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)
  const [isLinksDialogOpen, setIsLinksDialogOpen] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  // Add the heart button state
  const [isSaved, setIsSaved] = useState(artist.savedBy?.includes(currentUser?.uid) || false)
  const [isSaving, setIsSaving] = useState(false)

  // Check if current user is the creator of this artist
  const isCreator = currentUser?.uid === artist.createdBy

  // Handle card click to show details
  const handleCardClick = () => {
    setIsDetailsModalOpen(true)
  }

  // Prevent propagation for action buttons
  const handleActionClick = (e) => {
    e.stopPropagation()
  }

  // Navigate to user profile
  const navigateToUserProfile = (userId) => {
    if (userId) {
      router.push(`/profile/${userId}`)
    }
  }

  // Handle external link click to show links dialog
  const handleExternalLinkClick = (e) => {
    e.stopPropagation()
    setIsLinksDialogOpen(true)
  }

  // Open the selected link in a new tab
  const openLink = (url) => {
    if (url) {
      window.open(url, "_blank", "noopener,noreferrer")
      setIsLinksDialogOpen(false)
    }
  }

  // Add function to toggle save state
  const handleToggleSave = async (e) => {
    e.stopPropagation()

    if (!currentUser) {
      toast({
        title: "Authentication required",
        description: "Please log in to save artists",
        variant: "destructive",
      })
      return
    }

    if (!artist || !artist.id) {
      toast({
        title: "Error",
        description: "Invalid artist data",
        variant: "destructive",
      })
      return
    }

    try {
      setIsSaving(true)

      // Toggle save in Firestore
      await toggleSaveArtist(artist.id, currentUser.uid, isSaved)

      // Update local state
      const updatedSavedList = isSaved
        ? (artist.savedBy || []).filter((id) => id !== currentUser.uid)
        : [...(artist.savedBy || []), currentUser.uid]

      const updatedArtist = {
        ...artist,
        savedBy: updatedSavedList,
      }

      setIsSaved(!isSaved)

      // Ensure all required fields are present before updating
      if (typeof onUpdate === "function") {
        onUpdate(updatedArtist)
      }

      setIsSaving(false)
    } catch (error) {
      console.error("Error toggling save:", error)
      toast({
        title: "Error",
        description: `Failed to save artist: ${error.message || "Unknown error"}`,
        variant: "destructive",
      })
      setIsSaving(false)
    }
  }

  return (
    <>
      <Card className="hover:shadow-md transition-shadow overflow-hidden cursor-pointer" onClick={handleCardClick}>
        <div className="relative w-full aspect-square">
          {artist.imageUrl ? (
            <div className="relative w-full h-full">
              {/* Vinyl sleeve styling - removed the center circle */}
              <div className="absolute inset-0 border-8 border-gray-200 dark:border-gray-800 rounded-t-md z-10"></div>
              <img
                src={artist.imageUrl || "/placeholder.png"}
                alt={`${artist.name} profile image`}
                className="w-full h-full object-cover"
                onError={(e) => {
                  // If image fails to load, replace with placeholder
                  e.currentTarget.src = "/placeholder.png"
                }}
              />
            </div>
          ) : (
            <div className="w-full h-full bg-black dark:bg-zinc-900 flex items-center justify-center">
              <Music2 className="h-16 w-16 text-white" />
            </div>
          )}
        </div>
        <CardContent className="p-4">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-medium">{artist.name}</h3>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onGenreClick(artist.genre)
                }}
                className="text-sm text-muted-foreground hover:underline"
              >
                {artist.genre}
              </button>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                className={`h-8 w-8 ${isSaved ? "text-[#415da6]" : "text-muted-foreground hover:text-[#415da6]"}`}
                onClick={handleToggleSave}
                title={isSaved ? "Remove from saved" : "Save artist"}
                disabled={!currentUser || isSaving}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill={isSaved ? "currentColor" : "none"}
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                </svg>
              </Button>
              {isCreator && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-primary"
                  onClick={(e) => {
                    e.stopPropagation()
                    setIsEditModalOpen(true)
                  }}
                  title="Edit artist"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                  </svg>
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-primary external-link transition-colors"
                onClick={handleExternalLinkClick}
                title="Open links"
              >
                <ExternalLink className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Artist Details Modal - Adjusted size and content */}
      <Dialog open={isDetailsModalOpen} onOpenChange={setIsDetailsModalOpen}>
        <DialogContent className="sm:max-w-[500px] p-0 overflow-y-auto max-h-[85vh] my-auto">
          <DialogClose className="absolute right-4 top-4 z-10 text-white hover:text-gray-200" />
          <div className="relative">
            {artist.imageUrl ? (
              <div className="w-full h-[200px] relative">
                <img
                  src={artist.imageUrl || "/placeholder.png"}
                  alt={artist.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    // If image fails to load, replace with placeholder
                    e.currentTarget.src = "/placeholder.png"
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent"></div>
              </div>
            ) : (
              <div className="w-full h-[100px] bg-black dark:bg-zinc-900 flex items-center justify-center">
                <Music2 className="h-16 w-16 text-white" />
              </div>
            )}
          </div>

          <div className="p-6 pt-0 overflow-y-auto">
            <div className="flex flex-col gap-4">
              <div>
                <h2 className="text-2xl font-bold mt-4">{artist.name}</h2>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="secondary" className="rounded-full">
                    {artist.genre}
                  </Badge>
                  {/* Removed platform name display here */}
                </div>
              </div>

              <div className="grid gap-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Listen On</h3>
                  {artist.streamingPlatforms && artist.streamingPlatforms.length > 0 ? (
                    <div className="flex flex-col gap-2">
                      {artist.streamingPlatforms.map((platform, index) => (
                        <Button
                          key={index}
                          variant="outline"
                          className="w-full justify-center text-center"
                          onClick={() => openLink(platform.url)}
                        >
                          {platform.name}
                        </Button>
                      ))}
                    </div>
                  ) : (
                    <a
                      href={artist.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary external-link hover:underline"
                    >
                      Listen on {artist.platform}
                    </a>
                  )}
                </div>

                {(artist.instagram ||
                  artist.x ||
                  artist.facebook ||
                  artist.tiktok ||
                  artist.website ||
                  artist.youtube) && (
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">Social Media</h3>
                    <div className="flex flex-wrap gap-4 mt-2">
                      {artist.website && (
                        <a
                          href={artist.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-muted-foreground external-link hover:text-primary"
                          title="Website"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <circle cx="12" cy="12" r="10" />
                            <line x1="2" y1="12" x2="22" y2="12" />
                            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                          </svg>
                        </a>
                      )}
                      {artist.youtube && (
                        <a
                          href={artist.youtube}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-muted-foreground external-link hover:text-primary"
                          title="YouTube"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z" />
                            <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" />
                          </svg>
                        </a>
                      )}
                      {artist.instagram && (
                        <a
                          href={artist.instagram}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-muted-foreground external-link hover:text-primary"
                          title="Instagram"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                            <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                            <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                          </svg>
                        </a>
                      )}
                      {artist.facebook && (
                        <a
                          href={artist.facebook}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-muted-foreground external-link hover:text-primary"
                          title="Facebook"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                          </svg>
                        </a>
                      )}
                      {artist.x && (
                        <a
                          href={artist.x}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-muted-foreground external-link hover:text-primary"
                          title="X"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
                          </svg>
                        </a>
                      )}
                      {artist.tiktok && (
                        <a
                          href={artist.tiktok}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-muted-foreground external-link hover:text-primary"
                          title="TikTok"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M9 12a4 4 0 1 0 0 8 4 4 0 0 0 0-8Z" />
                            <path d="M15 8a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" />
                            <path d="M15 2v20" />
                            <path d="M9 20v2" />
                            <path d="M9 18v-8" />
                          </svg>
                        </a>
                      )}
                    </div>
                  </div>
                )}

                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Added By</h3>
                  <button
                    onClick={() => navigateToUserProfile(artist.createdBy)}
                    className="flex items-center gap-2 text-primary hover:underline"
                  >
                    <User className="h-3 w-3" />
                    <span>{artist.creatorName || "Anonymous User"}</span>
                  </button>
                </div>
              </div>

              <div className="flex justify-end mt-2">
                <DialogClose asChild>
                  <Button>Close</Button>
                </DialogClose>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* New Links Dialog */}
      <Dialog open={isLinksDialogOpen} onOpenChange={setIsLinksDialogOpen}>
        <DialogContent className="sm:max-w-[400px] max-h-[80vh]">
          <DialogClose className="absolute right-4 top-4 z-10" />
          <DialogHeader className="text-center">
            <DialogTitle>Open Artist Link</DialogTitle>
            <DialogDescription>Choose which platform to open for {artist.name}</DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-3 overflow-y-auto max-h-[50vh]">
            {artist.streamingPlatforms && artist.streamingPlatforms.length > 0 ? (
              artist.streamingPlatforms.map((platform, index) => (
                <Button
                  key={index}
                  variant="outline"
                  className="w-full justify-center text-center"
                  onClick={() => openLink(platform.url)}
                >
                  {platform.name}
                </Button>
              ))
            ) : artist.link ? (
              <Button
                variant="outline"
                className="w-full justify-center text-center"
                onClick={() => openLink(artist.link)}
              >
                {artist.platform || "Listen"}
              </Button>
            ) : (
              <p className="text-center text-muted-foreground">No streaming links available</p>
            )}

            {/* Add social media links if available */}
            {(artist.youtube || artist.website || artist.instagram || artist.facebook || artist.x || artist.tiktok) && (
              <>
                <div className="relative py-2">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center">
                    <span className="bg-background px-2 text-xs text-muted-foreground">Social Media</span>
                  </div>
                </div>

                {artist.youtube && (
                  <Button
                    variant="outline"
                    className="w-full justify-center text-center"
                    onClick={() => openLink(artist.youtube)}
                  >
                    YouTube
                  </Button>
                )}

                {artist.website && (
                  <Button
                    variant="outline"
                    className="w-full justify-center text-center"
                    onClick={() => openLink(artist.website)}
                  >
                    Website
                  </Button>
                )}

                {artist.instagram && (
                  <Button
                    variant="outline"
                    className="w-full justify-center text-center"
                    onClick={() => openLink(artist.instagram)}
                  >
                    Instagram
                  </Button>
                )}

                {artist.facebook && (
                  <Button
                    variant="outline"
                    className="w-full justify-center text-center"
                    onClick={() => openLink(artist.facebook)}
                  >
                    Facebook
                  </Button>
                )}

                {artist.x && (
                  <Button
                    variant="outline"
                    className="w-full justify-center text-center"
                    onClick={() => openLink(artist.x)}
                  >
                    X
                  </Button>
                )}

                {artist.tiktok && (
                  <Button
                    variant="outline"
                    className="w-full justify-center text-center"
                    onClick={() => openLink(artist.tiktok)}
                  >
                    TikTok
                  </Button>
                )}
              </>
            )}
          </div>
          <div className="flex justify-end pt-2 border-t">
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[85vh] overflow-y-auto">
          <DialogClose className="absolute right-4 top-4 z-10" />
          <DialogHeader>
            <DialogTitle>Edit Artist Details</DialogTitle>
            <DialogDescription>Update information for {artist.name}</DialogDescription>
          </DialogHeader>

          <ArtistEditForm
            artist={artist}
            onSave={(updatedArtist) => {
              onUpdate(updatedArtist)
              setIsEditModalOpen(false)
            }}
            onCancel={() => setIsEditModalOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete {artist.name} from the library. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                onDelete(artist.id)
                setIsDeleteDialogOpen(false)
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
