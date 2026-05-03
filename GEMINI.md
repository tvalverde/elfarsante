# Project: El Farsante 🕵️‍♂️

## Overview
El Farsante is a local hidden-role game (Social Deduction). It uses a "pass-and-play" mechanic on a single device.

## Core Technical Mandates

### 1. State Persistence & Initialization
- **Lazy Initialization:** Always initialize `useReducer` or `useState` that depends on `localStorage` using a lazy initializer function (passed as the 3rd argument to `useReducer`) to avoid hydration mismatches and race conditions with `useEffect` that might overwrite data on mount.
- **Global State:** The `GameStateContext` is the source of truth. It must persist the entire state to `localStorage` under the key `elfarsante_state`.
- **Draft Persistence:** Temporary inputs (like player names in `HomeScreen`) must be persisted independently (e.g., `elfarsante_draft_players`) to prevent data loss before the game starts.

### 2. Player & Role Management
- **Stable IDs & Scores:** When starting a new round, always attempt to preserve player IDs and Scores from the previous round by matching names in the state.
- **Role Assignment Sync:** The `round.farsanteIds` array must always be derived from the actual IDs assigned to players in the `players` array. Never use hardcoded or separate index-based IDs.
- **Score Integrity:** Do not reset scores to zero when moving from `PUNTUACIONES` to `HOME` and starting a new round.

### 3. Architecture & UI
- **Phase-Based Navigation:** The app is a Single Page Application (SPA) driven by a `Phase` string in the global state.
- **Visual Hierarchy (Game Board):** In `DebateScreen`, prioritize controls (Timer and "Stop" button) by placing them at the top. The player list should follow below to remain accessible regardless of the number of players.
- **Screen Wake Lock:** Use the `useWakeLock` hook in `App.tsx` to prevent the screen from turning off during the `DEBATE` phase. This API is only available in HTTPS environments and requires user interaction before it can be activated.
- **Cyber-Noir Design System:**
  - Background: `#0D0D12` (Black).
  - Primary: Cyan Electric (drop shadows, neon glows).
  - Secondary: Crimson Red (errors, warnings).
  - Fonts: *Space Grotesk* for headings, *Plus Jakarta Sans* for body text.
- **Responsiveness:** Optimized primarily for mobile viewport (PWA/Mobile-First approach).

## Common Pitfalls to Avoid
- **ID Mismatch:** Avoid generating new IDs for existing players, as it breaks role detection and score tracking.
- **State Overwrite:** Never set initial state in `useEffect` if a save-to-storage `useEffect` is also active, as it will trigger a save of the empty state before the load finishes.
- **Reset on Refresh:** Ensure the `RESTORE_PROMPT` phase is correctly handled in `initGameState` to allow users to recover active rounds.
