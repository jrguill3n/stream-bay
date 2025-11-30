/**
 * Stream Chat client utility
 *
 * This file provides a helper function to get a Stream Chat token
 * from the backend API and stores user info for components to use.
 */

export interface StreamTokenResponse {
  apiKey: string
  token: string
  user: {
    id: string
    name: string
  }
}

/**
 * Fetches a Stream Chat token for a given user from our backend API
 */
export async function getStreamToken(userId: string, name: string): Promise<StreamTokenResponse> {
  const response = await fetch("/api/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ userId, name }),
  })

  if (!response.ok) {
    throw new Error("Failed to get Stream token")
  }

  return response.json()
}

/**
 * Creates a marketplace channel between buyer and seller
 */
export async function createMarketplaceChannel(
  listingId: string,
  buyerId: string,
  sellerId: string,
): Promise<{ channelId: string }> {
  const response = await fetch("/api/channels/marketplace", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ listingId, buyerId, sellerId }),
  })

  if (!response.ok) {
    throw new Error("Failed to create marketplace channel")
  }

  return response.json()
}

/**
 * Escalates a conversation to support
 */
export async function escalateToSupport(
  originalChannelId: string,
  customerId: string,
): Promise<{ supportChannelId: string; supportAgentId: string }> {
  const response = await fetch("/api/channels/escalate", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ originalChannelId, customerId }),
  })

  if (!response.ok) {
    throw new Error("Failed to escalate to support")
  }

  return response.json()
}
