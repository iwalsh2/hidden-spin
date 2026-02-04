"use client"

import { useState, useMemo, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Music2, Plus, Search, Filter, Loader2, X } from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import ArtistCard from "@/components/artist-card"
import { useToast } from "@/components/ui/use-toast"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import AddArtistForm from "@/components/add-artist-form"
import { Dialog, DialogContent, DialogTitle, DialogHeader, DialogClose } from "@/components/ui/dialog"
import { getAllArtists, addArtist, updateArtist, deleteArtist, subscribeToArtists } from "@/lib/artist-service"

export default function Library() {
  const { user, isAuthenticated, loading } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  const [artists, setArtists] = useState([])
  const [activeTab, setActiveTab] = useState("library")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedGenre, setSelectedGenre] = useState("")
  const [usedGenres, setUsedGenres] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isAddingArtist, setIsAddingArtist] = useState(false)

  // Add state for add artist dialog
  const [addArtistDialogOpen, setAddArtistDialogOpen] = useState(false)

  // Refs for the tab items
  const libraryTabRef = useRef<HTMLButtonElement>(null)
  const addArtistButtonRef = useRef<HTMLButtonElement>(null)

  // State for the underline position
  const [underlineStyle, setUnderlineStyle] = useState({
    left: 0,
    width: 0,
  })

  // Update underline position when active tab changes
  useEffect(() => {
    let animationFrameId: number | undefined

    const updateHighlight = () => {
      // Cancel any pending animation frame
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId)
      }

      // Schedule the update in the next animation frame
      animationFrameId = requestAnimationFrame(() => {
        if (activeTab === "library" && libraryTabRef.current) {
          const element = libraryTabRef.current
          const parent = element.parentElement
          if (element && parent) {
            const rect = element.getBoundingClientRect()
            const parentRect = parent.getBoundingClientRect()
            setUnderlineStyle({
              left: rect.left - parentRect.left,
              width: rect.width,
            })
          }
        } else if (addArtistDialogOpen && addArtistButtonRef.current) {
          const element = addArtistButtonRef.current
          const parent = element.parentElement
          if (element && parent) {
            const rect = element.getBoundingClientRect()
            const parentRect = parent.getBoundingClientRect()
            setUnderlineStyle({
              left: rect.left - parentRect.left,
              width: rect.width,
            })
          }
        }
      })
    }

    // Small delay to ensure refs are populated
    const timer = setTimeout(updateHighlight, 50)

    // Add resize event listener to handle window resizing
    window.addEventListener("resize", updateHighlight)

    return () => {
      clearTimeout(timer)
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId)
      }
      window.removeEventListener("resize", updateHighlight)
    }
  }, [activeTab, addArtistDialogOpen])

  // Add a function to sort genres alphabetically
  const sortedGenres = useMemo(() => {
    return [...usedGenres].sort((a, b) => a.localeCompare(b))
  }, [usedGenres])

  // Load artists from Firestore on component mount
  useEffect(() => {
    const loadArtists = async () => {
      try {
        setIsLoading(true)
        const artistsData = await getAllArtists()
        setArtists(artistsData)

        // Extract unique genres
        const genres = [...new Set(artistsData.map((artist: any) => artist.genre).filter(Boolean))]
        setUsedGenres(genres as string[])

        setIsLoading(false)
      } catch (error) {
        console.error("Error loading artists:", error)
        toast({
          title: "Error",
          description: "Failed to load artists. Please try again.",
          variant: "destructive",
        })
        setIsLoading(false)
      }
    }

    loadArtists()
  }, [toast])

  // Subscribe to real-time updates
  useEffect(() => {
    const unsubscribe = subscribeToArtists((updatedArtists: any[]) => {
      setArtists(updatedArtists)

      // Extract unique genres
      const genres = [...new Set(updatedArtists.map((artist) => artist.genre).filter(Boolean))]
      setUsedGenres(genres as string[])
    })

    return () => {
      unsubscribe()
    }
  }, [])

  // Filter artists based on search query and selected genre
  const filteredArtists = useMemo(() => {
    let result = [...artists].filter((artist) => artist !== null && artist !== undefined)

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(
        (artist: any) =>
          (artist.name ? artist.name.toLowerCase().includes(query) : false) ||
          (artist.genre ? artist.genre.toLowerCase().includes(query) : false) ||
          (artist.platform ? artist.platform.toLowerCase().includes(query) : false),
      )
    }

    // Filter by selected genre
    if (selectedGenre) {
      result = result.filter((artist: any) =>
        artist.genre ? artist.genre.toLowerCase() === selectedGenre.toLowerCase() : false,
      )
    }

    // Sort alphabetically with null/undefined checks
    return result.sort((a: any, b: any) => {
      const nameA = a.name ? a.name.toLowerCase() : ""
      const nameB = b.name ? b.name.toLowerCase() : ""
      return nameA.localeCompare(nameB)
    })
  }, [artists, searchQuery, selectedGenre])

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push("/login")
    }
  }, [isAuthenticated, loading, router])

  // If still loading auth state, show loading
  if (loading || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <h2 className="text-2xl font-bold">Loading...</h2>
        </div>
      </div>
    )
  }

  // Clear genre filter
  const clearGenreFilter = () => {
    setSelectedGenre("")
  }

  // Handle artist update
  const handleArtistUpdate = async (updatedArtist: any) => {
    try {
      // Validate the artist data before updating
      if (!updatedArtist || !updatedArtist.id) {
        console.error("Invalid artist data:", updatedArtist)
        toast({
          title: "Error",
          description: "Invalid artist data. Please try again.",
          variant: "destructive",
        })
        return
      }

      // Ensure all required fields are present
      const validatedArtist = {
        ...updatedArtist,
        name: updatedArtist.name || "Unknown Artist",
        genre: updatedArtist.genre || "Unspecified",
        streamingPlatforms: Array.isArray(updatedArtist.streamingPlatforms)
          ? updatedArtist.streamingPlatforms.map((platform: any) => ({
              name: platform.name || "Other",
              url: typeof platform.url === "string" ? platform.url : "",
            }))
          : [],
        savedBy: Array.isArray(updatedArtist.savedBy) ? updatedArtist.savedBy : [],
      }

      await updateArtist(validatedArtist.id, validatedArtist)
    } catch (error: any) {
      console.error("Error updating artist:", error)
      toast({
        title: "Error",
        description: `Failed to update artist: ${error.message || "Unknown error"}`,
        variant: "destructive",
      })
    }
  }

  // Handle artist delete
  const handleArtistDelete = async (artistId: string) => {
    try {
      await deleteArtist(artistId)
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

  // Handle adding an artist
  const handleAddArtist = async (newArtist: any) => {
    try {
      setIsAddingArtist(true)

      // Check if artist already exists
      const exists = artists.some(
        (artist: any) =>
          artist.streamingPlatforms?.some((platform: any) =>
            newArtist.streamingPlatforms?.some(
              (newPlatform: any) => platform.url?.toLowerCase() === newPlatform.url?.toLowerCase(),
            ),
          ) || artist.link?.toLowerCase() === newArtist.link?.toLowerCase(),
      )

      if (exists) {
        toast({
          title: "Artist already exists",
          description: "This artist is already in our library",
          variant: "destructive",
        })
        setIsAddingArtist(false)
        return false
      }

      // Add the artist to Firestore
      await addArtist(newArtist)

      setAddArtistDialogOpen(false)
      toast({
        title: "Success",
        description: "Artist added successfully",
      })
      setIsAddingArtist(false)
      return true
    } catch (error: any) {
      console.error("Error adding artist:", error)
      toast({
        title: "Error",
        description: `Failed to add artist: ${error.message || "Unknown error"}`,
        variant: "destructive",
      })
      setIsAddingArtist(false)
      return false
    }
  }

  return (
    <div className="p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Public Library</h1>

          {selectedGenre && (
            <Badge variant="secondary" className="flex gap-1 items-center mt-2 md:mt-0">
              {selectedGenre}
              <button onClick={clearGenreFilter} className="ml-1 hover:text-destructive">
                ×
              </button>
            </Badge>
          )}
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
            <div className="relative">
              <TabsList className="relative z-10">
                <TabsTrigger ref={libraryTabRef} value="library" className="flex-1 min-w-[120px]">
                  Public Library
                </TabsTrigger>
                <Button
                  ref={addArtistButtonRef}
                  variant="ghost"
                  onClick={() => setAddArtistDialogOpen(true)}
                  className="flex-1 min-w-[120px] hover:bg-accent"
                >
                  Add Artist
                </Button>
              </TabsList>

              {/* Animated underline - now with fixed positioning */}
              <div
                className="absolute bottom-0 h-[2px] bg-custom-blue transition-all duration-300 ease-in-out"
                style={{
                  left: `${underlineStyle.left}px`,
                  width: `${underlineStyle.width}px`,
                  transform: "translateZ(0)", // Force GPU acceleration
                }}
              />
            </div>

            <div className="flex items-center gap-2 mt-4 sm:mt-0">
              <div className="relative">
                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search artists..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 w-full md:w-[200px]"
                />
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon">
                    <Filter className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setSelectedGenre("")}>All Genres</DropdownMenuItem>
                  {sortedGenres.map((genre) => (
                    <DropdownMenuItem key={genre} onClick={() => setSelectedGenre(genre)}>
                      {genre}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          <TabsContent value="library">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredArtists.length === 0 ? (
                <Card className="col-span-full">
                  <CardContent className="p-6 text-center">
                    <Music2 className="mx-auto h-12 w-12 text-muted-foreground mb-3" />
                    <h3 className="text-lg font-medium">No artists yet</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Be the first to add an undiscovered artist to the library.
                    </p>
                    <Button variant="outline" className="mt-4 bg-transparent" onClick={() => setAddArtistDialogOpen(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Artist
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                filteredArtists.map((artist: any) => (
                  <ArtistCard
                    key={artist.id}
                    artist={artist}
                    currentUser={user}
                    onGenreClick={(genre: string) => setSelectedGenre(genre)}
                    onUpdate={handleArtistUpdate}
                    onDelete={handleArtistDelete}
                  />
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
      <Dialog
        open={addArtistDialogOpen}
        onOpenChange={(open) => {
          setAddArtistDialogOpen(open)
        }}
      >
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogClose className="absolute right-4 top-4 z-10">
            <span>
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </span>
          </DialogClose>
          <DialogHeader>
            <DialogTitle>Add a Hidden Gem</DialogTitle>
          </DialogHeader>
          <AddArtistForm
            onAddArtist={handleAddArtist}
            usedGenres={sortedGenres}
            currentUser={user}
            isAddingArtist={isAddingArtist}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}
