"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from "@/components/auth-provider"
import { useToast } from "@/components/ui/use-toast"
import Script from "next/script"
import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { doc, getDoc, setDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { auth } from "@/lib/firebase"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("login")
  const [error, setError] = useState("")

  const { user, isAuthenticated, signInWithEmail, signInWithApple, signUp } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.push("/library")
    }
  }, [isAuthenticated, router])

  // Initialize Apple Sign In when the component mounts
  useEffect(() => {
    // This will be called when the Apple script is loaded
    window.AppleID = {
      auth: {
        init: {
          clientId: "com.hiddenspins.client", // This would be your actual client ID
          scope: "name email",
          redirectURI: window.location.origin + "/api/auth/callback/apple",
          state: "state",
        },
      },
    }

    // Add event listener for Apple Sign In response
    document.addEventListener("AppleIDSignInOnSuccess", (event) => {
      // Handle successful sign in
      handleAppleLogin()
    })

    document.addEventListener("AppleIDSignInOnFailure", (error) => {
      // Handle sign in error
      toast({
        title: "Login failed",
        description: "Apple sign in failed. Please try again.",
        variant: "destructive",
      })
    })
  }, [])

  const handleEmailLogin = async (e) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)
  
    // ... your existing validation logic ...
  
    try {
      await signInWithEmail(email, password)
  
      // **NEW: ensure Firestore user doc exists**
      const currentUser = auth.currentUser
      if (currentUser) {
        const userRef = doc(db, "users", currentUser.uid)
        const snap = await getDoc(userRef)
        if (!snap.exists()) {
          await setDoc(userRef, {
            uid: currentUser.uid,
            email: currentUser.email,
            displayName: currentUser.displayName || "",
            photoURL: currentUser.photoURL || null,
            createdAt: new Date().toISOString(),
          })
        }
      }
  
      toast({
        title: "Login successful",
        description: "Welcome back to Hidden Spins!",
      })
      router.push("/library")
    } catch (error) {
      setError(error.message || "Invalid email or password")
    } finally {
      setIsLoading(false)
    }
  }
  

  const handleSignUp = async (e) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    // Validate inputs
    if (!email.trim() || !password.trim()) {
      setError("Email and password are required")
      setIsLoading(false)
      return
    }

    try {
      await signUp(email, password, name)
      toast({
        title: "Account created",
        description: "Welcome to Hidden Spins!",
      })
      router.push("/library")
    } catch (error) {
      setError(error.message || "Failed to create account")
    } finally {
      setIsLoading(false)
    }
  }

  const handleAppleLogin = async () => {
    setError("")
    setIsLoading(true)
    try {
      await signInWithApple()
      router.push("/library")
    } catch (error) {
      setError(error.message || "Apple sign in failed")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <Script
        src="https://appleid.cdn-apple.com/appleauth/static/jsapi/appleid/1/en_US/appleid.auth.js"
        strategy="afterInteractive"
      />

      <div className="container flex items-center justify-center min-h-[calc(100vh-80px)]">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Welcome to Hidden Spins</CardTitle>
            <CardDescription>
              Share and discover hidden musical gems | Give your favorite artists with under 10k listeners some love
            </CardDescription>
          </CardHeader>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="register">Register</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <form onSubmit={handleEmailLogin}>
                <CardContent className="space-y-4 pt-4">
                  {error && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="name@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password">Password</Label>
                      <Link href="/forgot-password" className="text-sm text-primary hover:underline">
                        Forgot password?
                      </Link>
                    </div>
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Logging in..." : "Login"}
                  </Button>

                  <div className="relative my-4">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3">
                    <div className="flex justify-center">
                      <div
                        id="appleid-signin"
                        data-mode="center-align"
                        data-type="sign-in"
                        data-color="black"
                        data-border="false"
                        data-border-radius="15"
                        data-width="200"
                        data-height="32"
                      ></div>
                    </div>
                  </div>
                </CardContent>
              </form>
            </TabsContent>

            <TabsContent value="register">
              <form onSubmit={handleSignUp}>
                <CardContent className="space-y-4 pt-4">
                  {error && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      placeholder="Your name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="name@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Creating account..." : "Create account"}
                  </Button>

                  <div className="relative my-4">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3">
                    <div className="flex justify-center">
                      <div
                        id="appleid-signin-register"
                        data-mode="center-align"
                        data-type="sign-in"
                        data-color="black"
                        data-border="false"
                        data-border-radius="15"
                        data-width="200"
                        data-height="32"
                      ></div>
                    </div>
                  </div>
                </CardContent>
              </form>
            </TabsContent>
          </Tabs>

          <CardFooter className="flex justify-center text-sm text-muted-foreground">
            By continuing, you agree to our Terms of Service and Privacy Policy.
          </CardFooter>
        </Card>
      </div>
    </>
  )
}
