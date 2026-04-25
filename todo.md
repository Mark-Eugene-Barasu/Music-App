# Google Play Publishing Checklist ✅

A step-by-step guide to publish BeatWave to Google Play Store.

---

## Phase 1 — Prepare Your Accounts

- [ ] Create a free [Expo account](https://expo.dev/signup)
- [ ] Pay the one-time $25 fee and create a [Google Play Developer account](https://play.google.com/console/signup)
- [ ] Wait for Google to verify your developer account (can take up to 48 hours)

---

## Phase 2 — Set Up EAS (Expo Application Services)

- [ ] Install EAS CLI globally
  ```bash
  npm install -g eas-cli
  ```
- [ ] Log in to your Expo account
  ```bash
  eas login
  ```
- [ ] Navigate to your project folder
  ```bash
  cd "Music App/MusicApp"
  ```
- [ ] Initialize EAS in the project (creates `eas.json`)
  ```bash
  eas build:configure
  ```
  When prompted, select **Android** and accept all defaults.

---

## Phase 3 — Configure `app.json`

- [ ] Open `MusicApp/app.json`
- [ ] Set a unique Android package name (must be globally unique, like a reverse domain)
  ```json
  "package": "com.yourname.beatwave"
  ```
  > ⚠️ Once published, this package name can NEVER be changed.
- [ ] Replace the placeholder project ID with the one shown after `eas build:configure`
  ```json
  "projectId": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
  ```
- [ ] Confirm the app version and version code
  ```json
  "version": "1.0.0",
  "versionCode": 1
  ```
  > Each new release to Google Play must increment `versionCode` by at least 1.

---

## Phase 4 — App Icons & Splash Screen

- [ ] Create a **1024×1024 px** PNG icon (no rounded corners — Google adds them)
- [ ] Replace `assets/icon.png` with your icon
- [ ] Replace `assets/adaptive-icon.png` with your icon (used on Android home screen)
- [ ] Replace `assets/splash-icon.png` with your splash/loading screen image
- [ ] Make sure none of the images have transparent backgrounds for the icon files

---

## Phase 5 — Build the Android App Bundle (AAB)

- [ ] Run the production build (builds in Expo's cloud, no Android Studio needed)
  ```bash
  eas build --platform android --profile production
  ```
- [ ] Wait ~10–15 minutes for the build to complete
- [ ] When done, download the `.aab` file from the link shown in the terminal
  or go to [expo.dev](https://expo.dev) → your project → Builds → download the `.aab`

---

## Phase 6 — Prepare Store Listing Assets

Before uploading to Google Play, prepare the following:

- [ ] **Short description** — max 80 characters (e.g. "Play all your music with a beautiful dark player")
- [ ] **Full description** — max 4000 characters describing all features
- [ ] **Screenshots** — at least 2 phone screenshots (minimum 320px, maximum 3840px on any side)
  - Take screenshots on your phone while running the app via Expo Go
  - Recommended: Home screen, Player screen, Search screen, Library screen
- [ ] **Feature graphic** — 1024×500 px banner image (shown at top of your Play Store page)
- [ ] **App category** — Music & Audio
- [ ] **Email address** — a support/contact email that will be public on the store listing

---

## Phase 7 — Create the App on Google Play Console

- [ ] Go to [Google Play Console](https://play.google.com/console)
- [ ] Click **Create app**
- [ ] Fill in:
  - App name: `BeatWave`
  - Default language: English (or your preferred language)
  - App or game: **App**
  - Free or paid: **Free**
- [ ] Check both declaration boxes and click **Create app**

---

## Phase 8 — Complete the Store Listing

In the left sidebar go to **Grow → Store presence → Main store listing**:

- [ ] Add short description
- [ ] Add full description
- [ ] Upload screenshots (at least 2)
- [ ] Upload feature graphic (1024×500 px)
- [ ] Set app icon (512×512 px — can be the same as your `icon.png` resized)
- [ ] Click **Save**

---

## Phase 9 — Fill In Required Sections

Google Play requires these sections before you can publish. Find them in the left sidebar:

- [ ] **App content → Privacy policy** — create a simple privacy policy and paste the URL
  > Free tool: [privacypolicygenerator.info](https://privacypolicygenerator.info)
- [ ] **App content → Ads** — select "No, my app does not contain ads"
- [ ] **App content → Content rating** — click "Start questionnaire", answer questions (select Music category), submit to get your rating
- [ ] **App content → Target audience** — select age group (18+ recommended for general audience)
- [ ] **App content → News apps** — select "No, my app is not a news app"
- [ ] **App content → COVID-19 contact tracing** — select "No"
- [ ] **Store settings → Category** — select **Music & Audio**
- [ ] **Store settings → Contact details** — add your support email address

---

## Phase 10 — Upload the AAB and Create a Release

- [ ] In the left sidebar go to **Release → Production**
- [ ] Click **Create new release**
- [ ] Click **Upload** and select the `.aab` file you downloaded in Phase 5
- [ ] Wait for the AAB to process (1–2 minutes)
- [ ] Add release notes (e.g. "Initial release of BeatWave music player")
- [ ] Click **Save** then **Review release**
- [ ] Fix any warnings shown (errors must be fixed, warnings can sometimes be ignored)
- [ ] Click **Start rollout to Production**
- [ ] Confirm by clicking **Rollout**

---

## Phase 11 — Wait for Review

- [ ] Google will review your app — this typically takes **1–3 days** for a new app
- [ ] You will receive an email when the app is approved or if there are issues
- [ ] Once approved, your app will be live on Google Play within a few hours
- [ ] Search for "BeatWave" on Google Play to confirm it's live 🎉

---

## Phase 12 — After Publishing (Ongoing)

- [ ] Share your Google Play link with friends and family
- [ ] Monitor **Android vitals** in Play Console for crashes or ANRs
- [ ] For any update: increment `versionCode` in `app.json`, run `eas build` again, upload new `.aab` to a new release
- [ ] Respond to user reviews in the Play Console

---

## Quick Reference — Key Commands

| Task | Command |
|------|---------|
| Install EAS CLI | `npm install -g eas-cli` |
| Log in to Expo | `eas login` |
| Configure EAS | `eas build:configure` |
| Build for Android | `eas build --platform android --profile production` |
| Run locally | `npx expo start` |

---

## Common Issues & Fixes

| Problem | Fix |
|---------|-----|
| Build fails with "package name taken" | Change `"package"` in `app.json` to something more unique |
| "versionCode already used" error | Increment `versionCode` by 1 in `app.json` |
| App rejected for missing privacy policy | Create one at privacypolicygenerator.info and add the URL |
| Screenshots rejected | Make sure they are at least 320px and no larger than 3840px on any side |
| "You need to sign your app" | EAS handles this automatically — make sure you used `eas build`, not a local build |
