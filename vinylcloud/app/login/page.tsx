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

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("login")
  const [error, setError] = useState("")

  const { user, isAuthenticated, signInWithEmail, signInWithGoogle, signInWithApple, signUp } = useAuth()
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

    // Validate inputs
    if (!email.trim() || !password.trim()) {
      setError("Email and password are required")
      setIsLoading(false)
      return
    }

    try {
      await signInWithEmail(email, password)
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

  const handleGoogleLogin = async () => {
    setError("")
    setIsLoading(true)
    try {
      await signInWithGoogle()
      router.push("/library")
    } catch (error) {
      setError(error.message || "Google sign in failed")
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
                    <button
                      type="button"
                      onClick={handleGoogleLogin}
                      disabled={isLoading}
                      className="flex items-center justify-center gap-3 w-full bg-gray-100 hover:bg-gray-200 text-black font-medium py-2 px-4 rounded-full transition-colors"
                    >
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
                      <span>Sign in with Google</span>
                    </button>

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
                    <button
                      type="button"
                      onClick={handleGoogleLogin}
                      disabled={isLoading}
                      className="flex items-center justify-center gap-3 w-full bg-gray-100 hover:bg-gray-200 text-black font-medium py-2 px-4 rounded-full transition-colors"
                    >
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
                      <span>Sign in with Google</span>
                    </button>

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
