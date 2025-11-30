import { NextResponse } from "next/server"

/**
 * POST /api/zendesk-ticket
 *
 * Creates a Zendesk support ticket when a chat conversation is escalated.
 * This demonstrates integration between Stream Chat and Zendesk for support workflows.
 */
export async function POST(req: Request) {
  try {
    // Step 1: Parse the incoming request body
    const body = await req.json()
    const { channelId, customerId, listingId } = body

    // Step 2: Validate required fields
    if (!channelId || !customerId || !listingId) {
      return NextResponse.json(
        { ok: false, error: "Missing required fields: channelId, customerId, or listingId" },
        { status: 400 },
      )
    }

    // Step 3: Retrieve Zendesk credentials from environment variables
    const subdomain = process.env.ZENDESK_SUBDOMAIN
    const email = process.env.ZENDESK_EMAIL
    const apiToken = process.env.ZENDESK_API_TOKEN

    // Step 4: Ensure all Zendesk credentials are configured
    if (!subdomain || !email || !apiToken) {
      console.error("[v0] Missing Zendesk credentials in environment variables")
      return NextResponse.json(
        {
          ok: false,
          error:
            "Zendesk integration not configured. Please add ZENDESK_SUBDOMAIN, ZENDESK_EMAIL, and ZENDESK_API_TOKEN to environment variables.",
        },
        { status: 500 },
      )
    }

    // Step 5: Construct the Zendesk API endpoint
    const zendeskUrl = `https://${subdomain}.zendesk.com/api/v2/tickets.json`

    // Step 6: Prepare Basic Authentication header
    // Format: "email/token:api_token" encoded in base64
    const authString = `${email}/token:${apiToken}`
    const authHeader = `Basic ${Buffer.from(authString).toString("base64")}`

    // Step 7: Build the ticket payload
    const ticketPayload = {
      ticket: {
        subject: `Escalated chat from StreamBay – listing ${listingId}`,
        comment: {
          body: `Customer ${customerId} escalated chat from channel ${channelId}. Please review the conversation and assist the customer.`,
        },
        priority: "normal",
        tags: ["streambay", "chat-escalation", "marketplace"],
        // Optional: Include custom fields if your Zendesk has them configured
        // custom_fields: [
        //   { id: 123456, value: channelId }
        // ]
      },
    }

    console.log("[v0] Creating Zendesk ticket for channel:", channelId)

    // Step 8: Make the API request to Zendesk
    const zendeskResponse = await fetch(zendeskUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: authHeader,
      },
      body: JSON.stringify(ticketPayload),
    })

    // Step 9: Handle non-successful responses from Zendesk
    if (!zendeskResponse.ok) {
      const errorText = await zendeskResponse.text()
      console.error("[v0] Zendesk API error:", errorText)
      return NextResponse.json(
        {
          ok: false,
          error: `Zendesk API error: ${zendeskResponse.status} ${zendeskResponse.statusText}`,
          details: errorText,
        },
        { status: 500 },
      )
    }

    // Step 10: Parse the successful response from Zendesk
    const zendeskData = await zendeskResponse.json()
    const ticketId = zendeskData.ticket.id

    console.log("[v0] Successfully created Zendesk ticket:", ticketId)

    // Step 11: Return success response with ticket ID
    return NextResponse.json({
      ok: true,
      ticketId,
      message: "Zendesk ticket created successfully",
      ticketUrl: `https://${subdomain}.zendesk.com/agent/tickets/${ticketId}`,
    })
  } catch (error) {
    // Step 12: Handle any unexpected errors
    console.error("[v0] Error creating Zendesk ticket:", error)
    return NextResponse.json(
      {
        ok: false,
        error: "Failed to create Zendesk ticket",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
