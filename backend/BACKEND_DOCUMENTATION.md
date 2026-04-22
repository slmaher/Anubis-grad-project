# Revive Egypt Backend Documentation

## 1. Application Overview

### 1.1 App Purpose
Revive Egypt is a mobile-first platform centered on Egyptian tourism, museums, artifacts, and culture. The backend provides:
- User identity and role management
- Museum, artifact, event, and ticket management
- Social interactions (posts, chat, friends, reviews)
- Donation and volunteering workflows
- AI-powered assistant chat and artifact analysis integration

### 1.2 Target Users
- Visitors: browse museums, buy tickets, review, donate, chat, social feed
- Tour Guides: manage guide profile and volunteering/tour activities
- Admins: manage core content (museums, artifacts, events, campaigns, products, users)

### 1.3 Core Features
- Authentication with JWT
- Role-based authorization (Visitor, Guide, Admin)
- Museum and artifact catalog management
- Event scheduling and publication
- Ticket booking and cancellation
- Reviews with average rating and pagination
- Donations and campaign management
- Volunteer opportunities and applications
- Tour guide profile lifecycle
- Social feed with likes and comments
- Direct messaging with Socket.IO real-time push
- Friend request and friendship state management
- AI assistant conversational endpoint (Groq)
- AI artifact analysis proxy endpoint (image upload + microservice call)

---

## 2. System Architecture

### 2.1 High-Level Architecture Diagram (Text)

Client tier:
- Mobile app (Expo/React Native)

API tier:
- Express REST API (TypeScript)
- Socket.IO gateway (same Node process)

Domain tier:
- Module routers per business domain
- DTO validation with class-validator
- Middleware for auth, RBAC, validation, error handling

Data tier:
- MongoDB via Mongoose models

External integrations:
- Groq Chat Completions API for assistant
- External AI service (`AI_SERVICE_URL`) for artifact analysis

Flow diagram in text:
1. Mobile client sends HTTP request to Express route under `/api/*`.
2. Middleware chain executes: `cors` -> JSON parsing -> route middleware (`authenticate`, `authorizeRoles`, `validateBody`) -> handler.
3. Handler executes Mongoose operations and optional integrations.
4. Response serialized as JSON (mostly `{ success, data, message }`).
5. For chat, server emits real-time event via Socket.IO room keyed by user ID.

### 2.2 Backend Structure (Services, Modules, Layers)

Infrastructure:
- `src/server.ts`: bootstrap HTTP server, DB connect, Socket service initialization
- `src/app.ts`: global middleware, route mounting, error handlers
- `src/config/database.ts`: MongoDB connection
- `src/config/env.ts`: environment values

Shared middleware/utilities:
- Auth JWT middleware (`authenticate`, `authorizeRoles`)
- Body validation middleware (`validateBody`)
- Error and not-found handlers
- JWT signing/verification utilities
- Socket authentication middleware

Business modules:
- `auth`, `users`, `museums`, `artifacts`, `tickets`, `events`
- `restored-artifacts`, `reviews`, `donations`, `volunteers`
- `tour-guides`, `posts`, `marketplace`, `friends`
- `chat`, `assistant`, `ai`

Data layer:
- Mongoose models per domain entity

### 2.3 Data Flow (Who Calls Who, Step-by-Step)

Generic secured endpoint flow:
1. Mobile app sends request with `Authorization: Bearer <JWT>`.
2. `authenticate` middleware verifies JWT and fetches user from DB.
3. Optional `authorizeRoles(...)` checks role.
4. Optional `validateBody(Dto)` validates and strips unknown fields.
5. Route handler runs business logic and DB operations.
6. JSON response returned.

Chat with realtime flow:
1. Sender calls `POST /api/chat/messages`.
2. API validates receiver and writes `Message` document.
3. API emits `new_message` to receiver room via `SocketService.emitToUser`.
4. Receiver app gets socket event instantly and can refresh conversation.

---

## 3. Backend Components

## 3.1 API Inventory

Base URL pattern: `/api/...` (except health: `/health`).

