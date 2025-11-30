"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Send } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"

interface ZendeskMessage {
  id: number
  body: string
  author_id: number
  created_at: string
  public: boolean
}

interface ZendeskChatInterfaceProps {
  ticketId: string
  customerId: string
  customerName: string
}

export function ZendeskChatInterface({ ticketId, customerId, customerName }: ZendeskChatInterfaceProps) {
  const [messages, setMessages] = useState<ZendeskMessage[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [isSending, setIsSending] = useState(false)
  const [initialLoad, setInitialLoad] = useState(true)
  const [requesterId, setRequesterId] = useState<number | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const [customerMessageIds, setCustomerMessageIds] = useState<Set<number>>(new Set())

  const fetchMessages = async () => {
    try {
      const response = await fetch(`/api/zendesk/messages?ticketId=${ticketId}`)
      if (!response.ok) throw new Error("Failed to fetch messages")

      const data = await response.json()
      setMessages(data.comments || [])
      setRequesterId(data.requesterId)
      setInitialLoad(false)
    } catch (error) {
      console.error("[v0] Failed to fetch Zendesk messages:", error)
      setInitialLoad(false)
    }
  }

  useEffect(() => {
    fetchMessages()

    const interval = setInterval(() => {
      fetchMessages()
    }, 10000) // Poll every 10 seconds for new messages

    return () => clearInterval(interval)
  }, [ticketId])

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages])

  const handleSend = async () => {
    if (!newMessage.trim() || isSending) return

    setIsSending(true)
    try {
      const response = await fetch("/api/zendesk/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ticketId,
          message: newMessage,
          customerId,
          customerName,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to send message")
      }

      const result = await response.json()
      if (result.commentId) {
        setCustomerMessageIds((prev) => new Set([...prev, result.commentId]))
      }

      setNewMessage("")
      await fetchMessages()
    } catch (error) {
      console.error("[v0] Failed to send message:", error)
      alert("Failed to send message. Please try again.")
    } finally {
      setIsSending(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  if (initialLoad) {
    return (
      <div className="h-[600px] flex items-center justify-center">
        <p className="text-muted-foreground">Loading support chat...</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-[600px] bg-background border rounded-lg overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b bg-primary/5 shrink-0">
        <h3 className="font-semibold text-primary">Support Chat (Zendesk Ticket #{ticketId})</h3>
        <p className="text-xs text-muted-foreground">Connected to support team</p>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4 overflow-auto">
        <div className="space-y-4">
          {messages.map((message) => {
            const hasCustomerPrefix = message.body.startsWith(`[${customerName}]:`)
            const isCustomer =
              hasCustomerPrefix || customerMessageIds.has(message.id) || message.author_id === requesterId

            console.log("[v0] Message classification:", {
              id: message.id,
              body: message.body.substring(0, 50),
              author_id: message.author_id,
              requesterId,
              hasCustomerPrefix,
              inMessageIds: customerMessageIds.has(message.id),
              authorMatches: message.author_id === requesterId,
              isCustomer,
            })

            const displayBody = hasCustomerPrefix ? message.body.replace(`[${customerName}]: `, "") : message.body

            return (
              <div key={message.id} className={`flex ${isCustomer ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[70%] rounded-lg px-4 py-2 break-words ${
                    isCustomer ? "bg-primary text-primary-foreground" : "bg-muted"
                  }`}
                >
                  <div className="text-xs opacity-70 mb-1">{isCustomer ? customerName : "Support Agent"}</div>
                  <p className="text-sm whitespace-pre-wrap break-words">{displayBody}</p>
                  <div className="text-xs opacity-60 mt-1">{new Date(message.created_at).toLocaleTimeString()}</div>
                </div>
              </div>
            )
          })}
          <div ref={scrollRef} />
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="p-4 border-t bg-background shrink-0">
        <div className="flex gap-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            disabled={isSending}
            className="flex-1"
          />
          <Button onClick={handleSend} disabled={isSending || !newMessage.trim()} size="icon">
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
