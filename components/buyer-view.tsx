"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChatInterface } from "@/components/chat-interface"
import { Badge } from "@/components/ui/badge"
import { MapPin, ShoppingCart } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

const LISTING = {
  id: "1234",
  title: "Moog Subsequent 25 Synthesizer",
  price: "$799",
  shipping: "Free shipping",
  condition: "Excellent",
  location: "San Francisco, CA",
  description:
    "Rare vintage Moog Subsequent 25 analog synthesizer in excellent condition. Features 2 oscillators, classic Moog ladder filter, and beautiful orange wood side panels. Fully functional and recently serviced.",
}

const BUYER_ID = "buyer_1"
const SELLER_ID = "seller_1"

export default function BuyerView() {
  const [channelId, setChannelId] = useState<string | null>(null)
  const [isEscalated, setIsEscalated] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    let mounted = true

    async function initChat() {
      try {
        setIsLoading(true)

        const response = await fetch("/api/channels/marketplace", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            listingId: LISTING.id,
            buyerId: BUYER_ID,
            sellerId: SELLER_ID,
          }),
        })

        if (!response.ok) {
          throw new Error("Failed to create channel")
        }

        const { channelId: newChannelId } = await response.json()
        if (mounted) {
          setChannelId(newChannelId)
        }
      } catch (err) {
        console.error("Failed to initialize chat:", err)
        if (mounted) {
          setError("Failed to connect to chat. Please check your environment variables.")
        }
      } finally {
        if (mounted) {
          setIsLoading(false)
        }
      }
    }

    initChat()

    return () => {
      mounted = false
    }
  }, [])

  const handleStartChat = async () => {
    try {
      setIsLoading(true)

      const response = await fetch("/api/channels/marketplace", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          listingId: LISTING.id,
          buyerId: BUYER_ID,
          sellerId: SELLER_ID,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to create channel")
      }

      const { channelId: newChannelId } = await response.json()
      setChannelId(newChannelId)
    } catch (err) {
      console.error("Failed to start chat:", err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleEscalate = async () => {
    if (!channelId) return

    try {
      setIsLoading(true)

      console.log("[v0] Escalating from channel:", channelId)

      const response = await fetch("/api/channels/escalate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          originalChannelId: channelId,
          customerId: BUYER_ID,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Unknown error" }))
        throw new Error(errorData.error || "Failed to escalate")
      }

      const { supportChannelId } = await response.json()
      console.log("[v0] Escalated to support channel:", supportChannelId)
      setChannelId(supportChannelId)
      setIsEscalated(true)

      console.log("[v0] Creating Zendesk ticket...")
      const zendeskResponse = await fetch("/api/zendesk-ticket", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          channelId: supportChannelId,
          customerId: BUYER_ID,
          listingId: LISTING.id,
        }),
      })

      const zendeskData = await zendeskResponse.json()

      if (zendeskResponse.ok) {
        const { ticketId } = zendeskData
        console.log("[v0] Zendesk ticket created:", ticketId)

        toast({
          title: "Support ticket created",
          description: `Ticket #${ticketId} has been created in Zendesk.`,
        })
      } else {
        console.error("[v0] Failed to create Zendesk ticket:", zendeskData)
        toast({
          title: "Escalation successful",
          description: "Support channel created, but Zendesk ticket creation failed.",
          variant: "destructive",
        })
      }
    } catch (err) {
      console.error("[v0] Failed to escalate:", err)
      setError("Failed to escalate to support. Please try again.")
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to escalate",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (error) {
    return (
      <Card className="max-w-2xl mx-auto border-red-400 bg-red-50">
        <CardHeader>
          <CardTitle className="text-red-700">Error</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-destructive font-semibold">{error}</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="lg:w-[380px] flex-shrink-0">
          <Card className="shadow-md border">
            <CardContent className="p-0">
              <div className="h-[280px] bg-muted overflow-hidden border-b">
                <img src="/images/vintage-synth.png" alt={LISTING.title} className="w-full h-full object-contain p-3" />
              </div>
              <div className="p-4 space-y-3">
                <div>
                  <h2 className="text-xl font-bold text-foreground leading-tight mb-2">{LISTING.title}</h2>
                  <div className="bg-card p-2 mb-2 border rounded-md">
                    <span className="text-2xl font-bold text-primary">{LISTING.price}</span>
                  </div>
                  <div className="flex flex-wrap gap-2 mb-2">
                    <Badge className="bg-green-100 text-green-800 hover:bg-green-100 border border-green-300">
                      {LISTING.condition}
                    </Badge>
                    <Badge variant="secondary">{LISTING.shipping}</Badge>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground mb-3">
                    <MapPin className="h-4 w-4" />
                    <span>{LISTING.location}</span>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">{LISTING.description}</p>
                </div>

                <div className="space-y-2 pt-2 border-t">
                  {!channelId && (
                    <Button onClick={handleStartChat} disabled={isLoading} className="w-full">
                      {isLoading ? "Connecting..." : "Contact Seller"}
                    </Button>
                  )}
                  <Button variant="outline" className="w-full bg-transparent">
                    <ShoppingCart className="mr-2 h-5 w-5" />
                    Add to Cart
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex-1 min-h-[600px]">
          {channelId ? (
            <ChatInterface
              userId={BUYER_ID}
              userName="Buyer User"
              channelId={channelId}
              title={isEscalated ? "Support Chat" : "Chat with Seller"}
              onEscalate={handleEscalate}
              showEscalateButton={!isEscalated}
            />
          ) : (
            <Card className="h-full flex items-center justify-center shadow-md border">
              <CardContent className="text-center">
                <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                  <ShoppingCart className="h-10 w-10 text-muted-foreground" />
                </div>
                <p className="text-foreground text-lg font-semibold mb-2">
                  {isLoading ? "Loading chat..." : "Have a question?"}
                </p>
                <p className="text-sm text-muted-foreground">Click "Contact Seller" to start a conversation</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
