import { type NextRequest, NextResponse } from "next/server"
import { StreamChat } from "stream-chat"

/**
 * POST /api/channels/escalate
 *
 * Escalates a marketplace conversation to a support channel.
 * - Creates a Zendesk ticket with conversation context
 * - Creates a new support channel with pattern: support-{originalChannelId}
 * - Adds the customer and a support agent as members
 * - Sends a system message with escalation context
 *
 * Input: { originalChannelId: string, customerId: string, customerEmail: string, conversationSummary: string }
 * Output: { supportChannelId: string, supportAgentId: string, zendeskTicketId?: string, zendeskTicketUrl?: string }
 */
export async function POST(request: NextRequest) {
  try {
    console.log("[v0] Escalate API called")

    const body = await request.json()
    const { originalChannelId, customerId, customerEmail, conversationSummary } = body

    console.log("[v0] Request body:", { originalChannelId, customerId, customerEmail })

    if (!originalChannelId || !customerId) {
      return NextResponse.json({ error: "originalChannelId and customerId are required" }, { status: 400 })
    }

    const apiKey = process.env.STREAM_API_KEY
    const apiSecret = process.env.STREAM_API_SECRET

    console.log("[v0] API Key exists:", !!apiKey)
    console.log("[v0] API Secret exists:", !!apiSecret)

    if (!apiKey || !apiSecret) {
      return NextResponse.json({ error: "Stream Chat credentials not configured" }, { status: 500 })
    }

    let zendeskTicketId = null
    let zendeskTicketUrl = null

    if (customerEmail) {
      try {
        const zendeskResponse = await fetch(`${request.nextUrl.origin}/api/zendesk/create-ticket`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            subject: `StreamBay Support Request - Order ${originalChannelId}`,
            description:
              conversationSummary ||
              `Customer ${customerId} has requested support for their marketplace conversation.\n\nChannel ID: ${originalChannelId}`,
            customerId: customerId,
            customerEmail: customerEmail,
            priority: "normal",
          }),
        })

        if (zendeskResponse.ok) {
          const zendeskData = await zendeskResponse.json()
          zendeskTicketId = zendeskData.ticketId
          zendeskTicketUrl = zendeskData.ticketUrl
          console.log("[v0] Zendesk ticket created:", zendeskTicketId)
        } else {
          console.error("[v0] Failed to create Zendesk ticket, continuing with Stream escalation")
        }
      } catch (zendeskError) {
        console.error("[v0] Zendesk ticket creation failed:", zendeskError)
        // Continue with Stream escalation even if Zendesk fails
      }
    }

    const serverClient = new StreamChat(apiKey, apiSecret)

    console.log("[v0] Server client created")

    // Define support agent
    const supportAgentId = "support_1"

    try {
      await serverClient.upsertUsers([
        { id: customerId, name: `Customer ${customerId}`, role: "user" },
        { id: supportAgentId, name: "Support Agent", role: "admin" },
      ])
      console.log("[v0] Users upserted successfully")
    } catch (userError) {
      console.error("[v0] Error upserting users:", userError)
      throw userError
    }

    // Create support channel ID
    const supportChannelId = `support-${originalChannelId}`

    console.log("[v0] Creating support channel:", supportChannelId)

    // Create the support channel
    const supportChannel = serverClient.channel("messaging", supportChannelId, {
      name: "Support Channel",
      members: [customerId, supportAgentId],
      created_by_id: customerId,
    })

    await supportChannel.create()

    console.log("[v0] Support channel created successfully")

    const escalationMessage = zendeskTicketId
      ? `🚨 Escalated from channel ${originalChannelId} for customer ${customerId}.\n\n✅ Zendesk Ticket #${zendeskTicketId} created.\nTicket URL: ${zendeskTicketUrl}`
      : `🚨 This conversation has been escalated to support.\n\nOriginal channel: ${originalChannelId}\nCustomer: ${customerId}\n\nA support agent will assist you shortly.`

    // Send a system-style message with context
    await supportChannel.sendMessage({
      text: escalationMessage,
      user_id: supportAgentId,
    })

    console.log("[v0] Escalation message sent")

    return NextResponse.json({
      supportChannelId,
      supportAgentId,
      zendeskTicketId,
      zendeskTicketUrl,
    })
  } catch (error) {
    console.error("[v0] Escalate API Error:", error)
    return NextResponse.json(
      {
        error: "Failed to escalate to support",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
