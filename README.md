# StreamBay - Marketplace Chat Demo

A full-stack Next.js application showcasing **Stream Chat SDK** integration in a marketplace scenario with **Zendesk support escalation**. This demo highlights real-time messaging between buyers and sellers with intelligent support ticket management using a unified Stream channel for both customer-seller and customer-support conversations.

## Features

- **Unified Stream Chat Experience**: All conversations (buyer-seller and buyer-support) happen in a single Stream Chat channel with conditional UI rendering
- **Buyer Experience**: Browse listings, chat with sellers in real-time, and seamlessly escalate to support without leaving the conversation
- **Seller Experience**: Respond to buyer inquiries instantly through Stream Chat SDK with real-time updates
- **Intelligent Support Escalation**: When buyers click "Need Help?", a Zendesk ticket is automatically created with full Stream Chat history
- **Webhook-Driven Support Messages**: Support agent replies from Zendesk are automatically posted back into the Stream channel via webhooks
- **Support Agent Dashboard**: View and manage all Zendesk tickets from escalated conversations with direct access to ticket details
- **Real-time Messaging**: Powered by Stream Chat with typing indicators, read receipts, message history, and custom data storage
- **Role-based Views**: Switch between Buyer, Seller, and Support Agent perspectives to experience the full workflow

## Support Escalation Flow

1. **Buyer initiates escalation**: Clicks "Need Help?" button in the Stream Chat interface during a conversation with a seller
2. **Ticket creation with context**: System creates a Zendesk ticket containing the full Stream Chat conversation history, tagged with `listingId`, `buyerId`, and `sellerId` for tracking
3. **Channel metadata update**: The Zendesk `ticketId` is stored as custom data on the Stream channel using `channel.updatePartial()`
4. **UI switches automatically**: Stream SDK detects the channel update event and switches from buyer-seller UI to support UI mode with orange-highlighted support messages
5. **Support agent responds**: Agent replies in Zendesk, triggering a webhook to `/api/zendesk/webhook` which posts the comment as a Stream message from the support user
6. **Real-time delivery**: The support message appears instantly in the buyer's Stream Chat interface without polling or page refresh

## Technical Architecture

### Stream Chat Role

Stream Chat serves as the **single source of truth** for all conversation data:

- **Channel Management**: Creates deterministic channels with ID pattern `marketplace-{listingId}-{buyerId}` containing custom data (`listingId`, `buyerId`, `sellerId`, `ticketId`)
- **Message Delivery**: Handles real-time message transport for buyer-seller conversations and support messages from Zendesk webhooks
- **State Synchronization**: Uses channel update events to trigger UI transitions when escalation occurs
- **Message History**: Provides full conversation context for Zendesk ticket creation and user reference

### Zendesk Role

Zendesk serves as the **agent workflow and ticketing system**:

- **Ticket Management**: Creates and tracks support tickets with conversation context from Stream Chat
- **Agent Interface**: Provides familiar support tools for agents to respond to escalated conversations
- **Webhook Notifications**: Sends HTTP POST requests to `/api/zendesk/webhook` when agents add public comments
- **Search and Organization**: Uses tags to link tickets to marketplace context (listing, buyer, seller)

### Next.js API Routes

Next.js API routes act as the **integration layer** between Stream and Zendesk:

- **Token Generation** (`/api/token`): Creates Stream Chat authentication tokens for users
- **Channel Creation** (`/api/channels/marketplace`): Initializes Stream channels with custom marketplace metadata
- **Escalation Handler** (`/api/zendesk/escalate`): Fetches Stream chat history, creates Zendesk ticket, updates Stream channel with `ticketId`, optionally adds support agent to channel
- **Webhook Receiver** (`/api/zendesk/webhook`): Validates webhook secret, queries Stream channels by `ticketId`, posts support agent messages back into Stream channel
- **Ticket Listing** (`/api/zendesk/tickets`): Fetches open tickets for support agent dashboard

## Architecture

### Backend API Routes

#### Stream Chat APIs

- **POST /api/token**: Generates Stream Chat tokens for users
  - Input: `{ userId, name }`
  - Output: `{ apiKey, token, user }`
  - Authenticates users and provides access to Stream Chat channels
  
- **POST /api/channels/marketplace**: Creates marketplace channels between buyers and sellers
  - Input: `{ listingId, buyerId, sellerId }`
  - Output: `{ channelId, channelData }`
  - Channel ID pattern: `marketplace-{listingId}-{buyerId}`
  - Custom data: `listingId`, `buyerId`, `sellerId`, `ticketId` (initially null)
  - Automatically adds both buyer and seller as channel members

#### Zendesk Integration APIs

- **POST /api/zendesk/escalate**: Creates Zendesk ticket and updates Stream channel
  - Input: `{ channelId }`
  - Fetches last 50 messages from Stream channel
  - Searches for existing tickets using tags to avoid duplicates
  - Creates Zendesk ticket with formatted chat transcript
  - Updates Stream channel with `ticketId` using `channel.updatePartial()`
  - Optionally adds support agent to Stream channel if `SUPPORT_AGENT_ID` is set
  - Returns `{ ticketId, ticketUrl, escalated: true }`

- **POST /api/zendesk/webhook**: Receives Zendesk comment webhooks
  - Input: `{ ticket_id, comment_body, author_name }`
  - Validates `x-zendesk-webhook-secret` header for security
  - Queries Stream channels where `ticketId` matches incoming ticket
  - Posts support agent message to Stream channel as `user_id: "support"`
  - Always returns 200 OK to acknowledge receipt to Zendesk

- **GET /api/zendesk/tickets**: Lists open Zendesk support tickets
  - Returns all tickets with status "new", "open", or "pending"
  - Includes subject, priority, creation date, and ticket metadata
  - Used by support agent dashboard

### Frontend Components

- **app/page.tsx**: Main entry point with role selection and feature showcase
- **components/buyer-view.tsx**: Buyer interface wrapper that manages Stream Chat client and channel loading
- **components/stream-chat-wrapper.tsx**: Loads Stream channel, watches for `ticketId` changes, conditionally renders buyer-seller or support UI
- **components/buyer-seller-chat.tsx**: Stream Chat UI for buyer-seller conversations with "Need Help?" escalation button
- **components/support-chat.tsx**: Stream Chat UI for support mode with orange-highlighted support agent messages
- **components/seller-view.tsx**: Seller interface for managing inquiries via Stream Chat
- **components/support-view.tsx**: Support agent dashboard displaying Zendesk tickets with status and priority
- **components/ui/**: shadcn/ui components for modern, accessible design

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
   - Set up a webhook in Zendesk to send notifications to `/api/zendesk/webhook` with the secret header `x-zendesk-webhook-secret`

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
ZENDESK_WEBHOOK_SECRET=your_webhook_secret
\`\`\`

## Learn More

- [Stream Chat Documentation](https://getstream.io/chat/docs/)
- [Stream Chat React SDK](https://getstream.io/chat/docs/sdk/react/)
- [Zendesk API Documentation](https://developer.zendesk.com/api-reference/)
- [Next.js Documentation](https://nextjs.org/docs)
