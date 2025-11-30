import { NextResponse } from "next/server"

/**
 * POST /api/zendesk-escalate
 *
 * Handles escalation from Stream Chat to Zendesk support.
 * This route ensures we don't create duplicate tickets by searching for existing tickets
 * that match the same listing + buyer + seller combination.
 *
 * Flow:
 * 1. Check if a ticket already exists for this listing/buyer/seller combination
 * 2. If exists, return the existing ticket
 * 3. If not, create a new ticket with tags to identify it
 * 4. Return ticket ID and URL for the frontend to open
 */
export async function POST(req: Request) {
  try {
    // Parse request body
    const body = await req.json()
    const { listingId, buyerId, sellerId } = body

    console.log("[v0] Zendesk escalation request:", { listingId, buyerId, sellerId })

    // Validate required fields
    if (!listingId || !buyerId || !sellerId) {
      return NextResponse.json(
        { ok: false, error: "Missing required fields: listingId, buyerId, or sellerId" },
        { status: 400 },
      )
    }

    // Get Zendesk credentials from environment
    const subdomain = process.env.ZENDESK_SUBDOMAIN
    const email = process.env.ZENDESK_EMAIL
    const apiToken = process.env.ZENDESK_API_TOKEN

    if (!subdomain || !email || !apiToken) {
      console.error("[v0] Missing Zendesk environment variables")
      return NextResponse.json(
        {
          ok: false,
          error: "Zendesk not configured. Please add ZENDESK_SUBDOMAIN, ZENDESK_EMAIL, and ZENDESK_API_TOKEN.",
        },
        { status: 500 },
      )
    }

    // Prepare authentication header (email/token:api_token in base64)
    const authString = `${email}/token:${apiToken}`
    const authHeader = `Basic ${Buffer.from(authString).toString("base64")}`

    // Step 1: Search for existing tickets with matching tags
    // We use tags to identify tickets: listing_{id}, buyer_{id}, seller_{id}
    const searchTags = `listing_${listingId} buyer_${buyerId} seller_${sellerId}`
    const searchUrl = `https://${subdomain}.zendesk.com/api/v2/search.json?query=type:ticket tags:${encodeURIComponent(searchTags)}`

    console.log("[v0] Searching for existing ticket with tags:", searchTags)

    const searchResponse = await fetch(searchUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: authHeader,
      },
    })

    if (!searchResponse.ok) {
      console.error("[v0] Zendesk search failed:", searchResponse.status, searchResponse.statusText)
      // Continue to create new ticket if search fails
    } else {
      const searchData = await searchResponse.json()
      console.log("[v0] Search results:", searchData.count, "tickets found")

      // Step 2: If we found an existing ticket, return it
      if (searchData.results && searchData.results.length > 0) {
        const existingTicket = searchData.results[0]
        const ticketId = existingTicket.id
        const ticketUrl = `https://${subdomain}.zendesk.com/agent/tickets/${ticketId}`

        console.log("[v0] Found existing ticket:", ticketId)

        return NextResponse.json({
          ok: true,
          ticketId,
          ticketUrl,
          isNew: false,
          message: "Reusing existing support ticket",
        })
      }
    }

    // Step 3: No existing ticket found, create a new one
    console.log("[v0] No existing ticket found, creating new ticket")

    const createUrl = `https://${subdomain}.zendesk.com/api/v2/tickets.json`

    // Build ticket payload with identifying tags
    // Tags allow us to find this ticket later when checking for duplicates
    const ticketPayload = {
      ticket: {
        subject: `Escalated chat for listing ${listingId}`,
        comment: {
          body: `Support escalation from StreamBay marketplace.\n\nListing ID: ${listingId}\nBuyer: ${buyerId}\nSeller: ${sellerId}\n\nThe buyer has requested support assistance with this transaction.`,
        },
        priority: "normal",
        // These tags uniquely identify this conversation
        tags: [`listing_${listingId}`, `buyer_${buyerId}`, `seller_${sellerId}`, "streambay", "marketplace"],
      },
    }

    const createResponse = await fetch(createUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: authHeader,
      },
      body: JSON.stringify(ticketPayload),
    })

    if (!createResponse.ok) {
      const errorText = await createResponse.text()
      console.error("[v0] Zendesk ticket creation failed:", {
        status: createResponse.status,
        response: errorText,
      })
      return NextResponse.json(
        {
          ok: false,
          error: `Failed to create Zendesk ticket: ${createResponse.status} ${createResponse.statusText}`,
        },
        { status: 500 },
      )
    }

    // Step 4: Parse response and return ticket info
    const createData = await createResponse.json()
    const ticketId = createData.ticket.id
    const ticketUrl = `https://${subdomain}.zendesk.com/agent/tickets/${ticketId}`

    console.log("[v0] Successfully created new Zendesk ticket:", ticketId)

    return NextResponse.json({
      ok: true,
      ticketId,
      ticketUrl,
      isNew: true,
      message: "New support ticket created",
    })
  } catch (error) {
    console.error("[v0] Error in Zendesk escalation:", error)
    return NextResponse.json(
      {
        ok: false,
        error: "Failed to process escalation",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
