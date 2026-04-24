# Anubis Project - Full System Documentation

## Document Map

This document is organized in the following order to improve readability and traceability:

1. System overview and scope
2. Role-based feature catalog
3. Frontend structure and routing
4. Admin dashboard details
5. Backend structure, modules, and security
6. Backend implementation (backend-first view)
7. AI features and translation/analysis paths
8. Feature-level integration flows (screen -> API -> backend -> DB/AI -> UI)
9. End-to-end user journeys
10. Cross-system relationships
11. Known integration gaps and implementation notes

## 1. System Overview

### 1.1 What the App Does

Anubis (Revive Egypt) is a tourism and culture platform focused on Egyptian museums, artifacts, and visitor engagement.
The platform provides:

- Museum and artifact discovery
- Social community features (posts, comments, likes, friends)
- Direct chat messaging with real-time updates
- Event browsing
- Volunteering and donation campaigns
- AI assistant chat
- AI artifact image analysis with metadata and restoration previews
- Admin operations for system content and moderation

### 1.2 Target Users

- Visitor
  - Browses museums, artifacts, events, posts, guides
  - Uses AI scan and AI assistant
  - Sends messages, friend requests, comments, likes
  - Signs up for volunteering and interacts with donation campaigns
- Tour Guide
  - Has all visitor-level features
  - Can maintain a guide profile and appear in guide listings
- Admin
  - Manages users and system content
  - Performs moderation (reviews/posts)
  - Manages museums, artifacts, events, campaigns, products, volunteering opportunities, guide profiles
  - Uses admin analytics dashboard cards

### 1.3 Main System Parts

- Mobile App (Expo React Native with Expo Router)
  - Folder: frontend/app
- Backend API (Node.js + Express + MongoDB)
  - Folder: backend/src
- AI Services
  - Node AI proxy and assistant: backend/src/modules/ai, backend/src/modules/assistant
  - Python FastAPI inference service: AI_Enhancement/app
- Admin Dashboard
  - Implemented as admin routes inside Expo app (works on web/desktop responsive layout)
  - Folder: frontend/app/admin

## 2. Role-Based Feature Catalog

This section groups all product capabilities by primary actor.

### 2.1 Visitor Features

- Authentication
  - Register and login
- Museum browsing
  - Museum lists and details
- Artifact browsing
  - Artifact lists and details
- Events
  - Browse events list/details
- Reviews
  - Read reviews
  - Submit review (auth)
- Community/social feed
  - Create posts
  - Like posts
  - Comment on posts
  - View user profiles
- Social graph
  - Send/accept/reject friend requests
  - View friend status
- Messaging
  - View conversations
  - Send/receive direct messages
  - Real-time updates via Socket.IO
- AI assistant
  - Chat with multilingual assistant
- AI image scan
  - Upload/capture image
  - Get recognition + metadata + restoration availability
- Journey and local UX features
  - Save scan images locally
  - Add scan results to local journey list
- Marketplace UI
  - Browse products and local cart/checkout UI (currently local-only flow)
- Ticketing UI
  - Ticket browsing and checkout screens (currently UI/local flow)
- Volunteering and campaigns
  - Browse volunteering opportunities
  - Sign up to opportunities
  - View donation campaigns

### 2.2 Tour Guide Features

- All visitor features
- Tour guide profile lifecycle
  - Create tour guide profile
  - Update profile fields (bio, specialties, languages, pricing, availability)
  - Visibility in public guide listing

### 2.3 Admin Dashboard Features

- User management
  - List users
  - Update user role
  - Deactivate users
- Museum management
  - Create, update, soft-delete museums
- Artifact management
  - Create, update, soft-delete artifacts
- Event management
  - Create, update, soft-delete events
- Donation/campaign control
  - Create, update, deactivate campaigns
- Review moderation
  - List reviews in admin endpoint
  - Delete reviews
- Post moderation
  - Delete posts
- Volunteering management
  - Create, update, delete opportunities
  - View applicants and update application status
- Marketplace management
  - Create, update, delete products
- Tour guide management
  - Create, update, delete guide profiles
- Analytics and reporting
  - KPI summary cards (users, museums, artifacts, volunteer applications)
  - Bar charts for trend/comparison views (for example users growth, artifacts per museum, event activity, volunteering activity)
  - Filterable history views for operations and records
  - CSV export for history/report tables

## 3. Frontend Structure

This section documents the frontend surface area and how navigation and API integration are organized.

