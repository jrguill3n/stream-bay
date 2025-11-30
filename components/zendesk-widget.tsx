"use client"

import { useEffect } from "react"

declare global {
  interface Window {
    zE?: (command: string, action: string, ...args: any[]) => void
  }
}

export function ZendeskWidget() {
  useEffect(() => {
    const script = document.createElement("script")
    script.id = "ze-snippet"
    script.src = "https://static.zdassets.com/ekr/snippet.js?key=ed982b16-0906-4048-858d-7b0679ba0c9b"
    script.async = true

    script.onload = () => {
      console.log("[v0] ===== ZENDESK SCRIPT LOADED =====")
      console.log("[v0] window.zE type:", typeof window.zE)
      console.log("[v0] window.zE available:", !!window.zE)

      setTimeout(() => {
        if (window.zE) {
          console.log("[v0] Hiding Zendesk widget by default")
          window.zE("messenger", "hide")
          console.log("[v0] Zendesk widget hidden successfully")
        } else {
          console.warn("[v0] window.zE not available after script load")
        }
      }, 1000)
    }

    script.onerror = () => {
      console.error("[v0] Failed to load Zendesk widget")
    }

    document.body.appendChild(script)

    return () => {
      const existingScript = document.getElementById("ze-snippet")
      if (existingScript) {
        document.body.removeChild(existingScript)
      }
    }
  }, [])

  return null
}
