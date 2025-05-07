"use client"

import { useState, useEffect, type RefObject } from "react"

interface HighlightStyle {
  left: number
  width: number
}

export function useSlidingHighlight(
  activeValue: string,
  refs: Record<string, RefObject<HTMLElement>>,
  options = { delay: 50 },
): HighlightStyle {
  const [highlightStyle, setHighlightStyle] = useState<HighlightStyle>({
    left: 0,
    width: 0,
  })

  useEffect(() => {
    let animationFrameId: number

    const updateHighlight = () => {
      // Cancel any pending animation frame
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId)
      }

      // Schedule the update in the next animation frame
      animationFrameId = requestAnimationFrame(() => {
        const activeRef = refs[activeValue]

        if (activeRef?.current) {
          const rect = activeRef.current.getBoundingClientRect()
          const parentRect = activeRef.current.parentElement?.getBoundingClientRect() || { left: 0 }

          setHighlightStyle({
            left: rect.left - parentRect.left,
            width: rect.width,
          })
        }
      })
    }

    // Small delay to ensure refs are populated
    const timer = setTimeout(updateHighlight, options.delay)

    // Add resize event listener to handle window resizing
    window.addEventListener("resize", updateHighlight)

    return () => {
      clearTimeout(timer)
      cancelAnimationFrame(animationFrameId)
      window.removeEventListener("resize", updateHighlight)
    }
  }, [activeValue, refs, options.delay])

  return highlightStyle
}
