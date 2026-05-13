---
name: Cyber-Noir Mystery
colors:
  surface: '#0d1516'
  surface-dim: '#0d1516'
  surface-bright: '#333a3c'
  surface-container-lowest: '#080f11'
  surface-container-low: '#151d1e'
  surface-container: '#192122'
  surface-container-high: '#242b2d'
  surface-container-highest: '#2e3638'
  on-surface: '#dce4e5'
  on-surface-variant: '#bac9cc'
  inverse-surface: '#dce4e5'
  inverse-on-surface: '#2a3233'
  outline: '#849396'
  outline-variant: '#3b494c'
  surface-tint: '#00daf3'
  primary: '#c3f5ff'
  on-primary: '#00363d'
  primary-container: '#00e5ff'
  on-primary-container: '#00626e'
  inverse-primary: '#006875'
  secondary: '#c7c5d1'
  on-secondary: '#302f39'
  secondary-container: '#494852'
  on-secondary-container: '#b9b7c3'
  tertiary: '#ffeac0'
  on-tertiary: '#3e2e00'
  tertiary-container: '#fec931'
  on-tertiary-container: '#6f5500'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#9cf0ff'
  primary-fixed-dim: '#00daf3'
  on-primary-fixed: '#001f24'
  on-primary-fixed-variant: '#004f58'
  secondary-fixed: '#e4e1ee'
  secondary-fixed-dim: '#c7c5d1'
  on-secondary-fixed: '#1b1b24'
  on-secondary-fixed-variant: '#464650'
  tertiary-fixed: '#ffdf96'
  tertiary-fixed-dim: '#f3bf26'
  on-tertiary-fixed: '#251a00'
  on-tertiary-fixed-variant: '#594400'
  background: '#0d1516'
  on-background: '#dce4e5'
  surface-variant: '#2e3638'
typography:
  h1:
    fontFamily: Space Grotesk
    fontSize: 40px
    fontWeight: '700'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  h2:
    fontFamily: Space Grotesk
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.2'
    letterSpacing: -0.01em
  body-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.5'
  label-pill:
    fontFamily: Space Grotesk
    fontSize: 14px
    fontWeight: '600'
    lineHeight: '1'
    letterSpacing: 0.05em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 8px
  container-padding: 24px
  element-gap: 16px
  section-margin: 40px
---

## Brand & Style

The brand personality of this design system is built on tension, anonymity, and the high-stakes atmosphere of digital deception. It targets an audience that enjoys social deduction, psychological gaming, and sleek, tech-forward interfaces. The emotional response is one of "focused mystery"—the UI should feel like a secure, underground terminal where players uncover secrets.

The visual style is a hybrid of **Minimalism** and **High-Contrast Bold**. It relies on a "void" philosophy, using the deep Abyssal Black to create an infinite canvas where only critical information and interactable elements "glow" into existence. This creates a focused user experience where the UI recedes and the game's social dynamics take center stage.

## Colors

