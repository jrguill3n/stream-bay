"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChatInterface } from "@/components/chat-interface"
import { Badge } from "@/components/ui/badge"
import { MapPin, ShoppingCart } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { ZendeskChatInterface } from "@/components/zendesk-chat-interface"

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
    console.log("[v0] ===== ESCALATE BUTTON CLICKED =====")

    setIsEscalated(true)

    toast({
      title: "Connected to Support",
      description: "Loading support chat...",
    })
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
            <div className="space-y-3">
              {isEscalated && (
                <Card className="border-primary bg-primary/5">
                  <CardContent className="py-3 px-4">
                    <p className="font-semibold text-primary">Now chatting with Support via Zendesk</p>
                    <p className="text-sm text-muted-foreground">Your messages are sent directly to our support team</p>
                  </CardContent>
                </Card>
              )}

              {isEscalated ? (
                <ZendeskChatInterface ticketId="6" customerId={BUYER_ID} customerName="Buyer User" />
              ) : (
                <ChatInterface
                  userId={BUYER_ID}
                  userName="Buyer User"
                  channelId={channelId}
                  title="Chat with Seller"
                  onEscalate={handleEscalate}
                  showEscalateButton={true}
                />
              )}
            </div>
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
