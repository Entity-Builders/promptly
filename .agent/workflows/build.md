---
description: Build the AI Prompt Builder application for macOS or Windows
---

# Build Workflow

## Prerequisites

- Dependencies installed (`yarn install`)
- For macOS: valid code signing identity configured
- For Windows: can cross-compile from macOS (no signing)

## Steps

### macOS Build

// turbo

1. Build for macOS (produces `.dmg` + `.zip` in `release/<version>/`):

```bash
cd /Users/juano/projects/entity-builders/apps/ai-prompt-builder && yarn build:mac
```

### Windows Build

// turbo

1. Build for Windows (produces `.exe` NSIS installer in `release/<version>/`):

```bash
cd /Users/juano/projects/entity-builders/apps/ai-prompt-builder && yarn build:win
```

## Build Pipeline

The build command runs three steps sequentially:

1. `tsc` — TypeScript compilation
2. `vite build` — Bundle the renderer (React app)
3. `electron-builder` — Package into native installer

## Output

Build artifacts are placed in `release/<version>/` directory.

## Notes

- macOS builds are automatically signed using the identity configured in `package.json` (`build.mac.identity`)
- Notarization runs as an `afterSign` hook via `scripts/notarize.js` (requires `APPLE_ID`, `APPLE_APP_SPECIFIC_PASSWORD`, and `APPLE_TEAM_ID` env vars)
- Set `build.mac.notarize: false` in `package.json` to skip notarization during development