The palette is strictly designed for pure dark mode performance. The **Abyssal Black** (#0D0D12) background provides the ultimate foundation for contrast, ensuring that the **Electric Cyan** (#00E5FF) accents appear to emit light.

Container surfaces use a **Very Dark Grey** (#16161D) to provide subtle separation from the background without breaking the dark aesthetic. Semantic colors for success and error also follow the "Neon" logic, using high-saturation hues that pierce through the darkness to provide immediate feedback during gameplay.

## Typography

This design system utilizes two distinct typefaces to balance character with utility. **Space Grotesk** is used for headlines and technical labels; its geometric, futuristic skeletal structure reinforces the "tech-mystery" aesthetic. All major headers should be set in bold weights with tight letter spacing to command attention.

For readability—essential for reading role cards and game rules—**Plus Jakarta Sans** is employed for body text. Its modern, open counters ensure that even at smaller sizes in dark mode, the text remains legible and does not suffer from "halation" or glow-bleed against the black background.

## Layout & Spacing

The layout philosophy follows a **Fluid Grid** model with a strong emphasis on "The Void"—using generous negative space to heighten the sense of mystery. A strict 8px rhythm governs all spatial relationships.

Content should be centered or grouped in clear vertical stacks to maintain a "terminal" feel. Margins are intentionally wide (minimum 24px) to ensure that the Electric Cyan interactables never feel cluttered, allowing the vibrant accents to act as clear beacons for the user's eye.

## Elevation & Depth

In a pure dark mode environment, traditional drop shadows are ineffective. Instead, this design system uses **Tonal Layers** and **Outer Glows**.

Hierarchy is established by lightening the surface color slightly as it "lifts" toward the user. Primary interactable elements (like active buttons) utilize a subtle 0 0 15px Cyan outer glow to simulate a light-emitting neon source. For container separation, use 1px solid borders in the "Very Dark Grey" palette rather than shadows to maintain a crisp, digital-first appearance.

## Shapes

The shape language is a mix of geometric precision and organic softness. While containers use a **Rounded** (0.5rem) corner radius to feel modern and accessible, specialized interactive elements like chips and action buttons utilize a **Pill-shaped** (full radius) approach. This distinction helps users instantly differentiate between "content containers" and "actionable items."

## Components

### Primary Button

The primary action button is the high-contrast centerpiece. It features a solid Electric Cyan background with Abyssal Black text. On hover or active states, it should trigger a subtle outer glow.

### Pill-Shaped Chips

Used for roles or categories.

- **Active State:** Cyan border (1px) with a faint cyan tint fill and white text.
- **Inactive State:** Dark grey border with muted grey text.

### Stylized Input Fields

Inputs are defined by a bottom-only or thin-outline border in dark grey. They must include a fixed-width icon slot on the left. Upon focus, the border and icon transition to Electric Cyan, signaling an active data-entry state.

### Role Cards

Cards use the "Very Dark Grey" surface. They should be minimally decorated, relying on a bold Space Grotesk header and a single Electric Cyan icon to denote the role's alignment.

### Status Indicators

Small, circular dots or thin lines that pulse slightly when a player is "Thinking" or "Acting," reinforcing the live, high-stakes nature of the game.

## Do's and Don'ts (Architecture & Business Logic)

### Do: State Persistence & Sync

- **Do use Cloud Persistence:** The game features Cloud Persistence via Firebase. Player statistics, used words, and active game states are synchronized with the cloud using a **Sync Code** system.
- **Do use Lazy Initialization:** Always initialize `useReducer` or `useState` that depends on `localStorage` using a lazy initializer function to avoid hydration mismatches.
- **Do maintain Persistent Word History:** Keep a history of used words in `state.usedWords`, mapped by category. Trigger `CLEAR_CATEGORY_WORDS` when a list is exhausted. Add words to history only when transitioning to the `PUNTUACIONES` phase.

### Do: Player & Role Management

- **Do use Stable IDs:** Attempt to preserve player IDs and Scores from the previous round by matching names in the state.
- **Do use Weighted Fairness (3 Players):** Use a weighted system (1 ticket for previous Farsante, 4 for others) to reduce consecutive repeats to ~11%. Use pure randomness for > 3 players.
- **Do respect Score Integrity:** Preserve scores when moving from `PUNTUACIONES` to `HOME` for Free Mode rounds.
- **Do manage Tournament Transitions:** In Tournament Mode (`scoreLimit !== null`), intercept `handleStartGame` with a warning if any player has `score > 0`. Upon tournament completion, present a victory modal to choose between a full reset or transitioning to Free Mode (preserving scores and setting `scoreLimit: null`).
- **Do delay Identity Revelation:** In the `RESULTADO` phase, only reveal the identity of the Farsantes if the game ends (e.g., Farsantes win by numbers).
- **Do limit Player Names:** Player names must be limited to **15 characters**. Use `maxLength={15}`.

### Do: UX and Hardware Integration

- **Do use Phase-Based Navigation:** The app is a SPA driven by a `Phase` string in the global state. Always perform a `window.scrollTo({ top: 0, left: 0, behavior: 'smooth' })` when `currentPhase` changes.
- **Do maintain Sticky UX:** Use the "sticky bottom" pattern for primary action buttons with `fixed` positioning and `pb-[120px]` or `pb-[180px]` on scrollable content.
- **Do enforce Immersive Mobile UX:** Trigger `document.documentElement.requestFullscreen({ navigationUI: 'hide' })` for mobile devices regardless of standalone mode. Use vendor-specific meta tags (`x5-fullscreen`, `full-screen`, \`browsermode\`).
- **Do utilize Wake Lock:** Use the \`useWakeLock\` hook to prevent the screen from turning off during the \`DEBATE\` phase.
- **Do provide Audio Fallbacks:** Sound playback requires prior user interaction. Use the Web Audio API as a synthetic fallback if MP3 files are missing.
- **Do distinguish 'Aleatorio':** The "Aleatorio" category must be visually distinct (e.g., solid background vs. outline).

### Don't: Common Pitfalls

- **Don't use hardcoded Role IDs:** The \`round.farsanteIds\` array must always be derived from the actual IDs assigned to players.
- **Don't reset State on Mount:** Never set initial state in \`useEffect\` if a save-to-storage \`useEffect\` is also active.
- **Don't orphan Categories:** Ensure new categories in \`dictionary.ts\` are registered in \`AVAILABLE_CATEGORIES\` in \`HomeScreen.tsx\`.
- **Don't allow duplicate names:** Always validate name uniqueness before starting a game.
