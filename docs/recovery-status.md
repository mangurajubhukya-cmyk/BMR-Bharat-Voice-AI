# BMR Bharat Voice AI recovery status

## Verified in the independent checkout

- Independent source root: `/home/ubuntu/bmrvoice`
- Baseline recovery checkpoint: local Git commit `1feee2f`
- TypeScript: PASS (`pnpm check`)
- Automated tests: PASS — 12 files, 34 tests
- Production build: PASS (`pnpm build`)
- Smoke script: PASS (`pnpm smoke`)
- Browser landing page: PASS in the managed Chromium browser
- OAuth start: PASS — the button reaches the real Manus login URL without the previous `Invalid URL` error
- Health endpoint: PASS — `/healthz` returns JSON with `status: ok` and application name
- Route manifest: PASS — `/manus-routes.json` returns valid JSON for the configured routes
- Prisma live test: PASS — one short request returned HTTP 200 and `prisma-v2.5`
- Timbre live test: PASS — one short request returned HTTP 200 and WAV audio (`122,924` bytes)
- Secret handling: PASS — `GNANI_API_KEY` was checked only for presence and was never printed or committed

## Implemented product path

Browser microphone recording is converted to PCM WAV in the browser, sent to the protected BMR backend, forwarded to official Gnani Prisma v2.5 with an explicit Telugu, Hindi, or Indian English language code, and returned as an editable transcript. The existing BMR conversation mutation continues to use the Manus Forge model. Optional assistant playback calls the protected Timbre v2.5 endpoint and returns binary WAV audio to the browser. Typed chat remains independent of Gnani availability.

## Still blocked or not tested

A real authenticated workspace session was not completed in this sandbox because the Manus login page requires the account owner’s interactive sign-in. Consequently, authenticated conversation persistence, protected chat, microphone permission, browser playback inside the signed-in workspace, and physical Chrome/Edge/Firefox/Safari/mobile coverage remain NOT TESTED here. The Gnani dashboard identity and remaining credit balance also remain BLOCKED until the owner signs into `https://app.gnani.ai/voice` in the browser.

The managed Preview is not a public production deployment. Before submission, configure the independent project’s production environment with the actual Manus OAuth/database settings, `GNANI_API_KEY`, and the published HTTPS origin, then complete one manual sign-in and one Telugu microphone demonstration.
