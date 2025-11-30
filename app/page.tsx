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
            <button onClick={handleReset} className="flex items-center gap-3 hover:opacity-80 transition-opacity">
              <ShoppingBag className="h-8 w-8 text-primary" />
              <h1 className="text-3xl font-bold text-foreground">StreamBay</h1>
            </button>
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
              <Card className="hover:shadow-lg transition-shadow border-2 flex flex-col h-full">
                <CardHeader className="text-center pb-4">
                  <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <ShoppingBag className="h-8 w-8 text-primary" />
                  </div>
                  <CardTitle className="text-xl">Buyer</CardTitle>
                  <CardDescription>
                    Browse listings and chat with sellers. Escalate issues to support when needed.
                  </CardDescription>
                </CardHeader>
                <CardContent className="mt-auto">
                  <Button className="w-full" size="lg" onClick={() => setSelectedRole("buyer")}>
                    Continue as Buyer
                  </Button>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow border-2 flex flex-col h-full">
                <CardHeader className="text-center pb-4">
                  <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <Store className="h-8 w-8 text-primary" />
                  </div>
                  <CardTitle className="text-xl">Seller</CardTitle>
                  <CardDescription>Manage your listings and respond to buyer inquiries in real-time.</CardDescription>
                </CardHeader>
                <CardContent className="mt-auto">
                  <Button className="w-full" size="lg" onClick={() => setSelectedRole("seller")}>
                    Continue as Seller
                  </Button>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow border-2 flex flex-col h-full">
                <CardHeader className="text-center pb-4">
                  <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <Headphones className="h-8 w-8 text-primary" />
                  </div>
                  <CardTitle className="text-xl">Support Agent</CardTitle>
                  <CardDescription>Handle escalated conversations and help resolve customer issues.</CardDescription>
                  <p className="text-xs text-muted-foreground mt-2 italic">
                    Escalated conversations are managed via Zendesk
                  </p>
                </CardHeader>
                <CardContent className="mt-auto">
                  <Button className="w-full" size="lg" onClick={() => setSelectedRole("support")}>
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
                    Instant buyer-seller communication powered by Stream Chat SDK with typing indicators and message
                    history.
                  </p>
                </CardContent>
              </Card>
              <Card className="border">
                <CardHeader>
                  <CardTitle className="text-base">Zendesk Integration</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Seamless escalation to Zendesk support tickets with in-app chat interface and automatic ticket
                    management.
                  </p>
                </CardContent>
              </Card>
              <Card className="border">
                <CardHeader>
                  <CardTitle className="text-base">Full-stack Architecture</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Built with Next.js 16, TypeScript, Stream API, and Zendesk REST API with enterprise-grade
                    scalability.
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