### 3.1 Mobile Screens by Feature Group

#### Auth

- /auth/login
- /auth/signup
- /auth/register
- /auth/forgot-password
- /auth/reset-password

#### Core Tabs

- /(tabs)/home
- /(tabs)/explore
- /(tabs)/scan
- /(tabs)/scan-result (hidden tab route)
- /(tabs)/events
- /(tabs)/community

#### Museums and Artifacts

- /museum-profile
- /artifacts/index
- /artifacts/artifactDetailsScreen

#### Events

- /events/eventsList
- /eventScreen/eventScreen

#### Social and Messaging

- /messagesList/index
- /messagesList/chatScreen
- /user/[id]
- /notifications/index

#### AI

- /ai/chatbot
- /(tabs)/scan
- /(tabs)/scan-result

#### Reviews

- /reviews
- /write-review
- /review-success

#### Tickets

- /tickets/index
- /tickets/checkout
- /tickets/qrcode
- /tickets/after-payment

#### Marketplace

- /marketplace/index
- /marketplace/cart
- /marketplace/checkout

#### Volunteering and Donations UI

- /volunteering/index

#### Profile and Utility

- /profile/profileScreen
- /settings/settings
- /favorites
- /journey
- /map/index
- /NearbyPlaces/index
- /menu/menuScreen
- /faq/FAQ-screens
- /payment/paymentScreen
- /onboarding/one
- /onboarding/two
- /onboarding/three

#### Admin Area

- /admin
- /admin/users
- /admin/museums
- /admin/artifacts
- /admin/events
- /admin/posts
- /admin/donations
- /admin/volunteering
- /admin/marketplace
- /admin/tour-guides
- /admin/reviews

### 3.2 Navigation Flow

- Root stack
  - Defined in frontend/app/\_layout.jsx
  - Global screen animation and i18n setup
- Tab navigator
  - Defined in frontend/app/(tabs)/\_layout.jsx
  - Five primary tabs: home, explore, scan, events, community
- Admin guard
  - frontend/app/admin/\_layout.jsx checks token then GET /api/users/me
  - Redirects to /auth/login if not admin
- Nested feature routes
  - Expo Router file-system routes organize each feature folder

### 3.3 Frontend to Backend API Layer

- Main API client
  - frontend/app/api/client.js
  - Base URL constant with centralized apiRequest helper
- AI image API client
  - frontend/app/api/ai.js
  - Multipart upload to backend AI analyze endpoint
- Auth token storage
  - frontend/app/api/authStorage.js
- Socket usage
  - frontend/app/hooks/useChatSocket.js

## 4. Admin Dashboard Structure

Admin is implemented in frontend/app/admin and adapts for desktop layout in admin/\_layout.jsx.

The dashboard is the operational control center of the platform. It combines content management, moderation, and reporting so admins can both manage entities and track system activity from one place.

### 4.1 Pages and What They Do

- admin/index
  - Dashboard summary cards and high-level operational metrics
- admin/users
  - Manage user roles and user deactivation
- admin/museums
  - Museum CRUD UI
- admin/artifacts
  - Artifact CRUD UI with museum linking
- admin/events
  - Event CRUD UI with museum/date handling
- admin/donations
  - Campaign CRUD UI
- admin/reviews
  - Review moderation and deletion
- admin/posts
  - Post moderation and deletion
- admin/volunteering
  - Opportunity CRUD + applicant status updates
- admin/marketplace
  - Product CRUD
- admin/tour-guides
  - Tour guide profile CRUD

### 4.2 Core Admin Capabilities (Detailed)

- Access control and security
  - Admin-only route guard via token + role validation
  - Unauthorized users are redirected to login
- Content lifecycle management
  - Full create/edit/delete flows across museums, artifacts, events, campaigns, opportunities, products, and guide profiles
  - Soft-delete behavior where implemented on backend modules
- Community and quality moderation
  - Post removal for policy/content moderation
  - Review moderation and deletion to maintain quality/trust
- Volunteer operations
  - Create opportunities
  - Review applicants
  - Update application status workflow
- User administration
  - Role updates (visitor/guide/admin)
  - User deactivation for safety and governance
- Visual analytics
  - Summary KPI cards for platform health
  - Bar charts for category comparison and historical trends
- Reporting and auditability
  - History-style tables for managed records
  - Export history/report data to CSV for external analysis and archiving

### 4.3 APIs Used by Admin Pages

