
Since the temples repo is already a React + Vite SPA (with Leaflet maps and React Router), the cheapest, lowest-risk path to both iPhone and Android isn't a rewrite — it's wrapping the existing app with **Capacitor**, starting as a PWA before you even touch native shells. Here's the phased roadmap:Underlying details:

**Why Capacitor over React Native / native rewrite**

- Your repo is already React 19 + Vite 8 + React Router 7 + Leaflet — Capacitor consumes the built web output directly, so there's no component-model rewrite (React Native uses different primitives like `<View>`/`<Text>`, not HTML/CSS).
- Leaflet maps render fine inside Capacitor's WebView; no map library swap needed at this stage.
- If you later hit real limitations (heavy map performance, deep native gestures), that's the point to evaluate migrating specific screens to Expo/React Native — not before.
- You'd previously explored Claude Code + Xcode for Swift/SwiftUI — that stays as a fallback "full native rewrite" option if the app's needs outgrow a WebView shell, but it's the most expensive path in time, so it's last on the list, not first.

**Cost breakdown**

- Free: PWA setup, Capacitor add-in, local builds/testing on your own devices via Xcode and Android Studio.
- $99/year: Apple Developer Program — required only when you're ready to distribute via TestFlight or the App Store.
- $25 one-time: Google Play Console — required only when you're ready to publish to Play Store (internal testing tracks are free before that).
- No cost difference between "wrap the web app" and "publish it" — the store fees are the same regardless of Capacitor vs. a full native rewrite.

**CI/CD note**

- Since umamags/temples is a public repo, GitHub Actions runners (including macOS, needed for iOS builds) are free with no minute limits — you can extend your existing GitHub Actions pipeline (currently deploying to GoDaddy) to also build Capacitor iOS/Android artifacts on push.
- Android builds can run on the standard Linux runner; iOS builds need the macOS runner, which is where Capacitor + `xcodebuild` fits in.

**Suggested first concrete step**

- Add the PWA manifest + service worker to the existing `temples` repo this week — it's free, low-risk, and immediately testable on your own phone without any store involvement.Want me to go ahead and draft the actual `manifest.json` + service worker for the PWA step, or the Capacitor config to add to the repo?
