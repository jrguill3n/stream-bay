"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import BuyerView from "@/components/buyer-view"
import SellerView from "@/components/seller-view"
import SupportView from "@/components/support-view"
import { ShoppingBag, Store, Headphones } from "lucide-react"

type Role = "buyer" | "seller" | "support" | null

export default function Home() {
  const [selectedRole, setSelectedRole] = useState<Role>(null)

  const handleReset = () => {
    setSelectedRole(null)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <header className="bg-white border-b border-border shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <ShoppingBag className="h-8 w-8 text-primary" />
              <h1 className="text-3xl font-bold text-foreground">StreamBay</h1>
            </div>
            {selectedRole && (
              <Button variant="outline" onClick={handleReset} size="sm">
                Change Role
              </Button>
            )}
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {!selectedRole ? (
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-foreground mb-3">Marketplace Chat Demo</h2>
              <p className="text-lg text-muted-foreground">Experience real-time communication powered by Stream Chat</p>
            </div>

            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <Card
                className="cursor-pointer hover:shadow-lg transition-shadow border-2"
                onClick={() => setSelectedRole("buyer")}
              >
                <CardHeader className="text-center pb-4">
                  <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <ShoppingBag className="h-8 w-8 text-primary" />
                  </div>
                  <CardTitle className="text-xl">Buyer</CardTitle>
                  <CardDescription>
                    Browse listings and chat with sellers. Escalate issues to support when needed.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full" size="lg">
                    Continue as Buyer
                  </Button>
                </CardContent>
              </Card>

              <Card
                className="cursor-pointer hover:shadow-lg transition-shadow border-2"
                onClick={() => setSelectedRole("seller")}
              >
                <CardHeader className="text-center pb-4">
                  <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <Store className="h-8 w-8 text-primary" />
                  </div>
                  <CardTitle className="text-xl">Seller</CardTitle>
                  <CardDescription>Manage your listings and respond to buyer inquiries in real-time.</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full" size="lg">
                    Continue as Seller
                  </Button>
                </CardContent>
              </Card>

              <Card
                className="cursor-pointer hover:shadow-lg transition-shadow border-2"
                onClick={() => setSelectedRole("support")}
              >
                <CardHeader className="text-center pb-4">
                  <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <Headphones className="h-8 w-8 text-primary" />
                  </div>
                  <CardTitle className="text-xl">Support Agent</CardTitle>
                  <CardDescription>Handle escalated conversations and help resolve customer issues.</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full" size="lg">
                    Continue as Support
                  </Button>
                </CardContent>
              </Card>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <Card className="border">
                <CardHeader>
                  <CardTitle className="text-base">Real-time Messaging</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Powered by Stream Chat SDK for instant communication between all parties.
                  </p>
                </CardContent>
              </Card>
              <Card className="border">
                <CardHeader>
                  <CardTitle className="text-base">Smart Escalation</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Buyers can seamlessly escalate conversations to support agents when needed.
                  </p>
                </CardContent>
              </Card>
              <Card className="border">
                <CardHeader>
                  <CardTitle className="text-base">Secure & Scalable</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Built with Next.js and enterprise-grade chat infrastructure.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        ) : (
          <div>
            {selectedRole === "buyer" && <BuyerView />}
            {selectedRole === "seller" && <SellerView />}
            {selectedRole === "support" && <SupportView />}
          </div>
        )}
      </main>
    </div>
  )
}
