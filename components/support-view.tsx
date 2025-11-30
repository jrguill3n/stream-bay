"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChatInterface } from "@/components/chat-interface"
import { Headphones, AlertCircle, Clock, User } from "lucide-react"
import { Badge } from "@/components/ui/badge"

const SUPPORT_AGENT_ID = "support_1"

interface SupportChannel {
  id: string
  customerId: string
  originalChannelId: string
  createdAt: Date
  hasUnread: boolean
}

export default function SupportView() {
  const [activeChannelId, setActiveChannelId] = useState<string | null>(null)
  const [supportChannels, setSupportChannels] = useState<SupportChannel[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setIsLoading(false)
    setSupportChannels([])
  }, [])

  const handleSelectChannel = (channelId: string) => {
    setActiveChannelId(channelId)
  }

  const handleBackToList = () => {
    setActiveChannelId(null)
  }

  return (
    <div className="max-w-7xl mx-auto">
      <Card className="mb-6 shadow-md">
        <CardHeader className="border-b bg-accent/50">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Headphones className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1">
              <CardTitle className="text-2xl">Support Agent Dashboard</CardTitle>
              <CardDescription className="text-base mt-1">
                {activeChannelId
                  ? "Managing escalated customer conversation"
                  : `${supportChannels.length} escalated conversations`}
              </CardDescription>
            </div>
            {activeChannelId && (
              <Button variant="outline" onClick={handleBackToList} className="font-semibold bg-transparent">
                Back to Queue
              </Button>
            )}
          </div>
        </CardHeader>
      </Card>

      {!activeChannelId ? (
        <Card className="shadow-md">
          <CardHeader className="border-b">
            <CardTitle className="text-lg">Support Queue</CardTitle>
            <CardDescription>Click on any conversation to respond</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                  <p className="text-muted-foreground">Loading support channels...</p>
                </div>
              </div>
            ) : error ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
                  <p className="text-destructive font-medium mb-2">Error loading channels</p>
                  <p className="text-sm text-muted-foreground">{error}</p>
                </div>
              </div>
            ) : supportChannels.length === 0 ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                    <Headphones className="h-10 w-10 text-muted-foreground" />
                  </div>
                  <p className="text-muted-foreground text-lg font-medium mb-2">No Active Conversations</p>
                  <p className="text-sm text-muted-foreground">Escalated chats will appear here</p>
                </div>
              </div>
            ) : (
              <div className="divide-y">
                {supportChannels.map((channel) => (
                  <button
                    key={channel.id}
                    onClick={() => handleSelectChannel(channel.id)}
                    className="w-full p-4 hover:bg-accent transition-colors text-left flex items-center gap-4"
                  >
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <User className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-semibold text-foreground truncate">{channel.customerId}</p>
                        {channel.hasUnread && (
                          <Badge variant="destructive" className="text-xs">
                            New
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground truncate">Order: {channel.originalChannelId}</p>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground flex-shrink-0">
                      <Clock className="h-4 w-4" />
                      {channel.createdAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <ChatInterface
          userId={SUPPORT_AGENT_ID}
          userName="Support Agent"
          channelId={activeChannelId}
          title="Support Chat"
        />
      )}
    </div>
  )
}