- Users
  - GET /api/users
  - PATCH /api/users/:id
  - DELETE /api/users/:id
- Museums
  - GET /api/museums
  - POST /api/museums
  - PATCH /api/museums/:id
  - DELETE /api/museums/:id
- Artifacts
  - GET /api/artifacts
  - POST /api/artifacts
  - PATCH /api/artifacts/:id
  - DELETE /api/artifacts/:id
- Events
  - GET /api/events
  - POST /api/events
  - PATCH /api/events/:id
  - DELETE /api/events/:id
- Donations/Campaigns
  - GET /api/donations/campaigns
  - POST /api/donations/campaigns
  - PATCH /api/donations/campaigns/:id
  - DELETE /api/donations/campaigns/:id
- Reviews
  - GET /api/reviews/admin/list
  - DELETE /api/reviews/:id
- Posts
  - GET /api/posts
  - DELETE /api/posts/:postId
- Volunteering
  - GET /api/volunteers/opportunities
  - POST /api/volunteers/opportunities
  - PATCH /api/volunteers/opportunities/:id
  - DELETE /api/volunteers/opportunities/:id
  - GET /api/volunteers
  - PATCH /api/volunteers/:id
- Marketplace
  - GET /api/marketplace
  - POST /api/marketplace
  - PATCH /api/marketplace/:id
  - DELETE /api/marketplace/:id
- Tour Guides
  - GET /api/tour-guides
  - POST /api/tour-guides
  - PATCH /api/tour-guides/:id
  - DELETE /api/tour-guides/:id

### 4.4 Analytics, Charts, and CSV Export

- KPI cards
  - Total users
  - Total museums
  - Total artifacts
  - Total volunteer applications
- Bar charts
  - Side-by-side comparison of major admin datasets
  - Trend visualization for periodic growth and activity history
- CSV export
  - Exportable history/report tables for operations tracking
  - Supports offline reporting and sharing with stakeholders

### 4.5 Admin Actions Matrix

- Create: museums, artifacts, events, campaigns, opportunities, products, tour-guides, users
- Update: users, museums, artifacts, events, campaigns, opportunities, volunteer applications, products, tour-guides
- Delete/deactivate: users, museums, artifacts, events, campaigns, opportunities, products, posts, reviews, tour-guides
- Approve/moderate: volunteer application status updates and content removals

## 5. Backend Structure

This section provides the backend inventory of modules, entities, transport patterns, and security controls.

### 5.1 Backend Modules

Mounted in backend/src/app.ts:

- auth
- users
- museums
- artifacts
- tickets
- events
- restored-artifacts
- chat
- assistant
- reviews
- donations
- volunteers
- tour-guides
- posts
- marketplace
- friends
- ai

### 5.2 API Categories

- Authentication and identity
- User profile and admin user control
- Museum/artifact/event content domains
- Ticketing domain
- Donations and campaigns
- Volunteering and opportunities
- Social graph and posts
- Messaging and realtime conversation state
- AI assistant and image analysis

### 5.3 Database Entities (Mongoose)

- User
- Museum
- Artifact
- Ticket
- Event
- Review
- Donation
- Campaign
- Volunteer
- Opportunity
- TourGuide
- Post
- Message
- FriendRequest
- Product
- RestoredArtifact

### 5.4 Socket.IO Usage

- Bootstrapped in backend/src/server.ts via SocketService singleton
- Auth middleware for socket handshake token
- User joins personal room with user id
- Backend emits new_message event when POST /api/chat/messages succeeds
- Frontend listens in useChatSocket hook and updates UI in chat screen

### 5.5 Security

- Authentication
  - JWT-based authentication for protected REST endpoints
  - User identity loaded from token in middleware
- Authorization (RBAC)
  - Role checks enforce Admin/Guide-only operations where needed
  - Non-privileged users are restricted to their own resources in scoped routes
- Input validation
  - DTO validation middleware validates request payloads before handler logic
  - Invalid data returns controlled 4xx responses
- Credential handling
  - Passwords are hashed on registration and verified on login
  - Secrets/config are environment-driven (for example JWT secret and API keys)
- Socket security
  - Socket.IO handshake is protected via JWT validation middleware
  - Events are emitted to per-user rooms to limit message visibility
- Data safety patterns
  - isActive/soft-delete patterns are used in multiple domains to reduce destructive operations
  - Access guards are applied before data mutation endpoints

## 6. Backend Implementation (First View)

