"use client"
import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import { useAuth } from "@/components/auth-provider"
import { useRouter, usePathname } from "next/navigation"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export default function Navbar() {
  const { user, isAuthenticated, loading, signOut } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  // Refs for the nav items
  const libraryLinkRef = useRef(null)
  const collectionLinkRef = useRef(null)

  // State for the underline position
  const [underlineStyle, setUnderlineStyle] = useState({
    left: 0,
    width: 0,
    opacity: 0,
  })

  // Update underline position when path changes
  useEffect(() => {
    let animationFrameId

    const updateUnderline = () => {
      // Cancel any pending animation frame
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId)
      }

      // Schedule the update in the next animation frame
      animationFrameId = requestAnimationFrame(() => {
        if (pathname === "/library" && libraryLinkRef.current) {
          const rect = libraryLinkRef.current.getBoundingClientRect()
          setUnderlineStyle({
            left: 0,
            width: rect.width,
            opacity: 1,
          })
        } else if (pathname.startsWith("/profile") && collectionLinkRef.current) {
          const libraryRect = libraryLinkRef.current?.getBoundingClientRect() || { width: 0 }
          const rect = collectionLinkRef.current.getBoundingClientRect()
          setUnderlineStyle({
            left: libraryRect.width + 16, // 16px is the gap between items
            width: rect.width,
            opacity: 1,
          })
        } else {
          setUnderlineStyle({
            left: 0,
            width: 0,
            opacity: 0,
          })
        }
      })
    }

    // Small delay to ensure refs are populated
    const timer = setTimeout(updateUnderline, 50)

    // Add resize event listener to handle window resizing
    window.addEventListener("resize", updateUnderline)

    return () => {
      clearTimeout(timer)
      cancelAnimationFrame(animationFrameId)
      window.removeEventListener("resize", updateUnderline)
    }
  }, [pathname])

  const getUserInitials = () => {
    if (!user?.displayName) return "HS"
    return user.displayName
      .split(" ")
      .map((name) => name[0])
      .join("")
      .toUpperCase()
      .substring(0, 2)
  }

  return (
    <header className="border-b">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/library" className="flex items-center">
            <span className="text-xl font-bold">Hidden Spins</span>
          </Link>

          <nav className="hidden md:flex items-center gap-4 relative">
            {/* Animated underline */}
            <div
              className="absolute bottom-[-5px] h-[2px] bg-custom-blue transition-all duration-300 ease-in-out"
              style={{
                left: underlineStyle.left,
                width: underlineStyle.width,
                opacity: underlineStyle.opacity,
              }}
            />

            <Link ref={libraryLinkRef} href="/library" className="text-sm font-medium relative">
              Library
            </Link>

            {isAuthenticated && (
              <Link ref={collectionLinkRef} href="/profile" className="text-sm font-medium relative">
                My Collection
              </Link>
            )}
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <ThemeToggle />

          {!loading && (
            <>
              {isAuthenticated ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user?.photoURL || ""} alt={user?.displayName || "User"} />
                        <AvatarFallback>{getUserInitials()}</AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link href="/profile">Profile</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/profile/artists">My Artists</Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={signOut}>Log out</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button asChild variant="default" size="sm">
                  <Link href="/login">Log in</Link>
                </Button>
              )}
            </>
          )}
        </div>
      </div>
    </header>
  )
}
