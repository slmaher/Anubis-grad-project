# Anubis Project

Full-stack project with:

- `backend/` → Node.js + Express + MongoDB API
- `frontend/` → Expo + React Native app

## Project Structure

- `backend` : REST API, auth, data models, seed scripts
- `frontend` : Mobile/Web app (Expo Router)

## Prerequisites

- Node.js (LTS recommended)
- npm
- MongoDB (local or Atlas)
- Expo Go app (optional for testing on physical device)
- Android Studio / Xcode (optional for emulator/simulator)

## Revive Egypt – Backend

Node.js + Express + MongoDB (Mongoose) backend for the **Revive Egypt** museum-focused platform.

### Technology Stack

| Layer            | Technology / Tool                                           | Purpose                                                                     |
| ---------------- | ----------------------------------------------------------- | --------------------------------------------------------------------------- |
| Frontend         | React Native, Expo                                          | Cross-platform mobile application                                           |
| Frontend         | Expo Router                                                 | Navigation and screen management                                            |
| Frontend (3D)    | three.js, @react-three/fiber, @react-three/drei, expo-three | 3D model viewing and interactive WebGL viewers (Sketchfab embeds, GLTF/GLB) |
| Assets / Formats | glTF/GLB, USDZ, OBJ, Draco compression                      | 3D model formats and optimized delivery                                     |
| Backend          | Node.js, Express.js, TypeScript                             | RESTful API and business logic                                              |
| Backend          | MongoDB, Mongoose                                           | Database and ORM                                                            |
| Backend          | Socket.IO                                                   | Real-time messaging                                                         |
| Backend          | JWT                                                         | Authentication and authorization                                            |
| AI Service       | Python FastAPI                                              | AI microservice endpoint                                                    |
| AI Service       | DINOv2                                                      | Artifact recognition                                                        |
| AI Service       | Stable Diffusion                                            | Artifact visual reconstruction                                              |
| Tools            | Blender, glTF-Pipeline                                      | 3D model creation and optimization tools                                    |
| TTS / Voice      | ElevenLabs                                                  | Text-to-speech voice agent; cached audio in `tmp/elevenlabs_tts_cache`      |
| External APIs    | Google Maps API, Sketchfab API                              | Navigation, location, and hosted 3D models                                  |
| DevOps           | GitHub Actions, Docker                                      | CI/CD and containerization                                                  |
| Chatbot / Assistant | Groq LLM, Groq Chat Completions API, @google/generative-ai, MyMemory Translation API | Conversational AI backend used by `/api/assistant/chat`; translation helper via MyMemory |
| Charts / Analytics  | Recharts                                                      | Frontend charting library used in admin dashboard (bar charts, KPI cards) |
| CSV Logging & Export| Frontend CSV builder (admin), Python `csv` module (AI_Enhancement) | Admin CSV export (`frontend/app/admin/index.jsx`) and AI experiment tracking (`AI_Enhancement/app/services/local_reconstruction_utils.py`) |

### Getting Started

1. Install dependencies:

```bash
cd backend
npm install
```

2. Run the development server:

```bash

npm run dev
```

The API will be available at `http://localhost:4000`

<!--
3. (Optional) Seed the database with real Egyptian museums:

```bash
npm run seed
``` -->

## 2) Run Frontend

From `frontend` folder:

```bash
cd frontend
npm install
npx expo start
```

Expo shortcuts:

- `a` → Android
- `i` → iOS (macOS)
- `w` → Web

Or run directly:

```bash
npm run android
npm run ios
npm run web
```

## 3) Connect Frontend to Backend

Frontend API base URL is set in:

- `frontend/app/api/client.js`

## Quick Start (both)

Open two terminals:

Terminal 1:

```bash
cd backend
npm install
npm run dev
```

Terminal 2:

```bash
cd frontend
npm install
npm run start
```
