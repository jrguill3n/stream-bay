import { type NextRequest, NextResponse } from "next/server"
import { StreamChat } from "stream-chat"

/**
 * POST /api/zendesk/webhook
 *
 * Webhook endpoint for Zendesk to notify us when a ticket receives a new public comment.
 * - Validates webhook secret for security
 * - Queries Stream for channel with matching ticketId
 * - Sends support agent's message to the channel
 *
 * Expected payload from Zendesk:
 * {
 *   ticket_id: number,
 *   comment_body: string,
 *   author_name?: string,
 *   author_id?: string
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const webhookSecret = request.headers.get("x-zendesk-webhook-secret")
    const expectedSecret = process.env.ZENDESK_WEBHOOK_SECRET

    if (!expectedSecret) {
      console.error("[Zendesk Webhook] ZENDESK_WEBHOOK_SECRET not configured")
      return NextResponse.json({ error: "Webhook not configured" }, { status: 500 })
    }

    if (webhookSecret !== expectedSecret) {
      console.error("[Zendesk Webhook] Invalid webhook secret")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { ticket_id, comment_body, author_name } = body

    console.log("[Zendesk Webhook] Received webhook for ticket:", ticket_id)

    if (!ticket_id || !comment_body) {
      console.error("[Zendesk Webhook] Missing required fields: ticket_id or comment_body")
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const apiKey = process.env.STREAM_API_KEY
    const apiSecret = process.env.STREAM_API_SECRET
    const supportAgentId = process.env.SUPPORT_AGENT_ID

    if (!apiKey || !apiSecret) {
      console.error("[Zendesk Webhook] Stream credentials not configured")
      return NextResponse.json({ error: "Stream credentials not configured" }, { status: 500 })
    }

    if (!supportAgentId) {
      console.error("[Zendesk Webhook] SUPPORT_AGENT_ID not configured")
      return NextResponse.json({ error: "Support agent not configured" }, { status: 500 })
    }

    const serverClient = StreamChat.getInstance(apiKey, apiSecret)

    console.log("[Zendesk Webhook] Querying Stream for channel with ticketId:", ticket_id)

    const channels = await serverClient.queryChannels({
      ticketId: ticket_id.toString(),
    })

    if (!channels || channels.length === 0) {
      console.log("[Zendesk Webhook] No channel found with ticketId:", ticket_id, "- ignoring webhook")
      // Return 200 to acknowledge receipt (no-op)
      return NextResponse.json({ status: "ok", message: "No matching channel found" })
    }

    const channel = channels[0]
    console.log("[Zendesk Webhook] Found channel:", channel.id, "- sending message")

    await channel.sendMessage({
      text: comment_body,
      user_id: supportAgentId,
    })

    console.log("[Zendesk Webhook] Successfully sent message to channel:", channel.id)

    return NextResponse.json({
      status: "ok",
      channelId: channel.id,
      ticketId: ticket_id,
    })
  } catch (error) {
    console.error("[Zendesk Webhook] Error processing webhook:", error)

    // Always return 200 to Zendesk to acknowledge receipt
    // Log the error but don't fail the webhook
    return NextResponse.json({
      status: "error",
      message: error instanceof Error ? error.message : "Unknown error",
    })
  }
}
