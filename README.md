# StreamBay - Marketplace Chat Demo

A full-stack Next.js application demonstrating Stream Chat integration in a marketplace scenario. This demo showcases real-time messaging between buyers and sellers, with support escalation capabilities.

## Features

- **Buyer Experience**: Browse listings and chat with sellers about products
- **Seller Experience**: Respond to buyer inquiries in real-time
- **Support Escalation**: Buyers can escalate conversations to support agents
- **Real-time Messaging**: Powered by Stream Chat with full typing indicators, read receipts, and message history
- **Role-based Views**: Switch between Buyer, Seller, and Support Agent perspectives

## Architecture

### Backend API Routes

- **POST /api/token**: Generates Stream Chat tokens for users
  - Input: `{ userId, name }`
  - Output: `{ apiKey, token, user }`
  
- **POST /api/channels/marketplace**: Creates marketplace channels between buyers and sellers
  - Input: `{ listingId, buyerId, sellerId }`
  - Output: `{ channelId }`
  - Channel ID pattern: `listing-{listingId}-{buyerId}-{sellerId}`

- **POST /api/channels/escalate**: Escalates conversations to support
  - Input: `{ originalChannelId, customerId }`
  - Output: `{ supportChannelId, supportAgentId }`
  - Channel ID pattern: `support-{originalChannelId}`

### Zendesk Integration (Optional)

While this demo doesn't include a live Zendesk integration, here's how you could add it in a production environment:

**When to Integrate Zendesk:**
- You want to track support requests in a centralized ticketing system
- Support agents use Zendesk as their primary workflow tool
- You need advanced features like SLA tracking, ticket routing, and analytics

**How It Would Work:**
1. **Ticket Creation**: When a buyer clicks "Need Help?", the escalate API would call Zendesk's API to create a ticket
2. **Context Preservation**: Include conversation history, customer info, and listing details in the ticket
3. **Reference Linking**: Store the Stream channel ID in Zendesk custom fields for easy reference
4. **Two-Way Sync**: Use Zendesk webhooks to sync agent responses back to Stream Chat
5. **Status Updates**: Update the Stream channel when tickets are resolved or closed

