# Anubis Frontend (Expo)

This folder contains the mobile/web frontend for the Anubis project, built with **Expo + React Native + Expo Router**.

## Prerequisites

- Node.js (LTS recommended)
- npm
- Expo Go app on your phone (optional, for physical device testing)
- Android Studio / Xcode (optional, for emulator/simulator)

## 1) Install dependencies

From the `frontend` folder:

```bash
npm install
```

## 2) Start the app

```bash
npm run start
```

This opens the Expo dev server. From there you can run:

- **Android emulator/device**: press `a`
- **iOS simulator** (macOS): press `i`
- **Web**: press `w`
- Or scan the QR code with Expo Go

You can also run directly:

```bash
npm run android
npm run ios
npm run web
```

## 3) Backend requirement

The frontend API client uses:

- `http://localhost:4000`

Configured in:

- `app/api/client.js`

So make sure the backend is running on port `4000`.

## If testing on a physical phone

`localhost` points to the phone itself, not your computer. If API requests fail on a real device:

1. Find your computer local IP (for example your LAN IP)
2. Update `API_BASE_URL` in `app/api/client.js` to:
   - `http://<your-pc-ip>:4000`
3. Restart Expo (`npm run start`)

## Hosted Quick Look for iPhone AR

To open Quick Look directly from iPhone, set this environment variable before starting Expo:

```bash
EXPO_PUBLIC_QUICK_LOOK_BASE_URL=https://your-hosted-domain.example
```

That hosted site must serve the files in `public/quick-look/` and `assets/models/` over HTTPS.
The iPhone AR button will then open the hosted Quick Look page in Safari.

If the variable is not set, the app will show a setup hint instead of opening the share sheet.

## Project scripts

- `npm run start` → Start Expo dev server
- `npm run android` → Build/run on Android
- `npm run ios` → Build/run on iOS
- `npm run web` → Run web version
