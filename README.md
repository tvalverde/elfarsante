# El Farsante 🕵️‍♂️

A stylish, Cyber-Noir themed hidden role game designed for local play on a single shared device. Built with React, TypeScript, and Firebase.

## 🎮 About the Game

**El Farsante** (The Impostor) is a social deduction game where players must identify the liar among them. One or two players are secretly assigned the role of "The Impostor" while the rest are "Innocents."

- **The Innocents:** Know a secret word from a chosen category. They must describe it subtly enough so the Impostor doesn't guess it, but clearly enough to prove their innocence to others.
- **The Impostor:** Does not know the word. Their goal is to blend in, mimic the others, and avoid being caught. If they survive or guess the word, they win.

## ✨ Key Features

- **☁️ Cloud Persistence (v2.0):** Sync your player statistics (Infamy History), used words, and active game states across multiple devices using a unique **Sync Code**.
- **📱 Immersive PWA:** Install the game on your mobile device for a full-screen experience. Includes smart detection to hide system bars and orientation locks for maximum focus.
- **🔄 Dynamic "Random" Category:** A special mode that picks a different real category each round to keep everyone on their toes.
- **🛑 Zero Native Alerts:** Custom-built `NeonModal` and `CyberToast` systems replace all browser dialogues for complete thematic immersion.
- **⚖️ Weighted Fairness:** Advanced selection logic reduces consecutive Farsante repeats in small groups while maintaining total secrecy.
- **🛠️ Advanced Game Settings:**
  - **Round Timer:** Customizable durations.
  - **Impostor Count:** Support for multiple impostors in larger groups.
  - **Hardcore Mode:** Blind timer and time penalties for wrong eliminations.
- **🎨 Cyber-Noir Aesthetic:** Deep blacks, electric cyans, and neon reds driven by a unified `DESIGN.md` specification.

## 🛠️ Technical Stack

- **Framework:** [React 19](https://react.dev/)
- **Database & Auth:** [Firebase](https://firebase.google.com/) (Firestore & Anonymous Auth)
- **Bundler:** [Vite 8](https://vite.dev/) with manual chunk splitting for performance.
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com/)
- **State Management:** React Context + `useReducer` with real-time cloud synchronization.

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

3. Create a `.env.local` file with your Firebase configuration:

   ```env
   VITE_FIREBASE_API_KEY=your_key
   VITE_FIREBASE_AUTH_DOMAIN=your_domain
   VITE_FIREBASE_PROJECT_ID=your_project_id
   ...
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

### Deployment

To deploy the project to GitHub Pages:

1. Build and deploy:
   ```bash
   npm run deploy
   ```
   _Note: This command automatically increments the version number (patch), creates a git commit/tag, builds the optimized assets, and publishes to the `gh-pages` branch._

## 📜 License

This project is open-source and available under the MIT License.