**Implementation Example:**
\`\`\`typescript
// In /api/channels/escalate/route.ts
const zendeskResponse = await fetch(`https://${subdomain}.zendesk.com/api/v2/tickets.json`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Basic ${Buffer.from(email + '/token:' + token).toString('base64')}`
  },
  body: JSON.stringify({
    ticket: {
      subject: `Support Request - ${listingTitle}`,
      comment: { body: conversationHistory },
      requester: { email: customerEmail, name: customerId },
      tags: ['streambay', 'marketplace', 'chat-escalation'],
      custom_fields: [{ id: 123456, value: channelId }]
    }
  })
})
\`\`\`

### Frontend Components

- **app/page.tsx**: Main entry point with role selection
- **components/buyer-view.tsx**: Buyer interface with listing display and chat
- **components/seller-view.tsx**: Seller interface for responding to inquiries
- **components/support-view.tsx**: Support agent interface for escalated conversations
- **components/chat-interface.tsx**: Reusable chat component
- **components/ui/**: shadcn/ui components

### Tech Stack

- Next.js 16 (App Router)
- TypeScript
- Stream Chat (stream-chat SDK)
- Tailwind CSS v4
- shadcn/ui components

## Setup Instructions

### Prerequisites

- Node.js 18+ installed
- A Stream Chat account (free at [getstream.io](https://getstream.io))

### 1. Get Stream Chat Credentials

1. Sign up for a free account at [getstream.io](https://getstream.io)
2. Create a new app in the Stream Dashboard
3. Copy your API Key and API Secret from the app dashboard

### 2. Configure Environment Variables

Create a `.env.local` file in the root directory:

\`\`\`bash
# Required: Stream Chat credentials
STREAM_API_KEY=your_api_key_here
STREAM_API_SECRET=your_api_secret_here
\`\`\`

**Important**: Stream credentials should ONLY be used on the server side. The API routes handle token generation securely.

### 3. Install Dependencies

\`\`\`bash
npm install
# or
pnpm install
# or
yarn install
\`\`\`

### 4. Run the Development Server

\`\`\`bash
npm run dev
# or
pnpm dev
# or
yarn dev
\`\`\`

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Demo Workflow

### Testing the Full Flow

1. **Start as Buyer**:
   - Select "Buyer" role
   - Click "Contact Seller" to initiate a conversation
   - Send messages to the seller
   - Click "Need Help?" to escalate to support

2. **Open Seller View** (in a new tab/window):
   - Select "Seller" role
   - Automatically joins the marketplace channel
   - Respond to buyer messages in real-time

3. **Open Support View** (in a third tab/window):
   - Select "Support Agent" role
   - Copy the support channel ID from the buyer view (e.g., `support-listing-1234-buyer_1-seller_1`)
   - Paste into the channel ID input and click "Join Channel"
   - Assist the customer with their escalated inquiry

### Demo Data

The app uses fixed demo data for simplicity:
- Listing ID: `1234`
- Listing: "Moog Subsequent 25 Synthesizer - $799"
- Buyer ID: `buyer_1`
- Seller ID: `seller_1`
- Support Agent ID: `support_1`

## Interview Talking Points

When walking through this demo in an interview, highlight:

1. **Server-Side Security**: API keys and secrets are kept on the server; clients only receive time-limited tokens
2. **Channel Management**: Consistent channel ID patterns enable predictable channel discovery
3. **Escalation Flow**: Demonstrates creating new channels with context from previous conversations
4. **Extensibility**: Architecture supports adding third-party integrations like Zendesk, Intercom, or custom ticketing systems
5. **Real-time Sync**: Multiple users see messages instantly without polling
6. **Stream Chat Features**: Built-in typing indicators, read receipts, message history, and user presence
7. **Type Safety**: Full TypeScript implementation with proper type definitions
8. **Error Handling**: Graceful error states with helpful user feedback
9. **Scalability**: Pattern can extend to multiple listings, sellers, and support agents
10. **Clean UI**: Modern eBay-inspired design with responsive layout and clean marketplace aesthetics

## Project Structure

\`\`\`
streambay/
├── app/
│   ├── api/
│   │   ├── token/route.ts           # Token generation endpoint
│   │   └── channels/
│   │       ├── marketplace/route.ts # Marketplace channel creation
│   │       └── escalate/route.ts    # Support escalation
│   ├── page.tsx                      # Main role selection page
│   ├── layout.tsx                    # Root layout
│   └── globals.css                   # Global styles with eBay theme
├── components/
│   ├── buyer-view.tsx                # Buyer interface
│   ├── seller-view.tsx               # Seller interface
│   ├── support-view.tsx              # Support agent interface
│   ├── chat-interface.tsx            # Reusable chat component
│   └── ui/                           # shadcn/ui components
├── lib/
│   └── stream-client.ts              # Stream Chat utility functions
└── README.md
\`\`\`

## Extending the Demo

Ideas for enhancement:
- Add multiple listings with dynamic data
- Implement user authentication
- Add file/image sharing in chat
- Create a support dashboard showing all active tickets
- Integrate with Zendesk, Intercom, or custom ticketing system
- Implement notifications for new messages
- Add typing indicators and user online status
- Create analytics dashboard for message volume and response times

## Troubleshooting

**Error: "Stream Chat credentials not configured"**
- Ensure `.env.local` file exists with valid `STREAM_API_KEY` and `STREAM_API_SECRET`

**Error: "Failed to join channel"**
- For seller/support views, ensure the buyer has created the channel first
- Verify the channel ID is correct

**Messages not appearing in real-time**
- Check browser console for connection errors
- Verify all users are connected to the same channel ID

## Learn More

- [Stream Chat Documentation](https://getstream.io/chat/docs/)
- [Stream Chat React SDK](https://getstream.io/chat/docs/sdk/react/)
- [Next.js Documentation](https://nextjs.org/docs)
