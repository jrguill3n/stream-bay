import { type NextRequest, NextResponse } from "next/server"
import { StreamChat } from "stream-chat"

/**
 * POST /api/channels/marketplace
 *
 * Creates or retrieves a marketplace channel for a specific listing.
 * Channel members are the buyer and seller.
 * Channel ID follows pattern: listing-{listingId}-{buyerId}-{sellerId}
 *
 * Input: { listingId: string, buyerId: string, sellerId: string }
 * Output: { channelId: string }
 */
export async function POST(request: NextRequest) {
  try {
    console.log("[v0] Marketplace channel API called")

    const body = await request.json()
    const { listingId, buyerId, sellerId } = body

    console.log("[v0] Request body:", { listingId, buyerId, sellerId })

    if (!listingId || !buyerId || !sellerId) {
      return NextResponse.json({ error: "listingId, buyerId, and sellerId are required" }, { status: 400 })
    }

    const apiKey = process.env.STREAM_API_KEY
    const apiSecret = process.env.STREAM_API_SECRET

    console.log("[v0] API Key exists:", !!apiKey)
    console.log("[v0] API Secret exists:", !!apiSecret)

    if (!apiKey || !apiSecret) {
      return NextResponse.json({ error: "Stream Chat credentials not configured" }, { status: 500 })
    }

    const serverClient = new StreamChat(apiKey, apiSecret)

    console.log("[v0] Server client created")

    try {
      await serverClient.upsertUsers([
        { id: buyerId, name: `Buyer ${buyerId}`, role: "user" },
        { id: sellerId, name: `Seller ${sellerId}`, role: "user" },
      ])
      console.log("[v0] Users upserted successfully")
    } catch (userError) {
      console.error("[v0] Error upserting users:", userError)
      throw userError
    }

    const channelId = `listing-${listingId}-${buyerId}-${sellerId}`

    console.log("[v0] Creating channel:", channelId)

    const channel = serverClient.channel("messaging", channelId, {
      name: `Listing #${listingId}`,
      members: [buyerId, sellerId],
      created_by_id: buyerId,
    })

    await channel.create()

    console.log("[v0] Channel created successfully:", channelId)

    return NextResponse.json({
      channelId,
    })
  } catch (error) {
    console.error("[v0] Marketplace Channel API Error:", error)
    return NextResponse.json(
      {
        error: "Failed to create marketplace channel",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
