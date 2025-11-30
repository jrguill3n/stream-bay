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

## Learn More

- [Stream Chat Documentation](https://getstream.io/chat/docs/)
- [Stream Chat React SDK](https://getstream.io/chat/docs/sdk/react/)
- [Next.js Documentation](https://nextjs.org/docs)
