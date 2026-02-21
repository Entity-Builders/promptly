# AI Prompt Builder — Agent Instructions

## Project Overview

**AI Prompt Builder** is a desktop application for building, testing, and iterating on Gemini AI prompts. Built with Electron, React, and TypeScript.

- **App ID**: `com.juano.ai-prompt-builder`
- **Repository**: `entity-builders` monorepo → `apps/ai-prompt-builder`

## Tech Stack

| Layer     | Technology                           |
| --------- | ------------------------------------ |
| Runtime   | Electron 30                          |
| Frontend  | React 18, TypeScript                 |
| Bundler   | Vite 5 + `vite-plugin-electron`      |
| Styling   | Tailwind CSS 3                       |
| AI        | `@google/generative-ai` (Gemini SDK) |
| Icons     | `lucide-react`                       |
| Markdown  | `react-markdown`                     |
| Updates   | `electron-updater` + GitHub Releases |
| Logging   | `electron-log`                       |
| Packaging | `electron-builder`                   |

## Project Structure

```
apps/ai-prompt-builder/
├── electron/           # Electron main process
│   ├── main.ts         # Main window, IPC handlers, Gemini API calls
│   ├── preload.ts      # Context bridge (exposes API to renderer)
│   └── electron-env.d.ts
├── src/                # React renderer process
│   ├── App.tsx         # Root component, state management, API logic
│   ├── components/     # UI components (Sidebar, MainContent)
│   ├── constants.ts    # Agent presets / recipes
│   ├── main.tsx        # React entry point
│   └── index.css       # Global styles
├── scripts/            # Build & release utilities
│   ├── release.js      # Automated version bump + build + publish
│   ├── notarize.js     # macOS notarization (afterSign hook)
│   └── list_models.js  # List available Gemini models
├── docs/               # Project documentation
├── public/             # Static assets (icons)
├── release/            # Build output + entitlements
└── .env                # Environment variables (GEMINI_API_KEY)
```

## Coding Conventions

- **Language**: TypeScript strict mode for all files
- **Components**: Functional React components with hooks
- **State**: `useState` + `useEffect` (no external state library)
- **Styling**: Tailwind CSS utility classes
- **IPC**: All Electron ↔ Renderer communication via `ipcMain`/`ipcRenderer` through `preload.ts` context bridge
- **AI calls**: Gemini API calls happen in the **main process** (`electron/main.ts`), never in the renderer

## Environment Variables

```bash
# .env (root of ai-prompt-builder)
GEMINI_API_KEY=your-api-key-here

# For notarization (set in shell or CI)
APPLE_ID=your@apple.id
APPLE_APP_SPECIFIC_PASSWORD=xxxx-xxxx-xxxx-xxxx
APPLE_TEAM_ID=XXXXXXXXXX
```

## Key Commands

| Command              | Description                                    |
| -------------------- | ---------------------------------------------- |
| `yarn dev`           | Start dev server (Vite + Electron)             |
| `yarn build:mac`     | Build macOS `.dmg` + `.zip`                    |
| `yarn build:win`     | Build Windows `.exe` (NSIS)                    |
| `yarn release:patch` | Bump patch version + build + publish to GitHub |
| `yarn release:minor` | Bump minor version + build + publish           |
| `yarn release:major` | Bump major version + build + publish           |

## Architecture Notes

1. **Recipes/Presets**: Defined in `src/constants.ts`. Each preset has an `id`, `name`, and `instruction` string sent as system prompt to Gemini.
2. **Auto-updates**: Configured via `electron-updater` pointing to GitHub Releases. The app checks for updates on launch.
3. **Code Signing**: macOS builds use hardened runtime with entitlements in `release/entitlements.mac.plist`. Notarization runs as an `afterSign` hook via `scripts/notarize.js`.
4. **Chat Mode**: The app supports both single-prompt generation and multi-turn chat sessions via the Gemini `startChat` API.
