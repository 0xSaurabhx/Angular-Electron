# Electron + Angular Boilerplate

This is a minimal Electron + Angular boilerplate project.

## What you'll find here
- `src/` - Angular project sources
- `electron/` - Electron main & preload scripts
- `package.json` - root scripts for development and packaging

## Quick start

1. Install dependencies:

```bash
npm install
```

2. Start development (serves Angular on localhost:4200 then starts Electron):

```bash
npm run start
```

3. Build production bundle and run electron with built Angular files:

```bash
npm run build
npm run electron:prod
```

Tips and troubleshooting
- If you don't have the Angular CLI installed globally, the local devDep will be used from `node_modules`. If something fails, run `npx ng serve` or `npm run start:angular`.
- To build an installer, run: `npm run package` (this uses `electron-builder`).
- On Windows, if you need to launch Electron from VS Code, use the `.vscode/launch.json` configuration.

Notes:
- This uses `ng serve` for development; you need the Angular CLI to be installed locally.

Local API server
- This Electron app starts a small local HTTP API when Electron launches. The API listens by default on port 3000 (falls back to an ephemeral port if 3000 is busy). Available endpoints:
	- `GET /ping` - returns { message: 'pong from api' }
	- `GET /health` - returns uptime, platform, timestamp
- The Angular UI demonstrates a button that calls the local API via the `electronAPI.getApiUrl()` helper exposed by the preload script.

Enjoy! 🚀
