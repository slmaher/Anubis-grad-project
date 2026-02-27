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

### Stack
- Node.js
- Express
- MongoDB + Mongoose
- TypeScript
- JWT authentication
- Role-based access control (planned)
- REST API

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
