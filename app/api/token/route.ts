import { type NextRequest, NextResponse } from "next/server"
import { StreamChat } from "stream-chat"

/**
 * POST /api/token
 *
 * Generates a Stream Chat token for a given user.
 * - Upserts the user in Stream Chat (creates if doesn't exist, updates if exists)
 * - Returns the API key, token, and user data needed to connect on the client
 *
 * Input: { userId: string, name: string }
 * Output: { apiKey: string, token: string, user: object }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, name } = body

    console.log("[Token API] Request received for userId:", userId, "name:", name)

    if (!userId || !name) {
      return NextResponse.json({ error: "userId and name are required" }, { status: 400 })
    }

    // Initialize Stream Chat server client with API key and secret
    const apiKey = process.env.STREAM_API_KEY
    const apiSecret = process.env.STREAM_API_SECRET

    console.log("[Token API] Environment check:", {
      hasApiKey: !!apiKey,
      hasApiSecret: !!apiSecret,
      apiKeyPrefix: apiKey?.substring(0, 10),
    })

    if (!apiKey || !apiSecret) {
      console.error("[Token API] Missing STREAM_API_KEY or STREAM_API_SECRET environment variables")
      return NextResponse.json(
        {
          error:
            "Stream Chat credentials not configured. Please ensure STREAM_API_KEY and STREAM_API_SECRET are set in your environment variables.",
        },
        { status: 500 },
      )
    }

    console.log("[Token API] Creating Stream server client...")
    const serverClient = StreamChat.getInstance(apiKey, apiSecret)

    // Upsert the user (create or update)
    console.log("[Token API] Upserting user...")
    await serverClient.upsertUser({
      id: userId,
      name: name,
      role: "user",
    })

    // Generate a token for the user
    console.log("[Token API] Generating token...")
    const token = serverClient.createToken(userId)

    console.log(`[Token API] Successfully generated token for user: ${userId} (${name})`)

    return NextResponse.json({
      apiKey,
      token,
      user: { id: userId, name },
    })
  } catch (error) {
    console.error("[Token API] Error:", error)
    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    return NextResponse.json({ error: `Failed to generate token: ${errorMessage}` }, { status: 500 })
  }
}
