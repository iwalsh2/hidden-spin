"use client"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/components/auth-provider"
import { Music2, ArrowLeft, Loader2 } from "lucide-react"
import ArtistCard from "@/components/artist-card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { getArtistsByUser } from "@/lib/artist-service"
import { doc, getDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"

export default function UserProfilePage({ params }) {
  const { userId } = params
  const { user, isAuthenticated, loading } = useAuth()
  const router = useRouter()
  const [profileUser, setProfileUser] = useState(null)
  const [userArtists, setUserArtists] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  // Load user data and their artists
  useEffect(() => {
    const loadUserData = async () => {
      try {
        setIsLoading(true)

        // Get user from Firestore
        const userDoc = await getDoc(doc(db, "users", userId))

        if (userDoc.exists()) {
          // User found in Firestore
          setProfileUser(userDoc.data())
        } else if (userId === "anonymous") {
          // Handle anonymous user
          setProfileUser({
            displayName: "Anonymous User",
            uid: "anonymous",
          })
        } else {
          // For demo purposes, create a mock user if not found
          setProfileUser({
            displayName: `User ${userId.substring(0, 5)}`,
            uid: userId,
          })
        }

        // Get artists from Firestore
        const artistsData = await getArtistsByUser(userId)

        // Sort alphabetically
        const sortedArtists = artistsData.sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()))

        setUserArtists(sortedArtists)
        setIsLoading(false)
      } catch (e) {
        console.error("Error loading user data:", e)
        setIsLoading(false)
      }
    }

    loadUserData()
  }, [userId])

  // If still loading, show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <h2 className="text-2xl font-bold">Loading...</h2>
        </div>
      </div>
    )
  }

  // If user not found
  if (!profileUser) {
    return (
      <div className="container py-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold mb-4">User not found</h2>
            <Button onClick={() => router.push("/library")}>Back to Library</Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-8">
      <div className="max-w-6xl mx-auto">
        <Button variant="ghost" onClick={() => router.back()} className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>

        <div className="flex flex-col items-center mb-8">
          <Avatar className="h-24 w-24 mb-4">
            <AvatarImage src={profileUser.photoURL || ""} alt={profileUser.displayName} />
            <AvatarFallback className="text-2xl">
              {profileUser.displayName
                ? profileUser.displayName
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase()
                    .substring(0, 2)
                : "HS"}
            </AvatarFallback>
          </Avatar>
          <h1 className="text-3xl font-bold">{profileUser.displayName || "Anonymous User"}</h1>
          <p className="text-muted-foreground mt-1">
            {userArtists.length} {userArtists.length === 1 ? "artist" : "artists"} shared
          </p>
        </div>

        <h2 className="text-2xl font-bold mb-6">Artists Shared by {profileUser.displayName || "Anonymous User"}</h2>

        {userArtists.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center">
              <Music2 className="mx-auto h-12 w-12 text-muted-foreground mb-3" />
              <h3 className="text-lg font-medium">No artists shared yet</h3>
              <p className="text-sm text-muted-foreground mt-1">
                This user hasn't shared any artists to the library yet.
              </p>
              <Button variant="outline" className="mt-4" onClick={() => router.push("/library")}>
                Browse Library
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {userArtists.map((artist) => (
              <ArtistCard
                key={artist.id}
                artist={artist}
                currentUser={user}
                onGenreClick={() => {}}
                onUpdate={(updatedArtist) => {
                  // Update in Firestore handled by ArtistCard component
                  // Update local state
                  setUserArtists(userArtists.map((a) => (a.id === updatedArtist.id ? updatedArtist : a)))
                }}
                onDelete={(artistId) => {
                  // Delete from Firestore handled by ArtistCard component
                  // Update local state
                  setUserArtists(userArtists.filter((a) => a.id !== artistId))
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
