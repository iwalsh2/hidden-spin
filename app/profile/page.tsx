"use client"
import { useEffect, useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from "@/components/auth-provider"
import { Music2, Loader2, AlertCircle } from "lucide-react"
import ArtistCard from "@/components/artist-card"
import DraftArtistCard from "@/components/draft-artist-card"
import { getArtistsByUser, getSavedArtistsByUser, updateArtist, deleteArtist } from "@/lib/artist-service"
import { getDraftsByUser, deleteDraft } from "@/lib/draft-service"
import { useToast } from "@/components/ui/use-toast"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import AddArtistForm from "@/components/add-artist-form"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function ProfilePage() {
  const { user, isAuthenticated, loading } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  const [userArtists, setUserArtists] = useState([])
  const [savedArtists, setSavedArtists] = useState([])
  const [draftArtists, setDraftArtists] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState(null)
  const [activeTab, setActiveTab] = useState("my-artists")
  const [selectedDraft, setSelectedDraft] = useState(null)
  const [editDraftDialogOpen, setEditDraftDialogOpen] = useState(false)
  const [isProcessingDraft, setIsProcessingDraft] = useState(false)

  // Refs for the tab items
  const myArtistsTabRef = useRef(null)
  const savedTabRef = useRef(null)
  const draftedTabRef = useRef(null)

  // State for the sliding highlight position
  const [highlightStyle, setHighlightStyle] = useState({
    left: 0,
    width: 0,
  })

  // Update highlight position when active tab changes
  useEffect(() => {
    const updateHighlight = () => {
      if (activeTab === "my-artists" && myArtistsTabRef.current) {
        const rect = myArtistsTabRef.current.getBoundingClientRect()
        setHighlightStyle({
          left: rect.left - (myArtistsTabRef.current.parentElement?.getBoundingClientRect().left || 0),
          width: rect.width,
        })
      } else if (activeTab === "saved" && savedTabRef.current) {
        const rect = savedTabRef.current.getBoundingClientRect()
        setHighlightStyle({
          left: rect.left - (savedTabRef.current.parentElement?.getBoundingClientRect().left || 0),
          width: rect.width,
        })
      } else if (activeTab === "drafts" && draftedTabRef.current) {
        const rect = draftedTabRef.current.getBoundingClientRect()
        setHighlightStyle({
          left: rect.left - (draftedTabRef.current.parentElement?.getBoundingClientRect().left || 0),
          width: rect.width,
        })
      }
    }

    // Small delay to ensure refs are populated
    const timer = setTimeout(updateHighlight, 50)
    return () => clearTimeout(timer)
  }, [activeTab])

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push("/login")
    }
  }, [isAuthenticated, loading, router])

  // Load user's artists, saved artists, and drafts
  useEffect(() => {
    const loadUserData = async () => {
      if (!user) return

      try {
        setIsLoading(true)
        setLoadError(null)

        // Get user's artists
        const userArtistsData = await getArtistsByUser(user.uid)
        setUserArtists(userArtistsData)

        // Get saved artists
        const savedArtistsData = await getSavedArtistsByUser(user.uid)
        setSavedArtists(savedArtistsData)

        // Get drafts
        const draftsData = await getDraftsByUser(user.uid)
        setDraftArtists(draftsData)

        setIsLoading(false)
      } catch (error) {
        console.error("Error loading user data:", error)
        setLoadError(error.message || "Failed to load your artists")
        toast({
          title: "Error",
          description: "Failed to load your data. Please try again.",
          variant: "destructive",
        })
        setIsLoading(false)
      }
    }

    if (user) {
      loadUserData()
    }
  }, [user, toast])

  // Handle artist update
  const handleArtistUpdate = async (updatedArtist) => {
    try {
      await updateArtist(updatedArtist.id, updatedArtist)

      // Update local state
      setUserArtists(userArtists.map((a) => (a.id === updatedArtist.id ? updatedArtist : a)))
      setSavedArtists(savedArtists.map((a) => (a.id === updatedArtist.id ? updatedArtist : a)))

      toast({
        title: "Success",
        description: "Artist updated successfully",
      })
    } catch (error) {
      console.error("Error updating artist:", error)
      toast({
        title: "Error",
        description: "Failed to update artist. Please try again.",
        variant: "destructive",
      })
    }
  }

  // Handle artist delete
  const handleArtistDelete = async (artistId) => {
    try {
      await deleteArtist(artistId)

      // Update local state
      setUserArtists(userArtists.filter((a) => a.id !== artistId))
      setSavedArtists(savedArtists.filter((a) => a.id !== artistId))

      toast({
        title: "Success",
        description: "Artist deleted successfully",
      })
    } catch (error) {
      console.error("Error deleting artist:", error)
      toast({
        title: "Error",
        description: "Failed to delete artist. Please try again.",
        variant: "destructive",
      })
    }
  }

  // Handle draft edit
  const handleEditDraft = (draft) => {
    setSelectedDraft(draft)
    setEditDraftDialogOpen(true)
  }

  // Handle draft delete
  const handleDeleteDraft = async (draftId) => {
    try {
      setIsProcessingDraft(true)
      await deleteDraft(draftId)

      // Update local state
      setDraftArtists(draftArtists.filter((d) => d.id !== draftId))

      toast({
        title: "Success",
        description: "Draft deleted successfully",
      })
      setIsProcessingDraft(false)
    } catch (error) {
      console.error("Error deleting draft:", error)
      toast({
        title: "Error",
        description: "Failed to delete draft. Please try again.",
        variant: "destructive",
      })
      setIsProcessingDraft(false)
    }
  }

  // Handle submitting the edited draft as a new artist
  const handleDraftSubmit = async (artistData) => {
    try {
      setIsProcessingDraft(true)

      // Add the artist (this will be called from the AddArtistForm)
      // After successful submission, delete the draft
      if (selectedDraft && selectedDraft.id) {
        await deleteDraft(selectedDraft.id)

        // Update local state
        setDraftArtists(draftArtists.filter((d) => d.id !== selectedDraft.id))
      }

      setEditDraftDialogOpen(false)
      setSelectedDraft(null)
      setIsProcessingDraft(false)

      // Switch to "My Artists" tab after successful submission
      setActiveTab("my-artists")

      return true
    } catch (error) {
      console.error("Error processing draft:", error)
      toast({
        title: "Error",
        description: "Failed to process draft. Please try again.",
        variant: "destructive",
      })
      setIsProcessingDraft(false)
      return false
    }
  }

  // If still loading auth state or data, show loading
  if (loading || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-4">Loading...</h2>
        </div>
      </div>
    )
  }

  // If there was an error loading data
  if (loadError) {
    return (
      <div className="container py-8">
        <div className="max-w-6xl mx-auto">
          <Card>
            <CardContent className="p-6 text-center">
              <h3 className="text-lg font-medium text-destructive">Error Loading Data</h3>
              <p className="text-sm text-muted-foreground mt-1">{loadError}</p>
              <p className="text-sm mt-4">
                This error may be due to missing Firestore indexes. Please create the required index by clicking the
                link in the console error message.
              </p>
              <Button variant="outline" className="mt-4" onClick={() => window.location.reload()}>
                Try Again
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row gap-8">
          <div className="md:w-1/3">
            <Card>
              <CardHeader>
                <CardTitle>Profile</CardTitle>
                <CardDescription>Manage your account</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium">Name</h3>
                    <p className="text-muted-foreground">{user?.displayName || "Anonymous User"}</p>
                  </div>
                  <div>
                    <h3 className="font-medium">Email</h3>
                    <p className="text-muted-foreground">{user?.email || "No email provided"}</p>
                  </div>
                  <div className="pt-4">
                    <Button variant="outline" className="w-full" asChild>
                      <a href="/profile/settings">Edit Profile</a>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="md:w-2/3">
            <Tabs defaultValue="my-artists" value={activeTab} onValueChange={setActiveTab}>
              <div className="relative">
                <TabsList className="relative">
                  <TabsTrigger ref={myArtistsTabRef} value="my-artists">
                    My Artists
                  </TabsTrigger>
                  <TabsTrigger ref={savedTabRef} value="saved">
                    Saved
                  </TabsTrigger>
                  <TabsTrigger ref={draftedTabRef} value="drafts">
                    Drafted
                  </TabsTrigger>

                  {/* Sliding highlight element */}
                  <div
                    className="absolute top-0 bottom-0 rounded-md bg-background transition-all duration-300 ease-in-out"
                    style={{
                      left: highlightStyle.left,
                      width: highlightStyle.width,
                    }}
                  />
                </TabsList>
              </div>

              <TabsContent value="my-artists" className="pt-4">
                <h2 className="text-2xl font-bold mb-4">Artists You've Added</h2>

                {userArtists.length === 0 ? (
                  <Card>
                    <CardContent className="p-6 text-center">
                      <Music2 className="mx-auto h-12 w-12 text-muted-foreground mb-3" />
                      <h3 className="text-lg font-medium">No artists yet</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        You haven't added any artists to the library yet.
                      </p>
                      <Button variant="outline" className="mt-4" onClick={() => router.push("/library")}>
                        Add an Artist
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {userArtists.map((artist) => (
                      <ArtistCard
                        key={artist.id}
                        artist={artist}
                        currentUser={user}
                        onGenreClick={() => {}}
                        onUpdate={handleArtistUpdate}
                        onDelete={handleArtistDelete}
                      />
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="saved" className="pt-4">
                <h2 className="text-2xl font-bold mb-4">Saved Artists</h2>

                {savedArtists.length === 0 ? (
                  <Card>
                    <CardContent className="p-6 text-center">
                      <Music2 className="mx-auto h-12 w-12 text-muted-foreground mb-3" />
                      <h3 className="text-lg font-medium">No saved artists</h3>
                      <p className="text-sm text-muted-foreground mt-1">You haven't saved any artists yet.</p>
                      <Button variant="outline" className="mt-4" onClick={() => router.push("/library")}>
                        Browse Library
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {savedArtists.map((artist) => (
                      <ArtistCard
                        key={artist.id}
                        artist={artist}
                        currentUser={user}
                        onGenreClick={() => {}}
                        onUpdate={handleArtistUpdate}
                        onDelete={handleArtistDelete}
                      />
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="drafts" className="pt-4">
                <h2 className="text-2xl font-bold mb-4">Drafted Artists</h2>

                {draftArtists.length === 0 ? (
                  <Card>
                    <CardContent className="p-6 text-center">
                      <Music2 className="mx-auto h-12 w-12 text-muted-foreground mb-3" />
                      <h3 className="text-lg font-medium">No draft artists</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        When you save artist drafts, they'll appear here.
                      </p>
                      <Button variant="outline" className="mt-4" onClick={() => router.push("/library")}>
                        Add an Artist
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {draftArtists.map((draft) => (
                      <DraftArtistCard
                        key={draft.id}
                        draft={draft}
                        onEdit={handleEditDraft}
                        onDelete={handleDeleteDraft}
                      />
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>

      {/* Draft edit dialog */}
      <Dialog
        open={editDraftDialogOpen}
        onOpenChange={(open) => {
          if (!open && !isProcessingDraft) {
            setEditDraftDialogOpen(false)
            setSelectedDraft(null)
          }
        }}
      >
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Continue Editing Draft</DialogTitle>
          </DialogHeader>
          {selectedDraft && (
            <>
              <Alert className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  You're editing a saved draft. When you submit, the artist will be added to the library and the draft
                  will be removed.
                </AlertDescription>
              </Alert>
              <AddArtistForm
                onAddArtist={handleDraftSubmit}
                usedGenres={[]}
                currentUser={user}
                isAddingArtist={isProcessingDraft}
                initialData={selectedDraft}
              />
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
