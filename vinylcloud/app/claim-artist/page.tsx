"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useAuth } from "@/components/auth-provider"
import { useToast } from "@/components/ui/use-toast"

export default function ClaimArtistPage() {
  const { user, isAuthenticated } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  const [artistName, setArtistName] = useState("")
  const [platformLink, setPlatformLink] = useState("")
  const [proofDescription, setProofDescription] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simulate submission
    setTimeout(() => {
      toast({
        title: "Claim submitted",
        description: "We'll review your claim and get back to you soon.",
      })
      setIsSubmitting(false)
      router.push("/library")
    }, 1500)
  }

  if (!isAuthenticated) {
    return (
      <div className="container py-8">
        <Card>
          <CardHeader>
            <CardTitle>Authentication Required</CardTitle>
            <CardDescription>You need to be logged in to claim an artist profile.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push("/login")}>Log in</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container py-8">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Claim Artist Profile</CardTitle>
            <CardDescription>
              If you're the artist, you can claim ownership of your profile on Hidden Spins. We'll verify your identity
              and grant you control over your artist page.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="artistName">Artist/Band Name</Label>
                <Input
                  id="artistName"
                  value={artistName}
                  onChange={(e) => setArtistName(e.target.value)}
                  placeholder="Enter your artist or band name"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="platformLink">Link to Artist Platform</Label>
                <Input
                  id="platformLink"
                  value={platformLink}
                  onChange={(e) => setPlatformLink(e.target.value)}
                  placeholder="Spotify for Artists, Apple Music for Artists, etc."
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="proof">Verification Details</Label>
                <Textarea
                  id="proof"
                  value={proofDescription}
                  onChange={(e) => setProofDescription(e.target.value)}
                  placeholder="Describe how we can verify you're the artist (access to official social media, streaming platform dashboards, etc.)"
                  rows={5}
                  required
                />
              </div>

              <Button type="submit" disabled={isSubmitting} className="w-full">
                {isSubmitting ? "Submitting..." : "Submit Claim"}
              </Button>

              <p className="text-sm text-muted-foreground text-center mt-4">
                We'll review your claim and contact you via email with next steps.
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
