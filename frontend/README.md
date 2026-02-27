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

1. Find your computer local IP (for example `192.168.1.20`)
2. Update `API_BASE_URL` in `app/api/client.js` to:
   - `http://192.168.1.20:4000`
3. Restart Expo (`npm run start`)

## Project scripts

- `npm run start` → Start Expo dev server
- `npm run android` → Build/run on Android
- `npm run ios` → Build/run on iOS
- `npm run web` → Run web version