### 3.1.1 Health

| Method | URL | Auth | Request Body | Success Response | Common Errors |
|---|---|---|---|---|---|
| GET | `/health` | No | None | `{ status: "ok", service: "Revive Egypt API" }` | 500 |

### 3.1.2 Auth

| Method | URL | Auth | Request Body | Success Response | Common Errors |
|---|---|---|---|---|---|
| POST | `/api/auth/register` | No | `name, email, password, role?` | `201` with `{ success, data: { user, accessToken } }` | `400` validation, `409` email exists |
| POST | `/api/auth/login` | No | `email, password` | `{ success, data: { user, accessToken } }` | `400` validation, `401` invalid credentials, `403` inactive user |

### 3.1.3 Users

| Method | URL | Auth | Request Body | Success Response | Common Errors |
|---|---|---|---|---|---|
| GET | `/api/users/me` | Any authenticated | None | current user (without password) | `401`, `404` |
| PATCH | `/api/users/me` | Any authenticated | `name?, avatar?` | updated current user | `400`, `401`, `404` |
| GET | `/api/users/profile/:id` | Any authenticated | None | target user profile | `401`, `404` |
| GET | `/api/users` | Admin | None | all users | `401`, `403` |
| POST | `/api/users` | Admin | `name, email, password, role?` | `201` created user | `400`, `401`, `403`, `409` |
| GET | `/api/users/:id` | Admin | None | single user | `401`, `403`, `404` |
| PATCH | `/api/users/:id` | Admin | `name?, role?, avatar?` | updated user | `400`, `401`, `403`, `404` |
| DELETE | `/api/users/:id` | Admin | None | soft-deactivated user | `401`, `403`, `404` |

### 3.1.4 Museums

| Method | URL | Auth | Request Body | Success Response | Common Errors |
|---|---|---|---|---|---|
| GET | `/api/museums` | Public | None | active museums | 500 |
| GET | `/api/museums/:id` | Public | None | single active museum | `404` |
| POST | `/api/museums` | Admin | `name, description, location, city, imageUrl?, openingHours?` | `201` museum | `400`, `401`, `403` |
| PATCH | `/api/museums/:id` | Admin | partial museum fields | updated museum | `400`, `401`, `403`, `404` |
| DELETE | `/api/museums/:id` | Admin | None | soft-deactivated museum | `401`, `403`, `404` |

### 3.1.5 Artifacts

| Method | URL | Auth | Request Body | Success Response | Common Errors |
|---|---|---|---|---|---|
| GET | `/api/artifacts` | Public | Query: `museumId?` | active artifacts + museum populated | 500 |
| GET | `/api/artifacts/:id` | Public | None | single artifact + museum | `404` |
| POST | `/api/artifacts` | Admin | `name, description, museum, era?, imageUrl?` | `201` artifact | `400` museum missing/validation, `401`, `403` |
| PATCH | `/api/artifacts/:id` | Admin | partial artifact fields | updated artifact | `400`, `401`, `403`, `404` |
| DELETE | `/api/artifacts/:id` | Admin | None | soft-deactivated artifact | `401`, `403`, `404` |

### 3.1.6 Tickets

| Method | URL | Auth | Request Body | Success Response | Common Errors |
|---|---|---|---|---|---|
| GET | `/api/tickets` | Authenticated | Query optional | Admin sees all, others own only | `401` |
| GET | `/api/tickets/:id` | Authenticated | None | single ticket | `401`, `403`, `404` |
| POST | `/api/tickets` | Authenticated | `museum, visitDate, numberOfGuests, totalPrice, status?` | `201` ticket | `400` museum/date/validation, `401` |
| PATCH | `/api/tickets/:id` | Authenticated | partial ticket fields | updated ticket | `400`, `401`, `403`, `404` |
| DELETE | `/api/tickets/:id` | Authenticated | None | status set to cancelled | `401`, `403`, `404` |

### 3.1.7 Events

