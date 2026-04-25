# BeatWave 🎵

A full-featured Android music player app built with React Native (Expo). Plays audio files from your device storage with a clean dark UI.

## Features
- Plays all audio files from device storage
- Full-screen player with seek bar, shuffle, repeat (none / all / one)
- Mini player bar on all screens
- Search by song title or artist
- Library with sort by Title / Artist / Duration
- Background audio playback

---

## Prerequisites
- Node.js 18+
- [Expo CLI](https://docs.expo.dev/get-started/installation/): `npm install -g expo-cli`
- [EAS CLI](https://docs.expo.dev/eas/): `npm install -g eas-cli`
- An [Expo account](https://expo.dev/signup) (free)
- A [Google Play Developer account](https://play.google.com/console) ($25 one-time fee)

---

## Local Development

```bash
cd MusicApp
npm install
npx expo start
```

Scan the QR code with the **Expo Go** app on your Android device.

---

## Build for Google Play

### 1. Create Expo account & log in
```bash
eas login
```

### 2. Configure EAS
```bash
eas build:configure
```
This creates `eas.json`. Accept defaults.

### 3. Update `app.json`
- Change `"package"` to your unique ID, e.g. `"com.yourname.beatwave"`
- Replace `"your-eas-project-id"` with the ID shown after `eas build:configure`

### 4. Build the AAB (Android App Bundle)
```bash
eas build --platform android --profile production
```
This builds in the cloud. Takes ~10–15 minutes. Download the `.aab` file when done.

### 5. Add app icons & splash screen
Replace these files with your own 1024×1024 PNG images:
- `assets/icon.png`
- `assets/adaptive-icon.png`
- `assets/splash-icon.png`

### 6. Publish to Google Play
1. Go to [Google Play Console](https://play.google.com/console)
2. Create a new app → Android → Free
3. Fill in store listing (title, description, screenshots)
4. Go to **Production** → **Create new release**
5. Upload the `.aab` file from step 4
6. Complete content rating questionnaire
7. Set pricing to Free
8. Submit for review (usually 1–3 days)

---

## Project Structure
```
MusicApp/
├── App.js                        # Root with navigation
├── app.json                      # Expo / Google Play config
├── src/
│   ├── context/PlayerContext.js  # Global audio player state
│   ├── hooks/useMediaLibrary.js  # Device music loader
│   ├── screens/
│   │   ├── HomeScreen.js
│   │   ├── PlayerScreen.js
│   │   ├── SearchScreen.js
│   │   └── LibraryScreen.js
│   ├── components/
│   │   ├── MiniPlayer.js
│   │   └── TrackItem.js
│   └── utils/formatTime.js
└── assets/
```

---

## Customization
| What | Where |
|------|-------|
| App name | `app.json` → `"name"` |
| Package ID | `app.json` → `"android.package"` |
| Accent color | Change `#1DB954` across screen files |
| App icon | Replace `assets/icon.png` |
