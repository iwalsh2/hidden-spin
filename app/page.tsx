import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import Link from "next/link"
import { Music } from "lucide-react"

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                    Discover Hidden Gems in Music
                  </h1>
                  <p className="max-w-[600px] text-gray-500 md:text-xl dark:text-gray-400">
                    Share and discover underrated artists and tracks. Create your personal library of musical treasures.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Link href="/login">
                    <Button className="bg-custom-blue hover:bg-custom-blue/90">Get Started</Button>
                  </Link>
                  <Link href="/library">
                    <Button variant="outline">Browse Library</Button>
                  </Link>
                </div>
              </div>
              <div className="flex items-center justify-center">
                {/* Replace Image with a more reliable fallback approach */}
                <div className="relative w-[550px] h-[550px] rounded-xl overflow-hidden bg-gray-200">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Music className="h-20 w-20 text-gray-400" />
                  </div>
                  <img
                    src="/placeholder.svg?height=550&width=550"
                    alt="Vinyl Records Collection"
                    className="rounded-xl object-cover w-full h-full"
                    onError={(e) => {
                      // If image fails to load, show fallback
                      e.currentTarget.style.display = "none"
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </section>
        <section className="w-full py-12 md:py-24 lg:py-32 bg-gray-100 dark:bg-gray-800">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">How It Works</h2>
                <p className="max-w-[900px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
                  Our platform makes it easy to discover and share music you love.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl items-center gap-6 py-12 lg:grid-cols-3 lg:gap-12">
              <Card>
                <CardContent className="flex flex-col items-center space-y-4 p-6">
                  <div className="flex h-20 w-20 items-center justify-center rounded-full bg-custom-blue/10">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-10 w-10 text-custom-blue"
                    >
                      <circle cx="12" cy="12" r="10" />
                      <path d="m16 12-4-4-4 4" />
                      <path d="M12 16V8" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold">Discover</h3>
                  <p className="text-gray-500 dark:text-gray-400">
                    Browse our community library of hidden gems and underrated artists.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="flex flex-col items-center space-y-4 p-6">
                  <div className="flex h-20 w-20 items-center justify-center rounded-full bg-custom-blue/10">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-10 w-10 text-custom-blue"
                    >
                      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold">Save</h3>
                  <p className="text-gray-500 dark:text-gray-400">
                    Create your personal collection of favorite artists and tracks.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="flex flex-col items-center space-y-4 p-6">
                  <div className="flex h-20 w-20 items-center justify-center rounded-full bg-custom-blue/10">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-10 w-10 text-custom-blue"
                    >
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="17 8 12 3 7 8" />
                      <line x1="12" x2="12" y1="3" y2="15" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold">Share</h3>
                  <p className="text-gray-500 dark:text-gray-400">
                    Contribute your own discoveries to help others find great music.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>
      <footer className="w-full py-6 bg-gray-100 dark:bg-gray-800">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <p className="text-gray-500 dark:text-gray-400">
                &copy; {new Date().getFullYear()} Hidden Spins. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
