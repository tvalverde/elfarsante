# El Farsante 🕵️‍♂️

A stylish, Cyber-Noir themed hidden role game designed for local play on a single shared device. Built with React, TypeScript, and Tailwind CSS.

## 🎮 About the Game

**El Farsante** (The Impostor) is a social deduction game where players must identify the liar among them. One or two players are secretly assigned the role of "The Impostor" while the rest are "Innocents."

- **The Innocents:** Know a secret word from a chosen category. They must describe it subtly enough so the Impostor doesn't guess it, but clearly enough to prove their innocence to others.
- **The Impostor:** Does not know the word. Their goal is to blend in, mimic the others, and avoid being caught. If they survive or guess the word, they win.

## ✨ Key Features

- **PWA (Progressive Web App):** Install the game on your mobile device for a full-screen, app-like immersive experience without browser bars.
- **Local Multiplayer:** Optimized for "pass-and-play" sessions.
- **Dynamic Categories:** Choose from 6 different categories (Professions, Food, Animals, Sports, Places, and Home Objects).
- **Advanced Game Settings:**
  - **Round Timer:** Customizable durations (3, 5, or 10 minutes).
  - **Impostor Count:** Play with 1 or 2 Impostors.
  - **Hardcore Mode:** Blind timer that only reveals itself in the last 30 seconds.
  - **Tournament Mode:** Set a score limit (5 or 10 points) to determine the ultimate winner.
  - **Time Penalties:** Lose time when an Innocent player is wrongly eliminated.
- **Cyber-Noir Aesthetic:** Deep blacks (#0D0D12), electric cyans, and neon reds, featuring _Space Grotesk_ and _Plus Jakarta Sans_ typography.
- **Professional UI Components:** Custom-built `NeonModal` and `CyberToast` notification systems replace native browser alerts for complete immersion.
- **Automatic Versioning:** Every deployment automatically tracks and displays the application version in the UI.
- **Game Persistence:** Automatic state saving in `localStorage` allows you to resume interrupted games.

## 🛠️ Technical Stack

- **Framework:** [React 19](https://react.dev/)
- **Bundler:** [Vite 8](https://vite.dev/)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com/)
- **State Management:** React Context + `useReducer` with persistence middleware.
- **PWA Support:** Custom Web Manifest and optimized icon sets for Android and iOS.

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (latest LTS recommended)
- [npm](https://www.npmjs.com/)

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/tvalverde/elfarsante.git
   cd elfarsante
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

### Deployment

To deploy the project to GitHub Pages:

1. Build and deploy:
   ```bash
   npm run deploy
   ```
   _Note: This command automatically increments the version number (patch), creates a git commit/tag, builds the optimized assets, and publishes the `dist` folder to the `gh-pages` branch._

## 📜 License

This project is open-source and available under the MIT License.
