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
    // Check if Zendesk widget is loaded
    const checkZendesk = setInterval(() => {
      if (window.zE) {
        setIsReady(true)
        clearInterval(checkZendesk)
      }
    }, 100)

    return () => clearInterval(checkZendesk)
  }, [])

  const openZendesk = () => {
    if (window.zE) {
      console.log("[v0] Opening Zendesk messenger")
      window.zE("messenger", "open")
    } else {
      console.warn("[v0] Zendesk widget not available")
    }
  }

  const closeZendesk = () => {
    if (window.zE) {
      window.zE("messenger", "close")
    }
  }

  return { isReady, openZendesk, closeZendesk }
}
