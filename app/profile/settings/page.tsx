"use client"
import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from "@/components/auth-provider"
import { useToast } from "@/components/ui/use-toast"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Loader2, Upload } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"

// Add imports for image cropping
import ReactCrop, { centerCrop, makeAspectCrop } from "react-image-crop"
import "react-image-crop/dist/ReactCrop.css"

export default function ProfileSettingsPage() {
  const { user, isAuthenticated, loading, updateUserProfile } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  const [displayName, setDisplayName] = useState("")
  const [email, setEmail] = useState("")
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [profileImage, setProfileImage] = useState("")
  const [isUpdating, setIsUpdating] = useState(false)
  const [activeTab, setActiveTab] = useState("profile")

  // Add cropping state
  const [crop, setCrop] = useState({ unit: "%", width: 100, aspect: 1 })
  const [completedCrop, setCompletedCrop] = useState(null)
  const [showCropper, setShowCropper] = useState(false)
  const imgRef = useRef(null)
  const previewCanvasRef = useRef(null)

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push("/login")
    }
  }, [isAuthenticated, loading, router])

  // Initialize form with user data
  useEffect(() => {
    if (user) {
      setDisplayName(user.displayName || "")
      setEmail(user.email || "")
      setProfileImage(user.photoURL || "")
    }
  }, [user])

  // If still loading auth state, show loading
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <h2 className="text-2xl font-bold">Loading...</h2>
        </div>
      </div>
    )
  }

  // Function to handle cropping
  const onImageLoad = (e) => {
    const { width, height } = e.currentTarget
    const crop = centerCrop(
      makeAspectCrop(
        {
          unit: "%",
          width: 90,
        },
        1,
        width,
        height,
      ),
      width,
      height,
    )
    setCrop(crop)
  }

  // Function to complete the crop
  const completeCrop = () => {
    if (!completedCrop || !previewCanvasRef.current || !imgRef.current) {
      return
    }

    const image = imgRef.current
    const canvas = previewCanvasRef.current
    const crop = completedCrop

    const scaleX = image.naturalWidth / image.width
    const scaleY = image.naturalHeight / image.height
    const ctx = canvas.getContext("2d")

    canvas.width = crop.width
    canvas.height = crop.height

    ctx.drawImage(
      image,
      crop.x * scaleX,
      crop.y * scaleY,
      crop.width * scaleX,
      crop.height * scaleY,
      0,
      0,
      crop.width,
      crop.height,
    )

    canvas.toBlob((blob) => {
      if (!blob) return
      const reader = new FileReader()
      reader.onload = () => {
        setProfileImage(reader.result)
        setShowCropper(false)
      }
      reader.readAsDataURL(blob)
    })
  }

  // Update the handleImageChange function
  const handleImageChange = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setProfileImage(e.target.result)
        setShowCropper(true) // Show cropper when image is selected
      }
      reader.readAsDataURL(file)
    }
  }

  // Update the handleProfileUpdate function
  const handleProfileUpdate = async (e) => {
    e.preventDefault()
    setIsUpdating(true)

    try {
      // Call updateUserProfile from auth provider
      await updateUserProfile({
        displayName,
        photoURL: profileImage,
      })

      toast({
        title: "Profile updated",
        description: "Your profile information has been updated successfully.",
      })
      setIsUpdating(false)
    } catch (error) {
      toast({
        title: "Update failed",
        description: error.message || "Failed to update profile. Please try again.",
        variant: "destructive",
      })
      setIsUpdating(false)
    }
  }

  const handlePasswordUpdate = async (e) => {
    e.preventDefault()
    setIsUpdating(true)

    // Validate passwords
    if (newPassword !== confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "New password and confirmation password must match.",
        variant: "destructive",
      })
      setIsUpdating(false)
      return
    }

    try {
      // In a real app, this would call an API to update the password
      // For now, we'll simulate a successful update
      setTimeout(() => {
        toast({
          title: "Password updated",
          description: "Your password has been updated successfully.",
        })
        setCurrentPassword("")
        setNewPassword("")
        setConfirmPassword("")
        setIsUpdating(false)
      }, 1000)
    } catch (error) {
      toast({
        title: "Update failed",
        description: error.message || "Failed to update password. Please try again.",
        variant: "destructive",
      })
      setIsUpdating(false)
    }
  }

  return (
    <div className="container py-8">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Account Settings</h1>
          <Button variant="outline" onClick={() => router.push("/profile")}>
            Back to Profile
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="profile">Profile Information</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>Update your account profile information</CardDescription>
              </CardHeader>
              <form onSubmit={handleProfileUpdate}>
                <CardContent className="space-y-6">
                  <div className="flex flex-col items-center sm:flex-row sm:items-start gap-6">
                    <div className="flex flex-col items-center gap-2">
                      <Avatar className="h-24 w-24">
                        <AvatarImage src={profileImage || "/placeholder.svg"} alt={displayName} />
                        <AvatarFallback className="text-2xl">
                          {displayName
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .toUpperCase()
                            .substring(0, 2) || "HS"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex items-center gap-2">
                        <Input
                          type="file"
                          accept="image/*"
                          id="profile-image"
                          className="hidden"
                          onChange={handleImageChange}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => document.getElementById("profile-image").click()}
                        >
                          <Upload className="h-4 w-4 mr-2" />
                          Change
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-4 flex-1">
                      <div className="space-y-2">
                        <Label htmlFor="displayName">Display Name</Label>
                        <Input
                          id="displayName"
                          value={displayName}
                          onChange={(e) => setDisplayName(e.target.value)}
                          placeholder="Your name"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="email">Email Address</Label>
                        <Input
                          id="email"
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="your.email@example.com"
                          disabled
                        />
                        <p className="text-xs text-muted-foreground">
                          Email address cannot be changed. Contact support for assistance.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end">
                  <Button type="submit" disabled={isUpdating}>
                    {isUpdating ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      "Save Changes"
                    )}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>

          <TabsContent value="security">
            <Card>
              <CardHeader>
                <CardTitle>Change Password</CardTitle>
                <CardDescription>Update your account password</CardDescription>
              </CardHeader>
              <form onSubmit={handlePasswordUpdate}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">Current Password</Label>
                    <Input
                      id="currentPassword"
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      required
                    />
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <Label htmlFor="newPassword">New Password</Label>
                    <Input
                      id="newPassword"
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm New Password</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                    />
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button type="button" variant="ghost" onClick={() => router.push("/forgot-password")}>
                    Forgot password?
                  </Button>
                  <Button type="submit" disabled={isUpdating}>
                    {isUpdating ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Updating...
                      </>
                    ) : (
                      "Update Password"
                    )}
                  </Button>
                </CardFooter>
              </form>
            </Card>

            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Connected Accounts</CardTitle>
                <CardDescription>Manage your connected social accounts</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <svg viewBox="0 0 24 24" width="24" height="24" className="text-black">
                        <path
                          fill="currentColor"
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                          fill="#4285F4"
                        />
                        <path
                          fill="currentColor"
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                          fill="#34A853"
                        />
                        <path
                          fill="currentColor"
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                          fill="#FBBC05"
                        />
                        <path
                          fill="currentColor"
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                          fill="#EA4335"
                        />
                        <path fill="none" d="M1 1h22v22H1z" />
                      </svg>
                      <div>
                        <p className="font-medium">Google</p>
                        <p className="text-sm text-muted-foreground">Not connected</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      Connect
                    </Button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <svg viewBox="0 0 24 24" width="24" height="24" className="text-black">
                        <path
                          d="M17.05 20.28c-.98 1.09-2.12.51-3.18.51-1.05 0-2.23.6-3.18-.51-1.44-1.68-8.1-11.38 1.99-16.89.96 0 2.07-.26 3.25 1.06.95 1.06 1.65 2.5.84 6.47 1.68.34 3.23 3.77.28 9.36z"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        />
                        <path
                          d="M13.39 5.42c.58-.59 1.44-1.05 2.2-1.08.13.89-.22 1.8-.81 2.46-.58.59-1.38 1.05-2.22.92-.12-.87.23-1.78.83-2.3z"
                          fill="currentColor"
                        />
                      </svg>
                      <div>
                        <p className="font-medium">Apple</p>
                        <p className="text-sm text-muted-foreground">Not connected</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      Connect
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      {/* Add the image cropper dialog */}
      <Dialog open={showCropper} onOpenChange={setShowCropper}>
        <DialogContent className="sm:max-w-md">
          <DialogTitle>Crop Profile Picture</DialogTitle>
          <div className="mt-4">
            {profileImage && showCropper && (
              <ReactCrop
                crop={crop}
                onChange={(newCrop) => setCrop(newCrop)}
                onComplete={(c) => setCompletedCrop(c)}
                aspect={1}
                circularCrop
              >
                <img
                  ref={imgRef}
                  src={profileImage || "/placeholder.svg"}
                  alt="Upload preview"
                  onLoad={onImageLoad}
                  className="max-h-[400px] object-contain"
                />
              </ReactCrop>
            )}
            <canvas ref={previewCanvasRef} style={{ display: "none" }} />
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <Button
              variant="outline"
              onClick={() => {
                setShowCropper(false)
              }}
            >
              Cancel
            </Button>
            <Button onClick={completeCrop}>Apply</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
