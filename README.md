# Go-Music 🎵

A full-featured Android music player app built with React Native (Expo). Plays all audio files from your device storage with a beautiful dark UI, custom themes, and smart features.

---

## 📲 Install Go-Music on Your Android Phone (APK Method)

No app store needed. Follow these steps to install Go-Music directly on any Android phone.

### Step 1 — Get the APK link
The latest APK is hosted on Google Drive. Ask the developer for the shareable download link or use the direct link if provided.

### Step 2 — Open the link on your Android phone
- Open **Chrome** (or any browser) on your Android phone
- Paste the APK download link and open it
- Tap **Download**

### Step 3 — Allow installation from unknown sources
When you tap the downloaded file, Android may block it since it's not from the Play Store:
- Tap **Settings** when prompted
- Toggle on **"Allow from this source"**
- Go back and tap **Install**

> If you see **"Blocked by Play Protect"** — tap **More details** → **Install anyway**

### Step 4 — Open Go-Music 🎉
- Tap **Open** after installation completes
- Grant storage permission when asked so the app can find your music files
- Enjoy your music!

---

## ✨ Features

- Plays all audio files from device storage
- Full-screen player with seek bar, shuffle, repeat (none / all / one)
- **Gapless playback & crossfade** between tracks
- **Mini player** bar on all screens with skip button
- **Fuzzy search** by song title, artist, or filename — typos are OK!
- **Library** with sort by Title / Artist / Duration
- **Playlists** — create, rename, delete, add/remove tracks
- **Smart Playlists** — Deep Focus, High Energy, Late Night (auto-generated)
- **Karaoke-style lyrics** — paste LRC lyrics and watch them scroll in sync
- **Queue management** — Add to Queue, Play Next (long-press any song)
- **Audio Normalization** — balanced volume across all tracks
- **Sleep Timer** — music stops automatically after a set time
- **Hi-Res / Normal / Data Saver** audio quality modes
- **Wrapped stats** — top tracks and artists with bar chart visualizations
- **Blend playlists** — merge your taste with a friend's
- **Auto-download** top 50 most-played songs for offline playback
- **Background audio** playback
- **Theme customization** — pick any accent color from a color wheel
- **Dark / Light / System** color mode toggle
- Onboarding screen, What's New sheet, and in-app hints for new users

---

## 🛠 Local Development

### Prerequisites
- Node.js 18+
- [Expo CLI](https://docs.expo.dev/get-started/installation/): `npm install -g expo-cli`
- [EAS CLI](https://docs.expo.dev/eas/): `npm install -g eas-cli`
- An [Expo account](https://expo.dev/signup) (free)

### Run locally
```bash
cd MusicApp
npm install
npx expo start
```
Scan the QR code with the **Expo Go** app on your Android device.

---

## 📦 Build a Shareable APK

To build a new `.apk` file anyone can install:

```bash
cd MusicApp
eas login
eas build --platform android --profile preview
```

- Builds in the cloud — no Android Studio needed
- Takes ~10–15 minutes
- When done, download the `.apk` from the link shown in the terminal
- Upload the `.apk` to **Google Drive**, set sharing to **"Anyone with the link"**, and share the link

---

## 🚀 Publish to Google Play Store

To make Go-Music available to everyone on the Play Store:

### 1. Build the AAB
```bash
eas build --platform android --profile production
```

### 2. Create a Google Play Developer account
- One-time **$25** fee at [play.google.com/console](https://play.google.com/console)

### 3. Submit the app
1. Go to [Google Play Console](https://play.google.com/console)
2. Create a new app → Android → Free
3. Fill in store listing (title, description, screenshots)
4. Go to **Production** → **Create new release**
5. Upload the `.aab` file
6. Complete content rating questionnaire
7. Submit for review (usually 1–3 days)

---

## 📁 Project Structure
```
MusicApp/
├── App.js                              # Root with navigation & overlays
├── app.json                            # Expo / EAS config
├── eas.json                            # Build profiles
├── src/
│   ├── context/
│   │   ├── PlayerContext.js            # Global audio player state
│   │   ├── PlaylistContext.js          # Playlist management
│   │   ├── StatsContext.js             # Play stats & Wrapped
│   │   └── ThemeContext.js             # Theme & accent color
│   ├── hooks/
│   │   └── useMediaLibrary.js          # Device music loader & auto-download
│   ├── screens/
│   │   ├── HomeScreen.js
│   │   ├── PlayerScreen.js
│   │   ├── SearchScreen.js
│   │   ├── LibraryScreen.js
│   │   ├── QueueScreen.js
│   │   ├── PlaylistScreen.js
│   │   ├── WrappedScreen.js
│   │   ├── LyricsScreen.js
│   │   ├── SettingsScreen.js
│   │   └── OnboardingScreen.js
│   ├── components/
│   │   ├── MiniPlayer.js
│   │   ├── TrackItem.js
│   │   ├── WhatsNewSheet.js
│   │   └── HintBar.js
│   └── utils/
│       ├── formatTime.js
│       ├── fuzzy.js
│       ├── storage.js
│       ├── lrcParser.js
│       └── contextualPlaylists.js
└── assets/
    ├── icon.png
    ├── adaptive-icon.png
    ├── splash-icon.png
    └── logo.svg
```

---

## 🎨 Customization
| What | Where |
|------|-------|
| App name | `app.json` → `"name"` |
| Package ID | `app.json` → `"android.package"` |
| Accent color | Settings screen → color wheel |
| Dark/Light mode | Settings screen → Color Mode |
| App icon | Replace `assets/icon.png` |
