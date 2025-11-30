# StreamBay - Marketplace Chat Demo with Zendesk Integration

A full-stack Next.js application demonstrating Stream Chat and Zendesk integration in a marketplace scenario. This demo showcases real-time messaging between buyers and sellers, with seamless support escalation to Zendesk.

## Features

- **Buyer Experience**: Browse listings, chat with sellers, and escalate to support via Zendesk
- **Seller Experience**: Respond to buyer inquiries in real-time through Stream Chat
- **Support Escalation**: Integrated Zendesk ticketing system for handling customer support
- **Support Agent Dashboard**: View and manage open Zendesk tickets directly in the app
- **Real-time Messaging**: Powered by Stream Chat with typing indicators, read receipts, and message history
- **Role-based Views**: Switch between Buyer, Seller, and Support Agent perspectives

## Architecture

### Backend API Routes

#### Stream Chat APIs

- **POST /api/token**: Generates Stream Chat tokens for users
  - Input: `{ userId, name }`
  - Output: `{ apiKey, token, user }`
  
- **POST /api/channels/marketplace**: Creates marketplace channels between buyers and sellers
  - Input: `{ listingId, buyerId, sellerId }`
  - Output: `{ channelId }`
  - Channel ID pattern: `listing-{listingId}-{buyerId}-{sellerId}`

#### Zendesk APIs

- **POST /api/zendesk-escalate**: Creates or retrieves Zendesk tickets for support escalation
  - Input: `{ listingId, buyerId, sellerId, description }`
  - Output: `{ ticketId, ticketUrl, isExisting }`
  - Uses tags to prevent duplicate tickets per listing/buyer/seller combination
  
- **GET /api/zendesk/messages?ticketId={id}**: Fetches messages from a Zendesk ticket
  - Returns formatted conversation history with proper author identification
  - Distinguishes between customer and support agent messages
  
- **POST /api/zendesk/messages**: Sends a message to a Zendesk ticket
  - Input: `{ ticketId, message, authorName }`
  - Prefixes customer messages with author name for support agent context
  - Returns the new comment ID for tracking
  
- **GET /api/zendesk/tickets**: Lists all open Zendesk tickets
  - Returns tickets with status "new", "open", or "pending"
  - Includes ticket details: subject, description, status, priority, created_at

### Zendesk Integration

This demo includes a full production-ready Zendesk integration:

**Environment Variables Required:**
\`\`\`
ZENDESK_SUBDOMAIN=your-subdomain
ZENDESK_EMAIL=your-admin-email@example.com
ZENDESK_API_TOKEN=your-api-token
\`\`\`

**How It Works:**

1. **Ticket Creation**: When a buyer clicks "Need Help?", the system:
   - Checks for existing tickets using tags (listing_X, buyer_X, seller_X)
   - Creates a new ticket if none exists
   - Returns the existing ticket if one is found
   - Prevents duplicate tickets for the same conversation

2. **In-App Chat Interface**: Buyers interact with support through a custom chat UI:
   - Fetches message history from Zendesk
   - Displays customer messages on the right, support agent messages on the left
   - Auto-polls every 10 seconds for new support responses
   - Sends messages directly to the Zendesk ticket

3. **Support Agent Dashboard**: Support agents can:
   - View all open tickets in a clean list interface
   - See ticket status, priority, and creation date
   - Click any ticket to open it in the Zendesk agent interface
   - Handle multiple escalations efficiently

4. **Context Preservation**: Every ticket includes:
   - Listing information
   - Customer details (buyer and seller IDs)
   - Original Stream Chat channel reference
   - Structured tags for easy filtering and deduplication

### Frontend Components

- **app/page.tsx**: Main entry point with role selection
- **components/buyer-view.tsx**: Buyer interface with listing, Stream chat, and Zendesk escalation
- **components/seller-view.tsx**: Seller interface for responding to inquiries via Stream
- **components/support-view.tsx**: Support agent dashboard showing open Zendesk tickets
- **components/zendesk-chat-interface.tsx**: Custom Zendesk chat UI for buyers
- **components/chat-interface.tsx**: Reusable Stream Chat component
- **components/ui/**: shadcn/ui components

### Tech Stack

- Next.js 16 (App Router)
- TypeScript
- Stream Chat (stream-chat SDK)
- Zendesk API (REST API for tickets and comments)
- Tailwind CSS v4
- shadcn/ui components

## Setup Instructions

1. **Stream Chat Setup**:
   - Create a Stream Chat account at [getstream.io](https://getstream.io)
   - Add `STREAM_API_KEY` and `STREAM_API_SECRET` to environment variables

2. **Zendesk Setup**:
   - Create a Zendesk account at [zendesk.com](https://zendesk.com)
   - Enable API access in Admin → Channels → API
   - Generate an API token
   - Add environment variables:
     - `ZENDESK_SUBDOMAIN`: Your subdomain (e.g., "your-company" from your-company.zendesk.com)
     - `ZENDESK_EMAIL`: Your Zendesk admin email
     - `ZENDESK_API_TOKEN`: Your generated API token

3. **Run the application**:
   \`\`\`bash
   npm install
   npm run dev
   \`\`\`

## Learn More

- [Stream Chat Documentation](https://getstream.io/chat/docs/)
- [Stream Chat React SDK](https://getstream.io/chat/docs/sdk/react/)
- [Zendesk API Documentation](https://developer.zendesk.com/api-reference/)
- [Next.js Documentation](https://nextjs.org/docs)
