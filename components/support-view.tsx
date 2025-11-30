"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Headphones, AlertCircle, Clock, ExternalLink, Ticket } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface ZendeskTicket {
  id: number
  subject: string
  description: string
  status: string
  priority: string | null
  created_at: string
  updated_at: string
  url: string
}

export default function SupportView() {
  const [tickets, setTickets] = useState<ZendeskTicket[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchTickets()
  }, [])

  const fetchTickets = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const response = await fetch("/api/zendesk/tickets")
      if (!response.ok) {
        throw new Error("Failed to fetch tickets")
      }
      const data = await response.json()
      setTickets(data.tickets)
    } catch (err) {
      console.error("Error fetching tickets:", err)
      setError(err instanceof Error ? err.message : "Failed to load tickets")
    } finally {
      setIsLoading(false)
    }
  }

  const handleOpenTicket = (url: string) => {
    window.open(url, "_blank", "width=1200,height=800")
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "new":
        return "bg-blue-500"
      case "open":
        return "bg-yellow-500"
      case "pending":
        return "bg-orange-500"
      case "solved":
        return "bg-green-500"
      default:
        return "bg-gray-500"
    }
  }

  const getPriorityLabel = (priority: string | null) => {
    if (!priority) return null
    return priority.charAt(0).toUpperCase() + priority.slice(1)
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
                All conversations are handled via Zendesk. {tickets.length} open{" "}
                {tickets.length === 1 ? "ticket" : "tickets"} awaiting response.
              </CardDescription>
            </div>
            <Button variant="outline" onClick={fetchTickets} className="font-semibold bg-transparent">
              Refresh
            </Button>
          </div>
        </CardHeader>
      </Card>

      <Card className="shadow-md">
        <CardHeader className="border-b">
          <CardTitle className="text-lg flex items-center gap-2">
            <Ticket className="h-5 w-5" />
            Zendesk Tickets
          </CardTitle>
          <CardDescription>Click on any ticket to open it in Zendesk and respond to customers</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading tickets from Zendesk...</p>
              </div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
                <p className="text-destructive font-medium mb-2">Error loading tickets</p>
                <p className="text-sm text-muted-foreground">{error}</p>
              </div>
            </div>
          ) : tickets.length === 0 ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                  <Ticket className="h-10 w-10 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground text-lg font-medium mb-2">No Open Tickets</p>
                <p className="text-sm text-muted-foreground">All Zendesk tickets have been resolved</p>
              </div>
            </div>
          ) : (
            <div className="divide-y">
              {tickets.map((ticket) => (
                <button
                  key={ticket.id}
                  onClick={() => handleOpenTicket(ticket.url)}
                  className="w-full p-4 hover:bg-accent transition-colors text-left flex items-start gap-4 group"
                >
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Ticket className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-semibold text-foreground truncate">{ticket.subject}</p>
                      <Badge variant="secondary" className={`text-xs text-white ${getStatusColor(ticket.status)}`}>
                        {ticket.status}
                      </Badge>
                      {ticket.priority && (
                        <Badge variant="outline" className="text-xs">
                          {getPriorityLabel(ticket.priority)}
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-2">{ticket.description}</p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        Created: {new Date(ticket.created_at).toLocaleDateString()}
                      </div>
                      <div className="flex items-center gap-1">
                        Updated: {new Date(ticket.updated_at).toLocaleString()}
                      </div>
                    </div>
                  </div>
                  <ExternalLink className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
                </button>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
