# StreamBay - Marketplace Chat Demo

A full-stack Next.js application showcasing Stream Chat SDK integration in a marketplace scenario. This demo highlights real-time messaging between buyers and sellers with support escalation capabilities.

## Features

- **Buyer Experience**: Browse listings and chat with sellers in real-time using Stream Chat
- **Seller Experience**: Respond to buyer inquiries instantly through Stream Chat SDK
- **Support Escalation**: Seamless escalation to support agents when buyers need help
- **Support Agent Dashboard**: Manage escalated conversations and customer inquiries
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

### Frontend Components

- **app/page.tsx**: Main entry point with role selection and feature showcase
- **components/buyer-view.tsx**: Buyer interface with listing browsing and real-time chat
- **components/seller-view.tsx**: Seller interface for managing inquiries via Stream Chat
- **components/support-view.tsx**: Support agent dashboard for handling escalations
- **components/chat-interface.tsx**: Reusable Stream Chat component with custom UI
- **components/ui/**: shadcn/ui components for modern, accessible design

### Tech Stack

- **Next.js 16** (App Router) - Modern React framework with server components
- **TypeScript** - Type-safe development
- **Stream Chat SDK** (stream-chat) - Enterprise-grade real-time messaging
- **Tailwind CSS v4** - Utility-first styling
- **shadcn/ui** - Beautiful, accessible component library

## Stream Chat Integration Highlights

This demo showcases production-ready Stream Chat SDK integration:

1. **Token Generation**: Secure server-side token creation for user authentication
2. **Channel Management**: Dynamic channel creation with custom metadata for marketplace context
3. **Real-time Updates**: Instant message delivery with typing indicators and presence
4. **Message History**: Full conversation persistence and retrieval
5. **Scalable Architecture**: Ready for multi-user, multi-channel scenarios

## Setup Instructions

1. **Stream Chat Setup**:
   - Create a Stream Chat account at [getstream.io](https://getstream.io)
   - Get your API credentials from the dashboard
   - Add environment variables:
     - `STREAM_API_KEY`: Your Stream Chat API key
     - `STREAM_API_SECRET`: Your Stream Chat API secret

2. **Run the application**:
   \`\`\`bash
   npm install
   npm run dev
   \`\`\`

3. **Try the demo**:
   - Select a role (Buyer, Seller, or Support Agent)
   - Experience real-time messaging powered by Stream Chat
   - Test support escalation flow

## Learn More

- [Stream Chat Documentation](https://getstream.io/chat/docs/)
- [Stream Chat React SDK](https://getstream.io/chat/docs/sdk/react/)
- [Next.js Documentation](https://nextjs.org/docs)
