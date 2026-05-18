# Anubis (Revive Egypt)

> A tourism and culture platform for Egyptian museums — artifact discovery, AI-powered recognition, social community, real-time chat, AR/3D viewing, and a full admin control plane.

**Stack:** TypeScript/Node · Expo React Native · Python FastAPI · DINOv2 · Stable Diffusion · Socket.IO · Groq LLM · ElevenLabs TTS

---

## Features

### Multilingual & RTL/LTR Support
The entire application is multilingual and supports both right-to-left (Arabic) and left-to-right (English, French, German, Chinese) layouts. Language direction is applied globally across all screens, components, and navigation flows.

### Artifact Recognition
Upload or capture any image. DINOv2 embeddings match it against the artifact database and return identity, confidence score, and full metadata.

### AI Restoration & Reconstruction
Stable Diffusion pipelines reconstruct and restore damaged or incomplete artifacts from a single image, with a preview URL returned to the frontend.

### AI Virtual Guide (Voice Agent)
Per-artifact audio narration backed by ElevenLabs TTS. Includes short descriptions, extended transcripts, timed cue-points for guided walkthroughs, and offline audio caching. The guide is presented as a fully rigged 3D character model that animates and lip-syncs in real time alongside the narration.

### AR / 3D Viewer
View artifacts in augmented reality via `expo-three`. Supports glTF/GLB (primary), USDZ (iOS Quick Look), and OBJ formats with Draco compression. Features orbit controls, lighting presets, annotations, and texture switching.

### Multilingual AI Assistant
Conversational chatbot at `/ai/chatbot` backed by Groq LLM with model fallback strategy. Supports Arabic, English, French, German, and Chinese.

### Real-Time Chat Messaging
Direct messaging between users via Socket.IO. Includes conversation lists, unread counts, read receipts, instant delivery via per-user socket rooms, and inline message translation via MyMemory API.

### Social Community
Community feed with posts, likes, and comments. Friend graph with send/accept/reject requests and friendship status. User profiles and notifications.

### Museum & Artifact Discovery
Browse museums and artifacts with filtering, detail views, map integration via Google Maps API, and nearby places discovery.

### Events
Browse and view museum events with date handling and museum linking.

### Reviews
Submit and read museum reviews. One review per user per museum, with average rating computation.

### Volunteering & Donations
Browse and sign up to volunteering opportunities. View and interact with donation campaigns.

### Marketplace
Browse products with local cart and checkout UI.

### Ticketing
Ticket browsing, checkout screens, and QR code display.

### Admin Dashboard
Full operational control plane built inside the Expo app (responsive for desktop/web). Covers content management, moderation, volunteer operations, user administration, analytics KPI cards, bar charts, and CSV export.

---

## Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| Frontend | React Native, Expo, Expo Router | Cross-platform mobile app and navigation |
| Frontend (3D) | three.js, @react-three/fiber, @react-three/drei, expo-three | 3D model viewing, AR, WebGL |
| 3D Formats | glTF/GLB, USDZ, OBJ, Draco | Model formats and optimized delivery |
| Backend | Node.js, Express.js, TypeScript | REST API and business logic |
| Database | MongoDB, Mongoose | Persistence and ORM |
| Realtime | Socket.IO | Live chat messaging |
| Auth | JWT | Authentication and RBAC |
| AI Service | Python FastAPI | AI microservice endpoint |
| Recognition | DINOv2 | Artifact image recognition |
| Restoration | Stable Diffusion | Visual artifact reconstruction |
| Assistant | Groq LLM, Groq Chat Completions API | Conversational AI |
| Translation | MyMemory Translation API | Inline chat message translation |
| TTS / Voice | ElevenLabs | Text-to-speech for virtual guide |
| External APIs | Google Maps API, Sketchfab API | Navigation, location, hosted 3D models |
| Charts | Recharts | Admin dashboard bar charts and KPI cards |
| 3D Tools | Blender, glTF-Pipeline | Model creation and optimization |
| DevOps | GitHub Actions, Docker | CI/CD and containerization |

---

## Architecture

```
/
├── AI_Enhancement/     Python FastAPI AI microservice
├── backend/            Node.js + Express + MongoDB REST API
└── frontend/           Expo React Native app + Admin dashboard
```

### Backend Modules

`auth` · `users` · `museums` · `artifacts` · `tickets` · `events` · `restored-artifacts` · `chat` · `assistant` · `reviews` · `donations` · `volunteers` · `tour-guides` · `posts` · `marketplace` · `friends` · `ai`

### Database Entities

`User` · `Museum` · `Artifact` · `Ticket` · `Event` · `Review` · `Donation` · `Campaign` · `Volunteer` · `Opportunity` · `TourGuide` · `Post` · `Message` · `FriendRequest` · `Product` · `RestoredArtifact`

---

## Quick Start

Run each service in a separate terminal.

### 1. AI Service

**macOS / Linux:**
```bash
cd AI_Enhancement
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

**Windows (PowerShell):**
```powershell
cd AI_Enhancement
python -m venv .venv
.venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Runs at `http://localhost:8000`

### 2. Backend

```bash
cd backend
npm install
npm run dev
```

Runs at `http://localhost:4000`

### 3. Frontend

```bash
cd frontend
npm install
npx expo start
```

Use Expo dev tools to open on Android, iOS simulator, or web. The admin dashboard is available on the web/desktop layout at `/admin` (requires admin role).

---



## Security

- JWT authentication for all protected REST endpoints and Socket.IO handshake
- Role-based access control (visitor / guide / admin) enforced in backend middleware
- DTO validation on all request bodies; invalid input returns controlled 4xx
- Passwords hashed on registration, verified on login
- Secrets and API keys are environment-driven
- Socket events emitted to per-user rooms to limit message visibility
- Soft-delete (`isActive`) patterns used across multiple domains to avoid destructive operations

---

## Developer Notes

- Run scripts in `AI_Enhancement/app/scripts/` to generate `embeddings.npy` and `artifact_ids.json` before calling recognition endpoints.
- DINOv2 models download from Hugging Face on first run. Ensure internet access or pre-cache models.
- Stable Diffusion model IDs, image size, steps, and strengths are configured in `AI_Enhancement/app/config.py`.
- Prefer streaming glTF from a CDN to reduce app bundle size; fall back to embedded models for offline mode.
- Provide low/medium/high LOD models for performance on weaker devices.

---

## Troubleshooting

**Models not loading / slow startup**
Large models download on first run. Use a machine with sufficient RAM or pre-cache models locally.

**CUDA / GPU issues**
Ensure your Python environment uses a CUDA-enabled `torch` build. Without GPU, inference still works but will be slower.

**Missing artifact embeddings**
Run the indexing scripts to generate `embeddings.npy` and `artifact_ids.json` before calling any recognition endpoint.

**Admin dashboard not accessible**
The admin guard checks `GET /api/users/me` for an admin role. Ensure the user account has admin role set and the token is valid.

---

## Contributing

1. Create a branch from `main`
2. Add tests for new functionality where appropriate
3. Open a PR with a clear description of your changes