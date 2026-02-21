---
description: Start the development environment for AI Prompt Builder
---

# Development Workflow

## Prerequisites

- Node.js 18+ installed
- `yarn` package manager
- `.env` file with `GEMINI_API_KEY` set

## Steps

1. Install dependencies (if needed):

```bash
cd /Users/juano/projects/entity-builders/apps/ai-prompt-builder && yarn install
```

// turbo 2. Start the development server (Vite + Electron with HMR):

```bash
cd /Users/juano/projects/entity-builders/apps/ai-prompt-builder && yarn dev
```

This launches both the Vite dev server and the Electron window with hot module reloading.

## Notes

- The Electron main process code is in `electron/main.ts`
- The renderer (React) code is in `src/`
- Changes to the renderer are hot-reloaded automatically
- Changes to `electron/main.ts` require a restart of the dev server
