"use client"

import { useState, useEffect } from "react"
import { StreamChat, type Channel as StreamChannel } from "stream-chat"
import { Card, CardContent } from "@/components/ui/card"
import { AlertCircle } from "lucide-react"
import { BuyerSellerChat } from "@/components/buyer-seller-chat"
import { SupportChat } from "@/components/support-chat"

interface StreamChatWrapperProps {
  userId: string
  userName: string
  listingId: string
  buyerId: string
  sellerId: string
  onEscalate?: () => Promise<void>
}

export function StreamChatWrapper({
  userId,
  userName,
  listingId,
  buyerId,
  sellerId,
  onEscalate,
}: StreamChatWrapperProps) {
  const [client, setClient] = useState<StreamChat | null>(null)
  const [channel, setChannel] = useState<StreamChannel | null>(null)
  const [ticketId, setTicketId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    let chatClient: StreamChat | null = null

    async function initChat() {
      try {
        const tokenResponse = await fetch("/api/token", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId, name: userName }),
        })

        if (!tokenResponse.ok) {
          throw new Error("Failed to get token")
        }

        const { token, apiKey } = await tokenResponse.json()

        chatClient = new StreamChat(apiKey)
        await chatClient.connectUser({ id: userId, name: userName }, token)

        if (!mounted) {
          await chatClient.disconnectUser()
          return
        }

        const channelResponse = await fetch("/api/channels/marketplace", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ listingId, buyerId, sellerId }),
        })

        if (!channelResponse.ok) {
          throw new Error("Failed to create channel")
        }

        const { channelId, channelData } = await channelResponse.json()

        const chatChannel = chatClient.channel("messaging", channelId)
        await chatChannel.watch()

        if (!mounted) return

        setClient(chatClient)
        setChannel(chatChannel)

        setTicketId(channelData?.ticketId || null)

        chatChannel.on("channel.updated", (event) => {
          if (event.channel?.ticketId) {
            setTicketId(event.channel.ticketId as string)
          }
        })

        setIsLoading(false)
      } catch (err) {
        console.error("Error initializing chat:", err)
        if (mounted) {
          setError("Failed to connect to chat. Please try again.")
          setIsLoading(false)
        }
      }
    }

    initChat()

    return () => {
      mounted = false
      if (chatClient) {
        chatClient.disconnectUser().catch((err) => console.error("Error disconnecting:", err))
      }
    }
  }, [userId, userName, listingId, buyerId, sellerId])

  const handleEscalate = async () => {
    if (onEscalate) {
      await onEscalate()
      // Stream SDK will automatically pick up the channel.updated event
      // and re-render into SupportChat when ticketId is set
    }
  }

  if (isLoading) {
    return (
      <Card className="w-full shadow-md border">
        <CardContent className="p-8 text-center">
          <p className="text-muted-foreground font-bold text-lg">Connecting to chat...</p>
        </CardContent>
      </Card>
    )
  }

  if (error || !channel) {
    return (
      <Card className="w-full shadow-md border">
        <CardContent className="p-8 text-center">
          <AlertCircle className="w-16 h-16 text-destructive mx-auto mb-4" />
          <p className="text-destructive font-bold">{error || "Failed to load chat"}</p>
        </CardContent>
      </Card>
    )
  }

  if (ticketId) {
    return <SupportChat channel={channel} userId={userId} ticketId={ticketId} />
  }

  return <BuyerSellerChat channel={channel} userId={userId} onEscalate={handleEscalate} />
}