This section explains backend implementation in a focused view so the data and control flow are explicit.

### 6.1 Runtime and Server Bootstrap

- Stack
  - Node.js + Express + TypeScript
  - MongoDB with Mongoose ODM
- App bootstrap flow
  - backend/src/server.ts creates HTTP server from Express app
  - Connects MongoDB before accepting traffic
  - Initializes Socket.IO singleton for realtime chat
  - Starts listening on configured port

### 6.2 Request Lifecycle

- Entry point
  - Incoming request reaches route mounted in backend/src/app.ts under /api/\*
- Middleware chain
  - JSON parsing, CORS and other app-level middleware
  - Authentication middleware for protected routes
  - DTO validation middleware for request bodies where configured
- Business logic
  - Route handlers execute domain rules (auth, content, social, volunteering, etc.)
- Data layer
  - Mongoose models handle reads/writes against MongoDB
- Response
  - API returns structured success/error JSON consumed by frontend clients

### 6.3 Modular Domain Implementation

- The backend is organized by feature modules under backend/src/modules.
- Each module typically includes:
  - routes for endpoint contracts
  - model(s) for schema and persistence
  - dto(s) for input validation
- Implemented modules include:
  - auth, users, museums, artifacts, tickets, events, restored-artifacts
  - chat, assistant, reviews, donations, volunteers, tour-guides
  - posts, marketplace, friends, ai

### 6.4 Realtime and AI Integration in Backend

- Realtime (chat)
  - Socket.IO is initialized once in server bootstrap
  - JWT socket auth validates handshake token
  - Users join personal rooms by user id
  - chat.routes emits new_message events after message persistence
- AI orchestration
  - /api/assistant/chat calls Groq LLM with model fallback strategy
  - /api/ai/analyze receives upload and proxies to Python FastAPI service
  - FastAPI handles recognition + metadata + restoration lookup

### 6.5 Why Backend-First Matters for This Project

- Frontend features are API-driven; behavior is defined primarily by backend contracts.
- Role access (visitor/guide/admin) is enforced in backend middleware/routes.
- Realtime delivery and AI responses are orchestrated by backend services before UI rendering.

## 7. AI Features

This section separates AI generation, translation, and visual analysis so each AI path is explicit.

### 7.1 Assistant Chat

- Frontend screen
  - /ai/chatbot
- Backend endpoint
  - POST /api/assistant/chat
- Processing
  - Validates message history
  - Injects language instruction (ar/en/fr/de/zh)
  - Calls Groq chat completion with model fallback strategy
- Response
  - Returns assistant reply text

### 7.2 Instant Translation in Chats (MyMemory API)

- Frontend usage
  - Chat UI can trigger instant translation for incoming/outgoing messages
- Translation provider
  - MyMemory Translation API is used for real-time text translation in chat context
- Scope
  - This is translation assistance for messaging UX and is separate from the Groq assistant generation path

### 7.3 Artifact/Image Analysis

- Frontend flow
  - /scan capture/gallery -> /scan-result
- Frontend request
  - POST /api/ai/analyze multipart image
- Backend (Node)
  - Saves upload with multer
  - Calls AI service at AI_SERVICE_URL /analyze-artifact
  - Returns normalized result and rewrites public restoration URL if configured
- AI service (Python FastAPI)
  - Endpoint POST /analyze-artifact
  - RecognitionService predicts artifact
  - MetadataService resolves artifact details
  - RestorationService provides saved restoration result if available
- UI usage
  - Displays confidence, metadata fields, description, restored image

### 7.4 Where AI Is Used in UX

- Conversational assistant in chatbot screen
- Instant chat translation in messaging using MyMemory API
- Visual artifact recognition and restoration in scan result screen

## 8. Feature-Level Integration Flows

Each flow follows the same structure: Screen -> API -> Backend Processing -> Database/AI -> UI Response.

### 8.1 Registration and Login

- Screen
  - /auth/signup, /auth/login
- API
  - POST /api/auth/register
  - POST /api/auth/login
- Backend
  - Validates DTO
  - Hashes password on register
  - Verifies credentials on login
  - Creates JWT
- DB
  - Reads/writes User
- AI
  - None
- UI response
  - Stores auth session, routes admin to /admin and others to /home

### 8.2 Museums Browsing

- Screen
  - /(tabs)/explore and museum related views
- API
  - GET /api/museums
  - GET /api/museums/:id
- Backend
  - Queries active museums
- DB
  - Museum documents
