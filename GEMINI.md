# Project: El Farsante 🕵️‍♂️

## Overview

El Farsante is a local hidden-role game (Social Deduction). It uses a "pass-and-play" mechanic on a single device.

## Behavioral Mandates

- **Build Verification:** Always run `npm run build` after any code change to ensure TypeScript consistency and build stability.
- **Strict Technical Language:** All code, comments, commit messages, and documentation MUST be in English. Spanish is reserved ONLY for the game's UI and conversational interaction.
- **Conditional Deployment:** NEVER run `npm run deploy` if the changes only affect documentation, repository configuration (e.g., `.gitignore`), or internal meta-files. Deployment is strictly for functional game logic or UI updates.
- **Meaningful Commits & Sync:** Commit messages MUST describe the actual changes or features implemented. Avoid referencing internal "phases" or "stages". Always use the imperative mood, adhere to Conventional Commits, and PUSH the changes to the remote repository immediately after committing.
- **Deployment Flow:** The `npm run deploy` command MUST execute `npm version patch` BEFORE `npm run build` to ensure the correct version is injected into the production bundle.
- **Zero Native Alerts:** Never use `window.alert()` or `confirm()`. Use the `useToast()` hook for ephimeral feedback/errors and `NeonModal` for complex interactions or documentation.
- **Code Quality & CI Hooks:** Before committing, ensure all modified file types are covered by the `lint-staged` configuration. Maintain strictly formatted code using Prettier (run `npm run format` and `npx eslint . --fix`).
- **Architecture Documentation:** Always add to `DESIGN.md` any architecture or business logic rules that make sense to be there and are not obvious, following the DESIGN.md specifications.
