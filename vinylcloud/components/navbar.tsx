"use client"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import { useAuth } from "@/components/auth-provider"
import { useRouter } from "next/navigation"
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
          <Link href="/library" className="font-bold text-xl">
            Hidden Spins
          </Link>

          <nav className="hidden md:flex items-center gap-4">
            <Link
              href="/library"
              className={`text-sm font-medium hover:text-primary relative ${
                router.pathname === "/library"
                  ? 'after:content-[""] after:absolute after:left-0 after:bottom-[-5px] after:h-[2px] after:w-full after:bg-primary after:transition-all after:duration-300'
                  : ""
              }`}
            >
              Library
            </Link>
            {isAuthenticated && (
              <Link
                href="/profile"
                className={`text-sm font-medium hover:text-primary relative ${
                  router.pathname === "/profile"
                    ? 'after:content-[""] after:absolute after:left-0 after:bottom-[-5px] after:h-[2px] after:w-full after:bg-primary after:transition-all after:duration-300'
                    : ""
                }`}
              >
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