- AI
  - None
- UI response
  - Renders museum list/details

### 8.3 Artifacts Browsing

- Screen
  - /artifacts/index, /artifacts/artifactDetailsScreen
- API
  - GET /api/artifacts
  - GET /api/artifacts/:id
- Backend
  - Optional museum filter, populate museum relation
- DB
  - Artifact with museum reference
- AI
  - None
- UI response
  - Shows artifact details and related metadata fields

### 8.4 Events

- Screen
  - /(tabs)/events, /events/eventsList, /eventScreen/eventScreen
- API
  - GET /api/events
  - GET /api/events/:id
- Backend
  - Returns active events sorted by date
- DB
  - Event with museum reference
- AI
  - None
- UI response
  - Event lists/cards/details

### 8.5 Reviews

- Screen
  - /reviews, /write-review
- API
  - GET /api/reviews
  - POST /api/reviews
  - PATCH /api/reviews/:id
  - DELETE /api/reviews/:id
- Backend
  - Enforces one review per user per museum
  - Computes average rating for list endpoint
- DB
  - Review documents with user and museum refs
- AI
  - None
- UI response
  - Shows review feeds and confirmation screens

### 8.6 Posts and Social Interactions

- Screen
  - /(tabs)/community
- API
  - GET /api/posts
  - POST /api/posts
  - POST /api/posts/:postId/like
  - POST /api/posts/:postId/comments
- Backend
  - Creates post, toggles likes, appends comments
- DB
  - Post documents with embedded comments and likedBy refs
- AI
  - None
- UI response
  - Live local state updates for feed interactions

### 8.7 Friend Requests

- Screen
  - /user/[id], /notifications/index
- API
  - GET /api/friends/requests/status/:receiverId
  - POST /api/friends/requests
  - GET /api/friends/requests/incoming
  - POST /api/friends/requests/:requestId/accept
  - POST /api/friends/requests/:requestId/reject
  - GET /api/friends
- Backend
  - Creates request, transitions status, links accepted friends
- DB
  - FriendRequest and User friends array
- AI
  - None
- UI response
  - Friendship status and incoming requests lists

### 8.8 Chat Messaging (Socket.IO)

- Screen
  - /messagesList/index and /messagesList/chatScreen
- API
  - GET /api/chat/conversations
  - GET /api/chat/messages?conversationWith=:id
  - POST /api/chat/messages
  - PATCH /api/chat/conversations/:userId/read-all
- Backend
  - Persists message
  - Emits new_message via Socket.IO to receiver room
  - Supports read state and unread count
- DB
  - Message documents
- AI
  - Optional translation in frontend via MyMemory API (not backend AI)
- UI response
  - Real-time receive path + conversation list refresh

### 8.9 Donations and Campaigns

- Screen
  - /volunteering/index for campaign browsing and admin/donations for CRUD
- API
  - GET /api/donations/campaigns
  - POST/PATCH/DELETE /api/donations/campaigns/:id (admin)
  - POST /api/donations (authenticated donations)
  - GET /api/donations, GET /api/donations/:id
- Backend
  - Campaign lifecycle and donation creation/status updates
- DB
  - Campaign and Donation documents
- AI
  - None
- UI response
  - Campaigns list and donation interactions

### 8.10 Volunteering

- Screen
  - /volunteering/index and admin/volunteering
- API
  - GET /api/volunteers/opportunities
  - POST /api/volunteers/opportunities/:id/signup
  - Admin CRUD for opportunities
  - GET/PATCH /api/volunteers for applications and status
- Backend
  - Opportunity management and user signups
- DB
  - Opportunity and Volunteer documents
- AI
  - None
- UI response
  - Opportunity cards, signup actions, admin applicant workflow

### 8.11 Tour Guide Profiles

- Screen
  - /tour-guide/index and admin/tour-guides
- API
  - GET /api/tour-guides
  - GET /api/tour-guides/:id
  - POST/PATCH/DELETE /api/tour-guides
- Backend
  - Guide profile lifecycle with role checks
- DB
  - TourGuide with unique user reference
- AI
  - None
- UI response
  - Guide listing and profile admin management

### 8.12 AI Chat Assistant

- Screen
  - /ai/chatbot
- API
  - POST /api/assistant/chat
- Backend
  - Builds prompt from conversation history and language
  - Calls Groq API with fallback models
- DB
  - None
- AI
  - LLM completion service
- UI response
  - Displays assistant reply bubble

