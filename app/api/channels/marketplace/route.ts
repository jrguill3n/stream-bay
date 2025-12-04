import { type NextRequest, NextResponse } from "next/server"
import { StreamChat } from "stream-chat"

/**
 * POST /api/channels/marketplace
 *
 * Creates or retrieves a marketplace channel for a specific listing.
 * Channel members are the buyer and seller.
 * Channel ID follows pattern: marketplace-{listingId}-{buyerId}
 *
 * Custom fields stored in channel data:
 * - listingId: The product listing ID
 * - buyerId: The buyer's user ID
 * - sellerId: The seller's user ID
 * - ticketId: Zendesk ticket ID (null until escalated)
 *
 * Input: { listingId: string, buyerId: string, sellerId: string }
 * Output: { channelId: string, channelData: object }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { listingId, buyerId, sellerId } = body

    if (!listingId || !buyerId || !sellerId) {
      return NextResponse.json({ error: "listingId, buyerId, and sellerId are required" }, { status: 400 })
    }

    const apiKey = process.env.STREAM_API_KEY
    const apiSecret = process.env.STREAM_API_SECRET

    if (!apiKey || !apiSecret) {
      return NextResponse.json({ error: "Stream Chat credentials not configured" }, { status: 500 })
    }

    const serverClient = StreamChat.getInstance(apiKey, apiSecret)

    // Ensure users exist in Stream
    await serverClient.upsertUsers([
      { id: buyerId, name: `Buyer ${buyerId}`, role: "user" },
      { id: sellerId, name: `Seller ${sellerId}`, role: "user" },
    ])

    const channelId = `marketplace-${listingId}-${buyerId}`

    const channelData = {
      name: `Listing #${listingId}`,
      listingId,
      buyerId,
      sellerId,
      ticketId: null,
      created_by_id: buyerId,
    }

    const channel = serverClient.channel("messaging", channelId, channelData)

    // This will create the channel if it doesn't exist, or fetch it if it does
    await channel.create()

    // Add members if not already added (idempotent)
    await channel.addMembers([buyerId, sellerId])

    return NextResponse.json({
      channelId,
      channelData: channel.data,
    })
  } catch (error) {
    console.error("Marketplace Channel API Error:", error)
    return NextResponse.json(
      {
        error: "Failed to create marketplace channel",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
