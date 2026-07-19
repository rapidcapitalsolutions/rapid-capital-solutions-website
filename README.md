# Rapid Capital Solutions — Website

Professional brokerage site for **rapidcapitalsolutions.com**.

## Files

| File | Purpose |
|------|---------|
| `index.html` | Main landing page — hero, programs, process, FAQ, apply form |
| `about.html` | Company story, values, stats |
| `team.html` | Leadership + funding team (placeholder names) |
| `services.html` | Full programs catalog with amounts/terms |
| `contact.html` | Contact info + application form |
| `careers.html` | Job listings (placeholder) |
| `privacy.html` | Privacy policy |
| `terms.html` | Terms of use |
| `css/styles.css` | All styling |
| `js/main.js` | Mobile nav, FAQ accordion, scroll animations, form handler |

## Preview locally

```powershell
cd "C:\Users\Vinny\Documents\Work\rapid-capital-solutions-website"
py -3 -m http.server 8080
```

Then visit http://localhost:8080

## Deploy to your Google domain

### Option A — Netlify (recommended, free)

1. Go to [netlify.com](https://www.netlify.com) and sign up
2. Drag the `rapid-capital-solutions-website` folder onto the deploy area
3. In Netlify → Domain settings → Add custom domain → `rapidcapitalsolutions.com`
4. Netlify gives you DNS records — add them in Google Domains / Squarespace DNS

### Option B — Cloudflare Pages (free)

1. [pages.cloudflare.com](https://pages.cloudflare.com) → Create project → Direct upload
2. Upload this folder
3. Point domain DNS to Cloudflare

## After deploy — update these placeholders

- `(888) 555-0100` / `tel:+18885550100` → real business phone
- Miami office address on `contact.html` → your registered FL address
- Team names/photos on `team.html` → real people when ready
- `careers@rapidcapitalsolutions.com` listings when hiring

## Google Workspace email

Form submissions open your email client via `mailto:submissions@rapidcapitalsolutions.com`.

For a proper form backend later, add [Formspree](https://formspree.io) or similar.

## ISO partner requirements checklist

- [x] Professional multi-page website with company name
- [x] Privacy policy page
- [x] Terms of use page
- [x] About / team / contact pages
- [ ] SSL (HTTPS) — automatic on Netlify/Cloudflare
- [ ] Replace placeholder phone number and address