| Method | URL | Auth | Request Body | Success Response | Common Errors |
|---|---|---|---|---|---|
| GET | `/api/events` | Public | Query: `museumId?` | active events sorted by `startDate` | 500 |
| GET | `/api/events/:id` | Public | None | single active event | `404` |
| POST | `/api/events` | Admin | `title, description, museum, startDate, endDate, location?, imageUrl?, maxAttendees?` | `201` event | `400` date/museum/validation, `401`, `403` |
| PATCH | `/api/events/:id` | Admin | partial event fields | updated event | `400`, `401`, `403`, `404` |
| DELETE | `/api/events/:id` | Admin | None | soft-deactivated event | `401`, `403`, `404` |

### 3.1.8 Restored Artifacts

| Method | URL | Auth | Request Body | Success Response | Common Errors |
|---|---|---|---|---|---|
| POST | `/api/restored-artifacts` | Authenticated | `artifact, originalImageUrl` | `201` restored record (`status=completed`, mocked restoration URL) | `400`, `401` |
| GET | `/api/restored-artifacts` | Authenticated | None | current user restorations | `401` |
| GET | `/api/restored-artifacts/:id` | Authenticated | None | single restoration (owner only) | `401`, `403`, `404` |
| GET | `/api/restored-artifacts/artifact/:artifactId` | Authenticated | None | current user restorations for artifact | `401` |

### 3.1.9 Reviews

| Method | URL | Auth | Request Body | Success Response | Common Errors |
|---|---|---|---|---|---|
| GET | `/api/reviews` | Public | Query: `museumId?, limit?, skip?` | reviews + pagination + `averageRating` | `400` invalid museum id |
| GET | `/api/reviews/admin/list` | Admin | Query: `limit?, skip?` | admin review list + pagination | `401`, `403` |
| GET | `/api/reviews/:id` | Public | None | single review | `404` |
| POST | `/api/reviews` | Authenticated | `museum, rating(1..5), comment?` | `201` review | `400`, `401`, `409` duplicate review |
| PATCH | `/api/reviews/:id` | Authenticated owner | `rating?, comment?` | updated review | `400`, `401`, `403`, `404` |
| DELETE | `/api/reviews/:id` | Authenticated owner/Admin | None | deletion confirmation | `401`, `403`, `404` |

### 3.1.10 Donations + Campaigns

Campaigns:

| Method | URL | Auth | Request Body | Success Response | Common Errors |
|---|---|---|---|---|---|
| GET | `/api/donations/campaigns` | Public | None | active campaigns | 500 |
| GET | `/api/donations/campaigns/:id` | Public | None | single campaign | `404` |
| POST | `/api/donations/campaigns` | Admin | `title, description, goalAmount, imageUrl?, icon?` | `201` campaign | `400`, `401`, `403` |
| PATCH | `/api/donations/campaigns/:id` | Admin | partial campaign fields | updated campaign | `400`, `401`, `403`, `404` |
| DELETE | `/api/donations/campaigns/:id` | Admin | None | campaign deactivated | `401`, `403`, `404` |

Donations:

| Method | URL | Auth | Request Body | Success Response | Common Errors |
|---|---|---|---|---|---|
| GET | `/api/donations` | Authenticated | Query: `museumId?, limit?, skip?` | donations + pagination + `totalAmount` | `401` |
| GET | `/api/donations/:id` | Authenticated | None | single donation | `401`, `403`, `404` |
| POST | `/api/donations` | Authenticated | `museum, amount, currency?, paymentMethod?, isAnonymous?, message?` | `201` donation (`status=pending`) | `400`, `401` |
| PATCH | `/api/donations/:id` | Admin | `status?` | updated donation | `400`, `401`, `403`, `404` |

### 3.1.11 Volunteers + Opportunities

Opportunities:

