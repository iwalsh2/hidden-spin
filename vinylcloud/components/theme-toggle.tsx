"use client"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Moon, Sun } from "lucide-react"

// Local storage key
const THEME_KEY = "hidden_spins_theme"

export function ThemeToggle() {
  const [theme, setTheme] = useState("light")

  // Initialize theme from localStorage or system preference
  useEffect(() => {
    // Check for saved theme preference
    const savedTheme = localStorage.getItem(THEME_KEY)

    if (savedTheme) {
      setTheme(savedTheme)
      document.documentElement.classList.toggle("dark", savedTheme === "dark")
    } else if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
      // If no saved preference, check system preference
      setTheme("dark")
      document.documentElement.classList.add("dark")
    }
  }, [])

  // Toggle between light and dark theme
  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark"
    setTheme(newTheme)
    document.documentElement.classList.toggle("dark", newTheme === "dark")
    localStorage.setItem(THEME_KEY, newTheme)
  }

  return (
    <Button variant="ghost" size="icon" onClick={toggleTheme} className="rounded-full" aria-label="Toggle theme">
      {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
    </Button>
  )
}
