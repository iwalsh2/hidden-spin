/**
 * Utility functions for platform detection and categorization
 */

// Define platform types
export type PlatformType = "streaming" | "social"

// Define platform information
export interface PlatformInfo {
  name: string
  type: PlatformType
  icon?: string
}

// List of streaming platforms
export const STREAMING_PLATFORMS = [
  "Spotify",
  "Apple Music",
  "Bandcamp",
  "SoundCloud",
  "Amazon Music",
  "Pandora",
  "Deezer",
  "Tidal",
  "Google Play Music",
  "iHeartRadio",
  "Audiomack",
  "Mixcloud",
  "Napster",
  "Qobuz",
  "Other",
]

// List of social media platforms
export const SOCIAL_PLATFORMS = [
  "YouTube",
  "Instagram",
  "Facebook",
  "X",
  "TikTok",
  "Website",
  "Discord",
  "Twitch",
  "LinkedIn",
  "Pinterest",
  "Reddit",
  "Snapchat",
  "Telegram",
  "Other",
]

/**
 * Detects the platform from a URL
 * @param url The URL to detect the platform from
 * @returns The detected platform info
 */
export function detectPlatformFromUrl(url: string): PlatformInfo {
  try {
    if (!url || typeof url !== "string") {
      return { name: "Other", type: "streaming" }
    }

    const urlLower = url.toLowerCase()

    // Streaming platforms
    if (urlLower.includes("spotify.com")) {
      return { name: "Spotify", type: "streaming" }
    } else if (urlLower.includes("music.apple.com") || urlLower.includes("itunes.apple.com")) {
      return { name: "Apple Music", type: "streaming" }
    } else if (urlLower.includes("bandcamp.com")) {
      return { name: "Bandcamp", type: "streaming" }
    } else if (urlLower.includes("soundcloud.com")) {
      return { name: "SoundCloud", type: "streaming" }
    } else if (urlLower.includes("music.amazon.com") || urlLower.includes("amazon.com/music")) {
      return { name: "Amazon Music", type: "streaming" }
    } else if (urlLower.includes("pandora.com")) {
      return { name: "Pandora", type: "streaming" }
    } else if (urlLower.includes("deezer.com")) {
      return { name: "Deezer", type: "streaming" }
    } else if (urlLower.includes("tidal.com")) {
      return { name: "Tidal", type: "streaming" }
    } else if (urlLower.includes("play.google.com/music") || urlLower.includes("music.google.com")) {
      return { name: "Google Play Music", type: "streaming" }
    } else if (urlLower.includes("iheart.com")) {
      return { name: "iHeartRadio", type: "streaming" }
    } else if (urlLower.includes("audiomack.com")) {
      return { name: "Audiomack", type: "streaming" }
    } else if (urlLower.includes("mixcloud.com")) {
      return { name: "Mixcloud", type: "streaming" }
    } else if (urlLower.includes("napster.com")) {
      return { name: "Napster", type: "streaming" }
    } else if (urlLower.includes("qobuz.com")) {
      return { name: "Qobuz", type: "streaming" }
    }

    // Social media platforms
    else if (urlLower.includes("youtube.com") || urlLower.includes("youtu.be")) {
      return { name: "YouTube", type: "social" }
    } else if (urlLower.includes("instagram.com")) {
      return { name: "Instagram", type: "social" }
    } else if (urlLower.includes("facebook.com") || urlLower.includes("fb.com")) {
      return { name: "Facebook", type: "social" }
    } else if (urlLower.includes("twitter.com") || urlLower.includes("x.com")) {
      return { name: "X", type: "social" }
    } else if (urlLower.includes("tiktok.com")) {
      return { name: "TikTok", type: "social" }
    } else if (urlLower.includes("discord.com") || urlLower.includes("discord.gg")) {
      return { name: "Discord", type: "social" }
    } else if (urlLower.includes("twitch.tv")) {
      return { name: "Twitch", type: "social" }
    } else if (urlLower.includes("linkedin.com")) {
      return { name: "LinkedIn", type: "social" }
    } else if (urlLower.includes("pinterest.com")) {
      return { name: "Pinterest", type: "social" }
    } else if (urlLower.includes("reddit.com")) {
      return { name: "Reddit", type: "social" }
    } else if (urlLower.includes("snapchat.com")) {
      return { name: "Snapchat", type: "social" }
    } else if (urlLower.includes("t.me") || urlLower.includes("telegram.me")) {
      return { name: "Telegram", type: "social" }
    }

    // Try to determine if it's a URL with a protocol
    try {
      if (url.indexOf("//") !== -1) {
        return { name: "Website", type: "social" }
      }
    } catch (e) {
      // If indexOf fails, it's not a string or is undefined
      console.error("Error checking URL format:", e)
    }

    // Default to Other streaming if no match
    return { name: "Other", type: "streaming" }
  } catch (error) {
    console.error("Error detecting platform from URL:", error)
    return { name: "Other", type: "streaming" }
  }
}

/**
 * Checks if a platform is a streaming platform
 * @param platformName The platform name to check
 * @returns True if the platform is a streaming platform
 */
export function isStreamingPlatform(platformName: string): boolean {
  return STREAMING_PLATFORMS.includes(platformName)
}

/**
 * Checks if a platform is a social media platform
 * @param platformName The platform name to check
 * @returns True if the platform is a social media platform
 */
export function isSocialPlatform(platformName: string): boolean {
  return SOCIAL_PLATFORMS.includes(platformName)
}