| Method | URL | Auth | Request Body | Success Response | Common Errors |
|---|---|---|---|---|---|
| GET | `/api/volunteers/opportunities` | Public | None | active opportunities | 500 |
| POST | `/api/volunteers/opportunities` | Admin | `title, description, requirements, location, duration` | `201` opportunity | `400`, `401`, `403` |
| PATCH | `/api/volunteers/opportunities/:id` | Admin | partial opportunity fields | updated opportunity | `400`, `401`, `403`, `404` |
| DELETE | `/api/volunteers/opportunities/:id` | Admin | None | hard delete confirmation | `401`, `403`, `404` |
| POST | `/api/volunteers/opportunities/:id/signup` | Authenticated | None | creates pending volunteer record | `400`, `401`, `404`, `409` |

Volunteer applications:

| Method | URL | Auth | Request Body | Success Response | Common Errors |
|---|---|---|---|---|---|
| GET | `/api/volunteers` | Authenticated | Query: `museumId?, status?, limit?, skip?` | list (Admin/Guide all, others own only) | `401` |
| GET | `/api/volunteers/:id` | Authenticated | None | single volunteer record | `401`, `403`, `404` |
| POST | `/api/volunteers` | Authenticated | `museum, startDate, endDate?, role?, notes?` | `201` volunteer application | `400`, `401` |
| PATCH | `/api/volunteers/:id` | Authenticated | `startDate?, endDate?, role?, notes?, status?` | updated volunteer record | `400`, `401`, `403`, `404` |
| DELETE | `/api/volunteers/:id` | Authenticated owner/Admin | None | status set to cancelled | `401`, `403`, `404` |

### 3.1.12 Tour Guides

| Method | URL | Auth | Request Body | Success Response | Common Errors |
|---|---|---|---|---|---|
| GET | `/api/tour-guides` | Public | Query: `limit?, skip?` | available guides sorted by rating/tours | 500 |
| GET | `/api/tour-guides/:id` | Public | None | single guide | `404` |
| GET | `/api/tour-guides/user/:userId` | Public | None | guide by user id | `404` |
| GET | `/api/tour-guides/me/profile` | Guide/Admin | None | current guide profile | `401`, `403`, `404` |
| POST | `/api/tour-guides` | Guide/Admin | `user?(admin), bio?, specialties?, languages?, experienceYears?, hourlyRate?, isAvailable?` | `201` guide profile | `400`, `401`, `403`, `404`, `409` |
| PATCH | `/api/tour-guides/me/profile` | Guide/Admin | update guide fields | updated profile | `400`, `401`, `403`, `404` |
| PATCH | `/api/tour-guides/:id` | Authenticated owner/Admin | update guide fields | updated profile | `400`, `401`, `403`, `404` |
| DELETE | `/api/tour-guides/me/profile` | Guide/Admin | None | deletion confirmation | `401`, `403`, `404` |
| DELETE | `/api/tour-guides/:id` | Authenticated owner/Admin | None | deletion confirmation | `401`, `403`, `404` |

### 3.1.13 Posts (Social Feed)

| Method | URL | Auth | Request Body | Success Response | Common Errors |
|---|---|---|---|---|---|
| GET | `/api/posts` | Public | Query: `userId?` | posts with user + comments users | 500 |
| POST | `/api/posts` | Authenticated | `content, image?` | `201` created post | `400`, `401` |
| POST | `/api/posts/:postId/like` | Authenticated | None | `{ postId, likes, liked }` toggle | `401`, `404` |
| POST | `/api/posts/:postId/comments` | Authenticated | `{ content }` | `201` updated post with new comment | `400`, `401`, `404` |
| DELETE | `/api/posts/:postId` | Authenticated owner/Admin | None | delete confirmation | `401`, `403`, `404` |

### 3.1.14 Marketplace

| Method | URL | Auth | Request Body | Success Response | Common Errors |
|---|---|---|---|---|---|
| GET | `/api/marketplace` | Public | Query: `category?` | active products | 500 |
| GET | `/api/marketplace/:id` | Public | None | product details | `404` |
| POST | `/api/marketplace` | Admin | `name, description, price, category, imageUrl?, stock?` | `201` product | `400`, `401`, `403` |
| PATCH | `/api/marketplace/:id` | Admin | partial product fields | updated product | `400`, `401`, `403`, `404` |
| DELETE | `/api/marketplace/:id` | Admin | None | soft deactivate | `401`, `403`, `404` |

