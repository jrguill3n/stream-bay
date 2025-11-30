"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChatInterface } from "@/components/chat-interface"
import { Badge } from "@/components/ui/badge"
import { Store, MessageSquare } from "lucide-react"

const SELLER_ID = "seller_1"
const LISTING_ID = "1234"
const BUYER_ID = "buyer_1"

export default function SellerView() {
  const [channelId] = useState(`listing-${LISTING_ID}-${BUYER_ID}-${SELLER_ID}`)

  return (
    <div className="max-w-5xl mx-auto">
      <Card className="mb-6 shadow-md">
        <CardHeader className="border-b bg-accent/50">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Store className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1">
              <CardTitle className="text-2xl">Seller Dashboard</CardTitle>
              <CardDescription className="text-base mt-1">
                Manage your listings and respond to buyer inquiries
              </CardDescription>
            </div>
            <Badge variant="secondary" className="text-sm px-3 py-1">
              <MessageSquare className="h-3 w-3 mr-1" />1 Active Chat
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-primary">1</p>
              <p className="text-sm text-muted-foreground">Active Listing</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-primary">1</p>
              <p className="text-sm text-muted-foreground">Message</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-primary">#{LISTING_ID}</p>
              <p className="text-sm text-muted-foreground">Listing ID</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <ChatInterface userId={SELLER_ID} userName="Seller User" channelId={channelId} title="Chat with Buyer" />
    </div>
  )
}
