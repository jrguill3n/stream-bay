"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { StreamChat, type Channel as StreamChannel, type Message } from "stream-chat"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Send, AlertCircle } from "lucide-react"
import { format } from "date-fns"

interface ChatInterfaceProps {
  userId: string
  userName: string
  channelId: string
  channelType?: string
  title: string
  onEscalate?: () => void
  showEscalateButton?: boolean
  escalateButtonText?: string
}

export function ChatInterface({
  userId,
  userName,
  channelId,
  channelType = "messaging",
  title,
  onEscalate,
  showEscalateButton = false,
  escalateButtonText = "Need Help?",
}: ChatInterfaceProps) {
  const [client, setClient] = useState<StreamChat | null>(null)
  const [channel, setChannel] = useState<StreamChannel | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let mounted = true
    let chatClient: StreamChat | null = null
    let activeChannel: StreamChannel | null = null

    async function initChat() {
      try {
        console.log("[v0] Initializing chat for user:", userId)

        const tokenResponse = await fetch("/api/token", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId, name: userName }),
        })

        console.log("[v0] Token response status:", tokenResponse.status)

        if (!tokenResponse.ok) {
          const errorData = await tokenResponse.json().catch(() => ({ error: "Unknown error" }))
          console.error("[v0] Token request failed:", errorData)
          throw new Error(errorData.error || "Failed to get token")
        }

        const { token, apiKey } = await tokenResponse.json()
        console.log("[v0] Got token and API key:", { hasToken: !!token, hasApiKey: !!apiKey, apiKey })

        if (!token || !apiKey) {
          throw new Error("Token or API key missing from response")
        }

        console.log("[v0] Creating new Stream client instance with API key:", apiKey)
        chatClient = new StreamChat(apiKey)

        console.log("[v0] Connecting user to Stream...")
        await chatClient.connectUser({ id: userId, name: userName }, token)
        console.log("[v0] Connected user to Stream")

        if (!mounted) {
          await chatClient.disconnectUser()
          return
        }

        // Get or create channel
        activeChannel = chatClient.channel(channelType, channelId, {
          name: title,
          members: [userId],
        })

        await activeChannel.watch()
        console.log("[v0] Watching channel:", channelId)

        if (!mounted) {
          return
        }

        setClient(chatClient)
        setChannel(activeChannel)

        // Get initial messages
        const state = activeChannel.state
        setMessages(state.messages || [])

        // Listen for new messages
        activeChannel.on("message.new", (event) => {
          console.log("[v0] New message received:", event.message)
          if (mounted && event.message) {
            setMessages((prev) => [...prev, event.message!])
          }
        })

        setIsLoading(false)
      } catch (err) {
        console.error("[v0] Error initializing chat:", err)
        if (mounted) {
          const errorMessage = err instanceof Error ? err.message : "Failed to initialize chat"
          setError(
            `Failed to connect to chat: ${errorMessage}. Please check your STREAM_API_KEY and STREAM_API_SECRET environment variables.`,
          )
          setIsLoading(false)
        }
      }
    }

    initChat()

    return () => {
      mounted = false
      if (chatClient) {
        console.log("[v0] Disconnecting user...")
        chatClient.disconnectUser().catch((err) => console.error("[v0] Error disconnecting:", err))
      }
    }
  }, [userId, userName, channelId, channelType, title])

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const sendMessage = async () => {
    if (!channel || !newMessage.trim()) return

    try {
      console.log("[v0] Sending message:", newMessage)
      await channel.sendMessage({
        text: newMessage,
      })
      setNewMessage("")
    } catch (err) {
      console.error("[v0] Error sending message:", err)
      setError("Failed to send message")
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
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

  if (error) {
    return (
      <Card className="w-full shadow-md border">
        <CardContent className="p-8 text-center">
          <AlertCircle className="w-16 h-16 text-destructive mx-auto mb-4" />
          <p className="text-destructive font-bold">{error}</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full shadow-md border">
      <CardHeader className="flex flex-row items-center justify-between border-b bg-muted/30">
        <CardTitle className="text-lg font-semibold">{title}</CardTitle>
        {showEscalateButton && onEscalate && (
          <Button variant="outline" size="sm" onClick={onEscalate}>
            <AlertCircle className="w-4 h-4 mr-2" />
            {escalateButtonText}
          </Button>
        )}
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[500px] p-4" ref={scrollRef}>
          <div className="space-y-4">
            {messages.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No messages yet. Start the conversation!</p>
              </div>
            ) : (
              messages.map((message) => {
                const isOwnMessage = message.user?.id === userId
                return (
                  <div key={message.id} className={`flex ${isOwnMessage ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-[75%] rounded-lg px-4 py-2 ${
                        isOwnMessage ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"
                      }`}
                    >
                      <p className="text-xs font-medium mb-1 opacity-80">{message.user?.name || message.user?.id}</p>
                      <p className="text-sm leading-relaxed">{message.text}</p>
                      <p className="text-xs opacity-70 mt-1">
                        {message.created_at ? format(new Date(message.created_at), "h:mm a") : ""}
                      </p>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </ScrollArea>

        <div className="p-4 border-t bg-muted/20">
          <div className="flex gap-2">
            <Input
              placeholder="Type your message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              className="flex-1"
            />
            <Button onClick={sendMessage} disabled={!newMessage.trim()}>
              <Send className="w-4 h-4 mr-2" />
              Send
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
