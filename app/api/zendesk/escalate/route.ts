import { type NextRequest, NextResponse } from "next/server"
import { StreamChat } from "stream-chat"

const ZENDESK_SUBDOMAIN = process.env.ZENDESK_SUBDOMAIN
const ZENDESK_EMAIL = process.env.ZENDESK_EMAIL
const ZENDESK_API_TOKEN = process.env.ZENDESK_API_TOKEN

interface EscalateRequestBody {
  channelId: string
  buyerId: string
  listingId: string
}

interface ZendeskTicket {
  id: number
  subject: string
  description: string
  status: string
  tags?: string[]
}

/**
 * POST /api/zendesk/escalate
 *
 * Escalates a marketplace chat to Zendesk support.
 * - Fetches the Stream channel and last 50 messages
 * - Creates or finds existing Zendesk ticket for this channel
 * - Updates Stream channel with ticketId
 * - Optionally adds support agent to channel
 *
 * Input: { channelId: string, buyerId: string, listingId: string }
 * Output: { ticketId: number, channelId: string, status: "ok" }
 */
export async function POST(request: NextRequest) {
  try {
    const body: EscalateRequestBody = await request.json()
    const { channelId, buyerId, listingId } = body

    if (!channelId || !buyerId || !listingId) {
      return NextResponse.json({ error: "channelId, buyerId, and listingId are required" }, { status: 400 })
    }

    // Validate Zendesk credentials
    if (!ZENDESK_SUBDOMAIN || !ZENDESK_EMAIL || !ZENDESK_API_TOKEN) {
      return NextResponse.json({ error: "Zendesk credentials not configured" }, { status: 500 })
    }

    // Validate Stream credentials
    const apiKey = process.env.STREAM_API_KEY
    const apiSecret = process.env.STREAM_API_SECRET

    if (!apiKey || !apiSecret) {
      return NextResponse.json({ error: "Stream Chat credentials not configured" }, { status: 500 })
    }

    // Initialize Stream server client
    const serverClient = StreamChat.getInstance(apiKey, apiSecret)

    // Fetch the channel
    const channel = serverClient.channel("messaging", channelId)
    await channel.watch()

    // Fetch last 50 messages for context
    const messagesResponse = await channel.query({
      messages: { limit: 50 },
    })

    const messages = messagesResponse.messages || []

    // Format chat transcript for Zendesk ticket
    const transcript = messages
      .map((msg) => {
        const timestamp = new Date(msg.created_at as string).toLocaleString()
        const author = msg.user?.name || msg.user?.id || "Unknown"
        const text = msg.text || ""
        return `[${timestamp}] ${author}: ${text}`
      })
      .join("\n")

    const ticketDescription = `Customer ${buyerId} escalated chat from channel ${channelId}. Please review the conversation and assist the customer.\n\nChat History:\n\n${transcript}`

    // Zendesk API credentials
    const credentials = Buffer.from(`${ZENDESK_EMAIL}/token:${ZENDESK_API_TOKEN}`).toString("base64")

    // Search for existing open ticket with tags
    const searchQuery = `type:ticket status<solved tags:listing_${listingId} tags:buyer_${buyerId}`
    const searchResponse = await fetch(
      `https://${ZENDESK_SUBDOMAIN}.zendesk.com/api/v2/search.json?query=${encodeURIComponent(searchQuery)}`,
      {
        headers: {
          Authorization: `Basic ${credentials}`,
          "Content-Type": "application/json",
        },
      },
    )

    let ticketId: number

    if (searchResponse.ok) {
      const searchData = await searchResponse.json()
      const existingTicket = searchData.results?.[0] as ZendeskTicket | undefined

      if (existingTicket) {
        // Reuse existing ticket
        ticketId = existingTicket.id
      } else {
        // Create new ticket
        const createResponse = await fetch(`https://${ZENDESK_SUBDOMAIN}.zendesk.com/api/v2/tickets.json`, {
          method: "POST",
          headers: {
            Authorization: `Basic ${credentials}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ticket: {
              subject: `Escalated chat from StreamBay – listing ${listingId}`,
              comment: {
                body: ticketDescription,
              },
              priority: "normal",
              status: "open",
              tags: [`listing_${listingId}`, `buyer_${buyerId}`, `channel_${channelId}`],
              custom_fields: [
                {
                  id: "channel_id",
                  value: channelId,
                },
              ],
            },
          }),
        })

        if (!createResponse.ok) {
          const errorText = await createResponse.text()
          console.error("Zendesk ticket creation failed:", errorText)
          return NextResponse.json(
            { error: `Failed to create Zendesk ticket: ${createResponse.status}` },
            { status: createResponse.status },
          )
        }

        const createData = await createResponse.json()
        ticketId = createData.ticket.id
      }
    } else {
      return NextResponse.json(
        { error: `Zendesk search failed: ${searchResponse.status}` },
        { status: searchResponse.status },
      )
    }

    // Update Stream channel with ticketId
    await channel.updatePartial({
      set: {
        ticketId: ticketId.toString(),
      },
    })

    // Optionally add support agent as member
    const supportAgentId = process.env.SUPPORT_AGENT_ID
    if (supportAgentId) {
      try {
        await channel.addMembers([supportAgentId])
      } catch (error) {
        console.error("Failed to add support agent to channel:", error)
        // Non-critical error, continue
      }
    }

    return NextResponse.json({
      ticketId,
      channelId,
      status: "ok",
    })
  } catch (error) {
    console.error("Zendesk Escalate API Error:", error)
    return NextResponse.json(
      {
        error: "Failed to escalate to Zendesk",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
