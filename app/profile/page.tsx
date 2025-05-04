"use client"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from "@/components/auth-provider"
import { Music2, Loader2 } from "lucide-react"
import ArtistCard from "@/components/artist-card"
import { getArtistsByUser, getSavedArtistsByUser, updateArtist, deleteArtist } from "@/lib/artist-service"
import { useToast } from "@/components/ui/use-toast"

export default function ProfilePage() {
  const { user, isAuthenticated, loading } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  const [userArtists, setUserArtists] = useState([])
  const [savedArtists, setSavedArtists] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState(null)

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push("/login")
    }
  }, [isAuthenticated, loading, router])

  // Load user's artists and saved artists
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

        setIsLoading(false)
      } catch (error) {
        console.error("Error loading user data:", error)
        setLoadError(error.message || "Failed to load your artists")
        toast({
          title: "Error",
          description: "Failed to load your artists. Please try again.",
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
            <Tabs defaultValue="my-artists">
              <TabsList>
                <TabsTrigger value="my-artists">My Artists</TabsTrigger>
                <TabsTrigger value="saved">Saved</TabsTrigger>
              </TabsList>

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
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  )
}
