# StreamBay - Marketplace Chat Demo

A full-stack Next.js application showcasing **Stream Chat SDK** integration in a marketplace scenario with **Zendesk support escalation**. This demo highlights real-time messaging between buyers and sellers with intelligent support ticket management.

## Features

- **Buyer Experience**: Browse listings and chat with sellers in real-time using Stream Chat, with seamless escalation to Zendesk support
- **Seller Experience**: Respond to buyer inquiries instantly through Stream Chat SDK
- **Support Escalation**: Buyers can escalate conversations to Zendesk, creating support tickets with full context from the Stream Chat history
- **In-App Support Chat**: Continue support conversations within the app using Zendesk's ticketing system without leaving the interface
- **Support Agent Dashboard**: View and manage all Zendesk tickets from escalated conversations with direct access to ticket details
- **Real-time Messaging**: Powered by Stream Chat with typing indicators, read receipts, and message history
- **Role-based Views**: Switch between Buyer, Seller, and Support Agent perspectives to experience the full workflow

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
  - Returns ticket comments with author information and timestamps
  - Used to display support conversations in-app

- **POST /api/zendesk/messages**: Adds customer message to Zendesk ticket
  - Input: `{ ticketId, message, customerName }`
  - Creates ticket comment prefixed with customer name for agent context
  - Returns new comment ID for tracking

- **GET /api/zendesk/tickets**: Lists open Zendesk support tickets
  - Returns all tickets with status "new", "open", or "pending"
  - Includes subject, priority, creation date, and ticket metadata
  - Used by support agent dashboard

### Support Escalation Flow

1. **Buyer initiates escalation**: Click "Need Help?" in the Stream Chat interface
2. **Ticket creation**: System creates Zendesk ticket with:
   - Subject: Customer escalation request
   - Description: Full Stream Chat conversation history
   - Tags: listing ID, buyer ID, seller ID for tracking
3. **In-app chat**: Buyer sees custom chat interface connected to Zendesk ticket
4. **Support response**: Agent responds in Zendesk, messages appear in buyer's interface
5. **Return to seller**: Buyer can close support chat and return to seller conversation

### Frontend Components

- **app/page.tsx**: Main entry point with role selection and feature showcase
- **components/buyer-view.tsx**: Buyer interface with listing browsing, Stream Chat, and Zendesk escalation
- **components/seller-view.tsx**: Seller interface for managing inquiries via Stream Chat
- **components/support-view.tsx**: Support agent dashboard displaying Zendesk tickets with status and priority
- **components/chat-interface.tsx**: Reusable Stream Chat component with custom UI and escalation button
- **components/zendesk-chat-interface.tsx**: In-app Zendesk ticket chat interface with message polling and send functionality
- **components/ui/**: shadcn/ui components for modern, accessible design

### Tech Stack

- **Next.js 16** (App Router) - Modern React framework with server components and API routes
- **TypeScript** - Type-safe development throughout the stack
- **Stream Chat SDK** (stream-chat) - Enterprise-grade real-time messaging with React components
- **Zendesk API** - Customer support ticket management and comment threading
- **Tailwind CSS v4** - Utility-first styling with custom design tokens
- **shadcn/ui** - Beautiful, accessible component library built on Radix UI

## Stream Chat Integration Highlights

This demo showcases production-ready Stream Chat SDK integration:

1. **Token Generation**: Secure server-side token creation for user authentication with Stream
2. **Channel Management**: Dynamic channel creation with custom metadata for marketplace context
3. **Real-time Updates**: Instant message delivery with typing indicators, online presence, and read receipts
4. **Message History**: Full conversation persistence and retrieval for context preservation
5. **Seamless Escalation**: Stream Chat conversations can be escalated to Zendesk with full chat history included
6. **Custom UI**: Tailored chat interface built on Stream's React SDK components
7. **Scalable Architecture**: Ready for multi-user, multi-channel production scenarios

## Zendesk Integration Highlights

The Zendesk integration demonstrates enterprise support capabilities:

1. **Automatic Ticket Creation**: Creates tickets from Stream Chat escalations with full conversation context
2. **In-App Support Chat**: Custom interface for Zendesk ticket conversations without leaving the app
3. **Real-time Polling**: Fetches new support messages automatically for seamless experience
4. **Agent Dashboard**: Support agents view all open tickets with priority and status filtering
5. **Bidirectional Communication**: Messages flow between customer app interface and Zendesk agent interface
6. **Ticket Management**: Agents can review and respond to tickets in Zendesk's native interface

## Setup Instructions

1. **Stream Chat Setup**:
   - Create a Stream Chat account at [getstream.io](https://getstream.io)
   - Get your API credentials from the dashboard
   - Add environment variables:
     - `STREAM_API_KEY`: Your Stream Chat API key
     - `STREAM_API_SECRET`: Your Stream Chat API secret

2. **Zendesk Setup**:
   - Set up a Zendesk account at [zendesk.com](https://www.zendesk.com)
   - Create an API token in Admin Center > Apps and integrations > APIs > Zendesk API
   - Add environment variables:
     - `ZENDESK_SUBDOMAIN`: Your Zendesk subdomain (e.g., "yourcompany" from yourcompany.zendesk.com)
     - `ZENDESK_EMAIL`: Support agent email address
     - `ZENDESK_API_TOKEN`: Your Zendesk API token

3. **Run the application**:
   \`\`\`bash
   npm install
   npm run dev
   \`\`\`

4. **Try the demo**:
   - Select "Buyer" role and browse a listing
   - Click "Start Chat" to initiate a Stream Chat conversation with the seller
   - Send messages and experience real-time communication
   - Click "Need Help?" to escalate to Zendesk support
   - Send support messages and see them appear in Zendesk
   - Switch to "Support Agent" role to view all escalated tickets
   - Click any ticket to open it in Zendesk for responses

## Environment Variables Required

\`\`\`env
# Stream Chat
STREAM_API_KEY=your_stream_api_key
STREAM_API_SECRET=your_stream_api_secret

# Zendesk
ZENDESK_SUBDOMAIN=your_subdomain
ZENDESK_EMAIL=agent@yourcompany.com
ZENDESK_API_TOKEN=your_zendesk_token
\`\`\`

## Learn More

- [Stream Chat Documentation](https://getstream.io/chat/docs/)
- [Stream Chat React SDK](https://getstream.io/chat/docs/sdk/react/)
- [Zendesk API Documentation](https://developer.zendesk.com/api-reference/)
- [Next.js Documentation](https://nextjs.org/docs)
