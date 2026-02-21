---
description: Release a new version of AI Prompt Builder to GitHub Releases
---

# Release Workflow

## Prerequisites

- Clean git working directory (no uncommitted changes)
- `GITHUB_TOKEN` environment variable set with repo push access
- macOS code signing and notarization credentials configured

## Steps

### Patch Release (bug fixes: 0.1.7 → 0.1.8)

// turbo

1. Run the patch release script:

```bash
cd /Users/juano/projects/entity-builders/apps/ai-prompt-builder && yarn release:patch
```

### Minor Release (new features: 0.1.7 → 0.2.0)

// turbo

1. Run the minor release script:

```bash
cd /Users/juano/projects/entity-builders/apps/ai-prompt-builder && yarn release:minor
```

### Major Release (breaking changes: 0.1.7 → 1.0.0)

// turbo

1. Run the major release script:

```bash
cd /Users/juano/projects/entity-builders/apps/ai-prompt-builder && yarn release:major
```

## What the Release Script Does

The `scripts/release.js` script automates the full pipeline:

1. **Version bump** — Updates `package.json` version
2. **Git commit + tag** — Commits the version change and creates a git tag
3. **Build** — Runs `tsc && vite build && electron-builder --mac --publish always`
4. **Publish** — Uploads artifacts to GitHub Releases

## Notes

- The `--publish always` flag ensures artifacts are uploaded to GitHub Releases
- `electron-updater` in the app checks these releases for auto-updates
- Current version: check `package.json` → `version` field
