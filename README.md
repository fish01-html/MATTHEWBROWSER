# Matthew Browser — Scramjet build

This is the new architecture: Matthew Browser UI + Scramjet 2.x + Service Worker + libcurl transport + a local Wisp server.

## Run on Mac
1. Install Node.js 20+ and pnpm if needed.
2. Open Terminal in this folder.
3. Run: `npm install`
4. Run: `npm start`
5. Open: `http://localhost:8080`

Do not double-click `public/index.html`; Service Workers and Wisp need the server.

## Hosting
Deploy this as a Node web service. The host must support persistent WebSocket upgrades for `/wisp/`. Set `PORT` if your host supplies one. Production should use HTTPS so the browser can register the Service Worker.

## Why this is faster than the old MatthewBrowser.html
The old build manually queued/fetched/rewrote large groups of page resources in one giant HTML app. This build lets Scramjet's Service Worker intercept requests as the page makes them, and includes its HTTP cache plugin for repeat resources.

## Versions
Pinned to Scramjet 2.0.67-alpha.2, controller 0.0.14, utils 0.0.3, libcurl transport 2.x, and wisp-js 0.4.x generation.
