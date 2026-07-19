# Rapid Capital Solutions — apply worker (Cloudflare only)

This is **separate from Fund Pilot CRM**. Do not deploy to the CRM VPS.

## What it does

1. Receives POST from `apply.html` on your website
2. Optionally calls **your own** manual-application PDF API (same JSON pattern as PFO generator)
3. Optionally pings a ClixSign webhook URL when you set one up

## Deploy (when ready)

1. Cloudflare dashboard → Workers & Pages → Create
2. Paste `worker.js`
3. Add route: `rapidcapitalsolutions.com/api/apply`
4. Secrets:
   - `RCS_APPLY_API_BASE` — your RCS manual app URL (when you host one)
   - `RCS_APPLY_PASSWORD` — password for that app
   - `CLIXSIGN_WEBHOOK_URL` — ClixSign automation URL (optional)

5. In `js/site-config.js` set:
   ```javascript
   applyWorkerUrl: 'https://rapidcapitalsolutions.com/api/apply'
   ```

Until the worker is deployed, the form uses **email fallback** only.

## Reference

Field mapping lives in `js/rcs-application.js` (copied from how manual-app PDF APIs expect JSON — not tied to CRM convert-app).