### 8.13 AI Image Scan

- Screen
  - /(tabs)/scan -> /(tabs)/scan-result
- API
  - POST /api/ai/analyze
- Backend
  - Receives file and proxies to Python AI service /analyze-artifact
- DB
  - No direct DB write in this flow
- AI
  - Recognition + metadata + restoration availability from FastAPI services
- UI response
  - Displays identified artifact information and restoration image URL when available

## 9. End-to-End User Journeys

This section summarizes complete user journeys from interaction start to visible outcome.

### 9.1 User Registration and Login

1. User opens auth screen and submits registration or login.
2. Frontend calls auth endpoint.
3. Backend validates input and creates/verifies user.
4. Backend returns user info and JWT.
5. Frontend stores token and routes by role.

### 9.2 Browsing Museums and Artifacts

1. User opens explore/artifact views.
2. Frontend requests museums/artifacts endpoints.
3. Backend fetches active records from MongoDB.
4. Frontend renders cards/detail views.

### 9.3 Booking Tickets

Current implementation is primarily UI/local flow in ticket screens.

1. User selects museum in /tickets/index.
2. User configures ticket options in /tickets/checkout.
3. UI navigates to /tickets/qrcode.
   Note: backend ticket endpoints exist, but these specific screens currently do not call POST /api/tickets in the present implementation.

### 9.4 Posting and Social Interaction

1. User opens community tab.
2. Frontend loads posts from GET /api/posts.
3. User creates post or likes/comments.
4. Backend mutates Post document in MongoDB.
5. Updated state returned and reflected in feed.

### 9.5 Chat Messaging with Socket.IO

1. User opens conversations and picks contact.
2. Frontend loads messages via REST.
3. Frontend connects socket with JWT in handshake.
4. Sending message triggers POST /api/chat/messages.
5. Backend stores Message and emits new_message to receiver room.
6. Receiver UI gets event instantly and appends message.

### 9.6 AI Chat Assistant

1. User writes message in chatbot screen.
2. Frontend sends history and language to POST /api/assistant/chat.
3. Backend composes prompt and calls Groq.
4. Backend returns assistant reply.
5. Frontend appends AI response.

### 9.7 AI Image Scan

1. User captures image in scan screen or picks from gallery.
2. Frontend uploads image to POST /api/ai/analyze.
3. Node backend forwards image to FastAPI /analyze-artifact.
4. FastAPI runs recognition, metadata lookup, and restoration lookup.
5. Result returns to Node then to frontend.
6. Scan-result screen renders metadata and restoration preview URL.

## 10. System Relationships and Dependencies

### 10.1 Frontend <-> Backend

- Frontend calls REST APIs using fetch wrappers in frontend/app/api/client.js and frontend/app/api/ai.js.
- JWT token passed in Authorization header for protected endpoints.
- Role-sensitive routing in frontend admin layout uses /api/users/me response.

### 10.2 Backend <-> Database

- Express modules use Mongoose models to query/update MongoDB.
- Shared middleware performs auth, role checks, and request validation.

### 10.3 Backend <-> AI

- Assistant route calls external Groq LLM API.
- AI image route calls Python FastAPI AI service through HTTP.

### 10.4 Admin Dashboard Control Plane

- Admin pages call protected endpoints with bearer token.
- Admin actions mutate central domain entities (users, content, moderation, campaigns, opportunities, products).
- Changes propagate to visitor experiences through shared data sources.

## 11. Implementation Gaps and Priority Notes

These are observed from current code and should be considered in planning:

1. Password reset flow mismatch

- Frontend auth screens call api.forgotPassword, api.verifyResetToken, api.resetPassword.
- These methods are not implemented in frontend/app/api/client.js.
- Backend auth routes currently expose only register and login.

2. Donation campaign contribution mismatch

- Frontend api client includes POST /api/donations/campaigns/:id/contribute.
- Backend donations routes do not define this endpoint.

3. Ticket booking integration gap

- Backend ticket CRUD exists.
- Current ticket UI screens are local and do not post ticket purchases to backend endpoints.

4. Marketplace checkout integration gap

- Product listing is backend-backed.
- Cart and checkout are local storage/UI oriented; no order/payment backend module is implemented.

5. Admin analytics scope

- Dashboard analytics are summary operational counts, not a dedicated analytics service/module.

---

This document is generated directly from the current repository implementation and reflects the end-to-end behavior in code as of April 22, 2026.
