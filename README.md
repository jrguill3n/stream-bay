# StreamBay - Marketplace Chat Demo

A full-stack Next.js application showcasing **Stream Chat SDK** integration in a marketplace scenario. This demo highlights real-time messaging between buyers and sellers with intelligent support escalation to Zendesk.

## Features

- **Buyer Experience**: Browse listings and chat with sellers in real-time using Stream Chat, with seamless escalation to support
- **Seller Experience**: Respond to buyer inquiries instantly through Stream Chat SDK
- **Support Escalation**: Buyers can escalate conversations to Zendesk support while maintaining chat history
- **Support Agent Dashboard**: View and manage Zendesk tickets from escalated conversations
- **Real-time Messaging**: Powered by Stream Chat with typing indicators, read receipts, and message history
- **Role-based Views**: Switch between Buyer, Seller, and Support Agent perspectives

## Architecture

### Backend API Routes

#### Stream Chat APIs

- **POST /api/token**: Generates Stream Chat tokens for users
  - Input: `{ userId, name }`
  - Output: `{ apiKey, token, user }`
  - Authenticates users and provides access to Stream Chat channels
  
- **POST /api/channels/marketplace**: Creates marketplace channels between buyers and sellers
  - Input: `{ listingId, buyerId, sellerId }`
  - Output: `{ channelId }`
  - Channel ID pattern: `listing-{listingId}-{buyerId}-{sellerId}`
  - Automatically adds both buyer and seller as channel members

#### Zendesk Integration APIs

- **GET /api/zendesk/messages**: Fetches comments from a Zendesk ticket
  - Query: `?ticketId=X`
  - Returns ticket comments with author information for in-app display

- **POST /api/zendesk/messages**: Adds customer message to Zendesk ticket
  - Input: `{ ticketId, message, customerName }`
  - Prefixes messages with customer name for agent context

- **GET /api/zendesk/tickets**: Lists open Zendesk support tickets
  - Returns tickets filtered by status with subject, priority, and metadata

### Frontend Components

- **app/page.tsx**: Main entry point with role selection and feature showcase
- **components/buyer-view.tsx**: Buyer interface with listing browsing, Stream Chat, and Zendesk escalation
- **components/seller-view.tsx**: Seller interface for managing inquiries via Stream Chat
- **components/support-view.tsx**: Support agent dashboard displaying Zendesk tickets
- **components/chat-interface.tsx**: Reusable Stream Chat component with custom UI
- **components/zendesk-chat-interface.tsx**: In-app Zendesk ticket chat interface
- **components/ui/**: shadcn/ui components for modern, accessible design

### Tech Stack

- **Next.js 16** (App Router) - Modern React framework with server components
- **TypeScript** - Type-safe development
- **Stream Chat SDK** (stream-chat) - Enterprise-grade real-time messaging
- **Zendesk API** - Customer support ticket management
- **Tailwind CSS v4** - Utility-first styling
- **shadcn/ui** - Beautiful, accessible component library

## Stream Chat Integration Highlights

This demo showcases production-ready Stream Chat SDK integration:

1. **Token Generation**: Secure server-side token creation for user authentication
2. **Channel Management**: Dynamic channel creation with custom metadata for marketplace context
3. **Real-time Updates**: Instant message delivery with typing indicators and presence
4. **Message History**: Full conversation persistence and retrieval
5. **Seamless Escalation**: Stream Chat conversations can be escalated to Zendesk while maintaining context
6. **Scalable Architecture**: Ready for multi-user, multi-channel scenarios

## Setup Instructions

1. **Stream Chat Setup**:
   - Create a Stream Chat account at [getstream.io](https://getstream.io)
   - Get your API credentials from the dashboard
   - Add environment variables:
     - `STREAM_API_KEY`: Your Stream Chat API key
     - `STREAM_API_SECRET`: Your Stream Chat API secret

2. **Zendesk Setup** (Optional for support escalation):
   - Add environment variables:
     - `ZENDESK_SUBDOMAIN`: Your Zendesk subdomain
     - `ZENDESK_EMAIL`: Support agent email
     - `ZENDESK_API_TOKEN`: Zendesk API token

3. **Run the application**:
   \`\`\`bash
   npm install
   npm run dev
   \`\`\`

4. **Try the demo**:
   - Select a role (Buyer, Seller, or Support Agent)
   - Experience real-time messaging powered by Stream Chat
   - Test support escalation flow to Zendesk

## Learn More

- [Stream Chat Documentation](https://getstream.io/chat/docs/)
- [Stream Chat React SDK](https://getstream.io/chat/docs/sdk/react/)
- [Next.js Documentation](https://nextjs.org/docs)
