import { type NextRequest, NextResponse } from "next/server"

const ZENDESK_SUBDOMAIN = process.env.ZENDESK_SUBDOMAIN
const ZENDESK_EMAIL = process.env.ZENDESK_EMAIL
const ZENDESK_API_TOKEN = process.env.ZENDESK_API_TOKEN

// GET - Fetch ticket comments
export async function GET(req: NextRequest) {
  const ticketId = req.nextUrl.searchParams.get("ticketId")

  if (!ticketId) {
    return NextResponse.json({ error: "Missing ticketId" }, { status: 400 })
  }

  if (!ZENDESK_SUBDOMAIN || !ZENDESK_EMAIL || !ZENDESK_API_TOKEN) {
    return NextResponse.json({ error: "Zendesk credentials not configured" }, { status: 500 })
  }

  try {
    const url = `https://${ZENDESK_SUBDOMAIN}.zendesk.com/api/v2/tickets/${ticketId}/comments.json`
    const ticketUrl = `https://${ZENDESK_SUBDOMAIN}.zendesk.com/api/v2/tickets/${ticketId}.json`
    const authHeader = `Basic ${Buffer.from(`${ZENDESK_EMAIL}/token:${ZENDESK_API_TOKEN}`).toString("base64")}`

    // Fetch ticket to get requester ID
    const ticketResponse = await fetch(ticketUrl, {
      headers: {
        Authorization: authHeader,
        "Content-Type": "application/json",
      },
    })

    if (!ticketResponse.ok) {
      throw new Error(`Zendesk API error: ${ticketResponse.status}`)
    }

    const ticketData = await ticketResponse.json()
    const requesterId = ticketData.ticket.requester_id

    // Fetch comments
    const response = await fetch(url, {
      headers: {
        Authorization: authHeader,
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      throw new Error(`Zendesk API error: ${response.status}`)
    }

    const data = await response.json()

    return NextResponse.json({ comments: data.comments, requesterId })
  } catch (error) {
    console.error("[v0] Failed to fetch Zendesk messages:", error)
    return NextResponse.json({ error: "Failed to fetch messages" }, { status: 500 })
  }
}

// POST - Send a new message to the ticket
export async function POST(req: NextRequest) {
  try {
    const { ticketId, message, customerId, customerName } = await req.json()

    console.log("[v0] Sending message to Zendesk:", { ticketId, message, customerId, customerName })

    if (!ticketId || !message) {
      return NextResponse.json({ error: "Missing ticketId or message" }, { status: 400 })
    }

    if (!ZENDESK_SUBDOMAIN || !ZENDESK_EMAIL || !ZENDESK_API_TOKEN) {
      return NextResponse.json({ error: "Zendesk credentials not configured" }, { status: 500 })
    }

    // Add comment to Zendesk ticket
    const url = `https://${ZENDESK_SUBDOMAIN}.zendesk.com/api/v2/tickets/${ticketId}.json`
    const authHeader = `Basic ${Buffer.from(`${ZENDESK_EMAIL}/token:${ZENDESK_API_TOKEN}`).toString("base64")}`

    console.log("[v0] Calling Zendesk API:", url)

    const response = await fetch(url, {
      method: "PUT",
      headers: {
        Authorization: authHeader,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ticket: {
          comment: {
            body: message,
            public: true,
            author_id: customerId,
          },
        },
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("[v0] Zendesk API error:", response.status, errorText)
      throw new Error(`Zendesk API error: ${response.status}`)
    }

    const data = await response.json()
    console.log("[v0] Message sent successfully:", data)

    const audit = data.audit
    const commentId = audit?.events?.find((e: any) => e.type === "Comment")?.id

    return NextResponse.json({ success: true, commentId })
  } catch (error) {
    console.error("[v0] Failed to send message to Zendesk:", error)
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 })
  }
}
