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
    console.log("[v0] ===== OPEN ZENDESK CALLED =====")
    console.log("[v0] window.zE type:", typeof window.zE)
    console.log("[v0] window.zE value:", window.zE)

    if (window.zE) {
      try {
        console.log("[v0] Calling zE('messenger', 'show')")
        window.zE("messenger", "show")

        console.log("[v0] Calling zE('messenger', 'open')")
        window.zE("messenger", "open")

        console.log("[v0] Zendesk messenger commands executed successfully")
      } catch (error) {
        console.error("[v0] Error executing Zendesk commands:", error)
      }
    } else {
      console.error("[v0] window.zE is not available!")
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
