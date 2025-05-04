"use client"
import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/components/auth-provider"
import { Music2, ArrowLeft } from "lucide-react"
import ArtistCard from "@/components/artist-card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { getArtistsByUser } from "@/lib/artist-service"
import { doc, getDoc, updateDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"

export default function UserProfilePage() {
  const { userId } = useParams()
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()

  const [profileUser, setProfileUser] = useState(null)
  const [userArtists, setUserArtists] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        const ref = doc(db, "users", userId)
        const snap = await getDoc(ref)
        let data = {}
        if (snap.exists()) {
          data = snap.data()
          // If Firestore doc missing displayName and we're viewing our own profile, update it
          if ((!data.displayName || data.displayName === "") && user?.uid === userId) {
            const newName = user.displayName || ""
            await updateDoc(ref, { displayName: newName, updatedAt: new Date().toISOString() })
            data.displayName = newName
          }
          setProfileUser({ uid: snap.id, ...data })
        } else if (userId === "anonymous") {
          setProfileUser({ uid: "anonymous", displayName: "Anonymous User" })
        } else {
          setProfileUser({ uid: userId, displayName: `User ${userId.substring(0, 5)}` })
        }
        const artists = await getArtistsByUser(userId)
        setUserArtists(
          artists.sort((a, b) =>
            a.name.toLowerCase().localeCompare(b.name.toLowerCase())
          )
        )
      } catch (e) {
        console.error("Error loading profile:", e)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [userId, user])

  if (authLoading || loading) {
    return (
      <div className="container py-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center py-12 animate-pulse">
            <div className="rounded-full bg-gray-200 dark:bg-gray-700 h-24 w-24 mx-auto mb-4" />
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-48 mx-auto mb-4" />
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-64 mx-auto" />
          </div>
        </div>
      </div>
    )
  }

  if (!profileUser) {
    return (
      <div className="container py-8">
        <div className="max-w-6xl mx-auto text-center py-12">
          <h2 className="text-2xl font-bold mb-4">User not found</h2>
          <Button onClick={() => router.push("/library")}>Back to Library</Button>
        </div>
      </div>
    )
  }

  const displayName = profileUser.displayName || "Anonymous User"
  const initials = displayName
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)

  return (
    <div className="container py-8">
      <div className="max-w-6xl mx-auto">
        <Button variant="ghost" onClick={() => router.back()} className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />Back
        </Button>

        <div className="flex flex-col items-center mb-8">
          <Avatar className="h-24 w-24 mb-4">
            <AvatarImage src={profileUser.photoURL || ""} alt={displayName} />
            <AvatarFallback className="text-2xl">{initials}</AvatarFallback>
          </Avatar>
          <h1 className="text-3xl font-bold">{displayName}</h1>
          <p className="text-muted-foreground mt-1">
            {userArtists.length} {userArtists.length === 1 ? "artist" : "artists"} shared
          </p>
        </div>

        <h2 className="text-2xl font-bold mb-6">
          Artists Shared by {displayName}
        </h2>

        {userArtists.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center">
              <Music2 className="mx-auto h-12 w-12 text-muted-foreground mb-3" />
              <h3 className="text-lg font-medium">No artists shared yet</h3>
              <p className="text-sm text-muted-foreground mt-1">
                This user hasn't shared any artists to the library yet.
              </p>
              <Button variant="outline" className="mt-4" onClick={() => router.push("/library")}>Browse Library</Button>
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
                onUpdate={(updated) =>
                  setUserArtists((arr) =>
                    arr.map((a) => (a.id === updated.id ? updated : a))
                  )
                }
                onDelete={(id) =>
                  setUserArtists((arr) => arr.filter((a) => a.id !== id))
                }
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
