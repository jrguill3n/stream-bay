"use client"

import { useEffect, useState } from "react"

declare global {
  interface Window {
    zE?: (command: string, action: string, ...args: any[]) => void
  }
}

export function useZendesk() {
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    let attempts = 0
    const maxAttempts = 50

    const checkZendesk = setInterval(() => {
      attempts++
      if (window.zE) {
        console.log("[v0] Zendesk is ready")
        setIsReady(true)
        clearInterval(checkZendesk)
      } else if (attempts >= maxAttempts) {
        console.warn("[v0] Zendesk widget failed to load after 5 seconds")
        clearInterval(checkZendesk)
      }
    }, 100)

    return () => clearInterval(checkZendesk)
  }, [])

  const openZendesk = () => {
    console.log("[v0] Attempting to open Zendesk, window.zE exists:", !!window.zE)

    if (window.zE) {
      try {
        window.zE("messenger", "show")
        window.zE("messenger", "open")
        console.log("[v0] Zendesk messenger opened")
      } catch (error) {
        console.error("[v0] Error opening Zendesk:", error)
      }
    } else {
      console.warn("[v0] Zendesk widget not available")
    }
  }

  const closeZendesk = () => {
    if (window.zE) {
      window.zE("messenger", "close")
      window.zE("messenger", "hide")
    }
  }

  return { isReady, openZendesk, closeZendesk }
}
