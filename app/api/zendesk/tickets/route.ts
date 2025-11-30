import { type NextRequest, NextResponse } from "next/server"

const ZENDESK_SUBDOMAIN = process.env.ZENDESK_SUBDOMAIN
const ZENDESK_EMAIL = process.env.ZENDESK_EMAIL
const ZENDESK_API_TOKEN = process.env.ZENDESK_API_TOKEN

export async function GET(request: NextRequest) {
  try {
    if (!ZENDESK_SUBDOMAIN || !ZENDESK_EMAIL || !ZENDESK_API_TOKEN) {
      return NextResponse.json({ error: "Zendesk credentials not configured" }, { status: 500 })
    }

    const credentials = Buffer.from(`${ZENDESK_EMAIL}/token:${ZENDESK_API_TOKEN}`).toString("base64")

    // Fetch open tickets (status: new, open, pending)
    const response = await fetch(
      `https://${ZENDESK_SUBDOMAIN}.zendesk.com/api/v2/search.json?query=type:ticket status<solved`,
      {
        headers: {
          Authorization: `Basic ${credentials}`,
          "Content-Type": "application/json",
        },
      },
    )

    if (!response.ok) {
      console.error("[v0] Zendesk API error:", response.status, response.statusText)
      return NextResponse.json({ error: `Zendesk API error: ${response.status}` }, { status: response.status })
    }

    const data = await response.json()

    // Transform tickets to a simpler format
    const tickets = data.results.map((ticket: any) => ({
      id: ticket.id,
      subject: ticket.subject,
      description: ticket.description,
      status: ticket.status,
      priority: ticket.priority,
      created_at: ticket.created_at,
      updated_at: ticket.updated_at,
      url: `https://${ZENDESK_SUBDOMAIN}.zendesk.com/agent/tickets/${ticket.id}`,
    }))

    return NextResponse.json({ tickets })
  } catch (error) {
    console.error("[v0] Error fetching Zendesk tickets:", error)
    return NextResponse.json({ error: "Failed to fetch tickets" }, { status: 500 })
  }
}
