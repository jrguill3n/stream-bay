"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import type { Channel as StreamChannel, Message } from "stream-chat"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Send, Headset, MessageSquare } from "lucide-react"
import { format } from "date-fns"

interface SupportChatProps {
  channel: StreamChannel
  userId: string
  ticketId: string
  onViewBuyerChat?: () => void
}

export function SupportChat({ channel, userId, ticketId, onViewBuyerChat }: SupportChatProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
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

  return (
    <Card className="w-full shadow-md border border-orange-200">
      <CardHeader className="flex flex-row items-center justify-between border-b bg-orange-50">
        <div className="flex items-center gap-2">
          <Headset className="w-5 h-5 text-orange-600" />
          <div>
            <CardTitle className="text-lg font-semibold">Support • Ticket #{ticketId}</CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5">You're now chatting with our support team</p>
          </div>
        </div>
        {onViewBuyerChat && (
          <Button variant="outline" size="sm" onClick={onViewBuyerChat} className="gap-2 bg-transparent">
            <MessageSquare className="w-4 h-4" />
            View Seller Chat
          </Button>
        )}
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[500px] p-4" ref={scrollRef}>
          <div className="space-y-4">
            {messages.length === 0 ? (
              <div className="text-center py-12">
                <Headset className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                <p className="text-muted-foreground">Support will respond shortly...</p>
              </div>
            ) : (
              messages.map((message) => {
                const isOwnMessage = message.user?.id === userId
                const isSupport = message.user?.id === "support_agent"

                return (
                  <div key={message.id} className={`flex ${isOwnMessage ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-[75%] rounded-lg px-4 py-2 ${
                        isOwnMessage
                          ? "bg-primary text-primary-foreground"
                          : isSupport
                            ? "bg-orange-100 text-orange-900 border border-orange-200"
                            : "bg-muted text-foreground"
                      }`}
                    >
                      <p className="text-xs font-medium mb-1 opacity-80">
                        {isSupport ? "Support Agent" : message.user?.name || message.user?.id}
                      </p>
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
              placeholder="Type your message to support..."
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
