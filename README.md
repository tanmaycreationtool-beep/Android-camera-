# Aperture — a minimalist camera app

A clean, single-purpose camera app: live viewfinder, one shutter button, a filmstrip
gallery, and nothing else. Built as a web app and wrapped with [Capacitor](https://capacitorjs.com/)
so it compiles into a real Android APK.

## What's inside

```
www/                 the actual app (HTML/CSS/JS — this is what runs on-device)
  index.html
  style.css
  app.js
capacitor.config.json  tells Capacitor which folder to wrap
package.json
.github/workflows/build-apk.yml   auto-builds a debug APK on every push
```

## Option A — Let GitHub build the APK for you (no local setup)

1. Create a new GitHub repo and upload/push everything in this zip to it.
2. Go to the repo's **Actions** tab. A workflow called "Build Android APK" will run
   automatically on push (or click **Run workflow** to trigger it manually).
3. When it finishes, open the workflow run and download the **aperture-debug-apk**
   artifact — that's your installable `app-debug.apk`.
4. Transfer it to an Android phone and install it (you'll need to allow "install
   from unknown sources" the first time).

This works entirely on GitHub's servers — you don't need Android Studio installed.

## Option B — Build locally

Requirements: [Node.js](https://nodejs.org/) 18+, and either Android Studio or just
the Android command-line SDK + a JDK (17 recommended).

```bash
npm install

# First time only — generates the native android/ project
npx cap add android

# Copies www/ into the native project (run this again after any web changes)
npx cap sync android

# Open in Android Studio to run on a device/emulator or build a signed release...
npx cap open android

# ...or build a debug APK straight from the command line:
cd android
./gradlew assembleDebug
# APK will be at android/app/build/outputs/apk/debug/app-debug.apk
```

## Making changes

Everything user-facing lives in `www/`. Edit `index.html` / `style.css` / `app.js`,
then re-run `npx cap sync android` (or just push to GitHub and let Actions rebuild).

## Notes

- The app uses the browser `getUserMedia` API for the live camera feed and `localStorage`
  to remember your shots between launches. Capacitor's `AndroidManifest.xml` already
  requests camera permission once you run `cap add android`.
- The "flash" toggle in the top bar is a screen-flash effect (fires a bright white
  overlay at capture time), not hardware LED flash control — that keeps the app
  dependency-free. If you want real hardware flash, swap in the
  [`@capacitor/camera`](https://capacitorjs.com/docs/apis/camera) plugin instead of
  raw `getUserMedia`.
- App ID is set to `com.example.aperture` in `capacitor.config.json` — change this
  to your own reverse-domain identifier before publishing anywhere.
