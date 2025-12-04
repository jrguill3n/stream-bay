"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import type { Channel as StreamChannel, Message } from "stream-chat"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Send, AlertCircle, Loader2 } from "lucide-react"
import { format } from "date-fns"

interface BuyerSellerChatProps {
  channel: StreamChannel
  userId: string
  onEscalate?: () => Promise<void>
}

export function BuyerSellerChat({ channel, userId, onEscalate }: BuyerSellerChatProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [isEscalating, setIsEscalating] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const state = channel.state
    setMessages(state.messages || [])

    const handleNewMessage = (event: any) => {
      if (event.message) {
        setMessages((prev) => [...prev, event.message!])
      }
    }

    channel.on("message.new", handleNewMessage)

    return () => {
      channel.off("message.new", handleNewMessage)
    }
  }, [channel])

  useEffect(() => {
    if (scrollRef.current) {
      const scrollContainer = scrollRef.current
      const lastMessage = scrollContainer.querySelector('div[class*="space-y-4"] > div:last-child')
      if (lastMessage) {
        lastMessage.scrollIntoView({ behavior: "smooth", block: "end" })
      } else {
        scrollContainer.scrollTop = scrollContainer.scrollHeight
      }
    }
  }, [messages])

  const sendMessage = async () => {
    if (!newMessage.trim()) return

    try {
      await channel.sendMessage({
        text: newMessage,
      })
      setNewMessage("")
    } catch (err) {
      console.error("Error sending message:", err)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const handleEscalateClick = async () => {
    console.log("[v0] Need Help button clicked")
    if (!onEscalate) {
      console.log("[v0] No onEscalate handler provided")
      return
    }

    console.log("[v0] Starting escalation...")
    setIsEscalating(true)
    try {
      await onEscalate()
      console.log("[v0] Escalation completed successfully")
    } catch (err) {
      console.error("[v0] Escalation failed:", err)
    } finally {
      setIsEscalating(false)
    }
  }

  return (
    <Card className="w-full shadow-md border">
      <CardHeader className="flex flex-row items-center justify-between border-b bg-muted/30">
        <CardTitle className="text-lg font-semibold">Chat with Seller</CardTitle>
        {onEscalate && (
          <Button variant="outline" size="sm" onClick={handleEscalateClick} disabled={isEscalating}>
            {isEscalating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Escalating...
              </>
            ) : (
              <>
                <AlertCircle className="w-4 h-4 mr-2" />
                Need Help?
              </>
            )}
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
