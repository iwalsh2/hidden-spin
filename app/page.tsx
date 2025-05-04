"use client"
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ThemeProvider } from "@/components/theme-provider"

export default function Home() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to the public library page
    router.push("/library")
  }, [router])

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Hidden Spins</h1>
          <p className="mb-8">Redirecting to library...</p>
          <Button onClick={() => router.push("/library")}>Go to Library</Button>
        </div>
      </div>
    </ThemeProvider>
  )
}