### 3.1.15 Friends

| Method | URL | Auth | Request Body | Success Response | Common Errors |
|---|---|---|---|---|---|
| GET | `/api/friends` | Authenticated | None | accepted friends list | `401`, `404` |
| GET | `/api/friends/requests/incoming` | Authenticated | None | pending incoming requests | `401` |
| GET | `/api/friends/requests/status/:receiverId` | Authenticated | None | relationship state (`self`, `friends`, `pending_outgoing`, `pending_incoming`, `none`) | `401`, `404` |
| POST | `/api/friends/requests` | Authenticated | `{ receiverId }` | `201` friend request | `400`, `401`, `404`, `409` |
| POST | `/api/friends/requests/:requestId/accept` | Authenticated receiver | None | accepted request details + friends linked | `401`, `404` |
| POST | `/api/friends/requests/:requestId/reject` | Authenticated receiver | None | rejected status | `401`, `404` |

### 3.1.16 Chat + Messaging

| Method | URL | Auth | Request Body | Success Response | Common Errors |
|---|---|---|---|---|---|
| POST | `/api/chat/messages` | Authenticated | `receiver, content` | `201` message; emits socket `new_message` | `400`, `401` |
| GET | `/api/chat/messages` | Authenticated | Query: `conversationWith?, limit?, skip?` | messages + pagination | `401` |
| GET | `/api/chat/messages/:id` | Authenticated participant | None | message details | `401`, `403`, `404` |
| GET | `/api/chat/conversations` | Authenticated | None | conversation list with lastMessage + unreadCount | `401` |
| PATCH | `/api/chat/messages/:id/read` | Authenticated receiver | None | message marked read | `401`, `403`, `404` |
| PATCH | `/api/chat/conversations/:userId/read-all` | Authenticated | None | modified count of read updates | `401`, `404` |
| GET | `/api/chat/unread-count` | Authenticated | None | `{ unreadCount }` | `401` |

### 3.1.17 Assistant (AI Chat)

| Method | URL | Auth | Request Body | Success Response | Common Errors |
|---|---|---|---|---|---|
| POST | `/api/assistant/chat` | Public | `{ history: [{ sender: user|ai, text }], language? }` | `{ success: true, data: { reply } }` | `400` invalid history, `429` model/quota fallback exhausted, `500` missing key, `502` upstream/parsing/network failures |

### 3.1.18 AI Artifact Analysis

| Method | URL | Auth | Request Body | Success Response | Common Errors |
|---|---|---|---|---|---|
| POST | `/api/ai/analyze` | Public | `multipart/form-data`, field `image` file | proxied analysis JSON from AI service | `400` no image, `500` AI analysis failure |

### 3.1.19 Standard Error Shapes
- Validation errors:
  - `{ success: false, message: "Validation failed", errors: [{ property, constraints }] }`
- Auth errors:
  - `401` missing/invalid token or inactive user
- RBAC errors:
  - `403` insufficient role/ownership
- Not found:
  - endpoint-specific `{ success: false, message: "... not found" }`
  - unmatched route: `{ success: false, message: "Route not found" }`
- Global unexpected errors:
  - `{ success: false, message: err.message || "Internal server error" }`

## 3.2 Authentication & Authorization Flow

### JWT Authentication
1. User registers or logs in.
2. Backend signs JWT with payload: `{ sub: userId, role }`.
3. Client stores token and sends in `Authorization` header.
4. `authenticate` middleware verifies signature and expiry, then loads user.
5. Middleware rejects if user not found/inactive.

### Role Authorization
- `authorizeRoles(...allowedRoles)` checks `req.user.role`.
- Roles enum:
  - `Visitor`
  - `Guide`
  - `Admin`
- Access model:
  - Public endpoints (catalog/read-only) do not require auth.
  - User endpoints require authenticated owner/admin conditions.
  - Admin endpoints enforce role gate.

