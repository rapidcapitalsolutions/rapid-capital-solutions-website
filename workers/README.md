# Rapid Capital Solutions — Apply + E-Sign Worker

Homegrown e-sign (not DocuSign/ClixSign). Applications land in **submissions@rapidcapitalsolutions.com**.

## Flow

1. Applicant submits `apply.html`
2. Worker stores the application in KV and emails submissions@ (pending signature)
3. Browser redirects to `sign.html?t=TOKEN`
4. Applicant reviews disclosures, draws signature, checks consents
5. Worker emails **signed package** to submissions@ (details + signature PNG + HTML certificate)
6. Applicant gets confirmation email

## One-time setup

### 1) Resend (email)

1. Create free account at https://resend.com
2. Add and verify domain `rapidcapitalsolutions.com` (DNS records Resend shows)
3. Create API key
4. Use a from-address on that domain, e.g. `applications@rapidcapitalsolutions.com`

### 2) Deploy worker

```powershell
cd workers\rcs-apply
npx wrangler login
npx wrangler kv namespace create RCS_APPS
# paste the id into wrangler.toml (id + preview_id)
npx wrangler secret put RESEND_API_KEY
npx wrangler secret put FROM_EMAIL
# value example: Rapid Capital Solutions <applications@rapidcapitalsolutions.com>
npx wrangler deploy
```

### 3) Custom route in Cloudflare

Workers & Pages → rcs-apply → Triggers → Add route:

`rapidcapitalsolutions.com/api/*`

(Zone: rapidcapitalsolutions.com)

### 4) Site config

`js/site-config.js` should already point to:

```js
applyWorkerUrl: 'https://rapidcapitalsolutions.com/api/apply'
```

## Local test

```powershell
npx wrangler dev
# then temporarily set applyWorkerUrl to http://127.0.0.1:8787/api/apply
```

## Audit trail (per signature)

- Typed legal name
- Drawn signature PNG
- UTC timestamp
- IP + user agent
- SHA-256 hash of application payload
- Disclosure acknowledgements
