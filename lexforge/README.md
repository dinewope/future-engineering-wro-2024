# LexForge

SAT vocabulary through use, not recognition. The full product spec lives in [`CLAUDE.md`](./CLAUDE.md); progress is in [`CHANGELOG.md`](./CHANGELOG.md).

```bash
npm install
npm run dev               # http://localhost:3000
npm run validate:content  # check content/words/*.json and content/roots.json
npm test                  # unit tests (Vitest)
npm run build && npm run test:e2e   # end-to-end (Playwright, desktop + 375px phone)
```

All user data stays in the browser (IndexedDB). No accounts, no tracking.

## Deploying

- **Hosted page (no server):** `npm run build:standalone` writes `dist/standalone/` — the same app bundled into one page plus `app.js`, with routing done in memory. This is what the claude.ai artifact runs.
- **Your own domain:** the Next.js app deploys to Vercel as-is. Import the repo, set **Root Directory** to `lexforge`, deploy, then add your domain under *Project → Settings → Domains* and point its DNS records where Vercel tells you.