### Socket Authentication
1. Client connects Socket.IO with token in handshake.
2. `socketAuth` verifies JWT and user status.
3. Socket joins room with user ID.
4. Backend emits private events to user room.

## 3.3 Database Design (Collections, Relations, ERD Description)

Database: MongoDB, ODM: Mongoose.

### Main Collections
- `users`: credentials, role, profile, friends array
- `museums`: museum content, active flag, metadata
- `artifacts`: belongs to museum
- `events`: belongs to museum
- `tickets`: belongs to user and museum
- `reviews`: belongs to user and museum, one review/user/museum
- `donations`: belongs to user and museum
- `campaigns`: donation campaign entities
- `volunteers`: volunteer application records (user + museum)
- `opportunities`: volunteer opportunity templates
- `tourguides`: one-to-one with user
- `posts`: user feed posts, embedded comments and likes
- `messages`: direct messages sender->receiver
- `friendrequests`: pending/accepted/rejected request records
- `restoredartifacts`: restoration records linked to user and artifact
- `products`: marketplace products

### Key Relationships
- User 1..N Tickets
- User 1..N Reviews
- User 1..N Donations
- User 1..N Messages (as sender), User 1..N Messages (as receiver)
- User N..N User via `friends` array and `friendrequests`
- User 1..1 TourGuide profile
- Museum 1..N Artifacts
- Museum 1..N Events
- Museum 1..N Tickets
- Museum 1..N Reviews
- Museum 1..N Donations
- Artifact 1..N RestoredArtifact records

### ERD Description (Text)
- `User` is the principal identity node.
- `Museum` is principal content node.
- `Artifact`, `Event`, `Ticket`, `Review`, `Donation`, `Volunteer` all reference `Museum` via ObjectId.
- `Ticket`, `Review`, `Donation`, `Volunteer`, `Post`, `Message`, `FriendRequest`, `RestoredArtifact` reference `User`.
- `TourGuide` references `User` with unique index to enforce one profile per user.
- `Review` uses unique compound index `(user, museum)` to prevent duplicate reviews.
- `Message` uses conversation-focused indexes for sender/receiver/time and unread counts.

### Notable Indexes/Constraints
- `User.email` unique
- `TourGuide.user` unique
- `Review (user, museum)` unique
- `FriendRequest (sender, receiver)` unique
- Message indexes:
  - `(sender, receiver, createdAt desc)`
  - `(receiver, isRead)`

## 3.4 Third-Party Integrations

1. Groq API
- Purpose: assistant responses
- Endpoint used: `POST /openai/v1/chat/completions`
- Fallback strategy across multiple model IDs
- Failure handling for 404/429 and non-2xx responses

2. External AI microservice
- Purpose: artifact analysis / restoration pipeline proxy
- Trigger: `POST /api/ai/analyze`
- Integration: multipart upload forwarded to `AI_SERVICE_URL/analyze-artifact`
- URL rewriting: final image URL normalized to `AI_PUBLIC_BASE_URL`

3. Socket.IO
- Purpose: realtime chat updates
- Authenticated socket sessions
- Room-based private user events

4. Multer
- Purpose: temporary image upload handling for AI analysis

---

## 4. Detailed Data Flow (Exact Component-Level)

### 4.1 Register/Login
1. Mobile app auth screen sends credentials to `/api/auth/register` or `/api/auth/login`.
2. `validateBody` enforces DTO schema.
3. Route handler (`auth.routes`) reads/writes `UserModel`.
4. Password hash/compare via `bcryptjs`.
5. JWT generated by `signJwt` utility.
6. Response returns user profile and access token.

### 4.2 Museum Creation (Admin)
1. Admin app calls `POST /api/museums` with token.
2. `authenticate` verifies token and fetches active user.
3. `authorizeRoles(Admin)` enforces role.
4. `validateBody(CreateMuseumDto)` validates payload.
5. Handler writes `MuseumModel` with `createdBy/updatedBy`.
6. API returns `201` with created museum.

