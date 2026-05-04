# Project: El Farsante 🕵️‍♂️

## Overview

El Farsante is a local hidden-role game (Social Deduction). It uses a "pass-and-play" mechanic on a single device.

## Core Technical Mandates

### 1. State Persistence & Initialization

- **Build Verification:** Always run `npm run build` after any code change to ensure TypeScript consistency and build stability.
- **Lazy Initialization:** Always initialize `useReducer` or `useState` that depends on `localStorage` using a lazy initializer function (passed as the 3rd argument to `useReducer`) to avoid hydration mismatches and race conditions with `useEffect` that might overwrite data on mount.
- **Global State:** The `GameStateContext` is the source of truth. It must persist the entire state to `localStorage` under the key `elfarsante_state`.
- **Draft Persistence:** Temporary inputs (like player names in `HomeScreen`) must be persisted independently (e.g., `elfarsante_draft_players`) to prevent data loss before the game starts.

### 2. Player & Role Management

- **Stable IDs & Scores:** When starting a new round, always attempt to preserve player IDs and Scores from the previous round by matching names in the state.
- **Role Assignment Sync:** The `round.farsanteIds` array must always be derived from the actual IDs assigned to players in the `players` array. Never use hardcoded or separate index-based IDs.
- **Weighted Fairness (3 Players):** In games with exactly 3 players, use a weighted system (tickets) to select the Farsante. The previous Farsante gets 1 ticket, while others get 4 tickets. This reduces consecutive repeats to ~11% without making them impossible. For games with > 3 players, use pure randomness.
- **Score Integrity:** Do not reset scores to zero when moving from `PUNTUACIONES` to `HOME` and starting a new round.

### 3. Architecture & UI

- **Phase-Based Navigation:** The app is a Single Page Application (SPA) driven by a `Phase` string in the global state.
- **Visual Hierarchy (Sticky UX):** Maintain the "sticky bottom" pattern for primary action buttons (Play, Stop & Accuse, Next Round). Use a `fixed` container with a `bg-gradient-to-t` overlay and appropriate bottom padding (`pb-[120px]` or `pb-[180px]`) on the scrollable content to ensure no elements are hidden.
- **Zero Native Alerts:** Never use `window.alert()`. Use the `useToast()` hook for ephimeral feedback/errors and `NeonModal` for complex interactions or documentation.
- **Screen Wake Lock:** Use the `useWakeLock` hook in `App.tsx` to prevent the screen from turning off during the `DEBATE` phase. This API is only available in HTTPS environments and requires user interaction before it can be activated.
- **Cyber-Noir Design System:**
  - Background: `#0D0D12` (Black).
  - Primary: Cyan Electric (drop shadows, neon glows).
  - Secondary: Crimson Red (errors, warnings).
  - Fonts: _Space Grotesk_ for headings, _Plus Jakarta Sans_ for body text.
- **Responsiveness:** Optimized primarily for mobile viewport (PWA/Mobile-First approach).

### 4. Deployment & Versioning

- **Semantic Versioning:** The project uses automatic semantic versioning (patch).
- **Deployment Flow:** The `npm run deploy` command MUST execute `npm version patch` BEFORE `npm run build` to ensure the correct version is injected into the production bundle.
- **PWA Integrity:** Maintain `public/manifest.json` and ensure PNG icons (`192x192` and `512x512`) are synced with the `favicon.svg` design for cross-browser mobile compatibility.

## Common Pitfalls to Avoid

- **ID Mismatch:** Avoid generating new IDs for existing players, as it breaks role detection and score tracking.
- **State Overwrite:** Never set initial state in `useEffect` if a save-to-storage `useEffect` is also active, as it will trigger a save of the empty state before the load finishes.
- **Reset on Refresh:** Ensure the `RESTORE_PROMPT` phase is correctly handled in `initGameState` to allow users to recover active rounds.
- **Orphan Categories:** When adding new categories in `dictionary.ts`, always ensure they are registered in the `AVAILABLE_CATEGORIES` constant in `HomeScreen.tsx` to make them visible in the UI.
- **Duplicated Names:** Always validate name uniqueness before starting a game to prevent ID collision in the state.

### 5. Hardware Compatibility (Audio & Haptics)

- **Haptic Feedback:** The `navigator.vibrate` API only works in Chromium-based browsers (Chrome, Edge) on Android. Firefox (Android) and Safari (iOS) have this functionality disabled or not implemented.
- **Audio Autoplay:** Sound playback (both MP3 and synthetic) requires prior user interaction (click/tap) on the page. The first button pressed (e.g., "Start") will enable audio for the entire session.
- **Synthetic Fallback:** The system uses the `Web Audio API` to generate electronic tones if physical `.mp3` files are missing from `public/sfx/`.
