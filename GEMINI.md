# Project: El Farsante 🕵️‍♂️

## Overview

El Farsante is a local hidden-role game (Social Deduction). It uses a "pass-and-play" mechanic on a single device.

## Core Technical Mandates

### 1. State Persistence & Initialization

- **Build Verification:** Always run `npm run build` after any code change to ensure TypeScript consistency and build stability.
- **Lazy Initialization:** Always initialize `useReducer` or `useState` that depends on `localStorage` using a lazy initializer function (passed as the 3rd argument to `useReducer`) to avoid hydration mismatches and race conditions with `useEffect` that might overwrite data on mount.
- **Global State:** The `GameStateContext` is the source of truth. It must persist the entire state to `localStorage` under the key `elfarsante_state`.
- **Draft Persistence:** Temporary inputs (like player names in `HomeScreen`) must be persisted independently (e.g., `elfarsante_draft_players`) to prevent data loss before the game starts.
- **Persistent Word History:** Maintain a history of used words in `state.usedWords`, mapped by category.
  - When a category's word list is exhausted, trigger `CLEAR_CATEGORY_WORDS`, notify the user via `showToast` ('info'), and restart from the full list.
  - Words must be added to history only when transitioning to the `PUNTUACIONES` phase.

### 2. Player & Role Management

- **Stable IDs & Scores:** When starting a new round, always attempt to preserve player IDs and Scores from the previous round by matching names in the state.
- **Role Assignment Sync:** The `round.farsanteIds` array must always be derived from the actual IDs assigned to players in the `players` array. Never use hardcoded or separate index-based IDs.
- **Weighted Fairness (3 Players):** In games with exactly 3 players, use a weighted system (tickets) to select the Farsante. The previous Farsante gets 1 ticket, while others get 4 tickets. This reduces consecutive repeats to ~11% without making them impossible. For games with > 3 players, use pure randomness.
- **Score Integrity:** Do not reset scores to zero when moving from `PUNTUACIONES` to `HOME` and starting a new round.
- **Identity Revelation:** In the `RESULTADO` phase, the identity of the Farsantes must only be revealed to all players if the game ends (e.g., Farsantes win by numbers).
- **Player Limits:** Player names must be limited to **15 characters**. Use `maxLength={15}` and placeholders like `"Nombre (máx. 15)"`.

### 3. Architecture & UI

- **Design System Compliance:** All generated code and UI components must strictly adhere to the technical specifications, tokens, and visual principles defined in `DESIGN.md`. If a user request conflicts with `DESIGN.md`, prioritize the documented design and alert the user.
- **Phase-Based Navigation:** The app is a Single Page Application (SPA) driven by a `Phase` string in the global state.
- **Auto-Scroll Navigation:** Always perform a `window.scrollTo({ top: 0, left: 0, behavior: 'smooth' })` when `currentPhase` changes (e.g., in `App.tsx`).
- **Visual Hierarchy (Sticky UX):** Maintain the "sticky bottom" pattern for primary action buttons (Play, Stop & Accuse, Next Round). Use a `fixed` container with a `bg-gradient-to-t` overlay and appropriate bottom padding (`pb-[120px]` or `pb-[180px]`) on the scrollable content to ensure no elements are hidden.
- **Zero Native Alerts:** Never use `window.alert()` or `confirm()`. Use the `useToast()` hook for ephimeral feedback/errors and `NeonModal` for complex interactions or documentation.
- **Immersive Mobile UX:**
  - The `manifest.json` must use `"display": "fullscreen"`.
  - When the user taps "¡JUGAR!", trigger `document.documentElement.requestFullscreen()` specifically for mobile devices (via UA detection) **ONLY if not already in standalone mode** (PWA).
- **Category UI:** The "Aleatorio" category must be visually distinct (e.g., solid background vs. outline) to mark its special status.
- **Component Styling:** Interactive elements like "Añadir jugador" must have visible borders and backgrounds to look like clickable buttons. Distribution cards should use `max-w-xs` to maximize readability.
- **Screen Wake Lock:** Use the `useWakeLock` hook in `App.tsx` to prevent the screen from turning off during the `DEBATE` phase. This API is only available in HTTPS environments and requires user interaction before it can be activated.
- **Cyber-Noir Design System:** Adhere strictly to the `DESIGN.md` specification for colors, typography, and spacing to maintain a unified visual identity.
- **Responsiveness:** Optimized primarily for mobile viewport (PWA/Mobile-First approach).

### 4. Deployment & Versioning

- **Strict Technical Language:** All code, comments, commit messages, and documentation MUST be in English. Spanish is reserved ONLY for the game's UI and conversational interaction.
- **Conditional Deployment:** NEVER run `npm run deploy` if the changes only affect documentation, repository configuration (e.g., `.gitignore`), or internal meta-files. Deployment is strictly for functional game logic or UI updates.
- **Meaningful Commits:** Commit messages MUST describe the actual changes or features implemented. Avoid referencing internal "phases" or "stages" (e.g., "Phase 1"). Always use the imperative mood (e.g., "feat: implement word history") and adhere to Conventional Commits.
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

### 6. Code Quality & CI Hooks

- **Hook Maintenance:** Before committing, ensure all modified file types are covered by the `lint-staged` configuration in `package.json` (e.g., if editing `.html` or `.yml`, they must be included). This ensures the git hook formats the code and prevents CI pipeline failures.
- **Strict Formatting:** Maintain strictly formatted code using Prettier. When in doubt, run `npm run format` locally.
  lways run `npm run format` and `npx eslint . --fix` before preparing a commit to proactively prevent CI failures and maintain style consistency.
- **Strict Formatting:** Maintain strictly formatted code using Prettier. When in doubt, run `npm run format` locally.