### 4.3 Ticket Booking
1. Visitor app sends `POST /api/tickets`.
2. Auth middleware injects `req.user.id`.
3. DTO validation checks museum ObjectId/date/guests/price.
4. Handler verifies museum exists via `MuseumModel.findById`.
5. Handler validates `visitDate` is future.
6. Handler creates `TicketModel` with status pending (or payload status).
7. Handler populates user and museum refs.
8. Response returns created ticket object.

### 4.4 Review Submission
1. Mobile review form calls `POST /api/reviews`.
2. Auth + DTO validation execute.
3. Handler validates museum id format and existence.
4. Handler checks duplicate review by `(user,museum)`.
5. Handler creates `ReviewModel` document.
6. Populated response returned; list endpoints recompute average rating via aggregation.

### 4.5 Donation Creation + Admin Status Update
1. User sends `POST /api/donations` with amount and museum.
2. Backend validates museum, stores donation as `pending`.
3. Admin panel later calls `PATCH /api/donations/:id` with status.
4. Admin authorization enforced; donation status transitions to completed/failed.
5. List endpoint computes aggregate totals from filtered records.

### 4.6 Friend Request Accept
1. User A sends `POST /api/friends/requests` to user B.
2. Handler validates both users and prevents duplicates/self-request.
3. Pending `FriendRequest` created.
4. User B sends `POST /api/friends/requests/:requestId/accept`.
5. Handler confirms receiver and pending status.
6. Backend updates both users with `$addToSet` in `friends` arrays.
7. Request status updated to `accepted` with `respondedAt`.
8. Response returns normalized request payload.

### 4.7 Chat Message + Realtime Push
1. Sender app sends `POST /api/chat/messages`.
2. Backend validates receiver and blocks self-send.
3. Creates `MessageModel` document.
4. Populates sender/receiver fields.
5. `SocketService.emitToUser(receiverId, "new_message", populatedMessage)` dispatches realtime event.
6. Sender gets HTTP `201`, receiver gets socket event.

### 4.8 Assistant Chat
1. Assistant screen sends `POST /api/assistant/chat` with conversation history and language code.
2. Backend sanitizes/limits history to last 20 valid turns.
3. Prompt is assembled with role instructions + language directive.
4. Backend calls Groq API with model fallback chain.
5. Reply text is returned in `{ success: true, data: { reply } }`.

### 4.9 AI Artifact Scan
1. Client uploads image to `POST /api/ai/analyze` as multipart field `image`.
2. Multer stores temporary file under `uploads/ai-scans`.
3. AI controller forwards file stream to external AI service.
4. Response payload is returned to client after optional URL normalization.
5. Temporary upload file is removed in success and error paths.

---

## 5. Tech Stack Suggestions (with Rationale)

Current stack is valid. For production hardening and growth, recommended choices are:

### 5.1 Backend Framework
- Keep Express for short term if team velocity is strong.
- Consider migrating to NestJS (incrementally) for long-term maintainability.
- Reason:
  - Better module isolation and DI for large domains
  - Native guards/interceptors for auth, metrics, caching
  - Easier testing boundaries for growing team

### 5.2 Database
- Continue MongoDB if document flexibility is intentional.
- Add Redis for cache/session/realtime metadata.
- Consider PostgreSQL for payment/order-like strict transactional modules if those expand.
- Reason:
  - MongoDB fits catalog/social content and evolving schema
  - Redis reduces DB load and latency on hot reads
  - PostgreSQL can complement for strong ACID workflows

### 5.3 Hosting / Cloud
Recommended production topology:
- API + Socket service on container platform (AWS ECS/Fargate, GCP Cloud Run, or Azure Container Apps)
- MongoDB Atlas managed cluster
- Redis managed service (ElastiCache/Redis Cloud)
- Object storage + CDN for media (S3 + CloudFront)
- Reason:
  - Horizontal scaling for REST + WebSocket
  - Managed DB operations and backups
  - Reduced latency and egress for media assets

---

## 6. Scalability & Performance

### 6.1 How the System Scales
- Stateless API workers behind load balancer
- Shared MongoDB and Redis backends
- Socket scaling using Redis adapter for cross-instance event fanout
- Offload long-running AI processing to async jobs/queues

### 6.2 Caching Strategy
1. Endpoint response caching (short TTL)
- Public list APIs: museums, artifacts, events, products, campaign list
- Key by query tuple (e.g., `events:museumId:<id>:page:<n>`)

2. Entity caching
- Museum/artifact details with write-through invalidation on admin updates

3. Computed aggregate caching
- `averageRating`, donation totals, unread counts (short TTL + event invalidation)

4. AI response caching
- Cache assistant replies for identical prompt hashes (optional, short TTL)

### 6.3 Load Handling
- Add pagination limits hard caps for all list endpoints
- Add DB projection and lean queries where possible
- Add indexes for high-frequency filters
- Introduce background workers for:
  - AI analysis callback processing
  - Notification/event fanout
  - Analytics aggregation

---

## 7. Security

### 7.1 Data Protection
- Hash passwords with bcrypt
- Use HTTPS in all environments except local dev
- Encrypt sensitive env variables via secret manager
- Never expose upstream service secrets to client

### 7.2 API Security
- JWT validation at middleware for protected routes
- RBAC authorization for admin/guide actions
- Input validation with whitelist and forbidden extra fields
- Add rate limiting and brute-force protection (currently missing)
- Add request size and multipart constraints (AI endpoint should cap file types/sizes)

### 7.3 Authentication Methods
- Current: JWT bearer tokens
- Recommended additions:
  - Refresh token rotation
  - Token revocation strategy
  - Email verification and password reset route integration
  - MFA for admin accounts

### 7.4 Security Gaps to Address
- CORS currently open (`*`) and should be narrowed in production
- Socket.IO CORS currently open and should be restricted
- No explicit CSRF strategy needed for bearer token APIs, but secure storage in app is critical
- Add structured audit logs for admin actions

---

## 8. Optional Improvements / Better Architecture

1. Introduce Service Layer per Module
- Move business logic out of route files into services
- Improve testability and code reuse

2. API Versioning
- Prefix with `/api/v1` and maintain compatibility strategy

3. Unified API Contract
- Standardize all responses to one envelope (`success`, `data`, `message`, `meta`, `errorCode`)
- `ai/analyze` currently returns a different shape

4. Observability
- Add OpenTelemetry tracing
- Structured JSON logging with correlation IDs
- Metrics dashboard (latency, error rate, p95, throughput)

5. Background Jobs
- Queue-based AI and notification workflows (BullMQ + Redis)
- Prevent request-time blocking and improve reliability

6. Data Governance
- Add soft delete consistency strategy across all entities
- Add archival and retention policies for messages and logs

7. Testing Strategy
- Integration tests per module with seeded DB
- Contract tests for public API and mobile client compatibility
- Load testing for chat and assistant endpoints

8. Documentation Automation
- Generate OpenAPI spec from route definitions or migration to framework with auto-swagger support
- Publish Postman + OpenAPI in CI

---

## 9. Environment Variables (Observed + Recommended)

Observed in code:
- `PORT`
- `MONGODB_URI`
- `GROQ_API_KEY`
- `JWT_SECRET`
- `JWT_EXPIRES_IN`
- `AI_SERVICE_URL`
- `AI_PUBLIC_BASE_URL`

Recommended additions:
- `CORS_ORIGINS`
- `SOCKET_CORS_ORIGINS`
- `RATE_LIMIT_WINDOW_MS`
- `RATE_LIMIT_MAX`
- `REDIS_URL`
- `LOG_LEVEL`
- `NODE_ENV` strict validation

---

## 10. Summary
The backend already covers a large functional surface (identity, content, commerce-like flows, social features, chat, and AI integration). Its immediate architectural strengths are modular route separation, DTO validation, JWT + RBAC, and broad domain support. The most valuable next steps are production hardening (rate limits, CORS tightening, standardized response contracts), extracting a formal service layer, and introducing caching + queue-backed asynchronous workflows for predictable scale.
